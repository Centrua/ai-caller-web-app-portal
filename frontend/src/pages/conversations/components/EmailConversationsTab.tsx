import { useEffect, useState, useMemo } from 'react'
import { cleanSubject } from '../../../utils/cleanSubjectTextUtil'
import { useEmailConversations } from '../../../hooks/emailConversationHooks'
import EmailConversationDetail from './EmailConversationDetail'
import type { Conversation } from '../../../hooks/emailConversationHooks'

function isTodayIso(iso?: string) {
  if (!iso) return false
  const d = new Date(iso)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export default function EmailConversationsTab() {
  const { conversations, getConversations, loading } = useEmailConversations()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    getConversations()
  }, [getConversations])

  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id)
      if (updated) {
        setSelectedConversation(updated)
      }
    }
  }, [conversations])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await getConversations()
    }
    finally {
      setIsRefreshing(false)
    }
  }

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const firstMsg = c.messages?.[0]
      const rawSubject = firstMsg?.subject || c.subject || ''
      const conversationName = cleanSubject(rawSubject).toLowerCase()
      const threadId = (c.thread_id || '').toLowerCase()
      const query = searchQuery.toLowerCase()
      return conversationName.includes(query) || threadId.includes(query)
    })
  }, [conversations, searchQuery])

  // Sort filtered conversations by the most recent activity (newest first)
  const sortedConversations = useMemo(() => {
    const getLatestTime = (c: any) => {
      const msgTimes = (c.messages || []).map((m: any) => new Date(m.createdAt || 0).getTime())
      const outTimes = (c.outgoing || []).map((o: any) => new Date(o.updatedAt || o.createdAt || 0).getTime())
      const all = [...msgTimes, ...outTimes]
      return all.length ? Math.max(...all) : 0
    }

    return [...filteredConversations].sort((a, b) => getLatestTime(b) - getLatestTime(a))
  }, [filteredConversations])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(sortedConversations.length / itemsPerPage) || 1
  const paginatedConversations = sortedConversations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (selectedConversation) {
    return (
      <EmailConversationDetail
        selectedConversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
        onRefreshConversations={getConversations}
      />
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search email threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Email Threads</h2>
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="inline-flex items-center justify-center p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 focus:outline-none focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh threads"
            >
              <svg
                className={`w-3.5 h-3.5 ${(loading || isRefreshing) ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          {filteredConversations.length > 0 && (
            <span className="text-xs text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredConversations.length)} of {filteredConversations.length}
            </span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Thread ID</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Messages</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && conversations.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400">Loading email conversations...</td>
              </tr>
            )}

            {!loading && filteredConversations.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400">No email conversations found.</td>
              </tr>
            )}

            {paginatedConversations.map((c) => {
              const hasDrafts = c.outgoing?.some(o => o.status === 'draft')
              const firstMsg = c.messages?.[0]
              const rawSubject = firstMsg?.subject || c.subject || ''
              const conversationName = cleanSubject(rawSubject)

              return (
                <tr
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2.5">
                    {hasDrafts && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" title="Draft pending"></span>
                    )}
                    <span>{conversationName}</span>
                    {isTodayIso(firstMsg?.createdAt || c.createdAt) && (
                      <span title="New conversation today" className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#20241C]/10 text-[#2B3528]">New</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{c.thread_id}</td>
                  <td className="px-6 py-4 text-slate-500">{c.messages?.length || 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

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
                  className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${currentPage === num
                    ? 'bg-[#2B3528] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}