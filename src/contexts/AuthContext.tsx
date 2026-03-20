import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_URL } from '../config/api'

interface AuthUser {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Handle token delivered via URL parameter after GitHub OAuth redirect
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')

    if (urlToken) {
      try {
        const payload = JSON.parse(atob(urlToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        const userData: AuthUser = { id: payload.userId ?? 0, username: payload.username, email: '' }
        localStorage.setItem('auth_token', urlToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        setUser(userData)
        setToken(urlToken)
        // Remove ?token= from URL without reloading the page
        const cleanUrl = window.location.pathname
        window.history.replaceState(null, '', cleanUrl)
        setIsLoading(false)
        return
      } catch (error) {
        console.error('Error parsing OAuth token from URL:', error)
      }
    }

    // Check for existing token in localStorage
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setToken(storedToken)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // API returns data.data.user and data.data.token
        const userData = data.data.user
        const authToken = data.data.token
        
        setUser(userData)
        setToken(authToken)
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        return { success: true }
      } else {
        return { success: false, error: data.message || 'Login fejlede' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Netværksfejl - prøv igen senere' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}