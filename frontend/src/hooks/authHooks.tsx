import { useState, useCallback } from 'react'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name?: string
  email: string
  password: string
  role?: string
  venueId: number
}

export interface AuthUser {
  id: number
  email: string
  role: string
  is_approved: boolean
  token: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const useLogin = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to authenticate')
      }

      const userData = json.data
      setUser(userData)

      if (userData?.token) {
        localStorage.setItem('token', userData.token)
      }

      if (userData?.user) {
        localStorage.setItem('user', JSON.stringify(userData.user))
      }

      return userData
    }
    catch (err: any) {
      console.error('[Login Error]', err)
      setError(err.message || 'Failed to log in')
      return null
    }
    finally {
      setLoading(false)
    }
  }, [])

  return { login, loading, error, user }
}

export const useRegister = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const contentType = response.headers.get('content-type')
      const isJson = contentType && contentType.includes('application/json')

      if (!response.ok) {
        if (isJson) {
          const json = await response.json()
          throw new Error(json.error || json.message || 'Failed to register')
        } else {
          throw new Error(`Server returned status ${response.status}: ${response.statusText}`)
        }
      }

      const json = await response.json()
      const userData = json.data
      setUser(userData)

      if (userData?.token) {
        localStorage.setItem('token', userData.token)
      }

      if (userData?.user) {
        localStorage.setItem('user', JSON.stringify(userData.user))
      }

      return userData
    }
    catch (err: any) {
      console.error('[Register Error]', err)
      setError(err.message || 'Failed to register')
      return null
    }
    finally {
      setLoading(false)
    }
  }, [])

  return { register, loading, error, user }
}

export const useGoogleAuth = () => {
  const initiateGoogleLogin = useCallback(() => {
    window.location.href = `${API_BASE_URL}/api/auth/google`
  }, [])

  return { initiateGoogleLogin }
}