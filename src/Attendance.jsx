import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  Percent,
  Clock,
  Filter,
  Check,
  X,
  Sparkles,
  Award,
  BookOpen,
  PieChart,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

// All 8 semesters with proper values and display labels
export const SEMESTER_OPTIONS = [
  { value: '1st Sem', label: 'I Year - 1st Semester', year: 'I Year' },
  { value: '2nd Sem', label: 'I Year - 2nd Semester', year: 'I Year' },
  { value: '3rd Sem', label: 'II Year - 3rd Semester', year: 'II Year' },
  { value: '4th Sem', label: 'II Year - 4th Semester', year: 'II Year' },
  { value: '5th Sem', label: 'III Year - 5th Semester', year: 'III Year' },
  { value: '6th Sem', label: 'III Year - 6th Semester', year: 'III Year' },
  { value: '7th Sem', label: 'IV Year - 7th Semester', year: 'IV Year' },
  { value: '8th Sem', label: 'IV Year - 8th Semester', year: 'IV Year' },
];

// Subjects per branch per semester
export const BRANCH_SEM_SUBJECTS = {
  CSE: {
    '1st Sem': ['Engineering Mathematics I', 'Engineering Physics', 'C Programming', 'Engineering Drawing', 'Environmental Science'],
    '2nd Sem': ['Engineering Mathematics II', 'Engineering Chemistry', 'Data Structures', 'Basic Electronics', 'Communication Skills'],
    '3rd Sem': ['Discrete Mathematics', 'Digital Design', 'Object Oriented Programming', 'Data Structures & Algorithms', 'Computer Organization'],
    '4th Sem': ['Graph Theory & Algorithms', 'Microprocessors', 'Operating Systems', 'Database Management Systems', 'Software Engineering'],
    '5th Sem': ['Design & Analysis of Algorithms', 'Computer Networks', 'Formal Languages & Automata', 'Web Technologies', 'Elective I'],
    '6th Sem': ['Compiler Design', 'Information & Network Security', 'Cloud Computing', 'Machine Learning', 'Elective II'],
    '7th Sem': ['Artificial Intelligence', 'Full Stack Development', 'Big Data Analytics', 'Project Management', 'Elective III'],
    '8th Sem': ['Deep Learning & AI', 'Internet of Things', 'Industry Internship', 'Major Project', 'Seminar'],
  },
  ISE: {
    '1st Sem': ['Engineering Mathematics I', 'Engineering Physics', 'C Programming', 'Engineering Drawing', 'Environmental Science'],
    '2nd Sem': ['Engineering Mathematics II', 'Engineering Chemistry', 'Data Structures', 'Basic Electronics', 'Communication Skills'],
    '3rd Sem': ['Discrete Mathematics', 'Digital Design', 'OOP with Java', 'Data Structures & Algorithms', 'Computer Organization'],
    '4th Sem': ['Software Engineering & Testing', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Graph Theory'],
    '5th Sem': ['Information & Network Security', 'Cloud Computing Services', 'Data Warehousing & Mining', 'Web Technologies', 'Elective I'],
    '6th Sem': ['Machine Learning', 'Mobile Application Development', 'Software Architecture', 'Distributed Systems', 'Elective II'],
    '7th Sem': ['Artificial Intelligence', 'Big Data Analytics', 'Project Management', 'DevOps & Agile', 'Elective III'],
    '8th Sem': ['Cyber Security', 'Internet of Things', 'Industry Internship', 'Major Project', 'Seminar'],
  },
  ECE: {
    '1st Sem': ['Engineering Mathematics I', 'Engineering Physics', 'C Programming', 'Engineering Drawing', 'Environmental Science'],
    '2nd Sem': ['Engineering Mathematics II', 'Engineering Chemistry', 'Basic Electronics', 'Circuit Theory', 'Communication Skills'],
    '3rd Sem': ['Network Analysis', 'Electronic Devices & Circuits', 'Digital Electronics', 'Signals & Systems', 'Engineering Mathematics III'],
    '4th Sem': ['Analog Communication', 'Linear Integrated Circuits', 'Microcontrollers & ARM', 'Electromagnetic Fields', 'Control Systems Engineering'],
    '5th Sem': ['Digital Signal Processing', 'VLSI Design & Embedded Systems', 'Digital Communication', 'Wireless Communication', 'Elective I'],
    '6th Sem': ['RF & Microwave Engineering', 'Optical Fiber Communication', 'Electromagnetic Waves', 'Image Processing', 'Elective II'],
    '7th Sem': ['Antenna & Wave Propagation', 'IoT & Embedded Systems', '5G Networks', 'VLSI Testing', 'Elective III'],
    '8th Sem': ['Satellite Communication', 'Industry Internship', 'Major Project', 'Seminar', 'Elective IV'],
  },
  EEE: {
    '1st Sem': ['Engineering Mathematics I', 'Engineering Physics', 'C Programming', 'Engineering Drawing', 'Environmental Science'],
    '2nd Sem': ['Engineering Mathematics II', 'Engineering Chemistry', 'Basic Electrical', 'Circuit Theory', 'Communication Skills'],
    '3rd Sem': ['Network Analysis', 'Electronic Devices', 'Digital Electronics', 'Electrical Machines I', 'Engineering Mathematics III'],
    '4th Sem': ['Electrical Machines II', 'Microprocessors & Interfacing', 'Control Systems', 'Transmission & Distribution', 'Signals & Systems'],
    '5th Sem': ['Power Electronics & Drives', 'Power Systems I', 'Electrical Power Transmission', 'Renewable Energy Technology', 'Elective I'],
    '6th Sem': ['Power Systems II', 'High Voltage Engineering', 'Industrial Drives', 'PLC & SCADA', 'Elective II'],
    '7th Sem': ['Electric Vehicles & Storage', 'Smart Grid', 'Power System Protection', 'Energy Audit', 'Elective III'],
    '8th Sem': ['Power Quality', 'Industry Internship', 'Major Project', 'Seminar', 'Elective IV'],
  },
  MECH: {
    '1st Sem': ['Engineering Mathematics I', 'Engineering Physics', 'C Programming', 'Engineering Drawing', 'Environmental Science'],
    '2nd Sem': ['Engineering Mathematics II', 'Engineering Chemistry', 'Basic Mechanics', 'Engineering Graphics', 'Communication Skills'],
    '3rd Sem': ['Materials Science', 'Thermodynamics', 'Manufacturing Technology I', 'Strength of Materials', 'Engineering Mathematics III'],
    '4th Sem': ['Fluid Mechanics & Machinery', 'Manufacturing Technology II', 'Kinematics of Machinery', 'Heat Transfer', 'Metrology'],
    '5th Sem': ['Design of Machine Elements', 'Dynamics of Machinery', 'Heat & Mass Transfer', 'CAD/CAM', 'Elective I'],
    '6th Sem': ['Finite Element Analysis', 'Robotics & Automation', 'Industrial Engineering', 'Automobile Engineering', 'Elective II'],
    '7th Sem': ['Mechatronics', '3D Printing & Additive Manufacturing', 'Project Management', 'Lean Manufacturing', 'Elective III'],
    '8th Sem': ['Industry 4.0', 'Industry Internship', 'Major Project', 'Seminar', 'Elective IV'],
  },
};

// Get subjects for a branch + semester combination
export function getSubjectsForSem(branch, sem) {
  const cleanBranch = String(branch || '').trim().toUpperCase();
  const cleanSem = String(sem || '').trim();
  return BRANCH_SEM_SUBJECTS[cleanBranch]?.[cleanSem] || DEFAULT_SUBJECTS;
}

// Legacy fallback: get all unique subjects for a branch (for student view)
export const BRANCH_SUBJECTS = Object.fromEntries(
  Object.entries(BRANCH_SEM_SUBJECTS).map(([branch, sems]) => [
    branch,
    [...new Set(Object.values(sems).flat())]
  ])
);

export const DEFAULT_SUBJECTS = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'Computer Networks',
  'Database Management Systems',
  'Web Technologies'
];

export function getSubjectsForBranch(branch) {
  const clean = String(branch || '').trim().toUpperCase();
  return BRANCH_SUBJECTS[clean] || DEFAULT_SUBJECTS;
}

const YEAR_TO_DEFAULT_SEM = {
  'I Year': '1st Sem',
  'II Year': '3rd Sem',
  'III Year': '5th Sem',
  'IV Year': '7th Sem'
};

// ─── 1. STUDENT ATTENDANCE PORTAL VIEW ──────────────────────────────────────────
export function StudentAttendanceView({ student, apiFetch }) {
  const currentBec = (student?.bec || '').toUpperCase();
  const currentBranch = (student?.department || student?.branch || 'CSE').toUpperCase();
  const defaultSem = student?.semester || YEAR_TO_DEFAULT_SEM[student?.year] || '7th Sem';
  const [activeSem, setActiveSem] = useState(defaultSem);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  useEffect(() => {
    if (student?.semester) {
      setActiveSem(student.semester);
    } else if (student?.year && YEAR_TO_DEFAULT_SEM[student.year]) {
      setActiveSem(YEAR_TO_DEFAULT_SEM[student.year]);
    }
  }, [student?.semester, student?.year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/db/attendance/student/${encodeURIComponent(currentBec)}`);
      if (res?.records) {
        setRecords(res.records);
      }
    } catch (err) {
      console.warn('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBec) {
      fetchAttendance();
    }
  }, [currentBec]);

  // Derive unique months present in records
  const availableMonths = useMemo(() => {
    const set = new Set();
    records.forEach((r) => {
      if (r.date) {
        const month = r.date.substring(0, 7); // 'YYYY-MM'
        set.add(month);
      }
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // Filtered records by month and subject
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchMonth = selectedMonth === 'ALL' || (r.date && r.date.startsWith(selectedMonth));
      const matchSubject = selectedSubject === 'ALL' || r.subject === selectedSubject;
      return matchMonth && matchSubject;
    });
  }, [records, selectedMonth, selectedSubject]);

  // Exact subjects for the selected semester (max 5-8 subjects per semester)
  const semesterSubjects = useMemo(() => {
    return getSubjectsForSem(currentBranch, activeSem);
  }, [currentBranch, activeSem]);

  // Calculate Subject-wise Breakdown — strictly for the active semester's subjects
  const subjectStats = useMemo(() => {
    return semesterSubjects.map((subName) => {
      const subRecords = records.filter((r) => r.subject === subName);
      const total = subRecords.length;
      const present = subRecords.filter((r) => r.status === 'PRESENT').length;
      const absent = total - present;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
      return {
        subject: subName,
        total,
        present,
        absent,
        percentage
      };
    });
  }, [records, semesterSubjects]);

  // Calculate Overall Statistics (for active semester subjects or all records)
  const overallStats = useMemo(() => {
    const semRecords = records.filter(r => semesterSubjects.includes(r.subject) || r.year_sem === activeSem);
    const targetRecords = semRecords.length > 0 ? semRecords : records;
    const total = targetRecords.length;
    const present = targetRecords.filter((r) => r.status === 'PRESENT').length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, absent, percentage };
  }, [records, semesterSubjects, activeSem]);

  // Calculate Monthly Breakdown
  const monthlyStats = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      if (!r.date) return;
      const monthKey = r.date.substring(0, 7); // '2026-09'
      const cur = map.get(monthKey) || { total: 0, present: 0, absent: 0 };
      cur.total += 1;
      if (r.status === 'PRESENT') cur.present += 1;
      else cur.absent += 1;
      map.set(monthKey, cur);
    });

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([monthKey, data]) => {
        const [year, monthNum] = monthKey.split('-');
        const dateObj = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1, 1);
        const monthName = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const pct = data.total > 0 ? Math.round((data.present / data.total) * 100) : 100;
        return {
          monthKey,
          monthName,
          total: data.total,
          present: data.present,
          absent: data.absent,
          percentage: pct
        };
      });
  }, [records]);

  const isLowAttendance = overallStats.total > 0 && overallStats.percentage < 75;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <BookOpenCheck className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#264055] tracking-tight font-serif">
                Attendance Ledger
              </h2>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                {currentBranch} • {activeSem}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Live Classroom Attendance Tracking • VTU Minimum 75% Requirement
            </p>
          </div>
        </div>

        {/* Actions & Semester Selector */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={activeSem}
              onChange={(e) => setActiveSem(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#264055] focus:outline-none cursor-pointer"
            >
              {SEMESTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchAttendance}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#264055] text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Warning Notice Banner if < 75% */}
      {isLowAttendance && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 flex items-start gap-3 shadow-xs"
        >
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-black text-rose-950 uppercase tracking-wide">
              Attendance Alert: Below 75% Threshold ({overallStats.percentage}%)
            </h4>
            <p className="mt-0.5 text-rose-800/90 font-medium">
              Your overall attendance is currently below the mandatory 75% criteria. Please ensure regular attendance in upcoming lectures to maintain examination eligibility.
            </p>
          </div>
        </motion.div>
      )}

      {/* Overall Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Cumulative Overall Percentage */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Overall Attendance
            </span>
            <div className={`p-1.5 rounded-xl ${overallStats.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black font-serif ${overallStats.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {overallStats.total === 0 ? '100%' : `${overallStats.percentage}%`}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {overallStats.percentage >= 75 ? 'Eligible' : 'Shortage'}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overallStats.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(overallStats.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Classes Attended */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Classes Present
            </span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-teal-700 font-serif">
              {overallStats.present}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1.5">Sessions</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Active verified classroom attendances
          </p>
        </div>

        {/* Classes Missed / Absent */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Classes Missed
            </span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-700 font-serif">
              {overallStats.absent}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1.5">Sessions</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Unattended lectures logged by teachers
          </p>
        </div>

        {/* Total Conducted Lectures */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Total Lectures
            </span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-blue-900 font-serif">
              {overallStats.total}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1.5">Conducted</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 font-medium">
            Across all enrolled branch subjects
          </p>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-[#264055] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#3B6280]" />
              <span>Subject-Wise Attendance Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Individual course compliance for {currentBranch} ({activeSem})
            </p>
          </div>
          <span className="text-xs text-slate-400 font-bold self-start sm:self-auto">
            {subjectStats.length} Subjects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {subjectStats.map((item) => {
            const isSafe = item.percentage >= 75;
            return (
              <div
                key={item.subject}
                className="rounded-2xl border border-slate-100/90 bg-slate-50/50 p-4 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-black text-[#264055] line-clamp-1">
                      {item.subject}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Attended {item.present} of {item.total} lectures
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                      isSafe
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}
                  >
                    {item.total === 0 ? '100%' : `${item.percentage}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Present: {item.present}</span>
                    <span>Missed: {item.absent}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Attendance Breakdown */}
      {monthlyStats.length > 0 && (
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-[#264055] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#3B6280]" />
              <span>Monthly Attendance Trend</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Month-by-month attendance record for {student?.name || 'Student'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthlyStats.map((m) => (
              <div
                key={m.monthKey}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#264055]">{m.monthName}</span>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      m.percentage >= 75
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {m.percentage}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold flex justify-between">
                  <span>Present: {m.present}</span>
                  <span>Absent: {m.absent}</span>
                  <span>Total: {m.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Attendance Logs Filter & Table */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-[#264055] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3B6280]" />
              <span>Session-by-Session History</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Every class logged by professors with date & teacher signature
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {availableMonths.length > 0 && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#264055] focus:outline-none focus:border-[#3B6280]"
              >
                <option value="ALL">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#264055] focus:outline-none focus:border-[#3B6280] max-w-[200px]"
            >
              <option value="ALL">All Subjects</option>
              {getSubjectsForBranch(currentBranch).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / List */}
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <BookOpenCheck className="mx-auto h-10 w-10 opacity-30 text-slate-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              No attendance records logged yet
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              When your class teacher takes attendance for your branch, each session status will appear here live.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Subject / Lecture</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Faculty / Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredRecords.map((rec) => {
                  const isPresent = rec.status === 'PRESENT';
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#264055]">
                        {rec.date}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {rec.subject}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPresent ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {rec.marked_by_name || 'Prof. Class Teacher'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. TEACHER ATTENDANCE PORTAL VIEW (CLASSROOM ATTENDANCE MARKING) ─────────
export function TeacherAttendanceView({ student, apiFetch }) {
  const teacherBec = (student?.bec || 'TEACHER01').toUpperCase();
  const teacherName = student?.name || 'Class Teacher';
  const defaultBranch = (student?.department || 'CSE').toUpperCase();

  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);
  const [selectedSem, setSelectedSem] = useState('7th Sem');
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return getSubjectsForSem(defaultBranch, '7th Sem')[0] || 'Computer Networks';
  });
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Auto-update subject list when branch or semester changes
  useEffect(() => {
    const subs = getSubjectsForSem(selectedBranch, selectedSem);
    setSelectedSubject(subs[0] || '');
  }, [selectedBranch, selectedSem]);


  // Student roster fetched from database for the selected branch
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Marked status for each student in the classroom: { [studentBec]: 'PRESENT' | 'ABSENT' }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // History of attendance recorded
  const [recentSessions, setRecentSessions] = useState([]);

  // Fetch student list whenever branch or semester changes
  useEffect(() => {
    let isMounted = true;
    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await apiFetch('/api/db/students');
        if (res?.students && Array.isArray(res.students) && isMounted) {
          // Filter students by selected branch AND semester
          const filtered = res.students.filter((s) => {
            const isStud = !s.role || s.role === 'student';
            const dept = String(s.department || '').trim().toUpperCase();
            const stuSem = String(s.semester || '').trim();
            const matchBranch = dept === selectedBranch.toUpperCase();
            // Match semester: if student has semester stored, match it; else match by year
            const selectedSemObj = SEMESTER_OPTIONS.find(o => o.value === selectedSem);
            const matchSem = stuSem
              ? stuSem === selectedSem
              : (s.year === selectedSemObj?.year);
            return isStud && matchBranch && matchSem;
          });
          setStudentsList(filtered);

          // Default all to PRESENT for fast classroom UX
          const initialMap = {};
          filtered.forEach((st) => {
            initialMap[st.bec.toUpperCase()] = 'PRESENT';
          });
          setAttendanceMap(initialMap);
        }
      } catch (err) {
        console.warn('Load students error:', err);
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    };

    loadStudents();
    return () => {
      isMounted = false;
    };
  }, [selectedBranch, selectedSem]);


  // Fetch recent attendance history
  const fetchRecentHistory = async () => {
    try {
      const res = await apiFetch(`/api/db/attendance/all?branch=${encodeURIComponent(selectedBranch)}`);
      if (res?.records) {
        setRecentSessions(res.records.slice(0, 50));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchRecentHistory();
  }, [selectedBranch]);

  // Toggle single student status
  const toggleStatus = (bec) => {
    const cleanBec = bec.toUpperCase();
    setAttendanceMap((prev) => ({
      ...prev,
      [cleanBec]: prev[cleanBec] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  // Mark all present / absent
  const markAll = (status) => {
    const updated = {};
    studentsList.forEach((s) => {
      updated[s.bec.toUpperCase()] = status;
    });
    setAttendanceMap(updated);
  };

  // Submit classroom attendance
  const handleSubmitAttendance = async (e) => {
    if (e) e.preventDefault();
    if (studentsList.length === 0) {
      alert(`No registered students found in ${selectedBranch} Department to mark.`);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage('');

      const recordsToSubmit = studentsList.map((st) => ({
        bec: st.bec.toUpperCase(),
        name: st.name || st.bec,
        status: attendanceMap[st.bec.toUpperCase()] || 'PRESENT'
      }));

      const payload = {
        branch: selectedBranch,
        yearSem: selectedSem,
        subject: selectedSubject,
        date: attendanceDate,
        teacherBec,
        teacherName,
        records: recordsToSubmit
      };

      const res = await apiFetch('/api/db/attendance/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res?.success) {
        const presentCount = recordsToSubmit.filter((r) => r.status === 'PRESENT').length;
        setSubmitMessage(
          `✅ Attendance saved successfully for ${recordsToSubmit.length} students (${presentCount} Present, ${recordsToSubmit.length - presentCount} Absent).`
        );
        fetchRecentHistory();
        setTimeout(() => setSubmitMessage(''), 5000);
      } else {
        alert(res?.error || 'Failed to record attendance.');
      }
    } catch (err) {
      alert(err.message || 'Error submitting attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPresentCount = Object.values(attendanceMap).filter((v) => v === 'PRESENT').length;
  const currentAbsentCount = studentsList.length - currentPresentCount;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <BookOpenCheck className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#264055] tracking-tight font-serif">
                Classroom Attendance Portal
              </h2>
              <span className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Faculty Access
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Select Branch, Subject & Date to mark attendance directly for classroom lectures.
            </p>
          </div>
        </div>

        {submitMessage && (
          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl animate-fade-in">
            {submitMessage}
          </div>
        )}
      </div>

      {/* Classroom Selection Filter Bar */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#3B6280]" />
          <span>Step 1: Select Classroom Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Branch Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Department / Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value.toUpperCase())}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-bold text-[#264055] focus:outline-none focus:border-[#3B6280] cursor-pointer"
            >
              {Object.keys(BRANCH_SUBJECTS).map((b) => (
                <option key={b} value={b}>
                  {b} Department
                </option>
              ))}
            </select>
          </div>

          {/* 2. Academic Year / Sem */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Semester
            </label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-bold text-[#264055] focus:outline-none focus:border-[#3B6280] cursor-pointer"
            >
              {SEMESTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Subject Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Subject / Course
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-bold text-[#264055] focus:outline-none focus:border-[#3B6280] cursor-pointer"
            >
              {getSubjectsForSem(selectedBranch, selectedSem).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Attendance Date */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Lecture Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm font-bold text-[#264055] focus:outline-none focus:border-[#3B6280]"
            />
          </div>
        </div>
      </div>

      {/* Classroom Student Roster & Live Marking */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-[#264055] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3B6280]" />
              <span>Step 2: Student List ({studentsList.length} Students in {selectedBranch})</span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Click any student to toggle between Present & Absent. Fast batch mark options available below.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll('PRESENT')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition cursor-pointer border border-emerald-200"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('ABSENT')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-black transition cursor-pointer border border-rose-200"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs font-black">
          <span className="rounded-xl bg-emerald-100 text-emerald-900 px-3 py-1 border border-emerald-200">
            ✅ {currentPresentCount} Present
          </span>
          <span className="rounded-xl bg-rose-100 text-rose-900 px-3 py-1 border border-rose-200">
            ❌ {currentAbsentCount} Absent
          </span>
          <span className="text-slate-400 font-bold ml-auto">
            Subject: {selectedSubject}
          </span>
        </div>

        {/* Students Roster Grid */}
        {loadingStudents ? (
          <div className="py-12 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#3B6280] mb-2" />
            <p className="text-xs font-bold text-slate-500">Loading {selectedBranch} student roster...</p>
          </div>
        ) : studentsList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Users className="mx-auto h-10 w-10 opacity-30 text-slate-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              No registered students found in {selectedBranch} department
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Students registered under branch "{selectedBranch}" will automatically appear in this student list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsList.map((st) => {
              const isPresent = attendanceMap[st.bec.toUpperCase()] === 'PRESENT';
              return (
                <div
                  key={st.bec}
                  onClick={() => toggleStatus(st.bec)}
                  className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex items-center justify-between select-none ${
                    isPresent
                      ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 shadow-xs'
                      : 'border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 shadow-xs'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {st.name || 'Student'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono font-bold text-slate-500 mt-0.5">
                      {st.bec} • {st.department || selectedBranch}
                    </p>
                  </div>

                  <div className="shrink-0 ml-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black uppercase transition-transform active:scale-95 ${
                        isPresent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                      }`}
                    >
                      {isPresent ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>{isPresent ? 'PRESENT' : 'ABSENT'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Attendance Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-semibold">
            Records are instantly synced to student portals in real-time.
          </p>

          <button
            type="button"
            onClick={handleSubmitAttendance}
            disabled={submitting || studentsList.length === 0}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#3B6280] hover:bg-[#2c4b64] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{submitting ? 'Saving to Database...' : 'Save & Publish Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Recent History Table for Teacher */}
      {recentSessions.length > 0 && (
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_6px_24px_rgba(38,64,85,0.06)] border border-slate-100 space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-[#264055] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[#3B6280]" />
              <span>Recent Submissions ({selectedBranch} Department)</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Student Name</th>
                  <th className="px-3 py-2">USN / BEC</th>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {recentSessions.slice(0, 15).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-[11px]">{r.date}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{r.student_name}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{r.student_bec}</td>
                    <td className="px-3 py-2 text-slate-600">{r.subject}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          r.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
