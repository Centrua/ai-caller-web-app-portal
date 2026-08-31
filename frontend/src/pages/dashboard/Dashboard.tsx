export default function Dashboard() {
    const stats = [
        { label: 'Total Calls', value: '1,284', change: '+12%' },
        { label: 'Avg Duration', value: '3m 42s', change: '+4%' },
        { label: 'Knowledge Sources', value: '8', change: '+2' },
        { label: 'Active Agents', value: '3', change: '—' },
    ]

    return (
        <div className="p-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm mb-8">Welcome back. Here's what's happening.</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-5 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-1">{stat.change} this month</p>
                    </div>
                ))}
            </div>

            {/* Placeholder chart area */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">Call Volume — Last 30 Days</h2>
                <div className="h-48 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Chart coming soon</p>
                </div>
            </div>
        </div>
    )
}
