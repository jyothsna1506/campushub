import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center max-w-md w-full space-y-6">
        {/* Brand Badge */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-black text-2xl border border-blue-100 shadow-2xs">
          404
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist, has been removed, or the link may be broken.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <>
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
              >
                Return to Home
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
              >
                <span>Sign In</span>
                <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
