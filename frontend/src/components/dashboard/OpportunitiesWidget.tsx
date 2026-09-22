import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { opportunityApi } from '../../services/opportunityApi'
import { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { OpportunityResponse } from '../../types'

function formatDeadline(deadlineStr: string): { label: string; isUrgent: boolean; isPast: boolean } {
  try {
    const d = new Date(deadlineStr)
    const now = new Date()
    const diffTime = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const formattedDate = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    if (diffDays < 0) {
      return { label: `Closed (${formattedDate})`, isUrgent: false, isPast: true }
    } else if (diffDays === 0) {
      return { label: 'Due today', isUrgent: true, isPast: false }
    } else if (diffDays <= 3) {
      return { label: `Due in ${diffDays}d (${formattedDate})`, isUrgent: true, isPast: false }
    } else if (diffDays <= 7) {
      return { label: `Due in ${diffDays}d`, isUrgent: true, isPast: false }
    } else {
      return { label: `Due ${formattedDate}`, isUrgent: false, isPast: false }
    }
  } catch {
    return { label: deadlineStr, isUrgent: false, isPast: false }
  }
}

export default function OpportunitiesWidget() {
  const { isAuthenticated, token } = useAuth()
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await opportunityApi.getActiveOpportunities()
      setOpportunities(data.slice(0, 3))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't load opportunities right now."))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    fetchOpportunities()
  }, [isAuthenticated, token, fetchOpportunities])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Widget Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Featured Opportunities</h2>
              <p className="text-xs text-slate-600">Internships, research positions, and campus jobs</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {loading ? '...' : `${opportunities.length} open`}
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading opportunities">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-28 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs sm:text-sm text-slate-700 font-medium">{error}</p>
            <button
              type="button"
              onClick={fetchOpportunities}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && opportunities.length === 0 && (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              No opportunities available right now.
            </p>
            <p className="text-xs text-slate-600">
              Check back soon for new research posts, student jobs, and internships.
            </p>
            <div className="pt-2">
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <span>Browse Opportunity Board</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Opportunities List */}
        {!loading && !error && opportunities.length > 0 && (
          <div className="space-y-3">
            {opportunities.map((opp) => {
              const deadline = formatDeadline(opp.applicationDeadline)
              return (
                <div
                  key={opp.id}
                  className="interactive-subcard p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to="/opportunities"
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors line-clamp-1"
                      >
                        {opp.title}
                      </Link>
                      <p className="text-xs font-medium text-slate-600">
                        {opp.organization}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {opp.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      {opp.location ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{opp.location}</span>
                        </>
                      ) : (
                        <span>On Campus / Remote</span>
                      )}
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        deadline.isUrgent
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : deadline.isPast
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {deadline.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100/60 text-xs">
                    <Link
                      to="/opportunities"
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                    >
                      View details →
                    </Link>
                    {opp.applicationUrl && (
                      <a
                        href={opp.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <span>Apply Now</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Widget Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/opportunities"
          className="group text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded px-1"
        >
          <span>View all opportunities</span>
          <span className="arrow-slide" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
