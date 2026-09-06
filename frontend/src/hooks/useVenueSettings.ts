import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface VenueSettings {
  auto_send_replies: boolean
  email_ai_routing: boolean
}

export const useVenueSettings = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getSettings = useCallback(async (): Promise<VenueSettings | null> => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/venue/settings`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch settings')
      return json.data
    } catch (err: any) {
      setError(err.message || 'Failed to fetch settings')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (updates: Partial<VenueSettings>) => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/venue/settings`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update settings')
      return json.data
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { getSettings, updateSettings, loading, error }
}

export default useVenueSettings
