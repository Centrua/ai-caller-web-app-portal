import { useEffect, useState } from 'react'
import { useDashboard } from '../../hooks/dashboardHooks'

export default function Dashboard() {
    const { metrics, getMetrics, loading, error } = useDashboard()
    const [hoveredBar, setHoveredBar] = useState<{ date: string; count: number } | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        getMetrics()
    }, [getMetrics])

    const stats = [
        { label: 'Calls Today', value: metrics ? metrics.callsToday.toLocaleString() : '—' },
        { label: 'Calls This Week', value: metrics ? metrics.callsThisWeek.toLocaleString() : '—' },
        { label: 'Total Calls', value: metrics ? metrics.totalCalls.toLocaleString() : '—' },
        { label: 'Avg Call Duration', value: metrics ? metrics.averageCallDurationFormatted : '—' },
        { label: 'Successful Calls', value: metrics ? metrics.successfulCalls.toLocaleString() : '—' },
        { label: 'Success Rate', value: metrics ? metrics.successRate : '—' },
    ]

    const recentConversations = metrics?.recentConversations ?? []
    const totalPages = Math.ceil(recentConversations.length / itemsPerPage) || 1
    const paginatedConversations = recentConversations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const formatDuration = (secs?: number) => {
        if (!secs) return '0s'
        const mins = Math.floor(secs / 60)
        const remainingSecs = secs % 60
        return mins > 0 ? `${mins}m ${remainingSecs}s` : `${remainingSecs}s`
    }

    const formatTime = (unixSecs?: number) => {
        if (!unixSecs) return '—'
        const date = new Date(unixSecs * 1000)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm mb-8">Welcome back. Check here for quick stats over your venue's AI caller agent.</p>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900">
                            {loading && !metrics ? (
                                <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded"></span>
                            ) : (
                                stat.value
                            )}
                        </p>
                    </div>
                ))}
            </div>

            {/* Calls-Over-Time Chart Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-700">Calls-Over-Time — Last 7 Days</h2>
                    <div className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md min-w-[140px] text-center">
                        {hoveredBar ? (
                            <span className="text-indigo-600 font-semibold">{hoveredBar.date}: {hoveredBar.count} calls</span>
                        ) : (
                            <span className="text-slate-400">Hover a bar for details</span>
                        )}
                    </div>
                </div>
                <div className="h-52 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 p-4">
                    {metrics?.callsOverTime && metrics.callsOverTime.length > 0 ? (
                        <div className="flex items-end gap-6 h-36 px-4 w-full justify-around pt-6">
                            {metrics.callsOverTime.map((item) => {
                                const maxCount = Math.max(...metrics.callsOverTime.map(c => c.count), 1)
                                const heightPercent = Math.max((item.count / maxCount) * 100, 10)
                                const isHovered = hoveredBar?.date === item.date

                                return (
                                    <div 
                                        key={item.date} 
                                        className="flex flex-col items-center gap-2 h-full justify-end cursor-pointer group flex-1"
                                        onMouseEnter={() => setHoveredBar(item)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    >
                                        <div className="relative flex flex-col items-center w-full h-full justify-end">
                                            {isHovered && (
                                                <div className="absolute -top-7 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded shadow-md whitespace-nowrap z-10">
                                                    {item.count} {item.count === 1 ? 'call' : 'calls'}
                                                </div>
                                            )}
                                            <div 
                                                className={`w-10 rounded-t transition-all duration-200 ${
                                                    isHovered 
                                                        ? 'bg-indigo-600 shadow-lg scale-y-[1.03]' 
                                                        : 'bg-indigo-500 hover:bg-indigo-600'
                                                }`} 
                                                style={{ height: `${heightPercent}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-[11px] transition-colors ${isHovered ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                                            {item.date}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">
                            {loading ? 'Loading chart data...' : 'No chart data available'}
                        </p>
                    )}
                </div>
            </div>

            {/* Recent Conversations List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">Recent Conversations</h2>
                    {recentConversations.length > 0 && (
                        <span className="text-xs text-slate-400">
                            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, recentConversations.length)} of {recentConversations.length}
                        </span>
                    )}
                </div>
                <div className="divide-y divide-slate-100">
                    {loading && recentConversations.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-slate-400">Loading conversations...</div>
                    ) : recentConversations.length === 0 ? (
                        <div className="px-6 py-8 text-center text-sm text-slate-400">No recent conversations found.</div>
                    ) : (
                        paginatedConversations.map((conv) => {
                            const convId = conv.conversation_id || conv.id
                            const durationStr = formatDuration(conv.call_duration_secs)
                            const timeStr = formatTime(conv.start_time_unix_secs)
                            const statusStr = conv.status || 'unknown'

                            return (
                                <a 
                                    key={convId}
                                    href={`/conversations/${convId}`}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            Conversation <span className="text-slate-400 font-normal">({convId})</span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{timeStr}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-1 ${
                                            ['success', 'done', 'completed'].includes(statusStr.toLowerCase())
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {statusStr}
                                        </span>
                                        <p className="text-xs text-slate-500">{durationStr}</p>
                                    </div>
                                </a>
                            )
                        })
                    )}
                </div>

                {/* Pagination Index Footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                    className={`w-7 h-7 text-xs font-medium rounded-md transition-colors ${
                                        currentPage === num
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-200/60'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}