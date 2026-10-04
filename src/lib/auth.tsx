import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Profile, School } from './types'

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

export interface AuthSession {
  userId: string
  role: UserRole
}

interface LegacySession {
  user: { id: string }
}

interface AuthState {
  user: AppUser | null
  profile: Profile | null
  school: School | null
  session: LegacySession | null
  loading: boolean
  refreshProfile: () => Promise<void>
  loginWithPassword: (mobile: string, password: string) => boolean
  requestOtp: (mobile: string) => string | null
  verifyOtp: (mobile: string, code: string) => boolean
  registerSchool: (data: { schoolName: string; name: string; mobile: string; password: string }) => boolean
  resetPassword: (mobile: string, newPassword: string) => boolean
  signOut: () => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  school: null,
  session: null,
  loading: true,
  refreshProfile: async () => {},
  loginWithPassword: () => false,
  requestOtp: () => null,
  verifyOtp: () => false,
  registerSchool: () => false,
  resetPassword: () => false,
  signOut: () => {},
})

const STORAGE_KEY = 'healthcare-v1'
const ADMIN_MOBILE = '09120000000'
const ADMIN_MOBILE_ALIASES = new Set(['091200000', ADMIN_MOBILE])

interface StoredData {
  users: AppUser[]
  session: AuthSession | null
  otp: Record<string, { code: string; expires: number }>
}

function normalizeMobile(v: string): string {
  return v
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[\s\-]/g, '')
}

function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredData
      if (parsed.users && Array.isArray(parsed.users)) return parsed
    }
  } catch { /* ignore */ }
  return { users: [], session: null, otp: {} }
}

function saveData(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function seedDefaults(): StoredData {
  const data = loadData()
  if (data.users.length === 0) {
    data.users = [
      {
        id: 'admin-1',
        role: 'admin',
        mobile: ADMIN_MOBILE,
        password: 'Admin1234',
        name: 'مدیر سیستم',
        schoolName: '',
        status: 'approved',
      },
      {
        id: 'school-1',
        role: 'school',
        mobile: '09121111111',
        password: 'School123',
        name: 'کاربر نمونه',
        schoolName: 'داروخانه شهر',
        status: 'approved',
      },
    ]
    saveData(data)
  } else if (!data.users.some((user) => ADMIN_MOBILE_ALIASES.has(user.mobile))) {
    data.users.push({
      id: 'admin-1',
      role: 'admin',
      mobile: ADMIN_MOBILE,
      password: 'Admin1234',
      name: 'مدیر سیستم',
      schoolName: '',
      status: 'approved',
    })
    saveData(data)
  }
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const profile: Profile | null = user ? {
    id: user.id,
    full_name: user.name,
    mobile: user.mobile,
    email: null,
    role: user.role === 'admin' ? 'seller_admin' : 'school_admin',
    school_id: user.role === 'school' ? user.id : null,
    is_active: true,
    created_at: '',
    updated_at: '',
  } : null

  const school: School | null = user?.role === 'school' ? {
    id: user.id,
    name: user.schoolName,
    type: null,
    province: null,
    city: null,
    address: null,
    postal_code: null,
    school_code: null,
    principal_name: user.name,
    landline: null,
    status: user.status,
    notes: null,
    credit_limit: 0,
    payment_terms: 'cash',
    created_at: '',
    updated_at: '',
  } : null

  const session: LegacySession | null = user ? { user: { id: user.id } } : null
  const refreshProfile = useCallback(async () => {}, [])

  useEffect(() => {
    const data = seedDefaults()
    if (data.session) {
      const u = data.users.find((x) => x.id === data.session!.userId)
      if (u) setUser(u)
    }
    setLoading(false)
  }, [])

  const loginWithPassword = useCallback((mobile: string, password: string): boolean => {
    const norm = normalizeMobile(mobile)
    const data = loadData()
    const u = data.users.find((x) => (x.mobile === norm || (ADMIN_MOBILE_ALIASES.has(norm) && ADMIN_MOBILE_ALIASES.has(x.mobile))) && x.password === password)
    if (!u) return false
    data.session = { userId: u.id, role: u.role }
    saveData(data)
    setUser(u)
    return true
  }, [])

  const requestOtp = useCallback((mobile: string): string | null => {
    const norm = normalizeMobile(mobile)
    if (!/^09\d{7,9}$/.test(norm)) return null
    const data = loadData()
    const code = String(Math.floor(100000 + Math.random() * 900000))
    data.otp = data.otp || {}
    data.otp[norm] = { code, expires: Date.now() + 120000 }
    saveData(data)
    return code
  }, [])

  const verifyOtp = useCallback((mobile: string, code: string): boolean => {
    const norm = normalizeMobile(mobile)
    const data = loadData()
    const entry = data.otp?.[norm]
    if (!entry) return false
    if (Date.now() > entry.expires) {
      delete data.otp[norm]
      saveData(data)
      return false
    }
    if (entry.code !== code) return false
    // OTP verified — find or create user
    let u = data.users.find((x) => x.mobile === norm)
    if (!u) return false // must be registered
    delete data.otp[norm]
    data.session = { userId: u.id, role: u.role }
    saveData(data)
    setUser(u)
    return true
  }, [])

  const registerSchool = useCallback((data: { schoolName: string; name: string; mobile: string; password: string }): boolean => {
    const norm = normalizeMobile(data.mobile)
    const stored = loadData()
    if (stored.users.some((x) => x.mobile === norm)) return false
    const u: AppUser = {
      id: `u${Date.now()}`,
      role: 'school',
      mobile: norm,
      password: data.password,
      name: data.name,
      schoolName: data.schoolName,
      status: 'pending_review',
    }
    stored.users.push(u)
    stored.session = { userId: u.id, role: u.role }
    saveData(stored)
    setUser(u)
    return true
  }, [])

  const resetPassword = useCallback((mobile: string, newPassword: string): boolean => {
    const norm = normalizeMobile(mobile)
    const data = loadData()
    const u = data.users.find((x) => x.mobile === norm)
    if (!u) return false
    u.password = newPassword
    saveData(data)
    return true
  }, [])

  const signOut = useCallback(() => {
    const data = loadData()
    data.session = null
    saveData(data)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, school, session, loading, refreshProfile, loginWithPassword, requestOtp, verifyOtp, registerSchool, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { normalizeMobile }
