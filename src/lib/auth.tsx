import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile, School } from './types'

export interface AdminUser {
  username: string
  role: 'admin'
}

interface AuthState {
  session: Session | null
  profile: Profile | null
  school: School | null
  admin: AdminUser | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
  adminLogin: (username: string, password: string) => boolean
  adminSignOut: () => void
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  school: null,
  admin: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
  adminLogin: () => false,
  adminSignOut: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (uid: string) => {
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    setProfile(prof as Profile | null)
    if (prof?.school_id) {
      const { data: sch } = await supabase.from('schools').select('*').eq('id', prof.school_id).maybeSingle()
      setSchool(sch as School | null)
    } else {
      setSchool(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await loadProfile(session.user.id)
  }, [session, loadProfile])

  useEffect(() => {
    const stored = localStorage.getItem('madrese-yar-admin')
    if (stored === 'admin') setAdmin({ username: 'admin', role: 'admin' })

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user?.id) {
        loadProfile(data.session.user.id).finally(() => mounted && setLoading(false))
      } else {
        setLoading(false)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      if (sess?.user?.id) {
        (async () => {
          await loadProfile(sess.user.id)
          setLoading(false)
        })()
      } else {
        setProfile(null)
        setSchool(null)
        setLoading(false)
      }
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setSchool(null)
  }, [])

  const adminLogin = useCallback((username: string, password: string) => {
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('madrese-yar-admin', 'admin')
      setAdmin({ username: 'admin', role: 'admin' })
      return true
    }
    return false
  }, [])

  const adminSignOut = useCallback(() => {
    localStorage.removeItem('madrese-yar-admin')
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, school, admin, loading, refreshProfile, signOut, adminLogin, adminSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
