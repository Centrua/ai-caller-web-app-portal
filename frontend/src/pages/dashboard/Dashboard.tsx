import { useEffect, useState } from 'react'
import { useDashboard } from '../../hooks/dashboardHooks'

export default function Dashboard() {
    const { metrics, getMetrics, loading, error } = useDashboard()
    const [hoveredBar, setHoveredBar] = useState<{ date: string; count: number } | null>(null)

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
                        <p className="text-3xl font-bold text-[#2B3528]">
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
                            <span className="text-[#2B3528] font-semibold">{hoveredBar.date}: {hoveredBar.count} calls</span>
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
                                                        ? 'bg-[#2B3528] shadow-lg scale-y-[1.03]' 
                                                        : 'bg-[#444B38] hover:bg-[#2B3528]'
                                                }`} 
                                                style={{ height: `${heightPercent}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-[11px] transition-colors ${isHovered ? 'text-[#2B3528] font-bold' : 'text-slate-500'}`}>
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

            {/* See Conversations Button */}
            <div>
                <a
                    href="/conversations"
                    className="flex items-center justify-center w-full py-5 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-[#2B3528] font-semibold text-lg rounded-xl shadow-sm transition-colors text-center"
                >
                    See Conversations
                </a>
            </div>
        </div>
    )
}