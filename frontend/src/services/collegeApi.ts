import apiClient from './api'
import type { College, CollegeRequest } from '../types'

export const collegeApi = {
  getActiveColleges: async (): Promise<College[]> => {
    const response = await apiClient.get<College[]>('/api/colleges/active')
    return response.data
  },

  getAllColleges: async (): Promise<College[]> => {
    const response = await apiClient.get<College[]>('/api/colleges')
    return response.data
  },

  getCollegeById: async (id: number): Promise<College> => {
    const response = await apiClient.get<College>(`/api/colleges/${id}`)
    return response.data
  },

  createCollege: async (request: CollegeRequest): Promise<College> => {
    const response = await apiClient.post<College>('/api/colleges', request)
    return response.data
  },

  updateCollege: async (id: number, request: CollegeRequest): Promise<College> => {
    const response = await apiClient.put<College>(`/api/colleges/${id}`, request)
    return response.data
  },
}

export default collegeApi
