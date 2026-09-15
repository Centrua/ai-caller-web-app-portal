import { useEffect, useState } from 'react'
import { 
  useNonApprovedSubscriptionRequests, 
  useApproveSubscriptionRequest, 
  type SubscriptionRequest 
} from '../../hooks/subscriptionRequestHooks'

export default function AdminSubscriptionRequests() {
  const { requests, fetchNonApprovedRequests, loading, error } = useNonApprovedSubscriptionRequests()
  const { approveRequest, loading: approvingLoading } = useApproveSubscriptionRequest()
  
  const [timestamps, setTimestamps] = useState<Record<number, string>>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    fetchNonApprovedRequests()
  }, [fetchNonApprovedRequests])

  const handleTimestampChange = (id: number, value: string) => {
    setTimestamps(prev => ({ ...prev, [id]: value }))
    if (validationError) setValidationError(null)
  }

  const handleApproveClick = async (id: number) => {
    const localValue = timestamps[id]
    if (!localValue) {
      setValidationError('Please select an onboarding date and time for this request.')
      return
    }

    setValidationError(null)

    try {
      // Convert the datetime-local value to a full ISO string
      const onboardingTimestamp = new Date(localValue).toISOString()
      
      await approveRequest(id, onboardingTimestamp)
      // Refresh the list after successful approval to remove the approved venue
      fetchNonApprovedRequests()
    } catch (err) {
      console.error('Failed to approve request:', err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 font-sans text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pending Subscription Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage incoming venue onboarding requests.</p>
        </div>
        <button
          onClick={() => fetchNonApprovedRequests()}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl transition-colors bg-white shadow-sm"
        >
          Refresh
        </button>
      </div>

      {loading && requests.length === 0 && (
        <div className="text-center py-16 text-slate-500">Loading pending requests...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {validationError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 text-sm">
          {validationError}
        </div>
      )}

      {!loading && requests.length === 0 && !error && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-slate-600 font-medium">No pending subscription requests found.</p>
          <p className="text-sm text-slate-400 mt-1">All caught up!</p>
        </div>
      )}

      {requests.length > 0 && (
        <div className="grid gap-4">
          {requests.map((req: SubscriptionRequest) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 transition-all hover:shadow-md"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{req.venue_name}</h3>
                  {req.requesting_demo && (
                    <span className="bg-[#2B3528]/10 text-[#2B3528] text-xs font-semibold px-3 py-1 rounded-full border border-[#2B3528]/20">
                      Live Demo & 40% Off Deal
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm text-slate-600 pt-1">
                  <div>
                    <span className="font-medium text-slate-700">Contact:</span> {req.name}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Email:</span> {req.email}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Phone:</span> {req.phone_number}
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <span className="font-medium text-slate-700">Address:</span> {req.venue_address}, {req.venue_city}, {req.venue_state} {req.venue_zip_code}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-slate-500 mb-1">Onboarding Date & Time</label>
                  <input
                    type="datetime-local"
                    value={timestamps[req.id] || ''}
                    onChange={(e) => handleTimestampChange(req.id, e.target.value)}
                    className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2B3528]/20 focus:border-[#2B3528]"
                  />
                </div>
                <button
                  onClick={() => handleApproveClick(req.id)}
                  disabled={approvingLoading}
                  className="bg-[#2B3528] hover:bg-[#444B38] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm self-end sm:self-auto mt-auto"
                >
                  {approvingLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}