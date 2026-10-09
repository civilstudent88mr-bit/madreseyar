import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { Profile, School } from './types'
import { supabase } from './supabase'

export type UserRole = 'admin' | 'school'

export interface AppUser {
  id: string
  role: UserRole
  mobile: string
  password: string
  name: string
  schoolName: string
  status: 'approved' | 'pending_review' | 'rejected'
}

interface AuthState {
  user: AppUser | null
  profile: Profile | null
  school: School | null
  session: { user: { id: string } } | null
  loading: boolean
  refreshProfile: () => Promise<void>
  loginWithPassword: (mobile: string, password: string) => Promise<boolean>
  requestOtp: (mobile: string) => string | null
  verifyOtp: (mobile: string, code: string) => boolean
  registerSchool: (data: { schoolName: string; name: string; mobile: string; password: string; address: string; city: string; province: string; postalCode: string }) => Promise<boolean>
  resetPassword: (mobile: string, newPassword: string) => boolean
  signOut: () => void
}

const AuthContext = createContext<AuthState>({
  user: null, profile: null, school: null, session: null, loading: true,
  refreshProfile: async () => {}, loginWithPassword: async () => false,
  requestOtp: () => null, verifyOtp: () => false, registerSchool: async () => false,
  resetPassword: () => false, signOut: () => {},
})

function legacyNormalizeMobile(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\s-]/g, '')
}

function normalizeMobile(value: string): string {
  return Array.from(value, (digit) => {
    const code = digit.codePointAt(0)!
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
    return digit
  }).join('').replace(/[\s-]/g, '')
}

export function customerAuthEmail(mobile: string) {
  return `${normalizeMobile(mobile)}@accounts.healthcare24.ir`
}

function toUser(profile: Profile, school: School | null): AppUser {
  return {
    id: profile.id,
    role: profile.role.startsWith('seller_') ? 'admin' : 'school',
    mobile: profile.mobile || '',
    password: '',
    name: profile.full_name,
    schoolName: school?.name || '',
    status: school?.status || 'approved',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [session, setSession] = useState<{ user: { id: string } } | null>(null)
  const [loading, setLoading] = useState(true)
  const userRef = useRef<AppUser | null>(null)
  userRef.current = user

  const loadCustomer = useCallback(async (authSession: Session | null) => {
    if (!authSession?.user) {
      setUser(null); setProfile(null); setSchool(null); setSession(null)
      return
    }
    const { data: foundProfile, error } = await supabase.from('profiles').select('*').eq('id', authSession.user.id).maybeSingle()
    if (error || !foundProfile || !foundProfile.is_active) {
      setUser(null); setProfile(null); setSchool(null); setSession(null)
      return
    }
    const foundSchool = foundProfile.school_id
      ? await supabase.from('schools').select('*').eq('id', foundProfile.school_id).maybeSingle()
      : { data: null }
    const profileValue = foundProfile as Profile
    const schoolValue = foundSchool.data as School | null
    setProfile(profileValue); setSchool(schoolValue); setUser(toUser(profileValue, schoolValue))
    setSession({ user: { id: authSession.user.id } })
  }, [])

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    await loadCustomer(data.session)
  }, [loadCustomer])

  useEffect(() => {
    localStorage.removeItem('healthcare-v1')
    let current = true
    const check = async () => {
      try {
        const response = await fetch('/api/admin-auth', { credentials: 'same-origin' })
        if (response.ok) {
          const { mobile, name } = await response.json()
          if (current) {
            setUser({ id: 'admin-session', role: 'admin', mobile, password: '', name, schoolName: 'مدیریت Healthcare', status: 'approved' })
            setProfile({ id: 'admin-session', full_name: name, mobile, email: null, role: 'seller_admin', school_id: null, is_active: true, created_at: '', updated_at: '' })
            setSchool(null); setSession(null)
          }
        } else {
          const { data } = await supabase.auth.getSession()
          await loadCustomer(data.session)
        }
      } catch {
        const { data } = await supabase.auth.getSession()
        await loadCustomer(data.session)
      } finally {
        if (current) setLoading(false)
      }
    }
    void check()
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, authSession) => {
      if (authSession) void loadCustomer(authSession)
      else if (user?.role !== 'admin') { setUser(null); setProfile(null); setSchool(null); setSession(null) }
    })
    return () => { current = false; listener.subscription.unsubscribe() }
  }, [loadCustomer])

  const loginWithPassword = useCallback(async (mobile: string, password: string) => {
    const normalized = normalizeMobile(mobile)
    if (normalized === '09120000000') {
      const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin@demo.com', password })
      if (error || !data.session) return false
      const { data: adminProfile, error: profileError } = await supabase.from('profiles').select('role,is_active').eq('id', data.user.id).maybeSingle()
      if (profileError || !adminProfile?.is_active || !String(adminProfile.role).startsWith('seller_')) {
        await supabase.auth.signOut()
        return false
      }
      const response = await fetch('/api/admin-auth', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }),
      })
      if (!response.ok) {
        await supabase.auth.signOut()
        return false
      }
      await loadCustomer(data.session)
      return true
    }
    if (normalized === '09120000000') {
      const response = await fetch('/api/admin-auth', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: normalized, password }),
      })
      if (!response.ok) return false
      const admin = await response.json()
      setUser({ id: 'admin-session', role: 'admin', mobile: admin.mobile, password: '', name: admin.name, schoolName: 'مدیریت Healthcare', status: 'approved' })
      setProfile({ id: 'admin-session', full_name: admin.name, mobile: admin.mobile, email: null, role: 'seller_admin', school_id: null, is_active: true, created_at: '', updated_at: '' })
      setSchool(null); setSession(null)
      return true
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: customerAuthEmail(normalized), password })
    if (error) return false
    await loadCustomer(data.session)
    return true
  }, [loadCustomer])

  const registerSchool = useCallback(async (data: Parameters<AuthState['registerSchool']>[0]) => {
    const response = await fetch('/api/customer-register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, mobile: normalizeMobile(data.mobile) }),
    })
    if (!response.ok) return false
    const { error } = await supabase.auth.signInWithPassword({ email: customerAuthEmail(data.mobile), password: data.password })
    if (error) return false
    await refreshProfile()
    return true
  }, [refreshProfile])

  const signOut = useCallback(() => {
    if (user?.role === 'admin') {
      void fetch('/api/admin-auth', { method: 'DELETE', credentials: 'same-origin' })
      setUser(null); setProfile(null); setSchool(null); setSession(null)
    } else void supabase.auth.signOut()
  }, [user])

  return <AuthContext.Provider value={{
    user, profile, school, session, loading, refreshProfile, loginWithPassword,
    requestOtp: () => null, verifyOtp: () => false, registerSchool,
    resetPassword: () => false, signOut,
  }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
export { normalizeMobile }
