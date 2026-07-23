import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({
  role,
  children,
}: {
  role: 'admin' | 'partner'
  children: ReactNode
}) {
  const { session, profile, loading } = useAuth()

  if (loading) return <div className="p-8 text-center text-gray-500">Caricamento...</div>
  if (!session) return <Navigate to={`/${role}/login`} replace />
  if (!profile || profile.role !== role) {
    return <div className="p-8 text-center text-red-600">Accesso non autorizzato per questo account.</div>
  }
  return <>{children}</>
}
