import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface Message {
  id: string
  thread_id: string
  grant_id: string
  snippet?: string | null
  from?: any
  to?: any
  createdAt?: string
  updatedAt?: string
}

export interface Conversation {
  id: number
  thread_id: string
  grant_id: string
  subject?: string | null
  messages?: Message[]
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
    } catch (err: any) {
      console.error('[GetEmailConversations Error]', err)
      setError(err.message || 'Failed to fetch email conversations')
      return []
    } finally {
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