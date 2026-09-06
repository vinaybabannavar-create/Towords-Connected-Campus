# 🎓 Towards Connected Campus (BEC Smart Campus Portal)

A unified, multi-role digital campus platform developed for **Smart Connected Campus**. This application connects **Students**, **Class Teachers**, **Heads of Departments (HODs)**, **Gate Security**, and **Placement Officers (PO)** in one ecosystem.

---

## ✨ Key Features

### 1. 💼 Placement Drives Command Center & Ledger
- **Corporate Roster**: Real-time broadcast of verified placement drives with company details, CTC packages, eligibility branches, and official JD PDFs.
- **One-Click Candidate Registration**: Student auto-fill registration with roll numbers, USN, contact info, and portfolio/resume upload.
- **PO Candidate Management**: Live registered applicants table with in-app resume viewer and native **Microsoft Excel (.xlsx) Export**.
- **Accurate Live Metrics**: Real-time counter of active drives and real candidate registrations with cascade deletion.

### 2. 📄 AI-Powered JD Matcher & Resume Skill Parser
- **Intelligent PDF Parsing**: Automated client-side extraction using Mozilla's PDF.js without exposing raw bytecode.
- **250+ Skill Keyword Detection**: Identifies programming languages, frameworks, cloud tools, databases, AI/ML concepts, and soft skills.
- **AI Placement Mentor**: Generates actionable 7-day preparation roadmaps, strong skills, missing gaps, and talking points against pasted JDs.

### 3. 🎫 Multi-Tier Digital Gate Pass System
- **Student Initiation**: Request digital exit passes with reason, destination, and departure/return timings.
- **Dual Verification**: Approval workflow from Class Teacher & Department HOD.
- **Live QR Verification**: Gate security terminal scanner with real-time pass validation.

### 4. 📅 Academic & Event Calendar
- Semester timeline, internal assessment schedules, lab exams, college fests, and placement drive milestones.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React
- **Document & Spreadsheet Engines**: SheetJS (xlsx), PDF.js (pdfjs-dist)
- **QR Code Engine**: QRCode.js
- **Cloud & Database**: TiDB Cloud Serverless / REST LocalStorage Sync

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
`ash
# Clone the repository
git clone https://github.com/vinaybabannavar-create/Towords-Connected-Campus.git

# Navigate to project directory
cd Towords-Connected-Campus

# Install dependencies
npm install

# Start local development server
npm run dev
`

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📦 Production Build
`ash
npm run build
`

---

## 📄 License
This project is licensed under the MIT License.
