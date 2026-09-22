import { useState, useEffect, useCallback, useMemo } from 'react'
import { clubApi } from '../services/clubApi'
import { getApiErrorMessage } from '../services/api'
import type { ClubResponse } from '../types'

interface FeedbackBanner {
  type: 'success' | 'error'
  message: string
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubResponse[]>([])
  const [joinedClubIds, setJoinedClubIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null)

  const fetchClubsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch active clubs and user memberships concurrently
      const [activeClubs, myMemberships] = await Promise.all([
        clubApi.getActiveClubs(),
        clubApi.getMyClubs().catch(() => []), // Gracefully handle unauthenticated/error
      ])

      setClubs(activeClubs)
      const joinedIds = new Set<number>(myMemberships.map((m) => m.clubId))
      setJoinedClubIds(joinedIds)
    } catch {
      setError("Couldn't load clubs right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClubsData()
  }, [fetchClubsData])

  // Derive distinct categories and departments from loaded club data
  const categories = useMemo(() => {
    const set = new Set<string>()
    clubs.forEach((c) => {
      if (c.category && c.category.trim()) set.add(c.category.trim())
    })
    return Array.from(set).sort()
  }, [clubs])

  const departments = useMemo(() => {
    const set = new Set<string>()
    clubs.forEach((c) => {
      if (c.department && c.department.trim()) set.add(c.department.trim())
    })
    return Array.from(set).sort()
  }, [clubs])

  // Filter clubs based on search and selected dropdowns
  const filteredClubs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return clubs.filter((club) => {
      const matchesSearch =
        !q ||
        club.name.toLowerCase().includes(q) ||
        (club.description && club.description.toLowerCase().includes(q)) ||
        (club.category && club.category.toLowerCase().includes(q)) ||
        (club.department && club.department.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === 'all' || club.category === selectedCategory

      const matchesDepartment =
        selectedDepartment === 'all' || club.department === selectedDepartment

      return matchesSearch && matchesCategory && matchesDepartment
    })
  }, [clubs, searchQuery, selectedCategory, selectedDepartment])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDepartment('all')
  }

  const handleJoinClub = async (club: ClubResponse) => {
    setActionLoadingId(club.id)
    setFeedback(null)
    try {
      await clubApi.joinClub(club.id)
      setJoinedClubIds((prev) => new Set(prev).add(club.id))
      setFeedback({
        type: 'success',
        message: `You've joined ${club.name}!`,
      })
    } catch (err: unknown) {
      // If already a member (duplicate 409), update state gracefully
      setJoinedClubIds((prev) => new Set(prev).add(club.id))
      const msg = getApiErrorMessage(err, `Unable to join ${club.name}.`)
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleLeaveClub = async (club: ClubResponse) => {
    setActionLoadingId(club.id)
    setFeedback(null)
    try {
      await clubApi.leaveClub(club.id)
      setJoinedClubIds((prev) => {
        const next = new Set(prev)
        next.delete(club.id)
        return next
      })
      setFeedback({
        type: 'success',
        message: `You have left ${club.name}.`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, `Unable to leave ${club.name}.`)
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
      {/* 1. Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Clubs & Communities
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Discover student communities, cultural societies, and technical chapters across your campus.
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
            aria-label="Dismiss feedback message"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="search-clubs" className="sr-only">
            Search clubs
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search-clubs"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs by name, category, or department..."
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
        <div className="w-full sm:w-48">
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

        {/* Department Filter */}
        <div className="w-full sm:w-56">
          <label htmlFor="filter-department" className="sr-only">
            Filter by Department
          </label>
          <select
            id="filter-department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
          >
            <option value="all">All departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Loading State (Polished Skeleton Cards) */}
      {loading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          aria-busy="true"
          aria-label="Loading student clubs"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs animate-pulse space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200" />
                  <div className="w-16 h-5 rounded-full bg-slate-200" />
                </div>
                <div className="w-3/4 h-5 rounded bg-slate-200" />
                <div className="w-1/2 h-3.5 rounded bg-slate-200" />
                <div className="space-y-1.5 pt-2">
                  <div className="w-full h-3.5 rounded bg-slate-100" />
                  <div className="w-5/6 h-3.5 rounded bg-slate-100" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="w-20 h-3 rounded bg-slate-200" />
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
              Please check your connection and try loading the clubs directory again.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchClubsData}
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
      {!loading && !error && clubs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            🏛️
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">No clubs available right now.</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Check back later for active student organizations registered on campus.
          </p>
        </div>
      )}

      {!loading && !error && clubs.length > 0 && filteredClubs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            🔍
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">No clubs match your search.</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Try adjusting your keywords or clearing selected filters to explore available communities.
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

      {/* 6. Clubs Grid */}
      {!loading && !error && filteredClubs.length > 0 && (
        <div>
          <div className="flex items-center justify-between pb-3 text-xs text-slate-500">
            <span>
              Showing {filteredClubs.length} of {clubs.length} communities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredClubs.map((club) => {
              const isJoined = joinedClubIds.has(club.id)
              const isActionLoading = actionLoadingId === club.id

              return (
                <div
                  key={club.id}
                  className="interactive-subcard bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Card Top: Initials Icon & Category Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs"
                        aria-hidden="true"
                      >
                        {club.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {club.category || 'General'}
                      </span>
                    </div>

                    {/* Club Title & Department */}
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                        {club.name}
                      </h2>
                      {club.department && (
                        <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
                          {club.department}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {club.description || 'Dedicated campus community encouraging student engagement and collaboration.'}
                    </p>
                  </div>

                  {/* Card Bottom: Coordinator, Status & Membership Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      {club.coordinatorName ? (
                        <span className="text-slate-500 line-clamp-1">
                          Coord: <span className="font-semibold text-slate-700">{club.coordinatorName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Student Led</span>
                      )}

                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        <span>Active</span>
                      </span>
                    </div>

                    {/* Primary Action Button */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {isJoined ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span>Joined</span>
                            <span aria-hidden="true">✓</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleLeaveClub(club)}
                            disabled={isActionLoading}
                            className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isActionLoading ? 'Leaving...' : 'Leave Club'}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinClub(club)}
                          disabled={isActionLoading}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isActionLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                              <span>Joining...</span>
                            </>
                          ) : (
                            <span>Join Club</span>
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
