import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ScrollReveal from './ScrollReveal'

export default function FinalCta() {
  const { isAuthenticated } = useAuth()

  return (
    <section
      data-story-section="6"
      aria-labelledby="final-cta-title"
      className="story-section py-16 sm:py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal yOffset={40} duration={750}>
          <div data-cta-card className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white overflow-hidden px-6 py-12 sm:px-12 sm:py-16 lg:py-20 text-center shadow-xl">
            {/* Subtle background decorative shapes */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" aria-hidden="true" />

            <div className="relative max-w-3xl mx-auto space-y-6">
              <ScrollReveal delay={0} yOffset={24}>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span>CampusHub Network • Open to All Students</span>
                </span>

                <h2
                  id="final-cta-title"
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
                >
                  Make more of your campus experience today.
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={80} yOffset={20}>
                <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Join clubs, attend workshops, build ambitious projects with classmates, and stay on top of verified campus opportunities—all within one central space.
                </p>
              </ScrollReveal>

              {/* Auth-aware CTAs with explicit text styling on white & blue buttons */}
              <ScrollReveal delay={160} yOffset={20}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="btn-cta-invert-primary group w-full sm:w-auto text-base px-8 py-3.5"
                    >
                      <span>Go to Your Dashboard</span>
                      <span aria-hidden="true" className="arrow-slide">→</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="btn-cta-invert-primary group w-full sm:w-auto text-base px-8 py-3.5"
                      >
                        <span>Create Free Student Account</span>
                        <span aria-hidden="true" className="arrow-slide">→</span>
                      </Link>
                      <Link
                        to="/login"
                        className="btn-cta-invert-secondary w-full sm:w-auto text-base px-7 py-3.5"
                      >
                        <span>Sign In</span>
                      </Link>
                    </>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200} yOffset={16}>
                <p className="text-xs text-blue-100 font-medium pt-2">
                  Free for all verified students, university faculty, and registered campus clubs.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
