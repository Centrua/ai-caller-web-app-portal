import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateVenue } from '../../hooks/venueHooks'

interface RegisterVenueForm {
  name: string
  email: string
  elevenlabs_phone_number_id: string
  kb_document_id: string
}

const STORAGE_KEY = 'register_venue_form_backup'

export const RegisterVenue: React.FC = () => {
  const navigate = useNavigate()
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
    }
  })

  const [isSuccess, setIsSuccess] = useState(false)
  const [plainToken, setPlainToken] = useState<string | null>(null)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [nylasGrantId, setNylasGrantId] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response: any = await createVenue({
        name: formData.name,
        email: formData.email || undefined,
        nylas_grant_id: nylasGrantId || undefined,
        elevenlabs_phone_number_id: formData.elevenlabs_phone_number_id || null,
        kb_document_id: formData.kb_document_id || null,
      })

      localStorage.removeItem(STORAGE_KEY)

      const token = response?.plainToken || response?.data?.plainToken

      if (token) {
        setPlainToken(token)
        setShowTokenModal(true)
      }
      else {
        setIsSuccess(true)
        setMessage({ type: 'success', text: 'Venue registered successfully! Redirecting...' })
        setTimeout(() => {
          navigate('/register?mode=apply-venue')
        }, 1500)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong while registering the venue.' })
    }
  }

  // Read Nylas callback params if present
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const grant = params.get('nylas_grant_id')
      const email = params.get('nylas_email')
      if (grant) {
        setNylasGrantId(grant)
        // remove param from URL for cleanliness
        params.delete('nylas_grant_id')
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState({}, '', newUrl)
      }
      if (email && !formData.email) {
        setFormData((prev) => ({ ...prev, email }))
        params.delete('nylas_email')
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState({}, '', newUrl)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleCopy = () => {
    if (plainToken) {
      navigator.clipboard.writeText(plainToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleModalClose = () => {
    setShowTokenModal(false)
    navigate('/register?mode=apply-venue')
  }

  const isDisabled = submitting || isSuccess || showTokenModal
  const readyToSubmit = (formData.name || '').trim() !== '' && (formData.email || '').trim() !== '' && !!nylasGrantId
  // final disabled state: also disable when not readyToSubmit
  const finalDisabled = isDisabled || !readyToSubmit

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 lg:p-8 relative">
      {/* Back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors z-30"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to home
      </Link>

      <div className="w-full max-w-6xl bg-white border border-slate-200/80 rounded-[2.5rem] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">

        {/* Left Side: Exactly half (col-span-6) with Centrua AI, backdrop image, and right-shifted cut-off venue image */}
        <div className="lg:col-span-6 relative overflow-hidden flex items-center justify-end p-8 lg:p-12 bg-slate-900">
          {/* Centrua AI in Times New Roman at the top left */}
          <div className="absolute top-8 left-8 z-20 font-serif text-white text-lg tracking-wide select-none">
            Centrua AI
          </div>

          <img
            src={`${import.meta.env.BASE_URL}register-venue-backdrop.png`}
            alt="Backdrop"
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + '/register-venue-backdrop.png') {
                e.currentTarget.src = '/register-venue-backdrop.png'
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Framed card shifted right to get nicely cut off by the center dividing line */}
          <div className="relative w-[120%] h-[380px] lg:h-[500px] rounded-l-[2rem] rounded-r-none overflow-hidden shadow-2xl group border-l border-y border-white/20 bg-slate-800 z-10 translate-x-10 lg:translate-x-12">
            <img
              src={`${import.meta.env.BASE_URL}register-venue.jpg`}
              alt="Register Venue"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/register-venue.jpg') {
                  e.currentTarget.src = '/register-venue.jpg'
                }
              }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* Right Side: Exactly half (col-span-6) for form */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white relative z-20">

          <div className="my-auto max-w-md mx-auto w-full pt-6">
            {/* Header Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#20241C] flex items-center justify-center shadow-md text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
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
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Register New Venue</h1>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                Configure your venue details and connect automated email services seamlessly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {message && (
                <div
                  className={`border text-xs rounded-2xl p-3.5 ${message.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-600'
                    }`}
                >
                  {message.text}
                </div>
              )}

              {/* Venue Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Venue Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={isDisabled}
                  placeholder="e.g. Grand Bistro"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#20241C] focus:border-transparent transition disabled:bg-slate-100 disabled:cursor-not-allowed bg-slate-50/50"
                />
              </div>

              {/* Nylas OAuth buttons */}
              {/* Nylas connection status or buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider mt-2">Venue Inquiry Email *</label>
                {nylasGrantId ? (
                  <div className="flex items-center justify-between gap-3 mb-3 border rounded-2xl p-3 bg-emerald-50 border-emerald-200 text-emerald-800">
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <div className="text-xs">
                        <div className="font-semibold">Connected to Nylas</div>
                        <div className="text-[11px] text-emerald-700/90">{formData.email || 'Email connected'} • {nylasGrantId.slice(0, 8)}…</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // allow re-connecting by clearing grant id and leaving email
                          setNylasGrantId(null)
                        }}
                        className="text-xs px-3 py-1 rounded-xl border border-slate-200 bg-white cursor-pointer"
                      >
                        Reconnect
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/nylas/auth?provider=google` }}
                    disabled={isDisabled}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 rounded-2xl px-4 py-2 text-sm text-slate-700 bg-white hover:shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
                    Connect with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => { window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/nylas/auth?provider=outlook` }}
                    disabled={isDisabled}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 rounded-2xl px-4 py-2 text-sm text-slate-700 bg-white hover:shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    <img src="/outlook-icon.svg" alt="Outlook" className="w-4 h-4" />
                    Connect with Outlook
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={finalDisabled}
                title={finalDisabled ? (!nylasGrantId ? 'Connect Google or Outlook to register' : 'Please complete required fields') : undefined}
                className="w-full bg-[#20241C] hover:bg-[#7C572D] disabled:bg-[#20241C]/60 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm mt-3 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[#20241C]/20"
              >
                {submitting ? 'Registering Venue...' : isSuccess ? 'Redirecting...' : 'Register Venue'}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center text-xs text-slate-400">
            Secure venue management portal
          </div>
        </div>
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Venue Registration Token</h3>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl p-4 mb-5 leading-relaxed">
              <span className="font-semibold">Important Notice:</span> This token will only be shown <strong className="underline">once</strong>. Please copy it now as this is required for user sign up to your venue.
            </div>

            <div className="relative mb-6">
              <input
                type="text"
                readOnly
                value={plainToken || ''}
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-mono text-slate-800 select-all pr-20"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#20241C] hover:bg-[#7C572D] text-white text-xs font-medium rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-2xl transition-colors text-sm cursor-pointer shadow-md"
            >
              I have copied the token & continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisterVenue