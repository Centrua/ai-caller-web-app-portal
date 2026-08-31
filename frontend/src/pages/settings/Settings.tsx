export default function Settings() {
    return (
        <div className="p-8 max-w-2xl">
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Settings</h1>
            <p className="text-slate-500 text-sm mb-8">Manage your venue and agent configuration.</p>

            {/* Venue Details */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-700">Venue Details</h2>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                    {[
                        { label: 'Venue Name', placeholder: 'e.g. The Grand Hotel', type: 'text' },
                        { label: 'Email', placeholder: 'contact@venue.com', type: 'email' },
                        { label: 'Phone', placeholder: '+1 (555) 000-0000', type: 'tel' },
                    ].map(({ label, placeholder, type }) => (
                        <div key={label}>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                            <input
                                type={type}
                                placeholder={placeholder}
                                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end pt-2">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* ElevenLabs Config */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-700">ElevenLabs Configuration</h2>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">
                    {[
                        { label: 'Agent ID', placeholder: 'agent_...' },
                        { label: 'Phone Number ID', placeholder: 'phone_...' },
                    ].map(({ label, placeholder }) => (
                        <div key={label}>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                            <input
                                type="text"
                                placeholder={placeholder}
                                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                    ))}
                    <div className="flex justify-end pt-2">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
