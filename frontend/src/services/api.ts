import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

export const TOKEN_STORAGE_KEY = 'campushub_auth_token'
export const USER_STORAGE_KEY = 'campushub_auth_user'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Pre-populate default Authorization header from localStorage if available
try {
  const initialToken = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (initialToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`
  }
} catch {
  // In case localStorage is unavailable in certain environments
}

/**
 * Synchronize token to both localStorage and Axios default headers
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } catch {
      // Storage unavailable
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      // Storage unavailable
    }
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// Request Interceptor: Ensure Authorization header is present on outgoing requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      // If config headers do not yet have Authorization, ensure it is pulled from storage
      if (config.headers && !config.headers.Authorization) {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // In case localStorage is unavailable in certain browser contexts
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Preserve original error and status codes without dropping or converting them
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn('API Client: 401 Unauthorized response received on', error.config?.url)
      // If 401 occurs on an authenticated request (not login), clear stale credentials and notify AuthContext
      const isLoginRequest = error.config?.url?.includes('/api/auth/login')
      if (!isLoginRequest) {
        setAuthToken(null)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('campushub:unauthorized'))
        }
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Helper to extract user-friendly error message from Axios errors or exceptions
 * Distinguishes real network failure, 401 authentication, 403 forbidden, 404, and 500 server errors
 */
export function getApiErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    // 1. Real network failure or server unreachable (NO response received)
    if (!error.response) {
      return 'Unable to connect to CampusHub. Please make sure the server is running and try again.'
    }

    const { status, data } = error.response
    const responseData = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>

    // 2. HTTP 401: Authentication failure / session expired
    if (status === 401) {
      const url = error.config?.url || ''
      if (url.includes('/api/auth/login')) {
        return 'Invalid email or password.'
      }
      return 'Authentication required or session expired. Please sign in again.'
    }

    // 3. HTTP 403: Forbidden / access denied
    if (status === 403) {
      return 'Access forbidden. You do not have permission to perform this action.'
    }

    // 4. HTTP 404: Not found
    if (status === 404) {
      if (typeof responseData.message === 'string' && responseData.message.trim()) {
        return responseData.message
      }
      return 'Requested resource not found.'
    }

    // 5. HTTP 409: Conflict (e.g. duplicate email)
    if (status === 409) {
      if (typeof responseData.message === 'string' && responseData.message.trim()) {
        return responseData.message
      }
      return 'A conflict occurred. This record or email may already exist.'
    }

    // 6. HTTP 400: Validation or bad request
    if (status === 400) {
      if (responseData.fieldErrors && typeof responseData.fieldErrors === 'object') {
        const errors = Object.values(responseData.fieldErrors as Record<string, string>)
        if (errors.length > 0) {
          return errors.join(', ')
        }
      }
      if (typeof responseData.message === 'string' && responseData.message.trim()) {
        return responseData.message
      }
      if (typeof responseData.error === 'string' && responseData.error.trim()) {
        return responseData.error
      }
      return 'Validation failed. Please check your form input.'
    }

    // 7. HTTP 500: Server error
    if (status >= 500) {
      return 'Something went wrong on the server. Please try again.'
    }

    // 8. Other HTTP status codes: check response payload
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message
    }
    if (typeof responseData.error === 'string' && responseData.error.trim()) {
      return responseData.error
    }
  }

  // Generic Javascript Error instance (avoid raw 'Network Error' string)
  if (error instanceof Error && error.message) {
    if (error.message.toLowerCase().includes('network error')) {
      return 'Unable to connect to CampusHub. Please make sure the server is running and try again.'
    }
    return error.message
  }

  return fallback
}

export default apiClient
