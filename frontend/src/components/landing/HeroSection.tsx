import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function HeroSection() {
  const { isAuthenticated } = useAuth()

  return (
    <section
      data-story-section="0"
      aria-labelledby="hero-title"
      className="story-section relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-slate-50 via-slate-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Top Feature Pill */}
        <div className="hero-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs transition-transform duration-300 hover:scale-[1.02]">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" aria-hidden="true" />
          <span>The College Collaboration Workspace</span>
          <span className="text-blue-400" aria-hidden="true">•</span>
          <span className="text-blue-800 font-semibold">Spring 2026 Edition</span>
        </div>

        {/* Hero Title */}
        <h1
          id="hero-title"
          className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-4xl mx-auto"
        >
          Connect, collaborate, and excel across your <span className="text-blue-700">campus community</span>.
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-base sm:text-lg lg:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed">
          CampusHub unifies student clubs, event calendars with live RSVPs, hackathon project teams, administrative announcements, and career opportunities into one seamless platform.
        </p>

        {/* Action Buttons */}
        <div className="hero-actions flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="btn-cta-primary group w-full sm:w-auto text-base px-7 py-3.5"
            >
              <span>Go to My Dashboard</span>
              <span aria-hidden="true" className="arrow-slide">→</span>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="btn-cta-primary group w-full sm:w-auto text-base px-7 py-3.5"
              >
                <span>Get Started Free</span>
                <span aria-hidden="true" className="arrow-slide">→</span>
              </Link>
              <Link
                to="/login"
                className="btn-cta-secondary w-full sm:w-auto text-base px-6 py-3.5"
              >
                <span>Sign In to Campus</span>
              </Link>
            </>
          )}

          <a
            href="#features"
            className="group w-full sm:w-auto inline-flex items-center justify-center text-sm font-semibold text-slate-700 hover:text-blue-700 px-4 py-3 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>Explore Platform Features</span>
            <span className="arrow-slide-down ml-1" aria-hidden="true">↓</span>
          </a>
        </div>

        {/* Social Proof / Stats Strip */}
        <div className="hero-stats pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-200">
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">1,200+</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Active Students</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">45+</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Student Clubs</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-bold text-teal-800">120+</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Campus Events</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">80+</p>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Project Teams</p>
          </div>
        </div>
      </div>
    </section>
  )
}
