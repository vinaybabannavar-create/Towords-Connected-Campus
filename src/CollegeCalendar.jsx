import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Clock,
  Tag,
  Building2,
  Plus,
  Check,
  Trash2,
  ExternalLink,
  Award,
  AlertCircle,
  GraduationCap,
  Download,
  Share2
} from 'lucide-react';
import { COLLEGE_CALENDAR_EVENTS, CALENDAR_MONTHS } from './collegeCalendarData';

export function CollegeCalendar({ student }) {
  // Today's date string e.g. "2026-09-03"
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const todayMonthKey = todayStr.slice(0, 7); // e.g. "2026-09"

  const [selectedMonthKey, setSelectedMonthKey] = useState(todayMonthKey);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bec_custom_calendar_events') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomDate, setNewCustomDate] = useState('2026-09-15');
  const [newCustomCategory, setNewCustomCategory] = useState('Custom Reminder');

  const currentMonth = useMemo(() => {
    return CALENDAR_MONTHS.find((m) => m.key === selectedMonthKey) || CALENDAR_MONTHS[2];
  }, [selectedMonthKey]);

  const allEvents = useMemo(() => {
    return [...COLLEGE_CALENDAR_EVENTS, ...customEvents];
  }, [customEvents]);

  // Quick statistics
  const stats = useMemo(() => {
    const holidays = allEvents.filter((e) => e.category === 'Holiday').length;
    const exams = allEvents.filter((e) => e.category.includes('Exam') || e.category.includes('IA')).length;
    const workshops = allEvents.filter((e) => e.category === 'Workshop' || e.category === 'Fest' || e.category === 'Session').length;
    const submissions = allEvents.filter((e) => e.category === 'Submission' || e.category === 'Assignment').length;
    return { holidays, exams, workshops, submissions, total: allEvents.length };
  }, [allEvents]);

  // Filtered Events for list display
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Month or Date filter
      if (selectedDate) {
        const isMatchSingle = event.startDate === selectedDate;
        const isMatchRange = event.endDate && event.startDate <= selectedDate && event.endDate >= selectedDate;
        if (!isMatchSingle && !isMatchRange) return false;
      } else if (selectedMonthKey && !searchQuery) {
        const inMonth = event.startDate.startsWith(selectedMonthKey) || (event.endDate && event.endDate.startsWith(selectedMonthKey));
        if (!inMonth) return false;
      }

      // Department filter
      if (selectedDept !== 'ALL') {
        const eventDept = (event.dept || '').toUpperCase();
        if (eventDept !== 'ALL' && !eventDept.includes(selectedDept)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Exam/IA' && !(event.category.includes('Exam') || event.category.includes('IA'))) {
          return false;
        } else if (selectedCategory === 'Workshop' && !(event.category === 'Workshop' || event.category === 'Session' || event.category === 'Guest Lecture')) {
          return false;
        } else if (selectedCategory === 'Fest' && !(event.category === 'Fest' || event.category === 'Conference' || event.category === 'Event')) {
          return false;
        } else if (selectedCategory === 'Submission' && !(event.category === 'Submission' || event.category === 'Assignment')) {
          return false;
        } else if (selectedCategory === 'Holiday' && event.category !== 'Holiday') {
          return false;
        } else if (selectedCategory === 'Industrial Visit' && event.category !== 'Industrial Visit') {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchDept = (event.dept || '').toLowerCase().includes(q);
        const matchCat = (event.category || '').toLowerCase().includes(q);
        const matchDate = event.startDate.includes(q) || (event.endDate && event.endDate.includes(q));
        if (!matchTitle && !matchDept && !matchCat && !matchDate) return false;
      }

      return true;
    });
  }, [allEvents, selectedMonthKey, selectedDate, selectedDept, selectedCategory, searchQuery]);

  // Calendar Day Map for current month
  const monthDayEvents = useMemo(() => {
    const map = {};
    for (let d = 1; d <= currentMonth.days; d++) {
      const dateStr = `${currentMonth.key}-${String(d).padStart(2, '0')}`;
      const dayEvts = allEvents.filter((e) => {
        if (e.startDate === dateStr) return true;
        if (e.endDate && e.startDate <= dateStr && e.endDate >= dateStr) return true;
        return false;
      });
      map[dateStr] = dayEvts;
    }
    return map;
  }, [allEvents, currentMonth]);

  const handlePrevMonth = () => {
    const idx = CALENDAR_MONTHS.findIndex((m) => m.key === selectedMonthKey);
    if (idx > 0) {
      setSelectedMonthKey(CALENDAR_MONTHS[idx - 1].key);
      setSelectedDate(null);
    }
  };

  const handleNextMonth = () => {
    const idx = CALENDAR_MONTHS.findIndex((m) => m.key === selectedMonthKey);
    if (idx < CALENDAR_MONTHS.length - 1) {
      setSelectedMonthKey(CALENDAR_MONTHS[idx + 1].key);
      setSelectedDate(null);
    }
  };

  const handleAddCustomEvent = (e) => {
    e.preventDefault();
    if (!newCustomTitle.trim()) return;
    const newEvt = {
      id: 'custom-' + Date.now(),
      title: newCustomTitle.trim(),
      startDate: newCustomDate,
      endDate: newCustomDate,
      category: newCustomCategory,
      dept: student?.department || 'ALL',
      isCustom: true
    };
    const next = [newEvt, ...customEvents];
    setCustomEvents(next);
    localStorage.setItem('bec_custom_calendar_events', JSON.stringify(next));
    setNewCustomTitle('');
    setShowAddModal(false);
  };

  const handleDeleteCustomEvent = (id) => {
    const next = customEvents.filter((e) => e.id !== id);
    setCustomEvents(next);
    localStorage.setItem('bec_custom_calendar_events', JSON.stringify(next));
  };

  const getCategoryTheme = (category = '') => {
    const c = category.toLowerCase();
    if (c.includes('holiday')) {
      return { bg: 'bg-rose-100 text-rose-900 border-rose-300', dot: 'bg-rose-500', label: 'Holiday' };
    }
    if (c.includes('exam') || c.includes('ia') || c.includes('cie') || c.includes('assessment')) {
      return { bg: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-600', label: 'Exam / IA' };
    }
    if (c.includes('workshop') || c.includes('session') || c.includes('lecture') || c.includes('talk')) {
      return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600', label: 'Workshop' };
    }
    if (c.includes('fest') || c.includes('conference') || c.includes('event')) {
      return { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500', label: 'Fest / Event' };
    }
    if (c.includes('submission') || c.includes('assignment') || c.includes('pcsr') || c.includes('fmr') || c.includes('mar')) {
      return { bg: 'bg-sky-100 text-sky-900 border-sky-300', dot: 'bg-sky-600', label: 'Submission' };
    }
    if (c.includes('industrial visit')) {
      return { bg: 'bg-teal-100 text-teal-900 border-teal-300', dot: 'bg-teal-600', label: 'Industrial Visit' };
    }
    return { bg: 'bg-stone-100 text-stone-800 border-stone-300', dot: 'bg-stone-500', label: category || 'Academic' };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Module Title Banner */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-stone-950 text-white shadow-md">
              <CalendarDays className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-950 sm:text-2xl">College Academic Calendar</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
                  Odd Sem 2026
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-500 mt-0.5">
                Official calendar of 112 academic events, IA exams, workshops, industrial visits & holidays (July – Dec 2026).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Reminder</span>
            </button>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5 border-t border-stone-100 pt-4">
          <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/80">
            <span className="text-[10px] font-black uppercase text-stone-400 block tracking-wider">Total Events</span>
            <strong className="text-lg font-black text-stone-950">{stats.total}</strong>
          </div>
          <div className="rounded-xl bg-purple-50 p-3 border border-purple-200/80">
            <span className="text-[10px] font-black uppercase text-purple-700 block tracking-wider">Exams & IA</span>
            <strong className="text-lg font-black text-purple-950">{stats.exams}</strong>
          </div>
          <div className="rounded-xl bg-rose-50 p-3 border border-rose-200/80">
            <span className="text-[10px] font-black uppercase text-rose-700 block tracking-wider">Holidays</span>
            <strong className="text-lg font-black text-rose-950">{stats.holidays}</strong>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200/80">
            <span className="text-[10px] font-black uppercase text-emerald-800 block tracking-wider">Workshops & Fests</span>
            <strong className="text-lg font-black text-emerald-950">{stats.workshops}</strong>
          </div>
          <div className="rounded-xl bg-sky-50 p-3 border border-sky-200/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black uppercase text-sky-700 block tracking-wider">Submissions</span>
            <strong className="text-lg font-black text-sky-950">{stats.submissions}</strong>
          </div>
        </div>
      </section>

      {/* Main Grid: Calendar on Left, Event Timeline on Right */}
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Left: Monthly Calendar View */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          {/* Month Selector Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                disabled={selectedMonthKey === CALENDAR_MONTHS[0].key}
                className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 transition cursor-pointer text-stone-800"
                aria-label="Previous Month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-black text-stone-950">{currentMonth.name}</h3>
              <button
                onClick={handleNextMonth}
                disabled={selectedMonthKey === CALENDAR_MONTHS[CALENDAR_MONTHS.length - 1].key}
                className="grid h-9 w-9 place-items-center rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 transition cursor-pointer text-stone-800"
                aria-label="Next Month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                Clear Day Filter
              </button>
            )}
          </div>

          {/* Month Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CALENDAR_MONTHS.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setSelectedMonthKey(m.key);
                  setSelectedDate(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition shrink-0 cursor-pointer ${
                  selectedMonthKey === m.key
                    ? 'bg-stone-950 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {m.short} '26
              </button>
            ))}
          </div>

          {/* 7-Day Calendar Grid (S M T W T F S) */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs bg-stone-50/50">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-100 text-center py-2.5 text-xs font-black text-stone-700">
              <span className="text-rose-600">SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span className="text-stone-600">SAT</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 auto-rows-fr bg-white gap-px p-px">
              {/* Empty leading offset days */}
              {Array.from({ length: currentMonth.startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[82px] bg-stone-50/40 p-1.5" />
              ))}

              {/* Days of Month */}
              {Array.from({ length: currentMonth.days }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentMonth.key}-${String(dayNum).padStart(2, '0')}`;
                const events = monthDayEvents[dateStr] || [];
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;
                const hasHoliday = events.some((e) => e.category === 'Holiday');
                const hasExam = events.some((e) => e.category.includes('Exam') || e.category.includes('IA'));
                const hasWorkshop = events.some((e) => e.category === 'Workshop' || e.category === 'Fest');

                // Check Sunday
                const dayOfWeek = (currentMonth.startDay + i) % 7;
                const isSunday = dayOfWeek === 0;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(selectedDate === dateStr ? null : dateStr);
                    }}
                    className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 text-left transition relative flex flex-col justify-between rounded-xl cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 ring-2 ring-emerald-600 z-10'
                        : isToday
                        ? 'bg-blue-50 ring-2 ring-blue-500 z-10'
                        : events.length > 0
                        ? 'hover:bg-stone-100 bg-white'
                        : isSunday
                        ? 'bg-rose-50/30 hover:bg-rose-50/60'
                        : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          isSelected
                            ? 'text-emerald-700'
                            : isToday
                            ? 'text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-[11px] shrink-0'
                            : hasHoliday || isSunday
                            ? 'text-rose-600 font-bold'
                            : hasExam
                            ? 'text-purple-700 font-bold'
                            : 'text-stone-800'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {events.length > 0 && (
                        <span className={`text-[9px] font-black px-1.5 rounded-full leading-tight py-0.5 ${isToday ? 'bg-blue-600 text-white' : 'bg-stone-900 text-white'}`}>
                          {events.length}
                        </span>
                      )}
                    </div>

                    {/* Today Badge */}
                    {isToday && !isSelected && (
                      <span className="absolute top-1 right-1 text-[8px] font-black bg-blue-600 text-white rounded-sm px-1 leading-tight">
                        TODAY
                      </span>
                    )}

                    {/* Event Dots / Micro Previews */}
                    <div className="space-y-0.5 mt-1 overflow-hidden">
                      {events.slice(0, 2).map((ev) => {
                        const theme = getCategoryTheme(ev.category);
                        return (
                          <div
                            key={ev.id}
                            className={`truncate rounded px-1 py-0.2 text-[8px] sm:text-[9px] font-bold leading-tight ${theme.bg}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <span className="text-[8px] font-bold text-stone-400 block truncate">
                          +{events.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-bold text-stone-600 border-t border-stone-100">
            <span className="text-stone-400 uppercase tracking-wider text-[10px] font-black">Legend:</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Holiday</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Exam / IA</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Workshop</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Fest</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Submission</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-600" /> Industrial Visit</span>
          </div>
        </div>

        {/* Right: Search, Filters & Event List */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-base font-black text-stone-950">
                {selectedDate ? `Events on ${selectedDate}` : `Events in ${currentMonth.name}`}
              </h3>
              <p className="text-xs font-semibold text-stone-500">Showing {filteredEvents.length} events matching filters</p>
            </div>
            {selectedDate && (
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Selected Day
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              className="input pl-10 text-xs"
              placeholder="Search event title, guest speaker, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Exam/IA', 'Holiday', 'Workshop', 'Fest', 'Submission', 'Industrial Visit'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-stone-950 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 border-t border-stone-100 pt-3">
            <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Dept:</span>
            {['ALL', 'CSE', 'ISE', 'ECE', 'AIML'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-black transition cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Events Scroll List */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-xs font-bold text-stone-500">
                No events found matching current date / search filters.
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const theme = getCategoryTheme(evt.category);
                const isSingleDay = !evt.endDate || evt.startDate === evt.endDate;

                return (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 transition hover:bg-white hover:shadow-sm space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-stone-400">
                          #{typeof evt.id === 'number' ? evt.id : 'REMINDER'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.bg}`}>
                          {theme.label}
                        </span>
                        {evt.dept && evt.dept !== 'ALL' && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-black uppercase">
                            {evt.dept}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-stone-600">
                          {isSingleDay ? evt.startDate : `${evt.startDate} → ${evt.endDate}`}
                        </span>
                        {evt.isCustom && (
                          <button
                            onClick={() => handleDeleteCustomEvent(evt.id)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                            title="Delete reminder"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-stone-950 leading-snug">{evt.title}</h4>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-950">Add Personal Calendar Reminder</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Event / Deadline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mini Project Final Review submission"
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newCustomDate}
                    onChange={(e) => setNewCustomDate(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCustomCategory}
                    onChange={(e) => setNewCustomCategory(e.target.value)}
                    className="input text-xs"
                  >
                    <option>Custom Reminder</option>
                    <option>Exam / IA</option>
                    <option>Submission</option>
                    <option>Workshop</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-stone-950 py-3 text-xs font-black text-white hover:bg-emerald-700 transition shadow-md"
              >
                Save To My Calendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
