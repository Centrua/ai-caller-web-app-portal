import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function normalizeUrl(raw: string) {
  return raw.replace('://', '::tmp::').replace(/\/\/+/g, '/').replace('::tmp::', '://')
}

export function useConversationDetails(id?: string | null) {
  const [conv, setConv] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token')
        const base = API_BASE_URL || ''

        const summaryUrl = normalizeUrl(`${base}/api/conversations/${id}/summary`)
        const summaryRes = await fetch(summaryUrl, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        const summaryContentType = summaryRes.headers.get('content-type') || ''
        if (!summaryContentType.includes('application/json')) {
          const text = await summaryRes.text()
          throw new Error(`Non-JSON response (${summaryRes.status}) from ${summaryUrl}: ${text.slice(0,200)}`)
        }
        const summaryJson = await summaryRes.json()
        if (!summaryRes.ok || !summaryJson.success) throw new Error(summaryJson.error || 'Failed to fetch summary')

        let merged = summaryJson.data || {}

        const needFull = !!merged.messagesOmitted || !merged.startTime || !merged.durationDisplay
        if (needFull) {
          const fullUrl = normalizeUrl(`${base}/api/conversations/${id}`)
          const fullRes = await fetch(fullUrl, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          })
          const fullContentType = fullRes.headers.get('content-type') || ''
          if (!fullContentType.includes('application/json')) {
            const text = await fullRes.text()
            throw new Error(`Non-JSON response (${fullRes.status}) from ${fullUrl}: ${text.slice(0,200)}`)
          }
          const fullJson = await fullRes.json()
          if (!fullRes.ok || !fullJson.success) throw new Error(fullJson.error || 'Failed to fetch full conversation')

          merged = {
            ...fullJson.data,
            ...merged,
            transcript: fullJson.data.transcript ?? merged.transcript,
            messages: merged.messages ?? undefined,
          }
        }

        setConv(merged)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  return { conv, setConv, loading, error }
}

export function useConversationAudio(id?: string | null, hasAudio?: boolean) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    let objectUrl: string | null = null

    const loadAudio = async () => {
      if (!id || !hasAudio) return
      try {
        setAudioLoading(true)
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token')
        const base = API_BASE_URL || ''
        const url = normalizeUrl(`${base}/api/conversations/${id}/audio`)
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error(`Audio fetch failed (${res.status})`)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (mounted) setAudioUrl(objectUrl)
      } catch (err: any) {
        console.error('Failed to load audio', err)
      } finally {
        if (mounted) setAudioLoading(false)
      }
    }

    loadAudio()

    return () => {
      mounted = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id, hasAudio])

  return { audioUrl, audioLoading }
}

export function useConversationActions(id?: string | null) {
  const [action, setAction] = useState<any | null>(null)
  const [actionsLoading, setActionsLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadActions = async () => {
      if (!id) return
      setActionsLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token')
        const base = API_BASE_URL || ''
        const url = normalizeUrl(`${base}/api/conversations/${id}/actions`)
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
        if (!res.ok) throw new Error('Failed to fetch actions')
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to fetch actions')
        if (mounted) setAction((json.data && json.data.length > 0) ? json.data[0] : null)
      } catch (err) {
        console.error('Failed to load actions', err)
        if (mounted) setAction(null)
      } finally {
        if (mounted) setActionsLoading(false)
      }
    }

    loadActions()
    return () => {
      mounted = false
    }
  }, [id])

  return { action, setAction, actionsLoading }
}
