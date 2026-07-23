import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  role: 'admin' | 'partner'
  azienda_partner_id: string | null
}

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ session: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('profiles')
      .select('id, role, azienda_partner_id')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setProfile(data ?? null)
        setLoading(false)
      })
  }, [session])

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
