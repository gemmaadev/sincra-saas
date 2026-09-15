<div align="center">

### Sincra

Multichannel communications and order management platform for small businesses: unified inbox (Gmail, Outlook, WhatsApp, Instagram, Messenger), clients, orders, calendar, map and AI agents.

🚧 **In development** — final project for the IT Academy program (Barcelona Activa)

🔗 [Live app](https://sincra-saas.vercel.app) · Backend: `https://sincra-backend.onrender.com`

> **Note**: the backend is hosted on Render's free tier, which spins down after 15 minutes of inactivity. The first request after some idle time may take 30-60 seconds to respond.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?logoColor=white)
<br>
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)

</div>

## Current status

This project is under active development.

The full technical task breakdown lives on the [Trello board](https://trello.com/invite/b/6a9fce6e9b31dcfbe1203341/ATTI86c98b1ea44d7b06c5aa8f52f89a99f015D4E7AD/proyecto-final-sass).

## What it solves

Sincra centralizes a small business's communications (email, WhatsApp, Instagram, Messenger) into a single inbox, lets you turn any conversation into an order with one click, and adds AI agents that classify, suggest replies and extract order data automatically — all with mandatory human confirmation before applying any suggestion.

### Planned features

- **Unified inbox**: every conversation (real email via Gmail/Outlook, WhatsApp/Instagram/Messenger simulated in this MVP) in one place, with filters, labels and reply templates
- **Clients and map**: client profile with full history, geolocation and duplicate detection across channels
- **Orders**: direct conversion from a conversation into an order, with status tracking
- **Calendar**: follow-ups and deliveries, with optional Google Calendar sync
- **Statistics**: performance by channel, response times, AI activity
- **AI agents**: conversation classifier, suggested reply, order extractor and client summary
- **Team**: admin and employee roles, with email invitations

## Tech stack

| Category           | Technology                                                                              |
| ------------------ | --------------------------------------------------------------------------------------- |
| Frontend framework | [React 19](https://react.dev/)                                                          |
| Language           | [TypeScript](https://www.typescriptlang.org/)                                           |
| Bundler            | [Vite](https://vitejs.dev/)                                                             |
| Styling            | [Tailwind CSS v4](https://tailwindcss.com/)                                             |
| Routing            | [React Router](https://reactrouter.com/)                                                |
| Remote state       | [TanStack Query](https://tanstack.com/query)                                            |
| Global state       | [Zustand](https://github.com/pmndrs/zustand)                                            |
| Backend framework  | [Express](https://expressjs.com/)                                                       |
| ORM                | [Prisma](https://www.prisma.io/)                                                        |
| Database           | [PostgreSQL](https://www.postgresql.org/) (hosted on [Supabase](https://supabase.com/)) |
| Authentication     | Custom backend — JWT in httpOnly cookie + bcrypt                                        |
| Real email         | Gmail API and Microsoft Graph (OAuth)                                                   |
| AI                 | [Anthropic API](https://docs.claude.com/)                                               |
| Testing            | [Vitest](https://vitest.dev/) + Testing Library + Supertest                             |
| Version control    | Git + GitHub (GitFlow)                                                                  |

## Getting started

> ⚠️ The project doesn't have every piece in place yet — these instructions will keep being filled in as there's something to install and run.

### Prerequisites

- Node.js >= 20
- npm >= 9
- A PostgreSQL database (recommended: [Supabase](https://supabase.com/), free tier)
- OAuth credentials from Google Cloud Console and Azure App Registration (for Gmail/Outlook)
- An [Anthropic](https://console.anthropic.com/) API key

## Environment variables

See `.env.example` in both `backend/` and `frontend/` for the full list. Here's where to get each credential:

- **`DATABASE_URL` / `DIRECT_URL`** — Supabase dashboard → your project → "Connect" button → ORM tab → Prisma. Copy both the pooled (port 6543) and direct (port 5432) connection strings.
- **`JWT_SECRET`** — any long random string, e.g. generated with `openssl rand -base64 32`.
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** — [Google Cloud Console](https://console.cloud.google.com/) → create a project → APIs & Services → Credentials → OAuth 2.0 Client ID.
- **`MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET`** — [Azure Portal](https://portal.azure.com/) → App registrations → New registration.
- **`ANTHROPIC_API_KEY`** — [Anthropic Console](https://console.anthropic.com/) → API Keys.

### 1. Clone the repository

```bash
git clone https://github.com/gemmaadev/sincra-saas.git
cd sincra-saas
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example` for the full list of variables — includes `DATABASE_URL` and `DIRECT_URL`, both required for Supabase with Prisma).

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` (see `.env.example`).

```bash
npm run dev
```

The app will be available at the URL shown in your terminal (typically `http://localhost:5173`).

## Project structure

```
sincra-saas/
├── backend/
│   └── src/
│       ├── app.ts
│       ├── config/
│       ├── middleware/
│       ├── shared/
│       └── features/
│           ├── auth/
│           ├── user/
│           ├── client/
│           ├── communication/
│           ├── order/
│           ├── calendar/
│           ├── ai/
│           ├── team/
│           └── settings/
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout/
        │   ├── router/
        │   └── providers/
        ├── pages/
        ├── shared/
        │   ├── components/
        │   ├── hooks/
        │   ├── services/
        │   └── utils/
        └── features/
            ├── auth/
            ├── inbox/
            ├── clients/
            ├── orders/
            ├── calendar/
            ├── map/
            ├── stats/
            ├── automations/
            ├── team/
            └── settings/
```

## Architecture decisions

- **Feature-based architecture** on both frontend and backend — each domain (auth, clients, communications, orders...) owns its own components/hooks/types (frontend) or controllers/models (backend)
- **Custom auth instead of an external provider** (Firebase, Auth0...) — JWT signed by the backend itself, stored in an httpOnly cookie, with bcrypt for password hashing. Chosen to keep full control over roles (admin/employee) and team invitations without depending on a third party's setup
- **ChannelAdapter pattern** — Gmail and Outlook connect for real via OAuth; WhatsApp, Instagram and Messenger are simulated in this MVP behind the same common interface (`fetchMessages`/`sendMessage`), so swapping them for the official Meta APIs later won't require touching the rest of the architecture
- **Mandatory human confirmation for every AI suggestion** — no agent (classifier, suggested reply, order extractor) applies changes on its own; everything goes through an explicit user action
- **Communications linked to clients by exact match**, and **cross-channel duplicate detection by name match** surfaced as a separate suggestion that also requires confirmation — prevents merging distinct clients by mistake

_(This section will keep growing with real decisions made along the way — for example, why Google Calendar sync was dropped from the MVP, or which AI agents were prioritized.)_

## Author

**Gemma Maeso** · [@gemmaadev](https://github.com/gemmaadev)

Project built as part of the **IT Academy** program by Barcelona Activa
