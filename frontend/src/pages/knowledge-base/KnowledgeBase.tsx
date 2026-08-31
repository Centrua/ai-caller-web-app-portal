const mockSources = [
    { id: 1, name: 'Restaurant Menu', type: 'Document', updated: '2 days ago' },
    { id: 2, name: 'Opening Hours & FAQs', type: 'Document', updated: '1 week ago' },
    { id: 3, name: 'Reservation Policy', type: 'Document', updated: '3 weeks ago' },
]

export default function KnowledgeBase() {
    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 mb-1">Knowledge Base</h1>
                    <p className="text-slate-500 text-sm">Documents your AI agent uses to answer callers.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Source
                </button>
            </div>

            <div className="grid gap-4">
                {mockSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm hover:border-indigo-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{source.name}</p>
                                <p className="text-xs text-slate-400">{source.type} · Updated {source.updated}</p>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    )
}
