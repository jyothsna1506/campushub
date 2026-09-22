import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clubs': 'Clubs & Organizations',
  '/events': 'Events Calendar',
  '/teams': 'Project Teams',
  '/announcements': 'Announcements',
  '/opportunities': 'Opportunities Board',
  '/profile': 'My Profile',
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'SU'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const currentTitle = pageTitles[location.pathname] || 'CampusHub'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.fullName || 'Student User'
  const displayEmail = user?.email || 'student@college.edu'
  const initials = getInitials(user?.fullName)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200">
      {/* Left: Mobile Hamburger & Page Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          aria-label="Open sidebar navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {currentTitle}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">Campus Collaboration Hub</p>
        </div>
      </div>

      {/* Right: Notifications, Profile Widget & Logout */}
      <div className="flex items-center gap-3">
        {/* Notification Placeholder */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          aria-label="Notifications"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Badge */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          title="View profile"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shadow-2xs">
            {initials}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{displayName}</p>
            <p className="text-[11px] text-slate-500 leading-none mt-1 max-w-[140px] truncate">
              {displayEmail}
            </p>
          </div>
        </Link>

        {/* Logout Action Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer shadow-2xs"
          title="Sign out of CampusHub"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
