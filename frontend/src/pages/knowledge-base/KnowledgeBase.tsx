import { useState, useEffect } from 'react'
import { useKnowledgeBase } from '../../hooks/knowledgeBaseHooks'

export default function KnowledgeBase() {
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
            setSuccessMessage('Knowledge base saved and synchronized with your AI agent successfully!')
            setTimeout(() => setSuccessMessage(null), 4000)
        } 
        catch {
            // Error handled by hook
        }
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 mb-1">Knowledge Base</h1>
                    <p className="text-slate-500 text-sm">Manage the information your AI agent uses to answer incoming calls.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {loading ? 'Saving Changes...' : 'Save & Sync'}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                    {successMessage}
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">
                        Knowledge Content (Plain Text or Markdown)
                    </label>
                    <span className="text-xs text-slate-400">
                        {textValue.length} characters
                    </span>
                </div>
                
                <textarea 
                    rows={18}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Paste menu items, reservation windows, operating hours, prices, or general FAQs here..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y"
                />
                
                <p className="text-xs text-slate-400">
                    Changes are compiled instantly and deployed directly to your ElevenLabs conversational agent.
                </p>
            </div>
        </div>
    )
}