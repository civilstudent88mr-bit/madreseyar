import { useState } from 'react'
import { Package } from 'lucide-react'

interface ProductImageProps {
  src?: string | null
  name: string
  className?: string
  iconClassName?: string
}

export default function ProductImage({ src, name, className = '', iconClassName = 'w-12 h-12' }: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gray-50 ${className}`}>
      {showImage ? (
        <img src={src ?? undefined} alt={name} className="w-full h-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-primary-50 text-primary-700">
          <span className="text-4xl font-extrabold">{name.trim().charAt(0) || <Package className={iconClassName} />}</span>
        </div>
      )}
    </div>
  )
}
