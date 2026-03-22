# PatientNova 

A full-stack medical practice management platform that allows healthcare providers to manage patients, appointments, and automated notifications via WhatsApp and SMS.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
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

---

## Overview

PatientNova is a private admin dashboard built for a solo medical practice. It centralizes patient records, appointment scheduling, and outbound notification delivery — sending appointment reminders to patients through **WhatsApp**, **SMS**, or **Email** via Twilio.

The system supports both **immediate dispatch** (send now) and **scheduled delivery** (cron-driven background worker). All notification history is persisted for audit and tracking.

---

## Features

### Patients
- Create, update, archive, and delete patient records
- Track contact info: WhatsApp number, SMS number, email, date of birth, notes
- Patient statuses: `ACTIVE`, `INACTIVE`, `ARCHIVED`
- Searchable and filterable list with pagination and status stats

### Appointments
- Schedule appointments with start/end time, type, price, and location
- Appointment types with predefined durations and COP pricing: Individual, Niño, Pareja, Familia
- Statuses: `SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- Mark appointments as paid with a single action
- Calendar view and list view
- Revenue stats and status breakdowns

### Reminders & Notifications
- Create reminders linked to patients and/or appointments
- Channels: `WHATSAPP`, `SMS`, `EMAIL`
- Modes: `IMMEDIATE` (instant dispatch) or `SCHEDULED` (queued for later)
- Uses Twilio **Content Templates** for WhatsApp (pre-approved message templates with variable substitution)
- Full delivery history with statuses: `PENDING`, `SENT`, `FAILED`, `CANCELLED`
- Bulk send wizard for sending reminders to multiple patients at once
- Stats by channel and status, auto-refreshed every 60 seconds

---

## Tech Stack

### Frontend — `patientnova_dasboard`

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Component Libraries | Mantine 8, Ant Design 6 |
| Styling | Tailwind CSS v4 |
| Date Handling | dayjs, flatpickr, react-datepicker |

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
| Security | Helmet, express-rate-limit, CORS |
| Logging | Pino |

---

## Project Structure

```
NotificationService/
├── patientnova_dasboard/       # Next.js frontend
│   └── src/
│       ├── api/                # Data-fetching hooks (one per resource/action)
│       ├── app/                # Next.js App Router pages
│       │   ├── appointments/
│       │   ├── calendar/
│       │   ├── patients/
│       │   ├── reminders/
│       │   ├── settings/
│       │   └── templates/
│       ├── components/         # Shared UI components
│       │   ├── Drawers/        # Create/edit side panels
│       │   ├── Info/           # Badges, icons, banners
│       │   ├── Modals/         # Confirmation dialogs
│       │   └── Navigation/     # Sidebar navigation
│       ├── types/              # TypeScript interfaces
│       └── utils/              # Helpers (formatting, validation, debounce)
│
└── patientnova_server/         # Express backend
    └── src/
        ├── appointments/       # Appointment routes, repository, schemas
        ├── patients/           # Patient routes, repository, schemas
        ├── reminders/          # Reminder routes, repository, schemas
        ├── notify/             # Immediate dispatch routes
        ├── twillo/             # Twilio client and validator
        ├── middlewares/        # Zod validation middleware
        ├── prisma/             # Prisma client singleton
        └── utils/              # Config, logger, scheduler, error handling
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- A [Twilio](https://www.twilio.com) account with:
  - A WhatsApp-enabled sender (Sandbox or approved number)
  - An SMS-enabled phone number
  - At least one approved Content Template SID for WhatsApp messages

### Environment Variables

Create a `.env` file in `patientnova_server/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/patientnova"

# Twilio
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
TWILIO_SMS_FROM="+1XXXXXXXXXX"

# Server (optional)
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

The frontend API base URL is configured in `patientnova_dasboard/src/types/API.ts`. Update it to point to your backend host for non-local deployments.

### Installation

**Backend:**
```bash
cd patientnova_server
npm install
npx prisma migrate deploy
```

**Frontend:**
```bash
cd patientnova_dasboard
npm install
```

### Running the App

**Backend (development):**
```bash
cd patientnova_server
npm run dev
# Server starts on http://localhost:3001
```

**Frontend (development):**
```bash
cd patientnova_dasboard
npm run dev
# Dashboard available at http://localhost:3000
```

**Backend (production):**
```bash
cd patientnova_server
npm run build
npm start
```

---

## API Reference

All responses follow the envelope format:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-22T12:00:00.000Z"
}
```

Paginated list responses nest:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | DB connectivity check and service uptime |
| `GET` | `/messages/:messageSid` | Fetch live delivery status from Twilio |

### Patients

| Method | Path | Description |
|---|---|---|
| `GET` | `/patients` | List patients (supports: `status`, `search`, `page`, `pageSize`, `orderBy`, `order`, `from`, `to`) |
| `GET` | `/patients/stats` | Count breakdown by status |
| `GET` | `/patients/:id` | Get single patient by UUID |
| `POST` | `/patients` | Create a new patient |
| `PATCH` | `/patients/:id` | Partially update a patient |
| `DELETE` | `/patients/:id` | Hard delete a patient |

### Appointments

| Method | Path | Description |
|---|---|---|
| `GET` | `/appointments` | List appointments (supports: `patientId`, `status`, `startAt`, `dateFrom`, `dateTo`, `search`, `paid`, `page`, `pageSize`, `orderBy`, `order`) |
| `GET` | `/appointments/stats` | Revenue and status aggregates |
| `GET` | `/appointments/:id` | Get single appointment (includes linked patient and reminder) |
| `POST` | `/appointments` | Create a new appointment |
| `PATCH` | `/appointments/:id` | Partially update an appointment |
| `POST` | `/appointments/:id/pay` | Mark an appointment as paid |
| `DELETE` | `/appointments/:id` | Hard delete an appointment |

### Reminders

| Method | Path | Description |
|---|---|---|
| `GET` | `/reminders` | List reminders (supports: `status`, `channel`, `patientId`, `dateFrom`, `dateTo`, `search`, `page`, `pageSize`, `orderBy`, `order`) |
| `GET` | `/reminders/stats` | Count by status and by channel |
| `GET` | `/reminders/:id` | Get single reminder (includes linked appointment) |
| `POST` | `/reminders` | Create a new reminder record |
| `PATCH` | `/reminders/:id` | Partially update a reminder |
| `POST` | `/reminders/:id/cancel` | Cancel a pending reminder (returns 409 if not PENDING) |
| `DELETE` | `/reminders/:id` | Hard delete a reminder |

### Notify (Immediate Dispatch)

| Method | Path | Description |
|---|---|---|
| `POST` | `/notify/whatsapp` | Send an immediate WhatsApp message and persist a SENT reminder record |
| `POST` | `/notify/sms` | Send an immediate SMS and persist a SENT reminder record |

---

## Database Schema

### `patients`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, auto-generated |
| `name` / `lastName` | String | Indexed |
| `whatsappNumber` | String? | E.164 format |
| `smsNumber` | String? | E.164 format |
| `email` | String? | Unique |
| `dateOfBirth` | DateTime? | |
| `notes` | String? | Max 500 chars |
| `status` | Enum | `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| `archivedAt` | DateTime? | |
| `createdAt` / `updatedAt` | DateTime | |

### `appointments`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `startAt` / `endAt` | DateTime | Indexed |
| `timezone` | String | Default: `CST` |
| `price` | Int | In COP (Colombian Peso) |
| `currency` | String | Default: `COP` |
| `paid` | Boolean | Default: `false` |
| `location` | String | |
| `meetingUrl` | String? | For virtual sessions |
| `notes` | String? | Max 500 chars |
| `type` | String | e.g. `Individual`, `Pareja` |
| `status` | Enum | `SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `patientId` | UUID FK | References `patients`, cascade delete |
| `reminderId` | UUID FK? | References `reminders`, one-to-one |

### `reminders`

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `channel` | Enum | `WHATSAPP`, `SMS`, `EMAIL` |
| `to` | String | Destination phone number (E.164) |
| `contentSid` | String? | Twilio Content Template SID |
| `contentVariables` | Json? | Template variable substitutions |
| `status` | Enum | `PENDING`, `SENT`, `FAILED`, `CANCELLED` |
| `error` | String? | Populated on failure |
| `sendMode` | Enum | `IMMEDIATE`, `SCHEDULED` |
| `sendAt` | DateTime | When the message should be sent |
| `sentAt` | DateTime? | Populated after successful delivery |
| `messageId` | String? | Twilio Message SID |
| `appointmentId` | UUID FK? | References `appointments`, unique, cascade delete |
| `patientId` | UUID FK | References `patients`, cascade delete |

**Relationships:**
- A **Patient** has many **Appointments** and many **Reminders**
- An **Appointment** optionally has one **Reminder** (one-to-one)

---

## Notification System

There are two paths for sending notifications:

### Immediate Dispatch

Call `POST /notify/whatsapp` or `POST /notify/sms`. The server validates the request, calls the Twilio API synchronously, and persists a `SENT` reminder record for audit purposes.

### Scheduled Dispatch

1. Create a reminder via `POST /reminders` with `sendMode: "SCHEDULED"` and a future `sendAt` datetime. The reminder is stored with status `PENDING`.
2. A background cron job runs **every minute** and queries for all `PENDING` reminders with `sendAt ≤ now`.
3. For each matching reminder, the worker dispatches the message through Twilio.
4. On success: status is updated to `SENT` and the Twilio `messageId` is stored.
5. On failure: status is updated to `FAILED` and the error message is recorded.

WhatsApp messages require a Twilio **Content Template SID** (`contentSid`) and optionally a `contentVariables` JSON object to fill in template placeholders — this is required by WhatsApp Business API policy.

---

## Background Workers

The server runs two background workers on a shared **1-minute cron schedule**:

| Worker | Purpose |
|---|---|
| `reminderWorker` | Dispatches all `PENDING` reminders whose `sendAt` time has passed |
| `appointmentWorker` | Auto-transitions `SCHEDULED`/`CONFIRMED` appointments to `COMPLETED` when they are more than 1 hour past their `startAt` time |

Both workers start automatically on server boot via `initializeSchedulers()` and shut down cleanly on `SIGTERM`/`SIGINT`.
