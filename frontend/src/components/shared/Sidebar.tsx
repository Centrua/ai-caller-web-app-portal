import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useVenue } from '../../hooks/venueHooks'

type NavItem = {
  label: string
  path: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Conversations',
    path: '/conversations',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Knowledge Base',
    path: '/knowledge-base',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
]

type SidebarProps = {
  venueName?: string
}

export default function Sidebar({ venueName: propVenueName }: SidebarProps) {
  const navigate = useNavigate()
  const { venueName: fetchedName, getVenueName, loading } = useVenue()
  const [displayName, setDisplayName] = useState<string>(propVenueName || 'My Venue')

  useEffect(() => {
    getVenueName()
  }, [getVenueName])

  useEffect(() => {
    if (fetchedName) {
      setDisplayName(fetchedName)
    }
  }, [fetchedName])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#11130F] border-r border-[#1F231B] shrink-0">
      {/* Venue Name Header with Image Backdrop (No Overlay) */}
      <div 
        className="flex items-center justify-center px-5 py-8 border-b border-[#1F231B] bg-cover bg-center relative"
        style={{ backgroundImage: `url('/sidebar-title-3.png')` }}
      >
        <span 
          className="relative z-10 text-white tracking-wide font-normal text-2xl truncate block text-center drop-shadow-md" 
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          {loading && !fetchedName ? 'Loading...' : displayName}
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#7C572D] text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#1F231B]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-all duration-150 text-sm font-medium text-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  )
}