import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function formatDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function displayableValue(raw: any): string | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No'
  if (typeof raw === 'object') {
    // prefer explicit .value when it's primitive
    if ('value' in raw) {
      const v = (raw as any).value
      if (v === null || v === undefined || v === '') return null
      if (typeof v === 'boolean') return v ? 'Yes' : 'No'
      if (typeof v === 'string') return v.charAt(0).toUpperCase() + v.slice(1)
      return String(v)
    }
    return null
  }
  if (raw === '') return null
  if (typeof raw === 'string') return raw.charAt(0).toUpperCase() + raw.slice(1)
  return String(raw)
}

export default function ConversationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conv, setConv] = useState<any | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [action, setAction] = useState<any | null>(null)
  const [actionsLoading, setActionsLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token')
        const base = API_BASE_URL || ''
        // Fetch lightweight summary first
        const summaryRaw = `${base}/api/conversations/${id}/summary`
        const summaryUrl = summaryRaw.replace('://', '::tmp::').replace(/\/\/+/g, '/').replace('::tmp::', '://')
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

        // If summary indicates messages were omitted or missing timing/duration, fetch full conversation
        const needFull = !!merged.messagesOmitted || !merged.startTime || !merged.durationDisplay
        if (needFull) {
          const fullRaw = `${base}/api/conversations/${id}`
          const fullUrl = fullRaw.replace('://', '::tmp::').replace(/\/\/+/g, '/').replace('::tmp::', '://')
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

          // Merge: full provides startTime, durationDisplay, transcript; keep summary messages/transcript when present
          merged = {
            ...fullJson.data,
            ...merged, // let summary fields override when present
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

  // Fetch audio blob when conversation indicates audio is available
  useEffect(() => {
    let mounted = true
    let objectUrl: string | null = null

    const loadAudio = async () => {
      if (!id || !conv?.hasAudio) return
      try {
        setAudioLoading(true)
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token')
        const base = API_BASE_URL || ''
        const raw = `${base}/api/conversations/${id}/audio`
        const url = raw.replace('://', '::tmp::').replace(/\/\/+/g, '/').replace('::tmp::', '://')
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
  }, [id, conv?.hasAudio])

  // load action items
  useEffect(() => {
    let mounted = true
    const loadActions = async () => {
      if (!id) return
      setActionsLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No token')
        const base = API_BASE_URL || ''
        const raw = `${base}/api/conversations/${id}/actions`
        const url = raw.replace('://', '::tmp::').replace(/\/\/+/g, '/').replace('::tmp::', '://')
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

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!conv) return <div className="p-8">Conversation not found.</div>

  const transcript = Array.isArray(conv.messages)
    ? conv.messages
    : Array.isArray(conv.transcript)
    ? conv.transcript
    : []
  const nextActionText = action?.value || action?.label || 'Next actionable step'

  return (
    <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Conversation details</h1>
          <button className="px-3 py-1 bg-slate-100 rounded cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => navigate(-1)}>Back</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {action && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="text-slate-800 text-base font-medium leading-relaxed">
                    {nextActionText}
                  </div>
                  <button
                    className={`px-2 py-1 text-sm rounded ${action.completed ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                    onClick={async (e) => {
                      e.stopPropagation()
                      const nextCompleted = !action.completed
                      try {
                        const token = localStorage.getItem('token')
                        const base = API_BASE_URL || ''
                        const res = await fetch(`${base}/api/conversations/${id}/complete`, {
                          method: 'PATCH',
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ completed: nextCompleted }),
                        })
                        const j = await res.json()
                        if (j.success) {
                          setAction((prev) => prev ? { ...prev, completed: nextCompleted } : prev)
                          setConv((prev) => prev ? { ...prev, hasUnacknowledgedActions: !nextCompleted } : prev)
                        }
                      } catch (err) {
                        console.error(err)
                      }
                    }}
                  >
                    {action.completed ? 'Mark Undone' : 'Mark Done'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-2">Summary</h2>
                <p className="text-slate-700">{conv.transcriptSummary || 'No summary available.'}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Transcript</h2>
                {audioLoading && <div className="text-sm text-slate-500 mb-2">Loading audio...</div>}
                {audioUrl && (
                  <div className="mb-4">
                    <audio controls src={audioUrl} className="w-full" />
                  </div>
                )}
                {transcript.length === 0 && <div className="text-slate-500">No transcript available.</div>}
                <div className="space-y-3">
                  {transcript.map((m: any, idx: number) => {
                    const isUser = (m.role || '').toLowerCase() === 'user'
                    return (
                      <div key={idx} className={`p-3 rounded-lg max-w-3xl ${isUser ? 'bg-slate-50 text-slate-800' : 'bg-slate-100 text-slate-800 ml-auto'}`}>
                        <div className="text-xs text-slate-500 mb-1">{isUser ? 'User' : 'AI'} • {typeof m.time_in_call_secs === 'number' ? `${m.time_in_call_secs}s` : ''}</div>
                        <div className="whitespace-pre-wrap">{m.message}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <h3 className="text-md font-medium mb-3">Call Details</h3>
            {/* Prefer 'Lead Name' from data collection results, else Unknown */}
            {(() => {
              try {
                const rawDcr = conv.analysis?.data_collection_results ?? conv.dataCollectionResults ?? conv.data_collection_results
                // check map form first
                if (rawDcr && typeof rawDcr === 'object' && !Array.isArray(rawDcr)) {
                  const keys = Object.keys(rawDcr)
                  const foundKey = keys.find((k) => ['lead name', 'lead_name', 'leadName'].includes(String(k).toLowerCase()))
                  if (foundKey) {
                    const dv = (rawDcr as any)[foundKey]?.value ?? (rawDcr as any)[foundKey]
                    const disp = displayableValue(dv)
                    if (disp) return <p className="text-slate-700"><strong>Caller:</strong> {disp}</p>
                  }
                }

                // check array form
                if (Array.isArray(rawDcr)) {
                  for (const it of rawDcr) {
                    const id = String(it.data_collection_id ?? it.id ?? '')
                    if (['lead name', 'lead_name', 'leadName'].includes(id.toLowerCase())) {
                      const disp = displayableValue(it.value ?? it?.value ?? null)
                      if (disp) return <p className="text-slate-700"><strong>Caller:</strong> {disp}</p>
                    }
                  }
                }
              } catch {
                // ignore
              }
              return <p className="text-slate-700"><strong>Caller:</strong> Unknown</p>
            })()}
            <p className="text-slate-700"><strong>Date/Time:</strong> {formatDate(conv.startTime)}</p>
            <p className="text-slate-700"><strong>Duration:</strong> {conv.durationDisplay || '—'}</p>
            
            

              {/* Data collection results: prefer analysis.data_collection_results, then normalized dataCollectionResults */}
              {(() => {
                const analysisDCR = conv.analysis?.data_collection_results ?? conv.analysis?.dataCollectionResults
                const normalizedDCR = conv.dataCollectionResults ?? conv.data_collection_results
                const dcr = analysisDCR ?? normalizedDCR
                if (!dcr) return null

                // If it's an array form (data_collection_results_list), render each item's primitive value
                if (Array.isArray(dcr)) {
                  const items = (dcr as any[])
                    .map((item: any) => {
                      const id = item.data_collection_id ?? item.id ?? JSON.stringify(item)
                      const raw = item.value ?? item?.value ?? null
                      const disp = displayableValue(raw)
                      if (!disp) return null
                      return { id, label: id, value: disp }
                    })
                    .filter(Boolean)

                  if (items.length === 0) return null

                  return (
                    <div className="mt-3">
                      <div className="text-xs text-slate-500 mb-1">Data collection</div>
                      <ul className="list-none space-y-1">
                        {items.map((it: any) => (
                          <li key={it.id} className="text-slate-700"><strong>{it.label}:</strong> {it.value}</li>
                        ))}
                      </ul>
                    </div>
                  )
                }

                // If it's an object map, render each key's primitive value (prefer the 'value' field)
                if (typeof dcr === 'object' && dcr !== null) {
                  const entries = Object.entries(dcr)
                    .map(([k, v]: any) => {
                      const raw = (v as any)?.value ?? v
                      const disp = displayableValue(raw)
                      if (!disp) return null
                      return { k, v: disp }
                    })
                    .filter(Boolean)

                  if (entries.length === 0) return null

                  return (
                    <div className="mt-3">
                      <div className="text-xs text-slate-500 mb-1">Data collection</div>
                      <ul className="list-none space-y-1">
                        {entries.map((it: any) => (
                          <li key={it.k} className="text-slate-700"><strong>{it.k}:</strong> {it.v}</li>
                        ))}
                      </ul>
                    </div>
                  )
                }

                // primitive fallback
                const prim = displayableValue(dcr)
                if (!prim) return null
                return <p className="text-slate-700 mt-3"><strong>Data Collection:</strong> {prim}</p>
              })()}

          
          </aside>
        </div>
      </div>
    )
  }
