import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/client'

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string, passwordConfirm: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }
      const response = await authApi.getCurrentUser()
      setUser(response.data)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    const { accessToken, refreshToken, user: userData } = response.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
  }, [])

  const register = useCallback(
    async (email: string, name: string, password: string, passwordConfirm: string) => {
      const response = await authApi.register(email, name, password, passwordConfirm)
      const { accessToken, refreshToken, user: userData } = response.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(userData)
    },
    []
  )

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
