import { motion } from 'framer-motion'

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        ),
        title: 'Always-On Call and Email Handling',
        description: 'Your AI agent answers every inquiry 24/7 — no missed calls, no hold music, no frustration.',
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: 'Natural Conversations',
        description: 'Powered by our AI technology, your agent speaks warmly and naturally — indistinguishable from your best team member.',
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

export default function Features() {
    return (
        <section className="bg-slate-50 border-y border-slate-100 overflow-hidden">
            <div className="max-w-6xl mx-auto px-8 py-24">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold mb-3 text-slate-900">Everything your venue needs</h2>
                    <p className="text-slate-500">Built specifically for the wedding industry, from first inquiry to final booking.</p>
                </motion.div>

                <div className="grid grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                            whileHover={{ y: -4 }}
                            className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-[#2B3528]/40 hover:shadow-md transition-colors shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#20241C]/5 text-[#2B3528] flex items-center justify-center mb-5">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-slate-900">{feature.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}