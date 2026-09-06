import { useEffect, useState } from 'react'
import useVenueSettings from '../../hooks/useVenueSettings'

export default function VenueSettingsPage() {
  const { getSettings, updateSettings, loading } = useVenueSettings()
  const [emailRoutingEnabled, setEmailRoutingEnabled] = useState<boolean>(false)
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    getSettings().then((s) => {
      if (!mounted) return
      if (s) {
        setEmailRoutingEnabled(!!s.email_ai_routing)
        setAutoSendEnabled(!!s.auto_send_replies)
      }
    })
    return () => { mounted = false }
  }, [getSettings])

  const onToggle = async () => {
    setSaving(true)
    try {
      await updateSettings({ email_ai_routing: !emailRoutingEnabled })
      setEmailRoutingEnabled(!emailRoutingEnabled)
    } catch (e) {
      // swallow; hook handles error state
    } finally {
      setSaving(false)
    }
  }

  const onAutoSendToggle = async () => {
    setSaving(true)
    try {
      await updateSettings({ auto_send_replies: !autoSendEnabled })
      setAutoSendEnabled(!autoSendEnabled)
    } catch (e) {
      // swallow
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <section className="max-w-lg">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-2 text-slate-900">Email Settings</h2>
          <p className="text-sm text-slate-600 mb-4">Manage how incoming emails are handled and whether drafts are auto-sent.</p>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm font-medium text-slate-700">Email AI Routing</div>
                <div className="text-xs text-slate-500">When enabled, incoming emails are routed to the AI. When disabled, messages go straight to the venue email.</div>
              </div>
              <div className="flex items-center">
                <button
                  role="switch"
                  aria-checked={emailRoutingEnabled}
                  onClick={onToggle}
                  disabled={loading || saving}
                  className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    emailRoutingEnabled ? 'bg-[#7C572D] focus:ring-[#7C572D]' : 'bg-gray-200 focus:ring-gray-300'
                  } ${loading || saving ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      emailRoutingEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm font-medium text-slate-700">{emailRoutingEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm font-medium text-slate-700">Auto send replies</div>
                <div className="text-xs text-slate-500">When enabled, generated drafts will be auto-sent to guests.</div>
              </div>
              <div className="flex items-center">
                <button
                  role="switch"
                  aria-checked={autoSendEnabled}
                  onClick={onAutoSendToggle}
                  disabled={loading || saving}
                  className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    autoSendEnabled ? 'bg-[#7C572D] focus:ring-[#7C572D]' : 'bg-gray-200 focus:ring-gray-300'
                  } ${loading || saving ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      autoSendEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm font-medium text-slate-700">{autoSendEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
