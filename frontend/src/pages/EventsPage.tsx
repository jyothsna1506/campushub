import { useState, useEffect, useCallback, useMemo } from 'react'
import { eventApi } from '../services/eventApi'
import { getApiErrorMessage } from '../services/api'
import type { EventResponse } from '../types'

interface FeedbackBanner {
  type: 'success' | 'error'
  message: string
}

function formatEventDate(dateStr: string): { month: string; day: string; fullDate: string } {
  try {
    const d = new Date(dateStr)
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const day = d.toLocaleDateString('en-US', { day: 'numeric' })
    const fullDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return { month, day, fullDate }
  } catch {
    return { month: 'EVT', day: '--', fullDate: dateStr }
  }
}

function formatEventTime(startStr: string, endStr: string): string {
  try {
    const start = new Date(startStr)
    const end = new Date(endStr)
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${startTime} – ${endTime}`
  } catch {
    return 'Schedule TBA'
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [rsvpedEventIds, setRsvpedEventIds] = useState<Set<number>>(new Set())
  const [attendeeCounts, setAttendeeCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Action status
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null)

  const fetchEventsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch active events & user's RSVP'd events concurrently
      const [activeEvents, myRsvps] = await Promise.all([
        eventApi.getActiveEvents(),
        eventApi.getMyEvents().catch(() => []),
      ])

      // Sort chronologically by startTime
      const sortedEvents = [...activeEvents].sort((a, b) => {
        const timeA = new Date(a.startTime).getTime()
        const timeB = new Date(b.startTime).getTime()
        return timeA - timeB
      })

      setEvents(sortedEvents)
      const myIds = new Set<number>(myRsvps.map((r) => r.eventId))
      setRsvpedEventIds(myIds)

      // 2. Fetch attendee counts for active events
      const attendeeResults = await Promise.allSettled(
        sortedEvents.map((evt) => eventApi.getEventAttendees(evt.id))
      )

      const counts: Record<number, number> = {}
      attendeeResults.forEach((result, idx) => {
        const evtId = sortedEvents[idx].id
        if (result.status === 'fulfilled') {
          counts[evtId] = result.value.length
        } else {
          counts[evtId] = 0
        }
      })
      setAttendeeCounts(counts)
    } catch {
      setError("Couldn't load events right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEventsData()
  }, [fetchEventsData])

  // Derive available categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>()
    events.forEach((e) => {
      if (e.category && e.category.trim()) set.add(e.category.trim())
    })
    return Array.from(set).sort()
  }, [events])

  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return events.filter((evt) => {
      const matchesSearch =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        (evt.description && evt.description.toLowerCase().includes(q)) ||
        (evt.category && evt.category.toLowerCase().includes(q)) ||
        (evt.venue && evt.venue.toLowerCase().includes(q)) ||
        (evt.organizerName && evt.organizerName.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === 'all' || evt.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [events, searchQuery, selectedCategory])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  const handleRsvp = async (event: EventResponse) => {
    const currentCount = attendeeCounts[event.id] ?? 0
    if (currentCount >= event.capacity) {
      setFeedback({
        type: 'error',
        message: 'This event has reached capacity.',
      })
      return
    }

    setActionLoadingId(event.id)
    setFeedback(null)
    try {
      await eventApi.rsvpEvent(event.id)
      setRsvpedEventIds((prev) => new Set(prev).add(event.id))
      setAttendeeCounts((prev) => ({
        ...prev,
        [event.id]: (prev[event.id] ?? 0) + 1,
      }))
      setFeedback({
        type: 'success',
        message: `You're going to ${event.title}!`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, `Unable to RSVP for ${event.title}.`)
      if (msg.toLowerCase().includes('capacity')) {
        setFeedback({
          type: 'error',
          message: 'This event has reached capacity.',
        })
      } else {
        setFeedback({
          type: 'error',
          message: msg,
        })
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelRsvp = async (event: EventResponse) => {
    setActionLoadingId(event.id)
    setFeedback(null)
    try {
      await eventApi.cancelRsvp(event.id)
      setRsvpedEventIds((prev) => {
        const next = new Set(prev)
        next.delete(event.id)
        return next
      })
      setAttendeeCounts((prev) => ({
        ...prev,
        [event.id]: Math.max(0, (prev[event.id] ?? 1) - 1),
      }))
      setFeedback({
        type: 'success',
        message: `RSVP cancelled for ${event.title}.`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, `Unable to cancel RSVP for ${event.title}.`)
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Page Header (NO + Post Event button for normal students) */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Campus Events
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Discover hackathons, workshops, guest lectures, and campus gatherings.
        </p>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-2xs border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="font-bold">
              {feedback.type === 'success' ? '✓' : '!'}
            </span>
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 p-1 rounded transition-opacity"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Search & Category Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="search-events" className="sr-only">
            Search events
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search-events"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, venue, or organizer..."
            className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search text"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-56">
          <label htmlFor="filter-category" className="sr-only">
            Filter by Category
          </label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Loading State (6 Skeleton Cards) */}
      {loading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          aria-busy="true"
          aria-label="Loading campus events"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs animate-pulse space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-14 rounded-xl bg-slate-200" />
                  <div className="w-16 h-5 rounded-full bg-slate-200" />
                </div>
                <div className="w-3/4 h-5 rounded bg-slate-200" />
                <div className="w-1/2 h-3.5 rounded bg-slate-200" />
                <div className="space-y-1.5 pt-2">
                  <div className="w-full h-3 rounded bg-slate-100" />
                  <div className="w-4/5 h-3 rounded bg-slate-100" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="w-24 h-4 rounded bg-slate-200" />
                <div className="w-20 h-7 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Error State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            !
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{error}</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Please check your connection and try loading the events calendar again.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchEventsData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try again</span>
          </button>
        </div>
      )}

      {/* 5. Empty States */}
      {!loading && !error && events.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            📅
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">No upcoming events yet.</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Check back later for new workshops, gatherings, and campus activities.
          </p>
        </div>
      )}

      {!loading && !error && events.length > 0 && filteredEvents.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            🔍
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">No events match your search.</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Try adjusting your search terms or clearing selected categories to find campus gatherings.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          >
            <span>Clear filters</span>
          </button>
        </div>
      )}

      {/* 6. Events Grid */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-3 text-xs text-slate-500">
            <span>
              Showing {filteredEvents.length} of {events.length} upcoming events
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredEvents.map((event) => {
              const dateObj = formatEventDate(event.startTime)
              const timeRange = formatEventTime(event.startTime, event.endTime)
              const isRsvped = rsvpedEventIds.has(event.id)
              const attendeeCount = attendeeCounts[event.id] ?? 0
              const isFull = !isRsvped && attendeeCount >= event.capacity
              const isActionLoading = actionLoadingId === event.id

              return (
                <div
                  key={event.id}
                  className="interactive-subcard bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Date Tile & Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 font-bold shrink-0 shadow-2xs"
                        aria-hidden="true"
                      >
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600">
                          {dateObj.month}
                        </span>
                        <span className="text-lg leading-tight text-blue-900">
                          {dateObj.day}
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                        {event.category || 'General'}
                      </span>
                    </div>

                    {/* Event Title & Date */}
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                        {event.title}
                      </h2>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {dateObj.fullDate}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description || 'Join campus peers for an engaging session of learning and networking.'}
                    </p>

                    {/* Venue, Timing & Attendance Metadata */}
                    <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1 font-medium text-slate-700">{event.venue}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{timeRange}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-medium text-slate-700">
                          {attendeeCount} / {event.capacity} attending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Organizer & RSVP Controls */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs text-slate-500 line-clamp-1">
                      Organized by: <span className="font-semibold text-slate-700">{event.organizerName || 'Campus Partner'}</span>
                    </div>

                    {/* RSVP Action State */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {isRsvped ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span>✓ Going</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleCancelRsvp(event)}
                            disabled={isActionLoading}
                            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isActionLoading ? 'Cancelling...' : 'Cancel RSVP'}
                          </button>
                        </div>
                      ) : isFull ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Event Full
                          </span>

                          <button
                            type="button"
                            disabled
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200"
                          >
                            RSVP Closed
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRsvp(event)}
                          disabled={isActionLoading}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isActionLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <span>RSVP</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
