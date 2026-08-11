import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminAziende } from './pages/admin/AdminAziende'
import { AdminAziendaDetail } from './pages/admin/AdminAziendaDetail'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { PraticaDetail } from './pages/admin/PraticaDetail'
import { PartnerLogin } from './pages/partner/PartnerLogin'
import { PartnerDashboard } from './pages/partner/PartnerDashboard'
import { PartnerPraticaDetail } from './pages/partner/PartnerPraticaDetail'
import { ClientForm } from './pages/client/ClientForm'
import logo from './assets/logo-full.png'

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 bg-gray-50 dark:bg-gray-950">
      <img src={logo} alt="Pratiche ENEA — Nardi" className="w-full max-w-xs" />
      <div className="w-full max-w-xs flex flex-col gap-4">
        <Link
          to="/admin"
          className="w-full text-center rounded-lg border-2 border-brand-600 text-brand-700 dark:text-brand-400 dark:border-brand-500 py-3 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
        >
          Area amministratori
        </Link>
        <Link
          to="/partner"
          className="w-full text-center rounded-lg border-2 border-brand-600 text-brand-700 dark:text-brand-400 dark:border-brand-500 py-3 text-sm font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
        >
          Area aziende partner
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminAziende />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/aziende/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminAziendaDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pratiche"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pratiche/:id"
          element={
            <ProtectedRoute role="admin">
              <PraticaDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route
          path="/partner"
          element={
            <ProtectedRoute role="partner">
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/pratiche/:id"
          element={
            <ProtectedRoute role="partner">
              <PartnerPraticaDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/p/:token" element={<ClientForm />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
