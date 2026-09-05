import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-8 py-20">
        <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-slate-600 mb-4">Last updated: September 2026</p>

        <section className="prose prose-slate mb-6">
          <p>
            These Terms & Conditions govern your use of Centrua’s website and services. By accessing or using our services, you agree to be bound by these terms.
          </p>
          <h3>Use of Service</h3>
          <p>
            You agree to use the service in compliance with all applicable laws and not to misuse or disrupt the service.
          </p>
          <h3>Accountability</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          <h3>Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, Centrua will not be liable for indirect or consequential damages arising from use of the service.
          </p>
        </section>

        <div className="mt-8">
          <Link to="/" className="text-sm text-slate-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
