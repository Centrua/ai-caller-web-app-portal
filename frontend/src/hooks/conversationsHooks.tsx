import { useState, useCallback, useRef } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useConversations = (initialFilters: Record<string, any> | undefined = undefined) => {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const initialFiltersRef = useRef<Record<string, any>>(initialFilters || {})

  const fetchPage = useCallback(async (filters: Record<string, any> = {}, append = false) => {
    setLoading(true)
    setError(null)
    try {
      if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not defined')

      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token found')

      const qs = new URLSearchParams()
      Object.entries({ ...initialFiltersRef.current, ...filters }).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        if (Array.isArray(v)) {
          v.forEach((item) => qs.append(k, String(item)))
        } else {
          qs.append(k, String(v))
        }
      })

      const url = `${API_BASE_URL}/api/conversations${qs.toString() ? `?${qs.toString()}` : ''}`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch conversations')

      const data = json.data || {}
      if (append) {
        setConversations((prev) => [...prev, ...(data.conversations || [])])
      } else {
        setConversations(data.conversations || [])
      }
      setHasMore(!!data.hasMore)
      setNextCursor(data.nextCursor || null)
      return data
    } catch (err: any) {
      console.error('[Conversations] fetch error', err)
      setError(err.message || 'Failed to fetch')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => fetchPage({}, false), [fetchPage])

  const fetchNext = useCallback(async () => {
    if (!nextCursor) return null
    return fetchPage({ cursor: nextCursor }, true)
  }, [nextCursor, fetchPage])

  return { conversations, loading, error, nextCursor, hasMore, fetchNext, refresh, fetchPage, setConversations }
}
