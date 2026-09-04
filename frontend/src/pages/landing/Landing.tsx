import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        ),
        title: 'Always-On Call Handling',
        description: 'Your AI agent answers every inquiry 24/7 — no missed calls, no hold music, no frustration.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: 'Natural Conversations',
        description: 'Powered by ElevenLabs, your agent speaks warmly and naturally — indistinguishable from your best team member.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        ),
        title: 'Venue Knowledge Base',
        description: 'Upload your menus, pricing, and FAQs. Your agent answers questions accurately, every time.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        title: 'Full Conversation History',
        description: 'Every call is logged and searchable. Review transcripts and follow up with couples at the right moment.',
    },
]

const steps = [
    { number: '01', title: 'Set up your venue', description: 'Add your venue details and upload your knowledge documents in minutes.' },
    { number: '02', title: 'Configure your agent', description: 'Connect your ElevenLabs agent and phone number — no coding required.' },
    { number: '03', title: 'Start taking calls', description: 'Your AI agent goes live and handles every inquiry, around the clock.' },
]

export default function Landing() {

    return (
        <div className="min-h-screen bg-white text-slate-900 relative">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                    <span className="font-bold text-lg tracking-tight text-slate-900">Centrua</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        to="/register"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        Register venue
                    </Link>
                    <Link
                        to="/login"
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Sign in →
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-8 pt-24 pb-32 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    AI-powered for wedding venues
                </div>

                <h1 className="text-6xl font-bold leading-[1.1] tracking-tight mb-6 max-w-3xl mx-auto text-slate-900">
                    Your venue's{' '}
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                        AI receptionist
                    </span>
                    , always on call
                </h1>

                <p className="text-slate-500 text-xl leading-relaxed max-w-xl mx-auto mb-10">
                    Centrua handles every couple's inquiry with warmth and precision — so your team can focus on creating unforgettable experiences.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link
                        to="/register"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200"
                    >
                        Register venue
                    </Link>
                    <a
                        href="#how-it-works"
                        className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors flex items-center gap-1.5"
                    >
                        See how it works
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </a>
                </div>

                {/* Mock UI preview */}
                <div className="mt-20 bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-xl shadow-slate-200/80 max-w-4xl mx-auto">
                    <div className="flex rounded-xl overflow-hidden">
                        {/* Sidebar preview */}
                        <div className="w-48 bg-[#0f1117] p-4 border-r border-white/5 shrink-0">
                            <div className="flex items-center gap-2 mb-6 px-1">
                                <div className="w-6 h-6 rounded-md bg-indigo-600 shrink-0"></div>
                                <div className="h-2.5 w-20 bg-white/10 rounded-full"></div>
                            </div>
                            {['Dashboard', 'Conversations', 'Knowledge Base'].map((item, i) => (
                                <div
                                    key={item}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 ${i === 0 ? 'bg-indigo-600' : ''}`}
                                >
                                    <div className={`w-3.5 h-3.5 rounded-sm ${i === 0 ? 'bg-white/60' : 'bg-white/15'}`}></div>
                                    <div className={`h-2 rounded-full ${i === 0 ? 'bg-white/70 w-16' : 'bg-white/10 w-14'}`}></div>
                                </div>
                            ))}
                        </div>
                        {/* Content preview */}
                        <div className="flex-1 bg-slate-50 p-6">
                            <div className="h-4 w-32 bg-slate-200 rounded-full mb-1.5"></div>
                            <div className="h-2.5 w-48 bg-slate-100 rounded-full mb-6"></div>
                            <div className="grid grid-cols-4 gap-3 mb-5">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                        <div className="h-2 w-12 bg-slate-200 rounded-full mb-3"></div>
                                        <div className="h-6 w-10 bg-slate-800 rounded-lg mb-1"></div>
                                        <div className="h-1.5 w-8 bg-indigo-200 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="h-2.5 w-36 bg-slate-200 rounded-full mb-4"></div>
                                <div className="h-28 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                                    <div className="h-2 w-24 bg-slate-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-6xl mx-auto px-8 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-3 text-slate-900">Everything your venue needs</h2>
                        <p className="text-slate-500">Built specifically for the wedding industry, from first inquiry to final booking.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-indigo-200 hover:shadow-md transition-all duration-200 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="max-w-6xl mx-auto px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-3 text-slate-900">Up and running in minutes</h2>
                    <p className="text-slate-500">No developers. No lengthy setup. Just results.</p>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div key={step.number} className="text-center">
                            <div className="text-5xl font-bold text-indigo-100 mb-4">{step.number}</div>
                            <h3 className="text-lg font-semibold mb-2 text-slate-900">{step.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-8 py-24">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-16 text-center shadow-xl shadow-indigo-200">
                        <h2 className="text-4xl font-bold mb-4 text-white">Ready to transform your venue?</h2>
                        <p className="text-indigo-100 mb-8 max-w-md mx-auto">Join forward-thinking venues already using Centrua to win more bookings with less effort.</p>
                        <Link
                            to="/register"
                            className="inline-flex bg-white hover:bg-slate-50 text-indigo-700 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg"
                        >
                            Register your venue
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-8 px-8 max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </div>
                    <span className="font-semibold text-sm text-slate-800">Centrua</span>
                </div>
                <p className="text-slate-400 text-xs">© 2026 Centrua. All rights reserved.</p>
            </footer>

        </div>
    )
}