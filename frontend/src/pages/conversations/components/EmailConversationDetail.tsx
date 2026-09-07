import { useState, useEffect } from 'react'
import { useApproveDraft, type Conversation } from '../../../hooks/emailConversationHooks'
import { useEditDraftBody } from '../../../hooks/outgoingHooks'
import { formatFromEmail } from '../../../utils/formatFromEmailUtil'

interface EmailConversationDetailProps {
  selectedConversation: Conversation
  onBack: () => void
  onRefreshConversations: () => Promise<any>
}

function parseHtmlToPlainText(html: string): string {
  if (!html) return ''
  const processedHtml = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
  const doc = new DOMParser().parseFromString(processedHtml, 'text/html')
  return doc.body.textContent || ''
}

export default function EmailConversationDetail({
  selectedConversation,
  onBack,
  onRefreshConversations,
}: EmailConversationDetailProps) {
  const { approveDraft, loading: approvingId } = useApproveDraft()
  const { editBody } = useEditDraftBody()

  const draftOutgoing = selectedConversation.outgoing?.filter(o => o.status === 'draft') || []
  const sentOutgoing = selectedConversation.outgoing?.filter(o => o.status === 'sent') || []

  const firstMessage = selectedConversation.messages?.[0]
  const conversationName = firstMessage?.subject || selectedConversation.subject || 'No Subject'

  const [draftBodies, setDraftBodies] = useState<Record<number, string>>({})
  const [savingIds, setSavingIds] = useState<Record<number, boolean>>({})
  const [leadInfo, setLeadInfo] = useState<any | null>(null)
  const [leadLoading, setLeadLoading] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)

  useEffect(() => {
    const initialBodies: Record<number, string> = {}
    draftOutgoing.forEach(d => {
      if (d.id !== undefined) {
        initialBodies[d.id] = parseHtmlToPlainText(d.body || '')
      }
    })
    setDraftBodies(initialBodies)
    // fetch lead info when conversation changes
    const fetchLead = async () => {
      setLeadInfo(null)
      setLeadError(null)
      if (!selectedConversation?.thread_id) return
      setLeadLoading(true)
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
        const token = localStorage.getItem('token')
        if (!token) throw new Error('No authentication token')
        const res = await fetch(`${API_BASE_URL}/api/lead-inquiries/${selectedConversation.thread_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) {
          if (res.status === 404) {
            setLeadInfo(null)
            return
          }
          const json = await res.json().catch(() => ({}))
          throw new Error(json.error || 'Failed to fetch lead info')
        }
        const json = await res.json()
        setLeadInfo(json)
      } catch (err: any) {
        console.error('[FetchLead Error]', err)
        setLeadError(err.message || 'Failed to fetch lead info')
      } finally {
        setLeadLoading(false)
      }
    }
    fetchLead()
  }, [selectedConversation])

  const handleBodyChange = (draftId: number, value: string) => {
    setDraftBodies(prev => ({ ...prev, [draftId]: value }))

    const timeoutKey = `timer_${draftId}`
    if ((window as any)[timeoutKey]) {
      clearTimeout((window as any)[timeoutKey])
    }

    setSavingIds((prev) => { 
      const updated = { ...prev }; 
      updated[draftId] = true; 
      return updated; 
    });

    (window as any)[timeoutKey] = setTimeout(async () => {
      try {
        // Convert text newlines into HTML break tags for correct email rendering
        const htmlBody = value.replace(/\r?\n/g, '<br/>')
        await editBody(draftId, htmlBody)
      } 
      catch (err) {
      } 
      finally {
        setSavingIds(prev => ({ ...prev, [draftId]: false }))
      }
    }, 600)
  }

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
    } catch (err) {
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
        {leadLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">Loading lead info...</div>
        )}
        {leadError && (
          <div className="bg-white rounded-xl border border-red-200 p-4 text-sm text-red-600">Error loading lead info: {leadError}</div>
        )}
        {leadInfo && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden px-6 py-4 mb-6">
            <h4 className="text-sm font-semibold text-slate-700">Lead Information</h4>
            <div className="mt-2 text-sm text-slate-800 space-y-1">
              <div><span className="font-semibold">Name:</span> {leadInfo.lead_name || leadInfo.name || '-'}</div>
              <div><span className="font-semibold">Phone:</span> {leadInfo.lead_phone || leadInfo.phone || '-'}</div>
              <div><span className="font-semibold">Guest Count:</span> {leadInfo.guest_count ?? (leadInfo.guestCount ?? '-')}</div>
              <div><span className="font-semibold">Wedding Date:</span> {leadInfo.wedding_date || leadInfo.weddingDate || '-'}</div>
              <div><span className="font-semibold">Tour Requested:</span> {typeof leadInfo.tour_requested === 'boolean' ? (leadInfo.tour_requested ? 'Yes' : 'No') : (leadInfo.tourRequested === true ? 'Yes' : (leadInfo.tourRequested === false ? 'No' : '-'))}</div>
            </div>
          </div>
        )}
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
          } else {
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
            <h3 className="text-sm font-semibold text-amber-900 px-1 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>Pending Automation Response Waiting to be Sent</span>
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full">{draftOutgoing.length}</span>
              </span>
            </h3>
            {draftOutgoing.map((draft, idx) => {
              const draftId = draft.id ?? idx
              const currentText = draftBodies[draft.id] ?? parseHtmlToPlainText(draft.body || '')
              const isSaving = savingIds[draft.id]

              return (
                <div key={draftId} className="bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm p-6 relative">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60 text-xs text-amber-900/70">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-amber-900/90">Suggested Reply (Editable)</span>
                      {isSaving && (
                        <span className="inline-flex items-center text-xs text-amber-700 gap-1.5 font-medium">
                          <svg className="animate-spin h-3.5 w-3.5 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </span>
                      )}
                    </div>
                    <div>
                      {draft.createdAt ? new Date(draft.createdAt).toLocaleString() : ''}
                    </div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={currentText}
                      ref={(node) => {
                        if (node) {
                          node.style.height = 'auto'
                          node.style.height = `${node.scrollHeight}px`
                        }
                      }}
                      onChange={(e) => handleBodyChange(draft.id, e.target.value)}
                      rows={1}
                      className="w-full bg-white rounded-lg border border-amber-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 p-4 text-sm text-slate-800 leading-relaxed outline-none transition-all resize-none overflow-hidden shadow-inner whitespace-pre-wrap"
                      placeholder="Type your reply here..."
                    />
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => handleApprove(draft.id)}
                      disabled={Boolean(approvingId || isSaving)}
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}