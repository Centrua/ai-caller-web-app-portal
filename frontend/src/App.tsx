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

const ProtectedRoute = () => {
  const token = localStorage.getItem('token')

  if (!token) {
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

        {/* Protected Shell. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:id" element={<ConversationDetails />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  )
}