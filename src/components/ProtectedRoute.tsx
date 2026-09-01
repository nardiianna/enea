import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function ProtectedRoute({
  role,
  children,
}: {
  role: 'admin' | 'partner'
  children: ReactNode
}) {
  const { session, profile, loading } = useAuth()
  const noProfile = !loading && !!session && !profile
  const wrongAccount = !loading && !!session && !!profile && profile.role !== role
  const denied = noProfile || wrongAccount

  useEffect(() => {
    if (denied) supabase.auth.signOut()
  }, [denied])

  if (loading) return <div className="p-8 text-center text-gray-500">Caricamento...</div>
  if (!session) return <Navigate to={`/${role}/login`} replace />
  if (denied) return <div className="p-8 text-center text-gray-500">Reindirizzamento al login...</div>
  return <>{children}</>
}
