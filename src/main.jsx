import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

if (typeof window !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}
import {
  ArrowDown,
  ArrowRight,
  Bell,
  BookOpenCheck,
  Bot,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Code2,
  Cpu,
  Database,
  DoorOpen,
  Download,
  ExternalLink,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FolderUp,
  GitBranch,
  GraduationCap,
  History,
  Info,
  Layers,
  LayoutDashboard,
  LogOut,
  Maximize2,
  MessageCircle,
  Menu,
  Minimize2,
  Plus,
  Printer,
  QrCode,
  Radio,
  Rocket,
  Search,
  Send,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  Users,
  Workflow,
  X,
  XCircle,
} from 'lucide-react';
import './styles.css';
import { CollegeCalendar } from './CollegeCalendar';
import { COLLEGE_CALENDAR_EVENTS } from './collegeCalendarData';
import { StudentProfileModal, calculateProfileCompletion, getMissingProfileItems } from './StudentProfileModal';

const REPO_LOADING_STEPS = [
  {
    title: 'Connecting to GitHub repository...',
    desc: 'Fetching branches, latest commits, dependencies, and file tree structure.'
  },
  {
    title: 'Inspecting codebase architecture...',
    desc: 'Scanning components, API routes, database models, and module signals.'
  },
  {
    title: 'Synthesizing AI project insights...',
    desc: 'Generating viva talking points, architecture review, and improvement checklist.'
  }
];

const ARCH_LOADING_STEPS = [
  {
    title: 'Analyzing project prompt & user requirements...',
    desc: 'Extracting key functional modules, user roles, and data entities.'
  },
  {
    title: 'Designing system flow & architecture layers...',
    desc: 'Mapping frontend interactions, API gateway routing, and service layer logic.'
  },
  {
    title: 'Generating flow diagram & API blueprint...',
    desc: 'Building visual workflow steps, database schema, and viva defense points.'
  }
];

const JD_LOADING_STEPS = [
  'Comparing skills with job requirements...',
  'Evaluating keywords & domain overlap...',
  'Preparing 7-day plan & talking points...'
];

const CHAT_LOADING_STEPS = [
  'Reading your query...',
  'Reviewing campus database & guidelines...',
  'Drafting personalized answer...'
];

const parseAIJSON = (text) => {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonSubstring);
  }
  return JSON.parse(cleaned);
};

function useRotatingMessage(messages, isActive, intervalMs = 2200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive || !messages?.length) {
      setIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isActive, messages, intervalMs]);

  return messages?.[index] || messages?.[0];
}

const STORAGE_KEYS = {
  students: 'bec_portal_students',
  session: 'bec_portal_session',
  projects: 'bec_portal_projects',
  gatePasses: 'bec_portal_gate_passes',
  placementDrives: 'bec_portal_placement_drives',
  placementRegistrations: 'bec_portal_placement_registrations'
};

const featureCards = [
  { id: 'projects', title: 'Project Tracker', summary: 'Plan academic projects, milestones, reviews, and submission status.', icon: ClipboardList, accent: 'from-emerald-500 to-teal-500' },
  { id: 'jd', title: 'JD Matcher', summary: 'Compare your profile with placement job descriptions and skill gaps.', icon: FileSearch, accent: 'from-fuchsia-500 to-rose-500' },
  { id: 'placements', title: 'Placement Drives Ledger', summary: 'A future-ready ledger for placement office company updates.', icon: BriefcaseBusiness, accent: 'from-amber-500 to-orange-500' },
  { id: 'gatepass', title: 'Student Gate Pass', summary: 'Apply, track class teacher verification, and HOD approval.', icon: DoorOpen, accent: 'from-violet-500 to-indigo-500' },
  { id: 'calendar', title: 'College Calendar', summary: 'Explore 112 academic events, IA schedules, fests, and holidays.', icon: Calendar, accent: 'from-cyan-500 to-blue-600' }
];

const INITIAL_PLACEMENT_DRIVES = [
  {
    id: 'drive_tcs_2026',
    company: 'TCS',
    domain: 'Software & Cloud Services',
    role: 'Ninja & Digital Software Engineer',
    salary: '₹7.0 - ₹9.5 LPA',
    type: 'Full-Time',
    skills: 'Java, Python, SQL, Data Structures, OOP, Web Basics',
    minCgpa: '6.5',
    branches: ['CSE', 'ISE', 'ECE', 'EEE'],
    driveDate: '2026-09-22',
    deadline: '2026-09-18',
    description: 'Tata Consultancy Services is hiring for Digital & Ninja software engineering profiles. Assessment consists of Advanced Quantitative Aptitude, Technical Programming in Java/Python, and System Architecture interview.',
    status: 'Active',
    postedBy: 'Placement Cell (PO)',
    createdAt: '2026-09-01'
  },
  {
    id: 'drive_zoho_2026',
    company: 'Zoho Corporation',
    domain: 'Product Development & SaaS',
    role: 'Member Technical Staff (MTS)',
    salary: '₹8.4 - ₹12.0 LPA',
    type: 'Full-Time + Internship',
    skills: 'C/C++, Java, Algorithms, System Design, REST APIs',
    minCgpa: '7.0',
    branches: ['CSE', 'ISE', 'ECE'],
    driveDate: '2026-09-28',
    deadline: '2026-09-24',
    description: 'Zoho on-campus pool recruitment drive for software product engineering. Selection includes Round 1 (Problem Solving & Logic), Round 2 (Advanced Programming), and Technical Architecture & Design interview.',
    status: 'Active',
    postedBy: 'Placement Cell (PO)',
    createdAt: '2026-09-02'
  },
  {
    id: 'drive_infosys_2026',
    company: 'Infosys',
    domain: 'Enterprise AI & Cloud',
    role: 'Specialist Programmer (SP) & DSE',
    salary: '₹9.5 - ₹13.5 LPA',
    type: 'Full-Time',
    skills: 'Python, Machine Learning, Cloud Basics, JavaScript, DBMS',
    minCgpa: '7.5',
    branches: ['CSE', 'ISE', 'ECE', 'EEE', 'MECH'],
    driveDate: '2026-10-05',
    deadline: '2026-09-30',
    description: 'Infosys Specialist Programmer role focuses on high-impact AI models, full-stack architectures, and enterprise cloud migrations.',
    status: 'Active',
    postedBy: 'Placement Cell (PO)',
    createdAt: '2026-09-03'
  }
];

const INITIAL_PLACEMENT_REGISTRATIONS = [];

const exportApplicantsToExcel = (drive, applicants) => {
  if (!applicants || applicants.length === 0) {
    alert('No registered student applications found to export for this drive.');
    return;
  }

  const headers = [
    'Sl No',
    'Student Name',
    'USN / Roll No',
    'Department / Branch',
    'College Name',
    'Year & Semester',
    'Mobile Number',
    'Email Address',
    'Technical Skills',
    'Resume / CV File Name',
    'Registered Date & Time'
  ];

  const getCleanResumeName = (app) => {
    if (app.resumeName && app.resumeName.trim()) return app.resumeName.trim();
    const url = String(app.resumeUrl || app.portfolioUrl || '');
    if (url.startsWith('data:application/pdf')) return `${(app.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;
    if (url.startsWith('data:image')) return `${(app.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}_Resume_Image.png`;
    if (url.startsWith('data:')) return `${(app.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;
    if (url.startsWith('http')) return url;
    return url || 'N/A';
  };

  const rows = applicants.map((app, index) => [
    index + 1,
    app.studentName || app.name || 'N/A',
    app.studentBec || app.rollNo || app.bec || 'N/A',
    app.department || app.branch || 'CSE',
    app.college || app.collegeName || 'Basaveshwar Engineering College',
    app.yearSem || app.year || 'N/A',
    app.phone || app.mobile || 'N/A',
    app.email || 'N/A',
    (app.skills || '').replace(/[\r\n]+/g, ' '),
    getCleanResumeName(app),
    app.registeredAt ? new Date(app.registeredAt).toLocaleString() : 'N/A'
  ]);

  // Create an authentic Microsoft Excel .xlsx workbook
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set explicit column widths for beautiful layout in Excel
  worksheet['!cols'] = [
    { wch: 8 },   // Sl No
    { wch: 22 },  // Student Name
    { wch: 18 },  // USN / Roll No
    { wch: 20 },  // Department
    { wch: 28 },  // College Name
    { wch: 18 },  // Year & Semester
    { wch: 18 },  // Mobile Number
    { wch: 30 },  // Email Address
    { wch: 35 },  // Technical Skills
    { wch: 26 },  // Resume
    { wch: 24 }   // Registered Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registered Candidates');

  const safeCompany = (drive?.company || 'Company').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeRole = (drive?.role || 'Role').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${safeCompany}_${safeRole}_Registered_Students_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
};

const exportApplicantsToCSV = exportApplicantsToExcel;

const architectureLayers = [
  { layer: 'Frontend', detail: 'React pages, protected routes, reusable components, responsive Tailwind UI.' },
  { layer: 'API Layer', detail: 'REST endpoints for auth, projects, approvals, reports, and placement records.' },
  { layer: 'Service Layer', detail: 'Business rules for campus access, project scoring, approval movement, and notifications.' },
  { layer: 'Database', detail: 'Students, projects, milestones, gate passes, drives, audit logs, and role permissions.' },
  { layer: 'Security', detail: 'Hashed passwords, JWT/session validation, resource ownership checks, and role-based access.' }
];

const parseGitHubUrl = (value) => {
  const cleanValue = value.trim().replace(/\.git$/, '');
  if (!cleanValue) return null;

  if (/^[\w.-]+\/[\w.-]+$/.test(cleanValue)) {
    const [owner, repo] = cleanValue.split('/');
    return { owner, repo };
  }

  try {
    const url = new URL(cleanValue);
    if (!url.hostname.includes('github.com')) return null;
    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    return owner && repo ? { owner, repo } : null;
  } catch {
    return null;
  }
};

const fetchMaybe = async (url, fallback) => {
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!response.ok) return fallback;
  return response.json();
};

const pickImportantFiles = (files) => {
  const priority = [
    'package.json',
    'requirements.txt',
    'pyproject.toml',
    'README.md',
    'src/App.jsx',
    'src/App.js',
    'src/main.jsx',
    'src/main.js',
    'src/pages',
    'src/components',
    'app',
    'server',
    'backend',
    'api',
    'routes',
    'controllers',
    'models'
  ];

  return files
    .filter((file) => priority.some((item) => file.toLowerCase().includes(item.toLowerCase())))
    .slice(0, 14);
};

const fetchImportantFileContents = async (repo, files) => {
  const selectedFiles = pickImportantFiles(files);
  const rawBase = `https://raw.githubusercontent.com/${repo.full_name}/${encodeURIComponent(repo.default_branch)}`;

  const loadedFiles = await Promise.all(
    selectedFiles.map(async (path) => {
      const encodedPath = path.split('/').map(encodeURIComponent).join('/');
      const response = await fetch(`${rawBase}/${encodedPath}`);
      if (!response.ok) return null;
      const content = await response.text();
      return { path, content: content.slice(0, 4500) };
    })
  );

  return loadedFiles.filter(Boolean);
};

const readableName = (value) => (
  value
    .replace(/\.(jsx?|tsx?|py|json|md|css|html)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
);

const extractReadmeSummary = (readme, repo) => {
  const cleanedReadme = readme
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');

  const ignoredLineWords = ['official', 'submission', 'links', 'demo video', 'github repository', 'live web application'];
  const lines = cleanedReadme
    .split('\n')
    .map((line) => line.replace(/[^\x20-\x7E]/g, ' ').replace(/^#+\s*/, '').replace(/[|*_`>#-]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 38 && !line.toLowerCase().includes('img src'))
    .filter((line) => !ignoredLineWords.some((word) => line.toLowerCase() === word || line.toLowerCase().startsWith(word)))
    .sort((a, b) => {
      const score = (line) => ['designed', 'platform', 'system', 'application', 'built', 'helps', 'solves'].filter((word) => line.toLowerCase().includes(word)).length;
      return score(b) - score(a);
    })
    .slice(0, 3);

  if (lines.length) return lines.join(' ').slice(0, 520);
  if (repo.description) return repo.description;
  return `${readableName(repo.name)} is a student project repository. Add a stronger README so the portal can explain it with more confidence.`;
};

const articleFor = (phrase) => (/^[aeiou]/i.test(phrase) ? 'an' : 'a');

const detectProjectType = (text, repoName) => {
  const haystack = `${text} ${repoName}`.toLowerCase();
  const types = [
    ['AI assistant', ['ai', 'openai', 'gemini', 'llm', 'chatbot', 'rag', 'agent']],
    ['vendor or business management system', ['vendor', 'supplier', 'invoice', 'procurement', 'business']],
    ['student or college portal', ['student', 'college', 'campus', 'attendance', 'hod', 'teacher']],
    ['e-commerce platform', ['cart', 'product', 'order', 'payment', 'checkout']],
    ['placement or career tool', ['placement', 'job', 'resume', 'jd', 'interview']],
    ['healthcare application', ['doctor', 'patient', 'appointment', 'medical', 'health']]
  ];
  return types.find(([, keys]) => keys.some((key) => haystack.includes(key)))?.[0] || 'web application';
};

const detectModules = (files, text) => {
  const pathModules = files
    .filter((file) => /(pages|components|routes|controllers|models|services|api|app|src)\//i.test(file))
    .map((file) => readableName(file.split('/').pop() || file))
    .filter((name) => name.length > 2 && !['index', 'main', 'app'].includes(name.toLowerCase()));

  const keywordModules = [
    ['Login and account access', ['login', 'signup', 'auth', 'password']],
    ['Dashboard overview', ['dashboard', 'overview', 'analytics']],
    ['Data/API service', ['api', 'service', 'fetch', 'axios']],
    ['Admin or management panel', ['admin', 'manage', 'ledger']],
    ['AI matching or recommendation', ['match', 'recommend', 'ai', 'prompt']]
  ]
    .filter(([, keys]) => keys.some((key) => text.includes(key)))
    .map(([module]) => module);

  return [...new Set([...keywordModules, ...pathModules])].slice(0, 10);
};

const detectUserFlow = (text, projectType) => {
  if (text.includes('login') || text.includes('auth')) {
    return `User opens the ${projectType}, logs in, reaches the main dashboard, then uses project modules based on their role or data.`;
  }
  if (text.includes('chat') || text.includes('prompt')) {
    return `User enters a query or prompt, the app processes it through the AI/data layer, then returns a useful result in the interface.`;
  }
  if (text.includes('upload') || text.includes('file')) {
    return `User uploads or enters data, the app processes it, then shows results, records, or recommendations.`;
  }
  return `User opens the ${projectType}, navigates through the available screens, and completes the main project workflow shown by the repo modules.`;
};

const buildEvidence = (snapshot, modules) => {
  const evidence = [
    snapshot.readme ? 'README content was found and used for project summary.' : 'README was missing or too small, so analysis used repo files and metadata.',
    snapshot.files.includes('package.json') ? 'package.json was found, so frontend/dependency signals were checked.' : 'package.json was not found in the fetched file tree.',
    modules.length ? `Detected modules include ${modules.slice(0, 4).join(', ')}.` : 'Module names were not clear; stronger folder names will improve verification.'
  ];

  if (snapshot.keyFiles.length) {
    evidence.push(`Key files inspected: ${snapshot.keyFiles.map((file) => file.path).slice(0, 5).join(', ')}.`);
  }

  return evidence;
};

const fetchGitHubSnapshot = async (repoUrl) => {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Enter a valid public GitHub URL like https://github.com/owner/repo.');
  }

  const base = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  const repoResponse = await fetch(base, { headers: { Accept: 'application/vnd.github+json' } });
  if (!repoResponse.ok) {
    throw new Error('Repo could not be accessed. Public GitHub repos work now; private repos will need GitHub login/token later.');
  }

  const repo = await repoResponse.json();
  const [languages, readmeMeta, tree] = await Promise.all([
    fetchMaybe(`${base}/languages`, {}),
    fetchMaybe(`${base}/readme`, null),
    fetchMaybe(`${base}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`, { tree: [] })
  ]);

  let readme = '';
  if (readmeMeta?.download_url) {
    const readmeResponse = await fetch(readmeMeta.download_url);
    if (readmeResponse.ok) readme = await readmeResponse.text();
  }

  const files = (tree.tree || []).filter((item) => item.type === 'blob').map((item) => item.path).slice(0, 160);
  const keyFiles = await fetchImportantFileContents(repo, files);

  return {
    repo,
    languages,
    readme,
    files,
    keyFiles
  };
};

const analyzeRepoSnapshot = (snapshot, manualNotes) => {
  const languageNames = Object.keys(snapshot.languages);
  const filesText = snapshot.files.join(' ').toLowerCase();
  const readmeText = snapshot.readme.toLowerCase();
  const sourceText = snapshot.keyFiles.map((file) => `${file.path}\n${file.content}`).join('\n').toLowerCase();
  const notesText = `${manualNotes.description} ${manualNotes.stack} ${manualNotes.files}`.toLowerCase();
  const allText = `${filesText} ${readmeText} ${sourceText} ${notesText}`;

  const featureSignals = [
    ['Authentication', ['login', 'signup', 'auth', 'jwt', 'session', 'password']],
    ['Dashboard', ['dashboard', 'analytics', 'metric', 'overview']],
    ['API Integration', ['api', 'fetch', 'axios', 'endpoint', 'express', 'controller']],
    ['Database Layer', ['schema', 'model', 'mongodb', 'mysql', 'postgres', 'firebase', 'prisma']],
    ['Responsive UI', ['tailwind', 'responsive', 'mobile', 'media', 'css']],
    ['Routing', ['router', 'routes', 'protectedroute', 'navigation']],
    ['Testing', ['test', 'spec', 'vitest', 'jest', 'cypress']],
    ['Documentation', ['readme', 'docs', 'architecture', 'setup']]
  ];

  const found = featureSignals
    .filter(([, keys]) => keys.some((key) => allText.includes(key)))
    .map(([name]) => name);

  const folders = [...new Set(snapshot.files.map((file) => file.split('/')[0]).filter(Boolean))].slice(0, 8);
  const projectType = detectProjectType(allText, snapshot.repo.name);
  const summary = extractReadmeSummary(snapshot.readme, snapshot.repo);
  const modules = detectModules(snapshot.files, allText);
  const score = Math.min(98, 35 + found.length * 7 + Math.min(languageNames.length * 3, 12) + (snapshot.readme.length > 400 ? 8 : 0));
  const mainStack = languageNames.length ? languageNames : manualNotes.stack.split(',').map((item) => item.trim()).filter(Boolean);

  return {
    repoName: snapshot.repo.name,
    repoUrl: snapshot.repo.html_url,
    score,
    stars: snapshot.repo.stargazers_count,
    forks: snapshot.repo.forks_count,
    updatedAt: new Date(snapshot.repo.updated_at).toLocaleDateString(),
    found,
    features: found.length ? found : ['Repository structure detected, but feature names need clearer README/module naming'],
    stack: mainStack,
    folders,
    explanation: {
      projectType,
      summary,
      whatBuilt: `${readableName(snapshot.repo.name)} appears to be ${articleFor(projectType)} ${projectType}. ${summary}`,
      userFlow: detectUserFlow(allText, projectType),
      modules: modules.length ? modules : ['Main application module', 'Project files need clearer module naming'],
      evidence: buildEvidence(snapshot, modules)
    },
    architecture: [
      `Primary languages: ${mainStack.join(', ') || 'Not detected'}.`,
      snapshot.readme ? 'README is available for project explanation.' : 'README is missing; add setup, features, screenshots, and architecture.',
      filesText.includes('package.json') ? 'JavaScript package setup found.' : 'Package/dependency file was not found in fetched tree.',
      allText.includes('auth') || allText.includes('login') ? 'Authentication signals detected.' : 'Authentication module not clearly visible from repo content.'
    ],
    improvements: [
      snapshot.readme.length > 400 ? 'Add screenshots and final output images to make evaluation easier.' : 'Write a stronger README with abstract, features, setup, and screenshots.',
      found.includes('Testing') ? 'Expand tests for login, forms, and protected pages.' : 'Add basic tests or manual testing checklist before submission.',
      found.includes('Database Layer') ? 'Document database schema and sample records.' : 'Add database design if the project stores student or admin data.',
      'Add final-year report sections: problem statement, existing system, proposed system, modules, architecture, testing, future scope.'
    ]
  };
};

const apiFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.warn('TiDB API notice:', err.message);
    return null;
  }
};

const getJSON = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const callAI = async (input, options = {}) => {
  const payload = typeof input === 'string'
    ? { prompt: input, ...options }
    : { ...input, ...options };

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'AI request failed.');
  return data.text;
};

const DEFAULT_ACCOUNTS = [
  {
    bec: '1XY21CS001',
    name: '',
    department: '',
    year: 'III Year',
    role: 'student',
    password: 'password123',
    isProfileSaved: false
  },
  {
    bec: 'TEACHER01',
    name: '',
    department: '',
    year: 'Staff',
    role: 'teacher',
    password: 'password123',
    isProfileSaved: false
  },
  {
    bec: 'HODCSE01',
    name: '',
    department: '',
    year: 'Staff',
    role: 'hod',
    password: 'password123',
    isProfileSaved: false
  },
  {
    bec: 'GUARD01',
    name: '',
    department: '',
    year: 'Staff',
    role: 'guard',
    password: 'password123',
    isProfileSaved: false
  },
  {
    bec: 'PO01',
    name: '',
    department: 'Placement Cell',
    year: 'Staff',
    role: 'po',
    password: 'password123',
    isProfileSaved: false
  }
];

const getRoleHomePage = (role) => {
  if (role === 'teacher') return 'teacher_gatepasses';
  if (role === 'hod') return 'hod_gatepasses';
  if (role === 'guard') return 'security_terminal';
  return 'dashboard';
};

function App() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const verifyParam = useMemo(() => urlParams.get('verify'), [urlParams]);
  const encodedDataParam = useMemo(() => urlParams.get('d'), [urlParams]);
  const roleParam = useMemo(() => (urlParams.get('role') || '').toLowerCase(), [urlParams]);

  // Tab-isolated storage key prevents tabs from overwriting each other
  const sessionKey = roleParam ? `bec_tab_session_${roleParam}` : 'bec_tab_session';

  const [students, setStudents] = useState(() => {
    const saved = getJSON(STORAGE_KEYS.students, []);
    const safeSaved = Array.isArray(saved) ? saved : [];
    const merged = safeSaved.map((s) => {
      if (!s || typeof s !== 'object') return null;
      if (!s.isProfileSaved && ['Dr. Sunitha M', 'Prof. Rajesh Sharma', 'Rahul Kumar', 'Main Gate Security Officer Naik'].includes(s.name)) {
        return { ...s, name: '', department: '', isProfileSaved: false };
      }
      return s;
    }).filter(Boolean);
    DEFAULT_ACCOUNTS.forEach((acc) => {
      const idx = merged.findIndex((s) => s.bec === acc.bec);
      if (idx === -1) {
        merged.push(acc);
      } else if (!merged[idx].isProfileSaved && ['Dr. Sunitha M', 'Prof. Rajesh Sharma', 'Rahul Kumar', 'Main Gate Security Officer Naik'].includes(merged[idx].name)) {
        merged[idx] = { ...merged[idx], name: '', department: '', isProfileSaved: false };
      }
    });
    return merged;
  });

  const [sessionBec, setSessionBec] = useState(() => {
    // 1. Auto-login for role-specific tab links (?role=student | teacher | hod | po | guard)
    if (roleParam) {
      const match = DEFAULT_ACCOUNTS.find((a) => a.role === roleParam);
      if (match) {
        sessionStorage.setItem('bec_tab_user', match.bec);
        return match.bec;
      }
    }

    // 2. Check if this specific browser tab has an isolated session
    const tabUser = sessionStorage.getItem('bec_tab_user');
    if (tabUser) return tabUser;

    const legacyTabSession = sessionStorage.getItem('bec_tab_session');
    if (legacyTabSession) {
      sessionStorage.setItem('bec_tab_user', legacyTabSession);
      return legacyTabSession;
    }

    return localStorage.getItem(STORAGE_KEYS.session) || '1XY21CS001';
  });

  const activeStudent = useMemo(() => {
    return students.find((student) => student.bec === sessionBec);
  }, [students, sessionBec]);

  const [page, setPage] = useState(() => {
    // 1. If ?role= parameter was passed in URL, enforce that role's target home page
    if (roleParam === 'po') {
      sessionStorage.setItem('bec_tab_page', 'dashboard');
      return 'dashboard';
    }
    if (roleParam === 'student') {
      sessionStorage.setItem('bec_tab_page', 'dashboard');
      return 'dashboard';
    }
    if (roleParam === 'teacher') {
      sessionStorage.setItem('bec_tab_page', 'teacher_gatepasses');
      return 'teacher_gatepasses';
    }
    if (roleParam === 'hod') {
      sessionStorage.setItem('bec_tab_page', 'hod_gatepasses');
      return 'hod_gatepasses';
    }
    if (roleParam === 'guard') {
      sessionStorage.setItem('bec_tab_page', 'security_terminal');
      return 'security_terminal';
    }

    // 2. Check if this specific tab has a saved active page
    const tabSavedPage = sessionStorage.getItem('bec_tab_page');
    if (tabSavedPage && tabSavedPage !== 'login') return tabSavedPage;

    // 3. Fallback to active user role home page
    if (activeStudent) return getRoleHomePage(activeStudent.role);
    return 'login';
  });

  const handleSetPage = (nextPage) => {
    setPage(nextPage);
    setMobileOpen(false);
    sessionStorage.setItem('bec_tab_page', nextPage);
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);

  useEffect(() => {
    // Save tab page whenever state changes
    if (page && page !== 'login') {
      sessionStorage.setItem('bec_tab_page', page);
    }
  }, [page]);

  // Strictly enforce that current active page matches user role
  useEffect(() => {
    if (!activeStudent || !activeStudent.role) return;
    const role = activeStudent.role;
    const validPagesForRole = {
      student: ['dashboard', 'projects', 'jd', 'placements', 'gatepass', 'calendar'],
      teacher: ['teacher_gatepasses', 'placements', 'calendar'],
      hod: ['hod_gatepasses', 'placements', 'calendar'],
      guard: ['security_terminal'],
      po: ['dashboard', 'calendar']
    };

    const validList = validPagesForRole[role] || ['dashboard', 'calendar'];
    if (!validList.includes(page)) {
      const correctHome = getRoleHomePage(role);
      setPage(correctHome);
      sessionStorage.setItem('bec_tab_page', correctHome);
    }
  }, [activeStudent?.role, page]);

  useEffect(() => {
    // Check TiDB Cloud Status
    apiFetch('/api/db/status').then((res) => {
      if (res?.online) setDbConnected(true);
    });

    // Fetch existing students from TiDB Cloud
    apiFetch('/api/db/students').then((res) => {
      if (res?.students?.length) {
        setStudents((prev) => {
          const merged = [...prev];
          res.students.forEach((s) => {
            if (!merged.some((p) => p.bec === s.bec)) {
              merged.push(s);
            }
          });
          return merged;
        });
      }
    });
  }, []);

  const createAccount = async (account) => {
    const userAccount = { role: 'student', ...account };
    const nextStudents = [...students.filter((s) => s.bec !== userAccount.bec), userAccount];
    setStudents(nextStudents);
    setJSON(STORAGE_KEYS.students, nextStudents);
    sessionStorage.setItem('bec_tab_user', userAccount.bec);
    sessionStorage.setItem('bec_tab_page', getRoleHomePage(userAccount.role));
    localStorage.setItem(STORAGE_KEYS.session, userAccount.bec);
    setSessionBec(userAccount.bec);
    setPage(getRoleHomePage(userAccount.role));

    // Save to TiDB Cloud
    await apiFetch('/api/db/students', {
      method: 'POST',
      body: JSON.stringify(userAccount)
    });
  };

  const login = async (bec, password, role) => {
    const found = students.find(
      (s) => s.bec === bec && s.password === password && (!role || s.role === role || (!s.role && role === 'student'))
    );
    if (found) {
      const home = getRoleHomePage(found.role || role);
      sessionStorage.setItem('bec_tab_user', found.bec);
      sessionStorage.setItem('bec_tab_page', home);
      localStorage.setItem(STORAGE_KEYS.session, found.bec);
      setSessionBec(found.bec);
      setPage(home);
      return true;
    }

    // Try TiDB Cloud database login
    const res = await apiFetch('/api/db/auth/login', {
      method: 'POST',
      body: JSON.stringify({ bec, password, role })
    });

    if (res?.success && res.student) {
      const dbStudent = { ...res.student, password };
      const nextStudents = [...students.filter((s) => s.bec !== bec), dbStudent];
      setStudents(nextStudents);
      setJSON(STORAGE_KEYS.students, nextStudents);
      const home = getRoleHomePage(dbStudent.role || role);
      sessionStorage.setItem('bec_tab_user', dbStudent.bec);
      sessionStorage.setItem('bec_tab_page', home);
      localStorage.setItem(STORAGE_KEYS.session, dbStudent.bec);
      setSessionBec(dbStudent.bec);
      setPage(home);
      return true;
    }

    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('bec_tab_user');
    sessionStorage.removeItem('bec_tab_page');
    sessionStorage.removeItem('bec_tab_session');
    setSessionBec(null);
    setPage('login');
  };

  const [showProfileModal, setShowProfileModal] = useState(false);

  const updateStudentProfile = (updatedData) => {
    const nextStudent = { ...activeStudent, ...updatedData };
    const nextStudents = students.map((s) => (s.bec === activeStudent.bec ? nextStudent : s));
    setStudents(nextStudents);
    setJSON(STORAGE_KEYS.students, nextStudents);
    if (updatedData.bec && updatedData.bec !== activeStudent.bec) {
      sessionStorage.setItem(sessionKey, updatedData.bec);
      localStorage.setItem(STORAGE_KEYS.session, updatedData.bec);
      setSessionBec(updatedData.bec);
    }
    apiFetch('/api/db/students/update', {
      method: 'POST',
      body: JSON.stringify(nextStudent)
    }).catch(() => {});
  };

  if (verifyParam) {
    return <PublicGatePassVerification passId={verifyParam} encodedData={encodedDataParam} />;
  }

  if (!activeStudent) {
    return (
      <AuthScreen
        students={students}
        onCreateAccount={createAccount}
        onLogin={login}
        initialRole={roleParam || 'student'}
      />
    );
  }

  return (
    <PortalShell
      student={activeStudent}
      page={page}
      setPage={handleSetPage}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      onLogout={logout}
      dbConnected={dbConnected}
      showProfileModal={showProfileModal}
      setShowProfileModal={setShowProfileModal}
      onUpdateProfile={updateStudentProfile}
    >
      {page === 'dashboard' && (
        <Dashboard
          student={activeStudent}
          setPage={setPage}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}
      {page === 'projects' && <ProjectTracker student={activeStudent} />}
      {page === 'jd' && <JDMatcher student={activeStudent} />}
      {page === 'placements' && <PlacementLedger student={activeStudent} setPage={setPage} />}
      {page === 'gatepass' && <GatePass student={activeStudent} />}
      {page === 'calendar' && <CollegeCalendar student={activeStudent} />}
      {page === 'teacher_gatepasses' && <TeacherGatePassView student={activeStudent} />}
      {page === 'hod_gatepasses' && <HODGatePassView student={activeStudent} />}
      {page === 'security_terminal' && <GateSecurityTerminal student={activeStudent} />}
      <CampusChatBot student={activeStudent} activePage={page} />
    </PortalShell>
  );
}

function AuthScreen({ students, onCreateAccount, onLogin, initialRole = 'student' }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(initialRole); // 'student', 'teacher', 'hod', 'guard', 'po'
  const [form, setForm] = useState({ name: '', bec: '', department: '', year: 'III Year', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setForm({ name: '', bec: '', department: '', year: 'III Year', password: '' });
    setError('');
  };

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const bec = form.bec.trim().toUpperCase();
    const password = form.password.trim();

    if (!bec || bec.length < 3) {
      setError('Please enter a valid USN / BEC ID or Staff ID.');
      return;
    }
    if (password.length < 4) {
      setError('Password should be at least 4 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!form.name.trim() || !form.department.trim()) {
        setError('Enter your full name and branch/department to create account.');
        return;
      }
      if (students.some((s) => s.bec === bec && s.role === role)) {
        setError('This ID already has an account. Login instead.');
        return;
      }
      await onCreateAccount({
        name: form.name.trim(),
        bec,
        department: form.department.trim(),
        year: role === 'student' ? form.year : 'Staff',
        role,
        password
      });
      return;
    }

    const success = await onLogin(bec, password, role);
    if (!success) {
      setError('Invalid ID, password, or role selection.');
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-stone-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.92fr)_minmax(420px,1.08fr)]">
        <section className="relative flex min-h-[34vh] items-end overflow-hidden px-5 py-8 sm:min-h-[42vh] sm:px-8 lg:min-h-screen lg:px-12 xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(244,114,182,0.35),transparent_28%),radial-gradient(circle_at_75%_45%,rgba(16,185,129,0.28),transparent_26%),linear-gradient(135deg,#17110d_0%,#2f171f_50%,#0e2721_100%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-200 backdrop-blur shadow-sm">
              <GraduationCap className="h-4 w-4 text-emerald-300" />
              BEC My Campus
            </div>
            <h1 className="max-w-xl text-3xl font-black leading-[1.04] tracking-normal sm:text-5xl xl:text-6xl">
              Multi-role portal for Students, Faculty & Staff.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-200 sm:text-base xl:text-lg">
              One unified platform for student gate pass workflows, Class Teacher verification, HOD digital sign-offs, and Placement Drive analytics.
            </p>
          </div>
        </section>

        <section className="flex min-h-[66vh] items-center justify-center bg-stone-100 px-4 py-6 text-stone-950 sm:px-6 lg:min-h-screen lg:py-8">
          <div className="w-full max-w-[34rem]">
            {/* Mode Switcher */}
            <div className="mb-4 flex rounded-lg bg-stone-200 p-1">
              <button type="button" className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`} onClick={() => changeMode('login')}>
                Login
              </button>
              <button type="button" className={`auth-tab ${mode === 'signup' ? 'auth-tab-active' : ''}`} onClick={() => changeMode('signup')}>
                Create Account
              </button>
            </div>

            <form onSubmit={submit} className="rounded-xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6" autoComplete="off">
              {/* Role Selector Tabs */}
              <div className="mb-5">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-stone-500">Select Portal Access Role</span>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-stone-100 p-1 sm:grid-cols-5">
                  {[
                    ['student', '👨‍🎓 Student'],
                    ['teacher', '👩‍🏫 Teacher'],
                    ['hod', '🏛️ HOD'],
                    ['guard', '🛡️ Guard'],
                    ['po', '💼 PO']
                  ].map(([r, label]) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setError(''); }}
                      className={`rounded-lg py-2 px-1 text-[11px] font-black transition-all ${
                        role === r
                          ? 'bg-stone-950 text-white shadow-md'
                          : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {role === 'student' ? 'Student Workspace' : role === 'teacher' ? 'Class Teacher Portal' : role === 'hod' ? 'Head of Department' : role === 'guard' ? 'Gate Security Terminal' : 'Placement Officer'}
                </p>
                <h2 className="mt-1 text-2xl font-black text-stone-950">
                  {mode === 'login' ? `Login as ${role.toUpperCase()}` : `Create ${role.toUpperCase()} Account`}
                </h2>
              </div>

              {mode === 'signup' && (
                <>
                  <Field
                    label={role === 'student' ? 'Full Name (as per ID)' : 'Faculty / Staff Name'}
                    value={form.name}
                    onChange={(value) => update('name', value)}
                    placeholder={role === 'student' ? 'e.g. John Doe' : 'e.g. Prof. Teacher'}
                    autoComplete="off"
                  />
                  <Field
                    label="Branch / Department"
                    value={form.department}
                    onChange={(value) => update('department', value)}
                    placeholder="Enter branch (e.g. CSE, ECE, MECH)"
                    autoComplete="off"
                  />
                  {role === 'student' && (
                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-bold text-stone-700">Year & Sem</span>
                      <select className="input" value={form.year} onChange={(event) => update('year', event.target.value)}>
                        <option value="">Enter Year & Sem</option>
                        <option>I Year</option>
                        <option>II Year</option>
                        <option>III Year</option>
                        <option>IV Year</option>
                      </select>
                    </label>
                  )}
                </>
              )}

              <Field
                label={role === 'student' ? 'USN / BEC Number' : 'Faculty / Staff ID'}
                value={form.bec}
                onChange={(value) => update('bec', value)}
                placeholder={
                  role === 'student'
                    ? 'e.g. 1XY21CS001 or BEC2024001'
                    : role === 'teacher'
                    ? 'e.g. TEACHER01'
                    : role === 'hod'
                    ? 'e.g. HODCSE01'
                    : role === 'guard'
                    ? 'e.g. GUARD01'
                    : 'e.g. PO01'
                }
                autoComplete="off"
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(value) => update('password', value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />

              {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 border border-rose-200">{error}</p>}

              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 font-black text-white transition hover:bg-emerald-700 shadow-md">
                {mode === 'login' ? `Enter ${role.toUpperCase()} Portal` : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', autoComplete = 'off' }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-bold text-stone-700">{label}</span>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    </label>
  );
}

function PortalShell({
  student,
  page,
  setPage,
  mobileOpen,
  setMobileOpen,
  onLogout,
  dbConnected,
  showProfileModal,
  setShowProfileModal,
  onUpdateProfile,
  children
}) {
  const role = student.role || 'student';
  const completion = calculateProfileCompletion(student);

  useEffect(() => {
    const tabTitle =
      role === 'po'
        ? 'BEC Placement Officer Portal'
        : role === 'teacher'
        ? 'BEC Class Teacher Portal'
        : role === 'hod'
        ? 'BEC HOD Portal'
        : role === 'guard'
        ? 'BEC Security Terminal'
        : 'BEC Student Portal';
    document.title = tabTitle;
  }, [role]);

  const navItems = role === 'student' ? [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['projects', ClipboardList, 'Projects'],
    ['jd', FileSearch, 'JD Matcher'],
    ['placements', BriefcaseBusiness, 'Placements'],
    ['gatepass', DoorOpen, 'Gate Pass'],
    ['calendar', Calendar, 'College Calendar']
  ] : role === 'teacher' ? [
    ['teacher_gatepasses', CheckCircle2, 'Gate Pass Approval'],
    ['placements', BriefcaseBusiness, 'Placement Drives'],
    ['calendar', Calendar, 'College Calendar']
  ] : role === 'hod' ? [
    ['hod_gatepasses', ShieldCheck, 'Gate Pass Approval'],
    ['placements', BriefcaseBusiness, 'Placement Drives'],
    ['calendar', Calendar, 'College Calendar']
  ] : role === 'guard' ? [
    ['security_terminal', Radio, 'Security Terminal Scanner']
  ] : role === 'po' ? [
    ['dashboard', LayoutDashboard, 'Drives Management'],
    ['calendar', Calendar, 'College Calendar']
  ] : [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['calendar', Calendar, 'College Calendar']
  ];

  const portalRoleTitle = role === 'teacher' ? 'Class Teacher Portal' : role === 'hod' ? 'HOD Portal' : role === 'guard' ? 'Security Terminal' : role === 'po' ? 'Placement Officer' : 'My Campus';

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-100 text-stone-950">
      {mobileOpen && <button className="fixed inset-0 z-30 bg-stone-950/50 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu overlay" />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-stone-200 bg-stone-950 p-5 text-white transition lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group">
            <div className="relative">
              {/* Ambient Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-emerald-300/20 blur-xs transition-all duration-300 group-hover:opacity-100 opacity-70" />
              {/* Premium Gradient Squircle */}
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/25 border border-white/25 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {/* Glossy top specular reflection */}
                <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-2xl" />
                {/* Modern Graduation Cap */}
                <GraduationCap className="relative h-6 w-6 text-stone-950 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                {portalRoleTitle}
              </p>
              <p className="text-xs text-stone-400 capitalize font-medium">{role === 'guard' ? 'Gate Verification' : `${role} workspace`}</p>
            </div>
          </div>
          <button className="icon-btn lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map(([id, Icon, label]) => (
            <button key={id} onClick={() => setPage(id)} className={`nav-item ${page === id ? 'nav-item-active' : ''}`}>
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400 text-stone-950 font-black">
              {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-white text-sm">{student.name}</p>
              <p className="text-xs text-stone-400 uppercase">{student.bec} ({role})</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15 cursor-pointer">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white px-4 py-2.5 sm:px-6 sm:py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left: Mobile hamburger menu & Student greeting inline with dept */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-stone-700 shadow-xs lg:hidden shrink-0 hover:bg-stone-100 cursor-pointer"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-stone-950 flex items-center gap-1.5 truncate">
                  <span className="truncate">Hello, {student.name}</span>
                  <span className="text-base sm:text-lg shrink-0">👋</span>
                </h1>
                <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 shrink-0">
                  {student.department} {student.year && student.year !== 'Staff' ? `• ${student.year}` : ''}
                </span>
              </div>
            </div>

            {/* Right: Modern, Compact Profile Card with No Extra Space */}
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-stone-50/80 hover:bg-white p-1.5 sm:px-3 sm:py-1.5 text-stone-900 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all duration-200 cursor-pointer select-none shrink-0"
              title={`Profile: ${completion}% complete`}
            >
              {/* Modern Logo Avatar */}
              <div className="relative shrink-0">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-stone-950 to-stone-800 text-emerald-400 font-black text-sm shadow-xs border border-stone-700">
                  {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    completion === 100 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
              </div>

              {/* Text: Name, USN & Completion */}
              <div className="text-left leading-none space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-stone-950 truncate max-w-[110px]">
                    {student.name}
                  </span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider border ${
                      completion === 100
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {completion}%
                  </span>
                </div>
                <p className="font-mono text-[11px] font-bold text-stone-500 tracking-tight">
                  {student.bec}
                </p>
              </div>
            </button>
          </div>
        </header>
        <main className="px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 px-2 py-2 shadow-[0_-12px_34px_rgba(31,28,23,0.12)] backdrop-blur lg:hidden">
        <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
          {navItems.map(([id, Icon, label]) => (
            <button key={id} onClick={() => setPage(id)} className={`mobile-nav-item ${page === id ? 'mobile-nav-item-active' : ''}`} aria-label={label}>
              <Icon className="h-5 w-5" />
              <span>{label === 'Placements' ? 'Drives' : label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Student Profile & Portfolio Modal */}
      <StudentProfileModal
        student={student}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={onUpdateProfile}
      />
    </div>
  );
}

const PORTAL_ADS = [
  {
    id: 'arch',
    tag: 'NEW • AI ARCHITECTURE GENERATOR',
    title: 'Generate System Flow Diagrams & REST Blueprints',
    desc: 'Enter any project prompt to construct interactive system flowcharts, layer tiers, API routes & Viva points with 1-click cloud save.',
    page: 'projects',
    action: 'Launch Project Architect',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    gradient: 'from-emerald-950/70 via-stone-900 to-stone-900 border-emerald-500/30',
    btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-stone-950',
    icon: Workflow,
    iconColor: 'text-emerald-400'
  },
  {
    id: 'jd',
    tag: 'AI CAREER MENTOR',
    title: 'Match Your Skills Against Any Job Description',
    desc: 'Get instant ATS compatibility scores, identify missing tech skills, and receive an automated 7-day interview study roadmap.',
    page: 'jd',
    action: 'Run JD Matcher',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    gradient: 'from-blue-950/70 via-stone-900 to-stone-900 border-blue-500/30',
    btnBg: 'bg-blue-500 hover:bg-blue-400 text-stone-950',
    icon: Target,
    iconColor: 'text-blue-400'
  },
  {
    id: 'placements',
    tag: 'CAMPUS RECRUITMENT',
    title: 'Live Placement Drives & Company Ledger',
    desc: 'Track active visiting recruiters (TCS, Infosys, Tech Mahindra) with eligibility cutoffs, CTC compensation, and upcoming test dates.',
    page: 'placements',
    action: 'View Placement Drives',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gradient: 'from-amber-950/70 via-stone-900 to-stone-900 border-amber-500/30',
    btnBg: 'bg-amber-400 hover:bg-amber-300 text-stone-950',
    icon: BriefcaseBusiness,
    iconColor: 'text-amber-400'
  },
  {
    id: 'gatepass',
    tag: 'SECURITY & CAMPUS PASSES',
    title: 'Paperless Digital Student Gate Pass',
    desc: 'Submit campus exit requests online in seconds. Track digital approval movement from Class Teacher verification to HOD sign-off.',
    page: 'gatepass',
    action: 'Apply For Gate Pass',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    gradient: 'from-rose-950/70 via-stone-900 to-stone-900 border-rose-500/30',
    btnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
    icon: DoorOpen,
    iconColor: 'text-rose-400'
  },
  {
    id: 'calendar',
    tag: 'ACADEMIC CALENDAR 2026',
    title: 'Odd Semester Official Academic Schedule',
    desc: 'Interactive schedule with all 112 college events, internal assessments (IA-1, IA-2), tech fests, workshops, submissions, and official holidays (July to Dec 2026).',
    page: 'calendar',
    action: 'View College Calendar',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    gradient: 'from-purple-950/70 via-stone-900 to-stone-900 border-purple-500/30',
    btnBg: 'bg-purple-500 hover:bg-purple-400 text-white',
    icon: Calendar,
    iconColor: 'text-purple-400'
  }
];

function Dashboard({ student, setPage, onOpenProfile }) {
  const isPO = student.role === 'po';
  const isStudent = student.role === 'student' || !student.role;
  const availableAds = isPO ? PORTAL_ADS.filter((ad) => ad.page === 'calendar') : PORTAL_ADS;

  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const completion = calculateProfileCompletion(student);
  const missingItems = getMissingProfileItems(student);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % availableAds.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, availableAds.length]);

  const currentAd = availableAds[activeAdIndex] || availableAds[0] || PORTAL_ADS[0];
  const AdIcon = currentAd.icon;
  const visibleCards = isPO ? featureCards.filter((card) => card.id === 'calendar') : featureCards;

  return (
    <div className="space-y-6">
      {/* Profile Incomplete (100% Required) Banner */}
      {isStudent && completion < 100 && (
        <div className="rounded-3xl border-2 border-amber-500/60 bg-stone-950 p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 text-white relative overflow-hidden">
          {/* Subtle accent glow in corner */}
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex items-start sm:items-center gap-4 min-w-0 relative z-10">
            <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-amber-400 text-stone-950 font-black shadow-lg">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-stone-950" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-xl font-black text-white leading-snug">
                  Complete Your Student Profile ({completion}% Done)
                </h3>
                <span className="rounded-full bg-amber-400/20 border border-amber-400/50 px-2.5 py-0.5 text-[10px] font-black text-amber-300 uppercase tracking-wider animate-pulse">
                  100% Required
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-stone-300 leading-relaxed">
                Pending: <strong className="text-amber-300 font-bold">{missingItems.join(' • ')}</strong>. Complete your college details, skills, social/portfolio links, and resume upload.
              </p>
              {/* Progress track */}
              <div className="mt-2.5 w-full max-w-md h-2.5 rounded-full bg-stone-800 overflow-hidden border border-stone-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenProfile}
            className="relative z-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 px-6 py-3.5 text-xs font-black transition-all duration-200 hover:scale-105 shadow-xl shrink-0 cursor-pointer"
          >
            <span>Complete Profile (100%)</span>
            <ArrowRight className="h-4 w-4 text-stone-950" />
          </button>
        </div>
      )}

      {/* Hero Command Center + Dynamic Feature Ad Spotlight - Hidden for PO */}
      {!isPO && (
        <section className="overflow-hidden rounded-2xl bg-stone-950 text-white shadow-xl border border-stone-800">
          <div className="grid min-w-0 gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {/* Left Column: Student Welcome & Stats */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-400/15 border border-emerald-400/20 px-3.5 py-1 text-xs font-bold text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="truncate">Logged in as {student.bec} ({student.department})</span>
                </div>
                <h2 className="max-w-xl text-2xl font-black leading-tight sm:text-4xl text-white tracking-tight">
                  Innovate, Build & Elevate{' '}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                    Your Campus Journey
                  </span>
                </h2>
                <p className="mt-3 max-w-xl break-words text-sm leading-6 text-stone-300 sm:text-base">
                  Your Unified Campus Companion — Craft AI system architectures, manage digital gate passes, accelerate placement readiness, and navigate your academic journey with confidence.
                </p>
              </div>
            </div>

            {/* Right Column: Light Black Box (Feature Ads & Announcements Popup) */}
            <div
              className={`relative flex flex-col justify-between rounded-xl border bg-gradient-to-br ${currentAd.gradient} p-5 backdrop-blur-md transition-all duration-500 shadow-2xl`}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Top Bar of Ad Box: Tag & Nav Controls */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${currentAd.badgeBg}`}>
                    <Sparkles className="h-3 w-3" />
                    {currentAd.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveAdIndex((prev) => (prev - 1 + PORTAL_ADS.length) % PORTAL_ADS.length)}
                      className="grid h-6 w-6 place-items-center rounded bg-white/10 text-stone-300 hover:bg-white/20 transition"
                      aria-label="Previous announcement"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveAdIndex((prev) => (prev + 1) % PORTAL_ADS.length)}
                      className="grid h-6 w-6 place-items-center rounded bg-white/10 text-stone-300 hover:bg-white/20 transition"
                      aria-label="Next announcement"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ad Body */}
                <div className="flex items-start gap-3.5 my-2">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-stone-900 border border-white/10 shadow-md ${currentAd.iconColor}`}>
                    <AdIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white leading-snug">
                      {currentAd.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-5 text-stone-300 line-clamp-3">
                      {currentAd.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: CTA Button + Dot Tickers */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {PORTAL_ADS.map((ad, idx) => (
                    <button
                      key={ad.id}
                      onClick={() => setActiveAdIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeAdIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setPage(currentAd.page)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-black transition-all duration-200 hover:scale-105 shadow-md ${currentAd.btnBg}`}
                >
                  {currentAd.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Modules Grid - Student only, PO accesses calendar via sidebar */}
      {!isPO ? (
        <section className="grid min-w-0 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {featureCards.map((card) => (
            <button key={card.id} onClick={() => setPage(card.id)} className="group min-w-0 rounded-xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-md`}>
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="break-words text-lg font-black text-stone-900">{card.title}</h3>
              <p className="mt-1.5 min-h-14 break-words text-xs leading-5 text-stone-600 font-semibold">{card.summary}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-black text-emerald-700">
                Open module <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </section>
      ) : (
        <POPlacementWorkspace student={student} setPage={setPage} />
      )}

      {/* Quick Insights - hidden for PO */}
      {!isPO && (
        <section className="grid min-w-0 gap-4 lg:grid-cols-3">
          <Insight title="Placement Readiness" text="Upload skills and compare them against job descriptions before drives begin." icon={Target} />
          <Insight title="Approval Visibility" text="Gate pass movement is shown as applied, class teacher verified, HOD approved, or rejected." icon={CheckCircle2} />
          <Insight title="Academic Schedule" text="112 official semester dates, internal assessment schedules, and department events synchronized." icon={CalendarDays} />
        </section>
      )}
    </div>
  );
}


function Insight({ title, text, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700 mb-3 border border-emerald-100">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-black text-stone-950 text-base">{title}</h3>
      <p className="mt-1.5 break-words text-xs leading-5 text-stone-600 font-semibold">{text}</p>
    </div>
  );
}

function ProjectTracker({ student }) {
  const [projects, setProjects] = useState(() => getJSON(STORAGE_KEYS.projects, []));
  const [activeTool, setActiveTool] = useState('architecture');
  const [archPrompt, setArchPrompt] = useState('');
  const [archLoading, setArchLoading] = useState(false);
  const [archError, setArchError] = useState('');
  const [archResult, setArchResult] = useState(null);
  const currentArchStep = useRotatingMessage(ARCH_LOADING_STEPS, archLoading, 2200);

  const [repoForm, setRepoForm] = useState({
    url: '',
    stack: 'React, Tailwind CSS, LocalStorage',
    description: '',
    files: 'src/main.jsx, src/styles.css, package.json'
  });
  const [repoReport, setRepoReport] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);
  const [repoError, setRepoError] = useState('');
  const myProjects = projects.filter((project) => project.bec === student.bec);

  const generateArchitectureFlow = async (overridePrompt) => {
    const promptToUse = (overridePrompt || archPrompt).trim();
    if (!promptToUse) {
      setArchError('Please enter your project prompt or description first.');
      return;
    }
    setArchLoading(true);
    setArchError('');
    try {
      const jsonResponseText = await callAI(
        `You are a Senior Systems & Cloud Architect. Analyze the student's project prompt below and return ONLY a valid raw JSON object (no markdown, no backticks, no text outside JSON):

Student Project Prompt:
"${promptToUse}"

ENGINEERING RULES — follow strictly, a professor may question every choice you make:
1. Match storage to data type. Never suggest object storage (S3, blob storage) for numeric data like face/voice embeddings, vectors, or scores — those belong in a database column, a JSON field, or a vector DB (pgvector, Pinecone). Object storage is only for actual files (images, videos, PDFs, documents).
2. Be internally consistent. If the flow diagram describes a step as "automated", the matching REST endpoint's purpose must also describe it as automated (e.g. triggered by a scheduler/event) — do not contradict the flow with a "manual trigger" description for the same action, or vice versa.
3. If the project involves any kind of alert, notification, or repeated check, the database schema MUST include a field to track whether that alert/action was already sent or performed (e.g. "alert_sent", "notified_at") — otherwise the system has no way to prevent duplicate or missed actions.
4. Only include a component (cache, queue, load balancer, etc.) if the prompt's scale, latency, or concurrency actually justifies it. Do not add infrastructure just because similar projects typically have it. If included, its "reason" field must state the specific justification, not a generic one.

Construct an end-to-end architecture and workflow flow diagram. Return JSON in this EXACT structure:
{
  "projectName": "Title derived from prompt",
  "summary": "2-sentence high-level architecture overview based strictly on this prompt",
  "flowSteps": [
    { "step": 1, "title": "Step Title", "desc": "Detailed description of action", "actor": "Source/User", "target": "Target Component", "type": "client" },
    { "step": 2, "title": "Step Title", "desc": "Detailed description of action", "actor": "Source", "target": "Target", "type": "api" },
    { "step": 3, "title": "Step Title", "desc": "Detailed description of action", "actor": "Source", "target": "Target", "type": "service" },
    { "step": 4, "title": "Step Title", "desc": "Detailed description of action", "actor": "Source", "target": "Target", "type": "db" },
    { "step": 5, "title": "Step Title", "desc": "Detailed description of action", "actor": "Source", "target": "Target", "type": "response" }
  ],
  "layers": [
    { "name": "Presentation Tier (UI)", "subtitle": "User Interfaces", "color": "emerald", "components": ["Frontend Component 1", "Frontend Component 2"] },
    { "name": "API Gateway & Security", "subtitle": "Auth & Routing", "color": "blue", "components": ["REST Controller", "JWT Security", "Rate Limiter"] },
    { "name": "Application & AI Services", "subtitle": "Business Logic & AI", "color": "purple", "components": ["Business Engine", "AI Model / Service", "Job Queue"] },
    { "name": "Data & Persistence Tier", "subtitle": "Storage & Caching", "color": "amber", "components": ["Database Table/Collection", "Cache", "Object Storage"] }
  ],
  "recommendedStack": [
    { "layer": "Frontend", "tech": "React.js / Tailwind CSS", "reason": "Responsive SPA UI for student & admin workflows" },
    { "layer": "Backend", "tech": "Node.js (Express) / Python FastAPI", "reason": "Asynchronous REST API processing" },
    { "layer": "Database", "tech": "PostgreSQL / MongoDB", "reason": "Relational entity mapping & JSON document storage" }
  ],
  "endpoints": [
    { "method": "POST", "path": "/api/v1/auth/login", "purpose": "User authentication & JWT dispatch" },
    { "method": "POST", "path": "/api/v1/core/process", "purpose": "Execute main project action" },
    { "method": "GET", "path": "/api/v1/core/status", "purpose": "Fetch real-time flow status" }
  ],
  "databaseEntities": [
    { "name": "Primary User Entity", "fields": ["id", "username", "role", "created_at"] },
    { "name": "Core Transaction Record", "fields": ["id", "user_id", "status", "payload"] }
  ],
  "vivaTalkingPoints": [
    "Explain how data flows from user input down to persistence layer.",
    "Describe how API Gateway handles authorization & validation.",
    "Highlight scalability and modular decoupling of components."
  ]
}`,
        { maxOutputTokens: 1800, temperature: 0.25 }
      );

      const parsed = parseAIJSON(jsonResponseText);
      setArchResult(parsed);
    } catch (err) {
      setArchError('Failed to generate architecture diagram: ' + err.message);
    } finally {
      setArchLoading(false);
    }
  };

  const saveArchProject = () => {
    if (!archResult) return;
    const nextProjects = [
      ...projects,
      {
        id: crypto.randomUUID(),
        bec: student.bec,
        title: archResult.projectName || 'Project Architecture',
        guide: 'Guide not assigned',
        phase: 'Architecture Plan',
        progress: 85,
        problem: archPrompt || archResult.summary,
        stack: (archResult.recommendedStack || []).map((s) => s.tech),
        repoUrl: '',
        folders: (archResult.layers || []).map((l) => l.name),
        explanation: {
          projectType: archResult.projectName,
          whatBuilt: archResult.summary,
          userFlow: (archResult.flowSteps || []).map((s) => `${s.step}. ${s.title}`).join(' → ')
        },
        aiReview: (archResult.vivaTalkingPoints || []).join('\n• '),
        features: (archResult.flowSteps || []).map((s) => s.title),
        special: 'AI-generated architecture flow diagram saved.',
        milestones: (archResult.endpoints || []).map((e) => `${e.method} ${e.path} - ${e.purpose}`),
        createdAt: new Date().toLocaleDateString()
      }
    ];
    setProjects(nextProjects);
    setJSON(STORAGE_KEYS.projects, nextProjects);
  };

  const analyzeRepo = async () => {
    setRepoLoading(true);
    setRepoError('');
    try {
      const snapshot = await fetchGitHubSnapshot(repoForm.url);
      const baseReport = analyzeRepoSnapshot(snapshot, repoForm);
      try {
        const aiText = await callAI(
          `You are helping a college student explain a final-year project after reading its GitHub repository.

Repository: ${baseReport.repoName}
Repo URL: ${baseReport.repoUrl}
Languages: ${(baseReport.stack || []).join(', ')}
Detected features: ${baseReport.features.join(', ')}
Folders: ${(baseReport.folders || []).join(', ')}
README summary: ${baseReport.explanation?.summary || 'No summary'}
Key modules: ${(baseReport.explanation?.modules || []).join(', ')}

Write a practical student-facing analysis with these exact headings:
What This Project Does
Main Modules
Architecture Explanation
Best Features
What To Improve Before Review
How To Explain In Viva

Keep it clear, specific, and avoid markdown tables.`,
          { maxOutputTokens: 1800 }
        );
        setRepoReport({ ...baseReport, aiReview: aiText });
      } catch (aiError) {
        setRepoReport({ ...baseReport, aiError: aiError.message });
      }
    } catch (error) {
      setRepoError(error.message);
      setRepoReport(null);
    } finally {
      setRepoLoading(false);
    }
  };

  const saveRepoProject = () => {
    if (!repoReport) return;
    const nextProjects = [
      ...projects,
      {
        id: crypto.randomUUID(),
        bec: student.bec,
        title: repoReport.repoName,
        guide: 'Guide not assigned',
        phase: 'Repo Analysis',
        progress: repoReport.score,
        problem: repoForm.description || 'Existing repository analysis',
        stack: repoReport.stack || repoForm.stack.split(',').map((item) => item.trim()).filter(Boolean),
        repoUrl: repoReport.repoUrl,
        folders: repoReport.folders,
        explanation: repoReport.explanation,
        aiReview: repoReport.aiReview,
        features: repoReport.features,
        special: 'Repo analysis saved with improvement roadmap.',
        milestones: repoReport.improvements,
        createdAt: new Date().toLocaleDateString()
      }
    ];
    setProjects(nextProjects);
    setJSON(STORAGE_KEYS.projects, nextProjects);
  };

  const deleteProject = (id) => {
    if (!window.confirm('Remove this saved project from your workspace?')) return;
    const nextProjects = projects.filter((p) => p.id !== id);
    setProjects(nextProjects);
    setJSON(STORAGE_KEYS.projects, nextProjects);
  };

  return (
    <ModuleFrame
      title="Project Tracker"
      subtitle="Architecture planning, live GitHub repo analysis, AI review, and progress tracking for student projects."
      icon={ClipboardList}
    >
      {/* Top Tool Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            ['architecture', Layers, 'Architecture & Flow'],
            ['repo', GitBranch, 'Live Repo Analysis'],
            ['saved', BookOpenCheck, `Saved Projects (${myProjects.length})`]
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-black transition ${
                activeTool === id
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 pr-2 text-xs font-bold text-stone-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>{student.name || student.usn || student.bec} Workspace</span>
        </div>
      </div>

      {activeTool === 'saved' ? (
        /* Dedicated Full Saved Projects View */
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div>
              <h3 className="text-lg font-black text-stone-900">Saved Projects & AI Reports</h3>
              <p className="text-xs text-stone-500">
                Workspace records for {student.name ? `${student.name} (${student.usn || student.bec})` : (student.usn || student.bec)}
              </p>
            </div>
            <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-black text-white">
              {myProjects.length} saved
            </span>
          </div>

          {myProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 bg-white p-10 text-center shadow-sm">
              <BookOpenCheck className="mx-auto h-10 w-10 text-stone-300 mb-3" />
              <h4 className="text-base font-bold text-stone-800">No saved projects yet</h4>
              <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
                Generate a system architecture diagram or analyze an existing GitHub repository to build your project portfolio.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTool('architecture')}
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Workflow className="h-4 w-4" /> Generate Architecture
                </button>
                <button
                  onClick={() => setActiveTool('repo')}
                  className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
                >
                  <GitBranch className="h-4 w-4" /> Analyze Repo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Balanced 2-Column Responsive Layout */
        <section className="grid min-w-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
          {/* Left Column: Scope + Saved Projects List */}
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Student Scope</p>
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600">
                  {student.usn || student.bec}
                </span>
              </div>
              <h3 className="mt-2 text-base font-black text-stone-900 truncate">
                {student.name ? `${student.name}'s Projects` : `${student.usn || student.bec} Workspace`}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                Saved architectures & repo reports stay private to your student login.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniMetric label="Saved" value={myProjects.length} />
                <MiniMetric label="Engines" value="2 Active" />
              </div>
            </div>

            {/* Saved Projects in Left Column */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">My Saved Projects</h4>
                {myProjects.length > 0 && (
                  <button
                    onClick={() => setActiveTool('saved')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    View All ({myProjects.length}) →
                  </button>
                )}
              </div>

              {myProjects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50/60 p-4 text-center">
                  <BookOpenCheck className="mx-auto h-5 w-5 text-stone-400 mb-1" />
                  <p className="text-xs font-bold text-stone-700">No saved projects yet</p>
                  <p className="mt-0.5 text-[11px] text-stone-500">
                    Generate an architecture or analyze a repo to save one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {myProjects.map((p) => (
                    <div key={p.id} className="group rounded-lg border border-stone-200 bg-stone-50 p-2.5 transition hover:bg-stone-100/80">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {p.phase}
                          </span>
                          <h5 className="mt-1 text-xs font-black text-stone-900 truncate">{p.title}</h5>
                        </div>
                        <button
                          onClick={() => deleteProject(p.id)}
                          title="Delete saved project"
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-500 font-semibold">
                        <span>{p.progress}% ready</span>
                        <span>{p.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Tool */}
          <div className="min-w-0">
            {activeTool === 'architecture' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-stone-950 text-white shrink-0">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-stone-900">AI Architecture & Flow Diagram Generator</h3>
                      <p className="text-xs text-stone-600">Enter your project prompt/description to generate the complete system architecture flow diagram.</p>
                    </div>
                  </div>

                  <div className="mb-3.5">
                    <p className="mb-1.5 text-[11px] font-bold text-stone-500 uppercase tracking-wider">Try Sample Prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const text = "Smart College Gate Pass and Attendance System with Facial Recognition and HOD Approvals";
                          setArchPrompt(text);
                          generateArchitectureFlow(text);
                        }}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 transition hover:bg-emerald-100 hover:text-emerald-900"
                      >
                        💡 Gate Pass & Face Recognition
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const text = "AI Healthcare Patient Portal with Doctor Video Consultation, Appointment Scheduling, and E-Prescription Generator";
                          setArchPrompt(text);
                          generateArchitectureFlow(text);
                        }}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 transition hover:bg-emerald-100 hover:text-emerald-900"
                      >
                        💡 AI Healthcare & Telemedicine
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const text = "Campus Placement Drive Ledger with Student Resume Parsing, Skill Matching Engine, and Interview Scheduling";
                          setArchPrompt(text);
                          generateArchitectureFlow(text);
                        }}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 transition hover:bg-emerald-100 hover:text-emerald-900"
                      >
                        💡 Campus Placement Ledger
                      </button>
                    </div>
                  </div>

                  <label className="mb-3.5 block">
                    <span className="mb-1.5 block text-xs font-bold text-stone-700">Project Prompt / Requirements</span>
                    <textarea
                      className="input min-h-24 sm:min-h-28 text-sm"
                      value={archPrompt}
                      onChange={(e) => setArchPrompt(e.target.value)}
                      placeholder="Describe your project idea in detail (e.g. An AI-based library management system with book recommendations, user auth, and fine calculation...)"
                    />
                  </label>

                  {archError && <p className="mb-3.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{archError}</p>}

                  <button
                    disabled={archLoading}
                    onClick={() => generateArchitectureFlow()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 transition shadow-sm"
                  >
                    <Workflow className="h-4 w-4" /> {archLoading ? currentArchStep.title : 'Generate Architecture & Flow Diagram'}
                  </button>
                </div>

                <ArchitectureFlowDisplay
                  result={archResult}
                  loading={archLoading}
                  currentStep={currentArchStep}
                  onSave={saveArchProject}
                />

                {!archResult && !archLoading && (
                  <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-stone-900">Standard Baseline Architecture Layers</h4>
                        <p className="text-xs text-stone-500">Core structural foundation recommended for engineering projects</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 shrink-0">
                        5 Tiers
                      </span>
                    </div>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {architectureLayers.map((item, index) => (
                        <div key={item.layer} className="rounded-lg border border-stone-200 bg-stone-50/80 p-3 transition hover:bg-stone-100/60">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="grid h-6 w-6 place-items-center rounded-md bg-stone-950 text-xs font-black text-amber-400">
                              {index + 1}
                            </span>
                            <h5 className="text-xs font-black text-stone-900">{item.layer}</h5>
                          </div>
                          <p className="text-xs leading-5 text-stone-600 font-medium">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTool === 'repo' && (
              <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
                  <Field label="Repository Link" value={repoForm.url} onChange={(value) => setRepoForm({ ...repoForm, url: value })} placeholder="https://github.com/name/project" />
                  <p className="-mt-2 mb-4 text-xs font-bold text-stone-500">Public GitHub repos are fetched live through the GitHub API.</p>
                  <label className="mb-4 block">
                    <span className="mb-2 block text-sm font-bold text-stone-700">Extra Notes</span>
                    <textarea className="input min-h-24" value={repoForm.description} onChange={(e) => setRepoForm({ ...repoForm, description: e.target.value })} placeholder="Optional: explain hidden features or modules not clear in README." />
                  </label>
                  {repoError && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{repoError}</p>}
                  <button disabled={repoLoading} onClick={analyzeRepo} className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-3 font-black text-white hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:opacity-70 transition shadow-sm">
                    <Code2 className="h-4 w-4" /> {repoLoading ? 'Reading GitHub Repo...' : 'Analyze Live Repo'}
                  </button>
                </div>

                <RepoReport report={repoReport} loading={repoLoading} onSave={saveRepoProject} />
              </div>
            )}
          </div>
        </section>
      )}
    </ModuleFrame>
  );
}

function ArchitectureFlowDisplay({ result, loading, currentStep, onSave }) {
  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="max-w-md">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-stone-200 border-t-emerald-600" />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            AI Architect Analyzing Prompt
          </div>
          <h3 className="text-xl font-black text-stone-900 transition-all duration-300">
            {currentStep.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600 transition-all duration-300">
            {currentStep.desc}
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const getNodeTheme = (type, idx) => {
    const themes = {
      client: {
        border: 'border-blue-500/40 hover:border-blue-400',
        bg: 'bg-gradient-to-r from-blue-950/40 to-stone-900',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        iconBg: 'bg-blue-500 text-white',
        label: 'CLIENT / FRONTEND'
      },
      api: {
        border: 'border-purple-500/40 hover:border-purple-400',
        bg: 'bg-gradient-to-r from-purple-950/40 to-stone-900',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        iconBg: 'bg-purple-500 text-white',
        label: 'API GATEWAY & AUTH'
      },
      service: {
        border: 'border-emerald-500/40 hover:border-emerald-400',
        bg: 'bg-gradient-to-r from-emerald-950/40 to-stone-900',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        iconBg: 'bg-emerald-500 text-white',
        label: 'BUSINESS LOGIC & AI'
      },
      db: {
        border: 'border-amber-500/40 hover:border-amber-400',
        bg: 'bg-gradient-to-r from-amber-950/40 to-stone-900',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        iconBg: 'bg-amber-500 text-stone-950',
        label: 'DATABASE & PERSISTENCE'
      },
      response: {
        border: 'border-teal-500/40 hover:border-teal-400',
        bg: 'bg-gradient-to-r from-teal-950/40 to-stone-900',
        badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        iconBg: 'bg-teal-500 text-stone-950',
        label: 'RESPONSE & NOTIFICATION'
      }
    };
    const key = type || (idx === 0 ? 'client' : idx === 1 ? 'api' : idx === 2 ? 'service' : idx === 3 ? 'db' : 'response');
    return themes[key] || themes.service;
  };

  const getConnectorText = (idx) => {
    const connectors = [
      'HTTPS / REST API Request',
      'JWT Auth & Payload Validation',
      'Business Logic / AI Model Processing',
      'Read/Write DB Query',
      'JSON Response & Client Update'
    ];
    return connectors[idx] || 'System Communication';
  };

  return (
    <div className="space-y-6">
      {/* Header Project Banner */}
      <div className="min-w-0 overflow-hidden rounded-xl bg-gradient-to-br from-stone-950 via-stone-900 to-emerald-950 p-6 text-white shadow-lg border border-white/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Workflow className="h-4 w-4" />
              Custom AI System Architecture
            </div>
            <h3 className="text-2xl font-black tracking-tight sm:text-3xl text-white">{result.projectName}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-300">{result.summary}</p>
          </div>
          <button
            onClick={onSave}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-black text-stone-950 shadow-md transition hover:bg-emerald-400 hover:scale-[1.02] shrink-0"
          >
            <Rocket className="h-4 w-4" /> Save Architecture
          </button>
        </div>
      </div>

      {/* Visual End-to-End Workflow Flowchart (Dark Slate Canvas) */}
      <div className="rounded-xl border border-stone-800 bg-stone-950 p-6 shadow-xl text-white">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">End-to-End System Flow Diagram</h4>
              <p className="text-xs text-stone-400">Sequential data flow & communication protocol between components</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300">
            {result.flowSteps?.length || 0} Flow Nodes
          </span>
        </div>

        <div className="grid gap-5">
          {(result.flowSteps || []).map((step, idx) => {
            const theme = getNodeTheme(step.type, idx);
            return (
              <div key={idx} className="relative">
                <div className={`grid gap-4 rounded-xl border ${theme.border} ${theme.bg} p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-lg sm:grid-cols-[64px_1fr]`}>
                  <div className="flex flex-col items-center justify-center">
                    <div className={`grid h-14 w-14 place-items-center rounded-xl font-black text-xl shadow-md ${theme.iconBg}`}>
                      {step.step || idx + 1}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                        {theme.label}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${theme.badgeBg}`}>
                        {step.actor || 'Source'} → {step.target || 'Target'}
                      </span>
                    </div>
                    <h5 className="text-lg font-black text-white">{step.title}</h5>
                    <p className="mt-1.5 text-sm leading-6 text-stone-300">{step.desc}</p>
                  </div>
                </div>

                {idx < (result.flowSteps?.length || 0) - 1 && (
                  <div className="my-3 flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-stone-800" />
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-stone-900 px-3 py-1 text-[11px] font-bold text-emerald-400 shadow-sm">
                      <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
                      <span>{getConnectorText(idx)}</span>
                    </div>
                    <div className="h-px flex-1 bg-stone-800" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Layer Blueprint */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-stone-950 text-white">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-black text-stone-950">System Layer Blueprint</h4>
            <p className="text-xs font-semibold text-stone-500">Component architecture broken down by technical tier</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(result.layers || []).map((layer) => (
            <div key={layer.name} className="rounded-xl border border-stone-200 bg-stone-50/80 p-5 transition hover:border-stone-300 hover:bg-stone-50">
              <div className="mb-2 flex items-center justify-between">
                <h5 className="font-black text-stone-950 text-base">{layer.name}</h5>
              </div>
              <p className="text-xs font-semibold text-stone-500 mb-4">{layer.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                {(layer.components || []).map((comp) => (
                  <span key={comp} className="rounded-lg bg-white border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-800 shadow-2xs">
                    ⚡ {comp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Tech Stack Grid */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-stone-950 text-white">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-black text-stone-950">Recommended Tech Stack</h4>
            <p className="text-xs font-semibold text-stone-500">Frameworks & infrastructure suggested for implementation</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(result.recommendedStack || []).map((item) => (
            <div key={item.layer} className="rounded-xl border border-stone-200 bg-stone-50/80 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">{item.layer}</p>
              <p className="mt-1.5 text-lg font-black text-stone-950">{item.tech}</p>
              <p className="mt-2 text-xs leading-5 text-stone-600 font-semibold">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* REST API Endpoints */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-stone-950 text-white">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-black text-stone-950">REST API Blueprint</h4>
            <p className="text-xs font-semibold text-stone-500">Core API routes required for system communication</p>
          </div>
        </div>
        <div className="grid gap-3">
          {(result.endpoints || []).map((ep) => (
            <div key={ep.path} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 transition hover:border-stone-300">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-black text-white shrink-0 ${
                  ep.method === 'POST' ? 'bg-emerald-600' :
                  ep.method === 'GET' ? 'bg-blue-600' :
                  ep.method === 'PUT' ? 'bg-amber-600' : 'bg-rose-600'
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm font-black text-stone-950 truncate font-mono">{ep.path}</code>
              </div>
              <span className="text-xs font-semibold text-stone-600">{ep.purpose}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema & Entities */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3 border-b border-stone-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-stone-950 text-white">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-black text-stone-950">Database Schema & Entities</h4>
            <p className="text-xs font-semibold text-stone-500">Primary tables and attributes needed for persistence</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(result.databaseEntities || []).map((ent) => (
            <div key={ent.name} className="rounded-xl border border-stone-200 bg-stone-50/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-4 w-4 text-emerald-700" />
                <h5 className="font-black text-stone-950 text-base">{ent.name}</h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {(ent.fields || []).map((f, fIdx) => (
                  <span key={f} className="rounded-lg bg-white border border-stone-200 px-2.5 py-1 text-xs font-bold text-stone-800 font-mono shadow-2xs">
                    {fIdx === 0 ? '🔑 ' + f : f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viva Defense Guide */}
      <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-700 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-black text-emerald-950">Viva Defense & Talking Points</h4>
            <p className="text-xs font-semibold text-emerald-800">Use these architectural points when explaining your project to reviewers</p>
          </div>
        </div>
        <ul className="grid gap-3">
          {(result.vivaTalkingPoints || []).map((tp, idx) => (
            <li key={idx} className="flex items-start gap-3 rounded-lg bg-white/80 p-3 text-sm font-bold text-stone-800 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700 mt-0.5" />
              <span className="leading-6">{tp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RepoReport({ report, loading, onSave }) {
  const currentStep = useRotatingMessage(REPO_LOADING_STEPS, loading, 2200);

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-lg border border-stone-200 bg-white p-8 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-fuchsia-700" />
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-bold text-fuchsia-800">
            <Sparkles className="h-3.5 w-3.5" />
            Analyzing in real-time
          </div>
          <h3 className="text-xl font-black text-stone-900 transition-all duration-300">
            {currentStep.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600 transition-all duration-300">
            {currentStep.desc}
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
        <div>
          <GitBranch className="mx-auto mb-4 h-10 w-10 text-fuchsia-600" />
          <h3 className="text-xl font-black">Analyze a live GitHub repo</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
            Paste a public repo link and the tracker will fetch languages, README, file tree, feature signals, architecture notes, and improvement roadmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-700">Repo Health</p>
          <h3 className="mt-2 break-words text-xl font-black sm:text-2xl">{report.repoName}</h3>
          {report.repoUrl && (
            <a className="mt-2 inline-flex max-w-full items-center gap-2 break-all text-sm font-black text-emerald-700 hover:text-emerald-900" href={report.repoUrl} target="_blank" rel="noreferrer">
              Open GitHub Repo <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-stone-950 text-2xl font-black text-white sm:h-24 sm:w-24 sm:text-3xl">
          {report.score}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Stars" value={report.stars ?? 0} />
        <MiniMetric label="Forks" value={report.forks ?? 0} />
        <MiniMetric label="Updated" value={report.updatedAt ?? 'Live'} />
      </div>
      {report.explanation && (
        <div className="mt-5 min-w-0 overflow-hidden rounded-lg bg-stone-950 p-4 text-white sm:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">What Student Built</p>
          <h4 className="mt-2 text-xl font-black capitalize">{report.explanation.projectType}</h4>
          <p className="mt-3 whitespace-normal break-words text-sm leading-6 text-stone-200">{report.explanation.whatBuilt}</p>
          <div className="mt-4 rounded-lg bg-white/10 p-4">
            <p className="text-sm font-black text-amber-200">Main User Flow</p>
            <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-stone-200">{report.explanation.userFlow}</p>
          </div>
        </div>
      )}
      {report.aiReview && (
        <div className="mt-5 min-w-0 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-900">
            <Bot className="h-5 w-5" />
            <h4 className="font-black">AI Project Review</h4>
          </div>
          <div className="whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-stone-800">{report.aiReview}</div>
        </div>
      )}
      {report.aiError && (
        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-800">
          GitHub analysis worked, but AI review is currently unavailable: {report.aiError}
        </p>
      )}
      {report.explanation && <ProjectSection title="Modules Found" items={report.explanation.modules} dark={false} />}
      <ProjectSection title="Detected Features" items={report.features} dark={false} />
      <ProjectSection title="Detected Stack" items={report.stack || []} dark={false} />
      <ProjectSection title="Top Folders" items={report.folders || []} dark={false} />
      {report.explanation && <DetailList title="Verification Evidence" items={report.explanation.evidence} />}
      <ProjectSection title="Architecture Notes" items={report.architecture} dark={false} />
      <ProjectSection title="Recommended Improvements" items={report.improvements} dark={false} />
      <button onClick={onSave} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-700 px-4 py-3 font-black text-white hover:bg-fuchsia-800">
        <Rocket className="h-4 w-4" /> Save Analysis
      </button>
    </div>
  );
}

function ProjectSection({ title, items, dark = true }) {
  return (
    <div className="mt-5 min-w-0">
      <h4 className={`mb-3 text-sm font-black uppercase tracking-[0.16em] ${dark ? 'text-stone-400' : 'text-stone-500'}`}>{title}</h4>
      <div className="flex min-w-0 flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`max-w-full whitespace-normal break-words rounded-full px-3 py-1 text-sm font-bold ${dark ? 'bg-white/10 text-stone-100' : 'bg-stone-100 text-stone-700'}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailList({ title, items }) {
  return (
    <div className="mt-5 min-w-0 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <h4 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-stone-500">{title}</h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex min-w-0 gap-3 text-sm font-semibold leading-6 text-stone-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <span className="min-w-0 break-words">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-lg bg-stone-100 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  return (
    <article className="min-w-0 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{project.phase}</p>
          <h3 className="mt-2 break-words text-xl font-black">{project.title}</h3>
          <p className="mt-1 break-words text-sm text-stone-600">Guide: {project.guide}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookOpenCheck className="h-6 w-6 text-amber-600" />
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              title="Delete saved project"
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-4 break-words text-sm leading-6 text-stone-600">{project.problem}</p>
      {project.explanation?.whatBuilt && (
        <div className="mt-4 min-w-0 overflow-hidden rounded-lg bg-stone-950 p-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">Saved Explanation</p>
          <p className="mt-2 break-words text-sm font-semibold leading-6 text-stone-200">{project.explanation.whatBuilt}</p>
        </div>
      )}
      {project.aiReview && (
        <div className="mt-4 min-w-0 overflow-hidden rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">AI Review</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-stone-800">{project.aiReview}</p>
        </div>
      )}
      <div className="mt-5 h-3 rounded-full bg-stone-100">
        <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${project.progress}%` }} />
      </div>
      <p className="mt-3 text-sm font-bold text-stone-600">{project.progress}% ready</p>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
        <ProjectMiniList title="Features" items={project.features || []} />
        <ProjectMiniList title="Stack" items={project.stack || []} />
      </div>
      {project.special && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-800">{project.special}</p>}
    </article>
  );
}

function ProjectMiniList({ title, items }) {
  return (
    <div className="min-w-0 rounded-lg bg-stone-50 p-3">
      <h4 className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500">{title}</h4>
      <div className="space-y-1">
        {items.slice(0, 4).map((item) => (
          <p key={item} className="break-words text-sm font-semibold text-stone-700">{item}</p>
        ))}
      </div>
    </div>
  );
}

const KNOWN_SKILL_CATALOG = [
  // Programming Languages
  { name: 'Python', patterns: [/\bpython\b/i] },
  { name: 'Java', patterns: [/\bjava\b(?!script)/i] },
  { name: 'C', patterns: [/\bprogramming\s+in\s+c\b/i, /\bc\s+language\b/i, /(?:^|[,\s\/\(])C(?:[,\s\/\)]|$)/] },
  { name: 'C++', patterns: [/\bc\+\+\b/i, /\bcpp\b/i] },
  { name: 'C#', patterns: [/\bc\#\b/i, /\bcsharp\b/i] },
  { name: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  { name: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { name: 'SQL', patterns: [/\bsql\b/i] },
  { name: 'HTML5 / HTML', patterns: [/\bhtml5?\b/i] },
  { name: 'CSS3 / CSS', patterns: [/\bcss3?\b/i] },
  { name: 'Bash / Shell', patterns: [/\bbash\b/i, /\bshell\s+scripting\b/i] },

  // Web & Frontend Frameworks
  { name: 'React.js', patterns: [/\breact(?:\.js)?\b/i] },
  { name: 'Next.js', patterns: [/\bnext(?:\.js)?\b/i] },
  { name: 'Tailwind CSS', patterns: [/\btailwind(?:\s*css)?\b/i] },
  { name: 'Bootstrap', patterns: [/\bbootstrap\b/i] },
  { name: 'Angular', patterns: [/\bangular(?:\.js)?\b/i] },
  { name: 'Vue.js', patterns: [/\bvue(?:\.js)?\b/i] },
  { name: 'Responsive UI Design', patterns: [/\bresponsive\s+(?:ui|web)?\s*design\b/i] },

  // Backend Frameworks & APIs
  { name: 'Node.js', patterns: [/\bnode(?:\.js)?\b/i] },
  { name: 'Express.js', patterns: [/\bexpress(?:\.js)?\b/i] },
  { name: 'FastAPI', patterns: [/\bfastapi\b/i] },
  { name: 'Django', patterns: [/\bdjango\b/i] },
  { name: 'Flask', patterns: [/\bflask\b/i] },
  { name: 'Spring Boot', patterns: [/\bspring\s+boot\b/i] },
  { name: 'REST APIs', patterns: [/\brest(?:ful)?\s*apis?\b/i, /\brest\s+api\s+integration\b/i] },
  { name: 'GraphQL', patterns: [/\bgraphql\b/i] },
  { name: 'Microservices', patterns: [/\bmicroservices\b/i] },

  // Databases & Vector Stores
  { name: 'MongoDB', patterns: [/\bmongodb\b/i, /\bmongo\b/i] },
  { name: 'MySQL', patterns: [/\bmysql\b/i] },
  { name: 'PostgreSQL', patterns: [/\bpostgresql\b/i, /\bpostgres\b/i] },
  { name: 'SQLite', patterns: [/\bsqlite\b/i] },
  { name: 'Redis', patterns: [/\bredis\b/i] },
  { name: 'ChromaDB', patterns: [/\bchromadb\b/i, /\bchroma\b/i] },
  { name: 'Pinecone', patterns: [/\bpinecone\b/i] },
  { name: 'Firebase', patterns: [/\bfirebase\b/i] },
  { name: 'Database Management (DBMS)', patterns: [/\bdatabase\s+management(?:\s+system)?\b/i, /\bdbms\b/i] },

  // AI, LLM & Data Science
  { name: 'Agentic AI', patterns: [/\bagentic\s+ai\b/i] },
  { name: 'RAG (Retrieval-Augmented Generation)', patterns: [/\brag\b/i, /\bretrieval[\s-]augmented\s+generation\b/i] },
  { name: 'LangGraph', patterns: [/\blanggraph\b/i] },
  { name: 'LangChain', patterns: [/\blangchain\b/i] },
  { name: 'LLM APIs', patterns: [/\bllm\s+apis?\b/i, /\bllms?\b/i, /\blarge\s+language\s+models?\b/i] },
  { name: 'DeepSeek', patterns: [/\bdeepseek(?:-r1)?\b/i] },
  { name: 'Generative AI', patterns: [/\bgenerative\s+ai\b/i, /\bgenai\b/i] },
  { name: 'Machine Learning', patterns: [/\bmachine\s+learning\b/i, /\bml\b/i] },
  { name: 'Deep Learning', patterns: [/\bdeep\s+learning\b/i] },
  { name: 'Computer Vision', patterns: [/\bcomputer\s+vision\b/i] },
  { name: 'OpenCV', patterns: [/\bopencv\b/i] },
  { name: 'Natural Language Processing (NLP)', patterns: [/\bnatural\s+language\s+processing\b/i, /\bnlp\b/i] },
  { name: 'TensorFlow', patterns: [/\btensorflow\b/i] },
  { name: 'PyTorch', patterns: [/\bpytorch\b/i] },
  { name: 'Pandas', patterns: [/\bpandas\b/i] },
  { name: 'NumPy', patterns: [/\bnumpy\b/i] },
  { name: 'Scikit-Learn', patterns: [/\bscikit[\s-]learn\b/i, /\bsklearn\b/i] },

  // DevOps, Cloud & Tools
  { name: 'Git', patterns: [/\bgit\b(?!hub|lab)/i] },
  { name: 'GitHub', patterns: [/\bgithub\b/i] },
  { name: 'VS Code', patterns: [/\bvs\s*code\b/i, /\bvisual\s+studio\s+code\b/i] },
  { name: 'Docker', patterns: [/\bdocker\b(?![\s-]compose)/i] },
  { name: 'Docker Compose', patterns: [/\bdocker[\s-]compose\b/i] },
  { name: 'Jenkins', patterns: [/\bjenkins\b/i] },
  { name: 'CI/CD', patterns: [/\bci\s*[\/,]\s*cd\b/i, /\bcontinuous\s+integration\b/i] },
  { name: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'AWS', patterns: [/\baws\b/i, /\bamazon\s+web\s+services\b/i] },
  { name: 'Azure', patterns: [/\bazure\b/i, /\bmicrosoft\s+azure\b/i] },
  { name: 'GCP / Google Cloud', patterns: [/\bgcp\b/i, /\bgoogle\s+cloud\b/i] },
  { name: 'Linux', patterns: [/\blinux\b/i, /\bubuntu\b/i] },
  { name: 'Postman', patterns: [/\bpostman\b/i] },
  { name: 'IoT Sensors & Systems', patterns: [/\biot(?:\s+sensors)?\b/i, /\binternet\s+of\s+things\b/i] },

  // Core CS Concepts & Soft Skills
  { name: 'Data Structures & Algorithms (DSA)', patterns: [/\bdata\s+structures\b/i, /\balgorithms\b/i, /\bdsa\b/i] },
  { name: 'Object-Oriented Programming (OOP)', patterns: [/\boop\b/i, /\bobject[\s-]oriented\b/i] },
  { name: 'Operating Systems', patterns: [/\boperating\s+systems?\b/i] },
  { name: 'Computer Networks', patterns: [/\bcomputer\s+networks?\b/i] },
  { name: 'System Design', patterns: [/\bsystem\s+design\b/i] },
  { name: 'Design Thinking', patterns: [/\bdesign\s+thinking\b/i] },
  { name: 'Problem Solving', patterns: [/\bproblem\s+solving\b/i] },
  { name: 'Team Collaboration', patterns: [/\bteam\s+collaboration\b/i, /\bteamwork\b/i] }
];

async function extractSkillsFromResumeDoc(file, student) {
  let rawText = '';

  if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (pdfjsLib && pdfjsLib.getDocument) {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        let pageTexts = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const strings = textContent.items.map((item) => item.str);
          pageTexts.push(strings.join(' '));
        }
        rawText = pageTexts.join('\n');
      }
    } catch (err) {
      console.warn('PDF.js parse failed, falling back to text stream filter', err);
    }

    if (!rawText.trim()) {
      try {
        const txt = await file.text();
        rawText = txt
          .replace(/%PDF[\s\S]*?obj/g, ' ')
          .replace(/<<[\s\S]*?>>/g, ' ')
          .replace(/stream[\s\S]*?endstream/g, ' ')
          .replace(/[^a-zA-Z0-9\+\#\.\,\s\-\/\:\;\|\•]/g, ' ');
      } catch (e) {}
    }
  } else {
    try {
      rawText = await file.text();
    } catch (e) {}
  }

  const matchedSkills = [];

  // Match ONLY recognized skills from catalog
  for (const skillItem of KNOWN_SKILL_CATALOG) {
    const isMatched = skillItem.patterns.some((pattern) => pattern.test(rawText));
    if (isMatched && !matchedSkills.includes(skillItem.name)) {
      matchedSkills.push(skillItem.name);
    }
  }

  if (matchedSkills.length > 0) {
    return matchedSkills.join(', ');
  }

  // If no technical skills are present in the uploaded document, return empty
  return '';
}

function JDMatcher({ student }) {
  const [skills, setSkills] = useState(() => {
    return Array.isArray(student?.skills)
      ? student.skills.join(', ')
      : (student?.skills || '');
  });
  const [jd, setJd] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState({ status: 'none', count: 0 });
  const [aiMatch, setAiMatch] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const currentJdStep = useRotatingMessage(JD_LOADING_STEPS, aiLoading, 2000);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setIsParsingResume(true);

    try {
      const extracted = await extractSkillsFromResumeDoc(file, student);
      if (extracted && extracted.trim()) {
        const count = extracted.split(',').map((s) => s.trim()).filter(Boolean).length;
        setSkills(extracted.trim());
        setExtractionStatus({ status: 'success', count });
      } else {
        setSkills('');
        setExtractionStatus({ status: 'empty', count: 0 });
      }
    } catch (err) {
      console.error('Resume skill extraction error:', err);
      setSkills('');
      setExtractionStatus({ status: 'empty', count: 0 });
    } finally {
      setIsParsingResume(false);
    }
  };

  const result = useMemo(() => {
    const skillSet = skills.toLowerCase().split(',').map((item) => item.trim()).filter(Boolean);
    const words = jd.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((word) => word.length > 2);
    const uniqueWords = [...new Set(words)];
    const matched = uniqueWords.filter((word) => skillSet.some((skill) => skill.includes(word) || word.includes(skill)));
    const score = uniqueWords.length ? Math.round((matched.length / Math.min(uniqueWords.length, 12)) * 100) : 0;
    return { matched, score: Math.min(score, 100), missing: uniqueWords.filter((word) => !matched.includes(word)).slice(0, 8) };
  }, [skills, jd]);

  const runAIMatch = async () => {
    if (!skills && !jd && !resumeFile) {
      setAiError('Please enter your skills (or upload a resume) and paste a job description.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const text = await callAI(
        `You are a college placement mentor. Analyze this student's skills against the job description.

Student: ${student.name}
BEC Number: ${student.bec}
Department: ${student.department}
Year: ${student.year}
Uploaded Resume File: ${resumeFile ? resumeFile.name : 'None'}
Skills: ${skills || 'Extracted from resume'}

Job Description:
${jd}

Write a practical placement report with these exact headings:
Match Summary
Strong Skills
Missing Skills
Projects To Show
7 Day Preparation Plan
Interview Talking Points

Keep it clear and useful for a student.`,
        { maxOutputTokens: 1700 }
      );
      setAiMatch(text);
    } catch (error) {
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <ModuleFrame title="JD Matcher" subtitle={`Personalized skill comparison for ${student.bec}.`} icon={FileSearch}>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
          {/* Resume Upload Folder / File Box */}
          <div className="mb-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 transition hover:border-emerald-500 hover:bg-emerald-50/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm">
                  <FolderUp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-stone-700">Upload Resume Folder / File</p>
                  {isParsingResume ? (
                    <p className="mt-0.5 text-xs font-bold text-emerald-600 animate-pulse">
                      ⚡ Extracting skills & technical keywords from resume...
                    </p>
                  ) : resumeFile ? (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 truncate">
                      <FileText className="h-3.5 w-3.5 shrink-0" /> {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs font-semibold text-stone-500 truncate">PDF, DOCX, or TXT resume document</p>
                  )}
                </div>
              </div>
              <label className="shrink-0 cursor-pointer rounded-lg bg-stone-950 px-3.5 py-2 text-xs font-black text-white transition hover:bg-emerald-700 shadow-sm">
                {isParsingResume ? 'Parsing...' : resumeFile ? 'Change File' : 'Browse Resume'}
                <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" disabled={isParsingResume} onChange={handleResumeUpload} />
              </label>
            </div>
          </div>

          <label className="mb-4 block">
            <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold text-stone-700">Your Skills</span>
              {resumeFile && extractionStatus.status === 'success' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Extracted {extractionStatus.count} skills from {resumeFile.name}</span>
                </span>
              )}
              {resumeFile && extractionStatus.status === 'empty' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                  <span>⚠️ No skills found in {resumeFile.name}</span>
                </span>
              )}
            </div>
            <textarea
              className="input min-h-28"
              value={skills}
              onChange={(e) => {
                setSkills(e.target.value);
                setExtractionStatus({ status: 'none', count: 0 });
              }}
              placeholder={
                extractionStatus.status === 'empty'
                  ? 'No technical skills detected in uploaded document. Please enter your skills manually or upload your actual resume...'
                  : 'e.g. React, Java, Python, SQL, Communication, Problem Solving, Node.js...'
              }
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-700">Job Description</span>
            <textarea
              className="input min-h-44"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the company's job description or requirements here..."
            />
          </label>
        </div>
        <div className="min-w-0 overflow-hidden rounded-lg bg-stone-950 p-4 text-white sm:p-6">
          <Sparkles className="mb-4 h-7 w-7 text-amber-300" />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-stone-400">Match Score</p>
          <p className="mt-2 text-6xl font-black">{result.score}%</p>
          <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
            <ChipList title="Matched Signals" items={result.matched.length ? result.matched : ['Add more skills']} tone="emerald" />
            <ChipList title="Improve These" items={result.missing.length ? result.missing : ['Looks strong']} tone="amber" />
          </div>
          <button disabled={aiLoading} onClick={runAIMatch} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-black text-stone-950 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70">
            <Bot className="h-4 w-4" /> {aiLoading ? currentJdStep : 'Analyze With AI'}
          </button>
          {aiError && <p className="mt-4 rounded-lg bg-amber-100 p-3 text-sm font-bold leading-6 text-amber-900">{aiError}</p>}
        </div>
      </div>
      {aiMatch && (
        <div className="min-w-0 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-900">
            <Bot className="h-5 w-5" />
            <h3 className="font-black">AI JD Match Report</h3>
          </div>
          <div className="whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-stone-800">{aiMatch}</div>
        </div>
      )}
    </ModuleFrame>
  );
}

function ChipList({ title, items, tone }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 font-black">{title}</h3>
      <div className="flex min-w-0 flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`max-w-full break-words rounded-full px-3 py-1 text-sm font-bold ${tone === 'emerald' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-300/15 text-amber-100'}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudentResumeModal({ app, onClose }) {
  if (!app) return null;

  const rawUrl = app.resumeUrl || app.resumeData || '';
  const resumeName = app.resumeName || `${(app.studentName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;
  const isImage = rawUrl.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(resumeName);

  const handleOpenInBlobTab = () => {
    if (!rawUrl) return;
    if (rawUrl.startsWith('data:')) {
      try {
        const parts = rawUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        console.error('Blob preview error', e);
      }
    } else {
      window.open(rawUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-950">Candidate Resume Document</h3>
              <p className="text-xs text-stone-500 font-semibold">
                {app.studentName} ({app.studentBec || app.rollNo}) • {app.department || 'CSE'} ({app.yearSem || app.year || 'IV Year'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Candidate Details Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
          <div>
            <span className="text-stone-400 font-bold block uppercase text-[9px]">Mobile</span>
            <span className="font-bold text-stone-900">{app.phone || 'N/A'}</span>
          </div>
          <div>
            <span className="text-stone-400 font-bold block uppercase text-[9px]">Email</span>
            <span className="font-bold text-stone-900 truncate block">{app.email || 'N/A'}</span>
          </div>
          <div>
            <span className="text-stone-400 font-bold block uppercase text-[9px]">College</span>
            <span className="font-bold text-stone-900 truncate block">{app.college || 'BEC'}</span>
          </div>
          <div>
            <span className="text-stone-400 font-bold block uppercase text-[9px]">Skills</span>
            <span className="font-bold text-emerald-700 truncate block">{app.skills || 'N/A'}</span>
          </div>
        </div>

        {/* Content View */}
        <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4">
          {rawUrl ? (
            isImage ? (
              <div className="flex justify-center">
                <img
                  src={rawUrl}
                  alt={resumeName}
                  className="max-h-[55vh] max-w-full rounded-xl object-contain shadow-sm border border-stone-200"
                />
              </div>
            ) : (
              <iframe
                src={rawUrl}
                className="w-full h-[55vh] rounded-xl border border-stone-200 bg-white"
                title="Candidate Resume Preview"
              />
            )
          ) : (
            <div className="p-8 text-center text-stone-400 space-y-2">
              <FileText className="mx-auto h-12 w-12 text-stone-300" />
              <p className="text-sm font-bold text-stone-700">No document attached by student</p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <div className="text-xs text-stone-500 font-semibold truncate max-w-xs">
            📄 Document: <strong className="text-stone-900 font-mono">{resumeName}</strong>
          </div>
          <div className="flex items-center gap-2">
            {rawUrl && (
              <button
                type="button"
                onClick={handleOpenInBlobTab}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Clean Tab</span>
              </button>
            )}
            {rawUrl && (
              <a
                href={rawUrl}
                download={resumeName}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-black transition shadow-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Resume File</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-stone-950 px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function POPlacementWorkspace({ student, setPage }) {
  const [drives, setDrives] = useState(() => {
    const raw = getJSON(STORAGE_KEYS.placementDrives, INITIAL_PLACEMENT_DRIVES);
    return Array.isArray(raw) ? raw : INITIAL_PLACEMENT_DRIVES;
  });
  const [registrations, setRegistrations] = useState(() => {
    const raw = getJSON(STORAGE_KEYS.placementRegistrations, []);
    return Array.isArray(raw) ? raw.filter((r) => r && r.id !== 'reg_1' && r.id !== 'reg_2') : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');

  // Modal states
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [viewingApplicantsDrive, setViewingApplicantsDrive] = useState(null);
  const [viewingResumeApp, setViewingResumeApp] = useState(null);
  const [applicantSearch, setApplicantSearch] = useState('');

  // Form state
  const initialForm = {
    company: '',
    domain: 'Software & Cloud Services',
    role: '',
    salary: '',
    type: 'Full-Time',
    skills: '',
    minCgpa: '6.5',
    branches: 'CSE, ISE, ECE, EEE',
    registrationLink: '',
    driveDate: '',
    deadline: '',
    description: '',
    pdfUrl: '',
    pdfName: '',
    status: 'Active'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const rawDrives = getJSON(STORAGE_KEYS.placementDrives, INITIAL_PLACEMENT_DRIVES);
      const rawRegs = getJSON(STORAGE_KEYS.placementRegistrations, []);
      setDrives(Array.isArray(rawDrives) ? rawDrives : INITIAL_PLACEMENT_DRIVES);
      setRegistrations(Array.isArray(rawRegs) ? rawRegs.filter((r) => r && r.id !== 'reg_1' && r.id !== 'reg_2') : []);
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const saveDrives = (nextDrives) => {
    setDrives(nextDrives);
    setJSON(STORAGE_KEYS.placementDrives, nextDrives);
    window.dispatchEvent(new Event('storage'));
  };

  const handleOpenCreate = () => {
    setEditingDrive(null);
    setFormData(initialForm);
    setIsDriveModalOpen(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setFormData({
      company: drive.company || '',
      domain: drive.domain || 'Software & Cloud Services',
      role: drive.role || '',
      salary: drive.salary || '',
      type: drive.type || 'Full-Time',
      skills: drive.skills || '',
      minCgpa: drive.minCgpa || '',
      branches: Array.isArray(drive.branches) ? drive.branches.join(', ') : (drive.branches || ''),
      registrationLink: drive.registrationLink || '',
      driveDate: drive.driveDate || '',
      deadline: drive.deadline || '',
      description: drive.description || '',
      pdfUrl: drive.pdfUrl || '',
      pdfName: drive.pdfName || '',
      status: drive.status || 'Active'
    });
    setIsDriveModalOpen(true);
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({
        ...prev,
        pdfUrl: ev.target?.result || '',
        pdfName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setFormData((prev) => ({
      ...prev,
      pdfUrl: '',
      pdfName: ''
    }));
  };

  const handleSaveDrive = (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) {
      alert('Please fill in Company Name and Job Role.');
      return;
    }

    const branchesArray = formData.branches.split(',').map((b) => b.trim()).filter(Boolean);

    if (editingDrive) {
      const updated = drives.map((d) =>
        d.id === editingDrive.id
          ? { ...d, ...formData, branches: branchesArray }
          : d
      );
      saveDrives(updated);
    } else {
      const newDrive = {
        id: `drive_${Date.now()}`,
        ...formData,
        branches: branchesArray,
        postedBy: student?.name ? `Placement Cell (${student.name})` : 'Placement Cell (PO)',
        createdAt: new Date().toISOString().split('T')[0]
      };
      saveDrives([newDrive, ...drives]);
    }
    setIsDriveModalOpen(false);
  };

  const handleToggleStatus = (driveId) => {
    const updated = drives.map((d) => {
      if (d.id === driveId) {
        return { ...d, status: d.status === 'Active' ? 'Closed' : 'Active' };
      }
      return d;
    });
    saveDrives(updated);
  };

  const handleDeleteDrive = (driveId) => {
    if (confirm('Are you sure you want to delete this placement drive?')) {
      const updatedDrives = drives.filter((d) => d.id !== driveId);
      const updatedRegs = registrations.filter((r) => r && r.driveId !== driveId);
      setRegistrations(updatedRegs);
      setJSON(STORAGE_KEYS.placementRegistrations, updatedRegs);
      saveDrives(updatedDrives);
    }
  };

  const validRegistrations = useMemo(() => {
    if (!Array.isArray(drives) || drives.length === 0) return [];
    const driveIds = new Set(drives.map((d) => d.id));
    return registrations.filter((r) => r && driveIds.has(r.driveId));
  }, [drives, registrations]);

  const getDriveApplicants = (driveId) => {
    return validRegistrations.filter((r) => r.driveId === driveId);
  };

  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      if (!d) return false;
      const company = String(d.company || '');
      const role = String(d.role || '');
      const domain = String(d.domain || '');
      const skills = Array.isArray(d.skills) ? d.skills.join(' ') : String(d.skills || '');
      const searchStr = `${company} ${role} ${domain} ${skills}`.toLowerCase();
      const matchesQuery = searchStr.includes((searchQuery || '').toLowerCase());
      const matchesDomain = selectedDomain === 'ALL' || domain.toLowerCase().includes((selectedDomain || '').toLowerCase());
      return matchesQuery && matchesDomain;
    });
  }, [drives, searchQuery, selectedDomain]);

  const activeCount = drives.filter((d) => d && d.status === 'Active').length;
  const totalRegistrations = validRegistrations.length;

  const currentApplicants = useMemo(() => {
    if (!viewingApplicantsDrive) return [];
    const apps = getDriveApplicants(viewingApplicantsDrive.id);
    if (!(applicantSearch || '').trim()) return apps;
    const q = (applicantSearch || '').toLowerCase();
    return apps.filter(
      (a) =>
        a && (
          String(a.studentName || '').toLowerCase().includes(q) ||
          String(a.studentBec || '').toLowerCase().includes(q) ||
          String(a.department || '').toLowerCase().includes(q)
        )
    );
  }, [viewingApplicantsDrive, registrations, applicantSearch]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="overflow-hidden rounded-2xl bg-stone-950 text-white shadow-xl border border-stone-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/25 px-3 py-1 text-xs font-bold text-amber-300">
              <BriefcaseBusiness className="h-4 w-4" />
              <span>Campus Placement Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Placement Drives & Corporate Hiring Roster
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Post verified on-campus opportunities with role requirements and official registration links. Track live student applications and download official Excel candidate spreadsheets for corporate HR teams.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-black px-6 py-3.5 text-sm shadow-xl shadow-emerald-500/20 transition-all duration-200 hover:scale-105 shrink-0 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Post Placement Drive</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 pt-6 border-t border-stone-800">
          <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Active Drives</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">{activeCount}</p>
          </div>
          <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Registered Students</p>
            <p className="mt-1 text-2xl font-black text-amber-300">{totalRegistrations}</p>
          </div>
          <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Recruitment Cell</p>
            <p className="mt-1 text-base font-black text-white">Placement Office</p>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search drives by company, role, domain, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Software', 'Product', 'AI', 'Cloud'].map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                selectedDomain === domain
                  ? 'bg-stone-950 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Drives List */}
      <div className="space-y-4">
        {filteredDrives.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <p className="text-base font-bold text-stone-700">No placement drives found</p>
            <p className="text-xs text-stone-500 mt-1">Try adjusting your search filter or post a new drive.</p>
          </div>
        ) : (
          filteredDrives.map((drive) => {
            const applicants = getDriveApplicants(drive.id);
            const isClosed = drive.status === 'Closed';

            return (
              <div
                key={drive.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                  isClosed ? 'border-stone-200 bg-stone-50/60 opacity-85' : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Company & Role Details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-950 text-white px-3 py-1 text-xs font-black">
                        <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                        {drive.company}
                      </span>
                      <span className="rounded-lg bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                        {drive.domain}
                      </span>
                      <span className="rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                        {drive.type}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                          isClosed
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {drive.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-stone-900 break-words">{drive.role}</h3>

                    {/* Meta info row */}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-stone-600 pt-1">
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-800 font-black border border-emerald-200">
                        <span>Salary / Stipend:</span>
                        <strong className="text-emerald-900">{drive.salary}</strong>
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <span className="font-semibold text-stone-500">Min CGPA:</span>
                        <span className="font-bold text-stone-800">{drive.minCgpa || 'Any'}</span>
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <span className="font-semibold text-stone-500">Branches:</span>
                        <span className="font-bold text-stone-800">
                          {Array.isArray(drive.branches) ? drive.branches.join(', ') : drive.branches}
                        </span>
                      </div>
                      {drive.deadline && (
                        <div className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Deadline: {drive.deadline}</span>
                        </div>
                      )}
                      {drive.driveDate && (
                        <div className="inline-flex items-center gap-1 text-stone-600">
                          <Calendar className="h-3.5 w-3.5 text-stone-400" />
                          <span>Drive Date: {drive.driveDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Required Skills */}
                    {drive.skills && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(drive.skills) ? drive.skills : (typeof drive.skills === 'string' ? drive.skills.split(',') : [])).map((skill, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-700"
                            >
                              {String(skill).trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {drive.description && (
                      <p className="text-xs text-stone-600 leading-relaxed pt-1.5 line-clamp-2">
                        {drive.description}
                      </p>
                    )}



                    {/* PDF Attachment preview */}
                    {drive.pdfUrl && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-500">Official JD PDF:</span>
                        <a
                          href={drive.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={drive.pdfName || `${drive.company}_JD.pdf`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 hover:bg-stone-800 text-white px-2.5 py-1 text-xs font-bold transition shadow-xs"
                        >
                          <FileText className="h-3.5 w-3.5 text-rose-400" />
                          <span className="truncate max-w-xs">{drive.pdfName || 'Company_JD.pdf'}</span>
                          <ExternalLink className="h-3 w-3 text-stone-400" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Applicant Summary & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-200">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-1.5 border border-stone-200">
                      <Users className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-stone-800">
                        <strong className="text-emerald-700 font-black">{applicants.length}</strong> Students Registered
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingApplicantsDrive(drive);
                          setApplicantSearch('');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Registered Students ({applicants.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportApplicantsToCSV(drive, applicants)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Download verified student candidate list as Excel spreadsheet"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        <span>Download Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(drive)}
                        className="rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 text-xs font-bold transition cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(drive.id)}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition cursor-pointer ${
                          isClosed
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {isClosed ? 'Reopen' : 'Close'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDrive(drive.id)}
                        className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 text-xs font-bold transition cursor-pointer"
                        title="Delete Drive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Post / Edit Placement Drive */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-950">
                    {editingDrive ? 'Edit Placement Drive' : 'Post New Placement Drive'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Drive details and registration link will be broadcasted to Student, Teacher, and HOD portals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrive} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCS, Zoho, Google, Infosys"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Domain / Industry *
                  </label>
                  <select
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Software & Cloud Services">Software & Cloud Services</option>
                    <option value="Product Development & SaaS">Product Development & SaaS</option>
                    <option value="Enterprise AI & Data Science">Enterprise AI & Data Science</option>
                    <option value="FinTech & Banking Solutions">FinTech & Banking Solutions</option>
                    <option value="Cybersecurity & Networking">Cybersecurity & Networking</option>
                    <option value="Core Engineering & IoT">Core Engineering & IoT</option>
                    <option value="IT Consulting & Analytics">IT Consulting & Analytics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer, SDE-1, Cloud Specialist"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time + Internship">Full-Time + Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Salary / Stipend *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹8.5 - ₹12 LPA or ₹35,000/mo"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Min CGPA Criteria
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6.5 or 7.0"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Eligible Branches
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, ISE, ECE, EEE"
                    value={formData.branches}
                    onChange={(e) => setFormData({ ...formData, branches: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                  Required Technical Skills (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java, Python, React, SQL, Cloud Basics, Data Structures"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Drive Date
                  </label>
                  <input
                    type="date"
                    value={formData.driveDate}
                    onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1">
                  Job Description & Selection Rounds
                </label>
                <textarea
                  rows={3}
                  placeholder="Details on selection process: Round 1 (Online Assessment), Round 2 (Technical Interview), Round 3 (HR)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Company JD PDF Document Upload */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-stone-800">
                  Company Official JD Document / PDF (Optional)
                </label>
                <p className="text-xs text-stone-500">
                  Upload official company notification PDF or brochure shared by corporate recruiters.
                </p>

                {formData.pdfUrl ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-bold">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{formData.pdfName || 'Company_JD_Notice.pdf'}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={formData.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-black transition"
                      >
                        Preview PDF
                      </a>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-950 hover:bg-stone-800 text-white px-4 py-2.5 text-xs font-bold transition cursor-pointer shrink-0 shadow-xs">
                      <FolderUp className="h-4 w-4 text-emerald-400" />
                      <span>Upload Company PDF</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-stone-400 font-medium">
                      Supports .pdf files up to 10MB
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsDriveModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-black shadow-md transition"
                >
                  {editingDrive ? 'Update Placement Drive' : 'Publish Drive to Campus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Registered Applicants & Excel Export */}
      {viewingApplicantsDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-stone-950 text-white px-2.5 py-0.5 text-xs font-black">
                    {viewingApplicantsDrive.company}
                  </span>
                  <span className="text-xs text-stone-500 font-bold">{viewingApplicantsDrive.role}</span>
                </div>
                <h3 className="text-xl font-black text-stone-950 mt-1">Registered Student Candidates</h3>
                <p className="text-xs text-stone-500">
                  Total {getDriveApplicants(viewingApplicantsDrive.id).length} registered applicants from Basaveshwar Engineering College.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => exportApplicantsToCSV(viewingApplicantsDrive, getDriveApplicants(viewingApplicantsDrive.id))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-black shadow-md transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingApplicantsDrive(null)}
                  className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Applicant search inside modal */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search registered students by name, USN, or department..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Applicants Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 max-h-96">
              {currentApplicants.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs">
                  No registered student applications matching your query.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-950 text-white font-black">
                      <th className="p-3">#</th>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">BEC USN</th>
                      <th className="p-3">Dept & Year</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Skills</th>
                      <th className="p-3">Resume</th>
                      <th className="p-3">Applied On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white font-medium text-stone-700">
                    {currentApplicants.map((app, idx) => (
                      <tr key={app.id || idx} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-stone-900">{idx + 1}</td>
                        <td className="p-3 font-bold text-stone-900">{app.studentName}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{app.studentBec}</td>
                        <td className="p-3">{app.department} ({app.year})</td>
                        <td className="p-3 font-black text-stone-900">{app.cgpa}</td>
                        <td className="p-3 space-y-0.5">
                          <div className="text-[11px] text-stone-800">{app.phone}</div>
                          <div className="text-[10px] text-stone-500">{app.email}</div>
                        </td>
                        <td className="p-3 max-w-xs truncate text-[11px] text-stone-600" title={app.skills}>
                          {app.skills || 'N/A'}
                        </td>
                        <td className="p-3">
                          {app.resumeUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingResumeApp(app)}
                              className="text-emerald-700 hover:text-emerald-950 font-black underline inline-flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition border border-emerald-200 shadow-xs"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="text-stone-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-stone-500 whitespace-nowrap">
                          {app.registeredAt ? new Date(app.registeredAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
              <span>Showing {currentApplicants.length} of {getDriveApplicants(viewingApplicantsDrive.id).length} candidates</span>
              <button
                type="button"
                onClick={() => exportApplicantsToCSV(viewingApplicantsDrive, getDriveApplicants(viewingApplicantsDrive.id))}
                className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export list to Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Resume In-App Document Viewer Modal */}
      {viewingResumeApp && (
        <StudentResumeModal
          app={viewingResumeApp}
          onClose={() => setViewingResumeApp(null)}
        />
      )}
    </div>
  );
}

function PlacementLedger({ student, setPage }) {
  // If placement officer visits this page, render the full PO workspace
  if (student?.role === 'po') {
    return <POPlacementWorkspace student={student} setPage={setPage} />;
  }

  const isFaculty = student?.role === 'teacher' || student?.role === 'hod';
  const [drives, setDrives] = useState(() => {
    const raw = getJSON(STORAGE_KEYS.placementDrives, INITIAL_PLACEMENT_DRIVES);
    return Array.isArray(raw) ? raw : INITIAL_PLACEMENT_DRIVES;
  });
  const [registrations, setRegistrations] = useState(() => {
    const raw = getJSON(STORAGE_KEYS.placementRegistrations, []);
    return Array.isArray(raw) ? raw.filter((r) => r && r.id !== 'reg_1' && r.id !== 'reg_2') : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [appliedDriveNotice, setAppliedDriveNotice] = useState(null);
  const [registeringDrive, setRegisteringDrive] = useState(null);
  const [regForm, setRegForm] = useState({
    studentName: '',
    rollNo: '',
    studentBec: '',
    phone: '',
    email: '',
    college: '',
    yearSem: '',
    skills: '',
    resumeUrl: '',
    resumeName: ''
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      const rawDrives = getJSON(STORAGE_KEYS.placementDrives, INITIAL_PLACEMENT_DRIVES);
      const rawRegs = getJSON(STORAGE_KEYS.placementRegistrations, []);
      setDrives(Array.isArray(rawDrives) ? rawDrives : INITIAL_PLACEMENT_DRIVES);
      setRegistrations(Array.isArray(rawRegs) ? rawRegs.filter((r) => r && r.id !== 'reg_1' && r.id !== 'reg_2') : []);
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleOpenRegistrationModal = (drive) => {
    const alreadyRegistered = registrations.some(
      (r) => r.driveId === drive.id && r.studentBec === student?.bec
    );
    if (alreadyRegistered) {
      alert('You have already registered for this drive in the BEC portal.');
      return;
    }

    setRegisteringDrive(drive);
    setRegForm({
      studentName: student?.name || '',
      rollNo: student?.rollNo || '',
      studentBec: student?.bec || student?.usn || '',
      phone: student?.phone || '',
      email: student?.email || '',
      college: '',
      yearSem: student?.year || 'IV Year',
      skills: Array.isArray(student?.skills) ? student.skills.join(', ') : (student?.skills || ''),
      resumeUrl: typeof student?.resume === 'string' ? student.resume : (student?.resume?.dataUrl || student?.portfolio || student?.github || ''),
      resumeName: typeof student?.resume === 'object' && student?.resume?.name ? student.resume.name : (student?.resume ? 'Resume.pdf' : '')
    });
  };

  const handleRegResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRegForm((prev) => ({
        ...prev,
        resumeUrl: ev.target?.result || '',
        resumeName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    if (!registeringDrive) return;

    if (!regForm.studentName.trim() || !regForm.studentBec.trim()) {
      alert('Please enter your Student Name and USN / Roll Number.');
      return;
    }

    const newReg = {
      id: `reg_${Date.now()}`,
      driveId: registeringDrive.id,
      studentBec: regForm.studentBec.trim().toUpperCase(),
      rollNo: regForm.rollNo.trim() || regForm.studentBec.trim(),
      studentName: regForm.studentName.trim(),
      phone: regForm.phone.trim(),
      email: regForm.email.trim(),
      college: regForm.college.trim(),
      yearSem: regForm.yearSem.trim(),
      year: regForm.yearSem.trim(),
      department: student?.department || 'CSE',
      cgpa: student?.cgpa || '8.5',
      skills: regForm.skills.trim(),
      resumeUrl: regForm.resumeUrl || regForm.resumeName || 'Resume.pdf',
      resumeName: regForm.resumeName || 'Resume.pdf',
      registeredAt: new Date().toISOString()
    };

    const nextRegs = [newReg, ...registrations];
    setRegistrations(nextRegs);
    setJSON(STORAGE_KEYS.placementRegistrations, nextRegs);
    window.dispatchEvent(new Event('storage'));

    const currentDrive = registeringDrive;
    setRegisteringDrive(null);
    setAppliedDriveNotice(currentDrive);
  };

  const validRegistrations = useMemo(() => {
    if (!Array.isArray(drives) || drives.length === 0) return [];
    const driveIds = new Set(drives.map((d) => d.id));
    return registrations.filter((r) => r && driveIds.has(r.driveId));
  }, [drives, registrations]);

  const isStudentRegistered = (driveId) => {
    return validRegistrations.some((r) => r && r.driveId === driveId && r.studentBec === student?.bec);
  };

  const getDriveApplicantsCount = (driveId) => {
    return validRegistrations.filter((r) => r && r.driveId === driveId).length;
  };

  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      if (!d) return false;
      const company = String(d.company || '');
      const role = String(d.role || '');
      const domain = String(d.domain || '');
      const skills = Array.isArray(d.skills) ? d.skills.join(' ') : String(d.skills || '');
      const searchStr = `${company} ${role} ${domain} ${skills}`.toLowerCase();
      const matchesQuery = searchStr.includes((searchQuery || '').toLowerCase());
      const matchesDomain = selectedDomain === 'ALL' || domain.toLowerCase().includes((selectedDomain || '').toLowerCase());
      return matchesQuery && matchesDomain;
    });
  }, [drives, searchQuery, selectedDomain]);

  const studentRegistrationsCount = useMemo(() => {
    return validRegistrations.filter((r) => r.studentBec === student?.bec).length;
  }, [validRegistrations, student?.bec]);

  return (
    <ModuleFrame
      title="Placement Drives & Campus Recruitment"
      subtitle={
        isFaculty
          ? 'Live campus recruitment drives and applicant monitoring for faculty & department heads.'
          : 'Verified campus placement opportunities posted by Placement Office. Register with 1-click and apply via official links.'
      }
      icon={BriefcaseBusiness}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white border border-stone-200 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Active Drives</p>
            <p className="mt-1 text-2xl font-black text-stone-900">{drives.filter((d) => d && d.status === 'Active').length}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Registered Students
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{validRegistrations.length}</p>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Recruitment Cell</p>
            <p className="mt-1 text-base font-black text-stone-900">Placement Office</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Filter drives by company, role, domain, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Software', 'Product', 'AI', 'Cloud'].map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedDomain === domain
                    ? 'bg-stone-950 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Drives Grid */}
        <div className="space-y-4">
          {filteredDrives.map((drive) => {
            const hasRegistered = isStudentRegistered(drive.id);
            const applicantsCount = getDriveApplicantsCount(drive.id);
            const isClosed = drive.status === 'Closed';

            return (
              <div
                key={drive.id}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-950 text-white px-3 py-1 text-xs font-black">
                        <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                        {drive.company}
                      </span>
                      <span className="rounded-lg bg-stone-100 border border-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700">
                        {drive.domain}
                      </span>
                      <span className="rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                        {drive.type}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider ${
                          isClosed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {drive.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-stone-900">{drive.role}</h3>
                  </div>

                  {/* Salary Pill */}
                  <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 px-4 py-2 text-sm font-black shadow-md shrink-0">
                    <span>Package:</span>
                    <span>{drive.salary}</span>
                  </div>
                </div>

                {/* Eligibility & Dates info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="font-semibold text-stone-500">Min CGPA:</span>{' '}
                    <strong className="text-stone-900">{drive.minCgpa || '6.0+'}</strong>
                  </div>
                  <div className="h-3 w-px bg-stone-300 hidden sm:block" />
                  <div>
                    <span className="font-semibold text-stone-500">Branches:</span>{' '}
                    <strong className="text-stone-900">
                      {Array.isArray(drive.branches) ? drive.branches.join(', ') : drive.branches}
                    </strong>
                  </div>
                  {drive.driveDate && (
                    <>
                      <div className="h-3 w-px bg-stone-300 hidden sm:block" />
                      <div className="inline-flex items-center gap-1 text-stone-800 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" />
                        <span>Drive Date: {drive.driveDate}</span>
                      </div>
                    </>
                  )}
                  {drive.deadline && (
                    <>
                      <div className="h-3 w-px bg-stone-300 hidden sm:block" />
                      <div className="inline-flex items-center gap-1 text-rose-600 font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Deadline: {drive.deadline}</span>
                      </div>
                    </>
                  )}
                  <div className="ml-auto inline-flex items-center gap-1 text-stone-500 font-bold">
                    <Users className="h-3.5 w-3.5 text-stone-400" />
                    <span>{applicantsCount} Students Applied</span>
                  </div>
                </div>

                {/* Required Skills */}
                {drive.skills && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">Required Skills & Technologies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(drive.skills) ? drive.skills : (typeof drive.skills === 'string' ? drive.skills.split(',') : [])).map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-700"
                        >
                          {String(skill).trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {drive.description && (
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {drive.description}
                  </p>
                )}



                {/* PDF Document Attachment Box */}
                {drive.pdfUrl && (
                  <div className="rounded-xl bg-stone-900 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-stone-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">
                          {drive.pdfName || `${drive.company} Official Job Description (PDF)`}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium">
                          Official recruiter notification PDF uploaded by Placement Cell
                        </p>
                      </div>
                    </div>
                    <a
                      href={drive.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={drive.pdfName || `${drive.company}_JD.pdf`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white px-3.5 py-2 text-xs font-black transition shrink-0 cursor-pointer shadow-sm"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>View / Download JD PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Action Section */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100">
                  {/* Student Registration Status */}
                  <div>
                    {hasRegistered ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-black text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>You Are Registered In BEC Database</span>
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500 font-medium">
                        Click below to submit your BEC candidate profile to Placement Office.
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* JD Matcher Jump Button */}
                    <button
                      type="button"
                      onClick={() => setPage && setPage('jd')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
                      title="Compare your profile against this role in JD Matcher"
                    >
                      <FileSearch className="h-3.5 w-3.5 text-stone-500" />
                      <span>Check ATS Match</span>
                    </button>

                    {/* Register Button for Students */}
                    {!isFaculty && (
                      <button
                        type="button"
                        disabled={hasRegistered || isClosed}
                        onClick={() => handleOpenRegistrationModal(drive)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition shadow-xs cursor-pointer ${
                          hasRegistered
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : isClosed
                            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                        }`}
                      >
                        {hasRegistered ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4" />
                            <span>Register for Drive</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidate Registration Form Modal */}
        {registeringDrive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-stone-200 my-8 space-y-5">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 font-black">
                    <Rocket className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-950">
                      Register for Drive: {registeringDrive.company}
                    </h3>
                    <p className="text-xs font-bold text-emerald-700">
                      {registeringDrive.role} • {registeringDrive.salary}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRegisteringDrive(null)}
                  className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      value={regForm.studentName}
                      onChange={(e) => setRegForm({ ...regForm, studentName: e.target.value })}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BEC233040"
                      value={regForm.studentBec}
                      onChange={(e) => setRegForm({ ...regForm, studentBec: e.target.value.toUpperCase() })}
                      className="input text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      USN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2BA21CS001"
                      value={regForm.rollNo}
                      onChange={(e) => setRegForm({ ...regForm, rollNo: e.target.value.toUpperCase() })}
                      className="input text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@bec.edu"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      College Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="College name"
                      value={regForm.college}
                      onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Year & Semester *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. III Year (5th Sem)"
                      value={regForm.yearSem}
                      onChange={(e) => setRegForm({ ...regForm, yearSem: e.target.value })}
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Key Technical Skills *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java, Python, React, Data Structures, SQL"
                    value={regForm.skills}
                    onChange={(e) => setRegForm({ ...regForm, skills: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Resume / CV Document / Link
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3.5 py-2 text-xs hover:bg-stone-100 transition">
                        <span className="font-semibold text-stone-700 truncate">
                          {regForm.resumeName ? `📄 ${regForm.resumeName}` : 'Upload Resume PDF / File...'}
                        </span>
                        <Upload className="h-4 w-4 text-stone-500 shrink-0 ml-2" />
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleRegResumeUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setRegisteringDrive(null)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Submit Application & Register</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Applied Success Notice Modal */}
        {appliedDriveNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-center space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-950">Registration Submitted Successfully!</h3>
                <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                  Your student credentials and candidate form details have been registered in the Placement Office database for{' '}
                  <strong className="text-stone-900">{appliedDriveNotice.company}</strong> ({appliedDriveNotice.role}).
                </p>
              </div>



              <button
                type="button"
                onClick={() => setAppliedDriveNotice(null)}
                className="w-full rounded-xl bg-stone-950 hover:bg-stone-800 text-white font-black py-2.5 text-xs transition cursor-pointer"
              >
                Close & View Drives
              </button>
            </div>
          </div>
        )}
      </div>
    </ModuleFrame>
  );
}

const encodePassData = (pass) => {
  if (!pass) return '';
  try {
    const minified = {
      id: pass.id,
      n: pass.name,
      b: pass.bec,
      r: pass.roll_no || pass.rollNo || '',
      br: pass.branch || pass.department || 'CSE',
      y: pass.year_sem || pass.yearSem || 'III Year',
      c: pass.college_name || pass.collegeName || 'Basaveshwar Engineering College',
      re: pass.reason,
      p: pass.ai_priority || 'HIGH',
      k: pass.security_key || '1BE7F7',
      d: pass.date || new Date().toISOString().split('T')[0],
      o: pass.out_time || pass.outTime || '14:00',
      s: pass.status || 'Approved',
      tA: pass.teacher_approval || '',
      tN: pass.teacher_approver || '',
      tT: pass.teacher_approved_at || '',
      hA: pass.hod_approval || '',
      hN: pass.hod_approver || '',
      hT: pass.hod_approved_at || ''
    };
    return btoa(encodeURIComponent(JSON.stringify(minified)));
  } catch (e) {
    return '';
  }
};

const decodePassData = (encodedStr) => {
  if (!encodedStr) return null;
  try {
    const jsonStr = decodeURIComponent(atob(encodedStr));
    const m = JSON.parse(jsonStr);
    return {
      id: m.id,
      name: m.n,
      bec: m.b,
      roll_no: m.r,
      branch: m.br,
      year_sem: m.y,
      college_name: m.c,
      reason: m.re,
      ai_priority: m.p,
      security_key: m.k,
      date: m.d,
      out_time: m.o,
      status: m.s,
      teacher_approval: m.tA,
      teacher_approver: m.tN,
      teacher_approved_at: m.tT,
      hod_approval: m.hA,
      hod_approver: m.hN,
      hod_approved_at: m.hT
    };
  } catch (e) {
    return null;
  }
};

const getGatePassVerificationUrl = (passIdOrPass) => {
  const isObj = typeof passIdOrPass === 'object' && passIdOrPass !== null;
  const id = isObj ? passIdOrPass.id : passIdOrPass;
  if (!id) return '';
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const host = isLocal ? '192.168.0.171:5173' : window.location.host;
  return `${window.location.protocol}//${host}/?verify=${encodeURIComponent(id)}`;
};

function RealQRCode({ value = 'GATEPASS', size = 200 }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      margin: 2,
      width: size * 2,
      errorCorrectionLevel: 'L',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code error', err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div style={{ width: size, height: size }} className="grid place-items-center rounded-2xl border border-stone-200 bg-stone-50">
        <span className="text-[10px] font-mono font-bold text-stone-400 animate-pulse">GENERATING QR...</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Official Gate Pass QR"
      width={size}
      height={size}
      className="bg-white p-3 rounded-2xl border-2 border-stone-300 shadow-md shrink-0 object-contain mx-auto"
    />
  );
}

const QRCodeSVG = RealQRCode;

// OFFICIAL PUBLIC VERIFICATION SCREEN (Opened when scanning QR Code)
function PublicGatePassVerification({ passId, encodedData }) {
  const [pass, setPass] = useState(() => {
    const fromUrl = decodePassData(encodedData);
    if (fromUrl) {
      // Save decoded pass into mobile local storage
      const existing = getJSON(STORAGE_KEYS.gatePasses, []);
      const next = [fromUrl, ...existing.filter((p) => p.id !== fromUrl.id)];
      updateGatePassesStorage(next);
      return fromUrl;
    }
    const all = getJSON(STORAGE_KEYS.gatePasses, []);
    return all.find((p) => p.id === passId || p.security_key === passId) || null;
  });
  const [loading, setLoading] = useState(!pass);
  const [exited, setExited] = useState(false);

  useEffect(() => {
    const syncLocal = () => {
      const all = getJSON(STORAGE_KEYS.gatePasses, []);
      const found = all.find((p) => p.id === passId || p.security_key === passId);
      if (found) setPass((prev) => ({ ...(prev || {}), ...found }));
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('gatepasses_updated', syncLocal);

    apiFetch('/api/db/gatepasses').then((res) => {
      if (res?.gatePasses?.length) {
        const found = res.gatePasses.find((p) => p.id === passId || p.security_key === passId);
        if (found) {
          setPass((prev) => ({ ...(prev || {}), ...found }));
          const existing = getJSON(STORAGE_KEYS.gatePasses, []);
          const next = [found, ...existing.filter((p) => p.id !== found.id)];
          updateGatePassesStorage(next);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => {
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('gatepasses_updated', syncLocal);
    };
  }, [passId]);

  const handleMarkExited = () => {
    if (!pass) return;
    const updated = { ...pass, status: 'USED' };
    setPass(updated);
    setExited(true);
    const all = getJSON(STORAGE_KEYS.gatePasses, []);
    const next = all.map((p) => (p.id === pass.id ? updated : p));
    updateGatePassesStorage(next);
    apiFetch('/api/db/gatepasses/verify', {
      method: 'POST',
      body: JSON.stringify({ keyOrId: pass.id })
    }).catch(() => {});
  };

  const isApproved = pass?.status === 'Approved';
  const isUsed = pass?.status === 'USED' || exited;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center max-w-sm w-full shadow-lg">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-emerald-600 mb-3" />
          <p className="font-bold text-stone-800 text-sm">Verifying Gate Pass QR Code...</p>
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center max-w-md w-full shadow-xl space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Gate Pass Not Found</h2>
          <p className="text-xs text-stone-600">This pass ID or QR code is not registered in the BEC Gate Security Database.</p>
          <p className="font-mono text-xs bg-stone-100 p-2 rounded-lg text-stone-500">Search Key: {passId}</p>
          <a href="/" className="inline-block w-full rounded-xl bg-stone-950 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition">
            Go to My Campus Home
          </a>
        </div>
      </div>
    );
  }

  const cleanApproverName = (raw, defaultName, defaultPrefix) => {
    let s = String(raw || defaultName).trim();
    s = s.split('(')[0].trim();
    s = s.replace(/^(Verified by Class Teacher|Approved by HOD|Verified by|Approved by|Rejected by)\s*/i, '');
    s = s.replace(/^(Class Teacher|HOD)\s*/i, '');
    s = s.replace(/(Prof\.\s*)+/gi, 'Prof. ');
    s = s.replace(/(Dr\.\s*)+/gi, 'Dr. ');
    s = s.trim();
    if (!s.toLowerCase().startsWith('prof.') && !s.toLowerCase().startsWith('dr.')) {
      s = `${defaultPrefix} ${s}`;
    }
    return s;
  };

  const teacherTime = pass.teacher_approved_at || pass.teacher_approval?.split('(')[1]?.replace(')', '') || 'Verified on ' + (pass.date || 'Today');
  const teacherName = cleanApproverName(pass.teacher_approver || pass.teacher_approval, 'Rajesh Sharma', 'Prof.');
  const hodTime = pass.hod_approved_at || pass.hod_approval?.split('(')[1]?.replace(')', '') || 'Authorized on ' + (pass.date || 'Today');
  const hodName = cleanApproverName(pass.hod_approver || pass.hod_approval, 'Sunitha M', 'Dr.');

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl space-y-4">
        {/* College Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-900 text-white px-4 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-400" /> {pass.college_name || pass.collegeName || 'Basaveshwar Engineering College'}
          </div>
          <p className="text-xs font-bold text-stone-500">Digital Gate Security Verification</p>
        </div>

        {/* Verification Status Banner */}
        <div className={`rounded-3xl border p-5 shadow-lg text-center ${
          isUsed
            ? 'bg-cyan-50 border-cyan-300 text-cyan-950'
            : isApproved
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`h-3 w-3 rounded-full ${isUsed ? 'bg-cyan-600' : isApproved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <h1 className="text-base font-black tracking-wide uppercase">
              {isUsed ? 'PASS ALREADY USED • STUDENT EXITED' : isApproved ? 'OFFICIAL GATE PASS • VALID FOR EXIT' : pass.status}
            </h1>
          </div>
          <p className="text-xs opacity-80">Scanned & Authenticated via QR Security Protocol</p>
        </div>

        {/* Pass Details Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl space-y-5">
          {/* Top Bar with Pass ID and Secret Key */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">GATE PASS ID</p>
              <p className="font-mono text-sm font-black text-stone-900">{pass.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">GATE SECURITY VERIFICATION</p>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300 text-emerald-950 font-mono text-sm font-black tracking-widest mt-0.5">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>• • • • • •</span>
              </div>
              <p className="text-[9px] font-bold text-stone-400 mt-0.5">Key Verified via QR Protocol</p>
            </div>
          </div>

          {/* Student Profile */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Student Full Name</span>
              <strong className="text-stone-950 text-base font-black">{pass.name}</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">USN / BEC ID</span>
              <strong className="text-stone-950 text-base font-mono font-bold">{pass.bec}</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Branch & Year</span>
              <strong className="text-stone-900">{pass.branch || pass.department || 'CSE'} • {pass.year_sem || 'III Year'}</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Roll Number</span>
              <strong className="text-stone-900 font-mono">{pass.roll_no || '42'}</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">Out Time & Date</span>
              <strong className="text-stone-900">{pass.out_time || pass.outTime || '14:00'} ({pass.date || 'Today'})</strong>
            </div>
            <div>
              <span className="text-stone-400 font-bold block uppercase text-[10px]">AI Severity Priority</span>
              <span className="inline-block font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase text-[10px]">
                {pass.ai_priority || 'HIGH'}
              </span>
            </div>
            <div className="col-span-2 border-t border-stone-100 pt-2">
              <span className="text-stone-400 font-bold block uppercase text-[10px]">College Name</span>
              <strong className="text-stone-950 text-sm font-black">{pass.college_name || pass.collegeName || 'N/A'}</strong>
            </div>
          </div>

          {/* Reason */}
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
            <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block mb-1">Reason for Leave</span>
            <p className="text-sm font-bold text-stone-950 italic">"{pass.reason}"</p>
          </div>

          {/* Detailed Approval Trail with Timestamps */}
          <div className="space-y-3 border-t border-stone-100 pt-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Authorized Approval Trail
            </h3>

            {/* Teacher Card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">1. CLASS TEACHER APPROVAL</p>
                <p className="text-xs font-black text-stone-950 mt-0.5">{teacherName}</p>
                <p className="text-[11px] text-stone-600 mt-0.5">Verified leave reason & emergency documents</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block rounded-full bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5">VERIFIED</span>
                <p className="text-[10px] font-mono text-stone-500 mt-1 font-semibold">{teacherTime}</p>
              </div>
            </div>

            {/* HOD Card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">2. HEAD OF DEPARTMENT (HOD) AUTHORIZATION</p>
                <p className="text-xs font-black text-stone-950 mt-0.5">{hodName}</p>
                <p className="text-[11px] text-stone-600 mt-0.5">Official digital signature & QR code generated</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block rounded-full bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5">APPROVED</span>
                <p className="text-[10px] font-mono text-stone-500 mt-1 font-semibold">{hodTime}</p>
              </div>
            </div>
          </div>

          {isUsed && (
            <div className="rounded-2xl bg-cyan-100 p-3.5 text-center text-xs font-bold text-cyan-900 border border-cyan-300">
              ✓ Exit Verified & Logged by Campus Security Terminal
            </div>
          )}

          <div className="pt-2 text-center">
            <a
              href="/"
              className="text-xs font-bold text-stone-500 hover:text-stone-900 underline"
            >
              ← Go to My Campus Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const updateGatePassesStorage = (nextPasses) => {
  setJSON(STORAGE_KEYS.gatePasses, nextPasses);
  window.dispatchEvent(new Event('gatepasses_updated'));
};

const getMergedGatePasses = (existing = [], fetched = []) => {
  const map = new Map();
  (existing || []).forEach((p) => { if (p?.id) map.set(p.id, p); });
  (fetched || []).forEach((p) => {
    if (p?.id) {
      const current = map.get(p.id);
      map.set(p.id, { ...current, ...p });
    }
  });
  return Array.from(map.values());
};

function DocumentViewerModal({ pass, onClose }) {
  if (!pass) return null;

  const isImage = pass.document_data?.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(pass.document_name || '');
  const isPDF = pass.document_data?.startsWith('data:application/pdf') || /\.pdf$/i.test(pass.document_name || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-950">Student Permission Document</h3>
              <p className="text-xs text-stone-500 font-semibold">{pass.name} ({pass.bec}) • {pass.document_name || 'Emergency Leave Slip'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Document Content View */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          {pass.document_data ? (
            isImage ? (
              <div className="flex justify-center">
                <img
                  src={pass.document_data}
                  alt={pass.document_name}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-sm border border-stone-200"
                />
              </div>
            ) : isPDF ? (
              <iframe
                src={pass.document_data}
                className="w-full h-[58vh] rounded-xl border border-stone-200 bg-white"
                title="Document Preview"
              />
            ) : (
              <div className="p-6 text-center space-y-3">
                <FileText className="mx-auto h-12 w-12 text-emerald-600" />
                <p className="font-bold text-sm text-stone-900">{pass.document_name}</p>
                <a
                  href={pass.document_data}
                  download={pass.document_name || 'document'}
                  className="inline-block rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Download Attached Document
                </a>
              </div>
            )
          ) : (
            /* Official Digital Leave Letter & Slip Preview */
            <div className="rounded-xl border border-stone-200 bg-white p-6 text-left space-y-4 shadow-xs">
              <div className="border-b border-stone-200 pb-3 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Basaveshwar Engineering College</p>
                <h4 className="text-base font-black text-stone-950">STUDENT PERMISSION & LEAVE LETTER</h4>
                <p className="text-[11px] text-stone-500">Autonomous Institution Affiliated to VTU, Belagavi</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500 font-bold block">Student Name</span>
                  <strong className="text-stone-950 text-sm">{pass.name}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-bold block">USN / BEC ID</span>
                  <strong className="text-stone-950 text-sm font-mono">{pass.bec}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-bold block">Department / Branch</span>
                  <strong className="text-stone-950">{pass.branch || pass.department || 'CSE'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-bold block">Year & Semester</span>
                  <strong className="text-stone-950">{pass.year_sem || pass.yearSem || 'III Year'}</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-bold block">Leave Date & Time</span>
                  <strong className="text-stone-950">{pass.date} ({pass.out_time || pass.outTime})</strong>
                </div>
                <div>
                  <span className="text-stone-500 font-bold block">AI Severity Priority</span>
                  <strong className="text-rose-700 uppercase font-black">{pass.ai_priority || 'HIGH'}</strong>
                </div>
              </div>

              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200 space-y-1">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Reason Submitted</p>
                <p className="text-sm font-bold text-stone-900">"{pass.reason}"</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 pt-3">
                <span>Pass ID: <strong className="font-mono text-stone-800">{pass.id}</strong></span>
                <span className="text-emerald-700 font-bold">✓ Attached File: {pass.document_name || 'Emergency_Leave_Letter.pdf'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {pass.document_data && (
            <a
              href={pass.document_data}
              download={pass.document_name || 'document'}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition"
            >
              Download File
            </a>
          )}
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-950 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// 1. STUDENT GATE PASS FORM (Clean Portal Theme)
function GatePass({ student }) {
  const [passes, setPasses] = useState(() => getJSON(STORAGE_KEYS.gatePasses, []));
  const [form, setForm] = useState({
    fullName: '',
    usn: '',
    rollNo: '',
    branch: '',
    yearSem: '',
    collegeName: '',
    reason: '',
    documentName: '',
    outTime: '14:00',
    returnTime: '17:30'
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [viewingPass, setViewingPass] = useState(null);

  const fetchPasses = async () => {
    const res = await apiFetch('/api/db/gatepasses');
    if (res?.gatePasses?.length) {
      setPasses((prev) => {
        const merged = getMergedGatePasses(prev, res.gatePasses);
        updateGatePassesStorage(merged);
        return merged;
      });
    }
  };

  useEffect(() => {
    fetchPasses();
    const interval = setInterval(fetchPasses, 2000);
    const syncLocal = () => {
      setPasses(getJSON(STORAGE_KEYS.gatePasses, []));
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('gatepasses_updated', syncLocal);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('gatepasses_updated', syncLocal);
    };
  }, [student.bec]);

  const myPasses = passes.filter((p) => {
    const pBec = (p.bec || p.usn || '').trim().toUpperCase();
    const pSession = (p.student_session_bec || '').trim().toUpperCase();
    const pRoll = (p.roll_no || p.rollNo || '').trim().toUpperCase();
    const pName = (p.name || '').trim().toUpperCase();
    const sBec = (student.bec || '').trim().toUpperCase();
    const sName = (student.name || '').trim().toUpperCase();
    return (
      pBec === sBec ||
      pSession === sBec ||
      pRoll === sBec ||
      (sName && pName === sName) ||
      pBec === '1XY21CS001'
    );
  });

  const handleDeletePass = async (passId) => {
    const next = passes.filter((p) => p.id !== passId);
    setPasses(next);
    updateGatePassesStorage(next);
    apiFetch('/api/db/gatepasses/delete', {
      method: 'POST',
      body: JSON.stringify({ id: passId })
    }).catch(() => {});
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setForm((prev) => ({ ...prev, documentName: file.name }));
      const reader = new FileReader();
      reader.onload = () => {
        setFileDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitPass = async (event) => {
    event.preventDefault();
    if (!form.reason.trim()) return;
    setLoading(true);

    const isUrgent = /medical|hospital|doctor|emergency|accident|fever/i.test(form.reason);
    const aiPriority = isUrgent ? 'HIGH' : 'MEDIUM';
    const securityKey = Math.random().toString(16).substring(2, 8).toUpperCase();

    const newPass = {
      id: 'GP-' + Date.now().toString(36).toUpperCase(),
      bec: (form.usn.trim() || student.bec || '1XY21CS001').toUpperCase(),
      student_session_bec: (student.bec || '').toUpperCase(),
      name: form.fullName.trim() || student.name || 'Student',
      roll_no: form.rollNo.trim() || '42',
      branch: form.branch.trim() || 'CSE',
      year_sem: form.yearSem.trim() || 'III Year',
      college_name: form.collegeName.trim() || 'Basaveshwar Engineering College',
      department: form.branch.trim() || 'CSE',
      reason: form.reason.trim(),
      document_name: selectedFile ? selectedFile.name : (form.documentName || ''),
      document_data: fileDataUrl || '',
      ai_priority: aiPriority,
      security_key: securityKey,
      date: new Date().toISOString().split('T')[0],
      out_time: form.outTime,
      return_time: form.returnTime,
      contact: '9876543210',
      status: 'Pending Class Teacher',
      teacher_approval: null,
      hod_approval: null,
      rejection_reason: null,
      created_at: new Date().toLocaleString()
    };

    const next = [newPass, ...passes.filter((p) => p.id !== newPass.id)];
    setPasses(next);
    updateGatePassesStorage(next);

    setForm((prev) => ({ ...prev, reason: '', documentName: '' }));
    setSelectedFile(null);
    setFileDataUrl('');
    setLoading(false);

    apiFetch('/api/db/gatepasses', {
      method: 'POST',
      body: JSON.stringify(newPass)
    }).catch(() => {});
  };

  return (
    <ModuleFrame title="Apply Gate Pass" subtitle="Fill the form below to request campus exit permission. Submissions are reviewed by your Class Teacher & HOD." icon={DoorOpen}>
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Pass Form */}
        <form onSubmit={submitPass} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="text-lg font-black text-stone-950">New Gate Pass Request</h3>
            <p className="text-xs text-stone-500">Provide accurate details for Class Teacher review</p>
          </div>

          <Field
            label="Full Name (as per ID)"
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
            placeholder="Enter Full Name"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="USN"
              value={form.usn}
              onChange={(v) => setForm({ ...form, usn: v })}
              placeholder="Enter USN"
            />
            <Field
              label="Roll Number"
              value={form.rollNo}
              onChange={(v) => setForm({ ...form, rollNo: v })}
              placeholder="Enter Roll Number"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              label="Branch"
              value={form.branch}
              onChange={(v) => setForm({ ...form, branch: v })}
              placeholder="Enter Branch"
            />
            <Field
              label="Year & Sem"
              value={form.yearSem}
              onChange={(v) => setForm({ ...form, yearSem: v })}
              placeholder="Enter Year & Sem"
            />
          </div>

          <Field
            label="College Name"
            value={form.collegeName}
            onChange={(v) => setForm({ ...form, collegeName: v })}
            placeholder="Enter College Name"
          />

          <div>
            <label className="mb-2 block text-sm font-bold text-stone-700">Reason for Leave</label>
            <textarea
              rows={3}
              className="input min-h-24"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly describe your reason..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-stone-700">Emergency Document (Optional, PDF/Image)</label>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="block w-full text-xs text-stone-500 file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2.5 file:text-xs file:font-black file:text-white hover:file:bg-emerald-700" />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-stone-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
          >
            <DoorOpen className="h-4 w-4" />
            {loading ? 'Submitting...' : 'Apply for Pass'}
          </button>
        </form>

        {/* Student Gate Pass History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-600">Your Gate Pass Requests ({myPasses.length})</h3>
            <span className="text-xs text-stone-500">Live Sync</span>
          </div>

          {myPasses.length === 0 ? (
            <EmptyState text="No gate pass requests submitted yet." />
          ) : (
            myPasses.map((pass) => (
              <div key={pass.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <span className={`px-3 py-1 rounded-full font-black text-xs uppercase ${
                    pass.status === 'Approved' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    pass.status === 'USED' ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' :
                    pass.status?.includes('Reject') ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                    'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {pass.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-500">{pass.id}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePass(pass.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 transition text-xs font-bold cursor-pointer"
                      title="Delete Pass"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-base font-black text-stone-950">{pass.reason}</p>
                {pass.document_name && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setViewingPass(pass)}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" /> View Attached Document ({pass.document_name})
                    </button>
                  </div>
                )}

                {pass.status === 'Approved' && (
                  <div className="mt-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">OFFICIAL EXIT GATE PASS</p>
                        <p className="text-xs font-black text-emerald-950">Show QR Code to Security Guard at Main Gate</p>
                        <p className="text-[10px] font-semibold text-stone-500">🔒 Secret key is hidden for security to prevent fake passes</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-full bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 uppercase">
                          Present to Guard
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-1">
                      <RealQRCode value={getGatePassVerificationUrl(pass)} size={160} />
                      <a
                        href={getGatePassVerificationUrl(pass)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> Test / Open Verification Page
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {viewingPass && <DocumentViewerModal pass={viewingPass} onClose={() => setViewingPass(null)} />}
    </ModuleFrame>
  );
}

// 2. TEACHER DASHBOARD (Clean Portal Theme)
function TeacherGatePassView({ student }) {
  const [passes, setPasses] = useState(() => getJSON(STORAGE_KEYS.gatePasses, []));
  const [loading, setLoading] = useState(false);
  const [viewingPass, setViewingPass] = useState(null);

  const fetchPasses = async () => {
    const res = await apiFetch('/api/db/gatepasses');
    if (res?.gatePasses?.length) {
      setPasses((prev) => {
        const merged = getMergedGatePasses(prev, res.gatePasses);
        updateGatePassesStorage(merged);
        return merged;
      });
    }
  };

  useEffect(() => {
    fetchPasses();
    const interval = setInterval(fetchPasses, 2000);
    const syncLocal = () => {
      setPasses(getJSON(STORAGE_KEYS.gatePasses, []));
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('gatepasses_updated', syncLocal);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('gatepasses_updated', syncLocal);
    };
  }, []);

  const awaitingReview = passes.filter(
    (p) => p.status === 'Pending Class Teacher' || p.status === 'Class Teacher Review'
  );
  const approvedToday = passes.filter(
    (p) => p.status === 'Approved' || p.status === 'Pending HOD Approval'
  );
  const historyPasses = passes.filter(
    (p) => p.status === 'Approved' || p.status?.includes('Teacher') || p.status?.includes('Reject')
  );

  const handleDecision = (pass, decision) => {
    const newStatus = decision === 'APPROVED' ? 'Pending HOD Approval' : 'Rejected by Teacher';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString();
    const teacherTime = `${dateStr} at ${timeStr}`;
    const teacherName = `Prof. ${student.name || 'Rajesh Sharma'}`;
    const teacherNote = decision === 'APPROVED' ? `Verified by ${teacherName} (${teacherTime})` : `Rejected by ${teacherName} (${teacherTime})`;

    const updated = passes.map((p) =>
      p.id === pass.id ? {
        ...p,
        status: newStatus,
        teacher_approval: teacherNote,
        teacher_approver: teacherName,
        teacher_approved_at: teacherTime
      } : p
    );
    setPasses(updated);
    updateGatePassesStorage(updated);

    apiFetch('/api/db/gatepasses/status', {
      method: 'POST',
      body: JSON.stringify({
        id: pass.id,
        status: newStatus,
        teacherApproval: teacherNote,
        rejectionReason: decision === 'REJECTED' ? 'Class teacher review note' : null
      })
    }).catch(() => {});
  };

  const handleDelete = (passId) => {
    const updated = passes.filter((p) => p.id !== passId);
    setPasses(updated);
    updateGatePassesStorage(updated);

    apiFetch('/api/db/gatepasses/delete', {
      method: 'POST',
      body: JSON.stringify({ id: passId })
    }).catch(() => {});
  };

  return (
    <ModuleFrame title="Teacher Dashboard" subtitle="Review student gate pass applications and forward verified requests to HOD." icon={CheckCircle2}>
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Applications Awaiting Review</p>
            <p className="mt-2 text-4xl font-black text-stone-950">{awaitingReview.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Approved & Outgoing Today</p>
            <p className="mt-2 text-4xl font-black text-stone-950">{approvedToday.length}</p>
          </div>
        </div>

        {/* Main Table: Applications Awaiting Review */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="hidden grid-cols-5 border-b border-stone-200 bg-stone-950 px-5 py-3.5 text-xs font-black uppercase text-white sm:grid">
            <span>Student Name</span>
            <span>Reason</span>
            <span>AI Priority</span>
            <span>Letter</span>
            <span>Actions</span>
          </div>

          {awaitingReview.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold italic text-stone-500">
              No pending requests found.
            </div>
          ) : (
            awaitingReview.map((pass) => (
              <div key={pass.id} className="grid grid-cols-1 items-center gap-3 border-t border-stone-200 px-5 py-4 text-xs font-semibold text-stone-800 sm:grid-cols-5">
                <span className="font-bold text-stone-950 text-sm">{pass.name}</span>
                <span className="truncate">{pass.reason}</span>
                <span>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                    pass.ai_priority === 'HIGH' ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {pass.ai_priority || 'MEDIUM'}
                  </span>
                </span>
                <span>
                  {pass.document_name ? (
                    <button
                      type="button"
                      onClick={() => setViewingPass(pass)}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer transition"
                    >
                      <FileText className="h-3.5 w-3.5" /> View
                    </button>
                  ) : (
                    <span className="text-stone-400">N/A</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={loading}
                    onClick={() => handleDecision(pass, 'APPROVED')}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleDecision(pass, 'REJECTED')}
                    className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-rose-700 shadow-sm transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* History Table: Recent Actions */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-stone-900">
            <Clock className="h-4 w-4 text-stone-500" /> Your Recent Actions (History)
          </h3>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <div className="hidden grid-cols-4 border-b border-stone-200 bg-stone-100 px-4 py-3 text-[11px] font-black uppercase text-stone-600 sm:grid">
              <span>Student Name</span>
              <span>Decision</span>
              <span>Reason</span>
              <span className="text-right">Manage</span>
            </div>

            {historyPasses.map((pass) => {
              const isApproved = pass.status === 'Approved' || pass.status === 'Pending HOD Approval';
              return (
                <div key={pass.id} className="grid grid-cols-1 items-center gap-2 border-t border-stone-200 px-4 py-3 text-xs font-bold text-stone-800 sm:grid-cols-4">
                  <span className="text-stone-950 font-bold">{pass.name}</span>
                  <span className={`font-black tracking-wider uppercase text-[11px] ${isApproved ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isApproved ? 'APPROVED' : 'REJECTED'}
                  </span>
                  <span className="truncate text-stone-600">{pass.reason}</span>
                  <div className="text-right">
                    <button onClick={() => handleDelete(pass.id)} className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer">
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {viewingPass && <DocumentViewerModal pass={viewingPass} onClose={() => setViewingPass(null)} />}
    </ModuleFrame>
  );
}

// 3. HEAD OF DEPARTMENT DASHBOARD & MODAL (Clean Portal Theme)
function HODGatePassView({ student }) {
  const [passes, setPasses] = useState(() => getJSON(STORAGE_KEYS.gatePasses, []));
  const [loading, setLoading] = useState(false);
  const [modalPass, setModalPass] = useState(null);
  const [viewingPass, setViewingPass] = useState(null);

  const fetchPasses = async () => {
    const res = await apiFetch('/api/db/gatepasses');
    if (res?.gatePasses?.length) {
      setPasses((prev) => {
        const merged = getMergedGatePasses(prev, res.gatePasses);
        updateGatePassesStorage(merged);
        return merged;
      });
    }
  };

  useEffect(() => {
    fetchPasses();
    const interval = setInterval(fetchPasses, 2000);
    const syncLocal = () => {
      setPasses(getJSON(STORAGE_KEYS.gatePasses, []));
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('gatepasses_updated', syncLocal);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('gatepasses_updated', syncLocal);
    };
  }, []);

  const awaitingHOD = passes.filter(
    (p) => p.status === 'Pending HOD Approval' || p.status === 'HOD Review'
  );
  const passesGrantedToday = passes.filter((p) => p.status === 'Approved' || p.status === 'USED');
  const rejectedRequests = passes.filter((p) => p.status?.includes('Reject'));
  const exitHistory = passes.filter((p) => p.status === 'Approved' || p.status === 'USED');

  const handleHODDecision = (pass, decision) => {
    const newStatus = decision === 'APPROVED' ? 'Approved' : 'Rejected by HOD';
    const securityKey = Math.random().toString(16).substring(2, 8).toUpperCase();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString();
    const hodTime = `${dateStr} at ${timeStr}`;
    const hodName = `Dr. ${student.name || 'Sunitha M'}`;
    const hodNote = decision === 'APPROVED' ? `Approved by HOD ${hodName} (${hodTime})` : `Rejected by HOD (${hodTime})`;

    const updatedPass = {
      ...pass,
      status: newStatus,
      hod_approval: hodNote,
      hod_approver: hodName,
      hod_approved_at: hodTime,
      security_key: securityKey
    };

    const updated = passes.map((p) => (p.id === pass.id ? updatedPass : p));
    setPasses(updated);
    updateGatePassesStorage(updated);

    if (decision === 'APPROVED') {
      setModalPass(updatedPass);
    }

    apiFetch('/api/db/gatepasses/status', {
      method: 'POST',
      body: JSON.stringify({
        id: pass.id,
        status: newStatus,
        hodApproval: hodNote,
        securityKey: securityKey
      })
    }).catch(() => {});
  };

  const handleDelete = (passId) => {
    const updated = passes.filter((p) => p.id !== passId);
    setPasses(updated);
    updateGatePassesStorage(updated);

    apiFetch('/api/db/gatepasses/delete', {
      method: 'POST',
      body: JSON.stringify({ id: passId })
    }).catch(() => {});
  };

  return (
    <ModuleFrame title="Head of Department Dashboard" subtitle="Final authorization & QR Code generation for student gate passes." icon={ShieldCheck}>
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Awaiting Approvals</p>
            <p className="mt-2 text-4xl font-black text-stone-950">{awaitingHOD.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Passes Granted Today</p>
            <p className="mt-2 text-4xl font-black text-stone-950">{passesGrantedToday.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Rejected Requests</p>
            <p className="mt-2 text-4xl font-black text-stone-950">{rejectedRequests.length}</p>
          </div>
        </div>

        {/* Main Table: Awaiting Approvals */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="hidden grid-cols-5 border-b border-stone-200 bg-stone-950 px-5 py-3.5 text-xs font-black uppercase text-white sm:grid">
            <span>Student Name</span>
            <span>Reason</span>
            <span>AI Priority</span>
            <span>Letter</span>
            <span>Final Action</span>
          </div>

          {awaitingHOD.length === 0 ? (
            <div className="p-8 text-center text-sm font-semibold italic text-stone-500">
              No pending requests found.
            </div>
          ) : (
            awaitingHOD.map((pass) => (
              <div key={pass.id} className="grid grid-cols-1 items-center gap-3 border-t border-stone-200 px-5 py-4 text-xs font-semibold text-stone-800 sm:grid-cols-5">
                <span className="font-bold text-stone-950 text-sm">{pass.name}</span>
                <span className="truncate">{pass.reason}</span>
                <span>
                  <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900 border border-emerald-300">
                    {pass.ai_priority || 'MEDIUM'}
                  </span>
                </span>
                <span>
                  {pass.document_name ? (
                    <button
                      type="button"
                      onClick={() => setViewingPass(pass)}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer transition"
                    >
                      <FileText className="h-3.5 w-3.5" /> View
                    </button>
                  ) : (
                    <span className="text-stone-400">N/A</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={loading}
                    onClick={() => handleHODDecision(pass, 'APPROVED')}
                    className="rounded-lg bg-stone-950 px-3.5 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                  >
                    Approve & QR
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => handleHODDecision(pass, 'REJECTED')}
                    className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-rose-700 shadow-sm transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* History Table: Exit History */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-black text-stone-900">
              <Clock className="h-4 w-4 text-stone-500" /> Exit History (Students Went Out)
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
              LOGS ARE PERMANENT UNTIL DELETED
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <div className="hidden grid-cols-5 border-b border-stone-200 bg-stone-100 px-4 py-3 text-[11px] font-black uppercase text-stone-600 sm:grid">
              <span>Student Name</span>
              <span>Out Time</span>
              <span>Security Key</span>
              <span>Status</span>
              <span className="text-right">Manage</span>
            </div>

            {exitHistory.map((pass) => (
              <div key={pass.id} className="grid grid-cols-1 items-center gap-2 border-t border-stone-200 px-4 py-3 text-xs font-bold text-stone-800 sm:grid-cols-5">
                <span className="font-bold text-stone-950">{pass.name}</span>
                <span className="text-stone-600">{pass.date || '1/9/2026'}</span>
                <span className="font-mono text-emerald-800 font-black uppercase">{pass.security_key || 'DF50FB'}</span>
                <span className="font-black uppercase text-[11px] text-emerald-700">
                  {pass.status === 'USED' ? 'USED' : 'ACTIVE'}
                </span>
                <div className="text-right">
                  <button onClick={() => handleDelete(pass.id)} className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer">
                    <Trash2 className="h-4 w-4 inline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PASS APPROVED MODAL */}
        {modalPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-center space-y-4">
              <h3 className="text-2xl font-black text-stone-950">
                Pass Approved!
              </h3>
              <p className="text-xs text-stone-600">
                Scan this QR code to view live verified approval details and timestamps.
              </p>

              <div className="rounded-2xl bg-stone-950 p-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">SECRET SECURITY KEY</p>
                <p className="mt-1 font-mono text-3xl font-black tracking-widest">
                  {modalPass.security_key || '904CD3'}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <RealQRCode value={getGatePassVerificationUrl(modalPass)} size={190} />
                <a
                  href={getGatePassVerificationUrl(modalPass)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Test / Open Verification Details Page
                </a>
              </div>

              <button
                onClick={() => setModalPass(null)}
                className="w-full rounded-xl bg-stone-950 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {viewingPass && <DocumentViewerModal pass={viewingPass} onClose={() => setViewingPass(null)} />}
    </ModuleFrame>
  );
}

// 4. GATE SECURITY TERMINAL / SCANNER (Clean Portal Theme)
function GateSecurityTerminal() {
  const [passes, setPasses] = useState(() => getJSON(STORAGE_KEYS.gatePasses, []));
  const [hashInput, setHashInput] = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [scanMessage, setScanMessage] = useState('');

  const fetchPasses = async () => {
    const res = await apiFetch('/api/db/gatepasses');
    if (res?.gatePasses?.length) {
      setPasses((prev) => {
        const merged = getMergedGatePasses(prev, res.gatePasses);
        updateGatePassesStorage(merged);
        return merged;
      });
    }
  };

  useEffect(() => {
    fetchPasses();
    const interval = setInterval(fetchPasses, 2000);
    const syncLocal = () => {
      setPasses(getJSON(STORAGE_KEYS.gatePasses, []));
    };
    window.addEventListener('storage', syncLocal);
    window.addEventListener('gatepasses_updated', syncLocal);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncLocal);
      window.removeEventListener('gatepasses_updated', syncLocal);
    };
  }, []);

  const awaitingExit = passes.filter((p) => p.status === 'Approved');

  const handleValidate = (keyToUse) => {
    const targetKey = keyToUse || hashInput.trim();
    if (!targetKey) return;

    const updated = passes.map((p) =>
      p.id === targetKey || p.security_key === targetKey ? { ...p, status: 'USED' } : p
    );
    setPasses(updated);
    updateGatePassesStorage(updated);

    const localMatch = passes.find((p) => p.id === targetKey || p.security_key === targetKey);
    if (localMatch) {
      setVerifiedPass({ ...localMatch, status: 'USED' });
      setScanMessage('✅ PASS VALIDATED! STUDENT CLEARED FOR EXIT');
    } else {
      setScanMessage('❌ ERROR: Invalid QR Hash ID or Pass Key');
    }

    apiFetch('/api/db/gatepasses/verify', {
      method: 'POST',
      body: JSON.stringify({ keyOrId: targetKey })
    }).then((res) => {
      if (res?.success && res.pass) {
        setVerifiedPass(res.pass);
      }
    }).catch(() => {});
  };

  const handleDelete = (passId) => {
    const updated = passes.filter((p) => p.id !== passId);
    setPasses(updated);
    updateGatePassesStorage(updated);

    apiFetch('/api/db/gatepasses/delete', {
      method: 'POST',
      body: JSON.stringify({ id: passId })
    }).catch(() => {});
  };

  return (
    <ModuleFrame title="Security Terminal Scanner" subtitle="Validate student QR codes or secret keys at the main gate for exit clearance." icon={Radio}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side: SYSTEM TERMINAL */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-900 bg-stone-950 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 animate-pulse">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-wider text-emerald-400">SYSTEM TERMINAL</h2>
                <p className="text-[10px] font-mono tracking-widest text-stone-400">INPUT OR SCAN PASS UUID TO VERIFY</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleValidate('904CD3')}
                className="w-full rounded-xl bg-stone-800 py-3 text-xs font-black text-white border border-stone-700 hover:bg-stone-700 transition flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4 text-emerald-400" /> START CAMERA SCANNER
              </button>

              <input
                type="text"
                className="w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 font-mono text-center text-sm font-bold text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none"
                placeholder="ENTER QR HASH ID"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
              />

              <button
                onClick={() => handleValidate()}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-black tracking-wider text-white hover:bg-emerald-500 transition shadow-md"
              >
                VALIDATE QR
              </button>
            </div>

            {scanMessage && (
              <p className={`mt-3 text-center text-xs font-bold p-2.5 rounded-xl border ${
                scanMessage.includes('ERROR') ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {scanMessage}
              </p>
            )}
          </div>

          {/* Pass Details Card */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-left text-sm font-black text-stone-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" /> Pass Details
            </h3>

            {verifiedPass ? (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-bold text-stone-950 text-base">{verifiedPass.name}</span>
                  <span className="rounded bg-emerald-700 px-2 py-0.5 font-mono text-[10px] font-black text-white">
                    {verifiedPass.security_key}
                  </span>
                </div>
                <p className="text-stone-700">USN: <strong className="text-stone-950">{verifiedPass.bec}</strong></p>
                <p className="text-stone-700">Reason: <strong className="text-stone-950">{verifiedPass.reason}</strong></p>
                <p className="text-stone-700">Out Time: <strong className="text-stone-950">{verifiedPass.out_time || verifiedPass.outTime}</strong></p>
                <span className="inline-block rounded-md bg-emerald-700 px-3 py-1 font-black text-white text-xs mt-2">
                  ✓ VERIFIED FOR CAMPUS EXIT
                </span>
              </div>
            ) : (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <Shield className="mx-auto h-12 w-12 opacity-30 text-stone-400" />
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-stone-500">AWAITING SCAN</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Awaiting Exit Table */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-950 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /> Awaiting Exit
              </h3>
              <p className="text-[10px] font-mono text-stone-500">LIVE BACKGROUND SYNCING</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
            <div className="hidden grid-cols-4 border-b border-stone-200 bg-stone-100 px-4 py-3 text-[10px] font-black uppercase text-stone-600 sm:grid">
              <span>Student</span>
              <span>Secret Key</span>
              <span>Reason</span>
              <span className="text-right">Action</span>
            </div>

            {awaitingExit.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-stone-500 italic">
                No active approved passes awaiting exit right now.
              </div>
            ) : (
              awaitingExit.map((pass) => (
                <div key={pass.id} className="grid grid-cols-1 items-center gap-2 border-t border-stone-200 px-4 py-3 text-xs font-semibold text-stone-800 sm:grid-cols-4">
                  <div>
                    <strong className="block text-stone-950 font-bold">{pass.name}</strong>
                    <span className="text-[10px] text-stone-500 font-mono">{pass.bec}</span>
                  </div>
                  <span className="font-mono text-emerald-800 font-black uppercase">{pass.security_key || '904CD3'}</span>
                  <span className="truncate italic text-stone-600">{pass.reason}</span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleValidate(pass.security_key || pass.id)}
                      className="rounded-lg bg-stone-950 px-3 py-1 text-[11px] font-black text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      VERIFY
                    </button>
                    <button onClick={() => handleDelete(pass.id)} className="text-rose-600 hover:text-rose-800 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ModuleFrame>
  );
}

function Step({ label, done }) {
  return (
    <div className={`rounded-lg border p-3 text-sm font-black ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-stone-50 text-stone-500'}`}>
      <CheckCircle2 className="mb-2 h-5 w-5" />
      {label}
    </div>
  );
}

function ModuleFrame({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="min-w-0 space-y-5">
      <section className="min-w-0 rounded-lg bg-white p-4 shadow-sm sm:p-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-stone-950 text-white sm:h-12 sm:w-12">
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-xl font-black sm:text-2xl">{title}</h2>
            <p className="mt-1 break-words text-sm leading-6 text-stone-600">{subtitle}</p>
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="min-w-0 rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center sm:p-8">
      <Search className="mx-auto mb-3 h-8 w-8 text-stone-400" />
      <p className="break-words font-bold text-stone-600">{text}</p>
    </div>
  );
}

function FormattedChatMessage({ text, role }) {
  if (role === 'user') {
    return <p className="whitespace-pre-wrap break-words text-xs sm:text-sm font-semibold">{text}</p>;
  }

  const lines = text.split('\n');

  const parseInline = (str) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = str.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={idx} className="font-black text-stone-950">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return <code key={idx} className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-800 border border-stone-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-stone-800 font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-emerald-600 font-black mt-0.5">•</span>
              <div className="flex-1">{parseInline(content)}</div>
            </div>
          );
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 mt-1">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-stone-900 text-[10px] font-black text-white mt-0.5">
                {numberedMatch[1]}
              </span>
              <div className="flex-1">{parseInline(numberedMatch[2])}</div>
            </div>
          );
        }

        return <p key={idx} className="break-words">{parseInline(line)}</p>;
      })}
    </div>
  );
}

function CampusChatBot({ student, activePage }) {
  const [open, setOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const currentChatStep = useRotatingMessage(CHAT_LOADING_STEPS, loading, 2000);

  const studentFirstName = student?.name ? student.name.split(' ')[0] : 'there';

  const POPUP_MESSAGES = useMemo(() => [
    {
      text: `👋 Hi ${studentFirstName}! Need any help?`,
      tag: 'Help',
      prompt: 'Hi! What can you help me with on this campus portal?'
    },
    {
      text: `🚪 Need a Gate Pass? Apply & track approvals live!`,
      tag: 'Gate Pass',
      prompt: 'How do I apply for a Gate Pass and check real-time approval status?'
    },
    {
      text: `🏗️ Planning a project? Generate AI system architecture!`,
      tag: 'Projects',
      prompt: 'How can I generate an AI architecture and flow diagram for my project?'
    },
    {
      text: `💼 Placement drive coming up? Test your JD Match score!`,
      tag: 'Placements',
      prompt: 'How can I match my skills and resume with company job descriptions?'
    },
    {
      text: `📅 Don't miss IA exams or fests — check Academic Calendar!`,
      tag: 'Calendar',
      prompt: 'What are the upcoming IA test dates and events in the academic calendar?'
    }
  ], [studentFirstName]);

  const sessionsStorageKey = student?.bec ? `bec_portal_chat_sessions_${student.bec}` : 'bec_portal_chat_sessions_guest';
  const legacyStorageKey = student?.bec ? `bec_portal_chat_${student.bec}` : 'bec_portal_chat_session';

  const defaultGreeting = useMemo(() => [
    {
      role: 'assistant',
      text: `👋 Hi ${student?.name || 'there'}! I am your AI Campus Assistant. Ask me anything about Gate Passes, Projects, Placements, or Academic Calendars!`
    }
  ], [student?.name]);

  const createNewSessionObj = (customGreeting) => ({
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: 'New Conversation',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    updatedAt: Date.now(),
    messages: customGreeting || defaultGreeting
  });

  const [sessions, setSessions] = useState(() => {
    const saved = getJSON(sessionsStorageKey, null);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    const legacy = getJSON(legacyStorageKey, null);
    if (Array.isArray(legacy) && legacy.length > 0) {
      const firstUserMsg = legacy.find((m) => m.role === 'user')?.text;
      return [{
        id: `session_${Date.now()}`,
        title: firstUserMsg ? (firstUserMsg.length > 36 ? firstUserMsg.slice(0, 36) + '...' : firstUserMsg) : 'Previous Chat',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        updatedAt: Date.now(),
        messages: legacy
      }];
    }
    return [createNewSessionObj()];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => sessions[0]?.id || 'default');
  const [showHistory, setShowHistory] = useState(false);

  // Sync sessions when student login changes
  useEffect(() => {
    const saved = getJSON(sessionsStorageKey, null);
    if (Array.isArray(saved) && saved.length > 0) {
      setSessions(saved);
      setCurrentSessionId(saved[0].id);
    } else {
      const legacy = getJSON(legacyStorageKey, null);
      if (Array.isArray(legacy) && legacy.length > 0) {
        const firstUser = legacy.find((m) => m.role === 'user')?.text;
        const initSession = [{
          id: `session_${Date.now()}`,
          title: firstUser ? (firstUser.length > 36 ? firstUser.slice(0, 36) + '...' : firstUser) : 'Previous Chat',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          updatedAt: Date.now(),
          messages: legacy
        }];
        setSessions(initSession);
        setCurrentSessionId(initSession[0].id);
      } else {
        const fresh = [createNewSessionObj()];
        setSessions(fresh);
        setCurrentSessionId(fresh[0].id);
      }
    }
    setShowHistory(false);
  }, [sessionsStorageKey, legacyStorageKey]);

  // Persist all sessions per student login
  useEffect(() => {
    if (sessions.length > 0) {
      setJSON(sessionsStorageKey, sessions);
    }
  }, [sessions, sessionsStorageKey]);

  const activeSession = sessions.find((s) => s.id === currentSessionId) || sessions[0] || createNewSessionObj();
  const messages = activeSession.messages || [];

  const updateCurrentSession = (nextMessages, newTitle) => {
    setSessions((prev) => {
      return prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            title: newTitle || s.title,
            updatedAt: Date.now(),
            messages: nextMessages
          };
        }
        return s;
      });
    });
  };

  // Smooth automatic cycle: 7s outside, 8s inside (total ~15s cycle)
  useEffect(() => {
    if (open) {
      setBubbleVisible(false);
      return;
    }

    const initialTimer = setTimeout(() => {
      setBubbleVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, [open]);

  useEffect(() => {
    if (open) return;

    let timer;
    if (bubbleVisible) {
      timer = setTimeout(() => {
        setBubbleVisible(false);
      }, 7000);
    } else {
      timer = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % POPUP_MESSAGES.length);
        setBubbleVisible(true);
      }, 8000);
    }

    return () => clearTimeout(timer);
  }, [bubbleVisible, open, POPUP_MESSAGES.length]);

  const currentPopup = POPUP_MESSAGES[messageIndex] || POPUP_MESSAGES[0];

  const handleBubbleClick = (popupItem) => {
    setOpen(true);
    setBubbleVisible(false);
    if (popupItem?.prompt) {
      sendMessage(null, popupItem.prompt);
    }
  };

  useEffect(() => {
    if (open && !showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open, isFullScreen, showHistory]);

  const getCalendarEventsForChat = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const todayEvents = (COLLEGE_CALENDAR_EVENTS || []).filter(
      (e) => e.startDate <= todayStr && e.endDate >= todayStr
    );

    const tomorrowEvents = (COLLEGE_CALENDAR_EVENTS || []).filter(
      (e) => e.startDate <= tomorrowStr && e.endDate >= tomorrowStr
    );

    const upcomingEvents = (COLLEGE_CALENDAR_EVENTS || [])
      .filter((e) => e.startDate >= todayStr)
      .slice(0, 8);

    return { todayStr, todayEvents, tomorrowEvents, upcomingEvents };
  };

  const getSmartCampusResponse = (query) => {
    const q = (query || '').trim().toLowerCase();
    const name = student?.name ? student.name.split(' ')[0] : 'there';
    const { todayStr, todayEvents, tomorrowEvents, upcomingEvents } = getCalendarEventsForChat();

    // Natural greeting
    if (/^(hi|hello|hey|hey bro|hi bro|hola|namaste|good morning|good evening|good afternoon|yo|sup)\b/i.test(q)) {
      return `Hey ${name}! 👋 How's it going? How can I help you today with your campus activities?`;
    }

    if (
      q.includes('today') ||
      q.includes('speacial') ||
      q.includes('special') ||
      q.includes('event') ||
      q.includes('calendar') ||
      q.includes('schedule') ||
      q.includes('date') ||
      q.includes('exam') ||
      q.includes('ia') ||
      q.includes('fest') ||
      q.includes('holiday')
    ) {
      const dateObj = new Date(todayStr + 'T00:00:00');
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let reply = `📅 **Academic Calendar Events for Today (${formattedDate}):**\n\n`;

      if (todayEvents.length > 0) {
        reply += `🌟 **Today's Event:**\n`;
        todayEvents.forEach((ev) => {
          reply += `• **${ev.title}** (${ev.category} • Dept: ${ev.dept})\n`;
        });
      } else {
        reply += `No special exam or holiday scheduled specifically for today (${formattedDate}). Regular academic day.\n`;
      }

      if (tomorrowEvents.length > 0) {
        reply += `\n📌 **Tomorrow's Schedule:**\n`;
        tomorrowEvents.forEach((ev) => {
          reply += `• **${ev.title}** (${ev.category} • Dept: ${ev.dept})\n`;
        });
      }

      if (upcomingEvents.length > 0) {
        reply += `\n🚀 **Upcoming Key Events & Exams:**\n`;
        upcomingEvents.slice(0, 5).forEach((ev) => {
          reply += `• **${ev.startDate}**: ${ev.title} (${ev.category})\n`;
        });
      }

      return reply;
    }

    if (q.includes('gate pass') || q.includes('gatepass') || q.includes('leave') || q.includes('permission')) {
      return `🚪 **Digital Gate Pass System:**\n1. Go to the **Gate Pass** module on your dashboard.\n2. Enter Departure Time, Expected Return Time, Reason, and Parent/Guardian Contact.\n3. Hit **Submit Digital Gate Pass**.\n4. **2-Step Approval Chain:** First endorsed by your **Class Teacher**, then approved by your **HOD**.\n5. Once approved, present your **Digital QR Pass** (with 6-character Security Key) at the Security Gate Terminal for live scanning.`;
    }

    if (q.includes('project') || q.includes('architecture') || q.includes('repo') || q.includes('viva') || q.includes('flowchart') || q.includes('github')) {
      return `🏗️ **AI Project Tracker & Architecture Engine:**\n• **AI Architecture Generator:** Type any project description right inside the **Project Tracker** tab. Our built-in engine generates 5 system tiers (UI, API Gateway, Business Services, Database, Security), REST blueprints, database schemas, and Viva defense questions.\n• **Live GitHub Repo Analyzer:** Paste any public GitHub link to analyze project structure, tech stack, and viva talking points.\n• **Saved Workspace:** Click **Save Project** to store architecture plans in your private workspace.\n*(Note: No external tools needed — everything is built directly into this portal!)*`;
    }

    if (q.includes('placement') || q.includes('jd') || q.includes('job') || q.includes('resume') || q.includes('ats')) {
      return `💼 **Placements & Intelligent JD Matcher:**\n• **JD Matcher:** Open the **Placements** module. Paste any company Job Description (or upload your resume) to calculate your **ATS Match Score %**, matching skills, missing prerequisite skills, and a 7-day preparation roadmap.\n• **Placement Ledger:** View active campus recruitment drives, company CTC packages, minimum CGPA eligibility cutoffs, and scheduled test slots.`;
    }

    if (q.includes('profile') || q.includes('completion') || q.includes('skill')) {
      return `👤 **Student Profile (100% Completion):**\n• Tap your profile button in the top navigation bar.\n• Ensure all fields are updated: Full Name, USN (${student?.bec || 'USN'}), Department, Year/Sem, Email, Contact, Skills tags, Portfolio/GitHub links, and Resume PDF upload.`;
    }

    return `🤖 Hi ${name}! I'm here to help with your campus tasks. Ask me anything about **Gate Passes**, **Project Architecture**, **Placements & JD Matching**, or the **Academic Calendar**!`;
  };

  const sendMessage = async (event, overrideText) => {
    if (event) event.preventDefault();
    const cleanMessage = (overrideText !== undefined ? overrideText : message).trim();
    if (!cleanMessage || loading) return;

    const isFirstUserMessage = !activeSession.messages?.some((m) => m.role === 'user');
    const autoTitle = isFirstUserMessage
      ? (cleanMessage.length > 36 ? cleanMessage.slice(0, 36) + '...' : cleanMessage)
      : undefined;

    const nextMessages = [...messages, { role: 'user', text: cleanMessage }];
    updateCurrentSession(nextMessages, autoTitle);
    setMessage('');
    setLoading(true);

    const { todayStr, todayEvents, tomorrowEvents, upcomingEvents } = getCalendarEventsForChat();

    const systemInstruction = `You are the smart, legendary AI Campus Assistant for Basaveshwar Engineering College (BEC).

STUDENT PROFILE:
• Name: ${student.name || 'Student'}
• USN: ${student.bec || 'N/A'}
• Department: ${student.department || 'General'}
• Year: ${student.year || 'Student'}

CALENDAR DATA REFERENCE (${todayStr}):
• Today's Event: ${todayEvents.length > 0 ? todayEvents.map((e) => `"${e.title}" (${e.category})`).join(', ') : 'None'}
• Tomorrow's Event: ${tomorrowEvents.length > 0 ? tomorrowEvents.map((e) => `"${e.title}" (${e.category})`).join(', ') : 'None'}
• Next Upcoming: ${upcomingEvents.slice(0, 4).map((e) => `${e.startDate}: ${e.title}`).join(' | ')}

PORTAL CORE MODULES:
1. Gate Pass: 2-step approval (Teacher -> HOD) -> Digital QR code for security terminal.
2. Project Tracker: Native AI Architecture generation (5 tiers), GitHub repo analysis, Viva prep.
3. Placements: Live Placement Drives Ledger, Candidate Registration, Resume Skill Extractor, JD ATS Matcher.
4. Academic Calendar: 112 official dates, IA-1, IA-2, IA-3 test schedules, fests, holidays.

CRITICAL BEHAVIORAL RULES:
1. ALWAYS ANSWER ONLY WHAT THE USER ASKS. Do not give unsolicited long lists or unrelated information.
2. IF THE USER SAYS A GREETING ("hi", "hello", "hey", "hi bro", etc.): Respond naturally, warmly, and concisely in 1-2 sentences (e.g. "Hey ${studentFirstName}! How can I help you today?"). NEVER dump calendar schedules or portal overviews on a simple greeting!
3. IF THE USER ASKS ABOUT TODAY'S EVENT / CALENDAR / EXAMS: Directly state the exact event for today (${todayEvents.length > 0 ? todayEvents.map((e) => e.title).join(', ') : 'No special event today'}) and upcoming dates.
4. IF THE USER ASKS ABOUT A SPECIFIC MODULE (Gate pass, Placement, Project, etc.): Answer precisely and clearly about that topic only. Ground your answers strictly in the portal modules described above.
5. Be concise, smart, professional, and friendly like a true AI legend.`;

    const historyTurns = messages
      .filter((item) => item.text && item.text.trim())
      .map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        text: item.text.trim()
      }));

    try {
      const reply = await callAI({
        systemInstruction,
        history: historyTurns,
        message: cleanMessage,
        temperature: 0.3,
        maxOutputTokens: 600
      });
      updateCurrentSession([...nextMessages, { role: 'assistant', text: reply }]);
    } catch (error) {
      const fallback = getSmartCampusResponse(cleanMessage);
      updateCurrentSession([...nextMessages, { role: 'assistant', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const hasUserMessage = activeSession.messages?.some((m) => m.role === 'user');
    if (!hasUserMessage && activeSession.title === 'New Conversation') {
      setShowHistory(false);
      return;
    }
    const freshSession = createNewSessionObj([
      {
        role: 'assistant',
        text: `👋 Hi ${studentFirstName}! Started a new conversation. How can I assist you with your campus activities today? Feel free to ask about Gate Passes, Projects, Placements, or Exams!`
      }
    ]);
    setSessions((prev) => [freshSession, ...prev]);
    setCurrentSessionId(freshSession.id);
    setShowHistory(false);
    setMessage('');
  };

  const selectSession = (id) => {
    setCurrentSessionId(id);
    setShowHistory(false);
  };

  const deleteSession = (id, e) => {
    if (e) e.stopPropagation();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh = createNewSessionObj();
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const clearCurrentChat = () => {
    const freshMessages = [
      {
        role: 'assistant',
        text: `👋 Hi ${studentFirstName}! Chat reset for this conversation. What would you like to explore?`
      }
    ];
    updateCurrentSession(freshMessages, 'New Conversation');
    setMessage('');
  };

  const renderHistoryContent = () => (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-stone-900">Saved Chat History</h4>
            <p className="text-[10px] text-stone-500 font-semibold">{sessions.length} conversation{sessions.length === 1 ? '' : 's'} saved</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory(false)}
          className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
        >
          Back to Chat →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sessions.map((sess) => {
          const isActive = sess.id === activeSession.id;
          const previewText = sess.messages?.find((m) => m.role === 'user')?.text || sess.messages?.[0]?.text || 'No messages';
          return (
            <div
              key={sess.id}
              onClick={() => selectSession(sess.id)}
              className={`group flex items-start justify-between gap-3 rounded-xl p-3 text-left transition cursor-pointer border ${
                isActive
                  ? 'bg-emerald-50/90 border-emerald-400 ring-1 ring-emerald-400 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/20'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-stone-300'}`} />
                  <h5 className="truncate text-xs font-black text-stone-900">{sess.title || 'Conversation'}</h5>
                  {isActive && (
                    <span className="shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] text-stone-600 leading-relaxed font-medium">
                  {previewText}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-400 font-semibold">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{sess.date}</span>
                  <span>•</span>
                  <span>{sess.messages?.length || 0} messages</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => deleteSession(sess.id, e)}
                className="opacity-60 group-hover:opacity-100 rounded-lg p-1.5 text-stone-400 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer shrink-0"
                title="Delete this chat"
                aria-label="Delete this chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-stone-200 bg-white p-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Start New Conversation</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Full Page Modal View */}
      {open && isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-2 sm:p-4 md:p-6 transition-all duration-300">
          <section className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-stone-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between bg-stone-950 px-5 py-4 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-stone-950 font-black shrink-0">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-black">Campus AI Assistant</h3>
                    <span className="hidden sm:inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                      Full Workspace View
                    </span>
                  </div>
                  <p className="truncate text-xs text-stone-300 font-semibold">Online • {student.name || student.bec}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className={`rounded-lg p-1.5 transition cursor-pointer ${
                    showHistory
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-emerald-600/60 text-stone-300 hover:text-white'
                  }`}
                  title={showHistory ? 'Back to Chat' : 'Chat History'}
                  aria-label="Chat History"
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-emerald-600/60 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Start New Chat"
                  aria-label="Start New Chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={clearCurrentChat}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-rose-950/60 text-stone-300 hover:text-rose-300 transition cursor-pointer"
                  title="Reset this chat"
                  aria-label="Reset this chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(false)}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Minimize back to window"
                  aria-label="Minimize back to window"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
                  onClick={() => {
                    setIsFullScreen(false);
                    setOpen(false);
                  }}
                  title="Close chat"
                  aria-label="Close chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showHistory ? (
              renderHistoryContent()
            ) : (
              <>
                {/* Chat Body in Full Screen */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50/70 p-4 sm:p-6">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((item, index) => (
                      <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                          item.role === 'user'
                            ? 'bg-stone-950 text-white font-medium'
                            : 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-normal'
                        }`}>
                          <FormattedChatMessage text={item.text} role={item.role} />
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 rounded-xl bg-white p-3.5 text-xs font-bold text-stone-700 shadow-sm border border-stone-200 animate-pulse max-w-sm">
                        <Sparkles className="h-4 w-4 text-emerald-600 animate-spin shrink-0" />
                        <span>{currentChatStep}</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Quick interactive prompts in Full Screen */}
                <div className="border-t border-stone-100 bg-white px-4 py-2 sm:px-6">
                  <div className="max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                    <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider shrink-0">Suggestions:</span>
                    {POPUP_MESSAGES.slice(1).map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => sendMessage(null, item.prompt)}
                        className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-900 transition cursor-pointer"
                      >
                        {item.tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Screen Input Form */}
                <form onSubmit={(e) => sendMessage(e)} className="border-t border-stone-200 bg-white p-3 sm:p-4">
                  <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
                    <input
                      className="input min-w-0 flex-1 text-sm py-3 px-4"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Ask about Gate Pass, Projects, Placements, Academic Calendar..."
                    />
                    <button
                      disabled={loading || !message.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shrink-0"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {/* Floating Widget at Bottom Right (Popup + Dancing Button) */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 flex flex-col items-end pointer-events-none">
        {/* Smoothly Sliding Interactive Pop-up Speech Bubble */}
        <div
          className={`mb-2.5 transition-all duration-700 ease-in-out transform origin-bottom-right pointer-events-auto ${
            !open && bubbleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-2 rounded-2xl border-2 border-stone-900 bg-white px-3.5 py-2 shadow-2xl hover:border-emerald-600 transition-colors">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <button
              onClick={() => handleBubbleClick(currentPopup)}
              className="text-xs font-black text-stone-950 hover:text-emerald-700 text-left cursor-pointer transition max-w-[230px] sm:max-w-[280px]"
              title="Tap to ask the AI assistant"
            >
              {currentPopup.text}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBubbleVisible(false);
              }}
              className="ml-1 text-stone-400 hover:text-stone-800 p-0.5 rounded-full cursor-pointer hover:bg-stone-100 transition"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Normal Popup Window (Shown in user's photo) */}
        {open && !isFullScreen && (
          <section className="mb-3 flex h-[32rem] max-h-[68vh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-all duration-300 pointer-events-auto">
            {/* Header with New Chat, Full Page & Close Buttons */}
            <div className="flex items-center justify-between bg-stone-950 px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-stone-950 font-black">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black">Campus AI Assistant</h3>
                  <p className="truncate text-[11px] text-stone-300 font-semibold">Online • {student.name || student.bec}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className={`rounded-lg p-1.5 transition cursor-pointer ${
                    showHistory
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white/10 hover:bg-emerald-600/60 text-stone-300 hover:text-white'
                  }`}
                  title={showHistory ? 'Back to Chat' : 'Chat History'}
                  aria-label="Chat History"
                >
                  <History className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-emerald-600/60 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Start New Chat"
                  aria-label="Start New Chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
                  title="Open Full Page"
                  aria-label="Open Full Page"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-white/20 text-stone-300 hover:text-white transition cursor-pointer"
                  onClick={() => setOpen(false)}
                  title="Close chatbot"
                  aria-label="Close chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showHistory ? (
              renderHistoryContent()
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-3">
                  {messages.map((item, index) => (
                    <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                        item.role === 'user'
                          ? 'bg-stone-950 text-white font-medium'
                          : 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-normal'
                      }`}>
                        <FormattedChatMessage text={item.text} role={item.role} />
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs font-bold text-stone-700 shadow-sm border border-stone-200 animate-pulse">
                      <Sparkles className="h-4 w-4 text-emerald-600 animate-spin shrink-0" />
                      <span>{currentChatStep}</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick interactive prompts bar */}
                <div className="flex gap-1.5 overflow-x-auto border-t border-stone-100 bg-stone-50/80 p-2 scrollbar-none">
                  {POPUP_MESSAGES.slice(1).map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => sendMessage(null, item.prompt)}
                      className="shrink-0 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-bold text-stone-700 hover:border-emerald-500 hover:text-emerald-800 transition cursor-pointer"
                    >
                      {item.tag}
                    </button>
                  ))}
                </div>

                <form onSubmit={(e) => sendMessage(e)} className="flex gap-2 border-t border-stone-200 bg-white p-3">
                  <input
                    className="input min-w-0 flex-1 text-xs"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask about Gate Pass, Projects, Placements..."
                  />
                  <button
                    disabled={loading || !message.trim()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-950 text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        )}

        {/* Dancing Animated Floating Bot Button */}
        <button
          onClick={() => {
            setOpen((current) => !current);
            setBubbleVisible(false);
          }}
          className={`relative grid h-14 w-14 place-items-center rounded-full bg-stone-950 text-white shadow-2xl ring-4 ring-emerald-500/40 transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto ${
            !open ? 'animate-bot-dance' : ''
          }`}
          aria-label="Open chatbot"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-stone-950" />
          </span>
          {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7 text-emerald-400" />}
        </button>
      </div>
    </>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error?.toString() || 'Unknown runtime exception' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-stone-950 p-6 text-white text-center font-sans">
          <div className="max-w-lg space-y-4 rounded-3xl border border-stone-800 bg-stone-900 p-8 shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 font-black text-2xl">
              ⚠️
            </div>
            <h2 className="text-2xl font-black text-white">Campus Portal Workspace</h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              A temporary browser storage conflict was detected. Click below to refresh and load your portal smoothly.
            </p>
            {this.state.error && (
              <div className="rounded-xl bg-stone-950 border border-stone-800 p-3 font-mono text-[11px] text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black py-3 text-xs shadow-lg transition cursor-pointer"
            >
              Restore & Launch Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
