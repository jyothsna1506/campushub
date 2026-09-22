import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ScrollReveal from './ScrollReveal'

export default function CollaborationSection() {
  const { isAuthenticated } = useAuth()

  const sampleTeams = [
    {
      name: 'Campus Food Rescue IoT',
      category: 'Sustainability & IoT',
      description:
        'Smart campus sensors and a redistribution app to track dining hall surplus and alert students to free meals in real-time.',
      lead: { name: 'Maya Torres', initials: 'MT', role: 'Team Lead • Env Science' },
      members: [
        { initials: 'MT', bg: 'bg-blue-600' },
        { initials: 'AK', bg: 'bg-teal-600' },
        { initials: 'PL', bg: 'bg-indigo-600' },
      ],
      memberCount: '3/4 members',
      lookingFor: 'Embedded Systems / C++',
      isOpen: true,
      buttonState: 'join',
    },
    {
      name: 'AR Historic Campus Tour',
      category: 'Augmented Reality & Mobile',
      description:
        'Building an interactive AR tour highlighting university architecture, archival photographs, and student oral histories.',
      lead: { name: 'Jason Kim', initials: 'JK', role: 'Team Lead • CS & History' },
      members: [
        { initials: 'JK', bg: 'bg-violet-600' },
        { initials: 'EL', bg: 'bg-amber-600' },
      ],
      memberCount: '2/4 members',
      lookingFor: 'Unity / 3D Asset Artist',
      isOpen: true,
      buttonState: 'pending',
    },
    {
      name: 'RoboSub Autonomous Thruster',
      category: 'Robotics & Hardware',
      description:
        'Designing autonomous underwater vehicle controls and sonar localization systems for the international RoboSub challenge.',
      lead: { name: 'Devin Patel', initials: 'DP', role: 'Team Lead • Mechanical Eng' },
      members: [
        { initials: 'DP', bg: 'bg-slate-700' },
        { initials: 'CR', bg: 'bg-blue-600' },
        { initials: 'MW', bg: 'bg-teal-600' },
        { initials: 'SN', bg: 'bg-rose-600' },
      ],
      memberCount: '4/4 members',
      lookingFor: 'Roster filled for Spring',
      isOpen: false,
      buttonState: 'full',
    },
  ]

  return (
    <section
      id="collaboration"
      data-story-section="4"
      aria-labelledby="collaboration-title"
      className="story-section scroll-mt-24 sm:scroll-mt-28 py-16 sm:py-24 bg-white border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollReveal delay={0} yOffset={36}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-3">
              <span>Student Collaboration Hub</span>
            </div>
            <h2
              id="collaboration-title"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Turn ambitious ideas into <span className="text-blue-700">high-impact teams</span>.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={80} yOffset={32}>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              Great college projects require diverse talents. Whether you are assembling a hackathon squad or launching a multidisciplinary research initiative, CampusHub makes team formation effortless.
            </p>
          </ScrollReveal>
        </div>

        {/* Realistic Team Cards Grid (Main Visual / Cards 140ms Stagger) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {sampleTeams.map((team, idx) => (
            <ScrollReveal key={idx} delay={140 + idx * 35} yOffset={40} duration={650} className="h-full">
              <div
                data-team-card
                className="h-full bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Header: Category & Open Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {team.category}
                    </span>
                    {team.isOpen ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                        Recruiting
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Team Full
                      </span>
                    )}
                  </div>

                  {/* Team Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {team.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                    {team.description}
                  </p>

                  {/* Role Seeking Callout */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Desired Roles & Skills
                    </p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      {team.lookingFor}
                    </p>
                  </div>
                </div>

                <div>
                  {/* Team Members & Lead */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden" aria-hidden="true">
                        {team.members.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className={`inline-block h-7 w-7 rounded-full ring-2 ring-white ${m.bg} text-white text-xs font-bold flex items-center justify-center`}
                          >
                            {m.initials}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-600 font-semibold">
                        {team.memberCount}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      Lead: {team.lead.initials}
                    </span>
                  </div>

                  {/* Actionable Interactive Link or Non-misleading Badges */}
                  {team.buttonState === 'join' && (
                    <Link
                      to={isAuthenticated ? '/teams' : '/login'}
                      className="btn-cta-primary group w-full text-xs py-2.5 rounded-xl"
                    >
                      <span>Request to Join Team</span>
                      <span aria-hidden="true" className="arrow-slide">→</span>
                    </Link>
                  )}
                  {team.buttonState === 'pending' && (
                    <div
                      className="w-full inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 font-semibold text-xs px-4 py-2.5 rounded-xl select-none"
                      aria-label="Application status: Under Review"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Application Under Review</span>
                    </div>
                  )}
                  {team.buttonState === 'full' && (
                    <div
                      className="w-full inline-flex items-center justify-center bg-slate-100 text-slate-600 font-semibold text-xs px-4 py-2.5 rounded-xl select-none"
                      aria-label="Team roster is full"
                    >
                      <span>Roster Filled</span>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Feature Bottom Summary Strip */}
        <ScrollReveal delay={120} yOffset={20}>
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="group flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-slate-100/80 transition-colors duration-150">
              <div className="shrink-0 p-2 rounded-lg bg-blue-100 text-blue-700 transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-150">Custom Join Questions</h4>
                <p className="text-xs text-slate-600 mt-0.5">Team leads can ask applicants about experience and time commitment.</p>
              </div>
            </div>

            <div className="group flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-slate-100/80 transition-colors duration-150">
              <div className="shrink-0 p-2 rounded-lg bg-teal-100 text-teal-800 transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900 transition-colors duration-150">Instant Roster Management</h4>
                <p className="text-xs text-slate-600 mt-0.5">Approve, decline, or manage member roles with one clean dashboard.</p>
              </div>
            </div>

            <div className="group flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-slate-100/80 transition-colors duration-150">
              <div className="shrink-0 p-2 rounded-lg bg-indigo-100 text-indigo-700 transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 transition-colors duration-150">Hackathon Ready</h4>
                <p className="text-xs text-slate-600 mt-0.5">Tag teams with specific hackathon tracks to attract judges and sponsors.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
