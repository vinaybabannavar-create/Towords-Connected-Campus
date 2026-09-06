import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  FileText,
  Github,
  Linkedin,
  Globe,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Sparkles,
  Download,
  ExternalLink,
  Shield,
  Briefcase,
  BookOpenCheck
} from 'lucide-react';

export function calculateProfileCompletion(student) {
  if (!student) return 0;
  let score = 0;
  // 1. Basic details (Name, USN, Department, Year): 20%
  if (student.name?.trim() && student.bec?.trim() && student.department?.trim() && student.year?.trim()) {
    score += 20;
  }
  // 2. College name: 15%
  if (student.college?.trim() || student.collegeName?.trim()) {
    score += 15;
  }
  // 3. Contact details (Email AND/OR Phone): 15%
  if (student.email?.trim() || student.phone?.trim()) {
    score += 15;
  }
  // 4. Skills (at least 1 skill tag): 15%
  if (Array.isArray(student.skills) && student.skills.length > 0) {
    score += 15;
  }
  // 5. Professional links (GitHub, LinkedIn, or Portfolio): 15%
  const hasLinks = Boolean(student.github?.trim() || student.linkedin?.trim() || student.portfolio?.trim());
  if (hasLinks) {
    score += 15;
  }
  // 6. Resume uploaded: 20%
  if (student.resume && (typeof student.resume === 'string' ? student.resume.trim() : student.resume.name)) {
    score += 20;
  }
  return Math.min(100, score);
}

export function getMissingProfileItems(student) {
  if (!student) return ['Full Profile Setup'];
  const missing = [];
  if (!student.college?.trim() && !student.collegeName?.trim()) missing.push('College Name');
  if (!student.email?.trim() && !student.phone?.trim()) missing.push('Email or Phone');
  if (!Array.isArray(student.skills) || student.skills.length === 0) missing.push('Technical Skills');
  if (!student.github?.trim() && !student.linkedin?.trim() && !student.portfolio?.trim()) missing.push('GitHub / LinkedIn / Portfolio');
  if (!student.resume) missing.push('Resume Upload');
  return missing;
}

export function StudentProfileModal({ student, isOpen, onClose, onSave }) {
  const role = student?.role || 'student';
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isHod = role === 'hod';
  const isPo = role === 'po';
  const isGuard = role === 'guard';

  const [formData, setFormData] = useState({
    name: '',
    bec: '',
    college: '',
    department: '',
    year: 'IV Year',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    github: '',
    linkedin: '',
    portfolio: '',
    resume: null,
    // Role-specific fields
    assignedClass: '',
    subjects: '',
    cabin: '',
    specialization: '',
    experience: '',
    officeHours: '',
    division: '',
    gatePost: '',
    shift: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'skills', 'links', 'resume'
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      const isSaved = Boolean(student.isProfileSaved);
      setFormData({
        name: isSaved ? (student.name || '') : '',
        bec: isSaved ? (student.bec || '') : '',
        college: isSaved ? (student.college || student.collegeName || '') : '',
        department: isSaved ? (student.department || '') : '',
        year: student.year || 'IV Year',
        email: student.email || '',
        phone: student.phone || '',
        bio: student.bio || '',
        skills: Array.isArray(student.skills) ? [...student.skills] : [],
        github: student.github || '',
        linkedin: student.linkedin || '',
        portfolio: student.portfolio || '',
        resume: student.resume || null,
        // Role-specific fields (start empty for user input)
        assignedClass: student.assignedClass || '',
        subjects: student.subjects || '',
        cabin: student.cabin || '',
        specialization: student.specialization || '',
        experience: student.experience || '',
        officeHours: student.officeHours || '',
        division: student.division || '',
        gatePost: student.gatePost || '',
        shift: student.shift || ''
      });
      setSaveSuccess(false);
    }
  }, [student, isOpen, isTeacher, isHod, isPo, isGuard]);

  if (!isOpen || !student) return null;

  const completion = calculateProfileCompletion(formData);
  const missingItems = getMissingProfileItems(formData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const clean = skillInput.trim();
    if (!clean) return;
    if (!formData.skills.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, clean]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        resume: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type,
          dataUrl: reader.result,
          uploadedAt: new Date().toLocaleDateString('en-GB')
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({ ...prev, resume: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        ...formData,
        isProfileSaved: true
      });
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-stone-950 to-stone-800 text-emerald-400 font-black shadow-md border border-stone-700">
              {isTeacher ? (
                <BookOpenCheck className="h-6 w-6 text-teal-400" />
              ) : isHod ? (
                <Building2 className="h-6 w-6 text-cyan-400" />
              ) : isPo ? (
                <Briefcase className="h-6 w-6 text-amber-400" />
              ) : isGuard ? (
                <Shield className="h-6 w-6 text-rose-400" />
              ) : (
                <User className="h-6 w-6 text-emerald-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 leading-tight">
                {isTeacher
                  ? 'Class Teacher Profile Setup'
                  : isHod
                  ? 'HOD Profile & Department Setup'
                  : isPo
                  ? 'Placement Officer Profile Setup'
                  : isGuard
                  ? 'Security Officer Setup'
                  : 'Student Profile & Portfolio Setup'}
              </h2>
              <p className="text-xs font-semibold text-stone-500 mt-0.5">
                {isTeacher
                  ? 'Manage your staff ID, assigned class responsibilities, subjects & contact info'
                  : isHod
                  ? 'Manage department leadership details, cabin location & research specialization'
                  : isPo
                  ? 'Manage corporate relations division, placement cell contact & office hours'
                  : isGuard
                  ? 'Manage gate post assignment & shift details'
                  : 'Manage your academic credentials, skills, portfolio links & resume'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student Progress Bar (Only for Student Role) */}
        {isStudent && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  Profile Completion
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                    completion === 100
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {completion === 100 ? '100% Complete' : `${completion}% Completed`}
                </span>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {completion === 100 ? '🎉 All details complete!' : `Needs ${100 - completion}% more`}
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-stone-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  completion === 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500'
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>

            {completion < 100 && missingItems.length > 0 && (
              <p className="text-[11px] font-semibold text-amber-900 flex items-center gap-1 pt-0.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                <span>Pending items: <strong>{missingItems.join(' • ')}</strong></span>
              </p>
            )}
          </div>
        )}

        {/* Section Tabs (Student only) */}
        {isStudent && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-100 shrink-0">
            {[
              ['profile', User, 'Personal & College Info'],
              ['skills', Sparkles, 'Skills & Tech Stack'],
              ['links', Globe, 'Social & Portfolio Links'],
              ['resume', FileText, 'Resume Upload']
            ].map(([tab, Icon, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-stone-950 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* ==================== CLASS TEACHER FORM ==================== */}
          {isTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Staff ID / Employee Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEA001"
                    value={formData.bec}
                    onChange={(e) => handleInputChange('bec', e.target.value.toUpperCase())}
                    className="input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Department / Branch *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, ISE, ECE"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value.toUpperCase())}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Assigned Class Teacher Responsibility *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE - III Year (5th Sem Section A)"
                    value={formData.assignedClass}
                    onChange={(e) => handleInputChange('assignedClass', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Subjects Taught (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures, Operating Systems, Web Technologies"
                  value={formData.subjects}
                  onChange={(e) => handleInputChange('subjects', e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Office Room / Cabin Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Staff Room 102, Block B"
                    value={formData.cabin}
                    onChange={(e) => handleInputChange('cabin', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="teacher@bec.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Teaching Experience & Academic Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of your academic background, research interests, and teaching experience..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* ==================== HOD FORM ==================== */}
          {isHod && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    HOD Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Suresh Patil"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Staff ID / HOD Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOD001"
                    value={formData.bec}
                    onChange={(e) => handleInputChange('bec', e.target.value.toUpperCase())}
                    className="input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Head of Department (Branch) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering (CSE)"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="input text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    HOD Main Cabin Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HOD Office, Main Block Room 204"
                    value={formData.cabin}
                    onChange={(e) => handleInputChange('cabin', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Research Specialization & Key Focus Areas
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Cloud Systems, High Performance Computing"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="hod.cse@bec.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Office Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Department Leadership Overview & Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of department vision, academic initiatives, research projects, and faculty leadership..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* ==================== PLACEMENT OFFICER (PO) FORM ==================== */}
          {isPo && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Placement Officer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Placement Officer (PO)"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    PO Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO001"
                    value={formData.bec}
                    onChange={(e) => handleInputChange('bec', e.target.value.toUpperCase())}
                    className="input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Division / Placement Cell *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Corporate Placement & Training Cell"
                    value={formData.division}
                    onChange={(e) => handleInputChange('division', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Recruitment Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12+ Years Corporate Placement & Relations"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Placement Office Location & Timings
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Placement Block Room 101 | 9:00 AM - 5:00 PM"
                    value={formData.officeHours}
                    onChange={(e) => handleInputChange('officeHours', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Official Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Official Placement Email Address
                </label>
                <input
                  type="email"
                  placeholder="placements@bec.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Corporate Focus Areas & Cell Overview
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief overview of corporate partnerships, hiring domains (Software, SaaS, Core Engineering), and placement office guidelines..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* ==================== SECURITY GUARD FORM ==================== */}
          {isGuard && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Security Officer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Security Officer (Guard)"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Guard Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GRD001"
                    value={formData.bec}
                    onChange={(e) => handleInputChange('bec', e.target.value.toUpperCase())}
                    className="input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Gate Post Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Campus Gate 1"
                    value={formData.gatePost}
                    onChange={(e) => handleInputChange('gatePost', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Duty Shift
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Day Shift (08:00 - 18:00)"
                    value={formData.shift}
                    onChange={(e) => handleInputChange('shift', e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Duty Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input text-xs"
                />
              </div>
            </div>
          )}

          {/* ==================== STUDENT FORM (DEFAULT) ==================== */}
          {isStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    USN / Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter USN or Student ID"
                    value={formData.bec}
                    onChange={(e) => handleInputChange('bec', e.target.value.toUpperCase())}
                    className="input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  College / Institution Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your college name (e.g. Basaveshwar Engineering College)"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    className="input pl-10 text-xs"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  This college name will be displayed across your profile, gate passes, and resume records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Department / Branch <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, ISE, ECE, AIML"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value.toUpperCase())}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Year & Semester <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="input text-xs"
                  >
                    <option>I Year</option>
                    <option>II Year</option>
                    <option>III Year</option>
                    <option>IV Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      placeholder="e.g. student@college.edu"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input pl-10 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="input pl-10 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  About Me / Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of your academic interests, career goals, or technical passions..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Skills & Tech Stack */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Add Technical Skills & Frameworks
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Python, Java, Docker, SQL (press enter)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-1 rounded-xl bg-stone-900 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 transition cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Type skill name and click Add or press Enter.
                </p>
              </div>

              {/* Skills Display */}
              <div>
                <p className="text-xs font-bold text-stone-700 mb-2">
                  Your Current Skills ({formData.skills.length})
                </p>
                {formData.skills.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-center text-xs font-semibold text-stone-400">
                    No skills added yet. Add at least 1 technical skill to increase profile completion.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-black text-emerald-900 shadow-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-emerald-700 hover:text-rose-600 transition"
                          title="Remove skill"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick suggestions */}
              <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-100">
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">
                  Quick Add Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'React',
                    'JavaScript',
                    'Python',
                    'Java',
                    'Node.js',
                    'Tailwind CSS',
                    'SQL',
                    'MongoDB',
                    'Git & GitHub',
                    'Docker',
                    'Machine Learning',
                    'Data Structures'
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      disabled={formData.skills.includes(sug)}
                      onClick={() => {
                        if (!formData.skills.includes(sug)) {
                          setFormData((prev) => ({
                            ...prev,
                            skills: [...prev.skills, sug]
                          }));
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-[10px] font-bold text-stone-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-40 transition cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Professional Links */}
          {activeTab === 'links' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  GitHub Profile URL
                </label>
                <div className="relative">
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="url"
                    placeholder="https://github.com/your-username"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    className="input pl-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="input pl-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Personal Portfolio / Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="url"
                    placeholder="https://your-portfolio.dev"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="input pl-10 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Resume Upload */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              {formData.resume ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-stone-950 font-black shadow-xs">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-stone-900 truncate">
                        {typeof formData.resume === 'string' ? 'Student_Resume.pdf' : formData.resume.name}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-800">
                        {typeof formData.resume === 'string'
                          ? 'Uploaded'
                          : `${formData.resume.size || 'PDF'} • Uploaded on ${formData.resume.uploadedAt || 'Recent'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {formData.resume.dataUrl && (
                      <a
                        href={formData.resume.dataUrl}
                        download={formData.resume.name || 'Resume.pdf'}
                        className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition"
                        title="Download Resume"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center hover:border-emerald-500 transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white border border-stone-200 text-stone-600 shadow-sm mx-auto mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-black text-stone-900">
                    Upload Your Resume (PDF or DOCX)
                  </p>
                  <p className="text-[10px] font-semibold text-stone-500 mt-1">
                    Click to browse or drag and drop your file here (Max 10MB)
                  </p>
                  <span className="inline-block mt-3 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-[10px] font-bold text-emerald-800">
                    +20% Profile Completion
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs font-bold text-stone-400">
              {saveSuccess ? '✓ Profile saved successfully!' : 'All fields sync to your profile'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-stone-950 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 transition shadow-md cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
