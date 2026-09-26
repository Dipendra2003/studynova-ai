import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Award,
  ListChecks,
  Clock,
  Flag,
  Download,
  Upload,
  FileText,
  FileCode,
  Share2,
  Check,
  Eye,
  Shuffle,
  AlertTriangle,
  Play,
  Pause,
  BookOpen,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generateQuizAI, explainQuizAnswerAI } from '../services/aiService';
import { QuizData, QuizQuestion } from '../types';
import {
  QUIZ_PRESETS,
  QuizPreset,
  exportQuizToMarkdown,
  generatePrintableHtmlQuiz,
  formatQuizTime
} from '../utils/quizHelpers';

export type QuizMode = 'practice' | 'exam';

export const QuizGeneratorPage: React.FC = () => {
  // Input Parameters State
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Intermediate' | 'Hard'>('Intermediate');
  const [quizMode, setQuizMode] = useState<QuizMode>('practice');

  // AI & Quiz State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Active Quiz Execution State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'flagged'>('all');

  // Deep-Dive AI Rationale State
  const [deepDiveExplaining, setDeepDiveExplaining] = useState<Record<number, boolean>>({});
  const [deepDiveExplanations, setDeepDiveExplanations] = useState<Record<number, string>>({});

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpentTotal, setTimeSpentTotal] = useState(0);

  // Export Menu State
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File Input Ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ============================================================
  // TIMER EFFECT
  // ============================================================
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!quizData || isCompleted) return;

      const currentQ = quizData.questions[currentIndex];

      // Option selection via A, B, C, D or 1, 2, 3, 4
      if (e.key === 'a' || e.key === 'A' || e.key === '1') {
        if (currentQ.options.length > 0) handleSelectOption(0);
      } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
        if (currentQ.options.length > 1) handleSelectOption(1);
      } else if (e.key === 'c' || e.key === 'C' || e.key === '3') {
        if (currentQ.options.length > 2) handleSelectOption(2);
      } else if (e.key === 'd' || e.key === 'D' || e.key === '4') {
        if (currentQ.options.length > 3) handleSelectOption(3);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFlagQuestion(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizData, currentIndex, isCompleted, userAnswers, flaggedQuestions]);

  // ============================================================
  // AI GENERATION HANDLER
  // ============================================================
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a quiz topic or paste study notes.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsCompleted(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setDeepDiveExplanations({});
    setDeepDiveExplaining({});

    try {
      const data = await generateQuizAI({
        topic,
        notes,
        count,
        difficulty
      });

      // Strict client-side sanitization to guarantee 1-based unique IDs and valid bounds
      const sanitizedQuestions: QuizQuestion[] = data.questions.map((q, idx) => {
        const safeOpts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['A', 'B', 'C', 'D'];
        const safeCorr = Math.max(0, Math.min(safeOpts.length - 1, typeof q.correctAnswer === 'number' ? q.correctAnswer : 0));
        return {
          ...q,
          id: idx + 1,
          options: safeOpts,
          correctAnswer: safeCorr,
          explanation: q.explanation?.trim() || `Option ${String.fromCharCode(65 + safeCorr)} is the verified answer.`
        };
      });

      setQuizData({ ...data, questions: sanitizedQuestions });
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: QuizPreset) => {
    setTopic(preset.topic);
    setDifficulty(preset.difficulty);
    setNotes(preset.notes);
  };

  // ============================================================
  // QUIZ INTERACTION
  // ============================================================
  const handleSelectOption = (optionIndex: number) => {
    if (isCompleted || !quizData) return;
    const currentQ = quizData.questions[currentIndex];
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));
  };

  const toggleFlagQuestion = (qId: number) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    setIsCompleted(true);
    setIsTimerRunning(false);
    setTimeSpentTotal(timerSeconds);
  };

  const restartQuiz = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setDeepDiveExplanations({});
    setDeepDiveExplaining({});
  };

  const handleShuffleOptions = () => {
    if (!quizData || isCompleted) return;
    const newAnswers: Record<number, number> = {};

    const shuffledQuestions: QuizQuestion[] = quizData.questions.map((q) => {
      const currentCorrectOpt = q.options[q.correctAnswer];
      const previousChosenOpt = userAnswers[q.id] !== undefined ? q.options[userAnswers[q.id]] : null;
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      const newCorrectIdx = shuffled.indexOf(currentCorrectOpt);

      if (previousChosenOpt !== null) {
        newAnswers[q.id] = shuffled.indexOf(previousChosenOpt);
      }

      return {
        ...q,
        options: shuffled,
        correctAnswer: newCorrectIdx >= 0 ? newCorrectIdx : 0
      };
    });

    setQuizData({ ...quizData, questions: shuffledQuestions });
    setUserAnswers(newAnswers);
    showToast('Options randomized; selections preserved.');
  };

  const handleRequestDeepDive = async (q: QuizQuestion) => {
    setDeepDiveExplaining((prev) => ({ ...prev, [q.id]: true }));
    try {
      const userChoice = userAnswers[q.id];
      const explanation = await explainQuizAnswerAI({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userChoice,
        topic: quizData?.topic || topic
      });
      setDeepDiveExplanations((prev) => ({ ...prev, [q.id]: explanation }));
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch AI explanation.');
    } finally {
      setDeepDiveExplaining((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  // ============================================================
  // SCORE & ANALYTICS
  // ============================================================
  const score = useMemo(() => {
    if (!quizData) return 0;
    return quizData.questions.reduce((acc, q) => {
      return userAnswers[q.id] === q.correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [quizData, userAnswers]);

  const percentage = useMemo(() => {
    if (!quizData || quizData.questions.length === 0) return 0;
    return Math.round((score / quizData.questions.length) * 100);
  }, [quizData, score]);

  const masteryTier = useMemo(() => {
    if (percentage >= 90) return { title: 'Mastery Achieved', color: 'text-emerald-600 ', badge: 'bg-emerald-50  border-emerald-300' };
    if (percentage >= 70) return { title: 'Proficient & Solid', color: 'text-indigo-600 ', badge: 'bg-indigo-50  border-indigo-300' };
    if (percentage >= 50) return { title: 'Developing with Gaps', color: 'text-amber-600 ', badge: 'bg-amber-50  border-amber-300' };
    return { title: 'Needs Intensive Review', color: 'text-rose-600 ', badge: 'bg-rose-50  border-rose-300' };
  }, [percentage]);

  // Review List Filtered
  const reviewQuestions = useMemo(() => {
    if (!quizData) return [];
    return quizData.questions.filter((q) => {
      const isCorrect = userAnswers[q.id] === q.correctAnswer;
      if (reviewFilter === 'incorrect') return !isCorrect;
      if (reviewFilter === 'flagged') return Boolean(flaggedQuestions[q.id]);
      return true;
    });
  }, [quizData, userAnswers, flaggedQuestions, reviewFilter]);

  // ============================================================
  // EXPORT HANDLERS
  // ============================================================
  const handleExportPrintable = () => {
    if (!quizData) return;
    const htmlContent = generatePrintableHtmlQuiz(quizData);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
    }
    setExportMenuOpen(false);
  };

  const handleExportMarkdown = () => {
    if (!quizData) return;
    const md = exportQuizToMarkdown(quizData, true);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quizData.topic.replace(/\s+/g, '_')}_Quiz.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded Quiz Markdown.');
    setExportMenuOpen(false);
  };

  const handleExportJson = () => {
    if (!quizData) return;
    const jsonString = JSON.stringify(quizData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quizData.topic.replace(/\s+/g, '_')}_Quiz.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded Quiz JSON.');
    setExportMenuOpen(false);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          setQuizData(parsed);
          setTopic(parsed.topic || 'Imported Quiz');
          restartQuiz();
          showToast(`Imported quiz with ${parsed.questions.length} questions.`);
        } else {
          showToast('Invalid quiz JSON file.');
        }
      } catch (err: any) {
        showToast('Error importing JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      <ToolHeader
        toolNumber="06"
        title="AI Quiz Generator"
        subtitle="Generate interactive active-recall quizzes with instant learning feedback, exam timer mode, and printable worksheets."
        icon={<HelpCircle className="w-6 h-6 text-[#EC4899]" />}
        badge="Active Recall Engine"
        category="Testing & Assessment"
        statusText="AI Ready"
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: SETUP & PRESETS (4 COLS)                        */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#DFE4F2] rounded-3xl p-6 space-y-4 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-[#DFE4F2] pb-3">
              <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider font-display flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#EC4899]" />
                Quiz Setup & Scope
              </h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#EC4899] flex items-center gap-1 cursor-pointer transition-colors"
                title="Import an existing Quiz JSON file"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
            </div>

            {/* Quick Academic STEM Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Academic Presets
                </span>
                <span className="text-[10px] text-slate-400">Click to fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUIZ_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-pink-50 hover:text-pink-700 text-slate-700 border border-slate-200 hover:border-pink-300 transition-colors cursor-pointer text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-800 font-bold block mb-1">Subject Topic *</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-2xl px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#EC4899]"
                  placeholder="e.g. Graph Algorithms, Photosynthesis, B-Trees..."
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">Study Notes / Context (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-2xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#EC4899] font-mono text-[11px] leading-relaxed"
                  placeholder="Paste specific textbook excerpts or formulas for question generation..."
                />
              </div>

              {/* Mode Toggle: Practice (Instant Feedback) vs Exam (Simulation) */}
              <div>
                <label className="text-slate-600 block mb-1.5 font-medium">Quiz Experience Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizMode('practice')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      quizMode === 'practice'
                        ? 'bg-pink-50 border-[#EC4899] text-[#EC4899] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Practice Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizMode('exam')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      quizMode === 'exam'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timed Exam</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {quizMode === 'practice'
                    ? 'Instant feedback: Reveals correct answer & conceptual explanation on every pick.'
                    : 'Exam simulation: Timed session, hides feedback until final scorecard submission.'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Question Count</label>
                  <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-2.5 py-2 text-slate-800"
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-2.5 py-2 text-slate-800"
                  >
                    <option value="Easy">Easy (Fundamentals)</option>
                    <option value="Intermediate">Intermediate (Applied)</option>
                    <option value="Hard">Hard (Edge Cases)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#EC4899] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer pt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{quizData ? 'Regenerate Questions' : 'Generate Interactive Quiz'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: QUIZ ARENA & ACTIVE WORKSPACE (8 COLS)         */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Control Bar */}
          <div className="bg-white border border-[#DFE4F2] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#EC4899]" />
                Interactive Quiz Arena
              </span>
              {quizData && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 text-[#EC4899] border border-pink-200">
                  {quizMode === 'practice' ? 'Practice Mode' : 'Exam Mode'}
                </span>
              )}
            </div>

            {quizData && (
              <div className="flex items-center gap-2">
                {/* Timer Display */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{formatQuizTime(timerSeconds)}</span>
                </div>

                {/* Shuffle Options */}
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={handleShuffleOptions}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs cursor-pointer transition-colors"
                    title="Randomize options order"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Export Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="px-3 py-1 bg-[#080909] hover:bg-[#EC4899] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  {exportMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-left animate-in fade-in"
                      onMouseLeave={() => setExportMenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={handleExportPrintable}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-blue-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Printable Exam (HTML/PDF)</div>
                          <div className="text-[10px] text-slate-500">Classroom paper test</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportMarkdown}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Markdown Worksheet (.md)</div>
                          <div className="text-[10px] text-slate-500">With answer key & solutions</div>
                        </div>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Quiz Data (.json)</div>
                          <div className="text-[10px] text-slate-500">Full question tree backup</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Restart */}
                <button
                  type="button"
                  onClick={restartQuiz}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Quiz Workspace */}
          {loading ? (
            <LoadingState toolName="MCQ Quiz" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : quizData ? (
            !isCompleted ? (
              /* ============================================================ */
              /* ACTIVE QUESTION-BY-QUESTION CARD                             */
              /* ============================================================ */
              <div className="bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left transition-all">
                {/* Question Palette / Number Jump Grid */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                    <span className="font-bold text-[#EC4899]">
                      Question {currentIndex + 1} of {quizData.questions.length}
                    </span>
                    <span>
                      Answered: {Object.keys(userAnswers).length} / {quizData.questions.length}
                    </span>
                  </div>

                  {/* Question Indicator Numbers */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quizData.questions.map((q, qIdx) => {
                      const isAnswered = userAnswers[q.id] !== undefined;
                      const isCurrent = qIdx === currentIndex;
                      const isFlagged = flaggedQuestions[q.id];

                      let btnStyle = 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
                      if (isAnswered) {
                        btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold';
                      }
                      if (isCurrent) {
                        btnStyle = 'ring-2 ring-[#EC4899] border-[#EC4899] bg-pink-50 text-[#EC4899] font-black';
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentIndex(qIdx)}
                          className={`w-8 h-8 rounded-xl border text-xs font-mono flex items-center justify-center relative cursor-pointer transition-all ${btnStyle}`}
                        >
                          {qIdx + 1}
                          {isFlagged && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-1 -right-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[#EC4899] h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${((currentIndex + 1) / quizData.questions.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {quizData.questions[currentIndex].question}
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleFlagQuestion(quizData.questions[currentIndex].id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        flaggedQuestions[quizData.questions[currentIndex].id]
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title="Flag question for later review (Press F)"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {quizData.questions[currentIndex].options.map((opt, oIdx) => {
                      const currentQ = quizData.questions[currentIndex];
                      const selected = userAnswers[currentQ.id] === oIdx;
                      const hasAnswered = userAnswers[currentQ.id] !== undefined;

                      // Practice mode immediate feedback
                      let cardStyle =
                        'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300';
                      let letterStyle = 'border-slate-300 text-slate-500';

                      if (quizMode === 'practice' && hasAnswered) {
                        const isThisCorrect = oIdx === currentQ.correctAnswer;
                        const isThisChosen = selected;

                        if (isThisCorrect) {
                          cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold shadow-xs';
                          letterStyle = 'border-emerald-500 bg-emerald-600 text-white';
                        } else if (isThisChosen && !isThisCorrect) {
                          cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold';
                          letterStyle = 'border-rose-500 bg-rose-600 text-white';
                        } else {
                          cardStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                        }
                      } else if (selected) {
                        cardStyle = 'bg-pink-50 border-[#EC4899] text-[#EC4899] font-bold shadow-xs';
                        letterStyle = 'border-[#EC4899] bg-[#EC4899] text-white';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(oIdx)}
                          className={`w-full p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${cardStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full border text-[11px] font-mono flex items-center justify-center font-bold shrink-0 ${letterStyle}`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>
                          {quizMode === 'practice' && hasAnswered && oIdx === currentQ.correctAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {quizMode === 'practice' && hasAnswered && selected && oIdx !== currentQ.correctAnswer && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation in Practice Mode */}
                  {quizMode === 'practice' && userAnswers[quizData.questions[currentIndex].id] !== undefined && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2.5 animate-in fade-in">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Conceptual Rationale & Explanation:</span>
                        </span>

                        {!deepDiveExplanations[quizData.questions[currentIndex].id] && (
                          <button
                            type="button"
                            onClick={() => handleRequestDeepDive(quizData.questions[currentIndex])}
                            disabled={deepDiveExplaining[quizData.questions[currentIndex].id]}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {deepDiveExplaining[quizData.questions[currentIndex].id] ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                                <span>Analyzing Rationale...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-[#EC4899]" />
                                <span>AI Deep-Dive Rationale</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed">
                        {quizData.questions[currentIndex].explanation}
                      </p>

                      {deepDiveExplanations[quizData.questions[currentIndex].id] && (
                        <div className="pt-2 border-t border-indigo-200/80 text-xs text-indigo-950 bg-white/80 p-3 rounded-xl whitespace-pre-line leading-relaxed">
                          {deepDiveExplanations[quizData.questions[currentIndex].id]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Navigation Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="text-[11px] text-slate-400 hidden sm:block">
                    Keys: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">1-4</kbd> to pick &bull; <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">→</kbd> for next
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 bg-[#080909] hover:bg-[#EC4899] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <span>
                      {currentIndex === quizData.questions.length - 1
                        ? 'Finish & View Scorecard'
                        : 'Next Question'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ============================================================ */
              /* FINAL SCORECARD & DETAILED REVIEW                            */
              /* ============================================================ */
              <div className="bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left transition-all">
                {/* Score Header Hero */}
                <div className="text-center space-y-3 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-200 text-[#EC4899] flex items-center justify-center mx-auto shadow-sm">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display">
                    Quiz Completed!
                  </h3>

                  <div className="text-4xl font-black font-mono text-slate-900">
                    {score} <span className="text-xl font-normal text-slate-400">/ {quizData.questions.length} Correct</span>
                  </div>

                  {/* Mastery Badge */}
                  <div className="flex items-center justify-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${masteryTier.badge} ${masteryTier.color}`}>
                      {masteryTier.title} ({percentage}%)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Time: {formatQuizTime(timeSpentTotal)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2.5 pt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={restartQuiz}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Retry Quiz
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPrintable}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print Exam / PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export Markdown</span>
                    </button>
                  </div>
                </div>

                {/* Review Filter Bar */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-[#EC4899]" />
                        <span>Answer Review & Rationale ({reviewQuestions.length} Questions)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        In-depth pedagogical solutions, distractor analyses, and verified conceptual rationales.
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setReviewFilter('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          reviewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        All ({quizData.questions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('incorrect')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          reviewFilter === 'incorrect' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Mistakes ({quizData.questions.length - score})
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFilter('flagged')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          reviewFilter === 'flagged' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        Flagged ({Object.values(flaggedQuestions).filter(Boolean).length})
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {reviewQuestions.map((q) => {
                      const actualIndex = quizData.questions.findIndex((item) => item.id === q.id);
                      const qNumber = actualIndex >= 0 ? actualIndex + 1 : q.id;
                      const userChoice = userAnswers[q.id];
                      const isAnswered = userChoice !== undefined;
                      const isCorrect = isAnswered && userChoice === q.correctAnswer;
                      const hasDeepDive = Boolean(deepDiveExplanations[q.id]);
                      const isExplaining = Boolean(deepDiveExplaining[q.id]);

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border space-y-4 text-xs transition-colors shadow-xs ${
                            isCorrect
                              ? 'bg-emerald-50/20 border-emerald-200'
                              : 'bg-rose-50/20 border-rose-200'
                          }`}
                        >
                          {/* Header: Question Number, Prompt & Outcome */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400">
                                Question #{qNumber} of {quizData.questions.length}
                              </span>
                              <p className="font-bold text-slate-900 text-sm leading-snug">
                                {q.question}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              {flaggedQuestions[q.id] && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                                  <Flag className="w-3 h-3 text-amber-600" /> Flagged
                                </span>
                              )}
                              {isCorrect ? (
                                <span className="text-emerald-700 font-mono text-[11px] font-bold flex items-center gap-1 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                </span>
                              ) : (
                                <span className="text-rose-700 font-mono text-[11px] font-bold flex items-center gap-1 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                                  <XCircle className="w-3.5 h-3.5" /> {isAnswered ? 'Incorrect' : 'Unanswered'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options Breakdown Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isThisCorrect = oIdx === q.correctAnswer;
                              const isThisSelected = isAnswered && oIdx === userChoice;

                              let optBorder = 'border-slate-200 bg-white text-slate-700';
                              let badgeColor = 'bg-slate-100 text-slate-600 border-slate-300';

                              if (isThisCorrect) {
                                optBorder = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold';
                                badgeColor = 'bg-emerald-600 text-white border-emerald-600';
                              } else if (isThisSelected && !isThisCorrect) {
                                optBorder = 'border-rose-400 bg-rose-50 text-rose-950 font-semibold';
                                badgeColor = 'bg-rose-600 text-white border-rose-600';
                              }

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${optBorder}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${badgeColor}`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className="leading-snug">{opt}</span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1">
                                    {isThisCorrect && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                        Correct
                                      </span>
                                    )}
                                    {isThisSelected && !isThisCorrect && (
                                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                        Your Choice
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Rationale & Conceptual Explanation Box */}
                          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Verified Rationale & Conceptual Analysis:</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRequestDeepDive(q)}
                                disabled={isExplaining}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                {isExplaining ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                                    <span>Generating Rationale...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 text-[#EC4899]" />
                                    <span>{hasDeepDive ? 'Refresh Deep-Dive' : 'Explain Misconception (AI)'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-slate-700 leading-relaxed">
                              {q.explanation}
                            </p>

                            {/* Deep-Dive AI Response Box */}
                            {hasDeepDive && (
                              <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-slate-800 space-y-2 animate-in fade-in">
                                <div className="font-bold text-indigo-950 flex items-center gap-1.5 text-[11px]">
                                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                                  <span>Tailored Pedagogical Breakdown:</span>
                                </div>
                                <div className="whitespace-pre-line leading-relaxed text-slate-800 font-normal">
                                  {deepDiveExplanations[q.id]}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          ) : (
            <EmptyState
              title="No Quiz Generated"
              description="Enter your subject topic and parameters on the left to generate an interactive quiz session."
              icon={<HelpCircle className="w-8 h-8 text-[#EC4899]" />}
              actionHint="Supports Practice (instant feedback) and Exam (timed) modes with printable worksheets and answer keys."
            />
          )}
        </div>
      </div>
    </div>
  );
};
