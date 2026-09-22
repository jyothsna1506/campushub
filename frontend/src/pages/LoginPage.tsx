import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

interface LocationState {
  from?: {
    pathname: string
    search?: string
  }
  message?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setShowRegisterSuggestion(false)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsSubmitting(true)
    try {
      await login({ email: trimmedEmail, password })
      const destination = state?.from
        ? `${state.from.pathname || '/dashboard'}${state.from.search || ''}`
        : '/dashboard'
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setErrorMessage('Unable to connect to CampusHub. Please make sure the server is running and try again.')
          setShowRegisterSuggestion(false)
        } else if (err.response.status === 401) {
          setErrorMessage('Invalid email or password.')
          setShowRegisterSuggestion(true)
        } else if (err.response.status === 404) {
          setErrorMessage('No account was found with these credentials. Please register first.')
          setShowRegisterSuggestion(true)
        } else {
          setErrorMessage(getApiErrorMessage(err, 'Unable to sign in. Please try again later.'))
          setShowRegisterSuggestion(false)
        }
      } else {
        setErrorMessage(getApiErrorMessage(err, 'Unable to sign in. Please try again later.'))
        setShowRegisterSuggestion(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-700 text-white font-bold text-xl shadow-sm mb-2 hover:bg-blue-800 transition-colors"
        >
          CH
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Sign in to CampusHub
        </h1>
        <p className="text-sm text-slate-600">
          Enter your university credentials to access your account
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {/* Success Banner if redirected from Register */}
          {state?.message && !errorMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{state.message}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2">
              <span className="text-rose-600 font-bold mt-0.5">!</span>
              <div className="flex-1 space-y-1">
                <div>{errorMessage}</div>
                {showRegisterSuggestion && (
                  <div className="pt-0.5 text-[11px] text-rose-700">
                    Don&apos;t have an account yet?{' '}
                    <Link to="/register" className="font-semibold underline hover:text-rose-900 transition-colors">
                      Register here →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700"
              >
                Campus Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="student@college.edu"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="••••••••"
                className="mt-1 block w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <Link
              to="/register"
              className="font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              Don't have an account? Register
            </Link>
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
