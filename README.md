# PatientNova

A full-stack medical practice management platform that allows healthcare providers to manage patients, appointments, medical records, and automated notifications via WhatsApp and SMS.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Notification System](#notification-system)
- [Background Workers](#background-workers)
- [Security](#security)
- [Testing](#testing)

---

## Overview

PatientNova is a private admin dashboard built for a medical practice. It centralizes patient records, medical histories, appointment scheduling, and outbound notification delivery — sending appointment reminders to patients through **WhatsApp**, **SMS**, or **Email** via Twilio.

The system supports both **immediate dispatch** (send now) and **scheduled delivery** (cron-driven background worker). All notification history is persisted for audit and tracking.

---

## Features

### Patients
- Create, update, archive, and delete patient records
- Track contact info: WhatsApp number, SMS number, email, date of birth, notes
- Patient statuses: `ACTIVE`, `INACTIVE`, `ARCHIVED`
- Searchable and filterable list with pagination and status stats

### Medical Records
- Full clinical history per patient: consultation reason, development, lifestyle, trauma, mental history
- Family member tracking with relationships (Father, Mother, Sibling, Spouse, etc.)
- Evolution notes with timestamped entries
- Atomic updates via database transactions

### Appointments
- Schedule appointments with start/end time, type, price, and location
- **Conflict detection** — prevents double-booking patients in overlapping time slots
- Configurable appointment types with predefined durations and pricing
- Configurable locations with color-coded badges
- Statuses: `SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- Mark appointments as paid with a single action
- Calendar view (monthly) and list view with filtering
- Revenue stats and status breakdowns

### Reminders & Notifications
- Create reminders linked to patients and/or appointments
- Channels: `WHATSAPP`, `SMS`, `EMAIL`
- Modes: `IMMEDIATE` (instant dispatch) or `SCHEDULED` (queued for later)
- Uses Twilio **Content Templates** for WhatsApp (pre-approved message templates with variable substitution)
- Full delivery history with statuses: `PENDING`, `SENT`, `FAILED`, `CANCELLED`, `QUEUED`
- Bulk send wizard for sending reminders to multiple patients at once
- Stats by channel and status, auto-refreshed every 60 seconds

### Settings
- User profile management with avatar upload
- Appointment type and location configuration (soft-delete support)
- Multi-user support with role-based access (`SUPER_ADMIN`, `ADMIN`)

---

## Tech Stack

### Frontend — `patientnova_dasboard`

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Component Libraries | Ant Design 6 |
| Styling | Tailwind CSS v4, CSS Modules |
| Date Handling | dayjs, flatpickr |
| State | nuqs (URL query state) |
| Testing | Vitest, React Testing Library |

### Backend — `patientnova_server`

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Validation | Zod 3 |
| Scheduler | node-cron 4 |
| Notifications | Twilio SDK 5 (WhatsApp + SMS) |
| Security | Helmet, express-rate-limit, CORS, bcrypt |
| Auth | JWT (httpOnly cookies) with account lockout |
| Logging | Pino |
| Testing | Vitest |

---

## Architecture

The application follows a **clean layered architecture**:

```
Request → Routes → Service → Repository → Prisma → PostgreSQL
```

- **Routes** — Express route handlers, request validation (Zod schemas), response formatting
- **Service** — Business logic, ownership verification, cross-entity coordination
- **Repository** — Data access layer, Prisma queries, pagination helpers
- **Middleware** — Authentication (JWT), validation, async error handling, rate limiting

Key architectural patterns:
- **Multi-tenant by user** — All data is scoped to the authenticated user via `userId` foreign keys
- **Soft deletes** — Locations and appointment types use `isActive` flags rather than hard deletes
- **Optimistic audit trail** — Notifications create a `PENDING` record before dispatch, then update status (ensures audit trail even if the server crashes mid-send)
- **Background workers** — Cron-based scheduler for reminder dispatch and appointment auto-completion
- **Error boundaries** — React ErrorBoundary at root level catches render failures gracefully
- **Retry with backoff** — Frontend data-fetching hooks retry failed requests with exponential backoff

---

## Project Structure

```
PatientNova/
├── patientnova_dasboard/          # Next.js 16 frontend
│   ├── .env.example               # Environment variable template
│   └── src/
│       ├── api/                   # Data-fetching hooks (useApiQuery, useApiMutation, per-resource hooks)
│       ├── app/                   # Next.js App Router
│       │   ├── AuthContext.tsx     # Auth provider (session management, login/logout)
│       │   ├── providers.tsx      # Root providers (auth, error boundary, URL state)
│       │   ├── page.tsx           # Public landing page
│       │   └── (protected)/       # Auth-guarded routes
│       │       ├── dashboard/     # Overview with stats, today's appointments, active reminders
│       │       ├── patients/      # Patient CRUD with search and filtering
│       │       ├── appointments/  # Appointment management with conflict detection
│       │       ├── calendar/      # Monthly calendar view
│       │       ├── reminders/     # Reminder management and bulk send
│       │       ├── medical-records/ # Clinical history per patient
│       │       └── settings/      # Profile, locations, appointment types
│       ├── components/            # Shared UI components
│       │   ├── Drawers/           # Create/edit side panels
│       │   ├── Info/              # Stat cards, status pills, badges
│       │   ├── Modals/            # Confirmation dialogs, appointment/reminder modals
│       │   ├── Navigation/        # Sidebar navigation
│       │   ├── CustomSelect.tsx   # Accessible dropdown with keyboard navigation
│       │   └── ErrorBoundary.tsx  # React error boundary with retry
│       ├── types/                 # TypeScript interfaces and enums
│       ├── utils/                 # Helpers (formatting, time, avatar, debounce)
│       └── test/                  # Vitest test suites
│
├── patientnova_server/            # Express backend
│   ├── .env.example               # Environment variable template
│   ├── schema.prisma              # Prisma schema (models, indexes, enums)
│   └── src/
│       ├── auth/                  # Login, logout, session refresh, account lockout
│       ├── users/                 # User CRUD, password change, role management
│       ├── patients/              # Patient CRUD with search, stats, ownership checks
│       ├── appointments/          # Appointment CRUD, conflict detection, stats, auto-complete
│       ├── appointment-types/     # Configurable types (soft-delete)
│       ├── locations/             # Configurable locations (soft-delete)
│       ├── reminders/             # Reminder CRUD, stats, status management
│       ├── medical-records/       # Clinical records with family members, evolution notes
│       ├── notify/                # Immediate WhatsApp/SMS dispatch
│       ├── twilio/                # Twilio client wrapper, webhook handler, signature validation
│       ├── middlewares/           # Auth (JWT), Zod validation, async error handler
│       ├── prisma/                # Prisma client, seed scripts
│       └── utils/                 # Config, logger, scheduler, errors, pagination, time helpers
│
└── patientnova_bruno/             # Bruno API collection (manual testing)
```

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **PostgreSQL** database
- A [Twilio](https://www.twilio.com) account with:
  - A WhatsApp-enabled sender (Sandbox or approved number)
  - An SMS-enabled phone number
  - Approved Content Template SIDs for WhatsApp messages

### Environment Variables

**Backend** — copy `patientnova_server/.env.example` to `patientnova_server/.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | JWT signing secret (generate with `openssl rand -hex 64`) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | WhatsApp sender (e.g. `whatsapp:+14155238886`) |
| `TWILIO_SMS_FROM` | SMS sender phone number |
| `TWILIO_WEBHOOK_BASE_URL` | Public URL for Twilio webhooks |
| `TWILIO_WHATSAPP_USER_REMINDER_*_SID` | Content Template SIDs (1–6 appointments) |
| `ALLOWED_ORIGINS` | JSON array of allowed CORS origins |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin account credentials |
| `BCRYPT_ROUNDS` | Password hashing rounds (default: `12`) |
| `DEFAULT_TIMEZONE` | Default IANA timezone (default: `America/Bogota`) |
| `DEFAULT_CURRENCY` | Default currency code (default: `COP`) |

**Frontend** — copy `patientnova_dasboard/.env.example` to `patientnova_dasboard/.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_TWILIO_REMINDER_SID` | Twilio Content Template SID for reminders |
| `NEXT_PUBLIC_TWILIO_REMINDER_CONFIRM_SID` | Twilio Content Template SID for confirmations |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email shown on landing page |

### Installation

```bash
# Backend
cd patientnova_server
npm install
npx prisma migrate deploy
npm run db:seed-admin        # Creates the initial admin user

# Frontend
cd patientnova_dasboard
npm install
```

### Running the App

**Development:**
```bash
# Terminal 1 — Backend (hot reload)
cd patientnova_server
npm run dev
# → http://localhost:3001

# Terminal 2 — Frontend (hot reload)
cd patientnova_dasboard
npm run dev
# → http://localhost:3000
```

**Production:**
```bash
# Backend
cd patientnova_server
npm run build
npm start          # Runs migrations, seeds admin, starts server

# Frontend
cd patientnova_dasboard
npm run build
npm start          # Starts Next.js production server
```

---

## API Reference

All endpoints require authentication via JWT cookie (except `/health`, `/auth/login`, and Twilio webhooks).

### Response Format

Success:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-22T12:00:00.000Z"
}
```

Paginated:
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

Error:
```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2026-03-22T12:00:00.000Z"
}
```

### Endpoints

#### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate and set session cookie |
| `POST` | `/auth/logout` | Clear session cookie |
| `POST` | `/auth/refresh` | Refresh JWT token |

#### Health
| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | DB connectivity check and service uptime |
| `GET` | `/messages/:messageSid` | Fetch live Twilio delivery status (rate-limited) |

#### Users
| Method | Path | Description |
|---|---|---|
| `GET` | `/users/me` | Get current user profile |
| `GET` | `/users` | List all users (Super Admin only) |
| `POST` | `/users` | Create a new user (Super Admin only) |
| `PATCH` | `/users/:id` | Update user profile |
| `POST` | `/users/change-password` | Change password |

#### Patients
| Method | Path | Description |
|---|---|---|
| `GET` | `/patients` | List patients (search, status, pagination, sorting) |
| `GET` | `/patients/stats` | Count breakdown by status |
| `GET` | `/patients/:id` | Get single patient with relations |
| `POST` | `/patients` | Create a new patient |
| `PATCH` | `/patients/:id` | Partially update a patient |
| `DELETE` | `/patients/:id` | Delete a patient |

#### Appointments
| Method | Path | Description |
|---|---|---|
| `GET` | `/appointments` | List appointments (patient, status, dates, paid, pagination) |
| `GET` | `/appointments/stats` | Revenue and status aggregates |
| `GET` | `/appointments/:id` | Get appointment with linked patient and reminder |
| `POST` | `/appointments` | Create appointment (with conflict detection) |
| `PATCH` | `/appointments/:id` | Update appointment (with conflict detection on time changes) |
| `POST` | `/appointments/:id/pay` | Mark as paid |
| `POST` | `/appointments/:id/cancel` | Cancel appointment |
| `DELETE` | `/appointments/:id` | Delete appointment |

#### Appointment Types & Locations
| Method | Path | Description |
|---|---|---|
| `GET` | `/appointment-types` | List active appointment types |
| `POST` | `/appointment-types` | Create type |
| `PATCH` | `/appointment-types/:id` | Update type (including soft-delete via `isActive`) |
| `GET` | `/locations` | List active locations |
| `POST` | `/locations` | Create location |
| `PATCH` | `/locations/:id` | Update location (including soft-delete via `isActive`) |

#### Reminders
| Method | Path | Description |
|---|---|---|
| `GET` | `/reminders` | List reminders (status, channel, patient, dates, pagination) |
| `GET` | `/reminders/stats` | Count by status and channel |
| `GET` | `/reminders/:id` | Get single reminder with linked appointment |
| `POST` | `/reminders` | Create a new reminder |
| `PATCH` | `/reminders/:id` | Update a reminder |
| `POST` | `/reminders/:id/cancel` | Cancel a pending reminder |
| `DELETE` | `/reminders/:id` | Delete a reminder |

#### Notify (Immediate Dispatch)
| Method | Path | Description |
|---|---|---|
| `POST` | `/notify/whatsapp` | Send immediate WhatsApp message |
| `POST` | `/notify/sms` | Send immediate SMS |

#### Medical Records
| Method | Path | Description |
|---|---|---|
| `GET` | `/medical-records/:patientId` | Get patient's medical record |
| `PUT` | `/medical-records/:patientId` | Create or update medical record (atomic transaction) |

---

## Database Schema

The database uses PostgreSQL with Prisma ORM. Key models:

### Core Models

| Model | Purpose | Key Fields |
|---|---|---|
| `User` | Admin users | email, role (`SUPER_ADMIN`/`ADMIN`), status, timezone |
| `Patient` | Patient records | name, contact info, status (`ACTIVE`/`INACTIVE`/`ARCHIVED`) |
| `Appointment` | Scheduled visits | startAt, endAt, timezone, price, currency, status, paid |
| `Reminder` | Notifications | channel, to, status, sendMode, sendAt, messageId |
| `MedicalRecord` | Clinical history | consultation reason, development, lifestyle, trauma, mental history |
| `FamilyMember` | Patient family | name, sex, age, relationship |
| `EvolutionNote` | Progress notes | date, text (timestamped entries) |
| `AppointmentLocation` | Configurable venues | name, color, bg, isActive |
| `AppointmentType` | Visit categories | name, defaultDuration, defaultPrice, isActive |

### Relationships

- A **User** owns many **Patients** (multi-tenant isolation)
- A **Patient** has many **Appointments**, many **Reminders**, and one optional **MedicalRecord**
- A **MedicalRecord** has many **FamilyMembers** and many **EvolutionNotes**
- An **Appointment** optionally links to one **Reminder** (one-to-one)
- **Appointments** reference an **AppointmentType** and **AppointmentLocation**

### Indexes

Composite indexes are defined for common query patterns:
- `Patient`: `[userId, status]`, `[userId, email]` (unique)
- `Appointment`: `[startAt, status]`, `[patientId]`, `[locationId]`, `[typeId]`
- `Reminder`: `[status, sendAt]`, `[patientId]`

---

## Notification System

### Immediate Dispatch

Call `POST /notify/whatsapp` or `POST /notify/sms`:

1. A `PENDING` reminder record is created first (audit trail)
2. The message is sent via Twilio API
3. On success: status → `SENT`, Twilio `messageSid` stored
4. On failure: status → `FAILED`, error message recorded

This **create-first-then-send** pattern ensures an audit trail exists even if the server crashes between sending and recording.

### Scheduled Dispatch

1. Create a reminder via `POST /reminders` with `sendMode: "SCHEDULED"` and a future `sendAt`
2. The background **reminderWorker** polls every minute for `PENDING` reminders with `sendAt ≤ now`
3. Each matching reminder is dispatched through Twilio
4. Status is updated to `SENT` or `FAILED` with the result

WhatsApp messages require a Twilio **Content Template SID** (`contentSid`) and optionally `contentVariables` for template placeholders — required by WhatsApp Business API policy.

---

## Background Workers

Three workers run on a shared **1-minute cron schedule** via `node-cron`:

| Worker | Purpose |
|---|---|
| `reminderWorker` | Dispatches `PENDING` reminders whose `sendAt` time has passed. Tracks sent messages to poll Twilio for delivery status updates. |
| `appointmentWorker` | Auto-transitions `SCHEDULED`/`CONFIRMED` appointments to `COMPLETED` when more than 1 hour past `endAt` |
| `dailyReminderWorker` | Sends daily "tomorrow's appointments" summary via WhatsApp to users with reminders enabled |

All workers:
- Start automatically on server boot via `initializeSchedulers()`
- Shut down cleanly on `SIGTERM`/`SIGINT`
- Are wrapped in error handling — a failure in one cycle logs the error and retries next minute
- Include safeguards against memory leaks (max tracked reminders, max-age pruning, poll failure limits)

---

## Security

- **Authentication** — JWT tokens stored in httpOnly, secure cookies with configurable sameSite policy
- **Account lockout** — Configurable max failed attempts and lockout duration
- **Timing-safe login** — Dummy bcrypt comparison on unknown emails to prevent user enumeration
- **Input validation** — All request bodies and query parameters validated via Zod schemas
- **IANA timezone validation** — Timezone strings validated against the Intl API
- **Rate limiting** — Global rate limiter + dedicated limit on message status endpoint
- **CORS** — Configurable allowed origins
- **Helmet** — Standard HTTP security headers
- **Soft-delete filtering** — Inactive locations and appointment types are excluded from list queries
- **Email normalization** — Emails lowercased on creation to prevent case-based duplicates
- **Input sanitization** — Twilio message SIDs validated against regex pattern before API calls

---

## Testing

```bash
# Server tests (23 tests across 4 suites)
cd patientnova_server
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report

# Dashboard tests (30 tests across 3 suites)
cd patientnova_dasboard
npm test                 # Run once
npm run test:watch       # Watch mode
```

Test suites cover:
- **Server**: Error handling, Prisma error mapping, pagination utilities, time utilities
- **Dashboard**: API query hook (loading, error, retry, refetch), component rendering, time formatting
