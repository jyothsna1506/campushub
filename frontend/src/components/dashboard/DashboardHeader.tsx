import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function DashboardHeader() {
  const { user } = useAuth()

  // Format today's date nicely for college context
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Welcome Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" aria-hidden="true" />
            <span>Campus Workspace • Active Semester</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user?.fullName || 'Student'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {(user?.branch || user?.year)
              ? `${[user?.branch, user?.year ? `Year ${user.year}` : null].filter(Boolean).join(' • ')} • `
              : ''}
            {user?.email || 'Campus Member'} • {todayDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <svg className="w-4 h-4 text-slate-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/clubs"
            className="group interactive-subcard flex items-center gap-3 p-3.5 bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Explore Clubs
              </p>
              <p className="text-xs text-slate-600">Join campus groups</p>
            </div>
          </Link>

          <Link
            to="/events"
            className="group interactive-subcard flex items-center gap-3 p-3.5 bg-white hover:bg-teal-50/50 rounded-xl border border-slate-200 hover:border-teal-300 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors shrink-0">
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Browse Events
              </p>
              <p className="text-xs text-slate-600">RSVP for workshops</p>
            </div>
          </Link>

          <Link
            to="/teams"
            className="group interactive-subcard flex items-center gap-3 p-3.5 bg-white hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Find Teams
              </p>
              <p className="text-xs text-slate-600">Hackathon squads</p>
            </div>
          </Link>

          <Link
            to="/opportunities"
            className="group interactive-subcard flex items-center gap-3 p-3.5 bg-white hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-amber-300 shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 group-hover:bg-amber-700 group-hover:text-white transition-colors shrink-0">
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                Opportunities
              </p>
              <p className="text-xs text-slate-600">Internships & grants</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
