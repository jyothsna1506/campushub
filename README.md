# CampusHub

CampusHub is a full-stack college collaboration and campus engagement platform designed for modern higher education institutions. It connects students, faculty coordinators, and campus administrators into a unified digital workspace covering student organizations, campus events, collaborative project teams, official campus announcements, career opportunities, and academic profiles.

The platform is powered by a robust Spring Boot REST API featuring Spring Security role-based access control (RBAC), stateless JWT authentication, and a responsive React Single Page Application (SPA).

---

## Production Configuration

CampusHub cleanly separates local development defaults from production environment requirements. In local development, the application runs with safe defaults (`localhost:8080`, `localhost:5173`). In production, all infrastructure details, database credentials, cryptographic secrets, and allowed origins are injected via environment variables.

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
| `DDL_AUTO` | Optional | `update` | Hibernate schema management mode (`none`, `validate`, `update`) |
| `SHOW_SQL` | Optional | `false` | Disable SQL output in logs for production security |

#### Frontend (Vite + React)
| Variable | Required in Production | Default (Development) | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8080` | Base URL of the backend REST API |

> [!NOTE]
> `VITE_*` environment variables are baked into frontend JavaScript bundles during `npm run build`. Never place backend secrets or database credentials in client-side `.env` files.

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
   - Passwords are encrypted at rest using `BCryptPasswordEncoder`. Plaintext passwords are never persisted.
   - Registration enforces a minimum of 8 characters (up to 72 characters, matching the BCrypt limit).
   - Password hashes are completely excluded from all response DTOs (`UserResponse`) across both public and admin user endpoints.
   - Login error handling uses uniform messages (`"Invalid email or password"`) preventing account enumeration attacks.

3. **Role-Based Access Control (RBAC)**:
   - System recognizes two roles: `ROLE_STUDENT` and `ROLE_ADMIN`.
   - All administrative routes (`/api/admin/**`) strictly require `ROLE_ADMIN`. Authenticated students attempting access receive HTTP 403 Forbidden.
   - Unauthenticated requests to protected endpoints return HTTP 401 Unauthorized.
   - Authorities are derived directly from the database on every authenticated request—untrusted client claims cannot escalate privileges.

4. **Resource Ownership & Anti-Tampering**:
   - Public registration strictly forces the `STUDENT` role; client attempts to pass `role: "ADMIN"` are ignored.
   - Profile updates (`PUT /api/users/{id}`) accept only editable fields (name, department, year, bio) and prohibit role modification.
   - Resource updates and deletions enforce ownership checks:
     - Events can only be updated or deleted by their creator (or an admin).
     - Teams can only be updated or deleted by their squad owner.
     - Team join requests can only be accepted/rejected by the squad owner.
     - Club and Event RSVPs are strictly tied to the authenticated user's session.
   - Last-admin protection: Backend logic prevents removing or demoting the last remaining administrator in both role update and user deletion operations.

5. **CORS Security**:
   - Configurable origins via `CORS_ALLOWED_ORIGIN`. No `Access-Control-Allow-Origin: *` wildcard when credentials or security headers are utilized.
   - Allowed methods explicitly restricted: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.
   - Preflight `OPTIONS` requests pass through cleanly without authentication friction.

6. **Error Handling & Information Disclosure**:
   - `GlobalExceptionHandler` intercepts exceptions and standardizes responses: HTTP 400 (Validation), 401 (Authentication), 403 (Forbidden), 404 (Not Found), 409 (Conflict), and 500 (Internal Server Error).
   - Server stack traces, SQL syntax errors, database constraints, and Java class names are suppressed from client responses.

---

## Features

### Student Workspace
- **Centralized Dashboard**: Live statistics, interactive upcoming events timeline, enrolled clubs overview, active project teams, prioritized announcements, and urgent opportunity deadlines.
- **Clubs & Student Organizations**: Browse active organizations by category and academic department, view faculty coordinators, and manage one-click join/leave memberships.
- **Campus Events & RSVP Engine**: Chronologically sorted campus events with real-time attendee quotas, seat capacities, date-tiles, and RSVP registration/cancellation workflows.
- **Collaborative Project Teams**: Form student squads for hackathons, capstone projects, and research groups. Includes an interactive join request lifecycle (`PENDING`, `ACCEPTED`, `REJECTED`) managed by squad leaders.
- **Campus Announcements**: Prioritized campus notices (`HIGH`, `MEDIUM`, `LOW`) categorized across Academic, Examination, Facilities, Placement, and Student Welfare boards.
- **Career & Research Opportunities**: Discover internships, research assistantships, scholarships, and job postings with deadline tracking and external application links (`rel="noopener noreferrer"`).
- **Student Profile**: Academic profile supporting degree program, engineering branch, graduation year, bio, and account details with self-service update controls.

### Administrator Console (`/admin`)
- **Backend-Enforced Authorization**: Complete protection under `/api/admin/**` rejecting non-admin requests with HTTP 403 Forbidden.
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
The backend initializes on `http://localhost:8080`. On first launch, the `AdminBootstrapRunner` automatically creates the administrator account:
- Email: `admin@college.edu`
- Password: `Admin@123`

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
Run the comprehensive security test suite from `backend/`:
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
| **Home** | `GET` | `/` | Public | System status and welcome endpoint |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **Users** | `POST` | `/api/users` | Public | Register student (role forced to `STUDENT`) |
| **Users** | `GET` | `/api/users` | Authenticated | List registered users |
| **Users** | `GET` | `/api/users/{id}` | Authenticated | Retrieve user profile details |
| **Users** | `PUT` | `/api/users/{id}` | Authenticated (Owner/Admin)| Update personal academic profile |
| **Users** | `DELETE` | `/api/users/{id}` | Authenticated (Owner/Admin)| Delete user account (last-admin guarded) |
| **Clubs** | `GET` | `/api/clubs` | Authenticated | List all clubs |
| **Clubs** | `GET` | `/api/clubs/active` | Authenticated | List active clubs |
| **Clubs** | `GET` | `/api/clubs/{id}` | Authenticated | Retrieve club details |
| **Clubs** | `POST` | `/api/clubs/{id}/join` | Authenticated | Join a student organization |
| **Clubs** | `DELETE` | `/api/clubs/{id}/leave`| Authenticated | Leave a student organization |
| **Clubs** | `GET` | `/api/clubs/{id}/members` | Authenticated | List members of a club |
| **Clubs** | `GET` | `/api/users/me/clubs` | Authenticated | Get current user's club memberships |
| **Events** | `GET` | `/api/events` | Authenticated | List all events |
| **Events** | `GET` | `/api/events/active` | Authenticated | List active upcoming events |
| **Events** | `GET` | `/api/events/{id}` | Authenticated | Retrieve event details |
| **Events** | `POST` | `/api/events` | Authenticated | Create a campus event |
| **Events** | `PUT` | `/api/events/{id}` | Authenticated (Organizer) | Update event details |
| **Events** | `DELETE` | `/api/events/{id}` | Authenticated (Organizer) | Delete event |
| **Events** | `POST` | `/api/events/{id}/rsvp` | Authenticated | RSVP to an event |
| **Events** | `DELETE` | `/api/events/{id}/rsvp` | Authenticated | Cancel event RSVP |
| **Events** | `GET` | `/api/events/{id}/attendees` | Authenticated | List attendees for an event |
| **Events** | `GET` | `/api/users/me/events` | Authenticated | Get current user's RSVPs |
| **Teams** | `GET` | `/api/teams` | Authenticated | List all teams |
| **Teams** | `GET` | `/api/teams/open` | Authenticated | List teams open for members |
| **Teams** | `GET` | `/api/teams/{id}` | Authenticated | Retrieve team details |
| **Teams** | `POST` | `/api/teams` | Authenticated | Create project collaboration team |
| **Teams** | `PUT` | `/api/teams/{id}` | Authenticated (Owner) | Update team details |
| **Teams** | `DELETE` | `/api/teams/{id}` | Authenticated (Owner) | Delete team and cascade members |
| **Teams** | `POST` | `/api/teams/{id}/join-requests` | Authenticated | Request to join a squad |
| **Teams** | `DELETE` | `/api/teams/join-requests/{id}` | Authenticated (Requester)| Cancel pending join request |
| **Teams** | `GET` | `/api/teams/{id}/members` | Authenticated | List team members |
| **Teams** | `GET` | `/api/teams/{id}/join-requests` | Authenticated (Owner) | View pending squad requests |
| **Teams** | `PUT` | `/api/teams/join-requests/{id}/accept` | Authenticated (Owner) | Accept member into squad |
| **Teams** | `PUT` | `/api/teams/join-requests/{id}/reject` | Authenticated (Owner) | Reject member join request |
| **Teams** | `GET` | `/api/users/me/teams` | Authenticated | List teams owned by current user |
| **Teams** | `GET` | `/api/users/me/team-requests` | Authenticated | List current user's sent requests |
| **Announcements** | `GET` | `/api/announcements` | Authenticated | List announcements |
| **Announcements** | `GET` | `/api/announcements/active` | Authenticated | List active announcements |
| **Announcements** | `POST` | `/api/announcements` | Authenticated | Create announcement |
| **Announcements** | `PUT` | `/api/announcements/{id}` | Authenticated (Author) | Update announcement |
| **Announcements** | `DELETE` | `/api/announcements/{id}` | Authenticated (Author) | Delete announcement |
| **Opportunities** | `GET` | `/api/opportunities` | Authenticated | List opportunities |
| **Opportunities** | `GET` | `/api/opportunities/active` | Authenticated | List active opportunities |
| **Opportunities** | `POST` | `/api/opportunities` | Authenticated | Post an opportunity |
| **Opportunities** | `PUT` | `/api/opportunities/{id}` | Authenticated (Poster) | Update opportunity |
| **Opportunities** | `DELETE` | `/api/opportunities/{id}` | Authenticated (Poster) | Delete opportunity |
| **Admin Stats** | `GET` | `/api/admin/dashboard/stats` | **ROLE_ADMIN** | High-performance aggregate counts |
| **Admin Users** | `GET` | `/api/admin/users` | **ROLE_ADMIN** | Search and filter user accounts |
| **Admin Users** | `GET` | `/api/admin/users/{id}` | **ROLE_ADMIN** | Get detailed user info |
| **Admin Users** | `PUT` | `/api/admin/users/{id}/role` | **ROLE_ADMIN** | Update role (`STUDENT` / `ADMIN`) |
| **Admin Clubs** | `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/clubs[/{id}]` | **ROLE_ADMIN** | Full club administration |
| **Admin Events** | `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/events[/{id}]` | **ROLE_ADMIN** | Full event administration |
| **Admin Notices**| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/announcements[/{id}]`| **ROLE_ADMIN** | Full announcement administration |
| **Admin Careers**| `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/opportunities[/{id}]`| **ROLE_ADMIN** | Full opportunity administration |
| **Admin Teams**  | `GET`, `DELETE` | `/api/admin/teams[/{id}]` | **ROLE_ADMIN** | Team auditing & moderation |

---

## Production Readiness Checklist

- [x] **Configurable Secrets**: Database credentials, JWT secrets, and admin bootstrap settings inject via environment variables.
- [x] **Stateless Security**: Spring Security stateless session policy with JWT validation filter.
- [x] **Role-Based Authorization**: Distinct `ROLE_STUDENT` and `ROLE_ADMIN` role hierarchy; non-admin users cannot access `/api/admin/**`.
- [x] **Input Validation**: Request DTOs enforced with Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Email`, `@Min`, `@NotNull`).
- [x] **Zero Information Disclosure**: Global exception handler masks stack traces and internal errors; login errors avoid user enumeration.
- [x] **Resource Ownership Controls**: Users cannot modify or delete resources owned by other users.
- [x] **Data Consistency & Atomicity**: Multi-step operations (`UserService`, `TeamService`, `ClubService`, `EventService`) run within `@Transactional` boundaries.
- [x] **Production Build Verified**:
  - Frontend: `npm run build` succeeds with 0 TypeScript and 0 Vite build errors.
  - Backend: `./mvnw.cmd clean package -DskipTests` produces valid executable Spring Boot fat JAR.
- [x] **Automated Security Regression Suite**: 15 automated integration tests verify authentication, authorization, RBAC boundaries, CORS, last-admin protection, and error masking.

---

## Known Limitations & Future Work

1. **Database Schema Migrations**:
   - The application currently uses Hibernate DDL management (`spring.jpa.hibernate.ddl-auto=update`). In production enterprise deployments, adopting Flyway or Liquibase is recommended for deterministic version-controlled database schema migrations.
2. **Token Invalidation / Revocation**:
   - JWT tokens are stateless with a 24-hour expiration window. Immediate token revocation prior to expiry (e.g. upon user logout) currently relies on client-side token discard. Future iterations may implement a Redis token denylist or refresh token rotation pattern.
3. **Persistent Media Uploads**:
   - Organization logos and user profile pictures currently utilize URLs or placeholder initials. Dedicated object storage (AWS S3 or MinIO) is planned for direct media uploads.
4. **Rate Limiting**:
   - In production ingress / reverse proxy configurations (e.g. Nginx, Cloudflare), rate-limiting should be configured on `/api/auth/login` to mitigate brute-force attempts.
