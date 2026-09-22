import apiClient from './api'
import type { AnnouncementRequest, AnnouncementResponse } from '../types'

export const announcementApi = {
  getAnnouncements: async (): Promise<AnnouncementResponse[]> => {
    const response = await apiClient.get<AnnouncementResponse[]>('/api/announcements')
    return response.data
  },

  getActiveAnnouncements: async (): Promise<AnnouncementResponse[]> => {
    const response = await apiClient.get<AnnouncementResponse[]>('/api/announcements/active')
    return response.data
  },

  getAnnouncementById: async (id: number): Promise<AnnouncementResponse> => {
    const response = await apiClient.get<AnnouncementResponse>(`/api/announcements/${id}`)
    return response.data
  },

  createAnnouncement: async (request: AnnouncementRequest): Promise<AnnouncementResponse> => {
    const response = await apiClient.post<AnnouncementResponse>('/api/announcements', request)
    return response.data
  },

  updateAnnouncement: async (
    id: number,
    request: AnnouncementRequest
  ): Promise<AnnouncementResponse> => {
    const response = await apiClient.put<AnnouncementResponse>(`/api/announcements/${id}`, request)
    return response.data
  },

  deleteAnnouncement: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/announcements/${id}`)
  },
}

export default announcementApi
