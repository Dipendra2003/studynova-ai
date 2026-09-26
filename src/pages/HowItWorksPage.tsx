import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Cpu,
  Layers,
  FileCheck2,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Presentation,
  Network,
  Table as TableIcon,
  HelpCircle,
  MessageSquare,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lock
} from 'lucide-react';
import { TOOLS_LIST } from '../data/toolsMeta';

export const HowItWorksPage: React.FC = () => {
  const [expandedTool, setExpandedTool] = useState<string | null>('resume-builder');

  const pipelineStages = [
    {
      step: '01',
      title: 'Multimodal Input Capture',
      tag: 'Data Ingestion',
      accent: 'text-[#7C3AED] bg-[#7C3AED]/10 border-[#7C3AED]/20',
      icon: Layers,
      description:
        'Users provide unstructured text, syllabus topics, uploaded images of handwritten notes, or Google Sheets webhooks. The client performs instant sanitization, file compression, and structural pre-validation.'
    },
    {
      step: '02',
      title: 'Serverless Gemini AI Engine',
      tag: 'Neural Reasoning',
      accent: 'text-[#2563EB] bg-[#2563EB]/10 border-[#2563EB]/20',
      icon: Cpu,
      description:
        'Requests hit secure Node.js serverless functions powered by Google Gemini SDK. Structured JSON schemas (Type.OBJECT) enforce rigorous schema validation, eliminating hallucinations and ensuring predictable outputs.'
    },
    {
      step: '03',
      title: 'Defensive Hydration & AST Parsing',
      tag: 'Zero Mock Guarantee',
      accent: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
      icon: FileCheck2,
      description:
        'The backend validates the generated JSON payload against strict TypeScript models. If rate limits occur, automated multi-model fallback chains (Gemini 3.5 Flash Lite -> 3.8 Flash) guarantee high availability.'
    },
    {
      step: '04',
      title: 'Interactive Vector Rendering',
      tag: 'Immediate Client Output',
      accent: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
      icon: Download,
      description:
        'The frontend instantly hydrates the response into responsive UI instruments: single-page ATS vector PDFs (jspdf), interactive SVG mind maps, 3D flippable flashcards, and live presentation slide players.'
    }
  ];

  const toolDetails: Record<
    string,
    {
      icon: any;
      pipeline: string[];
      techHighlights: string[];
      outputType: string;
      privacyNote: string;
    }
  > = {
    'resume-builder': {
      icon: FileCheck2,
      pipeline: [
        'User enters profile, experience, education, and target job role.',
        'AI bullet point generator rewrites passive achievements into quantified, high-impact STAR statements.',
        'Real-time ATS keyword matching calculates instant compliance score (98%+ target).',
        'Direct Vector ISO-A4 PDF engine renders crisp typography with zero rasterization.'
      ],
      techHighlights: ['jspdf Vector Rendering', 'Live ATS Scanner Metric', 'Container Query Resizing'],
      outputType: 'ATS-Compliant Vector PDF + Live Interactive Resume',
      privacyNote: 'Resumes are compiled entirely in your browser and stored in local storage.'
    },
    'notes-generator': {
      icon: BookOpen,
      pipeline: [
        'Accepts chapter summaries, raw textbook paragraphs, or syllabus bullet points.',
        'Multi-Tier Academic Parser identifies core concepts, formulas, and definitions.',
        'Gemini generates formatted Markdown notes with highlighted exam keywords.',
        'Instant multi-page PDF paginator compiles formatted printable study guides.'
      ],
      techHighlights: ['Custom Academic AST Parser', 'Automatic Page Paginator', 'Exam Focus Tagging'],
      outputType: 'Structured Markdown + Downloadable Study Guide PDF',
      privacyNote: 'Notes stay in your private workspace session.'
    },
    'presentation-generator': {
      icon: Presentation,
      pipeline: [
        'User selects topic, slide count, target audience, and color aesthetic.',
        'AI structures a logical presentation arc: hook, core thesis, data points, and takeaways.',
        'Generates slide-by-slide titles, bullet points, visual icons, and speaker rehearsal scripts.',
        'Interactive 16:9 full-screen slide player allows instant presentation and PDF export.'
      ],
      techHighlights: ['16:9 Aspect Ratio Player', 'Full Speaker Script View', 'Theme Color Palettes'],
      outputType: 'Interactive Slide Deck Player + Multi-Slide PDF',
      privacyNote: 'Presentation decks can be presented online or downloaded offline.'
    },
    'mind-map-generator': {
      icon: Network,
      pipeline: [
        'User enters topic, chapter name, or curriculum outline.',
        'AI recursively partitions concepts into Root -> Categories -> Subtopics -> Key Points.',
        'Custom layout engine computes 2D coordinates and smooth SVG cubic bezier curves.',
        'Interactive canvas supports zoom, pan, node highlighting, and high-res SVG export.'
      ],
      techHighlights: ['Bezier Curve SVG Generator', 'Hierarchical Layout Math', 'Interactive Zoom & Pan'],
      outputType: 'Interactive Scalable SVG Tree + Downloadable Vector Graphics',
      privacyNote: 'Tree layout calculations execute entirely client-side.'
    },
    'google-sheets': {
      icon: TableIcon,
      pipeline: [
        'User connects a lightweight Google Apps Script Web App URL.',
        'Fetches live row records without requiring expensive SQL databases or third-party servers.',
        'Real-time client-side search, filtering, row addition, and student cohort analysis.',
        'AI Data Analyst summarizes performance trends, grade distributions, and at-risk students.'
      ],
      techHighlights: ['Google Apps Script Webhook', 'Zero-Cost Database', 'Automated Cohort Analytics'],
      outputType: 'Live Synced Data Table + AI Pedagogical Report',
      privacyNote: 'Direct connection between your browser and your Google Sheet.'
    },
    'quiz-generator': {
      icon: HelpCircle,
      pipeline: [
        'User specifies topic, difficulty tier, and number of questions.',
        'Gemini constructs active-recall MCQs with plausible distractors and correct keys.',
        'User takes the quiz with instant feedback, score calculation, and progress timer.',
        'AI Socratic Tutor provides deep-dive explanations on why an answer is correct or incorrect.'
      ],
      techHighlights: ['Active Recall Algorithm', 'Plausible Distractor Engine', 'Socratic Explanations'],
      outputType: 'Interactive Quiz Arena + Detailed Answer Explanations',
      privacyNote: 'Scores and quiz history stay saved in your local session.'
    },
    'doubt-solver': {
      icon: MessageSquare,
      pipeline: [
        'Student asks a complex question, math problem, or code debugging query.',
        'Multi-Tier AI reasoning provides a 3-stage breakdown: Intuitive Analogy -> Rigorous Theory -> Practical Example.',
        'Socratic conversational interface allows follow-up questions and step-by-step guidance.',
        'Suggested prompt chips and exam tips guide deeper conceptual understanding.'
      ],
      techHighlights: ['Multi-Tier Explanation Model', 'Analogy-First Pedagogy', 'Conversational Memory'],
      outputType: 'Socratic Tutor Conversation + Actionable Study Tips',
      privacyNote: 'Chat transcripts are private to your device.'
    },
    'flashcard-generator': {
      icon: Layers,
      pipeline: [
        'User inputs study material, vocabulary list, or revision topic.',
        'AI extracts high-yield question/answer pairs designed for optimal active recall.',
        'Renders tactile 3D cards with smooth CSS perspective flip animations on tap/click.',
        'Deck shuffle, mastery tracking, and keyboard navigation enhance revision velocity.'
      ],
      techHighlights: ['CSS 3D Matrix Transforms', 'Deck Shuffle Algorithm', 'Active Recall Scoring'],
      outputType: '3D Interactive Flashcard Deck + Print Ready Cards',
      privacyNote: 'Flashcard mastery state is saved locally.'
    },
    'study-planner': {
      icon: Calendar,
      pipeline: [
        'Student inputs active subjects, available hours per day, and target exam dates.',
        'AI computes a fatigue-aware timetable balancing difficult and lighter subjects.',
        'Generates weekly matrix views, daily checklists, and high-priority study blocks.',
        'Provides printable study calendar and revision countdown trackers.'
      ],
      techHighlights: ['Fatigue-Balanced Scheduling', 'Weekly Matrix Grid', 'Printable Study Timetable'],
      outputType: 'Interactive Timetable + Printable Study Matrix PDF',
      privacyNote: 'Your schedule is private and stored locally.'
    },
    'ocr-summarizer': {
      icon: Camera,
      pipeline: [
        'User uploads photos of handwritten notes, textbook pages, or whiteboard diagrams.',
        'Gemini Multimodal Vision extracts raw text and transcribed formulas with high fidelity.',
        'User can inspect and edit the extracted text before running the summarizer.',
        'AI generates structured bullet points, key equations, and concise exam takeaways.'
      ],
      techHighlights: ['Multimodal Vision AI', 'Handwriting Transcription', 'Formula Extraction'],
      outputType: 'Extracted Editable Text + Structured Summary Notes',
      privacyNote: 'Uploaded images are processed in memory and never stored on a central server.'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-left space-y-16">
      {/* 1. Header Hero */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>System Architecture & Learning Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#080909] tracking-tight font-display">
          How StudyNova AI Works
        </h1>
        <p className="text-base sm:text-lg text-[#080909]/75 font-body leading-relaxed">
          StudyNova AI bridges multimodal input capture, secure serverless AI reasoning, and client-side vector compilation into 10 purpose-built academic instruments.
        </p>
      </div>

      {/* 2. The 4-Stage Learning Pipeline */}
      <div className="bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE4F2] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#080909] font-display">
              The 4-Stage Engineering Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-[#080909]/60 font-body">
              How user inputs transform into production-ready academic deliverables in milliseconds.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-3 py-1 rounded-full w-fit">
            Deterministic Schemas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineStages.map((stage) => {
            const IconComponent = stage.icon;
            return (
              <div
                key={stage.step}
                className="bg-[#F7F8FA] p-6 rounded-2xl border border-[#DFE4F2] flex flex-col justify-between space-y-4 hover:border-[#7C3AED]/40 transition-colors group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#7C3AED] bg-white border border-[#DFE4F2] px-2.5 py-1 rounded-md shadow-2xs">
                      STAGE {stage.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${stage.accent}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#080909] font-display leading-snug">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-[#080909]/75 font-body leading-relaxed">
                    {stage.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DFE4F2]/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#080909]/50">
                    {stage.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Tool-by-Tool Technical Breakdown */}
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2563EB] bg-[#2563EB]/10 px-3 py-1 rounded-full">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Workspace Deep Dives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#080909] font-display">
            Under the Hood of All 10 Tools
          </h2>
          <p className="text-sm text-[#080909]/70 font-body max-w-2xl">
            Click on any workspace below to examine its exact prompt architecture, AI algorithms, and output rendering techniques.
          </p>
        </div>

        <div className="space-y-4">
          {TOOLS_LIST.map((tool) => {
            const details = toolDetails[tool.id];
            const isExpanded = expandedTool === tool.id;

            return (
              <div
                key={tool.id}
                className="bg-white border border-[#DFE4F2] rounded-2xl overflow-hidden shadow-2xs transition-all duration-300"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedTool(isExpanded ? null : tool.id)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-[#F7F8FA]/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-black text-[#7C3AED] bg-[#7C3AED]/10 px-3 py-1.5 rounded-lg">
                      {tool.number}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#080909] font-display">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-[#080909]/60 font-body line-clamp-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-[#7C3AED] bg-[#DFE4F2]/50 px-2.5 py-1 rounded-full font-bold">
                      {tool.category}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#080909]/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#080909]/60" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && details && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-8 pt-2 border-t border-[#DFE4F2] space-y-6 bg-[#FBFBFE]">
                    {/* Execution Pipeline Steps */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#080909] font-display flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Execution Pipeline</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {details.pipeline.map((stepText, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3.5 rounded-xl border border-[#DFE4F2] flex items-start gap-2.5 text-xs text-[#080909]/80 leading-relaxed shadow-2xs"
                          >
                            <span className="w-4 h-4 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{stepText}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Highlights & Output Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-xl border border-[#DFE4F2] space-y-2 shadow-2xs">
                        <span className="font-bold text-[#080909] uppercase tracking-wider block text-[11px]">
                          Key Technologies & Libraries
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {details.techHighlights.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 bg-[#F0EEFA] text-[#7C3AED] font-mono font-semibold rounded-md border border-[#DFE4F2]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#DFE4F2] space-y-2 shadow-2xs">
                        <span className="font-bold text-[#080909] uppercase tracking-wider block text-[11px]">
                          Output Deliverable
                        </span>
                        <p className="text-[#080909]/80 font-medium">
                          {details.outputType}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-semibold pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{details.privacyNote}</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Launch Link */}
                    <div className="pt-2 flex justify-end">
                      <Link
                        to={tool.route}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#080909] hover:bg-[#7C3AED] text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <span>Open {tool.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Privacy & Security Architecture */}
      <div className="bg-[#F7F8FA] border border-[#DFE4F2] rounded-3xl p-6 sm:p-10 space-y-6 text-left">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-3.5 py-1.5 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Privacy Architecture</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#080909] font-display">
          Built for Student Privacy and Zero Data Lock-in
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="bg-white p-5 rounded-2xl border border-[#DFE4F2] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#080909] font-display">
              <Lock className="w-4 h-4 text-[#7C3AED]" />
              <span>Zero Server DB Tracking</span>
            </div>
            <p className="text-[#080909]/70 font-body leading-relaxed">
              We do not store student resumes, generated quizzes, or notes on centralized databases. All work stays in your browser session.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE4F2] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#080909] font-display">
              <Cpu className="w-4 h-4 text-[#2563EB]" />
              <span>Serverless Secret Isolation</span>
            </div>
            <p className="text-[#080909]/70 font-body leading-relaxed">
              Gemini API keys are stored in secure environment variables on serverless functions, protecting tokens from public exposure.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DFE4F2] space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-[#080909] font-display">
              <Download className="w-4 h-4 text-[#10B981]" />
              <span>Client-Side PDF Compilation</span>
            </div>
            <p className="text-[#080909]/70 font-body leading-relaxed">
              Vector PDFs and SVG diagrams are created directly inside the client browser using jsPDF, ensuring lightning-fast exports with zero queues.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Bottom Call to Action */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
          Ready to supercharge your learning?
        </h2>
        <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-body">
          Explore all 10 free AI workspaces and experience seamless academic creation right now.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            to="/#tools"
            className="px-8 py-3.5 bg-white text-[#080909] hover:bg-[#F0EEFA] font-bold text-sm rounded-full transition-colors shadow-md"
          >
            Explore All 10 Tools
          </Link>
          <Link
            to="/about"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm rounded-full transition-colors"
          >
            About StudyNova AI
          </Link>
        </div>
      </div>
    </div>
  );
};
