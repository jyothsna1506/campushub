import apiClient from './api'
import type { UserResponse, UserUpdateRequest } from '../types'

export const userApi = {
  getUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>('/api/users')
    return response.data
  },

  getUserById: async (id: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/api/users/${id}`)
    return response.data
  },

  updateUser: async (id: number, request: UserUpdateRequest): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/api/users/${id}`, request)
    return response.data
  },

  deleteUser: async (id: number): Promise<string> => {
    const response = await apiClient.delete<string>(`/api/users/${id}`)
    return response.data
  },

  uploadProfileImage: async (file: File): Promise<UserResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<UserResponse>('/api/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteProfileImage: async (): Promise<UserResponse> => {
    const response = await apiClient.delete<UserResponse>('/api/users/me/profile-image')
    return response.data
  },
}

export default userApi
