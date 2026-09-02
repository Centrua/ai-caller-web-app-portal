import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversations } from '../../hooks/conversationsHooks'

const statusColor: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  failure: 'bg-red-100 text-red-600',
  unknown: 'bg-slate-100 text-slate-500',
}

function formatOutcome(val: any) {
  if (val === null || val === undefined) return 'Unknown'
  const s = String(val)
  if (!s) return 'Unknown'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function isTodayIso(iso?: string) {
  if (!iso) return false
  const d = new Date(iso)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function Conversations() {
  const { conversations, loading, error, hasMore, fetchNext, refresh } = useConversations()
  const navigate = useNavigate()

  useEffect(() => {
    // initial load
    refresh()
  }, [refresh])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Conversations</h1>
      <p className="text-slate-500 text-sm mb-8">Review all inbound AI call transcripts.</p>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Caller</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"> </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">Loading conversations...</td>
              </tr>
            )}

            {!loading && conversations.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">No conversations found for this venue.</td>
              </tr>
            )}

            {conversations.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/conversations/${c.id}`)}>
                <td className="px-5 py-4 text-slate-400">{c.startTime ? new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</td>
                <td className="px-5 py-4 font-medium text-slate-800">
                  <div className="flex items-center">
                    <span>{c.callSummaryTitle || c.agentName || 'Unknown'}</span>
                    {isTodayIso(c.startTime) && (
                      <span title="New conversation today" className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">New</span>
                    )}
                    {c.hasUnacknowledgedActions && (
                      <span title="Action items pending" className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-500">{c.durationDisplay || '-'}</td>
                <td className="px-5 py-4 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 text-center">
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {hasMore && (
            <button className="px-4 py-2 bg-slate-100 rounded" onClick={() => fetchNext()}>Load more</button>
          )}
        </div>
      </div>
    </div>
  )
}
