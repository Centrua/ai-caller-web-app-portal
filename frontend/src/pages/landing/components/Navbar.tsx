import { Link } from 'react-router-dom'

export default function Navbar() {
    const token = localStorage.getItem('token')

    return (
        <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto border-b border-slate-100">
            <div className="flex items-center gap-2.5">
                <span className="font-serif text-lg tracking-wide text-slate-900 select-none">Centrua AI</span>
            </div>
            <div className="flex items-center gap-4">
                {token ? (
                    <Link
                        to="/dashboard"
                        className="bg-[#2B3528] hover:bg-[#444B38] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
                    >
                        Go to dashboard
                    </Link>
                ) : (
                    <>
                        <Link
                            to="/register"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Register
                        </Link>
                        <Link
                            to="/login"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Sign in →
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}