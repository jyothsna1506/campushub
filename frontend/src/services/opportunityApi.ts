import apiClient from './api'
import type { OpportunityRequest, OpportunityResponse } from '../types'

export const opportunityApi = {
  getOpportunities: async (): Promise<OpportunityResponse[]> => {
    const response = await apiClient.get<OpportunityResponse[]>('/api/opportunities')
    return response.data
  },

  getActiveOpportunities: async (): Promise<OpportunityResponse[]> => {
    const response = await apiClient.get<OpportunityResponse[]>('/api/opportunities/active')
    return response.data
  },

  getOpportunityById: async (id: number): Promise<OpportunityResponse> => {
    const response = await apiClient.get<OpportunityResponse>(`/api/opportunities/${id}`)
    return response.data
  },

  createOpportunity: async (request: OpportunityRequest): Promise<OpportunityResponse> => {
    const response = await apiClient.post<OpportunityResponse>('/api/opportunities', request)
    return response.data
  },

  updateOpportunity: async (
    id: number,
    request: OpportunityRequest
  ): Promise<OpportunityResponse> => {
    const response = await apiClient.put<OpportunityResponse>(`/api/opportunities/${id}`, request)
    return response.data
  },

  deleteOpportunity: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/opportunities/${id}`)
  },
}

export default opportunityApi
