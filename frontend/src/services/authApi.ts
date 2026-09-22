import apiClient from './api'
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types'

export const authApi = {
  register: async (request: RegisterRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/api/users', request)
    return response.data
  },

  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', request)
    return response.data
  },
}

export default authApi
