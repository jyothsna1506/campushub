import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function LandingNavbar() {
  const { isAuthenticated, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position using top sentinel IntersectionObserver (zero scroll event overhead)
  useEffect(() => {
    const sentinel = document.getElementById('landing-top-sentinel')
    if (sentinel) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting)
        },
        { root: null, threshold: 0, rootMargin: '-20px 0px 0px 0px' }
      )
      observer.observe(sentinel)
      return () => observer.disconnect()
    }

    // Fallback if rendered outside of LandingPage
    function handleScroll() {
      const scrolled = window.scrollY > 20
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev))
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Campus Story', href: '#story' },
    { name: 'Collaboration', href: '#collaboration' },
    { name: 'Opportunities', href: '#opportunities' },
  ]

  return (
    <nav
      aria-label="Main Navigation"
      className={`sticky top-0 z-30 transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-1 -m-1"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-700 text-white font-bold text-lg shadow-sm group-hover:bg-blue-800 transition-colors">
              CH
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                CampusHub
              </span>
              <span className="text-xs font-medium text-slate-600 block leading-tight">
                College Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100/70 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg px-3 py-1.5"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100/80 active:bg-slate-200/60 transition-colors duration-150 text-xs font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                    {getInitials(user?.fullName)}
                  </span>
                  <span className="max-w-[130px] truncate">{user?.fullName || 'My Account'}</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="btn-cta-primary group text-sm px-4 py-2"
                >
                  <span>Go to Dashboard</span>
                  <span aria-hidden="true" className="arrow-slide">→</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-cta-secondary text-sm px-3.5 py-2"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-cta-primary group text-sm px-4 py-2"
                >
                  <span>Get Started</span>
                  <span aria-hidden="true" className="arrow-slide">→</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200/70 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={mobileMenuOpen ? 'Close main navigation menu' : 'Open main navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="region"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg"
        >
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-cta-primary w-full py-2.5 text-sm"
              >
                <span>Go to Dashboard ({user?.fullName || 'Student'})</span>
                <span aria-hidden="true" className="arrow-slide">→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-cta-secondary w-full py-2.5 text-sm"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-cta-primary w-full py-2.5 text-sm"
                >
                  <span>Get Started Free</span>
                  <span aria-hidden="true" className="arrow-slide">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
