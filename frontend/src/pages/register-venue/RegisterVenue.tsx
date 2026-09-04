import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useNylasAuth } from '../../hooks/authHooks'
import { useCreateVenue } from '../../hooks/venueHooks'

interface RegisterVenueForm {
  name: string
  email: string
  elevenlabs_phone_number_id: string
  kb_document_id: string
  nylas_grant_id: string
}

const STORAGE_KEY = 'register_venue_form_backup'

export const RegisterVenue: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { initiateNylasLogin } = useNylasAuth()
  const { createVenue, loading: submitting } = useCreateVenue()

  const [formData, setFormData] = useState<RegisterVenueForm>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          name: parsed.name || '',
          email: '',
          elevenlabs_phone_number_id: '',
          kb_document_id: '',
          nylas_grant_id: '',
        }
      } catch (e) {
        console.error('Failed to parse saved venue form data', e)
      }
    }
    return {
      name: '',
      email: '',
      elevenlabs_phone_number_id: '',
      kb_document_id: '',
      nylas_grant_id: '',
    }
  })

  const [isEmailConnected, setIsEmailConnected] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Handle post-OAuth redirect query parameters
  useEffect(() => {
    const email = searchParams.get('email')
    const grantId = searchParams.get('nylas_grant_id')

    if (email) {
      setFormData((prev) => ({
        ...prev,
        email,
        nylas_grant_id: grantId || prev.nylas_grant_id,
      }))
      setIsEmailConnected(true)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      if (name === 'name') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: updated.name })
        )
      }
      return updated
    })
  }

  const handleConnectEmail = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: formData.name,
      })
    )
    initiateNylasLogin()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!formData.nylas_grant_id) {
      setMessage({ type: 'error', text: 'Please connect the venue inquiry email before registering the venue.' })
      return
    }

    try {
      await createVenue({
        name: formData.name,
        email: formData.email || undefined,
        elevenlabs_phone_number_id: formData.elevenlabs_phone_number_id || null,
        kb_document_id: formData.kb_document_id || null,
        nylas_grant_id: formData.nylas_grant_id || null,
      })

      localStorage.removeItem(STORAGE_KEY)

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

          {/* Venue email connection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Venue Inquiry Email Connection *</label>
            <button
              type="button"
              disabled={isDisabled}
              onClick={handleConnectEmail}
              className={`inline-flex items-center justify-center gap-2 border font-medium px-3.5 py-2 rounded-lg shadow-sm transition text-xs ${
                isDisabled
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                  : isEmailConnected
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-pointer'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <polyline points="3 7 12 13 21 7" />
              </svg>
              {isEmailConnected ? `Connected: ${formData.email} ✓` : 'Connect Venue Email'}
            </button>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                IMPORTANT: Connect the official email inbox used by this venue for customer inquiries and automatic agent responses.
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