import { Outlet } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar venueName="Acme Venue" />
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}