import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const EMAIL_SERIVCE_API_BASE_URL = import.meta.env.VITE_EMAIL_SERVICE_API_BASE_URL || 'http://localhost:3002'

export interface Message {
  id: string
  thread_id: string
  grant_id: string
  subject?: string | null
  body?: string | null
  from?: any
  to?: any
  createdAt?: string
  updatedAt?: string
}

export interface Outgoing {
  id: number
  original_message_id?: string | null
  thread_id?: string | null
  grant_id?: string | null
  subject?: string | null
  body?: string | null
  status?: string | null
  gemini_response?: any
  createdAt?: string
  updatedAt?: string
}

export interface Conversation {
  id: number
  thread_id: string
  grant_id: string
  subject?: string | null
  next_action?: string | null
  messages?: Message[]
  outgoing?: Outgoing[]
  createdAt?: string
  updatedAt?: string
}

export const useEmailConversations = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])

  const getConversations = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/email-conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || json.details || 'Failed to fetch email conversations')
      }

      const data = Array.isArray(json) ? json : (json.data || [])
      setConversations(data)
      return data
    } 
    catch (err: any) {
      console.error('[GetEmailConversations Error]', err)
      setError(err.message || 'Failed to fetch email conversations')
      return []
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    conversations,
    getConversations,
    loading,
    error,
  }
}

export const useApproveDraft = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const approveDraft = useCallback(async (draftId: number) => {
    setLoading(true)
    setError(null)

    try {
      if (!EMAIL_SERIVCE_API_BASE_URL) {
        throw new Error('VITE_EMAIL_SERVICE_API_BASE_URL is not defined')
      }

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in.')
      }

      const response = await fetch(`${EMAIL_SERIVCE_API_BASE_URL}/reply/${draftId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.error || json.message || json.details || 'Failed to approve and send draft')
      }

      return json
    } 
    catch (err: any) {
      console.error('[ApproveDraft Error]', err)
      setError(err.message || 'Failed to approve and send draft')
      throw err
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    approveDraft,
    loading,
    error,
  }
}