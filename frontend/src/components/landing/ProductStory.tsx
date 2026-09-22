import ScrollReveal from './ScrollReveal'

export default function ProductStory() {
  const points = [
    {
      title: 'Consolidated Campus Calendar',
      text: 'No more overlapping schedules or overlooked events. See everything from club workshops to university keynotes in one unified view.',
    },
    {
      title: 'Guaranteed Live Capacity & Instant RSVPs',
      text: 'One-click registration ensures your seat is reserved, while organizers get accurate attendee counts and waiting lists.',
    },
    {
      title: 'Verified Student & Organization Profiles',
      text: 'Know exactly who is organizing an event or leading a project team. Connect with confidence through verified campus profiles.',
    },
    {
      title: 'Urgent Notices Prioritized Over Noise',
      text: 'Critical university deadlines, weather delays, and exam room changes cut through the noise with clear priority flags.',
    },
  ]

  return (
    <section
      id="story"
      data-story-section="3"
      aria-labelledby="story-title"
      className="story-section scroll-mt-24 sm:scroll-mt-28 py-16 sm:py-24 bg-slate-50 border-t border-slate-200 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story Content & Supporting Points */}
          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal delay={0} yOffset={36}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                <span>The Student Experience, Reimagined</span>
              </div>

              <h2
                id="story-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
              >
                Everything happening on campus,{' '}
                <span className="text-blue-700">in one place</span>.
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={80} yOffset={32} className="space-y-4">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                College moves fast. Important club fairs get buried in group chats, project collaborators are hard to find, and workshop registrations are spread across dozens of forms.
              </p>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                CampusHub replaces the clutter with an organized, elegant platform where every club, event, project team, and opportunity lives side-by-side.
              </p>
            </ScrollReveal>

            {/* Supporting Points with Checkmarks */}
            <ScrollReveal delay={160} yOffset={32}>
              <div className="space-y-4 pt-2">
                {points.map((point, idx) => (
                  <div key={idx} data-story-point className="group flex items-start gap-3.5 p-1 -m-1 rounded-lg hover:bg-slate-100/60 transition-colors duration-150">
                    <div className="shrink-0 mt-1 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center transition-transform duration-200 group-hover:scale-105" aria-hidden="true">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-150">
                        {point.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
                        {point.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Polished UI Mockup / Card Stack (Visual 140ms Stagger) */}
          <ScrollReveal delay={140} yOffset={40} className="lg:col-span-6 relative" aria-hidden="true">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/60 to-teal-100/60 rounded-3xl blur-2xl -z-10" />

            <div data-story-visual className="space-y-4 max-w-lg mx-auto select-none">
              {/* Top Card: Live Event Card */}
              <div className="interactive-subcard bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                      AI
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">AI & Ethics Society</h4>
                      <p className="text-[11px] text-slate-600">Official Campus Organization</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    RSVP Open
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-bold text-slate-900">
                    Future of Generative Models in Academic Research
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Keynote lecture followed by interactive student panel and Q&A session.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-600">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tomorrow, 4:30 PM
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium">Auditorium C</span>
                  </div>
                  <span className="font-bold text-blue-700">88/100 Seats</span>
                </div>
              </div>

              {/* Overlapping Card: High-Priority Announcement */}
              <div className="interactive-subcard bg-white rounded-2xl border border-rose-200 p-5 shadow-xs transform lg:translate-x-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-rose-100 text-rose-800">
                      Official Notice • Academic Affairs
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">Published today</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  Course Add/Drop Deadline & Credit Overload Petitions
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Final submission portal closes Friday at 11:59 PM. Department advisor signatures must be uploaded prior to submission.
                </p>
              </div>

              {/* Bottom Card: Club Membership Active Roster */}
              <div className="interactive-subcard bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                    GD
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Google Developer Student Club</h5>
                    <p className="text-[11px] text-slate-600">Active Member • Web & Mobile Track</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Member
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
