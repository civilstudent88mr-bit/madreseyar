ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS reference_code text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

INSERT INTO public.settings (key, value) VALUES
  ('bank_name', ''),
  ('payment_instructions', '')
ON CONFLICT (key) DO NOTHING;

UPDATE public.settings SET value = '' WHERE key = 'bank_card' AND value = '6037-9911-2345-6789';
UPDATE public.settings SET value = '' WHERE key = 'sheba' AND value = 'IR120170000000001234567890';
UPDATE public.settings SET value = '' WHERE key = 'account_holder' AND value = 'Healthcare';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-receipts', 'payment-receipts', false, 6291456, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 6291456,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders FOR SELECT TO authenticated
  USING (public.is_seller() OR user_id = auth.uid() OR public.is_school_member(school_id));

DROP POLICY IF EXISTS order_items_select ON public.order_items;
CREATE POLICY order_items_select ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (public.is_seller() OR o.user_id = auth.uid() OR public.is_school_member(o.school_id))
  ));

DROP POLICY IF EXISTS osh_select ON public.order_status_history;
CREATE POLICY osh_select ON public.order_status_history FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_status_history.order_id
      AND (public.is_seller() OR o.user_id = auth.uid() OR public.is_school_member(o.school_id))
  ));

DROP POLICY IF EXISTS payments_select ON public.payments;
CREATE POLICY payments_select ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payments.order_id
      AND (public.is_seller() OR o.user_id = auth.uid() OR public.is_school_member(o.school_id))
  ));

DROP POLICY IF EXISTS payments_insert ON public.payments;
CREATE POLICY payments_insert ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    method = 'card_to_card'
    AND status = 'pending_receipt'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id AND o.user_id = auth.uid() AND o.payment_method = 'card_to_card'
    )
  );

CREATE OR REPLACE FUNCTION public.set_order_payment_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders SET payment_status = 'pending_receipt' WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_pending_order ON public.payments;
CREATE TRIGGER trg_payment_pending_order
AFTER INSERT ON public.payments
FOR EACH ROW WHEN (NEW.status = 'pending_receipt')
EXECUTE FUNCTION public.set_order_payment_pending();

CREATE OR REPLACE FUNCTION public.review_payment(payment_id uuid, new_status text, review_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_order_id uuid;
BEGIN
  IF NOT public.is_seller() THEN
    RAISE EXCEPTION 'Only store staff can review payments';
  END IF;
  IF new_status NOT IN ('confirmed', 'rejected') THEN
    RAISE EXCEPTION 'Invalid payment review status';
  END IF;

  SELECT order_id INTO target_order_id
  FROM public.payments
  WHERE id = payment_id
  FOR UPDATE;

  IF target_order_id IS NULL THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  UPDATE public.payments
  SET status = new_status,
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      note = NULLIF(trim(review_note), '')
  WHERE id = payment_id;

  UPDATE public.orders o
  SET payment_status = CASE
    WHEN EXISTS (SELECT 1 FROM public.payments p WHERE p.order_id = target_order_id AND p.status = 'confirmed') THEN 'paid'
    WHEN EXISTS (SELECT 1 FROM public.payments p WHERE p.order_id = target_order_id AND p.status = 'pending_receipt') THEN 'pending_receipt'
    ELSE 'unpaid'
  END
  WHERE o.id = target_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.review_payment(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_payment(uuid, text, text) TO authenticated;

DROP POLICY IF EXISTS payment_receipts_select ON storage.objects;
CREATE POLICY payment_receipts_select ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'payment-receipts'
    AND (
      public.is_seller()
      OR (
        (storage.foldername(name))[1] = auth.uid()::text
        AND EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id::text = (storage.foldername(name))[2] AND o.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS payment_receipts_insert ON storage.objects;
CREATE POLICY payment_receipts_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'payment-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = (storage.foldername(name))[2]
        AND o.user_id = auth.uid()
        AND o.payment_method = 'card_to_card'
    )
  );

NOTIFY pgrst, 'reload schema';
