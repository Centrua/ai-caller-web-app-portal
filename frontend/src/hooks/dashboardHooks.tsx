import { useState, useCallback } from 'react'

export interface DashboardMetrics {
  callsToday: number
  callsThisWeek: number
  totalCalls: number
  averageCallDurationFormatted: string
  successfulCalls: number
  successRate: string
  recentConversations: any[]
  callsOverTime: Array<{ date: string; count: number }>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useDashboard = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)

  const getMetrics = useCallback(async (agentId?: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!API_BASE_URL) {
        throw new Error('VITE_API_URL is not defined')
      }

      const query = agentId ? `?agent_id=${agentId}` : ''
      const response = await fetch(`${API_BASE_URL}/api/dashboard${query}`)
      const json = await response.json()

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch dashboard metrics')
      }

      setMetrics(json.data)
      return json.data
    } 
    catch (err: any) {
      console.error('[Dashboard Error]', err)
      setError(err.message || 'Failed to fetch dashboard metrics')
      return null
    } 
    finally {
      setLoading(false)
    }
  }, [])

  return {
    metrics,
    getMetrics,
    loading,
    error,
  }
}