import apiClient from './api'
import type {
  ClubMemberResponse,
  ClubRequest,
  ClubResponse,
  MembershipStatusResponse,
} from '../types'

export const clubApi = {
  getClubs: async (): Promise<ClubResponse[]> => {
    const response = await apiClient.get<ClubResponse[]>('/api/clubs')
    return response.data
  },

  getActiveClubs: async (): Promise<ClubResponse[]> => {
    const response = await apiClient.get<ClubResponse[]>('/api/clubs/active')
    return response.data
  },

  getClubById: async (id: number): Promise<ClubResponse> => {
    const response = await apiClient.get<ClubResponse>(`/api/clubs/${id}`)
    return response.data
  },

  createClub: async (request: ClubRequest): Promise<ClubResponse> => {
    const response = await apiClient.post<ClubResponse>('/api/clubs', request)
    return response.data
  },

  updateClub: async (id: number, request: ClubRequest): Promise<ClubResponse> => {
    const response = await apiClient.put<ClubResponse>(`/api/clubs/${id}`, request)
    return response.data
  },

  deleteClub: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/clubs/${id}`)
  },

  // Membership
  joinClub: async (clubId: number): Promise<ClubMemberResponse> => {
    const response = await apiClient.post<ClubMemberResponse>(`/api/clubs/${clubId}/join`)
    return response.data
  },

  leaveClub: async (clubId: number): Promise<void> => {
    await apiClient.delete(`/api/clubs/${clubId}/leave`)
  },

  getClubMembers: async (clubId: number): Promise<ClubMemberResponse[]> => {
    const response = await apiClient.get<ClubMemberResponse[]>(`/api/clubs/${clubId}/members`)
    return response.data
  },

  getMyClubs: async (): Promise<ClubMemberResponse[]> => {
    const response = await apiClient.get<ClubMemberResponse[]>('/api/users/me/clubs')
    return response.data
  },

  getClubMembershipStatus: async (clubId: number): Promise<MembershipStatusResponse> => {
    const response = await apiClient.get<MembershipStatusResponse>(`/api/clubs/${clubId}/membership`)
    return response.data
  },
}

export default clubApi
