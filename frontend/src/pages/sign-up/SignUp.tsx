import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRegister } from '../../hooks/authHooks'
import { useVenues } from '../../hooks/venueHooks'

export default function Register() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null)
    const [isRegistered, setIsRegistered] = useState<boolean>(false)
    const [showPromptModal, setShowPromptModal] = useState<boolean>(false)

    const { register, loading, error } = useRegister()
    const { venues, getAllVenues, loading: venuesLoading } = useVenues()

    useEffect(() => {
        getAllVenues()
    }, [getAllVenues])

    useEffect(() => {
        const mode = searchParams.get('mode')
        if (mode === 'apply-venue') {
            setShowPromptModal(true)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedVenueId) {
            return
        }
        const user = await register({
            name,
            email,
            password,
            venueId: selectedVenueId
        })
        if (user) {
            setIsRegistered(true)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
            {showPromptModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-8 text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Registration</h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8">
                            Please register your user account and apply to your venue.
                        </p>
                        <button
                            onClick={() => setShowPromptModal(false)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm cursor-pointer"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {isRegistered && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-8 text-center flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Await Administrator Approval</h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-8">
                            Your account has been created and linked to the venue. The venue owner must open their email inbox and click the approval link sent to them before you can access your dashboard.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm cursor-pointer"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left Column: Venue Selection */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Select your venue</h2>
                        <p className="text-slate-500 text-sm mb-6">Choose the venue you want to be associated with</p>

                        {venuesLoading ? (
                            <div className="text-center py-8 text-sm text-slate-400">Loading venues...</div>
                        ) : venues.length === 0 ? (
                            <div className="text-center py-8 text-sm text-slate-400">No venues available</div>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-scroll pr-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {venues.map((venue) => {
                                    const isSelected = selectedVenueId === venue.id
                                    return (
                                        <div
                                            key={venue.id}
                                            onClick={() => setSelectedVenueId(venue.id)}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <div className="font-medium text-sm text-slate-900">{venue.name}</div>
                                            {venue.email && <div className="text-xs text-slate-500 mt-0.5">{venue.email}</div>}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {selectedVenueId && (
                        <div className="text-xs text-indigo-600 font-medium mt-4">
                            ✓ Venue selected
                        </div>
                    )}
                </div>

                {/* Right Column: Register Form */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col justify-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
                        <p className="text-slate-500 text-sm mt-1">Register to join your venue portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg p-3">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                required
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                required
                                placeholder="you@venue.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                            <input
                                type="password"
                                id="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !selectedVenueId}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}