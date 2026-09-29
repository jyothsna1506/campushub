import apiClient from './api'
import type {
  CommunityPost,
  CommunityPostRequest,
  CommunityPostType,
  CommunityComment,
  CommunityCommentRequest,
} from '../types'

export const communityApi = {
  getPosts: async (type?: CommunityPostType): Promise<CommunityPost[]> => {
    const params = type ? { type } : {}
    const response = await apiClient.get<CommunityPost[]>('/api/community/posts', { params })
    return response.data
  },

  getPostById: async (id: number): Promise<CommunityPost> => {
    const response = await apiClient.get<CommunityPost>(`/api/community/posts/${id}`)
    return response.data
  },

  createPost: async (request: CommunityPostRequest): Promise<CommunityPost> => {
    const response = await apiClient.post<CommunityPost>('/api/community/posts', request)
    return response.data
  },

  updatePost: async (id: number, request: CommunityPostRequest): Promise<CommunityPost> => {
    const response = await apiClient.put<CommunityPost>(`/api/community/posts/${id}`, request)
    return response.data
  },

  deletePost: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/community/posts/${id}`)
    return response.data
  },

  getComments: async (postId: number): Promise<CommunityComment[]> => {
    const response = await apiClient.get<CommunityComment[]>(`/api/community/posts/${postId}/comments`)
    return response.data
  },

  addComment: async (postId: number, request: CommunityCommentRequest): Promise<CommunityComment> => {
    const response = await apiClient.post<CommunityComment>(`/api/community/posts/${postId}/comments`, request)
    return response.data
  },

  deleteComment: async (commentId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/api/community/comments/${commentId}`)
    return response.data
  },
}

export default communityApi
