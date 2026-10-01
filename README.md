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

This project is under active development. The sections below ("What it solves", "Planned features") describe the full product — this delivery ships an MVP slice of it, not the whole thing. The full technical task breakdown, including what's explicitly out of scope for this delivery, lives on the [Trello board](https://trello.com/invite/b/6a9fce6e9b31dcfbe1203341/ATTI86c98b1ea44d7b06c5aa8f52f89a99f015D4E7AD/proyecto-final-sass).

**Built and tested so far:**

- **Public site**: landing page (hero, features, channels, demo, pricing, CTA) and the 404 page, under a shared public layout with navbar/footer.
- **App shell**: the three page layouts (public site, split-screen auth, protected app with sidebar + header) and the shared design-system component library (button, input, select, card, table, tabs, badge, avatar, toggle, empty-state, etc.) it's all built on.
- **Auth**: registration + login (email/password and Google/Microsoft OAuth), multi-business account selection, password recovery, protected routes and role-based access (admin/employee). Hardened for production: rate limiting on sensitive endpoints, `helmet`, bcrypt cost factor 12, short-lived single-use password-reset tokens, `secure`/`SameSite=None` cookies for the cross-origin Vercel/Render setup.
- **Onboarding**: business registration wizard (business details → channel preferences → done).
- **Team**: admin invites a teammate by email (Resend), invitee sets their password and joins with the employee role.
- **Profile**: view/edit personal info, change password, upload a real avatar (Cloudinary).

**Not started yet**: clients, orders, calendar, map, statistics, settings, and the AI agents — the pages exist as routed placeholders behind the sidebar, with no real UI or backend behind them yet. See "Planned features" below for what they'll do once built.

## What it solves

The goal isn't to build an inbox. It's to help a small business manage its **clients and orders**, wherever they actually come from — email (Gmail/Outlook, connected for real) and, in this MVP, WhatsApp/Instagram as simulated client-source data rather than live channels. A client directory with a geographic map, orders tracked from creation to delivery, calendar follow-ups and a stats dashboard cover the manual side of that.

The distinctive piece is a pair of AI agents that do this automatically for anything that arrives by email:

- **Sincra** reads a business's unread Gmail/Outlook messages and works out who's writing — a new client or an existing one, where they came from — and whether there's an order in there.
- **Sincro** takes what Sincra found and persists/relates it in the database (matching an existing client or creating a new one).

The two agents run daily and talk to each other, refining how they classify clients and orders over time. Nothing they decide is ever applied automatically — every suggestion needs explicit human confirmation before it's treated as final.

The wider product this MVP is a slice of goes further — see "Planned features" below.

### Planned features

- **Unified inbox** *(post-MVP)*: every conversation (real email via Gmail/Outlook, WhatsApp/Instagram/Messenger simulated) in one place, with filters, labels and reply templates
- **Clients and map**: client profile with full history, geolocation and duplicate detection across channels
- **Orders**: creation and status tracking through delivery; direct conversion from a conversation into an order *(that specific action is post-MVP, tied to the unified inbox)*
- **Calendar**: follow-ups and deliveries, with optional Google Calendar sync
- **Statistics**: performance by channel, response times, AI activity
- **AI agents**: **Sincra** (reads Gmail/Outlook, identifies the client/order) and **Sincro** (writes it to Supabase) in this MVP, run daily and orchestrated by Hermes; the original design also planned a conversation classifier, suggested-reply and client-summary agent *(post-MVP, tied to the unified inbox)*
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
- OAuth credentials from Google Cloud Console and Azure App Registration (for login and, later, Gmail/Outlook)
- A [Resend](https://resend.com/) API key (password-reset and team-invitation emails)
- A [Cloudinary](https://cloudinary.com/) account (profile avatar uploads)
- An [Anthropic](https://console.anthropic.com/) API key (for the AI agents, once built)

## Environment variables

See `.env.example` in both `backend/` and `frontend/` for the full list. Here's where to get each credential:

- **`DATABASE_URL` / `DIRECT_URL`** — Supabase dashboard → your project → "Connect" button → ORM tab → Prisma. Copy both the pooled (port 6543) and direct (port 5432) connection strings.
- **`JWT_SECRET`** — any long random string, e.g. generated with `openssl rand -base64 32`.
- **`FRONTEND_URL`** — the deployed frontend origin (e.g. `https://sincra-saas.vercel.app`); used for CORS, cookie settings, and building links in emails (password reset, team invites).
- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** (backend) / **`VITE_GOOGLE_CLIENT_ID`** (frontend) — [Google Cloud Console](https://console.cloud.google.com/) → create a project → APIs & Services → Credentials → OAuth 2.0 Client ID. Same client ID is used on both sides.
- **`MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` / `MICROSOFT_REDIRECT_URI`** — [Azure Portal](https://portal.azure.com/) → App registrations → New registration → platform type **Web** (not SPA) → add `MICROSOFT_REDIRECT_URI` (e.g. `https://sincra-backend.onrender.com/auth/microsoft/callback`) as a redirect URI there, exactly matching.
- **`ANTHROPIC_API_KEY`** — [Anthropic Console](https://console.anthropic.com/) → API Keys.
- **`RESEND_API_KEY`** — [Resend dashboard](https://resend.com/) → API Keys. Used to send password-reset and team-invitation emails.
- **`CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`** — [Cloudinary dashboard](https://cloudinary.com/) → Settings → Access Keys. Used for profile avatar uploads.

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

**Demo data (optional)**: set `SEED_BUSINESS_EMAIL` in `.env` to an account you've already registered, then run:

```bash
npx prisma db seed
```

This fills that account's business with ~25 example clients (fake, spread across Catalonia and a few other Spanish cities, including a few intentional near-duplicates to demo the upcoming "possible duplicate client" detection). Safe to re-run — it replaces that business's clients each time instead of piling up duplicates.

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
│           ├── settings/
│           └── stats/
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
            ├── onboarding/
            ├── profile/
            ├── landing/
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

**Built and live today:**

- **Feature-based architecture** on both frontend and backend — each domain owns its own components/hooks/types (frontend) or controllers/services/routes (backend)
- **Custom auth instead of an external provider** (Firebase, Auth0...) — JWT signed by the backend itself, stored in an httpOnly cookie, with bcrypt (cost factor 12) for password hashing. Chosen to keep full control over roles (admin/employee) and team invitations without depending on a third party's setup. Session cookies are `secure`/`SameSite=None`, since frontend (Vercel) and backend (Render) are different origins in production
- **Team invitations reuse a single-use, signed JWT** stored on the invited `User` row instead of a dedicated invite table — expiry comes from the token's own signature, and accepting it nulls the stored code so a copy of an already-used link can't be replayed

**Decided, not built yet** (applies once the corresponding epic is picked up):

- **ChannelAdapter pattern** *(post-MVP — unified inbox)* — Gmail and Outlook will connect for real via OAuth; WhatsApp, Instagram and Messenger will be simulated behind the same common interface (`fetchMessages`/`sendMessage`), so swapping them for the official Meta APIs later won't require touching the rest of the architecture. Communications linking to a client by exact channel-identifier match is part of this same epic
- **AI agents, redefined** *(this delivery's MVP scope)*: originally scoped as a 5-agent design (classifier, suggested reply, order extractor, client summary, plus the DB writer); this delivery keeps only two, named **Sincra** and **Sincro**. **Sincra** reads unread Gmail/Outlook messages and works out who the client is (new/existing) and where they came from, plus any order data; **Sincro** persists/relates that in Supabase. They run daily and talk to each other, refining their own classification decisions over time — orchestrated by **Hermes**, with its own skills/SOPs defined per agent. The other three original agents depended on the unified inbox and were cut along with it. **Mandatory human confirmation for every AI suggestion** still holds — nothing is applied automatically, everything is marked "Sugerido por IA" and needs an explicit user action
- **Cross-channel duplicate client detection by name match** *(this delivery's MVP scope)* — surfaced as a confirmable suggestion, never an automatic merge, with an explicit way to undo an incorrect one

_(This section will keep growing with real decisions made along the way — for example, why Google Calendar sync was dropped from the MVP, or which AI agents were prioritized.)_

## Author

**Gemma Maeso** · [@gemmaadev](https://github.com/gemmaadev)

Project built as part of the **IT Academy** program by Barcelona Activa
