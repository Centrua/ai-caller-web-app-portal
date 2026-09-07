import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import CtaSection from './components/CtaSection'
import Footer from './components/Footer'

export default function Landing() {
    return (
        <div className="min-h-screen bg-white text-slate-900 relative">
            <Navbar />
            <Hero />
            <Features />
            <HowItWorks />
            <CtaSection />
            <Footer />
        </div>
    )
}