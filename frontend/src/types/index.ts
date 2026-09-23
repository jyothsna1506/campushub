// Auth & User Types
export interface UserResponse {
  id: number
  fullName: string
  email: string
  program?: string
  branch?: string
  year?: number
  bio?: string
  role?: string
}

export interface UserUpdateRequest {
  fullName?: string
  email?: string
  password?: string
  program?: string
  branch?: string
  year?: number
  bio?: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  program?: string
  branch?: string
  year?: number
  bio?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  type: string
  user: UserResponse
}

// Club Types
export interface ClubRequest {
  name: string
  description: string
  category: string
  department: string
  coordinatorName: string
}

export interface ClubResponse {
  id: number
  name: string
  description: string
  category: string
  department: string
  coordinatorName: string
  createdAt: string
  active: boolean
}

export interface ClubMemberResponse {
  membershipId: number
  userId: number
  userFullName: string
  clubId: number
  clubName: string
  joinedAt: string
}

export interface MembershipStatusResponse {
  isMember: boolean
}

// Event Types
export interface EventRequest {
  title: string
  description: string
  category: string
  venue: string
  startTime: string
  endTime: string
  capacity: number
}

export interface EventResponse {
  id: number
  title: string
  description: string
  category: string
  venue: string
  startTime: string
  endTime: string
  organizerId: number
  organizerName: string
  capacity: number
  createdAt: string
  active: boolean
}

export interface EventRsvpResponse {
  rsvpId: number
  userId: number
  userFullName: string
  eventId: number
  eventTitle: string
  registeredAt: string
}

export interface RsvpStatusResponse {
  hasRsvped: boolean
}

// Team Types
export interface TeamRequest {
  name: string
  description: string
  category: string
  openForMembers?: boolean
}

export interface TeamResponse {
  id: number
  name: string
  description: string
  category: string
  ownerId: number
  ownerName: string
  createdAt: string
  openForMembers: boolean
}

export interface TeamMemberResponse {
  membershipId: number
  userId: number
  userFullName: string
  teamId: number
  teamName: string
  joinedAt: string
}

export type TeamJoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface TeamJoinRequestResponse {
  requestId: number
  userId: number
  userFullName: string
  teamId: number
  teamName: string
  status: TeamJoinRequestStatus
  requestedAt: string
  respondedAt?: string
}

// Announcement Types
export type AnnouncementPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface AnnouncementRequest {
  title: string
  content: string
  category: string
  priority: AnnouncementPriority
}

export interface AnnouncementResponse {
  id: number
  title: string
  content: string
  category: string
  priority: AnnouncementPriority
  authorId: number
  authorName: string
  createdAt: string
  active: boolean
}

// Opportunity Types
export interface OpportunityRequest {
  title: string
  description: string
  organization: string
  type: string
  location?: string
  applicationUrl?: string
  applicationDeadline: string
}

export interface OpportunityResponse {
  id: number
  title: string
  description: string
  organization: string
  type: string
  location?: string
  applicationUrl?: string
  applicationDeadline: string
  postedById: number
  postedByName: string
  createdAt: string
  active: boolean
}

// Admin Types
export interface AdminDashboardStatsResponse {
  totalUsers: number
  totalClubs: number
  activeClubs: number
  totalEvents: number
  activeEvents: number
  totalTeams: number
  totalAnnouncements: number
  activeAnnouncements: number
  totalOpportunities: number
  activeOpportunities: number
}

export interface UpdateUserRoleRequest {
  role: 'STUDENT' | 'ADMIN'
}

