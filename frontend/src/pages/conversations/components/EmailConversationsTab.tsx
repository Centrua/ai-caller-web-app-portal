import { useEffect, useState, useMemo } from 'react'
import { useEmailConversations, type Conversation } from '../../../hooks/emailConversationHooks'
import { formatFromEmail } from '../../../utils/formatFromEmailUtil'

export default function EmailConversationsTab() {
  const { conversations, getConversations, loading, error } = useEmailConversations()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    getConversations()
  }, [getConversations])

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const subject = (c.subject || '').toLowerCase()
      const threadId = (c.thread_id || '').toLowerCase()
      const query = searchQuery.toLowerCase()
      return subject.includes(query) || threadId.includes(query)
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
    const draftOutgoing = selectedConversation.outgoing?.filter(o => o.status === 'draft') || []

    return (
      <div>
        <button
          onClick={() => setSelectedConversation(null)}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-[#2B3528] mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Email Threads
        </button>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 leading-snug">
              {selectedConversation.subject || 'No Subject'}
            </h2>
            {draftOutgoing.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 mr-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Draft Pending Attachment
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 px-1">Message Transaction ({selectedConversation.messages?.length || 0})</h3>

          {(!selectedConversation.messages || selectedConversation.messages.length === 0) && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
              No messages found for this thread.
            </div>
          )}

          {selectedConversation.messages?.map((msg, idx) => (
            <div key={msg.id || idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700 mr-2">From:</span>
                  {formatFromEmail(msg.from)}
                </div>
                <div>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                </div>
              </div>
              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {msg.snippet || 'No message content available.'}
              </div>
            </div>
          ))}

          {draftOutgoing.length > 0 && (
            <div className="mb-6 space-y-4 mt-10">
              <h3 className="text-sm font-semibold text-amber-900 px-1 flex items-center gap-2">
                <span>Pending Automation Response Waiting to be Sent</span>
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">{draftOutgoing.length}</span>
              </h3>
              {draftOutgoing.map((draft, idx) => (
                <div key={draft.id || idx} className="bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200/60 text-xs text-amber-900/70">
                    <span>{draft.createdAt ? new Date(draft.createdAt).toLocaleString() : ''}</span>
                  </div>
                  {draft.body ? (
                    <div
                      className="text-sm text-slate-800 leading-relaxed bg-white/70 p-4 rounded-lg border border-amber-200/50 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: draft.body }}
                    />
                  ) : (
                    <div className="text-sm text-slate-400 italic">No draft content available.</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
              const hasDraft = c.outgoing?.some(o => o.status === 'draft')

              return (
                <tr
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2.5">
                    {hasDraft && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" title="Draft pending"></span>
                    )}
                    <span>{c.subject || 'No Subject'}</span>
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

        {error && <div className="px-6 py-2 text-xs text-red-600 text-center bg-red-50 border-t border-red-100">{error}</div>}
      </div>
    </div>
  )
}