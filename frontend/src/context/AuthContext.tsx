import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { authApi } from '../services/authApi'
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY, setAuthToken } from '../services/api'
import type { LoginRequest, RegisterRequest, UserResponse } from '../types'

export interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<UserResponse>
  logout: () => void
  updateUser: (updatedUser: UserResponse) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthState {
  token: string | null
  user: UserResponse | null
}

function getInitialAuthState(): AuthState {
  try {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    const storedUserJson = localStorage.getItem(USER_STORAGE_KEY)

    if (storedToken && storedUserJson) {
      const parsedUser = JSON.parse(storedUserJson) as UserResponse
      if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
        // Synchronously ensure Axios default headers are armed with this token
        setAuthToken(storedToken)
        return { token: storedToken, user: parsedUser }
      }
    }
    // Clear partial or malformed state
    if (storedToken || storedUserJson) {
      setAuthToken(null)
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch (error) {
    console.error('AuthContext: Failed to restore session from storage:', error)
    setAuthToken(null)
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      // Storage unavailable
    }
  }
  return { token: null, user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronous restoration on initialization prevents any race condition
  // where isLoading is false before the token has been restored.
  const [authState, setAuthState] = useState<AuthState>(getInitialAuthState)
  const [isLoading, setIsLoading] = useState(false)

  // Listen for global 401 unauthorized events from Axios response interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthState({ token: null, user: null })
      setIsLoading(false)
    }

    window.addEventListener('campushub:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('campushub:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    const authResponse = await authApi.login(credentials)
    setAuthToken(authResponse.token)
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authResponse.user))
    } catch {
      // Storage unavailable
    }
    setAuthState({
      token: authResponse.token,
      user: authResponse.user,
    })
  }

  const register = async (data: RegisterRequest): Promise<UserResponse> => {
    return await authApi.register(data)
  }

  const logout = (): void => {
    setAuthToken(null)
    try {
      localStorage.removeItem(USER_STORAGE_KEY)
    } catch {
      // Storage unavailable
    }
    setAuthState({ token: null, user: null })
  }

  const updateUser = (updatedUser: UserResponse): void => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
    } catch {
      // Storage unavailable
    }
    setAuthState((prev) => ({
      ...prev,
      user: updatedUser,
    }))
  }

  const value: AuthContextType = {
    user: authState.user,
    token: authState.token,
    isLoading,
    isAuthenticated: !!(authState.user && authState.token),
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
