import { useState, useEffect, useCallback, useMemo } from 'react'
import { announcementApi } from '../services/announcementApi'
import type { AnnouncementResponse, AnnouncementPriority } from '../types'

function formatAnnouncementDate(dateStr?: string): string {
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

function getPriorityBadge(priority: AnnouncementPriority) {
  switch (priority) {
    case 'HIGH':
      return {
        label: 'High Priority',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200/80',
        icon: '⚠️',
      }
    case 'MEDIUM':
      return {
        label: 'Important Notice',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200/80',
        icon: '📌',
      }
    case 'LOW':
    default:
      return {
        label: 'General Notice',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: 'ℹ️',
      }
  }
}

export default function AnnouncementsPage() {
  // Main Data States
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  // Details Modal State
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementResponse | null>(null)

  // 1. Fetch Active Announcements from Real API
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await announcementApi.getActiveAnnouncements()
      setAnnouncements(data)
    } catch {
      setError("Couldn't load announcements right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  // Derive distinct categories from loaded announcements
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    announcements.forEach((a) => {
      if (a.category && a.category.trim()) {
        set.add(a.category.trim())
      }
    })
    return Array.from(set).sort()
  }, [announcements])

  // Client-side search and filtering across multiple fields
  const filteredAnnouncements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return announcements.filter((item) => {
      // 1. Search Query Filter (title, content, category, authorName)
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.authorName && item.authorName.toLowerCase().includes(q))

      // 2. Category Filter
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory

      // 3. Priority Filter
      const matchesPriority =
        selectedPriority === 'all' || item.priority === selectedPriority

      return matchesSearch && matchesCategory && matchesPriority
    })
  }, [announcements, searchQuery, selectedCategory, selectedPriority])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedPriority('all')
  }

  // Keyboard accessibility & scroll lock: Escape key dismisses the modal
  useEffect(() => {
    if (!selectedAnnouncement) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAnnouncement(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedAnnouncement])

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Campus Announcements
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Stay updated with important news, notices, opportunities, and campus updates.
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
              placeholder="Search announcements..."
              aria-label="Search announcements"
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

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter announcements by category"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              aria-label="Filter announcements by priority"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Important Notice</option>
              <option value="LOW">General Notice</option>
            </select>
          </div>
        </div>

        {/* Sub-bar: Active filters indicator & Reset button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>
              Showing filtered results ({filteredAnnouncements.length} of {announcements.length})
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

      {/* Loading Skeleton Cards */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 animate-pulse shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
                <div className="w-24 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-4/5" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
              <div className="h-8 bg-slate-100 rounded-xl pt-3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-lg" aria-hidden="true">
            ⚠️
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">{error}</h2>
            <p className="text-xs text-slate-500">
              Please check your connection and try loading the bulletin again.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAnnouncements}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State: No Announcements at all in Database */}
      {!loading && !error && announcements.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 mx-auto flex items-center justify-center font-bold text-xl" aria-hidden="true">
            📢
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">No announcements yet.</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Check back later for campus updates.
            </p>
          </div>
        </div>
      )}

      {/* Empty State: Filter Matched Nothing */}
      {!loading && !error && announcements.length > 0 && filteredAnnouncements.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3 max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center font-bold text-base" aria-hidden="true">
            🔍
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">No announcements match your filters.</h2>
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

      {/* Announcements Grid */}
      {!loading && !error && filteredAnnouncements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((item) => {
            const badge = getPriorityBadge(item.priority)

            return (
              <div
                key={item.id}
                className="interactive-subcard bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Category & Priority Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 truncate max-w-[140px]">
                      {item.category || 'Campus Notice'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span aria-hidden="true">{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    onClick={() => setSelectedAnnouncement(item)}
                    className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h2>

                  {/* Author & Date Metadata */}
                  <p className="text-xs text-slate-500">
                    Posted by{' '}
                    <span className="font-semibold text-slate-700">
                      {item.authorName || 'Campus Administration'}
                    </span>{' '}
                    • {formatAnnouncementDate(item.createdAt)}
                  </p>

                  {/* Content Excerpt */}
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {item.content}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(item)}
                    className="group text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                  >
                    <span>Read More</span>
                    <span className="arrow-slide" aria-hidden="true">→</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Official Notice
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ANNOUNCEMENT DETAILS MODAL */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="announcement-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAnnouncement(null)
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 shadow-xl space-y-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {selectedAnnouncement.category || 'Campus Notice'}
                  </span>
                  {(() => {
                    const b = getPriorityBadge(selectedAnnouncement.priority)
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${b.bg} ${b.text} ${b.border}`}
                      >
                        <span aria-hidden="true">{b.icon}</span>
                        <span>{b.label}</span>
                      </span>
                    )
                  })()}
                </div>
                <h2 id="announcement-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {selectedAnnouncement.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Published by{' '}
                  <span className="font-semibold text-slate-700">
                    {selectedAnnouncement.authorName || 'Campus Administration'}
                  </span>{' '}
                  on {formatAnnouncementDate(selectedAnnouncement.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Announcement Full Content */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Notice Details
              </h3>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
