import { useState } from 'react'
import TextKnowledgeBaseTab from './components/TextKnowledgeBaseTab'
import FileKnowledgeBaseTab from './components/FileKnowledgeBaseTab'

type TabType = 'text' | 'files'

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<TabType>('text')

  return (
    <div className="p-8 relative max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Knowledge Base</h1>
        <p className="text-slate-500 text-sm">
          Manage the documentation and text information your AI agent uses to answer incoming calls.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'text'
              ? 'border-[#2B3528] text-[#2B3528]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Text Document
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === 'files'
              ? 'border-[#2B3528] text-[#2B3528]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Files & Attachments
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'text' && <TextKnowledgeBaseTab />}
      {activeTab === 'files' && <FileKnowledgeBaseTab />}
    </div>
  )
}