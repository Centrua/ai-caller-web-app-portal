import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface RegisterTokenItem {
  id: number
  plainToken: string
}

export const useGetRegisterTokens = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [tokens, setTokens] = useState<RegisterTokenItem[]>([])

  const getRegisterTokens = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const authToken = localStorage.getItem('token')
      if (!authToken) {
        throw new Error('No authentication token found. Please log in.')
      }

      const response = await fetch(`${API_BASE_URL}/api/register-token/venue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch register tokens')
      }

      const fetchedTokens: RegisterTokenItem[] = json.data || []
      setTokens(fetchedTokens)
      return fetchedTokens
    } 
    catch (err: any) {
      console.error('[GetRegisterTokens Error]', err)
      const msg = err.message || 'Failed to fetch register tokens'
      setError(msg)
      return null
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    tokens,
    getRegisterTokens,
    loading,
    error,
  }
}
