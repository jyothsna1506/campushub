import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../services/adminApi'
import { getApiErrorMessage } from '../../services/api'
import type { UserResponse } from '../../types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ADMIN'>('ALL')

  // Role change modal state
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getUsers(
        search,
        roleFilter === 'ALL' ? undefined : roleFilter
      )
      setUsers(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch users'))
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers()
    }, 250)
    return () => clearTimeout(timer)
  }, [loadUsers])

  const handleOpenRoleModal = (user: UserResponse) => {
    setSelectedUser(user)
    const current = (user.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT')
    setTargetRole(current === 'ADMIN' ? 'STUDENT' : 'ADMIN')
    setUpdateError(null)
  }

  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return
    setIsUpdating(true)
    setUpdateError(null)
    try {
      const updated = await adminApi.updateUserRole(selectedUser.id, targetRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      )
      setActionSuccess(`Successfully changed role for ${updated.fullName} to ${targetRole}`)
      setSelectedUser(null)
      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err) {
      setUpdateError(getApiErrorMessage(err, 'Failed to update user role'))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search registered college users, audit credentials, and assign administrative roles.
          </p>
        </div>
      </div>

      {/* Notifications */}
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
            onClick={loadUsers}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter Controls */}
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
            placeholder="Search by student/faculty name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'STUDENT', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">No users found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || roleFilter !== 'ALL'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'No registered accounts available in the database.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Academic Info</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isAdmin = u.role?.toUpperCase() === 'ADMIN'
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.fullName}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {u.program || u.branch ? (
                          <>
                            <p className="font-medium text-slate-800">{u.program} - {u.branch}</p>
                            <p className="text-slate-400">Year {u.year || 'N/A'}</p>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Not specified</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          isAdmin
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {u.role || 'STUDENT'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenRoleModal(u)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-600 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {users.map((u) => {
              const isAdmin = u.role?.toUpperCase() === 'ADMIN'
              return (
                <div key={u.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isAdmin
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {u.role || 'STUDENT'}
                    </span>
                  </div>

                  {(u.program || u.branch) && (
                    <p className="text-xs text-slate-600">
                      {u.program} - {u.branch} (Year {u.year || 'N/A'})
                    </p>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenRoleModal(u)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Change Role
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !isUpdating && setSelectedUser(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 z-10 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Change Account Role</h3>
              <p className="text-xs text-slate-500 mt-1">
                Updating role permissions for <span className="font-semibold text-slate-800">{selectedUser.fullName}</span> ({selectedUser.email}).
              </p>
            </div>

            {updateError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {updateError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select New Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['STUDENT', 'ADMIN'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      targetRole === r
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold ring-2 ring-blue-600/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="block text-sm">{r}</span>
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                      {r === 'ADMIN' ? 'Full system control' : 'Standard college access'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {targetRole === 'STUDENT' && selectedUser.role?.toUpperCase() === 'ADMIN' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2">
                <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>
                  Demoting an administrator will revoke their administrative rights. The system will reject this action if this is the last remaining administrator.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRoleChange}
                disabled={isUpdating || targetRole === (selectedUser.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {isUpdating ? 'Saving...' : 'Confirm Role Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
