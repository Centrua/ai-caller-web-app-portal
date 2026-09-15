import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="border-t border-slate-100 py-8 px-8 max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="font-serif text-sm tracking-wide text-slate-900 select-none">Centrua AI</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-slate-400 text-xs">© 2026 Centrua, LLC. All rights reserved.</div>
                <div className="flex items-center gap-3">
                    <Link to="/privacy" className="text-slate-500 text-xs hover:underline">Privacy Policy</Link>
                    <Link to="/terms" className="text-slate-500 text-xs hover:underline">Terms &amp; Conditions</Link>
                </div>
            </div>
        </footer>
    )
}