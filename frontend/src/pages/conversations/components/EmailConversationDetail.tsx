import { useApproveDraft, type Conversation } from '../../../hooks/emailConversationHooks'
import { formatFromEmail } from '../../../utils/formatFromEmailUtil'

interface EmailConversationDetailProps {
  selectedConversation: Conversation
  onBack: () => void
  onRefreshConversations: () => Promise<any>
}

export default function EmailConversationDetail({
  selectedConversation,
  onBack,
  onRefreshConversations,
}: EmailConversationDetailProps) {
  const { approveDraft, loading: approvingId } = useApproveDraft()

  const draftOutgoing = selectedConversation.outgoing?.filter(o => o.status === 'draft') || []
  const sentOutgoing = selectedConversation.outgoing?.filter(o => o.status === 'sent') || []

  const firstMessage = selectedConversation.messages?.[0]
  const conversationName = firstMessage?.subject || selectedConversation.subject || 'No Subject'

  const allConversationItems = [
    ...(selectedConversation.messages || []).map(m => ({ ...m, type: 'message' as const })),
    ...sentOutgoing.map(s => ({ ...s, type: 'sent_outgoing' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime()
    const dateB = new Date(b.createdAt || 0).getTime()
    return dateA - dateB
  })

  const handleApprove = async (draftId: number) => {
    try {
      await approveDraft(draftId)
      await onRefreshConversations()
    }
    catch (err) {
      // Error handled within hook
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
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
            {conversationName}
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
        <h3 className="text-sm font-semibold text-slate-700 px-1">Message Transaction ({allConversationItems.length})</h3>

        {allConversationItems.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
            No messages found for this thread.
          </div>
        )}

        {allConversationItems.map((item, idx) => {
          if (item.type === 'message') {
            const msg = item
            return (
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
            )
          } 
          else {
            const sent = item
            return (
              <div key={sent.id || idx} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700 mr-2">Sent Reply</span>
                  </div>
                  <div>
                    {sent.updatedAt ? new Date(sent.updatedAt).toLocaleString() : ''}
                  </div>
                </div>
                {sent.body ? (
                  <div
                    className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sent.body }}
                  />
                ) : (
                  <div className="text-sm text-slate-400 italic">No content available.</div>
                )}
              </div>
            )
          }
        })}

        {draftOutgoing.length > 0 && (
          <div className="mb-6 space-y-4 mt-10">
            <h3 className="text-sm font-semibold text-amber-900 px-1 flex items-center gap-2">
              <span>Pending Automation Response Waiting to be Sent</span>
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">{draftOutgoing.length}</span>
            </h3>
            {draftOutgoing.map((draft, idx) => (
              <div key={draft.id || idx} className="bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60 text-xs text-amber-900/70">
                  <div>
                    <span className="font-semibold text-amber-900/90 mr-2">Suggested Reply</span>
                  </div>
                  <div>
                    {draft.createdAt ? new Date(draft.createdAt).toLocaleString() : ''}
                  </div>
                </div>
                {draft.body ? (
                  <div
                    className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: draft.body }}
                  />
                ) : (
                  <div className="text-sm text-slate-400 italic mb-4">No draft content available.</div>
                )}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => handleApprove(draft.id)}
                    disabled={approvingId}
                    className="flex items-center gap-2 bg-[#2B3528] hover:bg-[#444B38] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {approvingId ? 'Sending...' : 'Approve & Send'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}