import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useGoogleAuth } from '../../hooks/authHooks'
import { useCreateVenue } from '../../hooks/venueHooks'

interface RegisterVenueForm {
  name: string
  email: string
  phone: string
  elevenlabs_phone_number_id: string
  kb_document_id: string
  google_refresh_token: string
}

export const RegisterVenue: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { initiateGoogleLogin } = useGoogleAuth()
  const { createVenue, loading: submitting } = useCreateVenue()

  const [formData, setFormData] = useState<RegisterVenueForm>({
    name: '',
    email: '',
    phone: '',
    elevenlabs_phone_number_id: '',
    kb_document_id: '',
    google_refresh_token: '',
  })

  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Handle post-OAuth redirect query parameters
  useEffect(() => {
    const email = searchParams.get('email')
    const refreshToken = searchParams.get('google_refresh_token')

    if (email) {
      setFormData((prev) => ({
        ...prev,
        email,
        google_refresh_token: refreshToken || prev.google_refresh_token,
      }))
      setIsGoogleConnected(true)
      setMessage({ type: 'success', text: `Successfully connected Google account: ${email}` })
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConnectGoogle = () => {
    initiateGoogleLogin()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      await createVenue({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        elevenlabs_phone_number_id: formData.elevenlabs_phone_number_id || null,
        kb_document_id: formData.kb_document_id || null,
        google_refresh_token: formData.google_refresh_token || null,
      })

      setIsSuccess(true)
      setMessage({ type: 'success', text: 'Venue registered successfully! Redirecting to sign up...' })
      setTimeout(() => {
        navigate('/register?mode=apply-venue')
      }, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong while registering the venue.' })
    }
  }

  const isDisabled = submitting || isSuccess

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative">
      {/* Back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to home
      </Link>

      <div className="w-full max-w-lg">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Register New Venue</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your venue details and connect automated email services</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-5">
          {message && (
            <div
              className={`border text-xs rounded-lg p-3 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Venue Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Venue Name *</label>
            <input
              type="text"
              name="name"
              required
              disabled={isDisabled}
              placeholder="e.g. Grand Bistro"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Venue Phone Number</label>
            <input
              type="text"
              name="phone"
              disabled={isDisabled}
              placeholder="+1 (555) 019-2834"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Gmail OAuth Connection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Venue Inquiry Email Connection *</label>
            <button
              type="button"
              disabled={isDisabled}
              onClick={handleConnectGoogle}
              className={`inline-flex items-center justify-center gap-2 border font-medium px-3.5 py-2 rounded-lg shadow-sm transition text-xs ${
                isDisabled
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : isGoogleConnected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-pointer'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {isGoogleConnected ? `Connected: ${formData.email} ✓` : 'Connect Google Venue Email'}
            </button>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                ⚠️ IMPORTANT: You MUST connect the official email inbox used by this venue for customer inquiries and automatic responses. This inbox will receive staff registration and user association approval requests, as well.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? 'Registering Venue...' : isSuccess ? 'Redirecting...' : 'Register Venue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterVenue