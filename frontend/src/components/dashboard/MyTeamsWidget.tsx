import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { teamApi } from '../../services/teamApi'
import { getApiErrorMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { TeamResponse } from '../../types'

export default function MyTeamsWidget() {
  const { isAuthenticated, token } = useAuth()
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await teamApi.getMyTeams()
      setTeams(data.slice(0, 3))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Couldn't load teams right now."))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    fetchTeams()
  }, [isAuthenticated, token, fetchTeams])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      <div>
        {/* Widget Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700" aria-hidden="true">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">My Teams</h2>
              <p className="text-xs text-slate-600">Course projects and competition groups</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {loading ? '...' : `${teams.length} active`}
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading your teams">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
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
              onClick={fetchTeams}
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
        {!loading && !error && teams.length === 0 && (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">
              You haven&apos;t joined any teams yet.
            </p>
            <p className="text-xs text-slate-600">
              Recruit teammates for hackathons or request to join existing squads.
            </p>
            <div className="pt-2">
              <Link
                to="/teams"
                className="inline-flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 text-white hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <span>Find Project Teams</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Teams List */}
        {!loading && !error && teams.length > 0 && (
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="interactive-subcard p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    to="/teams"
                    className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-700 transition-colors line-clamp-1"
                  >
                    {team.name}
                  </Link>
                  <span
                    className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      team.openForMembers
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {team.openForMembers ? 'Recruiting' : 'Roster Full'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span className="font-medium text-slate-700">
                    {team.category || 'General'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Owner: {team.ownerName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/teams"
          className="group text-xs font-semibold text-indigo-700 hover:text-indigo-800 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
        >
          <span>View all teams</span>
          <span className="arrow-slide" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
