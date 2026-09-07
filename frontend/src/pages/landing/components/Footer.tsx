import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="border-t border-slate-100 py-8 px-8 max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#2B3528] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                </div>
                <span className="font-semibold text-sm text-slate-800">Centrua</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-slate-400 text-xs">© 2026 Centrua. All rights reserved.</div>
                <div className="flex items-center gap-3">
                    <Link to="/privacy" className="text-slate-500 text-xs hover:underline">Privacy Policy</Link>
                    <Link to="/terms" className="text-slate-500 text-xs hover:underline">Terms &amp; Conditions</Link>
                </div>
            </div>
        </footer>
    )
}