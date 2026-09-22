import apiClient from './api'
import type {
  TeamJoinRequestResponse,
  TeamMemberResponse,
  TeamRequest,
  TeamResponse,
} from '../types'

export const teamApi = {
  getTeams: async (): Promise<TeamResponse[]> => {
    const response = await apiClient.get<TeamResponse[]>('/api/teams')
    return response.data
  },

  getOpenTeams: async (): Promise<TeamResponse[]> => {
    const response = await apiClient.get<TeamResponse[]>('/api/teams/open')
    return response.data
  },

  getTeamById: async (id: number): Promise<TeamResponse> => {
    const response = await apiClient.get<TeamResponse>(`/api/teams/${id}`)
    return response.data
  },

  getMyTeams: async (): Promise<TeamResponse[]> => {
    const response = await apiClient.get<TeamResponse[]>('/api/users/me/teams')
    return response.data
  },

  createTeam: async (request: TeamRequest): Promise<TeamResponse> => {
    const response = await apiClient.post<TeamResponse>('/api/teams', request)
    return response.data
  },

  updateTeam: async (id: number, request: TeamRequest): Promise<TeamResponse> => {
    const response = await apiClient.put<TeamResponse>(`/api/teams/${id}`, request)
    return response.data
  },

  deleteTeam: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/teams/${id}`)
  },

  // Join Requests & Members
  createTeamJoinRequest: async (teamId: number): Promise<TeamJoinRequestResponse> => {
    const response = await apiClient.post<TeamJoinRequestResponse>(`/api/teams/${teamId}/join-requests`)
    return response.data
  },

  cancelTeamJoinRequest: async (requestId: number): Promise<void> => {
    await apiClient.delete(`/api/teams/join-requests/${requestId}`)
  },

  getTeamMembers: async (teamId: number): Promise<TeamMemberResponse[]> => {
    const response = await apiClient.get<TeamMemberResponse[]>(`/api/teams/${teamId}/members`)
    return response.data
  },

  getTeamJoinRequests: async (teamId: number): Promise<TeamJoinRequestResponse[]> => {
    const response = await apiClient.get<TeamJoinRequestResponse[]>(`/api/teams/${teamId}/join-requests`)
    return response.data
  },

  getMyTeamRequests: async (): Promise<TeamJoinRequestResponse[]> => {
    const response = await apiClient.get<TeamJoinRequestResponse[]>('/api/users/me/team-requests')
    return response.data
  },

  acceptTeamJoinRequest: async (requestId: number): Promise<TeamJoinRequestResponse> => {
    const response = await apiClient.put<TeamJoinRequestResponse>(`/api/teams/join-requests/${requestId}/accept`)
    return response.data
  },

  rejectTeamJoinRequest: async (requestId: number): Promise<TeamJoinRequestResponse> => {
    const response = await apiClient.put<TeamJoinRequestResponse>(`/api/teams/join-requests/${requestId}/reject`)
    return response.data
  },
}

export default teamApi
