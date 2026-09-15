import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Footer from '../landing/components/Footer'

export default function RequestOrRegister() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-slate-900 relative flex flex-col justify-between">
      
      {/* Main Content Centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-16">
        <section className="max-w-5xl w-full mx-auto relative flex items-center justify-center">

          {/* Floating Image in the Background Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="absolute z-0 w-72 h-72 sm:w-96 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 hidden lg:flex items-center justify-center bg-slate-900"
          >
            <img 
              src="/request-or-register.jpg" 
              alt="Venue Onboarding" 
              className="w-full h-full object-cover opacity-90"
            />
          </motion.div>

          {/* Left and Right Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-32 w-full relative z-10 items-stretch">

            {/* Option 1: Request Subscription and Onboarding */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-10 border border-slate-200/85 shadow-2xl flex flex-col justify-between relative"
            >
              <div>
                <div className="text-base font-semibold text-[#2B3528] uppercase tracking-wider mb-3">New Inquiry</div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">Request Subscription &amp; Onboarding</h3>
                <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                  Select this if you haven't spoken to a representative yet and do not have a registration code provided by an admin.
                </p>
              </div>

              <button
                onClick={() => navigate('/request-form')}
                className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-200 text-lg block shadow-md cursor-pointer"
              >
                Get Started
              </button>
            </motion.div>

            {/* Option 2: Register Venue */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#2B3528]/95 backdrop-blur-md text-white rounded-3xl p-10 shadow-2xl shadow-[#2B3528]/25 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="text-base font-semibold text-[#92a38b] uppercase tracking-wider mb-3">Ready to Activate</div>
                <h3 className="text-3xl font-extrabold text-white mb-6 leading-tight">Register Venue</h3>
                <p className="text-slate-300 text-lg mb-10 leading-relaxed">
                  Select this if you already have an admin-provided registration code and are ready to register your venue.
                </p>
              </div>

              <button
                onClick={() => navigate('/register-venue')}
                className="w-full text-center bg-white hover:bg-slate-100 text-[#2B3528] font-bold py-4 px-8 rounded-2xl transition-all duration-200 text-lg block shadow-lg cursor-pointer"
              >
                Enter Code
              </button>
            </motion.div>

          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}