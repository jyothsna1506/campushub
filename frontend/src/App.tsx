import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ClubsPage from './pages/ClubsPage'
import EventsPage from './pages/EventsPage'
import TeamsPage from './pages/TeamsPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminClubsPage from './pages/admin/AdminClubsPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminTeamsPage from './pages/admin/AdminTeamsPage'
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage'
import AdminOpportunitiesPage from './pages/admin/AdminOpportunitiesPage'

export default function App() {
  useEffect(() => {
    document.title = 'CampusHub — College Collaboration Platform'
  }, [])
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public & Auth Routes (without persistent layout) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Application Routes (Protected with AppLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin Application Routes (Protected with AdminRoute & AdminLayout) */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/clubs" element={<AdminClubsPage />} />
              <Route path="/admin/events" element={<AdminEventsPage />} />
              <Route path="/admin/teams" element={<AdminTeamsPage />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
              <Route path="/admin/opportunities" element={<AdminOpportunitiesPage />} />
            </Route>
          </Route>

          {/* Application-level 404 Fallback route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
