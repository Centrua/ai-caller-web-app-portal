import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Landing from './pages/landing/Landing'
import Login from './pages/login/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Conversations from './pages/conversations/Conversations'
import ConversationDetails from './pages/conversations/ConversationDetails'
import KnowledgeBase from './pages/knowledge-base/KnowledgeBase'
import RegisterVenue from './pages/register-venue/RegisterVenue'
import SignUp from './pages/sign-up/SignUp'
import Privacy from './pages/privacy/Privacy'
import Terms from './pages/terms/Terms'
import InviteParticipants from './pages/invite-participants/InviteParticipants'
import VenueSettingsPage from './pages/Settings/VenueSettings'
import Pricing from './pages/pricing/Pricing'
import SubscriptionRequestForm from './pages/request-form/RequestForm'
import SubscriptionApproval from './pages/subscription-approval/SubscriptionApproval'

const ProtectedRoute = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const AdminProtection = () => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  if (!token || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public. */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-venue" element={<RegisterVenue />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/request-form" element={<SubscriptionRequestForm />} />

        {/* Protected Shell. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:id" element={<ConversationDetails />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/invite-participants" element={<InviteParticipants />} />
            <Route path="/settings" element={<VenueSettingsPage />} />
          </Route>
        </Route>

        {/* Approval Route */}
        <Route element={<AdminProtection />}>
          <Route path="/subscription-approval" element={<SubscriptionApproval />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}