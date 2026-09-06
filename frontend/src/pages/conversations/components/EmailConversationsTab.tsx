import { useEffect, useState, useMemo } from 'react'
import { useEmailConversations } from '../../../hooks/emailConversationHooks'
import EmailConversationDetail from './EmailConversationDetail'
import type { Conversation } from '../../../hooks/emailConversationHooks'

export default function EmailConversationsTab() {
  const { conversations, getConversations, loading } = useEmailConversations()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
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

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const firstMsg = c.messages?.[0]
      const conversationName = (firstMsg?.subject || c.subject || '').toLowerCase()
      const threadId = (c.thread_id || '').toLowerCase()
      const query = searchQuery.toLowerCase()
      return conversationName.includes(query) || threadId.includes(query)
    })
  }, [conversations, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage) || 1
  const paginatedConversations = filteredConversations.slice(
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
          <h2 className="text-sm font-semibold text-slate-700">Email Threads</h2>
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
              const conversationName = firstMsg?.subject || c.subject || 'No Subject'

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