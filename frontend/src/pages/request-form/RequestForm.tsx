import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../landing/components/Navbar'
import Footer from '../landing/components/Footer'
import { useCreateSubscriptionRequest } from '../../hooks/subscriptionRequestHooks'

export default function SubscriptionRequestForm() {
    const location = useLocation()

    const queryParams = new URLSearchParams(location.search)
    const isDemoInitial = queryParams.get('demo') === 'true'

    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        email: '',
        venue_name: '',
        venue_address: '',
        venue_city: '',
        venue_state: '',
        venue_zip_code: '',
        requesting_demo: isDemoInitial,
    })

    useEffect(() => {
        const demoParam = queryParams.get('demo') === 'true'
        setFormData((prev) => ({
            ...prev,
            requesting_demo: demoParam,
        }))
    }, [location.search])

    const { createSubscriptionRequest, loading, error } = useCreateSubscriptionRequest()
    const [success, setSuccess] = useState(false)

    const formatPhoneNumber = (value: string): string => {
        const numbers = value.replace(/\D/g, '').substring(0, 10)
        if (numbers.length === 0) return ''
        if (numbers.length <= 3) return `(${numbers}`
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target

        if (name === 'phone_number') {
            setFormData((prev) => ({
                ...prev,
                phone_number: formatPhoneNumber(value),
            }))
        }
        else if (name === 'venue_state') {
            const uppercaseLetters = value.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 2)
            setFormData((prev) => ({
                ...prev,
                venue_state: uppercaseLetters,
            }))
        }
        else if (name === 'venue_zip_code') {
            const numbers = value.replace(/\D/g, '').substring(0, 5)
            setFormData((prev) => ({
                ...prev,
                venue_zip_code: numbers,
            }))
        }
        else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            await createSubscriptionRequest(formData)
            setSuccess(true)
        }
        catch (err) {
            // Error handling is managed and logged within the hook, 
            // but `error` from the hook will display in the UI banner if configured.
        }
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 relative">
            <Navbar page="Subscribe" />

            <section className="w-full max-w-5xl mx-auto px-6 lg:px-12 pt-12 pb-24 overflow-visible flex-grow">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-[#20241C]/5 border border-[#2B3528]/20 text-[#2B3528] text-xs font-medium px-3.5 py-1.5 rounded-full"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2B3528] animate-pulse"></span>
                        Centrua AI Onboarding
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl lg:text-5xl font-extrabold tracking-tight text-slate-900"
                    >
                        {formData.requesting_demo ? "Schedule Your Live Demo & Lock In 40% Off" : "Request Subscription from our Team"}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-slate-600 text-base lg:text-lg leading-relaxed"
                    >
                        Fill out your details below to get started with your automated AI receptionist.
                    </motion.p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-white rounded-3xl p-8 lg:p-12 border border-slate-200/85 shadow-xl relative w-full"
                >
                    {success ? (
                        <div className="text-center py-16 space-y-4">
                            <div className="w-16 h-16 bg-[#2B3528]/10 text-[#2B3528] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                                ✓
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Request Submitted Successfully!</h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                Thank you, {formData.name}. We have received your details for <strong className="text-slate-900">{formData.venue_name}</strong> and will be in touch shortly.
                            </p>
                            <div className="pt-4">
                                <Link
                                    to="/"
                                    className="inline-block bg-[#2B3528] hover:bg-[#444B38] text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Your Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Sarah Jenkins"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="sarah@grandvenue.com"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone Number */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        required
                                        maxLength={14}
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        placeholder="(555) 123-4567"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                    />
                                </div>

                                {/* Venue Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Venue Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="venue_name"
                                        required
                                        value={formData.venue_name}
                                        onChange={handleChange}
                                        placeholder="The Grand Estate"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Venue Address */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Venue Street Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="venue_address"
                                    required
                                    value={formData.venue_address}
                                    onChange={handleChange}
                                    placeholder="123 Celebration Lane"
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                />
                            </div>

                            {/* City, State, Zip Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="venue_city"
                                        required
                                        value={formData.venue_city}
                                        onChange={handleChange}
                                        placeholder="Charleston"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="venue_state"
                                        required
                                        maxLength={2}
                                        value={formData.venue_state}
                                        onChange={handleChange}
                                        placeholder="SC"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900 uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                        Zip Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="venue_zip_code"
                                        required
                                        maxLength={5}
                                        value={formData.venue_zip_code}
                                        onChange={handleChange}
                                        placeholder="29401"
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-[#2B3528] focus:ring-1 focus:ring-[#2B3528] outline-none text-sm transition-all text-slate-900"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#2B3528] hover:bg-[#444B38] text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#2B3528]/20 text-sm disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Submitting request...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </section>

            <Footer />
        </div>
    )
}