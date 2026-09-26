import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Printer,
  RotateCcw,
  Sparkles,
  Download,
  BookOpen,
  CheckCircle2,
  CalendarDays,
  LayoutGrid
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generateStudyPlannerAI } from '../services/aiService';
import { downloadVectorPlannerPdf, downloadElementAsPdf } from '../utils/pdfDownloader';
import { StudyPlannerData } from '../types';

export const StudyPlannerPage: React.FC = () => {
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [studyDays, setStudyDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [preferredTime, setPreferredTime] = useState('Morning & Evening');
  const [prioritySubjects, setPrioritySubjects] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plannerData, setPlannerData] = useState<StudyPlannerData | null>(null);
  const [activeView, setActiveView] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (studyDays.includes(day)) {
      if (studyDays.length > 1) {
        setStudyDays(studyDays.filter((d) => d !== day));
      }
    } else {
      setStudyDays([...studyDays, day]);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subjects.trim()) {
      setError('Please list at least 1 or 2 subjects.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plan = await generateStudyPlannerAI({
        subjects,
        examDate,
        availableHours,
        studyDays,
        preferredTime,
        prioritySubjects
      });
      setPlannerData(plan);
      setSelectedDayIndex(0);
    } catch (err: any) {
      setError(err.message || 'Failed to generate study timetable.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!plannerData) return;
    setDownloadingPdf(true);
    const filename = `Study_Timetable_${Date.now()}.pdf`;
    try {
      downloadVectorPlannerPdf(plannerData, filename);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.warn('Vector timetable PDF failed, trying canvas capture:', err);
      try {
        await downloadElementAsPdf('printable-planner', filename);
        setPdfDownloaded(true);
        setTimeout(() => setPdfDownloaded(false), 3000);
      } catch (canvasErr) {
        console.error('All PDF download methods failed:', canvasErr);
        window.print();
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToolHeader
        toolNumber="09"
        title="AI Study Planner"
        subtitle="Generate personalized study timetables with AI."
        icon={<Calendar className="w-6 h-6 text-[#F59E0B]" />}
        badge="Timetable Matrix"
        category="Planning & Routine"
        statusText="AI Ready"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Setup Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm text-left transition-all">
          <div className="border-b border-[#DFE4F2] pb-3">
            <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider font-display">
              Study Schedule Parameters
            </h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-800 font-semibold block mb-1">Subjects (Comma-separated) *</label>
              <input
                type="text"
                required
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                placeholder="Data Structures, Calculus, Algorithms..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">Exam / Target Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Daily Study Budget</label>
                <select
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                >
                  <option value={2}>2 Hours / day</option>
                  <option value={3}>3 Hours / day</option>
                  <option value={4}>4 Hours / day</option>
                  <option value={6}>6 Hours / day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1.5">Active Study Days</label>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map((day) => {
                  const isChecked = studyDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-50  border-slate-200  text-slate-600  hover:text-slate-900 '
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 block mb-1">Preferred Time Slot</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
                >
                  <option value="Morning (8am - 12pm)">Morning (8am - 12pm)</option>
                  <option value="Afternoon (1pm - 5pm)">Afternoon (1pm - 5pm)</option>
                  <option value="Evening (6pm - 10pm)">Evening (6pm - 10pm)</option>
                  <option value="Morning & Evening">Split: Morning & Evening</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Priority Subject</label>
                <input
                  type="text"
                  value={prioritySubjects}
                  onChange={(e) => setPrioritySubjects(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Subject needing most work"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#D97706] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer pt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{plannerData ? 'Regenerate with AI' : 'Generate with AI'}</span>
            </button>
          </form>
        </div>

        {/* Right Timetable View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveView('weekly')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  activeView === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-600  hover:text-slate-900 '
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Weekly View
              </button>
              <button
                onClick={() => setActiveView('daily')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  activeView === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-600  hover:text-slate-900 '
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" /> Daily Focus
              </button>
            </div>

            {plannerData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {downloadingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : pdfDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <LoadingState toolName="Study Timetable" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : plannerData ? (
            <div id="printable-planner" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-left transition-colors">
              {activeView === 'weekly' ? (
                /* Weekly Grid View */
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-3">
                    <span className="font-bold text-slate-900 uppercase tracking-wider">
                      Weekly Schedule Matrix
                    </span>
                    <span className="font-mono text-indigo-600">{plannerData.schedule.length} Study Days</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plannerData.schedule.map((dayItem, dIdx) => (
                      <div
                        key={dIdx}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="font-bold text-slate-900 text-xs">{dayItem.day}</span>
                          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {dayItem.date}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {dayItem.slots.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1 shadow-sm"
                            >
                              <div className="flex justify-between text-[11px] font-mono">
                                <span className="text-slate-500">{slot.start} — {slot.end}</span>
                                <span className="text-indigo-600 font-bold">{slot.subject}</span>
                              </div>
                              <p className="text-[11px] text-slate-700 leading-snug">{slot.activity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Daily Detailed View */
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
                    {plannerData.schedule.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDayIndex(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                          selectedDayIndex === i
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100  text-slate-600  hover:text-slate-900 '
                        }`}
                      >
                        {d.day}
                      </button>
                    ))}
                  </div>

                  {/* Selected Day Timeline */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-base font-bold text-slate-900">
                      {plannerData.schedule[selectedDayIndex].day} Deep Focus Blocks
                    </h4>
                    <div className="space-y-3">
                      {plannerData.schedule[selectedDayIndex].slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white border border-indigo-200 flex items-start gap-4 shadow-sm"
                        >
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 font-mono text-xs">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500">{slot.start} — {slot.end}</span>
                              <span className="font-bold text-indigo-700">{slot.subject}</span>
                            </div>
                            <p className="text-slate-700">{slot.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy Tips */}
              {plannerData.strategyTips && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-indigo-700 block">
                    🧠 AI Study Strategy Tips:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-indigo-900">
                    {plannerData.strategyTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Study Timetable Generated"
              description="Specify your subjects, daily study hours, and active days on the left to build a structured timetable."
              icon={<Calendar className="w-8 h-8 text-indigo-400" />}
              actionHint="Generates weekly grid views, daily timelines, and cognitive retention tips."
            />
          )}
        </div>
      </div>
    </div>
  );
};
