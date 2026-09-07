import { Helmet } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import CtaSection from './components/CtaSection'
import Footer from './components/Footer'

export default function Landing() {
    return (
        <div className="min-h-screen bg-white text-slate-900 relative">
            <Helmet>
                <title>Centrua AI | Automated Phone Calls & Email Handling for Wedding Venues</title>
                <meta name="description" content="Never miss a booking lead again. Centrua AI automates inbound phone calls, voice routing, and email management specifically designed for wedding and event venues." />
                <meta property="og:title" content="Centrua AI | Automated Phone Calls & Email Handling for Wedding Venues" />
                <meta property="og:description" content="Never miss a booking lead again. Centrua AI automates inbound phone calls, voice routing, and email management specifically designed for wedding and event venues." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://centruaai.com" />
                <meta property="og:image" content="https://centruaai.com/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href="https://centruaai.com" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "@id": "https://centruaai.com",
                        "name": "Centrua AI",
                        "url": "https://centruaai.com",
                        "description": "AI-powered call automation and email management software for wedding and event venues.",
                        "publisher": {
                            "@type": "Organization",
                            "name": "Centrua AI",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://centruaai.com/logo.png"
                            }
                        },
                        "potentialAction": {
                            "@type": "RegisterAction",
                            "target": "https://centruaai.com/register-venue",
                            "name": "Register Venue"
                        }
                    })}
                </script>
            </Helmet>
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <CtaSection />
            <Footer />
        </div>
    )
}