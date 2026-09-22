import { useState, useEffect, useCallback, useMemo } from 'react'
import { opportunityApi } from '../services/opportunityApi'
import type { OpportunityResponse } from '../types'

function formatOpportunityDate(dateStr?: string): string {
  if (!dateStr) return 'TBA'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

interface DeadlineInfo {
  label: string
  isUrgent: boolean
  isPast: boolean
}

function getDeadlineInfo(deadlineStr?: string): DeadlineInfo {
  if (!deadlineStr) return { label: 'Rolling Admission', isUrgent: false, isPast: false }

  try {
    const deadline = new Date(deadlineStr)
    const now = new Date()
    const diffMs = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    const formattedDate = deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    if (diffDays < 0) {
      return {
        label: `Deadline passed (${formattedDate})`,
        isUrgent: false,
        isPast: true,
      }
    }

    if (diffDays <= 7) {
      return {
        label: `Closing soon • Apply by ${formattedDate}`,
        isUrgent: true,
        isPast: false,
      }
    }

    return {
      label: `Apply by ${formattedDate}`,
      isUrgent: false,
      isPast: false,
    }
  } catch {
    return { label: `Apply by ${deadlineStr}`, isUrgent: false, isPast: false }
  }
}

function getOrgInitials(name?: string): string {
  if (!name || !name.trim()) return 'OP'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')

  // Details Modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityResponse | null>(null)

  // 1. Fetch Active Opportunities from Backend
  const fetchOpportunities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await opportunityApi.getActiveOpportunities()
      setOpportunities(data)
    } catch {
      setError("Couldn't load opportunities right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Extract distinct types from loaded data
  const availableTypes = useMemo(() => {
    const set = new Set<string>()
    opportunities.forEach((item) => {
      if (item.type && item.type.trim()) set.add(item.type.trim())
    })
    return Array.from(set).sort()
  }, [opportunities])

  // Extract distinct locations from loaded data
  const availableLocations = useMemo(() => {
    const set = new Set<string>()
    opportunities.forEach((item) => {
      if (item.location && item.location.trim()) set.add(item.location.trim())
    })
    return Array.from(set).sort()
  }, [opportunities])

  // Client-side search and filtering
  const filteredOpportunities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return opportunities.filter((item) => {
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.organization && item.organization.toLowerCase().includes(q)) ||
        (item.type && item.type.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q))

      const matchesType =
        selectedType === 'all' || item.type === selectedType

      const matchesLocation =
        selectedLocation === 'all' || item.location === selectedLocation

      return matchesSearch && matchesType && matchesLocation
    })
  }, [opportunities, searchQuery, selectedType, selectedLocation])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'all' ||
    selectedLocation !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedLocation('all')
  }

  // Keyboard accessibility & scroll lock: Escape key dismisses the modal
  useEffect(() => {
    if (!selectedOpportunity) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOpportunity(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedOpportunity])

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Opportunities
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Discover internships, hackathons, programs, and opportunities to grow your career.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities..."
              aria-label="Search opportunities"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dynamic Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by opportunity type"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Location Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              aria-label="Filter by location"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-bar: Active filter chips & Reset button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>
              Showing filtered results ({filteredOpportunities.length} of {opportunities.length})
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-700 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 animate-pulse shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-4/5" />
              <div className="h-4 bg-slate-100 rounded w-2/5" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
              <div className="h-9 bg-slate-100 rounded-xl pt-3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            ⚠️
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">{error}</h2>
            <p className="text-xs text-slate-500">
              Please check your connection and try loading the opportunities directory again.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchOpportunities}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State: No opportunities at all */}
      {!loading && !error && opportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-700 mx-auto flex items-center justify-center font-bold text-xl" aria-hidden="true">
            💼
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">No opportunities available yet.</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Check back later for new internships, programs, and opportunities.
            </p>
          </div>
        </div>
      )}

      {/* Empty State: Filter matched nothing */}
      {!loading && !error && opportunities.length > 0 && filteredOpportunities.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3 max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-base" aria-hidden="true">
            🔍
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">No opportunities match your filters.</h2>
            <p className="text-xs text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Opportunities Grid */}
      {!loading && !error && filteredOpportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((item) => {
            const deadline = getDeadlineInfo(item.applicationDeadline)
            const initials = getOrgInitials(item.organization)

            return (
              <div
                key={item.id}
                className="interactive-subcard bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header: Org Badge & Type Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-100 flex-shrink-0 shadow-2xs"
                        aria-hidden="true"
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500 truncate">
                          {item.organization || 'Campus Partner'}
                        </p>
                        {item.location && (
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <span aria-hidden="true">📍</span>
                            <span>{item.location}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100/80 flex-shrink-0">
                      {item.type || 'Program'}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2
                      onClick={() => setSelectedOpportunity(item)}
                      className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {item.title}
                    </h2>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Dates: Deadline & Posted Date */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Deadline:</span>
                      <span
                        className={`font-semibold ${
                          deadline.isUrgent
                            ? 'text-amber-700'
                            : deadline.isPast
                            ? 'text-slate-400'
                            : 'text-slate-700'
                        }`}
                      >
                        {deadline.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Posted:</span>
                      <span>{formatOpportunityDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: View Opportunity & Apply Now */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOpportunity(item)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    View Opportunity
                  </button>

                  {item.applicationUrl ? (
                    <a
                      href={item.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <span>Apply Now</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunity(item)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <span>Details</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* OPPORTUNITY DETAILS MODAL */}
      {selectedOpportunity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opportunity-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOpportunity(null)
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Top */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                    {selectedOpportunity.organization || 'Campus Partner'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedOpportunity.type || 'Opportunity'}
                  </span>
                  {selectedOpportunity.location && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      📍 {selectedOpportunity.location}
                    </span>
                  )}
                </div>

                <h2 id="opportunity-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {selectedOpportunity.title}
                </h2>

                <p className="text-xs text-slate-500">
                  Posted by {selectedOpportunity.postedByName || 'Campus Coordinator'} on{' '}
                  {formatOpportunityDate(selectedOpportunity.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Deadline Banner */}
            {(() => {
              const deadline = getDeadlineInfo(selectedOpportunity.applicationDeadline)
              return (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                    deadline.isUrgent
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : deadline.isPast
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <span className="font-semibold">
                    {deadline.isUrgent ? '⏳ ' : '📅 '}
                    Application Deadline: {formatOpportunityDate(selectedOpportunity.applicationDeadline)}
                  </span>
                  <span className="font-medium">{deadline.label}</span>
                </div>
              )
            })()}

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Opportunity Description & Requirements
              </h3>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedOpportunity.description}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedOpportunity.applicationUrl && (
                <a
                  href={selectedOpportunity.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Apply Now</span>
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
