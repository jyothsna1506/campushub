import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { eventApi } from '../../services/eventApi'
import { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { EventResponse } from '../../types'

function formatEventDateTime(dateTimeStr: string): string {
  try {
    const d = new Date(dateTimeStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateTimeStr
  }
}

export default function UpcomingEventsWidget() {
  const { isAuthenticated, token } = useAuth()
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      // Fetch active events from backend
      const data = await eventApi.getActiveEvents()
      // Filter or slice to max 3
      setEvents(data.slice(0, 3))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't load events right now."))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    fetchEvents()
  }, [isAuthenticated, token, fetchEvents])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Widget Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-800" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Upcoming Events</h2>
              <p className="text-xs text-slate-600">Workshops, keynotes, and campus gatherings</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {loading ? '...' : `${events.length} active`}
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading upcoming events">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
                <div className="h-3 w-48 bg-slate-200 rounded" />
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
              onClick={fetchEvents}
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
        {!loading && !error && events.length === 0 && (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              No upcoming events scheduled right now.
            </p>
            <p className="text-xs text-slate-600">
              Check back soon or explore scheduled club activities.
            </p>
            <div className="pt-2">
              <Link
                to="/events"
                className="inline-flex items-center gap-1 bg-teal-800 hover:bg-teal-900 text-white hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <span>Browse Event Calendar</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Event Items List */}
        {!loading && !error && events.length > 0 && (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="interactive-subcard p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    <Link to="/events" className="hover:text-teal-800 hover:underline">
                      {event.title}
                    </Link>
                  </h3>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                    {event.category || 'Campus'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                  <span className="flex items-center gap-1 font-medium">
                    <svg className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatEventDateTime(event.startTime)}
                  </span>
                  {event.venue && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.venue}
                    </span>
                  )}
                  {event.capacity && (
                    <span className="text-slate-500 text-[11px]">
                      Cap: {event.capacity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/events"
          className="group text-xs font-semibold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
        >
          <span>View all events</span>
          <span className="arrow-slide" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
