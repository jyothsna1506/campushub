import ScrollReveal from './ScrollReveal'

export default function FeatureSection() {
  const features = [
    {
      title: 'Student Clubs & Organizations',
      description:
        'Discover, join, and lead campus clubs across engineering, arts, athletics, and cultural societies. Keep rosters organized and streamline membership.',
      category: 'Community',
      tagColor: 'bg-blue-50 text-blue-800 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      highlight: 'Manage rosters & memberships',
    },
    {
      title: 'Campus Events & Live RSVPs',
      description:
        'Never miss workshops, guest speaker lectures, or student festivals. Reserve spots with instant one-click RSVPs and track event capacity in real-time.',
      category: 'Activities',
      tagColor: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-100 text-teal-800',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      highlight: 'One-click RSVP & capacity counters',
    },
    {
      title: 'Project Teams & Collaboration',
      description:
        'Turn innovative ideas into reality. Form multidisciplinary teams for course projects, hackathons, and startup competitions with streamlined join requests.',
      category: 'Collaboration',
      tagColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-100 text-indigo-700',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      highlight: 'Role matching & membership approval flow',
    },
    {
      title: 'Official Campus Announcements',
      description:
        'Stay informed with verified notifications, emergency advisories, and administrative updates prioritized by urgency level so critical information is never missed.',
      category: 'Communications',
      tagColor: 'bg-rose-50 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      highlight: 'Priority-tagged university updates',
    },
    {
      title: 'Career & Research Opportunities',
      description:
        'Access curated internships, paid campus research fellowships, teaching assistantships, and design challenges directly posted by labs and partner firms.',
      category: 'Career & Growth',
      tagColor: 'bg-amber-50 text-amber-900 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-800',
      icon: (
        <svg className="w-6 h-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      highlight: 'Direct application links & deadline trackers',
    },
  ]

  return (
    <section
      id="features"
      data-story-section="2"
      aria-labelledby="features-title"
      className="story-section scroll-mt-24 sm:scroll-mt-28 py-16 sm:py-24 bg-white border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <ScrollReveal delay={0} yOffset={36}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-3">
              <span>Integrated Campus Ecosystem</span>
            </div>
            <h2
              id="features-title"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Engineered for Every Dimension of Campus Life
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={80} yOffset={32}>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
              Eliminate fragmented messaging groups, lost email chains, and disconnected spreadsheets. CampusHub gives your entire university a single synchronized operating system.
            </p>
          </ScrollReveal>
        </div>

        {/* 5 Core Feature Cards Grid (Main Visual / Cards Stagger) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <ScrollReveal
              key={idx}
              delay={140 + idx * 25}
              yOffset={40}
              duration={650}
              className={`h-full ${idx === 3 ? 'lg:col-span-1' : ''} ${idx === 4 ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              <div
                data-feature-card
                className="group h-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className={`p-3 rounded-xl ${feature.iconBg} transition-transform duration-200 ease-out group-hover:scale-[1.03]`}>
                      {feature.icon}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${feature.tagColor}`}
                    >
                      {feature.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                  <span>{feature.highlight}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
