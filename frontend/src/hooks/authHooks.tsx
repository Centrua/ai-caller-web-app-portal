import { useState, useCallback } from 'react'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: number
  email: string
  role: string
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
        console.log(`\n\nTOKEN STORED: ${userData.token}\n\n`)
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

  return {
    user,
    login,
    loading,
    error,
  }
}