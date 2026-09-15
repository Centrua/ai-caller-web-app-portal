import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface CreateSubscriptionRequestPayload {
  name: string
  phone_number: string
  email: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_state: string
  venue_zip_code: string
  requesting_demo?: boolean
}

export interface SubscriptionRequest {
  id: number
  name: string
  phone_number: string
  email: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_state: string
  venue_zip_code: string
  approved: boolean
  requesting_demo: boolean
  createdAt?: string
  updatedAt?: string
}

export const useCreateSubscriptionRequest = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const createSubscriptionRequest = useCallback(async (payload: CreateSubscriptionRequestPayload): Promise<SubscriptionRequest> => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/subscription-requests`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await response.json()

      if (!response.ok || (json.success !== undefined && !json.success)) {
        throw new Error(json.error || json.message || 'Failed to submit subscription request')
      }

      return json.data || json
    } 
    catch (err: any) {
      console.error('[CreateSubscriptionRequest Error]', err)
      const msg = err.message || 'An error occurred while submitting your request'
      setError(msg)
      throw new Error(msg)
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return { createSubscriptionRequest, loading, error }
}

export const useNonApprovedSubscriptionRequests = () => {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNonApprovedRequests = useCallback(async (): Promise<SubscriptionRequest[]> => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/subscription-requests`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to fetch non-approved subscription requests')
      }

      const data = json.data || json
      setRequests(data)
      return data
    } 
    catch (err: any) {
      console.error('[FetchNonApprovedRequests Error]', err)
      const msg = err.message || 'An error occurred while fetching requests'
      setError(msg)
      throw new Error(msg)
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return { requests, fetchNonApprovedRequests, loading, error }
}

export const useApproveSubscriptionRequest = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const approveRequest = useCallback(async (id: number): Promise<SubscriptionRequest> => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/subscription-requests/${id}/approve`, {
        method: 'PATCH',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || 'Failed to approve subscription request')
      }

      return json.data || json
    } 
    catch (err: any) {
      console.error('[ApproveSubscriptionRequest Error]', err)
      const msg = err.message || 'An error occurred while approving the request'
      setError(msg)
      throw new Error(msg)
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return { approveRequest, loading, error }
}