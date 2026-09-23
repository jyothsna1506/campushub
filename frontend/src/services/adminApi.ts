import apiClient from './api'
import type {
  AdminDashboardStatsResponse,
  AnnouncementRequest,
  AnnouncementResponse,
  ClubRequest,
  ClubResponse,
  EventRequest,
  EventResponse,
  OpportunityRequest,
  OpportunityResponse,
  TeamJoinRequestResponse,
  TeamMemberResponse,
  TeamResponse,
  UpdateUserRoleRequest,
  UserResponse,
} from '../types'

export const adminApi = {
  // Dashboard Stats
  async getDashboardStats(): Promise<AdminDashboardStatsResponse> {
    const response = await apiClient.get<AdminDashboardStatsResponse>('/api/admin/dashboard/stats')
    return response.data
  },

  // Users
  async getUsers(search?: string, role?: string): Promise<UserResponse[]> {
    const params: Record<string, string> = {}
    if (search && search.trim()) params.search = search.trim()
    if (role && role.trim()) params.role = role.trim()
    const response = await apiClient.get<UserResponse[]>('/api/admin/users', { params })
    return response.data
  },

  async getUserById(id: number): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/api/admin/users/${id}`)
    return response.data
  },

  async updateUserRole(id: number, role: 'STUDENT' | 'ADMIN'): Promise<UserResponse> {
    const payload: UpdateUserRoleRequest = { role }
    const response = await apiClient.put<UserResponse>(`/api/admin/users/${id}/role`, payload)
    return response.data
  },

  // Clubs
  async getClubs(): Promise<ClubResponse[]> {
    const response = await apiClient.get<ClubResponse[]>('/api/admin/clubs')
    return response.data
  },

  async createClub(payload: ClubRequest): Promise<ClubResponse> {
    const response = await apiClient.post<ClubResponse>('/api/admin/clubs', payload)
    return response.data
  },

  async updateClub(id: number, payload: ClubRequest): Promise<ClubResponse> {
    const response = await apiClient.put<ClubResponse>(`/api/admin/clubs/${id}`, payload)
    return response.data
  },

  async deleteClub(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/clubs/${id}`)
  },

  // Events
  async getEvents(): Promise<EventResponse[]> {
    const response = await apiClient.get<EventResponse[]>('/api/admin/events')
    return response.data
  },

  async createEvent(payload: EventRequest): Promise<EventResponse> {
    const response = await apiClient.post<EventResponse>('/api/admin/events', payload)
    return response.data
  },

  async updateEvent(id: number, payload: EventRequest): Promise<EventResponse> {
    const response = await apiClient.put<EventResponse>(`/api/admin/events/${id}`, payload)
    return response.data
  },

  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/events/${id}`)
  },

  // Announcements
  async getAnnouncements(): Promise<AnnouncementResponse[]> {
    const response = await apiClient.get<AnnouncementResponse[]>('/api/admin/announcements')
    return response.data
  },

  async createAnnouncement(payload: AnnouncementRequest): Promise<AnnouncementResponse> {
    const response = await apiClient.post<AnnouncementResponse>('/api/admin/announcements', payload)
    return response.data
  },

  async updateAnnouncement(id: number, payload: AnnouncementRequest): Promise<AnnouncementResponse> {
    const response = await apiClient.put<AnnouncementResponse>(`/api/admin/announcements/${id}`, payload)
    return response.data
  },

  async deleteAnnouncement(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/announcements/${id}`)
  },

  // Opportunities
  async getOpportunities(): Promise<OpportunityResponse[]> {
    const response = await apiClient.get<OpportunityResponse[]>('/api/admin/opportunities')
    return response.data
  },

  async createOpportunity(payload: OpportunityRequest): Promise<OpportunityResponse> {
    const response = await apiClient.post<OpportunityResponse>('/api/admin/opportunities', payload)
    return response.data
  },

  async updateOpportunity(id: number, payload: OpportunityRequest): Promise<OpportunityResponse> {
    const response = await apiClient.put<OpportunityResponse>(`/api/admin/opportunities/${id}`, payload)
    return response.data
  },

  async deleteOpportunity(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/opportunities/${id}`)
  },

  // Teams
  async getTeams(): Promise<TeamResponse[]> {
    const response = await apiClient.get<TeamResponse[]>('/api/admin/teams')
    return response.data
  },

  async getTeamById(id: number): Promise<TeamResponse> {
    const response = await apiClient.get<TeamResponse>(`/api/admin/teams/${id}`)
    return response.data
  },

  async getTeamMembers(teamId: number): Promise<TeamMemberResponse[]> {
    const response = await apiClient.get<TeamMemberResponse[]>(`/api/admin/teams/${teamId}/members`)
    return response.data
  },

  async getTeamRequests(teamId: number): Promise<TeamJoinRequestResponse[]> {
    const response = await apiClient.get<TeamJoinRequestResponse[]>(`/api/admin/teams/${teamId}/requests`)
    return response.data
  },

  async deleteTeam(id: number): Promise<void> {
    await apiClient.delete(`/api/admin/teams/${id}`)
  },
}

export default adminApi
