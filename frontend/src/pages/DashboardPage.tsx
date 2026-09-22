import { useAuth } from '../context/AuthContext'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import UpcomingEventsWidget from '../components/dashboard/UpcomingEventsWidget'
import MyClubsWidget from '../components/dashboard/MyClubsWidget'
import MyTeamsWidget from '../components/dashboard/MyTeamsWidget'
import OpportunitiesWidget from '../components/dashboard/OpportunitiesWidget'
import AnnouncementsWidget from '../components/dashboard/AnnouncementsWidget'

export default function DashboardPage() {
  const { isAuthenticated, isLoading, token } = useAuth()

  // Guard: Never mount widgets or trigger API calls before auth restoration completes
  if (isLoading || !isAuthenticated || !token) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Personalized Header & Quick Actions */}
      <DashboardHeader />

      {/* 2. Core Activities Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <UpcomingEventsWidget />
        <MyClubsWidget />
        <MyTeamsWidget />
        <OpportunitiesWidget />
      </div>

      {/* 3. Full-Width Campus Announcements Feed */}
      <AnnouncementsWidget />
    </div>
  )
}
