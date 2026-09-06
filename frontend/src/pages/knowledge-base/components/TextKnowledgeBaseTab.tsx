import { useState, useEffect } from 'react'
import { useKnowledgeBase } from '../../../hooks/knowledgeBaseHooks'

export default function TextKnowledgeBaseTab() {
  const { content, loading, error, getKnowledgeBaseText, saveKnowledgeBaseText } = useKnowledgeBase()
  const [textValue, setTextValue] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    getKnowledgeBaseText().then((fetched) => {
      if (fetched) setTextValue(fetched)
    })
  }, [getKnowledgeBaseText])

  useEffect(() => {
    if (content) {
      setTextValue(content)
    }
  }, [content])

  const handleSave = async () => {
    try {
      setSuccessMessage(null)
      await saveKnowledgeBaseText('Knowledge Base Document', textValue)
      setSuccessMessage('Knowledge base saved and synchronized successfully!')
      setTimeout(() => setSuccessMessage(null), 2500)
    } catch {
      // Error handled by hook
    }
  }

  return (
    <div>
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            Knowledge Content (Plain Text or Markdown)
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {textValue.length} characters
          </span>
        </div>

        <textarea
          rows={16}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Paste menu items, reservation windows, operating hours, prices, or general FAQs here..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#2B3528] focus:bg-white transition-all resize-y"
        />

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Changes are compiled instantly and deployed directly to your ElevenLabs conversational agent.
          </p>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-[#2B3528] hover:bg-[#444B38] disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {loading ? 'Saving Changes...' : 'Save & Sync'}
          </button>
        </div>
      </div>
    </div>
  )
}
