import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, token } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading CampusHub...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
