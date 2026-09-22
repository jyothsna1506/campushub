import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { clubApi } from '../../services/clubApi'
import { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { ClubMemberResponse } from '../../types'

function formatJoinedDate(dateStr?: string): string {
  if (!dateStr) return 'Active Member'
  try {
    const d = new Date(dateStr)
    return `Joined ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  } catch {
    return 'Active Member'
  }
}

export default function MyClubsWidget() {
  const { isAuthenticated, token } = useAuth()
  const [clubs, setClubs] = useState<ClubMemberResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClubs = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await clubApi.getMyClubs()
      setClubs(data.slice(0, 3))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't load clubs right now."))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    fetchClubs()
  }, [isAuthenticated, token, fetchClubs])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Widget Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">My Clubs</h2>
              <p className="text-xs text-slate-600">Student organizations you belong to</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {loading ? '...' : `${clubs.length} joined`}
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading your clubs">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-12 bg-slate-200 rounded" />
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
              onClick={fetchClubs}
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
        {!loading && !error && clubs.length === 0 && (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              You haven&apos;t joined any clubs yet.
            </p>
            <p className="text-xs text-slate-600">
              Discover engineering societies, arts communities, and sports leagues.
            </p>
            <div className="pt-2">
              <Link
                to="/clubs"
                className="inline-flex items-center gap-1 bg-blue-700 hover:bg-blue-800 text-white hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span>Discover Clubs</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Clubs Items List */}
        {!loading && !error && clubs.length > 0 && (
          <div className="space-y-3">
            {clubs.map((club) => (
              <div
                key={club.membershipId}
                className="interactive-subcard p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                    {club.clubName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      <Link to="/clubs" className="hover:text-blue-700 hover:underline">
                        {club.clubName}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatJoinedDate(club.joinedAt)}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Member
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/clubs"
          className="group text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
        >
          <span>View all clubs</span>
          <span className="arrow-slide" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
