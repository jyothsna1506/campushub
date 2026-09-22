import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

const PROGRAM_OPTIONS = [
  'B.Tech',
  'B.E.',
  'M.Tech',
  'M.E.',
  'MCA',
  'MBA',
  'M.Sc.',
  'B.Sc.',
  'Other',
] as const

const PROGRAM_YEAR_COUNTS: Record<string, number> = {
  'B.Tech': 4,
  'B.E.': 4,
  'M.Tech': 2,
  'M.E.': 2,
  'MCA': 3,
  'MBA': 2,
  'M.Sc.': 2,
  'B.Sc.': 3,
  'Other': 5,
}

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Machine Learning',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Other',
] as const

function getYearLabel(yearNumber: number): string {
  if (yearNumber === 1) return '1st Year'
  if (yearNumber === 2) return '2nd Year'
  if (yearNumber === 3) return '3rd Year'
  return `${yearNumber}th Year`
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [program, setProgram] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [bio, setBio] = useState('')

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    program?: string
    branch?: string
    year?: string
  }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  // Calculate available year options dynamically based on selected program
  const maxYears = program ? PROGRAM_YEAR_COUNTS[program] || 4 : 0
  const availableYears = Array.from({ length: maxYears }, (_, i) => i + 1)

  const handleProgramChange = (selectedProgram: string) => {
    setProgram(selectedProgram)
    setFieldErrors((prev) => ({ ...prev, program: undefined }))

    // If current year selection is beyond the newly selected program's duration, reset it
    const newMaxYears = selectedProgram ? PROGRAM_YEAR_COUNTS[selectedProgram] || 4 : 0
    if (year !== '' && (Number(year) > newMaxYears || Number(year) < 1)) {
      setYear('')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const errors: typeof fieldErrors = {}
    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      errors.fullName = 'Full name is required.'
    }
    if (!trimmedEmail) {
      errors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.'
    }
    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.'
    }
    if (!program) {
      errors.program = 'Please select your program.'
    }
    if (!branch) {
      errors.branch = 'Please select your branch.'
    }
    if (year === '' || Number(year) < 1 || (maxYears > 0 && Number(year) > maxYears)) {
      errors.year = 'Please select your current year.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      // Pick first error for top banner announcement
      const firstError = Object.values(errors)[0]
      setErrorMessage(firstError || 'Please fill in all required fields.')
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)
    try {
      await register({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        program,
        branch,
        year: Number(year),
        bio: bio.trim() || undefined,
      })

      navigate('/login', {
        state: {
          message: 'Account created successfully! Please sign in with your credentials.',
        },
      })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setErrorMessage('Unable to connect to CampusHub. Please make sure the server is running and try again.')
          return
        }
        if (err.response.status === 409) {
          setErrorMessage(getApiErrorMessage(err, 'This email address is already registered. Please sign in.'))
          return
        }
        if (err.response.status === 400) {
          setErrorMessage(getApiErrorMessage(err, 'Validation failed. Please check your form input.'))
          return
        }
      }
      setErrorMessage(getApiErrorMessage(err, 'Failed to create account. Please check your information.'))
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
          className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-700 text-white font-bold text-xl shadow-sm mb-2 hover:bg-teal-800 transition-colors"
        >
          CH
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create an Account
        </h1>
        <p className="text-sm text-slate-600">
          Join your campus community to discover clubs, events, and projects
        </p>
      </div>

      {/* Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-slate-200 shadow-sm space-y-6">
          {/* Top Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2">
              <span className="text-rose-600 font-bold mt-0.5" aria-hidden="true">!</span>
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-slate-700"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }))
                }}
                disabled={isSubmitting}
                placeholder="Alex Morgan"
                className={`mt-1 block w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed ${
                  fieldErrors.fullName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Campus Email */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-slate-700"
              >
                Campus Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }))
                }}
                disabled={isSubmitting}
                placeholder="alex@college.edu"
                className={`mt-1 block w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed ${
                  fieldErrors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
                }}
                disabled={isSubmitting}
                placeholder="Minimum 8 characters"
                className={`mt-1 block w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 placeholder-slate-400 text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed ${
                  fieldErrors.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                }`}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters long.</p>
              )}
            </div>

            {/* Program / Degree (Required Select) */}
            <div>
              <label
                htmlFor="register-program"
                className="block text-sm font-medium text-slate-700"
              >
                Program / Degree <span className="text-rose-500">*</span>
              </label>
              <select
                id="register-program"
                required
                value={program}
                onChange={(e) => handleProgramChange(e.target.value)}
                disabled={isSubmitting}
                className={`mt-1 block w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer ${
                  fieldErrors.program
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'
                    : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                }`}
              >
                <option value="" disabled className="text-slate-400">
                  Select your program
                </option>
                {PROGRAM_OPTIONS.map((prog) => (
                  <option key={prog} value={prog} className="text-slate-900">
                    {prog}
                  </option>
                ))}
              </select>
              {fieldErrors.program && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.program}</p>
              )}
            </div>

            {/* Branch / Major (Required Dropdown) & Current Year (Dependent Select) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Branch / Major */}
              <div>
                <label
                  htmlFor="register-branch"
                  className="block text-sm font-medium text-slate-700"
                >
                  Branch / Major <span className="text-rose-500">*</span>
                </label>
                <select
                  id="register-branch"
                  required
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value)
                    if (fieldErrors.branch) setFieldErrors((p) => ({ ...p, branch: undefined }))
                  }}
                  disabled={isSubmitting}
                  className={`mt-1 block w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer ${
                    fieldErrors.branch
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                  }`}
                >
                  <option value="" disabled className="text-slate-400">
                    Select your branch / major
                  </option>
                  {BRANCH_OPTIONS.map((br) => (
                    <option key={br} value={br} className="text-slate-900">
                      {br}
                    </option>
                  ))}
                </select>
                {fieldErrors.branch && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.branch}</p>
                )}
              </div>

              {/* Current Year (Dynamic Select) */}
              <div>
                <label
                  htmlFor="register-year"
                  className="block text-sm font-medium text-slate-700"
                >
                  Current Year <span className="text-rose-500">*</span>
                </label>
                <select
                  id="register-year"
                  required
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    if (fieldErrors.year) setFieldErrors((p) => ({ ...p, year: undefined }))
                  }}
                  disabled={isSubmitting || !program}
                  className={`mt-1 block w-full px-3.5 py-2.5 rounded-lg border bg-white text-slate-900 text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer ${
                    fieldErrors.year
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                  }`}
                >
                  <option value="" disabled className="text-slate-400">
                    {!program ? 'Select program first' : 'Select current year'}
                  </option>
                  {availableYears.map((y) => (
                    <option key={y} value={y} className="text-slate-900">
                      {getYearLabel(y)}
                    </option>
                  ))}
                </select>
                {fieldErrors.year && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.year}</p>
                )}
              </div>
            </div>

            {/* Brief Bio (Optional) */}
            <div>
              <label
                htmlFor="register-bio"
                className="block text-sm font-medium text-slate-700"
              >
                Brief Bio <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="register-bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSubmitting}
                placeholder="A short note about your interests, skills, or student goals..."
                className="mt-1 block w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all shadow-sm disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:bg-teal-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <Link
              to="/login"
              className="font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Already have an account? Sign in
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
