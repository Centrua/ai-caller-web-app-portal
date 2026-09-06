import { useState } from 'react'
import PhoneCallConversationsTab from './components/PhoneCallConversationsTab'
import EmailConversationsTab from './components/EmailConversationsTab'

export default function Conversations() {
  const [activeTab, setActiveTab] = useState<'calls' | 'emails'>('calls')

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Conversations</h1>
      <p className="text-slate-500 text-sm mb-6">Review all communications and interactions.</p>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('calls')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'calls'
              ? 'border-[#2B3528] text-[#2B3528]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Phone Call Conversations
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'emails'
              ? 'border-[#2B3528] text-[#2B3528]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Email Conversations
        </button>
      </div>

      {activeTab === 'calls' ? <PhoneCallConversationsTab /> : <EmailConversationsTab />}
    </div>
  )
}