import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConversations } from '../../hooks/conversationsHooks'

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
  
  const [searchQuery, setSearchQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'week', 'month'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    refresh()
  }, [refresh])

  // Filter conversations based on search query and time filter
  const filteredConversations = useMemo(() => {
    const now = new Date().getTime()
    return conversations.filter((c) => {
      // Search filter (matches title or agentName)
      const title = (c.callSummaryTitle || c.agentName || '').toLowerCase()
      const matchesSearch = title.includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // Time filter
      if (timeFilter === 'all') return true
      if (!c.startTime) return false

      const callTime = new Date(c.startTime).getTime()
      if (isNaN(callTime)) return false

      const diffHours = (now - callTime) / (1000 * 60 * 60)

      if (timeFilter === 'today') {
        return diffHours <= 24
      }
      if (timeFilter === 'week') {
        return diffHours <= 24 * 7
      }
      if (timeFilter === 'month') {
        return diffHours <= 24 * 30
      }

      return true
    })
  }, [conversations, searchQuery, timeFilter])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, timeFilter])

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage) || 1
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Conversations</h1>
      <p className="text-slate-500 text-sm mb-8">Review all inbound AI call transcripts.</p>

      {/* Controls Bar: Search & Time Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] shadow-sm cursor-pointer appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">All Conversations</h2>
          {filteredConversations.length > 0 && (
            <span className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredConversations.length)} of {filteredConversations.length}
            </span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Caller</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && conversations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">Loading conversations...</td>
              </tr>
            )}

            {!loading && filteredConversations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">No conversations found matching your criteria.</td>
              </tr>
            )}

            {paginatedConversations.map((c) => (
              <tr 
                key={c.id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer" 
                onClick={() => navigate(`/conversations/${c.id}`)}
              >
                <td className="px-6 py-4 text-slate-500">
                  {c.startTime ? new Date(c.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center">
                    <span>{c.callSummaryTitle || c.agentName || 'Unknown'}</span>
                    {isTodayIso(c.startTime) && (
                      <span title="New conversation today" className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#20241C]/10 text-[#2B3528]">New</span>
                    )}
                    {c.hasUnacknowledgedActions && (
                      <span title="Action items pending" className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{c.durationDisplay || '—'}</td>
                <td className="px-6 py-4 text-right"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Index Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${
                    currentPage === num
                      ? 'bg-[#2B3528] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {hasMore && currentPage === totalPages && (
                <button
                  onClick={() => fetchNext()}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-[#2B3528] bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {error && <div className="px-6 py-2 text-xs text-red-600 text-center bg-red-50 border-t border-red-100">{error}</div>}
      </div>
    </div>
  )
}