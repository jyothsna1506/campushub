import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ScrollReveal from './ScrollReveal'

export default function OpportunitySection() {
  const { isAuthenticated } = useAuth()

  const sampleOpportunities = [
    {
      title: 'Quantum Computing Undergraduate Research Assistant',
      organization: 'Department of Physics & Quantum Labs',
      type: 'Research Fellowship',
      location: 'Science Complex • On-Campus',
      deadline: 'April 30, 2026',
      tags: ['Stipend $3,500', 'Faculty Mentored', '10-15 hrs/wk'],
      description:
        'Assist in quantum circuit simulations and cryogenic hardware calibration. Open to CS, Physics, and Electrical Engineering undergraduates.',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      title: 'Full-Stack Software Engineering Summer Intern',
      organization: 'Campus Innovation Venture Hub',
      type: 'Paid Internship',
      location: 'Hybrid (Student Incubator)',
      deadline: 'May 15, 2026',
      tags: ['Competitive Hourly', 'React & Spring Boot', 'Junior / Senior'],
      description:
        'Join a funded campus student startup building cloud data infrastructure for environmental sensor networks.',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      title: 'Autonomous Systems Collegiate Innovation Grant',
      organization: 'National Aerospace Education Foundation',
      type: 'Grant Competition',
      location: 'Campus Lab & Finals in D.C.',
      deadline: 'June 01, 2026',
      tags: ['$10,000 Prize Pool', 'Teams of 3-5', 'Hardware Provided'],
      description:
        'Design and deploy an aerial or terrestrial autonomous robotics prototype addressing disaster response scenarios.',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  ]

  return (
    <section
      id="opportunities"
      data-story-section="5"
      aria-labelledby="opportunities-title"
      className="story-section scroll-mt-24 sm:scroll-mt-28 py-16 sm:py-24 bg-slate-50 border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollReveal delay={0} yOffset={36}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 mb-3">
              <span>Career & Academic Growth</span>
            </div>
            <h2
              id="opportunities-title"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Discover Opportunities Made for Students
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={80} yOffset={32}>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              Gain real-world experience before graduation. Find curated undergraduate research fellowships, campus startup roles, and sponsored engineering grants.
            </p>
          </ScrollReveal>
        </div>

        {/* Connected Sequence Pathway Track */}
        <div className="mt-10 max-w-2xl mx-auto px-4 hidden sm:block">
          <div className="relative">
            <div className="h-1 bg-slate-200 rounded-full w-full overflow-hidden">
              <div
                data-opp-connector
                className="h-full bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 rounded-full"
                style={{ width: 'var(--line-progress, 0%)' }}
              />
            </div>
            <div className="flex justify-between items-center -mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="bg-slate-50 px-2">01 / Research Fellowships</span>
              <span className="bg-slate-50 px-2">02 / Startup Internships</span>
              <span className="bg-slate-50 px-2">03 / Innovation Grants</span>
            </div>
          </div>
        </div>

        {/* Opportunities Grid (Connected Sequence / Progressive Handoff) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sampleOpportunities.map((opp, idx) => (
            <ScrollReveal key={idx} delay={140 + idx * 35} yOffset={40} duration={650} className="h-full">
              <div
                data-opp-card
                className="h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Header: Type and Deadline */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${opp.badgeColor}`}
                    >
                      {opp.type}
                    </span>
                    <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Due {opp.deadline}
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {opp.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mb-3">
                    {opp.organization}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                    {opp.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {opp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Location Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-4">
                    <span className="flex items-center gap-1 font-medium">
                      <svg className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {opp.location}
                    </span>
                  </div>

                  {/* Actionable Semantic Link with Focus-Visible */}
                  <Link
                    to="/opportunities"
                    className="btn-cta-secondary group w-full text-xs py-2.5 rounded-xl"
                  >
                    <span>View Details & Apply</span>
                    <svg className="w-3.5 h-3.5 text-slate-600 arrow-slide" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bottom Banner for Posters */}
        <ScrollReveal delay={100} yOffset={16}>
          <div className="mt-12 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Are you a faculty member, lab director, or campus recruiter?{' '}
              <Link
                to={isAuthenticated ? '/opportunities' : '/login'}
                className="text-blue-700 hover:text-blue-800 font-semibold underline underline-offset-4 decoration-blue-600/40 hover:decoration-blue-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 py-0.5"
              >
                Post an opportunity directly to the student body
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
