import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CtaSection() {
    return (
        <section className="bg-slate-50 border-t border-slate-100 overflow-hidden">
            <div className="max-w-6xl mx-auto px-8 py-24">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-gradient-to-br from-[#161915] to-[#2B3528] rounded-3xl p-16 text-center shadow-xl shadow-[#161915]/20"
                >
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="text-4xl font-bold mb-4 text-white"
                    >
                        Ready to transform your venue?
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="mb-8 max-w-md mx-auto text-slate-200"
                    >
                        Join forward-thinking venues already using Centrua to win more bookings with less effort.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block"
                    >
                        <Link
                            to="/register"
                            className="inline-flex bg-white hover:bg-slate-50 text-[#161915] font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg"
                        >
                            Register your venue
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}