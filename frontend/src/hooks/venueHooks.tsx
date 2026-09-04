import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface Venue {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  nylas_grant_id?: string | null
  associated_user_ids?: number[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateVenuePayload {
  name: string
  email?: string | null
  phone?: string | null
  elevenlabs_phone_number_id?: string | null
  kb_document_id?: string | null
  nylas_grant_id?: string | null
}

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
    } catch (err: any) {
      console.error('[GetVenueName Error]', err)
      setError(err.message || 'Failed to fetch venue name')
      return null
    } finally {
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

export const useVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getAllVenues = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const response = await fetch(`${API_BASE_URL}/api/venue`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch venues')
      }

      const fetchedVenues = json.data.venues || json.data
      setVenues(fetchedVenues)
      return fetchedVenues
    } 
    catch (err: any) {
      console.error('[GetAllVenues Error]', err)
      setError(err.message || 'Failed to fetch venues')
      return []
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    venues,
    getAllVenues,
    loading,
    error,
  }
}

export const useCreateVenue = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const createVenue = useCallback(async (payload: CreateVenuePayload) => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/venue`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || json.message || 'Failed to register venue')
      }

      return json.data
    } catch (err: any) {
      console.error('[CreateVenue Error]', err)
      const msg = err.message || 'An error occurred while creating the venue'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { createVenue, loading, error }
}