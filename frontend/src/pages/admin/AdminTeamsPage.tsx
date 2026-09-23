import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import type { TeamResponse, TeamMemberResponse, TeamJoinRequestResponse } from '../../types'

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Detail Modal
  const [inspectingTeam, setInspectingTeam] = useState<TeamResponse | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([])
  const [teamRequests, setTeamRequests] = useState<TeamJoinRequestResponse[]>([])
  const [inspectLoading, setInspectLoading] = useState(false)
  const [inspectError, setInspectError] = useState<string | null>(null)

  // Delete Modal
  const [deletingTeam, setDeletingTeam] = useState<TeamResponse | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getTeams()
      setTeams(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch teams'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const handleInspectTeam = async (team: TeamResponse) => {
    setInspectingTeam(team)
    setInspectLoading(true)
    setInspectError(null)
    try {
      const [members, requests] = await Promise.all([
        adminApi.getTeamMembers(team.id),
        adminApi.getTeamRequests(team.id),
      ])
      setTeamMembers(members)
      setTeamRequests(requests)
    } catch (err) {
      setInspectError(getApiErrorMessage(err, 'Failed to load team audit details'))
    } finally {
      setInspectLoading(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return
    setDeleteSubmitting(true)
    try {
      await adminApi.deleteTeam(deletingTeam.id)
      setTeams((prev) => prev.filter((t) => t.id !== deletingTeam.id))
      setActionSuccess(`Disbanded team "${deletingTeam.name}"`)
      setDeletingTeam(null)
      if (inspectingTeam?.id === deletingTeam.id) {
        setInspectingTeam(null)
      }
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete team'))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Moderation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit student project teams, inspect squad rosters, and remove spam or dormant groups.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="font-medium">{actionSuccess}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-4">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={loadTeams}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative">
          <svg
            className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by squad name, category, or owner..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">No project teams matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {team.category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                    team.openForMembers ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {team.openForMembers ? 'Recruiting' : 'Closed'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{team.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{team.description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p><span className="text-slate-400">Squad Leader:</span> {team.ownerName}</p>
                  <p><span className="text-slate-400">Created:</span> {new Date(team.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleInspectTeam(team)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-600 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Audit Roster
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingTeam(team)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-600 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  Disband
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setInspectingTeam(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Team Roster Audit</span>
                <h3 className="text-lg font-bold text-slate-900">{inspectingTeam.name}</h3>
                <p className="text-xs text-slate-500">
                  Leader: {inspectingTeam.ownerName} &bull; Category: {inspectingTeam.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingTeam(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {inspectError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {inspectError}
              </div>
            )}

            {inspectLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Members Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Enrolled Members ({teamMembers.length})
                  </h4>
                  {teamMembers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No registered members found.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {teamMembers.map((m) => (
                        <div key={m.membershipId} className="px-4 py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{m.userFullName}</span>
                          <span className="text-slate-400">
                            Joined {new Date(m.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Join Requests Section */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Join Requests ({teamRequests.length})
                  </h4>
                  {teamRequests.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No join requests on record.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {teamRequests.map((r) => (
                        <div key={r.requestId} className="px-4 py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800">{r.userFullName}</span>
                            <span className="text-slate-400 block text-[11px]">
                              Requested {new Date(r.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectingTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !deleteSubmitting && setDeletingTeam(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Disband Team?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">{deletingTeam.name}</span>? All member enrollments and join requests will be permanently purged.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {deleteSubmitting ? 'Disbanding...' : 'Disband Team'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
