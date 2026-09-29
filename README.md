# CampusHub

CampusHub is a full-stack multi-college collaboration, campus engagement, and academic management platform designed for modern higher education institutions. It connects students, faculty coordinators, and campus administrators into a unified digital workspace covering student organizations, campus events, collaborative project teams, official campus announcements, career opportunities, peer-to-peer campus community discussions, and student academic profiles.

The platform is powered by a robust Spring Boot REST API featuring strict multi-college tenancy isolation, Spring Security role-based access control (RBAC), stateless JWT authentication, Cloudinary media storage, and a responsive React Single Page Application (SPA) styled with Tailwind CSS.

---

## Architecture & Tenancy Isolation

CampusHub enforces strict **Multi-College Tenancy Isolation**:

```
CampusHub Platform
  ├── College A (e.g. CampusHub Demo College - DEMO)
  │     ├── Students & Admins
  │     ├── Clubs & Memberships
  │     ├── Events & RSVPs
  │     ├── Teams & Squad Requests
  │     ├── Announcements & Circulars
  │     ├── Opportunities
  │     └── Community Posts & Comments
  └── College B (e.g. Institute of Technology & Science - TECH)
        ├── Students & Admins
        ├── Clubs & Memberships
        ├── Events & RSVPs
        ├── Teams & Squad Requests
        ├── Announcements & Circulars
        ├── Opportunities
        └── Community Posts & Comments
```

### Core Tenancy Rules:
1. **One User → Exactly One College**: Every user belongs permanently to exactly one college chosen during registration from active institutions (`GET /api/colleges/active`).
2. **Immutable College Affiliation**: A student's college cannot be modified through profile updates or client-side payload manipulation.
3. **Cross-College Protection**:
   - Students cannot view or join clubs belonging to other colleges (HTTP 403/404).
   - Students cannot RSVP to events scheduled at other colleges.
   - Students cannot submit join requests to project squads at other colleges.
   - Discussions and comments in the Campus Community board are strictly partitioned by college.
4. **Admin Scope**: Administrators belong to a specific college and have administrative governance restricted to their institution's students, clubs, events, announcements, and squads.

---

## Production Configuration

CampusHub cleanly separates local development defaults from production environment requirements. In local development, the application runs with safe defaults (`localhost:8080`, `localhost:5173`). In production, all infrastructure details, database credentials, cryptographic secrets, Cloudinary keys, and allowed origins are injected via environment variables.

### Environment Variables Reference

#### Backend (Spring Boot)
| Variable | Required in Production | Default (Development) | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `8080` | Web server listening port |
| `DB_URL` | **Yes** | `jdbc:mysql://localhost:3306/campushub` | JDBC connection URL for MySQL database |
| `DB_USERNAME` | **Yes** | `root` | Database username |
| `DB_PASSWORD` | **Yes** | *development password* | Database user password |
| `JWT_SECRET` | **Yes** | *development 256-bit key* | Base64 or 256-bit cryptographically secure HMAC-SHA signing secret |
| `JWT_EXPIRATION` | Optional | `86400000` (24h) | Token lifespan in milliseconds |
| `CORS_ALLOWED_ORIGIN` | **Yes** | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed frontend origins (no wildcards) |
| `ADMIN_EMAIL` | **Yes** | `admin@college.edu` | Email of initial administrator bootstrapped on startup |
| `ADMIN_PASSWORD` | **Yes** | `Admin@123` | Initial password for the bootstrapped administrator account |
| `ADMIN_FULL_NAME` | Optional | `Campus Administrator` | Display name for the initial administrator account |
| `ADMIN_BOOTSTRAP_ENABLED` | Optional | `true` | Set to `false` to disable administrator bootstrapping |
| `CLOUDINARY_CLOUD_NAME` | Optional | *empty (dev fallback)* | Cloudinary cloud name for profile photo uploads |
| `CLOUDINARY_API_KEY` | Optional | *empty (dev fallback)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Optional | *empty (dev fallback)* | Cloudinary API Secret |
| `DDL_AUTO` | Optional | `update` | Hibernate schema management mode (`none`, `validate`, `update`) |
| `SHOW_SQL` | Optional | `false` | Disable SQL output in logs for production security |

> [!NOTE]
> When Cloudinary credentials are not supplied in development or testing environments, `CloudinaryService` seamlessly and safely falls back to Data URI storage, ensuring zero disruption to local workflows.

#### Frontend (Vite + React)
| Variable | Required in Production | Default (Development) | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8080` | Base URL of the backend REST API |

---

### Safe Environment Template (`.env.example`)

A ready-to-use template is available in the repository root [`.env.example`](.env.example):

```env
# Backend Environment Configuration
PORT=8080
DB_URL=jdbc:mysql://localhost:3306/campushub
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGIN=https://your-frontend-domain.com
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=
ADMIN_FULL_NAME=Campus Administrator
ADMIN_BOOTSTRAP_ENABLED=true
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DDL_AUTO=update
SHOW_SQL=false

# Frontend Environment Configuration
VITE_API_BASE_URL=https://your-backend-api.com
```

---

## Security Model

CampusHub implements defense-in-depth across the entire application stack:

1. **Stateless JWT Authentication**:
   - Authentication tokens are generated using JJWT (HMAC-SHA256) upon successful login.
   - Tokens include user subject (email) and role claims.
   - Every incoming authenticated request is validated by `JwtAuthenticationFilter`. Malformed, invalid, or expired tokens are immediately rejected with HTTP 401.
   - The signing secret is stored exclusively on the backend and never exposed to the client.

2. **Password Security**:
   - Passwords are encrypted at rest using `BCryptPasswordEncoder`. Plaintext passwords are never persisted or logged.
   - Registration enforces a minimum of 8 characters (up to 72 characters, matching the BCrypt limit).
   - Password hashes are completely excluded from all response DTOs (`UserResponse`) across both public and admin user endpoints.
   - Login error handling uses uniform messages (`"Invalid email or password"`) preventing account enumeration attacks.

3. **Multi-College Isolation & Ownership**:
   - Data access for clubs, events, project teams, announcements, opportunities, and community posts is scoped to the user's registered college.
   - Ownership controls ensure users cannot edit or delete resources created by peers.
   - Profile updates prohibit role or college mutation.

4. **Role-Based Access Control (RBAC)**:
   - System recognizes two roles: `ROLE_STUDENT` and `ROLE_ADMIN`.
   - All administrative routes (`/api/admin/**`) strictly require `ROLE_ADMIN`. Authenticated students attempting access receive HTTP 403 Forbidden.
   - Unauthenticated requests to protected endpoints return HTTP 401 Unauthorized.
   - Last-admin protection: Backend logic prevents removing or demoting the last remaining administrator in an institution.

5. **CORS Security**:
   - Configurable origins via `CORS_ALLOWED_ORIGIN`. No `Access-Control-Allow-Origin: *` wildcard when credentials or security headers are utilized.
   - Allowed methods explicitly restricted: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.

6. **Error Handling & Information Disclosure**:
   - `GlobalExceptionHandler` intercepts exceptions and standardizes responses: HTTP 400 (Validation), 401 (Authentication), 403 (Forbidden), 404 (Not Found), 409 (Conflict), and 500 (Internal Server Error).
   - Server stack traces, SQL syntax errors, database constraints, and Java class names are suppressed from client responses.

---

## Features

### Student Workspace
- **Campus Community**: Unified college discussion board supporting tagged posts (`DOUBT`, `QUESTION`, `ACHIEVEMENT`, `ADVICE`, `DISCUSSION`), type filtering, text search, author badges, and nested comment threads.
- **Profile Image Management**: Direct photo upload and deletion integrated with Cloudinary (or local fallback), displaying avatars across headers, profile cards, and comments with initials fallback.
- **Centralized Dashboard**: Live metrics, interactive upcoming events timeline, enrolled clubs overview, active project teams, prioritized announcements, and urgent opportunity deadlines.
- **Clubs & Student Organizations**: Browse active organizations by category and department, view faculty coordinators, and manage one-click join/leave memberships.
- **Campus Events & RSVP Engine**: Chronologically sorted campus events with real-time attendee quotas, seat capacities, date-tiles, and RSVP registration/cancellation workflows.
- **Collaborative Project Teams**: Form student squads for hackathons, capstone projects, and research groups. Includes an interactive join request lifecycle (`PENDING`, `ACCEPTED`, `REJECTED`) managed by squad leaders.
- **Campus Announcements**: Prioritized campus notices (`HIGH`, `MEDIUM`, `LOW`) categorized across Academic, Examination, Facilities, Placement, and Student Welfare boards.
- **Career & Research Opportunities**: Discover internships, research assistantships, scholarships, and job postings with deadline tracking and external application links.
- **Student Profile**: Academic profile supporting degree program, branch, graduation year, bio, enrolled college (read-only), and photo customization.

### Administrator Console (`/admin`)
- **College-Scoped Governance**: Complete administration scoped strictly to the administrator's college.
- **Metrics Dashboard**: Direct database counts for registered users, total/active clubs, scheduled events, teams, active announcements, and open opportunities.
- **User Governance**: Searchable user registry with role filtering, role reassignment modal, and administrator promotion/demotion safeguards.
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
- **Language**: Java 17+ (Java 24 verified)
- **Security**: Spring Security (Stateless JWT Filter, DaoAuthenticationProvider, BCrypt)
- **ORM / Persistence**: Spring Data JPA, Hibernate ORM
- **Database Driver**: MySQL Connector/J
- **Media Storage**: Cloudinary SDK (with seamless data URI fallback)
- **Token Utility**: JJWT (Java JWT)
- **Boilerplate Reduction**: Project Lombok

### Database
- **Engine**: MySQL 8.0+

---

## Local Development Setup

### Prerequisites
- **Java Development Kit (JDK)**: Version 17 or higher (Java 21 / 24 verified)
- **Node.js**: Version 18.x or higher & npm
- **MySQL Database Server**: Version 8.0 or higher

### 1. Database Setup
Ensure MySQL is running locally on port `3306`:
```sql
CREATE DATABASE IF NOT EXISTS campushub;
```

### 2. Backend Startup
From the `backend/` directory:
```bash
# Windows
.\mvnw.cmd clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Linux / macOS
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
The backend initializes on `http://localhost:8080`. On first launch, the `AdminBootstrapRunner` automatically creates:
- Colleges: `DEMO` ("CampusHub Demo College") and `TECH` ("Institute of Technology & Science")
- Administrator: `admin@college.edu` / `Admin@123` (associated with `DEMO`)

### 3. Frontend Startup
From the `frontend/` directory:
```bash
# Windows (cmd / PowerShell)
npm install
npm run dev

# Linux / macOS
npm install
npm run dev
```
The Vite development server runs on `http://localhost:5173`.

### 4. Running Verification & Regression Tests
Run the comprehensive 24-test security regression suite from `backend/`:
```bash
# Windows
.\mvnw.cmd test -Dtest=SecurityRegressionTests

# Linux / macOS
./mvnw test -Dtest=SecurityRegressionTests
```

---

## API Endpoint Reference

| Group | Method | Path | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Colleges** | `GET` | `/api/colleges/active` | Public | List active colleges for student registration |
| **Colleges** | `GET` | `/api/colleges/{id}` | Authenticated | Retrieve college details |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **Users** | `POST` | `/api/users` | Public | Register student with selected `collegeId` |
| **Users** | `GET` | `/api/users` | Authenticated | List registered users in caller's college |
| **Users** | `GET` | `/api/users/{id}` | Authenticated | Retrieve user profile details |
| **Users** | `PUT` | `/api/users/{id}` | Authenticated (Owner/Admin)| Update personal profile (college is immutable) |
| **Users** | `POST` | `/api/users/profile-image` | Authenticated | Upload or replace user profile photo |
| **Users** | `DELETE`| `/api/users/profile-image` | Authenticated | Remove user profile photo |
| **Community** | `GET` | `/api/community/posts` | Authenticated | List community posts in caller's college |
| **Community** | `POST`| `/api/community/posts` | Authenticated | Create a community post (type, title, content) |
| **Community** | `GET` | `/api/community/posts/{id}`| Authenticated | Get post details and comments |
| **Community** | `DELETE`| `/api/community/posts/{id}`| Authenticated (Author/Admin)| Delete a community post |
| **Community** | `POST`| `/api/community/posts/{id}/comments`| Authenticated | Add a comment to a community post |
| **Community** | `DELETE`| `/api/community/comments/{id}`| Authenticated (Author/Admin)| Delete a comment |
| **Clubs** | `GET` | `/api/clubs` | Authenticated | List clubs in caller's college |
| **Clubs** | `GET` | `/api/clubs/active` | Authenticated | List active clubs in caller's college |
| **Clubs** | `GET` | `/api/clubs/{id}` | Authenticated | Retrieve club details |
| **Clubs** | `POST` | `/api/clubs/{id}/join` | Authenticated | Join a club (cross-college rejected 403) |
| **Clubs** | `DELETE` | `/api/clubs/{id}/leave`| Authenticated | Leave a student organization |
| **Clubs** | `GET` | `/api/clubs/{id}/members` | Authenticated | List members of a club |
| **Clubs** | `GET` | `/api/users/me/clubs` | Authenticated | Get current user's club memberships |
| **Events** | `GET` | `/api/events` | Authenticated | List events in caller's college |
| **Events** | `GET` | `/api/events/active` | Authenticated | List upcoming events in caller's college |
| **Events** | `GET` | `/api/events/{id}` | Authenticated | Retrieve event details |
| **Events** | `POST` | `/api/events` | Authenticated | Create an event within caller's college |
| **Events** | `PUT` | `/api/events/{id}` | Authenticated (Organizer) | Update event details |
| **Events** | `DELETE` | `/api/events/{id}` | Authenticated (Organizer) | Delete event |
| **Events** | `POST` | `/api/events/{id}/rsvp` | Authenticated | RSVP to an event (cross-college rejected 403) |
| **Events** | `DELETE` | `/api/events/{id}/rsvp` | Authenticated | Cancel event RSVP |
| **Events** | `GET` | `/api/events/{id}/attendees` | Authenticated | List attendees for an event |
| **Teams** | `GET` | `/api/teams` | Authenticated | List teams in caller's college |
| **Teams** | `GET` | `/api/teams/open` | Authenticated | List teams open for members in caller's college |
| **Teams** | `POST` | `/api/teams` | Authenticated | Create team in caller's college |
| **Teams** | `POST` | `/api/teams/{id}/join-requests` | Authenticated | Request to join squad (cross-college rejected 403) |
| **Teams** | `PUT` | `/api/teams/join-requests/{id}/accept` | Authenticated (Owner) | Accept member into squad |
| **Teams** | `PUT` | `/api/teams/join-requests/{id}/reject` | Authenticated (Owner) | Reject member join request |
| **Announcements** | `GET` | `/api/announcements` | Authenticated | List announcements in caller's college |
| **Opportunities** | `GET` | `/api/opportunities` | Authenticated | List opportunities in caller's college |
| **Admin Stats** | `GET` | `/api/admin/dashboard/stats` | **ROLE_ADMIN** | High-performance college-scoped counts |
| **Admin Users** | `GET` | `/api/admin/users` | **ROLE_ADMIN** | Search and filter college user accounts |
| **Admin Users** | `PUT` | `/api/admin/users/{id}/role` | **ROLE_ADMIN** | Update role (`STUDENT` / `ADMIN`) |
| **Admin Clubs** | `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/clubs[/{id}]` | **ROLE_ADMIN** | Full club administration |
| **Admin Events** | `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/events[/{id}]` | **ROLE_ADMIN** | Full event administration |
| **Admin Notices**| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/announcements[/{id}]`| **ROLE_ADMIN** | Full announcement administration |
| **Admin Careers**| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/opportunities[/{id}]`| **ROLE_ADMIN** | Full opportunity administration |
| **Admin Teams**  | `GET`, `DELETE` | `/api/admin/teams[/{id}]` | **ROLE_ADMIN** | Team auditing & moderation |

---

## Production Readiness Checklist

- [x] **Multi-College Tenancy Isolation**: 1 user = 1 college, college immutable after registration, cross-college actions strictly rejected (HTTP 403/404).
- [x] **Campus Community Board**: Discussion categories (`DOUBT`, `QUESTION`, `ACHIEVEMENT`, `ADVICE`, `DISCUSSION`), nested comments, search, and college partitioning.
- [x] **Profile Image Upload**: Cloudinary integration with graceful local fallback, image deletion, and avatar rendering with initials fallback.
- [x] **Configurable Secrets**: Database credentials, JWT secrets, and admin bootstrap settings inject via environment variables.
- [x] **Stateless Security**: Spring Security stateless session policy with JWT validation filter.
- [x] **Role-Based Authorization**: Distinct `ROLE_STUDENT` and `ROLE_ADMIN` role hierarchy; non-admin users cannot access `/api/admin/**`.
- [x] **Input Validation**: Request DTOs enforced with Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Email`, `@Min`, `@NotNull`).
- [x] **Zero Information Disclosure**: Global exception handler masks stack traces and internal errors; login errors avoid user enumeration.
- [x] **Resource Ownership Controls**: Users cannot modify or delete resources owned by other users.
- [x] **Data Consistency & Atomicity**: Multi-step operations run within `@Transactional` boundaries.
- [x] **Production Build Verified**:
  - Frontend: `npm run build` succeeds with 0 TypeScript and 0 Vite build errors.
  - Backend: `./mvnw.cmd clean package -DskipTests` produces valid executable Spring Boot fat JAR.
- [x] **Automated Security Regression Suite**: 24 automated integration tests verify authentication, authorization, multi-college boundaries, cross-college access rejection, community discussions, profile photo management, and last-admin protection.
