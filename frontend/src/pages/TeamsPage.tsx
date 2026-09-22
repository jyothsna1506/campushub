import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { teamApi } from '../services/teamApi'
import { getApiErrorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type {
  TeamResponse,
  TeamRequest,
  TeamMemberResponse,
  TeamJoinRequestResponse,
} from '../types'

interface FeedbackBanner {
  type: 'success' | 'error'
  message: string
}

const PREDEFINED_CATEGORIES = [
  'Hackathon',
  'Capstone Project',
  'Research & Lab',
  'Web & Mobile App',
  'AI & Machine Learning',
  'Design & Creative',
  'Startup & Business',
  'Study Group',
  'Other',
]

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Recently'
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

function getInitials(name: string): string {
  if (!name) return 'TM'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Consistent subtle color pairing for initials avatar
function getAvatarColors(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function TeamsPage() {
  const { user } = useAuth()

  // Tab State
  const [activeTab, setActiveTab] = useState<'discover' | 'my-teams' | 'my-requests'>('discover')

  // Main Data States
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [myOwnedTeams, setMyOwnedTeams] = useState<TeamResponse[]>([])
  const [myRequests, setMyRequests] = useState<TeamJoinRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterRecruitingOnly, setFilterRecruitingOnly] = useState(false)

  // Global Feedback
  const [feedback, setFeedback] = useState<FeedbackBanner | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  // Create Team Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<TeamRequest>({
    name: '',
    description: '',
    category: PREDEFINED_CATEGORIES[0],
    openForMembers: true,
  })
  const [customCategory, setCustomCategory] = useState('')
  const [createErrors, setCreateErrors] = useState<{ name?: string; description?: string }>({})
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)

  // Team Details & Manage Modal State
  const [selectedTeam, setSelectedTeam] = useState<TeamResponse | null>(null)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMemberResponse[]>([])
  const [selectedTeamRequests, setSelectedTeamRequests] = useState<TeamJoinRequestResponse[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [managingRequestId, setManagingRequestId] = useState<number | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)

  // 1. Fetch All Teams, My Teams, and My Requests
  const fetchAllTeamsData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [allTeams, myTeamsData, myReqsData] = await Promise.all([
        teamApi.getTeams(),
        teamApi.getMyTeams().catch(() => [] as TeamResponse[]),
        teamApi.getMyTeamRequests().catch(() => [] as TeamJoinRequestResponse[]),
      ])

      setTeams(allTeams)
      setMyOwnedTeams(myTeamsData)
      setMyRequests(myReqsData)
    } catch {
      setError("Couldn't load teams right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllTeamsData()
  }, [fetchAllTeamsData])

  // Derive sets for user relationship to teams
  const ownedTeamIds = useMemo(() => {
    const ids = new Set<number>()
    myOwnedTeams.forEach((t) => ids.add(t.id))
    if (user?.id) {
      teams.filter((t) => t.ownerId === user.id).forEach((t) => ids.add(t.id))
    }
    return ids
  }, [myOwnedTeams, teams, user])

  const pendingRequestTeamIds = useMemo(() => {
    const ids = new Set<number>()
    myRequests
      .filter((r) => r.status === 'PENDING')
      .forEach((r) => ids.add(r.teamId))
    return ids
  }, [myRequests])

  const acceptedRequestTeamIds = useMemo(() => {
    const ids = new Set<number>()
    myRequests
      .filter((r) => r.status === 'ACCEPTED')
      .forEach((r) => ids.add(r.teamId))
    return ids
  }, [myRequests])

  // All teams joined or owned by the student
  const combinedMyTeams = useMemo(() => {
    const map = new Map<number, TeamResponse>()
    // Add owned teams
    myOwnedTeams.forEach((t) => map.set(t.id, t))
    teams.forEach((t) => {
      if (ownedTeamIds.has(t.id) || acceptedRequestTeamIds.has(t.id)) {
        map.set(t.id, t)
      }
    })
    return Array.from(map.values())
  }, [myOwnedTeams, teams, ownedTeamIds, acceptedRequestTeamIds])

  // Distinct categories from available teams
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    PREDEFINED_CATEGORIES.forEach((c) => set.add(c))
    teams.forEach((t) => {
      if (t.category && t.category.trim()) set.add(t.category.trim())
    })
    return Array.from(set).sort()
  }, [teams])

  // Filtered Teams for Discover tab
  const filteredDiscoverTeams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return teams.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === 'all' || t.category === selectedCategory

      const matchesRecruiting = !filterRecruitingOnly || t.openForMembers

      return matchesSearch && matchesCategory && matchesRecruiting
    })
  }, [teams, searchQuery, selectedCategory, filterRecruitingOnly])

  // Filtered Teams for My Teams tab
  const filteredMyTeams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return combinedMyTeams.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === 'all' || t.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [combinedMyTeams, searchQuery, selectedCategory])

  // Keyboard navigation & body scroll lock for modals (Escape key closes)
  useEffect(() => {
    if (!selectedTeam && !isCreateModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTeam) setSelectedTeam(null)
        if (isCreateModalOpen) setIsCreateModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedTeam, isCreateModalOpen])

  // Open Details Modal & Load Members + Join Requests
  const handleOpenTeamDetails = async (team: TeamResponse) => {
    setSelectedTeam(team)
    setIsLoadingDetails(true)
    setSelectedTeamMembers([])
    setSelectedTeamRequests([])

    const isOwner = ownedTeamIds.has(team.id)

    try {
      const membersPromise = teamApi.getTeamMembers(team.id).catch(() => [] as TeamMemberResponse[])
      const requestsPromise = isOwner
        ? teamApi.getTeamJoinRequests(team.id).catch(() => [] as TeamJoinRequestResponse[])
        : Promise.resolve([] as TeamJoinRequestResponse[])

      const [members, requests] = await Promise.all([membersPromise, requestsPromise])
      setSelectedTeamMembers(members)
      setSelectedTeamRequests(requests)
    } catch {
      // Graceful fallback; modal stays open
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Request to Join Team
  const handleRequestToJoin = async (team: TeamResponse) => {
    setActionLoadingId(team.id)
    setFeedback(null)
    try {
      const newRequest = await teamApi.createTeamJoinRequest(team.id)
      setMyRequests((prev) => [newRequest, ...prev])
      setFeedback({
        type: 'success',
        message: `Your request to join ${team.name} has been sent!`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Couldn't submit your request. Please try again.")
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Cancel User's Join Request
  const handleCancelRequest = async (requestId: number) => {
    setActionLoadingId(requestId)
    setFeedback(null)
    try {
      await teamApi.cancelTeamJoinRequest(requestId)
      setMyRequests((prev) => prev.filter((r) => r.requestId !== requestId))
      setFeedback({
        type: 'success',
        message: 'Join request cancelled successfully.',
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Unable to cancel request.')
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Owner: Accept Join Request
  const handleAcceptRequest = async (requestId: number, applicantName: string) => {
    if (!selectedTeam) return
    setManagingRequestId(requestId)
    try {
      const updatedReq = await teamApi.acceptTeamJoinRequest(requestId)
      // Update requests list
      setSelectedTeamRequests((prev) =>
        prev.map((r) => (r.requestId === requestId ? updatedReq : r))
      )
      // Refresh members list so new member appears immediately
      const refreshedMembers = await teamApi.getTeamMembers(selectedTeam.id).catch(() => selectedTeamMembers)
      setSelectedTeamMembers(refreshedMembers)

      setFeedback({
        type: 'success',
        message: `Accepted ${applicantName}'s request to join ${selectedTeam.name}.`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Couldn't update this request.")
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setManagingRequestId(null)
    }
  }

  // Owner: Reject Join Request
  const handleRejectRequest = async (requestId: number, applicantName: string) => {
    setManagingRequestId(requestId)
    try {
      const updatedReq = await teamApi.rejectTeamJoinRequest(requestId)
      // Update requests list
      setSelectedTeamRequests((prev) =>
        prev.map((r) => (r.requestId === requestId ? updatedReq : r))
      )
      setFeedback({
        type: 'success',
        message: `Declined ${applicantName}'s request.`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Couldn't update this request.")
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setManagingRequestId(null)
    }
  }

  // Create Team Submit
  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { name?: string; description?: string } = {}

    if (!createForm.name.trim()) {
      errors.name = 'Team name is required'
    } else if (createForm.name.trim().length < 3) {
      errors.name = 'Team name must be at least 3 characters'
    }

    if (!createForm.description.trim()) {
      errors.description = 'Please provide a project description'
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }

    setCreateErrors({})
    setIsSubmittingCreate(true)
    setFeedback(null)

    const finalCategory =
      createForm.category === 'Other' && customCategory.trim()
        ? customCategory.trim()
        : createForm.category

    try {
      const payload: TeamRequest = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        category: finalCategory,
        openForMembers: createForm.openForMembers ?? true,
      }

      const newTeam = await teamApi.createTeam(payload)

      // Add to local state
      setTeams((prev) => [newTeam, ...prev])
      setMyOwnedTeams((prev) => [newTeam, ...prev])

      // Close modal and reset form
      setIsCreateModalOpen(false)
      setCreateForm({
        name: '',
        description: '',
        category: PREDEFINED_CATEGORIES[0],
        openForMembers: true,
      })
      setCustomCategory('')

      // Switch to My Teams tab to showcase new team
      setActiveTab('my-teams')
      setFeedback({
        type: 'success',
        message: `"${newTeam.name}" has been created successfully! You are the team owner.`,
      })
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Unable to create team. Please verify details and try again.')
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setFilterRecruitingOnly(false)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Project Teams & Collaboration
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Build your project squad, recruit skilled teammates, or join initiatives across campus.
          </p>
        </div>

        {/* Action: Create Team */}
        <div>
          <button
            type="button"
            onClick={() => {
              setCreateErrors({})
              setIsCreateModalOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-xs transition-all hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer"
          >
            <span className="text-lg leading-none" aria-hidden="true">+</span>
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold text-base" aria-hidden="true">
              {feedback.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'discover'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span aria-hidden="true">🔍</span>
          <span>Discover Teams</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            {teams.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-teams')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'my-teams'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span aria-hidden="true">👥</span>
          <span>My Teams</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            {combinedMyTeams.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-requests')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'my-requests'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span aria-hidden="true">📬</span>
          <span>My Requests</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            {myRequests.length}
          </span>
        </button>
      </div>

      {/* Primary Content by Active Tab */}

      {/* TAB 1: DISCOVER TEAMS */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search, Category Filter, and Recruiting Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="sm:col-span-7 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search teams by project name, description, lead..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="sm:col-span-5">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
                  aria-label="Filter teams by category"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-bar: Recruiting filter toggle & Active filter chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterRecruitingOnly}
                  onChange={(e) => setFilterRecruitingOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-700 border-slate-300 focus:ring-blue-600"
                />
                <span className="font-medium text-slate-700">Show recruiting teams only</span>
              </label>

              {(searchQuery || selectedCategory !== 'all' || filterRecruitingOnly) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-blue-700 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="w-20 h-5 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                  <div className="h-9 bg-slate-200 rounded-xl pt-4" />
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
                <h3 className="text-base font-bold text-slate-900">{error}</h3>
                <p className="text-xs text-slate-500">
                  Please check your connection and try reloading the teams directory.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAllTeamsData}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State: No Teams in Database */}
          {!loading && !error && teams.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-bold text-xl" aria-hidden="true">
                👥
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No teams available yet.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Be the first to start a project squad and recruit teammates across campus!
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreateErrors({})
                    setIsCreateModalOpen(true)
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-xs cursor-pointer"
                >
                  <span>+ Create a Team</span>
                </button>
              </div>
            </div>
          )}

          {/* Empty State: Filter Matched Nothing */}
          {!loading && !error && teams.length > 0 && filteredDiscoverTeams.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3 max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-base" aria-hidden="true">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-900">No teams match your search or filters.</h3>
              <p className="text-xs text-slate-500">
                Try loosening your search keywords or clearing category filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Team Cards Grid */}
          {!loading && !error && filteredDiscoverTeams.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiscoverTeams.map((team) => {
                const isOwner = ownedTeamIds.has(team.id)
                const isMember = acceptedRequestTeamIds.has(team.id)
                const isPending = pendingRequestTeamIds.has(team.id)
                const avatar = getAvatarColors(team.name)

                return (
                  <div
                    key={team.id}
                    className="interactive-subcard bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Card Top */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl ${avatar.bg} ${avatar.text} font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs`}
                          aria-hidden="true"
                        >
                          {getInitials(team.name)}
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {team.category || 'General'}
                          </span>
                          {team.openForMembers ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              Recruiting
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                              Roster Full
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                          {team.name}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isOwner ? (
                            <span className="font-semibold text-blue-700">Led by you (Owner)</span>
                          ) : (
                            <span>Led by {team.ownerName || 'Campus Student'}</span>
                          )}
                        </p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {team.description || 'No detailed description provided for this project squad.'}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenTeamDetails(team)}
                        className="text-xs font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        View Details
                      </button>

                      <div>
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => handleOpenTeamDetails(team)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>Manage Team</span>
                          </button>
                        ) : isMember ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/60">
                            <span>Member ✓</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                            <span>Request Pending ⏳</span>
                          </span>
                        ) : team.openForMembers ? (
                          <button
                            type="button"
                            disabled={actionLoadingId === team.id}
                            onClick={() => handleRequestToJoin(team)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === team.id ? (
                              <span>Sending...</span>
                            ) : (
                              <>
                                <span aria-hidden="true">+</span>
                                <span>Request to Join</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY TEAMS */}
      {activeTab === 'my-teams' && (
        <div className="space-y-6">
          {combinedMyTeams.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-xl" aria-hidden="true">
                🤝
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">You haven't joined any teams yet.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Explore open projects on campus or create a new team to begin recruiting collaborators.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Discover Teams
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateErrors({})
                    setIsCreateModalOpen(true)
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  + Create a Team
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  Your Squads & Memberships ({combinedMyTeams.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyTeams.map((team) => {
                  const isOwner = ownedTeamIds.has(team.id)
                  const avatar = getAvatarColors(team.name)

                  return (
                    <div
                      key={team.id}
                      className="interactive-subcard bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl ${avatar.bg} ${avatar.text} font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs`}
                            aria-hidden="true"
                          >
                            {getInitials(team.name)}
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {team.category || 'General'}
                            </span>
                            {isOwner ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Owner
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                                Member
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-slate-900 line-clamp-1">
                            {team.name}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {isOwner ? 'Created & managed by you' : `Led by ${team.ownerName}`}
                          </p>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {team.description || 'No detailed description provided.'}
                        </p>
                      </div>

                      <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenTeamDetails(team)}
                          className="text-xs font-semibold text-slate-700 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          View Roster
                        </button>

                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => handleOpenTeamDetails(team)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Manage Team
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenTeamDetails(team)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Team Details
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY REQUESTS */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-xl" aria-hidden="true">
                📬
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">You haven't sent any team requests yet.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Browse open project teams and submit join requests to collaborate.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Browse Teams
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Applications & Join Requests ({myRequests.length})
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {myRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 text-base">
                          {req.teamName || `Team #${req.teamId}`}
                        </span>
                        {/* Status Badge */}
                        {req.status === 'PENDING' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Review ⏳
                          </span>
                        )}
                        {req.status === 'ACCEPTED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Accepted ✓
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            Declined
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Requested on {formatDate(req.requestedAt)}
                        {req.respondedAt && ` • Responded ${formatDate(req.respondedAt)}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {req.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === req.requestId}
                          onClick={() => handleCancelRequest(req.requestId)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-medium text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === req.requestId ? 'Canceling...' : 'Cancel Request'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-team-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false)
          }}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="create-team-title" className="text-xl font-bold text-slate-900">
                  Create a Project Team
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Form a team to build capstones, participate in hackathons, or work on campus research.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              {/* Team Name */}
              <div className="space-y-1.5">
                <label htmlFor="team-name" className="block text-xs font-semibold text-slate-700">
                  Team Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                    if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Campus Connect Mobile Squad"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                {createErrors.name && (
                  <p className="text-xs text-rose-600">{createErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="team-category" className="block text-xs font-semibold text-slate-700">
                  Category <span className="text-rose-600">*</span>
                </label>
                <select
                  id="team-category"
                  value={createForm.category}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
                >
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {createForm.category === 'Other' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name..."
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="team-desc" className="block text-xs font-semibold text-slate-700">
                  Description & Goals <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="team-desc"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => {
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                    if (createErrors.description) setCreateErrors((prev) => ({ ...prev, description: undefined }))
                  }}
                  placeholder="Outline what you are building, skill sets needed, and collaboration expectations..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                {createErrors.description && (
                  <p className="text-xs text-rose-600">{createErrors.description}</p>
                )}
              </div>

              {/* Open For Members Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createForm.openForMembers}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, openForMembers: e.target.checked }))
                    }
                    className="w-4 h-4 mt-0.5 rounded text-blue-700 border-slate-300 focus:ring-blue-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-900">
                      Open for member requests (Recruiting)
                    </span>
                    <p className="text-xs text-slate-500">
                      Allow other students to view and request to join your squad.
                    </p>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCreate ? 'Creating Squad...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM DETAILS & ROSTER / OWNER MANAGE MODAL */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-details-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTeam(null)
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {selectedTeam.category || 'General'}
                  </span>
                  {selectedTeam.openForMembers ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      Recruiting
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      Roster Full
                    </span>
                  )}
                  {ownedTeamIds.has(selectedTeam.id) && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Owner
                    </span>
                  )}
                </div>
                <h2 id="team-details-title" className="text-xl sm:text-2xl font-bold text-slate-900">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Led by {selectedTeam.ownerName || 'Campus Student'} • Created {formatDate(selectedTeam.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                About the Project
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedTeam.description || 'No detailed description available.'}
              </p>
            </div>

            {/* Team Members Roster */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Team Members ({selectedTeamMembers.length})
                </h3>
              </div>

              {isLoadingDetails ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              ) : selectedTeamMembers.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No members listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTeamMembers.map((member) => {
                    const isLead = member.userFullName === selectedTeam.ownerName
                    const avatar = getAvatarColors(member.userFullName)
                    return (
                      <div
                        key={member.membershipId}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${avatar.bg} ${avatar.text} font-bold text-xs flex items-center justify-center`}
                          aria-hidden="true"
                        >
                          {getInitials(member.userFullName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {member.userFullName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {isLead ? (
                              <span className="text-blue-700 font-semibold">Team Lead</span>
                            ) : (
                              'Member'
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* OWNER MANAGEMENT: Join Requests */}
            {ownedTeamIds.has(selectedTeam.id) && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Applicant Join Requests ({selectedTeamRequests.length})
                  </h3>
                </div>

                {isLoadingDetails ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                  </div>
                ) : selectedTeamRequests.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                    No join requests received yet.
                  </div>
                ) : (
                  <div className="space-y-2 divide-y divide-slate-100">
                    {selectedTeamRequests.map((req) => (
                      <div
                        key={req.requestId}
                        className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {req.userFullName}
                            </span>
                            {req.status === 'PENDING' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                Pending
                              </span>
                            )}
                            {req.status === 'ACCEPTED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Accepted
                              </span>
                            )}
                            {req.status === 'REJECTED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                                Declined
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Requested {formatDate(req.requestedAt)}
                          </p>
                        </div>

                        {req.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={managingRequestId === req.requestId}
                              onClick={() => handleAcceptRequest(req.requestId, req.userFullName)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {managingRequestId === req.requestId ? '...' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              disabled={managingRequestId === req.requestId}
                              onClick={() => handleRejectRequest(req.requestId, req.userFullName)}
                              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NON-OWNER ACTIONS */}
            {!ownedTeamIds.has(selectedTeam.id) && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {acceptedRequestTeamIds.has(selectedTeam.id) ? (
                  <div className="p-3 w-full rounded-xl bg-teal-50 border border-teal-200 text-center text-xs font-semibold text-teal-800">
                    You are an active member of this project squad.
                  </div>
                ) : pendingRequestTeamIds.has(selectedTeam.id) ? (
                  <div className="p-3 w-full rounded-xl bg-amber-50 border border-amber-200 text-center text-xs font-semibold text-amber-800">
                    Your join request is pending review by the team owner.
                  </div>
                ) : selectedTeam.openForMembers ? (
                  <button
                    type="button"
                    disabled={actionLoadingId === selectedTeam.id}
                    onClick={() => handleRequestToJoin(selectedTeam)}
                    className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === selectedTeam.id ? 'Sending Request...' : 'Request to Join Squad'}
                  </button>
                ) : (
                  <div className="p-3 w-full rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-medium text-slate-500">
                    This squad is currently closed for new member requests.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
