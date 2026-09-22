import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { announcementApi } from '../../services/announcementApi'
import type { AnnouncementResponse, AnnouncementPriority } from '../../types'

function formatAnnouncementDate(dateStr: string): string {
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
        className: 'bg-rose-50 text-rose-700 border border-rose-200',
      }
    case 'MEDIUM':
      return {
        label: 'Notice',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
      }
    case 'LOW':
    default:
      return {
        label: 'Info',
        className: 'bg-slate-100 text-slate-600 border border-slate-200',
      }
  }
}

export default function AnnouncementsWidget() {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementResponse | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await announcementApi.getActiveAnnouncements()
      setAnnouncements(data.slice(0, 3))
    } catch {
      setError("Couldn't load announcements right now.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  // Escape key closes detail modal and lock body scroll
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700" aria-hidden="true">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Campus Announcements</h2>
            <p className="text-xs text-slate-600">Official university notices, administration updates, and deadlines</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {loading ? '...' : `${announcements.length} latest`}
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading announcements">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-3 w-full max-w-md bg-slate-200 rounded" />
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
            onClick={fetchAnnouncements}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && announcements.length === 0 && (
        <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            No announcements yet.
          </p>
          <p className="text-xs text-slate-600">
            Check back later for important university news and administrative updates.
          </p>
        </div>
      )}

      {/* Announcements List */}
      {!loading && !error && announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((item) => {
            const badge = getPriorityBadge(item.priority)
            return (
              <div
                key={item.id}
                onClick={() => setSelectedAnnouncement(item)}
                className="interactive-subcard p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/20 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedAnnouncement(item)
                  }
                }}
                aria-label={`View announcement: ${item.title}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.category || 'General'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {formatAnnouncementDate(item.createdAt)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Posted by: <strong className="text-slate-700 font-semibold">{item.authorName || 'Campus Administration'}</strong>
                  </span>
                  <span className="text-blue-700 group-hover:underline font-medium inline-flex items-center gap-1">
                    <span>Read notice</span>
                    <span className="arrow-slide" aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Widget Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to="/announcements"
          className="group text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
        >
          <span>View all announcements</span>
          <span className="arrow-slide" aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Details Modal */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dash-announcement-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAnnouncement(null)
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {selectedAnnouncement.category || 'General'}
                </span>
                <h3 id="dash-announcement-title" className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedAnnouncement.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Posted by {selectedAnnouncement.authorName || 'Campus Administration'} on{' '}
                  {formatAnnouncementDate(selectedAnnouncement.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close announcement"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/announcements"
                onClick={() => setSelectedAnnouncement(null)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                Go to Announcements Board →
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
