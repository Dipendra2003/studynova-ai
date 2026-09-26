import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Presentation,
  Network,
  Table as TableIcon,
  HelpCircle,
  MessageSquare,
  Layers,
  Calendar,
  Camera,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Code,
  Zap,
} from "lucide-react";
import heroVisualImg from "../assets/images/hero_playful_ai_student_1790345403725.jpg";

export const Home: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tools = [
    {
      number: "01",
      name: "AI Resume Builder",
      route: "/resume-builder",
      description: "Create professional ATS-friendly resumes with AI.",
      accent: "#7C3AED", // Studio Purple
      accentBg: "bg-[#7C3AED]/10 text-[#7C3AED]",
      tags: ["ATS-Compliant", "Vector PDF", "Instant Export"],
      cta: "Build Resume →",
      visualType: "document",
    },
    {
      number: "02",
      name: "AI Notes Generator",
      route: "/notes-generator",
      description: "Turn raw study material into structured notes.",
      accent: "#F59E0B", // Warm Amber
      accentBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
      tags: ["Markdown", "Study Guide", "Exam Points"],
      cta: "Generate Notes →",
      visualType: "notes",
    },
    {
      number: "03",
      name: "AI Presentation Generator",
      route: "/presentation-generator",
      description: "Generate complete slide-by-slide presentation content.",
      accent: "#2563EB", // Electric Blue
      accentBg: "bg-[#2563EB]/10 text-[#2563EB]",
      tags: ["Slide Decks", "Interactive Player", "Speaker Script"],
      cta: "Create Presentation →",
      visualType: "presentation",
    },
    {
      number: "04",
      name: "AI Mind Map Generator",
      route: "/mind-map-generator",
      description: "Convert syllabi and topics into visual mind maps.",
      accent: "#10B981", // Mint
      accentBg: "bg-[#10B981]/10 text-[#10B981]",
      tags: ["Interactive SVG", "Node Explorer", "Visual Outlines"],
      cta: "Create Mind Map →",
      visualType: "mindmap",
    },
    {
      number: "05",
      name: "Google Sheets Data Tool",
      route: "/google-sheets",
      description: "Connect Google Sheets and visualize live data.",
      accent: "#10B981", // Mint / Electric Blue
      accentBg: "bg-[#10B981]/10 text-[#10B981]",
      tags: ["Live Sync", "Zero-Server DB", "Data Insights"],
      cta: "Open Sheets Tool →",
      visualType: "sheets",
    },
    {
      number: "06",
      name: "AI Quiz Generator",
      route: "/quiz-generator",
      description: "Generate interactive quizzes from topics and notes.",
      accent: "#EC4899", // Soft Pink
      accentBg: "bg-[#EC4899]/10 text-[#EC4899]",
      tags: ["Instant Grading", "Explanations", "Active Recall"],
      cta: "Generate Quiz →",
      visualType: "quiz",
    },
    {
      number: "07",
      name: "AI Doubt Solver",
      route: "/doubt-solver",
      description: "Ask questions and learn through AI-powered explanations.",
      accent: "#7C3AED", // Studio Purple
      accentBg: "bg-[#7C3AED]/10 text-[#7C3AED]",
      tags: ["Step-by-Step", "Real Analogies", "Tutor Chat"],
      cta: "Ask AI →",
      visualType: "tutor",
    },
    {
      number: "08",
      name: "AI Flashcard Generator",
      route: "/flashcard-generator",
      description: "Turn study material into interactive revision cards.",
      accent: "#2563EB", // Electric Blue
      accentBg: "bg-[#2563EB]/10 text-[#2563EB]",
      tags: ["3D Flip", "Spaced Recall", "Deck Shuffle"],
      cta: "Create Flashcards →",
      visualType: "flashcards",
    },
    {
      number: "09",
      name: "AI Study Planner",
      route: "/study-planner",
      description: "Generate personalized study timetables with AI.",
      accent: "#F59E0B", // Warm Amber
      accentBg: "bg-[#F59E0B]/10 text-[#F59E0B]",
      tags: ["Day Matrix", "Exam Timetable", "Priority Focus"],
      cta: "Plan My Study →",
      visualType: "planner",
    },
    {
      number: "10",
      name: "OCR Notes Summarizer",
      route: "/ocr-summarizer",
      description: "Scan notes, extract text and summarize them with AI.",
      accent: "#EC4899", // Soft Pink
      accentBg: "bg-[#EC4899]/10 text-[#EC4899]",
      tags: ["Multimodal OCR", "Handwriting Scan", "Structured Summary"],
      cta: "Scan Notes →",
      visualType: "ocr",
    },
  ];

  const renderToolVisual = (type: string, accent: string) => {
    switch (type) {
      case "document":
        return (
          <div className="relative w-full bg-[#FBFBFE] rounded-2xl border border-[#DFE4F2] p-3.5 sm:p-4 overflow-hidden shadow-xs group-hover:shadow-md transition-all duration-300">
            {/* Top Document Header Bar */}
            <div className="flex items-center justify-between border-b border-[#DFE4F2] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                <span className="text-[10.5px] font-mono font-bold text-[#080909] tracking-wide">
                  ALEX_RIVERA_RESUME.PDF
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#DFE4F2]/70 text-[#080909]/80 rounded font-bold">
                  Vector ISO A4
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-emerald-800 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>ATS 98% MATCH</span>
              </div>
            </div>

            {/* Content Grid: Mini Resume Sheet + Live ATS Audit */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-left">
              {/* Left Column: Authentic Miniature Resume Preview */}
              <div className="md:col-span-7 bg-white rounded-xl border border-[#DFE4F2] p-2.5 sm:p-3 space-y-2 shadow-2xs">
                {/* Candidate Header */}
                <div className="border-b border-[#DFE4F2]/80 pb-1.5 flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-[#080909] tracking-tight">
                      Alex Rivera
                    </h4>
                    <p className="text-[10px] font-semibold text-[#7C3AED]">
                      Lead AI & Full-Stack Systems Engineer
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    San Francisco, CA
                  </span>
                </div>

                {/* Experience Item */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#080909]">
                      Lead AI Engineer · TechCore Labs
                    </span>
                    <span className="font-mono text-[9px] text-slate-600">
                      2022–Present
                    </span>
                  </div>
                  <ul className="text-[9.5px] text-[#080909]/80 space-y-0.5 pl-2 border-l-2 border-[#7C3AED]/40">
                    <li className="leading-tight truncate">
                      • Shipped distributed LLM pipelines processing 12M+ token
                      requests/day
                    </li>
                    <li className="leading-tight truncate">
                      • Cut vector search latency by 42% via real-time hybrid
                      index caching
                    </li>
                  </ul>
                </div>

                {/* Skills Pills */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {[
                    "Python",
                    "TypeScript",
                    "Next.js",
                    "PyTorch",
                    "Vector DB",
                  ].map((s) => (
                    <span
                      key={s}
                      className="text-[8.5px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#080909]/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Live ATS Compliance Audit Card */}
              <div className="md:col-span-5 bg-[#F0EEFA]/50 rounded-xl border border-[#DFE4F2] p-2.5 sm:p-3 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                      ATS Scanner Audit
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-1 text-[9.5px] text-[#080909]/85 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Section Heading Hierarchy</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Zero Unparseable Tables</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>100% Vector Text Embedding</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Standard 1-Page Ratio</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DFE4F2]/70 flex items-center justify-between text-[9px] font-mono text-[#080909]/70">
                  <span>Export: PDF / MD / TXT</span>
                  <span className="font-bold text-[#7C3AED]">Ready</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="relative w-full h-32 bg-[#F7F8FA] rounded-2xl border border-[#DFE4F2] p-3 overflow-hidden shadow-sm flex items-center justify-center">
            {/* Sticky notes visual */}
            <div className="absolute top-2 left-3 w-24 h-24 bg-[#FEF3C7] rounded-xl border border-[#FDE68A] p-2 rotate-[-4deg] shadow-sm flex flex-col justify-between group-hover:rotate-0 transition-transform">
              <div className="text-[9px] font-bold text-amber-900">
                # Key Concept
              </div>
              <div className="text-[8px] text-amber-800 line-clamp-3">
                Active recall strengthens neural pathways...
              </div>
              <div className="h-1 w-8 bg-amber-400 rounded-full" />
            </div>
            <div className="absolute top-4 right-3 w-24 h-24 bg-[#DFE4F2] rounded-xl border border-[#CBD5E1] p-2 rotate-[6deg] shadow-sm flex flex-col justify-between group-hover:rotate-2 transition-transform">
              <div className="text-[9px] font-bold text-slate-800">
                Exam Note
              </div>
              <div className="text-[8px] text-slate-600 line-clamp-3">
                Synthesizes verbatim definitions
              </div>
              <div className="h-1 w-6 bg-[#2563EB] rounded-full" />
            </div>
          </div>
        );

      case "presentation":
        return (
          <div className="relative w-full h-32 bg-[#1E293B] rounded-2xl border border-slate-700 p-3 overflow-hidden shadow-sm flex flex-col justify-between text-white group-hover:scale-102 transition-transform">
            <div className="flex items-center justify-between text-[10px] text-amber-300 font-mono">
              <span>SLIDE 01 / 06</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Quantum Computing
              </div>
              <div className="text-[10px] text-slate-400">
                Superposition & Entanglement
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-amber-400 rounded-full" />
              <div className="h-1 flex-1 bg-slate-600 rounded-full" />
              <div className="h-1 flex-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        );

      case "mindmap":
        return (
          <div className="relative w-full h-32 bg-white rounded-2xl border border-[#DFE4F2] p-3 overflow-hidden shadow-sm flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-lg bg-[#10B981] text-white text-[10px] font-bold shadow-sm">
                Central Topic
              </div>
              <div className="w-6 h-0.5 bg-[#10B981]" />
              <div className="space-y-2">
                <div className="px-2 py-0.5 rounded bg-[#DFE4F2] text-[9px] font-medium text-[#080909]">
                  Branch Alpha
                </div>
                <div className="px-2 py-0.5 rounded bg-[#DFE4F2] text-[9px] font-medium text-[#080909]">
                  Branch Beta
                </div>
              </div>
            </div>
          </div>
        );

      case "sheets":
        return (
          <div className="relative w-full h-32 bg-[#F7F8FA] rounded-2xl border border-[#DFE4F2] p-2.5 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center">
              <div className="bg-[#DFE4F2] p-1 rounded font-bold text-[#080909]">
                Metric
              </div>
              <div className="bg-[#DFE4F2] p-1 rounded font-bold text-[#080909]">
                Target
              </div>
              <div className="bg-[#DFE4F2] p-1 rounded font-bold text-[#080909]">
                Status
              </div>
              <div className="bg-white p-1 rounded border border-[#DFE4F2]">
                Calculus
              </div>
              <div className="bg-white p-1 rounded border border-[#DFE4F2]">
                95%
              </div>
              <div className="bg-emerald-100 text-emerald-800 p-1 rounded font-bold">
                Passed
              </div>
              <div className="bg-white p-1 rounded border border-[#DFE4F2]">
                Physics
              </div>
              <div className="bg-white p-1 rounded border border-[#DFE4F2]">
                90%
              </div>
              <div className="bg-blue-100 text-blue-800 p-1 rounded font-bold">
                Review
              </div>
            </div>
          </div>
        );

      case "quiz":
        return (
          <div className="relative w-full h-32 bg-white rounded-2xl border border-[#DFE4F2] p-3 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-bold text-[#EC4899] font-mono">
              QUESTION 01
            </div>
            <div className="text-[11px] font-medium text-[#080909] line-clamp-1">
              What is the primary function of DNA?
            </div>
            <div className="space-y-1">
              <div className="px-2 py-1 rounded bg-[#EC4899]/15 border border-[#EC4899]/30 text-[9px] font-bold text-[#EC4899] flex items-center justify-between">
                <span>A. Genetic encoding</span>
                <CheckCircle2 className="w-3 h-3 text-[#EC4899]" />
              </div>
              <div className="px-2 py-1 rounded bg-[#F7F8FA] text-[9px] text-[#080909]/60">
                <span>B. Energy storage</span>
              </div>
            </div>
          </div>
        );

      case "tutor":
        return (
          <div className="relative w-full h-32 bg-[#F7F8FA] rounded-2xl border border-[#DFE4F2] p-3 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-[10px] font-bold">
                AI
              </div>
              <span className="text-[10px] font-bold text-[#080909]">
                Socratic Tutor
              </span>
            </div>
            <div className="bg-white rounded-xl p-2 border border-[#DFE4F2] text-[10px] text-[#080909] shadow-xs">
              "Think of a cell membrane like a selective security checkpoint..."
            </div>
            <div className="text-[9px] text-[#6366F1] font-bold">
              Analogy + Multi-Tier Explanation
            </div>
          </div>
        );

      case "flashcards":
        return (
          <div className="relative w-full h-32 bg-white rounded-2xl border border-[#DFE4F2] p-3 overflow-hidden shadow-sm flex items-center justify-center">
            <div className="relative w-36 h-20 bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] text-white rounded-xl shadow-md p-3 flex flex-col justify-between group-hover:rotate-3 transition-transform">
              <span className="text-[9px] font-mono opacity-80">
                ACTIVE RECALL
              </span>
              <span className="text-[11px] font-bold">
                Photosynthesis Equation
              </span>
              <span className="text-[8px] text-right underline opacity-90">
                Click to flip ↻
              </span>
            </div>
          </div>
        );

      case "planner":
        return (
          <div className="relative w-full h-32 bg-[#F7F8FA] rounded-2xl border border-[#DFE4F2] p-2.5 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#D97706]">
              <span>WEEK 04 MATRIX</span>
              <span>28 HRS</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[8px] text-center font-mono">
              <div className="bg-amber-100 text-amber-900 p-1 rounded">
                MON
                <br />
                4h Math
              </div>
              <div className="bg-white border border-[#DFE4F2] text-[#080909] p-1 rounded">
                TUE
                <br />
                3h Phys
              </div>
              <div className="bg-amber-100 text-amber-900 p-1 rounded">
                WED
                <br />
                5h Chem
              </div>
              <div className="bg-white border border-[#DFE4F2] text-[#080909] p-1 rounded">
                THU
                <br />
                4h Bio
              </div>
            </div>
            <div className="h-1 bg-[#D97706] rounded-full w-2/3" />
          </div>
        );

      case "ocr":
        return (
          <div className="relative w-full h-32 bg-[#0F172A] text-teal-400 rounded-2xl border border-slate-800 p-3 overflow-hidden shadow-sm flex flex-col justify-between font-mono">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-teal-300">SCANNER_READY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-300 line-clamp-2">
              [EXTRACTED] "Theorem 4.1: If f is continuous on [a,b]..."
            </div>
            <div className="flex items-center justify-between text-[9px] text-teal-300">
              <span>99.2% Accuracy</span>
              <span className="bg-teal-900/60 px-1.5 py-0.5 rounded text-white font-bold">
                OCR ✓
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const faqs = [
    {
      q: "Are all 10 tools functional and free to use?",
      a: "Yes, absolutely. All 10 tools are production-ready student workspaces with live AI processing, zero paywalls, zero token subscriptions, and immediate exports.",
    },
    {
      q: "How does the AI Resume Builder generate ATS-compliant PDFs?",
      a: "The Resume Builder employs standard typography grids, ATS parseable headings, and direct vector PDF generation so no text gets rasterized into an image. It passes automated applicant tracking scanners effortlessly.",
    },
    {
      q: "Can I upload photos of handwritten notes for the OCR Summarizer?",
      a: "Yes! You can take a photo of whiteboard equations or lecture notes, upload it in JPG/PNG/WebP format, inspect the extracted text, and generate a concise revision breakdown.",
    },
    {
      q: "How does the Google Sheets integration work?",
      a: "You can hook up any Google Apps Script Web App URL to use Google Sheets as a live zero-maintenance database. Read rows, edit student records, and generate AI insights on your live spreadsheet data.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen text-[#080909]">
      {/* 1. EXPERIMENTAL EDITORIAL HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-28 overflow-hidden">
        {/* Soft atmospheric background shapes */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#DFE4F2]/70 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-40 -left-20 w-[380px] h-[380px] bg-[#7C3AED]/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-60 -right-20 w-[400px] h-[400px] bg-[#2563EB]/5 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Hero Statement: Oversized Typography & Editorial Spacing */}
            <div className="lg:col-span-6 space-y-8 text-left">
              {/* Studio badge kicker */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#080909] bg-[#F7F8FA] border border-[#DFE4F2] px-4 py-1.5 rounded-full shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                <span>Creative AI Studio × Modern Education</span>
              </div>

              {/* Exact user-requested Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#080909] leading-[1.04] tracking-tight font-display text-balance">
                Learn smarter.
                <br />
                Create faster.
                <br />
                <span className="text-[#7C3AED]">Build with AI.</span>
              </h1>

              {/* Exact user-requested Supporting text */}
              <p className="text-lg sm:text-xl text-[#080909]/75 font-body max-w-xl leading-relaxed">
                10 practical AI-powered tools for students, creators and
                learners.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <a
                  href="#tools"
                  className="group px-8 py-4 rounded-full bg-[#080909] hover:bg-[#7C3AED] text-white text-sm sm:text-base font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                >
                  <span>Explore AI Tools</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  to="/how-it-works"
                  className="px-7 py-4 rounded-full bg-white hover:bg-[#DFE4F2] text-[#080909] border border-[#DFE4F2] text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span>See How It Works</span>
                </Link>
              </div>

              {/* Editorial Value Proof Stats */}
              <div className="pt-8 border-t border-[#DFE4F2] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-display text-[#080909]">
                    10
                  </div>
                  <div className="text-xs text-[#080909]/60 font-body">
                    Working Tools
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-display text-[#7C3AED]">
                    100%
                  </div>
                  <div className="text-xs text-[#080909]/60 font-body">
                    Free Access
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black font-display text-[#10B981]">
                    Instant
                  </div>
                  <div className="text-xs text-[#080909]/60 font-body">
                    PDF & Output
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Playful 3D Tactile Educational Character & Floating Elements */}
            <div className="lg:col-span-6 relative lg:scale-105 lg:origin-right mt-8 lg:mt-0 lg:-translate-y-4">
              <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-[#DFE4F2] bg-white shadow-2xl group">
                <img
                  src={heroVisualImg}
                  alt="Playful 3D tactile educational character interacting with student tools"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Tactile Badges around character */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-[#DFE4F2] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-xs font-bold text-[#080909] animate-bounce duration-1000">
                  <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Curated for Students</span>
                </div>

                <div className="absolute bottom-4 right-4 bg-[#080909]/90 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-2 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gemini AI Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOOL SHOWCASE SECTION */}
      <section
        id="tools"
        className="py-24 relative overflow-hidden bg-gradient-to-b from-[#F7F8FA] to-white border-t border-[#DFE4F2]"
      >
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#7C3AED]/5 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-t from-[#2563EB]/5 to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-left space-y-4 mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 px-4 py-1.5 rounded-full ring-1 ring-[#7C3AED]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Catalog & Workspaces</span>
            </div>
            {/* User requested Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#080909] tracking-tight font-display text-balance leading-[1.1]">
              10 tools.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EC4899]">
                One creative
              </span>{" "}
              learning workspace.
            </h2>
            <p className="text-lg text-[#080909]/70 font-body leading-relaxed max-w-2xl">
              Every tool is a fully functional workspace designed for maximum
              retention, academic rigor, and effortless execution. Powered by
              StudyNova AI.
            </p>
          </div>

          {/* Editorial Asymmetric Grid for the 10 Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
            {tools.map((tool, idx) => {
              // Asymmetric span: make item 01 and item 05 wider on desktop
              const isWide = idx === 0 || idx === 4;

              return (
                <Link
                  key={tool.number}
                  to={tool.route}
                  className={`group relative overflow-hidden bg-white/80  backdrop-blur-xl rounded-3xl border border-white/40  p-6 sm:p-7 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] cursor-pointer text-left ${
                    isWide ? "lg:col-span-2" : "lg:col-span-1"
                  }`}
                >
                  {/* Glassmorphic Gradient Glow on Hover */}
                  <div className="absolute -inset-px bg-gradient-to-br from-transparent to-transparent group-hover:from-white/50 group-hover:to-white/10 z-0 transition-all duration-500 pointer-events-none rounded-3xl" />
                  <div
                    className="absolute -inset-4 bg-gradient-to-tr opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl pointer-events-none z-0"
                    style={{
                      backgroundImage: `linear-gradient(to top right, ${tool.accent}, transparent)`,
                    }}
                  />

                  <div className="space-y-5 relative z-10">
                    {/* Top Row: Number & Badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-[#080909] px-2.5 py-1 rounded-full bg-[#DFE4F2]/60">
                        {tool.number}
                      </span>
                      <span className="text-xs font-bold text-[#080909]/50 group-hover:text-[#7C3AED] transition-colors flex items-center gap-1">
                        <span>Workspace</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </span>
                    </div>

                    {/* Small Playful Visual Component */}
                    <div className="w-full">
                      {renderToolVisual(tool.visualType, tool.accent)}
                    </div>

                    {/* Tool Name & One-line Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-[#080909] font-display group-hover:translate-x-1 transition-transform">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-[#080909]/70 font-body leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-semibold text-[#080909]/75 bg-[#F7F8FA] border border-[#DFE4F2] px-2.5 py-1 rounded-lg font-body"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action CTA */}
                  <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between relative z-10">
                    <span className="text-xs font-bold text-[#080909] group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-display">
                      <span>{tool.cta}</span>
                    </span>
                    <span className="w-8 h-8 rounded-full bg-[#080909] text-white flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 group-hover:rotate-[-45deg] transition-all shadow-md">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL STORYTELLING: HOW IT WORKS */}
      <section className="py-20 border-t border-[#DFE4F2] bg-[#F0EEFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left space-y-3 mb-14 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              <span>Simplicity & Speed</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#080909] tracking-tight font-display">
              From study material to mastery in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl border border-[#DFE4F2] space-y-4 shadow-sm hover:border-[#080909]/30 transition-colors">
              <span className="w-10 h-10 rounded-2xl bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-black font-mono text-sm">
                01
              </span>
              <h3 className="text-xl font-black text-[#080909] font-display">
                Feed Your Input
              </h3>
              <p className="text-sm text-[#080909]/70 font-body leading-relaxed">
                Paste raw lecture paragraphs, upload notebook photos, enter
                chapter titles, or link a live Google Sheet.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#DFE4F2] space-y-4 shadow-sm hover:border-[#080909]/30 transition-colors">
              <span className="w-10 h-10 rounded-2xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center font-black font-mono text-sm">
                02
              </span>
              <h3 className="text-xl font-black text-[#080909] font-display">
                Intelligent AI Synthesis
              </h3>
              <p className="text-sm text-[#080909]/70 font-body leading-relaxed">
                Gemini processes your material through structured academic
                frameworks into notes, 3D flipcards, MCQs, or slide decks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#DFE4F2] space-y-4 shadow-sm hover:border-[#080909]/30 transition-colors">
              <span className="w-10 h-10 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center font-black font-mono text-sm">
                03
              </span>
              <h3 className="text-xl font-black text-[#080909] font-display">
                Interact & Export
              </h3>
              <p className="text-sm text-[#080909]/70 font-body leading-relaxed">
                Test your memory, present live slides, download vector
                ATS-friendly PDFs, or copy formatted Markdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 border-t border-[#DFE4F2] bg-[#F7F8FA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Questions & Answers
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#080909] font-display">
              Everything you need to know.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#DFE4F2] rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 text-base font-bold text-[#080909] hover:text-[#7C3AED] transition-colors cursor-pointer"
                >
                  <span className="font-display">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#080909]/50 transition-transform ${
                      openFaq === idx ? "rotate-180 text-[#7C3AED]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-[#080909]/70 leading-relaxed font-body border-t border-[#DFE4F2]/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
