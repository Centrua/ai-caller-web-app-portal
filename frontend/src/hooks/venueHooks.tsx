import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useVenue = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [venueName, setVenueName] = useState<string | null>(null)

  const getVenueName = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in.')
      }

      const response = await fetch(`${API_BASE_URL}/api/venue/name`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch venue name')
      }

      const name = json.data.name
      setVenueName(name)
      return name
    } 
    catch (err: any) {
      console.error('[Venue Error]', err)
      setError(err.message || 'Failed to fetch venue name')
      return null
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    venueName,
    getVenueName,
    loading,
    error,
  }
}