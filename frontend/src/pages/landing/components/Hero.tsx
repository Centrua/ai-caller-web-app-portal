import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Hero() {
    return (
        <section className="max-w-6xl mx-auto px-8 pt-12 pb-24 overflow-visible">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                {/* Left Side: Text and Buttons with Ultra-Thin Vertical Strip Backdrop Image */}
                <div className="lg:col-span-6 relative">
                    {/* Super thin vertical strip backdrop image with a crisp edge gradient */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="absolute -top-6 -bottom-6 -left-4 w-2 lg:w-4 rounded-xl overflow-hidden shadow-xl z-0 hidden sm:block pointer-events-none"
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}register-venue-backdrop.png`}
                            alt="Backdrop"
                            onError={(e) => {
                                if (e.currentTarget.src !== window.location.origin + '/register-venue-backdrop.png') {
                                    e.currentTarget.src = '/register-venue-backdrop.png'
                                }
                            }}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Text and Buttons Content (Sits cleanly on top with high z-index) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-left space-y-6 relative z-30 sm:pl-4 ml-4"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-[#20241C]/5 border border-[#2B3528]/20 text-[#2B3528] text-xs font-medium px-3.5 py-1.5 rounded-full"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2B3528] animate-pulse"></span>
                            AI-powered for wedding venues
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-5xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight"
                        >
                            <span className="block bg-gradient-to-r from-[#161915] via-[#2B3528] to-[#92a38b] bg-clip-text text-transparent">
                                Your venue's AI
                            </span>
                            <span className="block bg-gradient-to-r from-[#0b0e0a] via-[#161915] to-[#788871] bg-clip-text text-transparent">
                                receptionist,
                            </span>
                            <span className="block bg-gradient-to-r from-[#161915] via-[#2B3528] to-[#92a38b] bg-clip-text text-transparent">
                                always on call
                            </span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-slate-600 text-lg lg:text-xl leading-relaxed font-normal"
                        >
                            Centrua handles every couple's inquiry with warmth and precision — so your team can focus on creating unforgettable experiences.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="flex items-center gap-5 pt-1"
                        >
                            <Link
                                to="/register-venue"
                                className="bg-[#2B3528] hover:bg-[#444B38] text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-[#2B3528]/20 text-sm"
                            >
                                Register venue
                            </Link>
                            <a
                                href="#how-it-works"
                                className="text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors flex items-center gap-2 px-4 py-2.5"
                            >
                                See how it works
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Side: Primary Image with Motion */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="lg:col-span-6"
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-100 aspect-[4/3] lg:aspect-[1/1] w-full scale-105 lg:scale-110">
                        <img
                            src={`${import.meta.env.BASE_URL}register-venue.jpg`}
                            alt="Hero Visual"
                            onError={(e) => {
                                if (e.currentTarget.src !== window.location.origin + '/register-venue.jpg') {
                                    e.currentTarget.src = '/register-venue.jpg'
                                }
                            }}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}