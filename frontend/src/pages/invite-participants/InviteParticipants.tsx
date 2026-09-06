import { useState, useEffect } from 'react'
import { useGetRegisterTokens, type RegisterTokenItem } from '../../hooks/registerTokenHooks'
import { useVenue } from '../../hooks/venueHooks'

export default function InviteParticipants() {
  const { tokens, getRegisterTokens, loading, error } = useGetRegisterTokens()
  const { venueName, getVenueName } = useVenue()

  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    getVenueName()
    getRegisterTokens()
  }, [getVenueName, getRegisterTokens])

  const handleCopy = (tokenItem: RegisterTokenItem) => {
    const inviteUrl = `${window.location.origin}/register?token=${encodeURIComponent(tokenItem.plainToken)}`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedId(tokenItem.id)
    setSuccessMessage('Invite link copied to clipboard!')
    setTimeout(() => {
      setCopiedId(null)
      setSuccessMessage(null)
    }, 2500)
  }

  const handleCopyTokenOnly = (tokenItem: RegisterTokenItem) => {
    navigator.clipboard.writeText(tokenItem.plainToken)
    setCopiedId(tokenItem.id)
    setSuccessMessage('Registration token copied!')
    setTimeout(() => {
      setCopiedId(null)
      setSuccessMessage(null)
    }, 2500)
  }

  return (
    <div className="p-8 relative max-w-6xl mx-auto">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-6 left-[calc(50%+128px)] -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Invite Participants</h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Manage registration tokens and generate invite links for staff.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tokens List Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading tokens...
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-slate-600 text-sm font-medium">No active tokens found</p>
            <p className="text-slate-400 text-xs mt-1">Tokens generated for your venue will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tokens.map((tokenItem) => (
              <div key={tokenItem.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="font-mono text-sm bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-md text-slate-800 inline-block">
                      {tokenItem.plainToken}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Share this code or invite link with new team members to authorize their registration.</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleCopyTokenOnly(tokenItem)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={() => handleCopy(tokenItem)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2B3528] hover:bg-[#444B38] rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {copiedId === tokenItem.id ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied Link
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy Invite Link
                      </>
                    )}
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
