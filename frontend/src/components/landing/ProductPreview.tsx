import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ScrollReveal from './ScrollReveal'

export default function ProductPreview() {
  const { isAuthenticated } = useAuth()

  return (
    <section
      data-story-section="1"
      aria-label="CampusHub Interface Preview"
      className="story-section relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 pb-16 sm:pb-24"
    >
      {/* Decorative background glow */}
      <div className="absolute inset-x-0 -top-20 -bottom-10 bg-gradient-to-b from-blue-100/50 via-teal-50/30 to-transparent blur-2xl -z-10 rounded-3xl" aria-hidden="true" />

      {/* Mockup Container Window */}
      <ScrollReveal yOffset={40} duration={700} threshold={0.08}>
        <div data-preview-mockup className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Mock Browser/App Header Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs font-mono text-slate-500 hidden sm:inline">campushub.edu/dashboard</span>
          </div>

          <div className="flex-1 max-w-sm mx-auto hidden md:block" aria-hidden="true">
            <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 flex items-center gap-2 shadow-2xs pointer-events-none">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search clubs, events, project teams, opportunities...</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
              Live Preview
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center" aria-hidden="true">
              AM
            </div>
          </div>
        </div>

        {/* Dashboard Shell Inner Content */}
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome back, Alex</h2>
              <p className="text-xs sm:text-sm text-slate-600">Computer Science &apos;26 • Campus Activity Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" aria-hidden="true" />
                Campus Active
              </span>
            </div>
          </div>

          {/* Quick Stats Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="interactive-subcard bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Joined Clubs</span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">3</p>
              <p className="text-xs text-blue-700 font-medium mt-0.5">ACM, Robotics, Design Club</p>
            </div>

            <div className="interactive-subcard bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Upcoming Events</span>
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-800" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">2</p>
              <p className="text-xs text-teal-800 font-medium mt-0.5">RSVP confirmed for Hackathon</p>
            </div>

            <div className="interactive-subcard bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Active Teams</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">1</p>
              <p className="text-xs text-indigo-700 font-medium mt-0.5">Autonomous Drone Nav (Lead)</p>
            </div>

            <div className="interactive-subcard bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600">Opportunities</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800" aria-hidden="true">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">12</p>
              <p className="text-xs text-amber-800 font-medium mt-0.5">4 deadlines this month</p>
            </div>
          </div>

          {/* Activity Split Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Interactive Preview: Upcoming Event & Project Team */}
            <div className="lg:col-span-2 space-y-4">
              {/* Event RSVP Card */}
              <div className="interactive-subcard bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-blue-100 text-blue-800 tracking-wider">
                        Hackathon • Registered
                      </span>
                      <span className="text-xs text-slate-600 font-medium">This Saturday</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                      Annual Campus CodeStorm 2026
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
                      36-hour cross-disciplinary hackathon featuring tracks in AI/ML, CleanTech, and Campus Life Innovations.
                    </p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    RSVP Confirmed
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Turing Hall & Virtual
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      09:00 AM - Oct 25, 05:00 PM
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5 overflow-hidden" aria-hidden="true">
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">JD</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">SK</span>
                      <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">MR</span>
                    </div>
                    <span className="text-slate-700 font-semibold">+142 attending</span>
                  </div>
                </div>
              </div>

              {/* Team Collaboration Preview Card */}
              <div className="interactive-subcard bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-teal-100 text-teal-800 tracking-wider">
                        Project Team
                      </span>
                      <span className="text-xs text-slate-600 font-medium">Robotics & AI Track</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                      Autonomous Campus Rover
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Building a self-driving delivery cart for intra-campus book requests. Currently recruiting computer vision specialists.
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    Open for Members
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Team (3/5):</span>
                    <span className="font-semibold text-slate-800">Alex M. (Lead), Sarah K., David L.</span>
                  </div>
                  <Link
                    to={isAuthenticated ? '/teams' : '/login'}
                    className="text-blue-700 hover:text-blue-800 font-semibold group flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 py-0.5"
                  >
                    <span>Manage Team & Requests (1 pending)</span>
                    <span aria-hidden="true" className="arrow-slide">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Preview: Campus Announcements */}
            <div className="space-y-4">
              <div className="interactive-subcard bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true" />
                    Latest Announcements
                  </h4>
                  <span className="text-xs font-bold text-blue-700 uppercase">Live Feed</span>
                </div>

                <div className="divide-y divide-slate-100 mt-1 space-y-2">
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                        High Priority
                      </span>
                      <span className="text-xs text-slate-500">2h ago</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1">
                      Library 24/7 Schedule for Midterm Examination Week
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      Main library floor 2 and 3 quiet zones will remain open through Sunday midnight with full cafe service.
                    </p>
                  </div>

                  <div className="pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        Academic
                      </span>
                      <span className="text-xs text-slate-500">Yesterday</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1">
                      Spring Research Grant Proposals Now Open
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      Undergraduate research funding up to $2,500 available for STEM and Humanities projects.
                    </p>
                  </div>

                  <div className="pt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        General
                      </span>
                      <span className="text-xs text-slate-500">3d ago</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mt-1">
                      Student Organization Spring Showcase Registration
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      Reserve your club booth in the central quad before Friday 5 PM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Opportunity Spotlight */}
              <div className="interactive-subcard bg-gradient-to-br from-blue-700 to-indigo-800 rounded-xl p-4 text-white shadow-sm">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  Featured Opportunity
                </span>
                <h4 className="text-sm font-bold mt-2 text-white">
                  Summer Software Engineering Intern
                </h4>
                <p className="text-xs text-blue-100 mt-1">
                  Campus Tech Labs • Hybrid • Application deadline April 15
                </p>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-blue-100 font-semibold">Paid Internship</span>
                  <Link
                    to="/opportunities"
                    className="group inline-flex items-center gap-1 text-xs font-bold bg-white hover:bg-slate-100 active:scale-[0.98] text-blue-900 hover:text-blue-950 px-3 py-1.5 rounded-md shadow-2xs hover:shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>View Details</span>
                    <span aria-hidden="true" className="arrow-slide">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  </section>
)
}
