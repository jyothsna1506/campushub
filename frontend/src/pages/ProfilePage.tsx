import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/userApi'
import { getApiErrorMessage } from '../services/api'
import type { UserResponse, UserUpdateRequest } from '../types'

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

function getYearLabel(yearNumber?: number | string): string {
  if (!yearNumber) return 'Not specified'
  const y = Number(yearNumber)
  if (y === 1) return '1st Year'
  if (y === 2) return '2nd Year'
  if (y === 3) return '3rd Year'
  return `${y}th Year`
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'SU'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  // View vs Edit Mode
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Edit Form Fields
  const [fullName, setFullName] = useState('')
  const [program, setProgram] = useState('')
  const [branch, setBranch] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [bio, setBio] = useState('')

  // Validation Errors
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string
    program?: string
    branch?: string
    year?: string
    bio?: string
  }>({})

  // Initialize or reset form values from current authenticated user
  const populateForm = (currentUser: UserResponse | null) => {
    if (!currentUser) return
    setFullName(currentUser.fullName || '')
    setProgram(currentUser.program || '')
    setBranch(currentUser.branch || '')
    setYear(currentUser.year ?? '')
    setBio(currentUser.bio || '')
    setFieldErrors({})
  }

  useEffect(() => {
    populateForm(user)
  }, [user])

  // Calculate valid year options based on selected program
  const maxYears = program ? PROGRAM_YEAR_COUNTS[program] || 4 : 4
  const availableYears = Array.from({ length: maxYears }, (_, i) => i + 1)

  const handleProgramChange = (newProgram: string) => {
    setProgram(newProgram)
    setFieldErrors((prev) => ({ ...prev, program: undefined }))

    const newMaxYears = newProgram ? PROGRAM_YEAR_COUNTS[newProgram] || 4 : 4
    if (year !== '' && Number(year) > newMaxYears) {
      setYear('')
    }
  }

  const handleCancelEdit = () => {
    populateForm(user)
    setIsEditing(false)
    setFeedback(null)
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setFeedback(null)
    const errors: typeof fieldErrors = {}

    const trimmedName = fullName.trim()
    if (!trimmedName) {
      errors.fullName = 'Full name is required.'
    } else if (trimmedName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.'
    }

    if (bio && bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const payload: UserUpdateRequest = {
        fullName: trimmedName,
        program: program || undefined,
        branch: branch || undefined,
        year: year !== '' ? Number(year) : undefined,
        bio: bio.trim(),
      }

      const updatedUser = await userApi.updateUser(user.id, payload)

      // Sync state with AuthContext and localStorage
      updateUser(updatedUser)

      setIsEditing(false)
      setFeedback({
        type: 'success',
        message: 'Profile updated successfully.',
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Couldn't update your profile right now.")
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 max-w-lg mx-auto shadow-xs my-8">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
          ⚠️
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">Couldn't load your profile right now.</h2>
          <p className="text-xs text-slate-500">
            Please log in again or check your server connection.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  const initials = getInitials(user.fullName)
  const academicSummary = [
    user.program,
    user.branch,
    user.year ? getYearLabel(user.year) : null,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Student Profile
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage your personal profile, academic information, and student background.
          </p>
        </div>

        {!isEditing && (
          <div>
            <button
              type="button"
              onClick={() => {
                populateForm(user)
                setFeedback(null)
                setIsEditing(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-xs transition-all hover:shadow cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold text-base" aria-hidden="true">
              {feedback.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Card Header (Avatar + Quick Info) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-blue-200 shadow-2xs flex-shrink-0">
            {initials}
          </div>

          <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {user.fullName}
              </h2>
              <span className="inline-flex items-center self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {user.role || 'Student'}
              </span>
            </div>

            <p className="text-sm text-slate-600 truncate">{user.email}</p>

            {academicSummary && (
              <p className="text-xs font-medium text-slate-500 pt-1">
                {academicSummary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE: Information Sections */}
      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Personal & Academic Information */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal & Academic Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official student record details registered on CampusHub.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Full Name
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">{user.fullName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1 truncate">{user.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Program
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {user.program || 'Not specified'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Academic Year
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {getYearLabel(user.year)}
                </p>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Branch / Department
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {user.branch || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Col: About Me / Bio */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">About Me</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bio, skills, and student background.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                {user.bio && user.bio.trim() ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No bio added yet.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  populateForm(user)
                  setFeedback(null)
                  setIsEditing(true)
                }}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit Bio & Information
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT MODE: Form */
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Edit Profile Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your name, degree program, academic year, and bio. Email is institution-managed.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="edit-name" className="block text-xs font-semibold text-slate-700">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }))
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-rose-600">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-1.5">
                <label htmlFor="edit-email" className="block text-xs font-semibold text-slate-700">
                  Email Address <span className="text-slate-400 font-normal">(Read-only)</span>
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                />
                <p className="text-[11px] text-slate-400">
                  Institutional email is locked for student verification.
                </p>
              </div>

              {/* Program */}
              <div className="space-y-1.5">
                <label htmlFor="edit-program" className="block text-xs font-semibold text-slate-700">
                  Program / Degree
                </label>
                <select
                  id="edit-program"
                  value={program}
                  onChange={(e) => handleProgramChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="">Select Program</option>
                  {PROGRAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label htmlFor="edit-year" className="block text-xs font-semibold text-slate-700">
                  Academic Year
                </label>
                <select
                  id="edit-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="">Select Year</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {getYearLabel(y)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div className="sm:col-span-2 space-y-1.5">
                <label htmlFor="edit-branch" className="block text-xs font-semibold text-slate-700">
                  Branch / Specialization
                </label>
                <select
                  id="edit-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
                >
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="edit-bio" className="block text-xs font-semibold text-slate-700">
                    About Me / Bio
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {bio.length} / 500 characters
                  </span>
                </div>
                <textarea
                  id="edit-bio"
                  rows={4}
                  value={bio}
                  maxLength={500}
                  onChange={(e) => {
                    setBio(e.target.value)
                    if (fieldErrors.bio) setFieldErrors((prev) => ({ ...prev, bio: undefined }))
                  }}
                  placeholder="Share your interests, key skills, and collaboration goals..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                {fieldErrors.bio && (
                  <p className="text-xs text-rose-600">{fieldErrors.bio}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
