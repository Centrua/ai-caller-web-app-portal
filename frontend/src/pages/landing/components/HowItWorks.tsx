import { motion } from 'framer-motion'

const steps = [
    { number: '01', title: 'Set up your venue', description: 'Add your venue details and upload your knowledge documents in minutes.' },
    { number: '02', title: 'Configure your agent', description: 'Connect your Centrua AI agent and phone number — no coding required.' },
    { number: '03', title: 'Start taking calls and emails', description: 'Your AI agent goes live and handles every inquiry, around the clock.' },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="max-w-6xl mx-auto px-8 py-24 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl font-bold mb-3 text-slate-900">Up and running in minutes</h2>
                <p className="text-slate-500">No developers. No lengthy setup. Just results.</p>
            </motion.div>

            <div className="grid grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                        className="text-center"
                    >
                        <div className="text-5xl font-bold text-[#444B38]/20 mb-4">{step.number}</div>
                        <h3 className="text-lg font-semibold mb-2 text-slate-900">{step.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}