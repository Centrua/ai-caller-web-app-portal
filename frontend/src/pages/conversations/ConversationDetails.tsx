import { useParams, useNavigate } from 'react-router-dom'
import { useConversationDetails, useConversationAudio, useConversationActions } from '../../hooks/useConversationDetails'
import DataCollectionResults from '../../components/conversations/DataCollectionResults'

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
  const { conv, setConv, loading, error } = useConversationDetails(id)
  const { audioUrl, audioLoading } = useConversationAudio(id, conv?.hasAudio)
  const { action, setAction } = useConversationActions(id)

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
                        setAction((prev: any) => prev ? { ...prev, completed: nextCompleted } : prev)
                        setConv((prev: any) => prev ? { ...prev, hasUnacknowledgedActions: !nextCompleted } : prev)
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



          {/* Data collection results */}
          <DataCollectionResults conv={conv} />


        </aside>
      </div>
    </div>
  )
}
