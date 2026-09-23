# CampusHub

CampusHub is a full-stack college collaboration and campus engagement platform designed for modern higher education institutions. It connects students, faculty coordinators, and campus administrators into a unified digital workspace covering student organizations, campus events, project teams, official announcements, career opportunities, and academic profiles.

The platform is backed by a secure Spring Boot REST API with Spring Security role-based access control (RBAC), stateless JWT authentication, and a responsive React Single Page Application (SPA).

---

## Features

### Authentication & Role-Based Security
- **Stateless JWT Authentication**: Secure, token-based authentication with cryptographically signed tokens carrying user identity and role claims.
- **BCrypt Password Hashing**: Strong one-way password hashing at rest.
- **Role-Based Access Control (RBAC)**: Enforced directly on the backend via Spring Security authority mapping (`ROLE_STUDENT`, `ROLE_ADMIN`).
- **Privilege Escalation Protection**: Public self-registration strictly forces the `STUDENT` role; client-side role injection attempts are ignored and neutralized.
- **Admin Self-Lockout Safeguard**: Backend logic prevents removing or demoting the last remaining system administrator.

### Student Workspace
- **Centralized Dashboard**: Live statistics, interactive upcoming events timeline, enrolled clubs overview, active project teams, prioritized announcements, and urgent opportunity deadlines.
- **Clubs & Student Organizations**: Browse active organizations by category and academic department, view faculty coordinators, and manage one-click join/leave memberships.
- **Campus Events & RSVP Engine**: Chronologically sorted campus events with real-time attendee quotas, seat capacities, date-tiles, and RSVP registration/cancellation workflows.
- **Collaborative Project Teams**: Form student squads for hackathons, capstone projects, and research groups. Includes an interactive join request lifecycle (`PENDING`, `ACCEPTED`, `REJECTED`) managed by squad leaders.
- **Campus Announcements**: Prioritized campus notices (`HIGH`, `MEDIUM`, `LOW`) categorized across Academic, Examination, Facilities, Placement, and Student Welfare boards.
- **Career & Research Opportunities**: Discover internships, research assistantships, scholarships, and job postings with deadline tracking and external application portals.
- **Student Profile**: Editable academic profiles supporting degree program, engineering branch, graduation year, bio, and account details.

### Administrator Console (`/admin`)
- **Backend-Enforced Authorization**: Complete protection under `/api/admin/**` rejecting non-admin requests with HTTP 403 Forbidden and unauthenticated requests with HTTP 401 Unauthorized.
- **Metrics Dashboard**: Real-time database counts for registered users, total/active clubs, scheduled events, teams, active announcements, and open opportunities.
- **User Governance**: Searchable user registry with role filtering, role reassignment modal, and administrator promotion/demotion guards.
- **Club Administration**: Create, update, and manage official student organizations and faculty coordinators.
- **Event Scheduling**: Create campus workshops, seminars, and hackathons with venue assignment, attendee limits, and timing validations.
- **Announcement Management**: Publish and moderate campus-wide circulars with urgency priorities.
- **Opportunity Management**: Post industry internships, research grants, and lab openings with application deadlines.
- **Team Moderation & Auditing**: Inspect project teams, review member rosters and membership join requests, and disband inactive squads.

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 8 (Strict port binding on `http://localhost:5173`)
- **Styling**: Tailwind CSS
- **Routing**: React Router v7 (Nested layouts, ProtectedRoute, AdminRoute)
- **HTTP Client**: Axios with centralized request/response interceptors

### Backend
- **Framework**: Spring Boot 4 / Spring Framework 7
- **Language**: Java 17 / Java 24
- **Security**: Spring Security 7 (Stateless JWT Filter, DaoAuthenticationProvider, BCrypt)
- **ORM / Persistence**: Spring Data JPA, Hibernate ORM
- **Database Driver**: MySQL Connector/J
- **Token Utility**: JJWT (Java JWT)
- **Boilerplate Reduction**: Project Lombok

### Database
- **Engine**: MySQL 8.0+

---

## Architecture

```text
React Frontend (Vite + TypeScript + Tailwind CSS)
   │
   │  HTTPS / JSON + Bearer JWT Header
   ▼
Spring Security Filter Chain
   ├── CorsFilter (Allowed Origins: http://localhost:5173)
   ├── JwtAuthenticationFilter (Extracts token, verifies signature & claims)
   └── AuthorizationFilter (RBAC: /api/admin/** -> ROLE_ADMIN, /api/** -> ROLE_STUDENT / Authenticated)
   │
   ▼
Spring Boot REST Controllers (/api/auth, /api/users, /api/clubs, /api/events, /api/teams, /api/admin/*)
   │
   ▼
Service Layer (Business rules, validations, role safeguards, transactional boundaries)
   │
   ▼
Spring Data JPA Repositories
   │
   ▼
Hibernate ORM
   │
   ▼
MySQL Database (Users, Clubs, Events, Teams, Announcements, Opportunities, RSVPs, Memberships)
```

---

## Project Structure

```text
campushub/
├── backend/
│   ├── pom.xml
│   ├── mvnw.cmd / mvnw
│   └── src/
│       ├── main/
│       │   ├── java/com/campushub/backend/
│       │   │   ├── bootstrap/          # Idempotent Admin Bootstrap Runner
│       │   │   ├── config/             # App Configurations
│       │   │   ├── controller/         # Student REST Controllers
│       │   │   │   └── admin/          # Dedicated Admin REST Controllers
│       │   │   ├── dto/                # Request and Response Data Transfer Objects
│       │   │   ├── entity/             # JPA Entities (User, Club, Event, Team, etc.)
│       │   │   ├── exception/          # GlobalExceptionHandler and custom errors
│       │   │   ├── repository/         # Spring Data JPA Repository Interfaces
│       │   │   ├── security/           # SecurityConfig, JwtService, CustomUserDetailsService
│       │   │   └── service/            # Core Business Logic and Validation Services
│       │   └── resources/
│       │       └── application.properties # Server, Database, JWT, and Bootstrap settings
│       └── test/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts                  # Configured on port 5173 with strictPort: true
│   └── src/
│       ├── components/                 # Header, Sidebar, ProtectedRoute, AdminRoute, Widgets
│       ├── context/                    # AuthContext (state, tokens, session management)
│       ├── layouts/                    # AppLayout (Student), AdminLayout (Administrator)
│       ├── pages/                      # LandingPage, LoginPage, RegisterPage, DashboardPage, etc.
│       │   └── admin/                  # AdminDashboard, AdminUsers, AdminClubs, AdminEvents, etc.
│       ├── services/                   # Axios API clients (authApi, clubApi, adminApi, etc.)
│       └── types/                      # Global TypeScript interface definitions
├── database/
│   └── schema.sql                      # Reference MySQL table schema definitions
└── README.md
```

---

## Security & RBAC Implementation

1. **Authentication Flow**:
   - `POST /api/auth/login` accepts credentials, verifies password hash via `BCryptPasswordEncoder`, and generates a stateless HMAC-SHA256 signed JWT containing email and role claims.
   - On subsequent requests, `JwtAuthenticationFilter` intercepts the `Authorization: Bearer <token>` header, verifies token expiration, and loads authorities into the `SecurityContextHolder`.

2. **Authorization Boundaries**:
   - `OPTIONS /**` and `/` are public.
   - `POST /api/users` (Registration) and `POST /api/auth/login` are public.
   - `/api/admin/**` requires `ROLE_ADMIN`. Authenticated non-admin students attempting access receive **HTTP 403 Forbidden**.
   - Unauthenticated requests receive **HTTP 401 Unauthorized**.
   - All standard college endpoints (`/api/events/**`, `/api/clubs/**`, `/api/teams/**`, etc.) require an authenticated user.

3. **Frontend Guarding**:
   - `<ProtectedRoute />` redirects unauthenticated visitors to `/login`.
   - `<AdminRoute />` checks the user role. Non-admin users attempting to navigate to `/admin` are served a tailored 403 Access Denied interface with a direct link back to their student dashboard.

---

## Local Setup

### Prerequisites
- **Java Development Kit (JDK)**: Version 17 or higher (Java 21 / 24 verified)
- **Node.js**: Version 18.x or higher & npm
- **MySQL Database Server**: Version 8.0 or higher

### 1. Database Setup
Ensure MySQL is running locally on port `3306`:
```sql
CREATE DATABASE IF NOT EXISTS campushub;
```

### 2. Backend Configuration & Startup
Verify or override database credentials in `backend/src/main/resources/application.properties` or set them via environment variables:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campushub
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Security & CORS
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.cors.allowed-origins=http://localhost:5173,http://127.0.0.1:5173
```

Compile and package the application:
```bash
# Windows
.\mvnw.cmd clean package -DskipTests

# Linux / macOS
./mvnw clean package -DskipTests
```

Run the packaged Spring Boot application:
```bash
java -jar backend/target/backend-0.0.1-SNAPSHOT.jar
```
The backend starts on `http://localhost:8080`.

### 3. Frontend Configuration & Startup
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server runs on `http://localhost:5173` with `strictPort: true`.

---

## Administrator Bootstrap

CampusHub provides an automated, idempotent bootstrap runner (`AdminBootstrapRunner`) that initializes the first administrator account safely on application startup without hardcoding secrets in source control.

Configure the bootstrap credentials via environment variables before launching the backend:

```bash
# Optional Environment Variables (defaults provided for local development)
export ADMIN_EMAIL=admin@college.edu
export ADMIN_PASSWORD=Admin@123
export ADMIN_FULL_NAME="Campus Administrator"
export ADMIN_BOOTSTRAP_ENABLED=true
```

- If an account with `ADMIN_EMAIL` does not exist, it is created with role `ADMIN`.
- If an account already exists, its role is verified and promoted to `ADMIN`.
- Passwords are encrypted with BCrypt before storage.
- Passwords and secrets are never emitted to logs or console output.

---

## API Overview

| Group | Method | Path | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **Users** | `POST` | `/api/users` | Public | Register student (role forced to `STUDENT`) |
| **Users** | `GET` | `/api/users/{id}` | Authenticated | Retrieve user profile details |
| **Users** | `PUT` | `/api/users/{id}` | Authenticated | Update personal academic profile |
| **Clubs** | `GET` | `/api/clubs` | Authenticated | List all active clubs |
| **Clubs** | `POST` | `/api/clubs/{id}/members` | Authenticated | Join a club |
| **Clubs** | `DELETE` | `/api/clubs/{id}/members` | Authenticated | Leave a club |
| **Events** | `GET` | `/api/events` | Authenticated | List scheduled events |
| **Events** | `POST` | `/api/events/{id}/rsvps` | Authenticated | RSVP to an event |
| **Events** | `DELETE` | `/api/events/{id}/rsvps` | Authenticated | Cancel event RSVP |
| **Teams** | `GET` | `/api/teams` | Authenticated | List open collaboration teams |
| **Teams** | `POST` | `/api/teams` | Authenticated | Create a new project team |
| **Teams** | `POST` | `/api/teams/{id}/join-requests` | Authenticated | Request to join a team |
| **Teams** | `PUT` | `/api/teams/requests/{id}/accept` | Authenticated (Owner) | Accept member into squad |
| **Teams** | `PUT` | `/api/teams/requests/{id}/reject` | Authenticated (Owner) | Reject join request |
| **Notices** | `GET` | `/api/announcements` | Authenticated | View campus notices |
| **Careers** | `GET` | `/api/opportunities` | Authenticated | View internships & scholarships |
| **Admin Stats** | `GET` | `/api/admin/dashboard/stats` | **ROLE_ADMIN** | Real database statistics |
| **Admin Users** | `GET` | `/api/admin/users` | **ROLE_ADMIN** | Search and filter user accounts |
| **Admin Users** | `PUT` | `/api/admin/users/{id}/role` | **ROLE_ADMIN** | Update role (`STUDENT` / `ADMIN`) |
| **Admin Clubs** | `POST`, `PUT`, `DELETE` | `/api/admin/clubs[/{id}]` | **ROLE_ADMIN** | Manage student organizations |
| **Admin Events** | `POST`, `PUT`, `DELETE` | `/api/admin/events[/{id}]` | **ROLE_ADMIN** | Manage campus events |
| **Admin Notices** | `POST`, `PUT`, `DELETE` | `/api/admin/announcements[/{id}]`| **ROLE_ADMIN** | Publish and remove notices |
| **Admin Careers** | `POST`, `PUT`, `DELETE` | `/api/admin/opportunities[/{id}]`| **ROLE_ADMIN** | Post career opportunities |
| **Admin Teams** | `GET`, `DELETE` | `/api/admin/teams[/{id}]` | **ROLE_ADMIN** | Inspect rosters & disband squads |

---

## Current Project Status

- [x] Full Spring Boot 4 REST API with Spring Data JPA & MySQL
- [x] Spring Security 7 RBAC (`ROLE_STUDENT` and `ROLE_ADMIN`)
- [x] Frontend Single Page Application with React 19, TypeScript, and Vite 8
- [x] Full Student Workspace (Dashboard, Clubs, Events, Teams, Notices, Opportunities, Profile)
- [x] Full Admin Console (`/admin`) with Real Backend Authorization
- [x] Idempotent Administrator Account Bootstrap
- [x] Privilege Escalation and Last Administrator Safeguards
- [x] Unified Design System and Interactive Micro-interactions
- [x] Production Build Verification (0 compiler, linter, or build errors)

---

## Future Enhancements

- **Push Notifications & WebSockets**: Real-time notifications for accepted team join requests and urgent announcements.
- **Calendar Export**: Export event RSVPs as `.ics` files for Google Calendar and Apple Calendar.
- **File & Media Storage**: Direct integration with S3/MinIO for club banner images and profile avatars.
- **Audit Logs**: Administrative event logging recording timestamps and operator IPs for critical changes.
