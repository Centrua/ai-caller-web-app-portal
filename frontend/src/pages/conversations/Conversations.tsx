const mockConversations = [
  { id: 1, caller: '+1 (555) 012-3456', duration: '4m 12s', status: 'Completed', date: 'Today, 2:14 PM' },
  { id: 2, caller: '+1 (555) 987-6543', duration: '1m 58s', status: 'Completed', date: 'Today, 11:02 AM' },
  { id: 3, caller: '+1 (555) 333-4444', duration: '0m 32s', status: 'No Answer', date: 'Yesterday, 6:45 PM' },
  { id: 4, caller: '+1 (555) 111-2222', duration: '7m 01s', status: 'Completed', date: 'Yesterday, 3:10 PM' },
  { id: 5, caller: '+1 (555) 555-0001', duration: '2m 20s', status: 'Completed', date: 'Aug 29, 10:30 AM' },
]

const statusColor: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-700',
  'No Answer': 'bg-slate-100 text-slate-500',
  Failed: 'bg-red-100 text-red-600',
}

export default function Conversations() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Conversations</h1>
      <p className="text-slate-500 text-sm mb-8">Review all inbound AI call transcripts.</p>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Caller</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Duration</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {mockConversations.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-5 py-4 font-medium text-slate-800">{c.caller}</td>
                <td className="px-5 py-4 text-slate-500">{c.duration}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-400">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
