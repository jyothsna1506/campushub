# CampusHub

CampusHub is a full-stack multi-college collaboration, campus engagement, and academic management platform designed for modern higher education institutions. It connects students, faculty coordinators, and campus administrators into a unified digital workspace covering student organizations, campus events, collaborative project teams, official campus announcements, career opportunities, peer-to-peer campus community discussions, and student academic profiles.

The platform is powered by a robust Spring Boot REST API featuring strict multi-college tenancy isolation, Spring Security role-based access control (RBAC), stateless JWT authentication, Cloudinary media storage, and a responsive React Single Page Application (SPA) styled with Tailwind CSS.

---

## Overview

Modern university campuses require a centralized, secure, and isolated digital platform where students across various departments and programs can collaborate, discover opportunities, and stay informed. CampusHub addresses these needs through:

- **Multi-Tenant College Isolation**: Ensuring complete data boundaries between distinct academic institutions.
- **Enterprise-Grade Security**: Stateless JWT authentication, BCrypt encryption, and strict RBAC distinguishing students and campus administrators.
- **Student Collaboration**: Interactive clubs, event RSVP workflows, team squad formation for hackathons/capstone projects, and peer discussion boards.
- **Administrative Governance**: Institution-scoped consoles for managing user roles, monitoring campus metrics, scheduling events, publishing announcements, and auditing squads.

---

## Features

### Student Workspace
- **Campus Community**: Unified college discussion board supporting categorized posts (`DOUBT`, `QUESTION`, `ACHIEVEMENT`, `ADVICE`, `DISCUSSION`), type filtering, text search, author badges, and nested comment threads.
- **Profile Image Management**: Direct photo upload and deletion integrated with Cloudinary (with local fallback), displaying avatars across headers, profile cards, and comments with initials fallback.
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

## Architecture

CampusHub follows a decoupled, stateless client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Frontend                      │
│            React 19 + TypeScript + Vite SPA            │
│            (Client-side Routing via vercel.json)       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JWT Bearer)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Render Backend                      │
│          Spring Boot 4 REST API (Port via $PORT)       │
│     ├── Spring Security (Stateless JWT Filter & RBAC)  │
│     ├── Multi-College Tenancy Scoping Engine           │
│     ├── Global Exception Handler & DTO Validation      │
│     └── Health Check (/api/health)                     │
└───────────────┬─────────────────────────┬──────────────┘
                │ JDBC Connection         │ Cloudinary API
                ▼                         ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│       Production MySQL        │ │      Cloudinary      │
│   (Aiven / AWS RDS / MySQL)   │ │  (Profile Image CDN) │
└───────────────────────────────┘ └──────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Routing**: React Router v7 (Nested layouts, ProtectedRoute, AdminRoute)
- **HTTP Client**: Axios with centralized request/response interceptors
- **Hosting / Deployment Target**: Vercel

### Backend
- **Framework**: Spring Boot 4 / Spring Framework 7
- **Language**: Java 17+ (Java 21 / 24 verified)
- **Security**: Spring Security (Stateless JWT Filter, DaoAuthenticationProvider, BCrypt)
- **ORM / Persistence**: Spring Data JPA, Hibernate ORM
- **Database Driver**: MySQL Connector/J
- **Media Storage**: Cloudinary SDK (with local data URI fallback)
- **Token Utility**: JJWT (Java JWT)
- **Boilerplate Reduction**: Project Lombok
- **Hosting / Deployment Target**: Render

### Database
- **Engine**: MySQL 8.0+

---

## Multi-College Architecture

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

## Authentication & Authorization

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

## Campus Community

The Campus Community is a peer-to-peer discussion forum embedded directly within each college:

- **Tags & Categories**:
  - `DOUBT`: Course-related or conceptual academic queries.
  - `QUESTION`: General student campus inquiries.
  - `ACHIEVEMENT`: Student milestones, hackathon wins, and awards.
  - `ADVICE`: Recommendations for electives, internships, and faculty.
  - `DISCUSSION`: Open dialogue on campus topics.
- **Features**: Real-time category filtering, title and content search, author role indicators, nested commenting, and author deletion rights.
- **Tenancy Boundary**: Posts and comments are strictly isolated to the caller's registered college.

---

## Profile Images

CampusHub supports direct profile photo management:

- **Storage Engine**: Powered by Cloudinary using server-side signed uploads.
- **Local Fallback**: Automatically falls back to inline Data URIs during local development or testing when Cloudinary environment variables are unset.
- **Security**: The `CLOUDINARY_API_SECRET` resides strictly on the backend. The frontend only communicates with `/api/users/me/profile-image`.
- **UI Integration**: Profile images render across headers, profile cards, and community comments, with an automatic initials fallback when no image is uploaded.

---

## Local Development

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
Run the comprehensive 25-test security regression suite from `backend/`:
```bash
# Windows
.\mvnw.cmd test -Dtest=SecurityRegressionTests

# Linux / macOS
./mvnw test -Dtest=SecurityRegressionTests
```

---

## Environment Variables

### Backend Configuration (Spring Boot)
| Variable | Required in Production | Default (Development) | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `8080` | Web server listening port (automatically set by Render) |
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

### Frontend Configuration (Vite + React)
| Variable | Required in Production | Default (Development) | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `http://localhost:8080` | Base URL of the backend REST API |

---

## Production Deployment

### 1. Database Deployment (MySQL)
Deploy a managed MySQL 8.0+ instance (e.g. Aiven, AWS RDS, PlanetScale, or Railway):
1. Create a MySQL database instance named `campushub`.
2. Ensure connection parameters (`host`, `port`, `user`, `password`) are noted.
3. Form the JDBC connection URL:
   ```
   jdbc:mysql://<db-host>:<db-port>/campushub?useSSL=true&requireSSL=true
   ```

### 2. Cloudinary Media Storage
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. From the Dashboard, copy the **Cloud Name**, **API Key**, and **API Secret**.

### 3. Backend Deployment (Render)
The repository includes a ready-to-use Render Blueprint [`render.yaml`](render.yaml):

1. Log in to [Render](https://render.com/) and connect your GitHub account.
2. Click **New +** -> **Blueprint**, and select the `campushub` repository.
3. Alternatively, create a **Web Service** manually:
   - **Root Directory**: `backend`
   - **Runtime**: `Java` (or Docker)
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -Dserver.port=$PORT -jar target/backend-0.0.1-SNAPSHOT.jar`
   - **Health Check Path**: `/api/health`
4. In the Render Dashboard, add the required **Environment Variables**:
   ```env
   DB_URL=jdbc:mysql://<db-host>:<db-port>/campushub?useSSL=true&requireSSL=true
   DB_USERNAME=<production-db-user>
   DB_PASSWORD=<production-db-password>
   JWT_SECRET=<generate-a-secure-256bit-random-secret>
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGIN=https://<your-vercel-domain>.vercel.app
   ADMIN_EMAIL=admin@college.edu
   ADMIN_PASSWORD=<secure-admin-password>
   ADMIN_FULL_NAME=Campus Administrator
   ADMIN_BOOTSTRAP_ENABLED=true
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   DDL_AUTO=update
   SHOW_SQL=false
   ```
5. Deploy the service. Verify that `GET https://<your-render-backend-url>/api/health` returns:
   ```json
   {"status": "UP"}
   ```

### 4. Frontend Deployment (Vercel)
The repository includes [`frontend/vercel.json`](frontend/vercel.json) for Single Page Application rewrite routing:

1. Log in to [Vercel](https://vercel.com/) and import the `campushub` GitHub repository.
2. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure the **Environment Variable**:
   ```env
   VITE_API_BASE_URL=https://<your-render-backend-url>
   ```
4. Deploy the project. Direct loads to any route (e.g. `/community`, `/dashboard`, `/admin`) will be properly routed without HTTP 404 errors.

---

## API Endpoint Reference

| Group | Method | Path | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/` | Public | System status and welcome endpoint |
| **System** | `GET` | `/api/health` | Public | Health check endpoint returning `{"status":"UP"}` |
| **Colleges** | `GET` | `/api/colleges/active` | Public | List active colleges for student registration |
| **Colleges** | `GET` | `/api/colleges/{id}` | Authenticated | Retrieve college details |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **Users** | `POST` | `/api/users` | Public | Register student with selected `collegeId` |
| **Users** | `GET` | `/api/users` | Authenticated | List registered users in caller's college |
| **Users** | `GET` | `/api/users/{id}` | Authenticated | Retrieve user profile details |
| **Users** | `PUT` | `/api/users/{id}` | Authenticated (Owner/Admin)| Update personal profile (college is immutable) |
| **Users** | `POST` | `/api/users/me/profile-image` | Authenticated | Upload or replace user profile photo |
| **Users** | `DELETE`| `/api/users/me/profile-image`| Authenticated | Remove user profile photo |
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
- [x] **Production Health Check**: `GET /api/health` publicly exposes `{"status": "UP"}` with zero sensitive data disclosure.
- [x] **SPA Routing Rewrites**: `frontend/vercel.json` provides wildcard rewrites to `/index.html` preventing 404s on page refresh.
- [x] **Render Blueprint**: `render.yaml` defines build/start configurations, dynamic port binding, and health check integration.
- [x] **Production Build Verified**:
  - Frontend: `npm run build` succeeds with 0 TypeScript and 0 Vite build errors.
  - Backend: `./mvnw.cmd clean package -DskipTests` produces valid executable Spring Boot fat JAR.
- [x] **Automated Security Regression Suite**: 25 automated integration tests verify authentication, authorization, multi-college boundaries, cross-college access rejection, community discussions, profile photo management, health check, and last-admin protection.

---

## Known Limitations & Future Work

1. **Database Schema Migrations**:
   - The application currently uses Hibernate DDL management (`spring.jpa.hibernate.ddl-auto=update`). In production enterprise deployments, adopting Flyway or Liquibase is recommended for deterministic version-controlled database schema migrations.
2. **Token Invalidation / Revocation**:
   - JWT tokens are stateless with a configurable expiration window (default 24h). Immediate token revocation prior to expiry (e.g. upon user logout) currently relies on client-side token discard. Future iterations may implement a Redis token denylist or refresh token rotation pattern.
3. **Rate Limiting**:
   - In production ingress / reverse proxy configurations (e.g. Cloudflare or Nginx), rate-limiting should be configured on `/api/auth/login` to mitigate brute-force attempts.
