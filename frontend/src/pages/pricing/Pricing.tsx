import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../landing/components/Navbar'
import Footer from '../landing/components/Footer'

export default function Pricing() {
    return (
        <div className="min-h-screen bg-white text-slate-900 relative">
            <Navbar page={"Pricing"}/>
        <section className="max-w-6xl mx-auto px-8 pt-12 pb-24 overflow-visible">
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 bg-[#20241C]/5 border border-[#2B3528]/20 text-[#2B3528] text-xs font-medium px-3.5 py-1.5 rounded-full"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2B3528] animate-pulse"></span>
                    Simple, transparent pricing
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900"
                >
                    Invest in your venue's growth
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-slate-600 text-lg leading-relaxed"
                >
                    Never miss a couple's inquiry again. Choose the plan that fits your venue or schedule a demo to unlock exclusive savings.
                </motion.p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                {/* Standard Plan */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white rounded-3xl p-8 border border-slate-200/85 shadow-lg flex flex-col justify-between relative"
                >
                    <div>
                        <div className="text-sm font-semibold text-[#2B3528] uppercase tracking-wider mb-2">Standard Plan</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Core AI Receptionist</h3>
                        <p className="text-slate-600 text-sm mb-6">Essential automated inquiry management built specifically for modern wedding venues.</p>
                        
                        <div className="flex items-baseline gap-1 mb-8">
                            <span 
                                className="text-5xl font-bold text-slate-900"
                                style={{ fontFamily: '"Times New Roman", Times, serif' }}
                            >
                                $250
                            </span>
                            <span className="text-slate-500 text-sm">/ month</span>
                        </div>

                        <ul className="space-y-3.5 text-sm text-slate-600 mb-8">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#2B3528] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                24/7 automated couple inquiries
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#2B3528] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Full dashboard &amp; lead tracking
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#2B3528] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Standard response customization
                            </li>
                        </ul>
                    </div>

                    <Link
                        to="/register"
                        className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm block"
                    >
                        Get started
                    </Link>
                </motion.div>

                {/* Demo Special Plan (40% Off) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-[#2B3528] text-white rounded-3xl p-8 shadow-xl shadow-[#2B3528]/20 flex flex-col justify-between relative overflow-hidden"
                >
                    {/* Absolute Badge */}
                    <div className="absolute top-6 right-6 bg-white/10 text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
                        40% Off Deal
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-[#92a38b] uppercase tracking-wider mb-2">Demo Special</div>
                        <h3 className="text-2xl font-bold text-white mb-4">Schedule a Demo</h3>
                        <p className="text-slate-300 text-sm mb-6">See Centrua live with your venue details and lock in our limited-time special rate of $250 er month.</p>
                        
                        <div className="flex items-baseline gap-2 mb-8">
                            <span 
                                className="text-5xl font-bold text-white"
                                style={{ fontFamily: '"Times New Roman", Times, serif' }}
                            >
                                $150
                            </span>
                            <span className="text-slate-300 text-sm">/ month</span>
                            <span className="text-xs text-[#92a38b] line-through ml-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>$250</span>
                        </div>

                        <ul className="space-y-3.5 text-sm text-slate-200 mb-8">
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#92a38b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Everything in Standard Plan
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#92a38b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                <strong>40% discount</strong> applied instantly ($250 er month value)
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-[#92a38b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Priority white-glove onboarding
                            </li>
                        </ul>
                    </div>

                    <Link
                        to="/register-venue"
                        className="w-full text-center bg-white hover:bg-slate-100 text-[#2B3528] font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg text-sm block"
                    >
                        Schedule a demo &amp; claim deal
                    </Link>
                </motion.div>
            </div>
        </section>
        <Footer />
    </div>
    )
}