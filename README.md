<div align="center">

# 🎓 Towards Connected Campus

**An AI-augmented, multi-role institutional management platform for Basaveshwar Engineering College (Autonomous), Bagalkot.**

One login screen. Five roles. One campus.

Student · Class Teacher · HOD · Gate Security · Placement Officer

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![TiDB Cloud](https://img.shields.io/badge/Database-TiDB%20Cloud-EA0C3E)](https://tidbcloud.com)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-informational)](#-license)

*Published research: "Towards a Connected Campus: Design and Evaluation of an AI-Augmented Institutional Management Platform" — IJSRED, Vol. 9, Issue 3 (2026)*

</div>

---

## Why this exists

Most campuses run on the same disconnected paper trail: gate passes signed by hand across two offices, placement drives announced over WhatsApp, resumes screened one by one, and no shared record of what a student has actually built or achieved. **Towards Connected Campus** replaces that trail with one platform — five role-specific views over one shared source of truth, with AI doing the screening work a human would otherwise do manually.

## ✨ What's inside

| Module | What it replaces | Who uses it |
|---|---|---|
| 🎫 **Digital Gate Pass** | Paper slips, two physical signatures, a guard squinting at handwriting | Student → Teacher → HOD approval chain, verified by QR at the gate |
| 🧠 **AI JD Matcher** | A recruiter manually reading 600 resumes | Placement Officer — pastes a JD, gets a ranked shortlist with a Gemini-generated evaluation per candidate |
| 🏗️ **Project Tracker & Repo Analyzer** | "Trust me, I know React" on a resume | Scans a student's GitHub repo, verifies claimed skills against actual code |
| 📋 **Activity Log** | A CV nobody checks until the interview | Students log hackathons, certifications, NSS/NCC, sports, workshops — verified by faculty, visible to placements |
| 💼 **Placement Ledger** | A spreadsheet someone forgets to update | Live drive roster, one-click registration, Excel export for the PO |
| 📅 **Academic Calendar** | A PDF nobody opens twice | Semester timeline, IA schedules, lab exams, fests, drive deadlines |
| 💬 **Campus Chat** | Fragmented WhatsApp groups | Real-time messaging via Socket.IO, typing indicators, presence |

## 🖥️ Built like an app, not a website

Every screen shares one design system and one motion language across roles and breakpoints — a sliding active-tab indicator, staged loading states instead of blank spinners, bottom-sheet modals on mobile, drag-to-dismiss gestures, and page transitions instead of hard cuts. Mobile gets a bottom tab bar with safe-area handling; desktop gets a persistent rail. Same shell, same feel, five different jobs.

## 🔐 Security, taken seriously

This isn't a demo — it handles real student PII (attendance, gate movement, contact details, verified academic records) for real deployment. That comes with real requirements, all implemented:

- **Hashed passwords** (bcrypt), never stored or returned in plaintext
- **JWT-based sessions** — every protected route verifies a signed token server-side; the client's claimed role is never trusted on its own
- **Role-scoped authorization** on every route (`requireAuth` / `requireRole`) — a student can't approve their own gate pass by editing a request, and can't grant themselves HOD access by editing their own profile
- **Rate-limited login** to blunt brute-force attempts
- Parameterized SQL throughout — no string-built queries, no injection surface

## 🛠️ Tech stack

**Frontend** — React 19 · Vite 7 · Tailwind CSS 3 · Framer Motion · `@use-gesture/react` · Lucide React

**Backend** — Node.js · Express 5 · Socket.IO · JWT · bcryptjs · `express-rate-limit`

**Data & AI** — TiDB Cloud (Serverless MySQL-compatible) · Google Gemini · PDF.js (client-side resume parsing) · SheetJS (Excel export) · `qrcode`

## 🚀 Getting started

### Prerequisites
- Node.js v18+
- A TiDB Cloud cluster (or any MySQL-compatible database)
- A Google Gemini API key

### 1. Clone and install
```bash
git clone https://github.com/vinaybabannavar-create/Towords-Connected-Campus.git
cd Towords-Connected-Campus
npm install
```

### 2. Configure environment
Create a `.env.local` in the project root — **never commit this file**:
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=a_long_random_string
TIDB_HOST=your_tidb_host
TIDB_PORT=4000
TIDB_USER=your_tidb_user
TIDB_PASSWORD=your_tidb_password
TIDB_DATABASE=bec_portal
ALLOWED_ORIGIN=http://localhost:5173
```

### 3. Migrate existing passwords (first run only)
If you're seeding from existing plaintext records:
```bash
npm run migrate:passwords
```

### 4. Run it — two processes, one terminal each
```bash
npm run server   # Express API on :5000
npm run dev      # Vite dev server on :5173
```
Open **http://localhost:5173**.

### 5. Production build
```bash
npm run build
```
> **Note:** The Express server currently runs as a standalone Node process. Deploying to a serverless platform (e.g. Vercel) requires converting `server/routes/*.js` into `api/*.js` serverless functions first.

## 👥 Role reference

| Role | Access |
|---|---|
| **Student** | Own dashboard, gate pass requests, activity log, project tracker, calendar, chat |
| **Teacher** | Gate pass approvals (tier 1), activity verification, class-level views |
| **HOD** | Gate pass approvals (tier 2), department-level oversight |
| **Guard** | Dedicated QR scanner terminal for gate verification only |
| **Placement Officer** | JD Matcher, placement ledger, drive management, verified activity lookup |

## 🗺️ Roadmap

- [ ] Serverless migration for production deployment
- [ ] File-upload support for activity/certificate proof (currently link-based)
- [ ] Push notifications for gate pass status and drive deadlines
- [ ] Faculty analytics view (attendance + activity trends per department)

## 📄 License

MIT — see `LICENSE`.

---


