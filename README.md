<div align="center">

# Integrated Task Management

### Next.js Task Management with Supabase Authentication and Row-Level Security

A responsive task-management application with account security, Kanban-style workflows, dashboard statistics, and profile management.

[![Live Demo](https://img.shields.io/badge/Live_Demo-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white)](https://7sadakonr-todo-list.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## Overview

This project is a **Next.js App Router application backed by Supabase**. The browser application uses Supabase Auth for user sessions and accesses the `members` and `todos` PostgreSQL tables through the Supabase JavaScript client.

The current repository does not contain the legacy Express, Prisma, JWT, Render, or Neon backend described by the previous README. Authorization is enforced by Supabase authentication and PostgreSQL Row-Level Security policies.

---

## Features

### Authentication and Security

- Account registration and sign-in with Supabase Auth
- Strong password validation
- Breached-password checking through the Have I Been Pwned range API
- K-anonymity approach that sends only the first five SHA-1 hash characters
- User-owned data protected with Supabase Row-Level Security
- Session-aware protected back-office routes

### Task Management

- Create, read, update, and delete tasks
- Three workflow states: pending, in progress, and completed
- Kanban-style task organization
- Drag-and-drop status changes
- Filtering by task status
- Task names and optional remarks
- Confirmation and status dialogs with SweetAlert2

### Dashboard and Profile

- Dashboard counts for each workflow state
- Responsive profile-management interface
- User information stored in the `members` table
- Responsive glass-style interface
- GPU-rendered interactive backgrounds

---

## Verified Technology Stack

| Category | Technology | Current Usage |
|---|---|---|
| Framework | Next.js 16.0.8 | App Router, pages, layouts, and Turbopack builds |
| UI Runtime | React 19.1 | Components, hooks, and client-side state |
| Language | TypeScript 5 | Typed pages, components, and utilities |
| Styling | Tailwind CSS 4 | Responsive layouts and visual styling |
| Authentication | Supabase Auth | Registration, sign-in, and user sessions |
| Database | Supabase PostgreSQL | `members` and `todos` application data |
| Authorization | PostgreSQL Row-Level Security | Per-user access policies for profiles and tasks |
| Supabase Client | `@supabase/ssr` 0.12.3 and `@supabase/supabase-js` 2.110.8 | Browser and server-compatible Supabase access |
| Password Safety | Have I Been Pwned Passwords API and Web Crypto API | K-anonymous breached-password checks |
| Dialogs | SweetAlert2 11.26 | Validation, confirmations, success, and error dialogs |
| WebGL Effects | Three.js 0.180 and postprocessing 6.37 | PixelBlast interactive background effect |
| WebGL Effects | OGL 1.0.11 | PrismaticBurst shader background effect |
| Deployment | Vercel | Next.js production deployment |

Framer Motion, Recharts, and express-fileupload remain listed as dependencies, but the current application code inspected for this README does not rely on them for the documented features.

---

## Data Model

### `members`

| Field | Purpose |
|---|---|
| `id` | Supabase Auth user UUID and primary key |
| `name` | Display name |
| `username` | Unique application username |
| `created_at` | Account creation timestamp |

### `todos`

| Field | Purpose |
|---|---|
| `id` | Task identifier |
| `name` | Task name |
| `remark` | Optional task details |
| `status` | `use`, `doing`, or `success` workflow value |
| `member_id` | Owner UUID linked to `members` |
| `created_at` | Task creation timestamp |

Row-Level Security policies allow users to read and update only their own member record and to create, read, update, or delete only tasks whose `member_id` matches the authenticated user.

---

## Project Structure

```text
Todo-List/
├── my-app/
│   ├── app/
│   │   ├── backoffice/
│   │   │   ├── signin/       # Supabase sign-in interface
│   │   │   ├── signup/       # Registration and password checks
│   │   │   └── home/
│   │   │       ├── dashboard/ # Workflow statistics
│   │   │       ├── todo/      # CRUD, filtering, and Kanban workflow
│   │   │       └── profile/   # User profile management
│   │   ├── components/        # Shared UI and WebGL effects
│   │   └── lib/               # Supabase and password-safety utilities
│   └── package.json
├── supabase_schema.sql        # Tables, relationships, and RLS policies
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 20 or a version supported by Next.js 16
- npm
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/7sadakonr/Todo-List.git
cd Todo-List/my-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database schema

Run the contents of `supabase_schema.sql` in the Supabase SQL Editor. This creates the `members` and `todos` tables and enables their Row-Level Security policies.

### 4. Configure environment variables

Create `my-app/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start development

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js with Turbopack |
| `npm run build` | Create a production build with Turbopack |
| `npm run start` | Start the production server |

---

## Deployment

- Application: Vercel
- Authentication and database: Supabase

The Vercel project must define the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables.

---

## License

Licensed under the MIT License.

Developed by [@7sadakonr](https://github.com/7sadakonr)
