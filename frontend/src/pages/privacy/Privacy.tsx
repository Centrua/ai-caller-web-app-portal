import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-8 py-20">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-4">Last updated: September 2026</p>

        <section className="prose prose-slate mb-6">
          <p>
            Centrua (“we”, “our”, or “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>
          <h3>Information We Collect</h3>
          <p>
            We may collect personal information you provide directly (for example, name, email address, venue details), and technical information automatically (such as IP address and device information).
          </p>
          <h3>How We Use Information</h3>
          <p>
            We use information to provide, improve, and secure our services, communicate with you, and comply with legal obligations.
          </p>
          <h3>Data Sharing</h3>
          <p>
            We do not sell personal information. We may share data with service providers who help operate the service and when required by law.
          </p>
          <h3>Contact</h3>
          <p>
            If you have questions about this Privacy Policy, please contact us at iangongwerpersonal@gmail.com or garethnoble3@gmail.com.
          </p>
        </section>

        <div className="mt-8">
          <Link to="/" className="text-sm text-slate-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
