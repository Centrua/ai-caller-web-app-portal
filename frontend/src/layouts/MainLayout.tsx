import { Outlet } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar venueName="Acme Venue" />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
