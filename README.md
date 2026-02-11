# HR LeaveFlow

A production-ready, full-stack HR leave management application built from the ground up with **React**, **Node.js**, **Express.js**, and **PostgreSQL**. This system handles the complete employee leave lifecycle — from request submission to managerial approval — with secure JWT authentication and granular role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

### Live Demo

| | URL |
|--|-----|
| **Frontend** | [https://adeleke-taiwo-dev.github.io/HR-LeaveFlow/](https://adeleke-taiwo-dev.github.io/HR-LeaveFlow/) |
| **Backend API** | [https://hr-leaveflow.onrender.com/api/v1](https://hr-leaveflow.onrender.com/api/v1) |

> **Note:** The backend runs on Render's free tier and may take ~30 seconds to wake up on first request.

---

## Key Features

### Authentication & Security
- **Dual-token JWT authentication** — short-lived access tokens (15min) + long-lived refresh tokens (7 days, httpOnly cookies)
- **Automatic token refresh** — seamless session management via axios interceptors with zero user interruption
- **bcrypt password hashing** (cost factor 12) — industry-standard password security
- **Rate limiting** on auth endpoints — brute-force attack prevention
- **Helmet security headers** — protection against common web vulnerabilities
- **Zod schema validation** — strict input validation on both client and server

### Role-Based Access Control
| Role | Capabilities |
|------|-------------|
| **Employee** | Submit leave requests, view/cancel own leaves, check leave balance |
| **Manager** | All employee actions + approve/reject department leave requests, view team calendar |
| **Admin** | Full system access — manage users, departments, leave types, balances, all leave records |

### Leave Workflow
- Submit leave requests with automatic business day calculation
- Leave overlap detection to prevent conflicting requests
- Balance validation — requests rejected if insufficient days remaining
- Transactional balance updates on approve/reject/cancel (atomic database operations)
- Six leave types: Annual, Sick, Personal, Maternity/Paternity, Unpaid, Compassionate

### Dashboard & Analytics
- Role-adaptive dashboard showing relevant statistics per user type
- Leave balance visualization with progress indicators
- Filterable leave history with status tracking
- Department-level leave overview for managers

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 19 (Vite) | Component-based UI with fast HMR |
| **Backend** | Node.js + Express 5 | Minimal, flexible REST API framework |
| **Database** | PostgreSQL | Relational integrity for user-department-leave relationships |
| **ORM** | Prisma 5 | Type-safe queries, declarative schema, auto-migrations |
| **Auth** | JWT + bcrypt | Stateless, horizontally scalable authentication |
| **Server State** | TanStack Query | Caching, background refetching, optimistic updates |
| **Validation** | Zod | Shared schema validation across client and server |
| **Forms** | React Hook Form | Performant form handling with minimal re-renders |

---

## Architecture

```
leave-management/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # ProtectedRoute, StatCard, StatusBadge
│   │   │   └── layout/              # Sidebar, Header, Layout
│   │   ├── pages/                   # Route-level page components
│   │   ├── context/                 # AuthContext (global auth state)
│   │   ├── hooks/                   # Custom hooks (useAuth)
│   │   ├── services/                # API layer (axios + interceptors)
│   │   └── utils/                   # Constants, date utilities
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── routes/                  # Endpoint definitions + middleware chains
│   │   ├── controllers/             # HTTP request/response handling
│   │   ├── services/                # Business logic + database operations
│   │   ├── middleware/              # Auth, RBAC, validation, error handling
│   │   ├── config/                  # Database, environment
│   │   └── utils/                   # ApiError, catchAsync, helpers
│   └── prisma/
│       ├── schema.prisma            # Database models & relations
│       ├── migrations/              # Version-controlled schema changes
│       └── seed.js                  # Default data seeding
```

**Backend follows a layered architecture:** Routes → Controllers → Services → Database, with cross-cutting concerns handled by middleware. This separation ensures testability, maintainability, and clear single responsibility.

---

## Database Schema

Five interconnected models with enforced referential integrity:

```
User ──────┬──── Department
 │          │
 │     Leave ──── LeaveType
 │
 └──── LeaveBalance ──── LeaveType
        (unique: userId + leaveTypeId + year)
```

- **User** — Authentication credentials, role, department assignment
- **Department** — Organizational structure
- **LeaveType** — Configurable leave categories with default allocations
- **Leave** — Request records with full status lifecycle (pending → approved/rejected/cancelled)
- **LeaveBalance** — Per-user, per-type, per-year balance tracking with allocated/used/pending fields

---

## API Endpoints

Base URL: `/api/v1`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout and clear session |
| GET | `/auth/me` | Get current user profile |
| PATCH | `/auth/change-password` | Update password |

### Leaves
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/leaves` | Submit leave request | All |
| GET | `/leaves/my` | View own leaves | All |
| GET | `/leaves/team` | View department leaves | Manager, Admin |
| GET | `/leaves` | View all leaves | Admin |
| PATCH | `/leaves/:id/status` | Approve/Reject | Manager, Admin |
| PATCH | `/leaves/:id/cancel` | Cancel own request | Owner |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH/DELETE | `/users` | User management |
| GET/POST/PATCH/DELETE | `/departments` | Department management |
| GET/POST/PATCH | `/leave-balances` | Balance allocation |

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** 14+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adeleke-taiwo-dev/HR-LeaveFlow.git
   cd HR-LeaveFlow
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials and JWT secrets
   ```

4. **Run database migrations and seed**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

6. **Start both servers**
   ```bash
   # Terminal 1 — Backend (port 5000)
   cd server && npm run dev

   # Terminal 2 — Frontend (port 5173)
   cd client && npm run dev
   ```

7. **Open** `http://localhost:5173` in your browser

---

## Technical Highlights

These are some of the engineering decisions and challenges I navigated while building this project:

- **Token refresh with zero downtime** — Implemented axios interceptors that transparently refresh expired tokens and retry failed requests, with careful handling to prevent infinite retry loops on auth endpoints

- **Transactional balance management** — Leave approval/rejection updates both the leave status and balance counters atomically using Prisma transactions, preventing race conditions and data inconsistency

- **Express 5 compatibility** — Adapted middleware error handling for Express 5's breaking change where synchronous errors no longer propagate to error handlers automatically

- **Zod v4 migration** — Handled the breaking API change from `.errors` to `.issues` in Zod's error structure for seamless validation across the stack

- **Layered error handling** — Custom `ApiError` class + `catchAsync` wrapper + centralized error handler that differentiates between operational errors (400s), Prisma errors (constraint violations), validation errors (Zod), and unexpected errors (500s)

- **Secure auth architecture** — Access tokens stored in-memory (not localStorage) to mitigate XSS, refresh tokens in httpOnly cookies inaccessible to JavaScript, with CORS restricted to the frontend origin

---

## Future Roadmap

- [ ] Email notifications (new requests, approvals, rejections)
- [ ] Team leave calendar with visual availability view
- [ ] Public holiday integration and auto-exclusion
- [ ] Audit log for compliance tracking
- [ ] File attachments for medical certificates
- [ ] Reports & analytics dashboard with CSV/PDF export
- [ ] Multi-level approval workflows

---

## About Me

I'm a full-stack developer passionate about building clean, scalable applications with modern technologies. This project demonstrates my ability to architect and deliver a complete system — from database design and API development to frontend implementation and security hardening.

**Looking for opportunities** to contribute to impactful products with a collaborative team while continuously growing my technical and professional skills.

- GitHub: [@adeleke-taiwo-dev](https://github.com/adeleke-taiwo-dev)

---

## License

This project is open source and available under the [MIT License](LICENSE).
