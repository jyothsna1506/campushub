import apiClient from './api'
import type {
  EventRequest,
  EventResponse,
  EventRsvpResponse,
  RsvpStatusResponse,
} from '../types'

export const eventApi = {
  getEvents: async (): Promise<EventResponse[]> => {
    const response = await apiClient.get<EventResponse[]>('/api/events')
    return response.data
  },

  getActiveEvents: async (): Promise<EventResponse[]> => {
    const response = await apiClient.get<EventResponse[]>('/api/events/active')
    return response.data
  },

  getEventById: async (id: number): Promise<EventResponse> => {
    const response = await apiClient.get<EventResponse>(`/api/events/${id}`)
    return response.data
  },

  createEvent: async (request: EventRequest): Promise<EventResponse> => {
    const response = await apiClient.post<EventResponse>('/api/events', request)
    return response.data
  },

  updateEvent: async (id: number, request: EventRequest): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/api/events/${id}`, request)
    return response.data
  },

  deleteEvent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/events/${id}`)
  },

  // RSVP
  rsvpEvent: async (eventId: number): Promise<EventRsvpResponse> => {
    const response = await apiClient.post<EventRsvpResponse>(`/api/events/${eventId}/rsvp`)
    return response.data
  },

  cancelRsvp: async (eventId: number): Promise<void> => {
    await apiClient.delete(`/api/events/${eventId}/rsvp`)
  },

  getEventAttendees: async (eventId: number): Promise<EventRsvpResponse[]> => {
    const response = await apiClient.get<EventRsvpResponse[]>(`/api/events/${eventId}/attendees`)
    return response.data
  },

  getMyEvents: async (): Promise<EventRsvpResponse[]> => {
    const response = await apiClient.get<EventRsvpResponse[]>('/api/users/me/events')
    return response.data
  },

  getEventRsvpStatus: async (eventId: number): Promise<RsvpStatusResponse> => {
    const response = await apiClient.get<RsvpStatusResponse>(`/api/events/${eventId}/rsvp/status`)
    return response.data
  },
}

export default eventApi
