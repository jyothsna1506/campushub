import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { adminApi } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import type { OpportunityResponse, OpportunityRequest } from '../../types'

const TYPES = [
  'Internship',
  'Full-Time Job',
  'Research Assistantship',
  'Scholarship',
  'Fellowship',
  'Competition',
  'Part-Time Job',
  'Other',
]

const INITIAL_FORM: OpportunityRequest = {
  title: '',
  description: '',
  organization: '',
  type: 'Internship',
  location: 'Hybrid / Campus',
  applicationUrl: '',
  applicationDeadline: '',
}

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<OpportunityResponse | null>(null)
  const [formData, setFormData] = useState<OpportunityRequest>(INITIAL_FORM)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete modal
  const [deletingOpportunity, setDeletingOpportunity] = useState<OpportunityResponse | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const loadOpportunities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getOpportunities()
      setOpportunities(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch opportunities'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOpportunities()
  }, [loadOpportunities])

  const openCreateModal = () => {
    setEditingOpportunity(null)
    // Default deadline to 14 days in future
    const d = new Date()
    d.setDate(d.getDate() + 14)
    const deadlineIso = d.toISOString().slice(0, 10)

    setFormData({
      ...INITIAL_FORM,
      applicationDeadline: deadlineIso,
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (opp: OpportunityResponse) => {
    setEditingOpportunity(opp)
    setFormData({
      title: opp.title,
      description: opp.description,
      organization: opp.organization,
      type: opp.type,
      location: opp.location || '',
      applicationUrl: opp.applicationUrl || '',
      applicationDeadline: opp.applicationDeadline ? opp.applicationDeadline.slice(0, 10) : '',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError(null)

    try {
      if (editingOpportunity) {
        const updated = await adminApi.updateOpportunity(editingOpportunity.id, formData)
        setOpportunities((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
        setActionSuccess(`Updated opportunity "${updated.title}"`)
      } else {
        const created = await adminApi.createOpportunity(formData)
        setOpportunities((prev) => [created, ...prev])
        setActionSuccess(`Posted opportunity "${created.title}"`)
      }
      setIsModalOpen(false)
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save opportunity'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingOpportunity) return
    setDeleteSubmitting(true)
    try {
      await adminApi.deleteOpportunity(deletingOpportunity.id)
      setOpportunities((prev) => prev.filter((o) => o.id !== deletingOpportunity.id))
      setActionSuccess(`Deleted opportunity "${deletingOpportunity.title}"`)
      setDeletingOpportunity(null)
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete opportunity'))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const filtered = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.organization.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' || o.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Career & Research Opportunities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage industry internships, research grants, lab openings, and scholarships.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Opportunity</span>
        </button>
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
            onClick={loadOpportunities}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Type Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
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
            placeholder="Search by role, company/lab, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
        >
          <option value="ALL">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">No opportunities match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {opp.type}
                  </span>
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Due: {new Date(opp.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{opp.title}</h3>
                <p className="text-xs font-semibold text-blue-700">{opp.organization}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{opp.description}</p>
                {opp.location && (
                  <p className="text-xs text-slate-400 mt-2">📍 {opp.location}</p>
                )}
              </div>

              <div className="pt-4 mt-3 flex items-center justify-between border-t border-slate-100">
                <a
                  href={opp.applicationUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Link &nearr;
                </a>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(opp)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-600 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingOpportunity(opp)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-600 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !formSubmitting && setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingOpportunity ? 'Edit Opportunity' : 'Create Opportunity Post'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Students can view and click through to submit external applications.
            </p>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Position / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Software Engineering Intern — Summer 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Organization / Lab *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Google Research / AI Lab"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Opportunity Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bangalore / Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Deadline (YYYY-MM-DD) *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Application Link / Portal URL
                </label>
                <input
                  type="url"
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                  placeholder="https://company.com/careers/job123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Eligibility *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail job requirements, eligibility, stipend, and application instructions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {formSubmitting ? 'Saving...' : editingOpportunity ? 'Update Opportunity' : 'Post Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !deleteSubmitting && setDeletingOpportunity(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Opportunity?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-semibold text-slate-800">{deletingOpportunity.title}</span>? Students will no longer see this position.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOpportunity(null)}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {deleteSubmitting ? 'Deleting...' : 'Delete Opportunity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
