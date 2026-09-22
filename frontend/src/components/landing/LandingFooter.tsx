import { Link } from 'react-router-dom'

export default function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer aria-label="Footer" className="bg-slate-900 text-slate-300 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-xs" aria-hidden="true">
                C
              </div>
              <span className="font-bold text-lg text-white tracking-tight">CampusHub</span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The unified digital platform for college clubs, campus events with live RSVPs, student project collaboration, and career opportunities.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>Campus Systems Operational</span>
            </div>
          </div>

          {/* Column 1: Platform Modules */}
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/clubs" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Student Clubs
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Campus Events & RSVPs
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Project Teams
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Announcements
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Account & Access */}
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4">
              Student Access
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Campus Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Student Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Safety */}
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider mb-4">
              Community & Safety
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/announcements" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Code of Conduct
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Club Guidelines
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
                  Campus Security Contacts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} CampusHub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/announcements" className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
              Terms of Service
            </Link>
            <Link to="/announcements" className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
              Privacy Policy
            </Link>
            <Link to="/dashboard" className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded">
              Student Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
