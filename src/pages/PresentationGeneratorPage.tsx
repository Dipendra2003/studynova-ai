import React, { useState, useEffect, useRef } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  Copy,
  Check,
  FileText,
  Edit3,
  LayoutGrid,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Palette,
  Eye,
  FileCode,
  Volume2,
  Layers,
  FolderOpen,
  X
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generatePresentationAI } from '../services/aiService';
import { PresentationData, PresentationThemeId, SlideData } from '../types';
import { downloadPresentationPdf } from '../utils/presentationPdfDownloader';

// ============================================================
// THEME SPECIFICATIONS
// ============================================================
interface ThemeMeta {
  id: PresentationThemeId;
  name: string;
  previewBg: string;
  previewAccent: string;
  // Slide container styling
  slideWrapper: string;
  badgeStyle: string;
  titleStyle: string;
  titleBorder: string;
  bulletDot: string;
  bulletText: string;
  takeawayBox: string;
  takeawayLabel: string;
  takeawayText: string;
  notesBox: string;
  notesLabel: string;
  footerBorder: string;
  dotActive: string;
  dotInactive: string;
}

const THEMES: Record<PresentationThemeId, ThemeMeta> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Slate',
    previewBg: '#0F172A',
    previewAccent: '#818CF8',
    slideWrapper: 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 text-white border-slate-700/80 shadow-2xl',
    badgeStyle: 'bg-slate-900/90 border border-slate-700 text-indigo-300 font-mono',
    titleStyle: 'text-white font-black tracking-tight',
    titleBorder: 'border-indigo-500/30',
    bulletDot: 'bg-indigo-400',
    bulletText: 'text-slate-200',
    takeawayBox: 'bg-emerald-950/40 border border-emerald-800/60',
    takeawayLabel: 'text-emerald-400 font-mono',
    takeawayText: 'text-emerald-200',
    notesBox: 'bg-slate-900/90 border border-slate-800 text-slate-300',
    notesLabel: 'text-indigo-400',
    footerBorder: 'border-slate-800',
    dotActive: 'bg-indigo-500',
    dotInactive: 'bg-slate-700 hover:bg-slate-500'
  },
  academic: {
    id: 'academic',
    name: 'Academic High-Contrast',
    previewBg: '#FFFFFF',
    previewAccent: '#2563EB',
    slideWrapper: 'bg-white text-slate-900 border-slate-300 shadow-xl',
    badgeStyle: 'bg-slate-100 border border-slate-300 text-blue-700 font-mono font-semibold',
    titleStyle: 'text-slate-900 font-bold tracking-tight',
    titleBorder: 'border-blue-600/30',
    bulletDot: 'bg-blue-600',
    bulletText: 'text-slate-700',
    takeawayBox: 'bg-amber-50/80 border border-amber-300',
    takeawayLabel: 'text-amber-800 font-semibold',
    takeawayText: 'text-amber-950',
    notesBox: 'bg-slate-50 border border-slate-200 text-slate-700',
    notesLabel: 'text-blue-700',
    footerBorder: 'border-slate-200',
    dotActive: 'bg-blue-600',
    dotInactive: 'bg-slate-300 hover:bg-slate-400'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    previewBg: '#064E3B',
    previewAccent: '#34D399',
    slideWrapper: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-white border-emerald-700/60 shadow-xl',
    badgeStyle: 'bg-emerald-950 border border-emerald-700 text-emerald-300 font-mono',
    titleStyle: 'text-white font-black tracking-tight',
    titleBorder: 'border-emerald-500/40',
    bulletDot: 'bg-emerald-400',
    bulletText: 'text-emerald-100',
    takeawayBox: 'bg-teal-900/50 border border-emerald-600/50',
    takeawayLabel: 'text-emerald-300 font-mono',
    takeawayText: 'text-emerald-100',
    notesBox: 'bg-emerald-950/80 border border-emerald-800 text-emerald-200',
    notesLabel: 'text-emerald-400',
    footerBorder: 'border-emerald-800/60',
    dotActive: 'bg-emerald-400',
    dotInactive: 'bg-emerald-800 hover:bg-emerald-600'
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial Warm',
    previewBg: '#FDFBF7',
    previewAccent: '#D97706',
    slideWrapper: 'bg-[#FDFBF7] text-stone-900 border-stone-300 shadow-xl font-serif',
    badgeStyle: 'bg-stone-100 border border-stone-300 text-stone-700 font-mono font-medium',
    titleStyle: 'text-stone-900 font-serif font-black tracking-tight',
    titleBorder: 'border-amber-700/30',
    bulletDot: 'bg-amber-700',
    bulletText: 'text-stone-800 font-sans',
    takeawayBox: 'bg-amber-100/60 border border-amber-300 font-sans',
    takeawayLabel: 'text-amber-900 font-bold',
    takeawayText: 'text-amber-950',
    notesBox: 'bg-stone-100 border border-stone-200 text-stone-700 font-sans',
    notesLabel: 'text-stone-700 font-bold',
    footerBorder: 'border-stone-300',
    dotActive: 'bg-amber-800',
    dotInactive: 'bg-stone-300 hover:bg-stone-400'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    previewBg: '#090D16',
    previewAccent: '#06B6D4',
    slideWrapper: 'bg-[#090D16] text-slate-100 border-cyan-800/60 shadow-2xl',
    badgeStyle: 'bg-slate-900 border border-cyan-800 text-cyan-400 font-mono',
    titleStyle: 'text-rose-400 font-mono font-black tracking-tight',
    titleBorder: 'border-cyan-500/40',
    bulletDot: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    bulletText: 'text-slate-200',
    takeawayBox: 'bg-slate-900/90 border border-cyan-700/60',
    takeawayLabel: 'text-cyan-400 font-mono',
    takeawayText: 'text-slate-100',
    notesBox: 'bg-[#0D1322] border border-cyan-900/60 text-slate-300 font-mono',
    notesLabel: 'text-rose-400',
    footerBorder: 'border-cyan-900/60',
    dotActive: 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    dotInactive: 'bg-slate-800 hover:bg-slate-600'
  }
};

// ============================================================
// CURATED ACADEMIC PRESETS
// ============================================================
interface PresetTopic {
  label: string;
  topic: string;
  subject: string;
  audience: string;
  style: string;
  instructions: string;
}

const ACADEMIC_PRESETS: PresetTopic[] = [
  {
    label: 'Distributed Raft Consensus',
    topic: 'Distributed Consensus and the Raft Protocol',
    subject: 'Distributed Systems',
    audience: 'Computer Science Undergraduates',
    style: 'Academic & Technical',
    instructions: 'Explain leader election, log replication, terms, and network partition recovery with rigorous architectural insights.'
  },
  {
    label: 'Attention & Transformers',
    topic: 'Self-Attention Mechanism and Transformer Architecture',
    subject: 'Deep Learning & NLP',
    audience: 'Computer Science Undergraduates',
    style: 'Academic & Technical',
    instructions: 'Include Query-Key-Value projection intuition, scaled dot-product formula, multi-head attention benefits, and positional encodings.'
  },
  {
    label: 'Quantum Computing & Qubits',
    topic: 'Principles of Quantum Superposition and Entanglement',
    subject: 'Quantum Information Science',
    audience: 'Computer Science Undergraduates',
    style: 'Academic & Technical',
    instructions: 'Highlight Bloch sphere representation, Hadamard gates, quantum entanglement, and decoherence challenges in physical qubits.'
  },
  {
    label: 'Macroeconomic Inflation Cycles',
    topic: 'Central Bank Interest Rates and Inflation Transmission',
    subject: 'Economics & Monetary Policy',
    audience: 'Industry Professionals',
    style: 'Corporate & Executive',
    instructions: 'Examine demand-pull vs cost-push inflation, Philips curve dynamics, quantitative tightening, and policy lag effects.'
  },
  {
    label: 'Zero-Knowledge Proofs',
    topic: 'Zero-Knowledge Proofs and zk-SNARKs in Cryptography',
    subject: 'Applied Cryptography',
    audience: 'Computer Science Undergraduates',
    style: 'Academic & Technical',
    instructions: 'Explain completeness, soundness, and zero-knowledge criteria with intuitive graph-coloring and polynomial commitment analogies.'
  }
];

export const PresentationGeneratorPage: React.FC = () => {
  // Form State
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState<number>(6);
  const [audience, setAudience] = useState('Computer Science Undergraduates');
  const [subject, setSubject] = useState('Computer Science');
  const [style, setStyle] = useState('Academic & Technical');
  const [instructions, setInstructions] = useState('');

  // AI & Generation State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);

  // Deck Interaction State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTheme, setActiveTheme] = useState<PresentationThemeId>('midnight');
  const [viewMode, setViewMode] = useState<'slide' | 'grid'>('slide');
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenNotes, setShowFullscreenNotes] = useState(false);
  const [showSpeakerNotesInPlayer, setShowSpeakerNotesInPlayer] = useState(true);

  // Action status
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [activeExportMenu, setActiveExportMenu] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Mobile Touch Swipe Handling
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !presentation) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> Next slide
        setCurrentSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else {
        // Swiped right -> Previous slide
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      }
    }
    setTouchStartX(null);
  };


  // ============================================================
  // FULLSCREEN HANDLERS (Browser API + State)
  // ============================================================
  const enterFullscreen = async () => {
    setIsFullscreen(true);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const exitFullscreen = async () => {
    setIsFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Sync state if user exits via browser Escape or F11
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen]);

  // ============================================================
  // KEYBOARD NAVIGATION
  // ============================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!presentation || presentation.slides.length === 0) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(presentation.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        if (isFullscreen) {
          e.preventDefault();
          setShowFullscreenNotes((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          e.preventDefault();
          exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentation, isFullscreen]);

  // ============================================================
  // AI GENERATION HANDLER
  // ============================================================
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a presentation topic.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentSlideIndex(0);

    try {
      const data = await generatePresentationAI({
        topic,
        slideCount,
        audience,
        subject,
        style
      });

      data.theme = activeTheme;
      setPresentation(data);
      setViewMode('slide');
    } catch (err: any) {
      setError(err.message || 'Failed to generate presentation deck.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: PresetTopic) => {
    setTopic(preset.topic);
    setSubject(preset.subject);
    setAudience(preset.audience);
    setStyle(preset.style);
    setInstructions(preset.instructions);
  };

  // ============================================================
  // SLIDE IN-PLACE EDITING FUNCTIONS
  // ============================================================
  const handleUpdateCurrentSlide = (field: keyof SlideData, value: any) => {
    if (!presentation) return;
    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      [field]: value
    };
    setPresentation({ ...presentation, slides: updatedSlides });
  };

  const handleUpdateBullet = (bulletIndex: number, text: string) => {
    if (!presentation) return;
    const currentSlide = presentation.slides[currentSlideIndex];
    const newBullets = [...currentSlide.bullets];
    newBullets[bulletIndex] = text;
    handleUpdateCurrentSlide('bullets', newBullets);
  };

  const handleAddBullet = () => {
    if (!presentation) return;
    const currentSlide = presentation.slides[currentSlideIndex];
    const newBullets = [...currentSlide.bullets, 'New key takeaway point'];
    handleUpdateCurrentSlide('bullets', newBullets);
  };

  const handleRemoveBullet = (bulletIndex: number) => {
    if (!presentation) return;
    const currentSlide = presentation.slides[currentSlideIndex];
    if (currentSlide.bullets.length <= 1) return;
    const newBullets = currentSlide.bullets.filter((_, idx) => idx !== bulletIndex);
    handleUpdateCurrentSlide('bullets', newBullets);
  };

  const handleAddSlide = (atIndex?: number) => {
    if (!presentation) return;
    const insertIdx = atIndex !== undefined ? atIndex : currentSlideIndex + 1;
    const newSlide: SlideData = {
      title: 'New Slide Title',
      bullets: [
        'First primary concept or finding',
        'Second architectural observation or formula',
        'Practical implication or real-world application'
      ],
      speakerNotes: 'Elaborate on the key principles introduced on this slide with concrete examples.',
      keyTakeaway: 'Core takeaway concept for the audience to remember.'
    };

    const newSlides = [...presentation.slides];
    newSlides.splice(insertIdx, 0, newSlide);
    setPresentation({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(insertIdx);
  };

  const handleDuplicateSlide = (index: number) => {
    if (!presentation) return;
    const slideToClone = presentation.slides[index];
    const cloned: SlideData = {
      ...slideToClone,
      title: `${slideToClone.title} (Copy)`,
      bullets: [...slideToClone.bullets]
    };
    const newSlides = [...presentation.slides];
    newSlides.splice(index + 1, 0, cloned);
    setPresentation({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (!presentation || presentation.slides.length <= 1) return;
    const newSlides = presentation.slides.filter((_, idx) => idx !== index);
    const newIdx = Math.min(newSlides.length - 1, currentSlideIndex);
    setPresentation({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(newIdx);
  };

  const handleMoveSlide = (fromIndex: number, direction: 'left' | 'right') => {
    if (!presentation) return;
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= presentation.slides.length) return;

    const newSlides = [...presentation.slides];
    const temp = newSlides[fromIndex];
    newSlides[fromIndex] = newSlides[toIndex];
    newSlides[toIndex] = temp;

    setPresentation({ ...presentation, slides: newSlides });
    setCurrentSlideIndex(toIndex);
  };

  // ============================================================
  // EXPORT HANDLERS
  // ============================================================
  const handleDownloadPdf = async () => {
    if (!presentation) return;
    setPdfGenerating(true);
    try {
      downloadPresentationPdf(presentation, activeTheme);
    } catch (err: any) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setPdfGenerating(false);
      setActiveExportMenu(false);
    }
  };

  const handleDownloadHtmlDeck = () => {
    if (!presentation) return;
    const theme = THEMES[activeTheme];

    const htmlDeck = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${presentation.title} - Slide Deck</title>
<style>
  :root {
    --bg-main: ${theme.previewBg};
    --accent: ${theme.previewAccent};
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0B0F17;
    color: #F8FAFC;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    overflow-x: hidden;
  }
  .deck-container {
    width: 100%;
    max-width: 1100px;
  }
  .deck-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 8px;
    font-size: 14px;
    color: #94A3B8;
  }
  .slide-stage {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: ${theme.previewBg};
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .slide {
    display: none;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
  }
  .slide.active {
    display: flex;
  }
  .slide-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: monospace;
    font-size: 13px;
    color: ${theme.previewAccent};
    font-weight: 700;
  }
  .slide-title {
    font-size: 32px;
    font-weight: 900;
    color: ${activeTheme === 'academic' || activeTheme === 'editorial' ? '#0F172A' : '#FFFFFF'};
    margin: 16px 0 24px 0;
    line-height: 1.25;
    border-bottom: 2px solid ${theme.previewAccent}40;
    padding-bottom: 12px;
  }
  .bullets-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .bullet-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 18px;
    line-height: 1.6;
    color: ${activeTheme === 'academic' || activeTheme === 'editorial' ? '#334155' : '#E2E8F0'};
  }
  .bullet-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${theme.previewAccent};
    margin-top: 10px;
    flex-shrink: 0;
  }
  .takeaway-box {
    margin-top: 24px;
    padding: 14px 20px;
    border-radius: 10px;
    background: ${activeTheme === 'academic' || activeTheme === 'editorial' ? '#FEF3C7' : 'rgba(6, 78, 59, 0.4)'};
    border: 1px solid ${activeTheme === 'academic' || activeTheme === 'editorial' ? '#FCD34D' : '#059669'};
    color: ${activeTheme === 'academic' || activeTheme === 'editorial' ? '#92400E' : '#6EE7B7'};
    font-size: 14px;
    font-weight: 600;
  }
  .controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    gap: 12px;
  }
  .btn {
    background: #1E293B;
    border: 1px solid #334155;
    color: #F8FAFC;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.15s ease;
  }
  .btn:hover {
    background: #334155;
  }
  .btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .notes-panel {
    margin-top: 20px;
    padding: 16px 20px;
    background: #131B2E;
    border: 1px solid #1E293B;
    border-radius: 12px;
    font-size: 14px;
    color: #94A3B8;
    line-height: 1.6;
  }
  .notes-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${theme.previewAccent};
    margin-bottom: 6px;
  }
  @media print {
    body { background: #fff; color: #000; padding: 0; }
    .controls-bar, .deck-header, .notes-panel { display: none !important; }
    .slide-stage { border: none; box-shadow: none; width: 100vw; height: 100vh; page-break-after: always; }
    .slide { display: flex !important; }
  }
</style>
</head>
<body>
<div class="deck-container">
  <div class="deck-header">
    <div><strong>${presentation.title}</strong> &bull; ${presentation.slides.length} Slides</div>
    <div>Use <code>&larr;</code> and <code>&rarr;</code> keys or Spacebar to navigate</div>
  </div>

  <div class="slide-stage" id="stage">
    ${presentation.slides
      .map(
        (slide, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <div>
        <div class="slide-meta">
          <span>SLIDE ${i + 1} OF ${presentation.slides.length}</span>
          <span>${presentation.title}</span>
        </div>
        <h2 class="slide-title">${slide.title}</h2>
        <ul class="bullets-list">
          ${slide.bullets.map((b) => `<li class="bullet-item"><span class="bullet-dot"></span><span>${b}</span></li>`).join('')}
        </ul>
      </div>
      ${
        slide.keyTakeaway
          ? `<div class="takeaway-box"><strong>Key Takeaway:</strong> ${slide.keyTakeaway}</div>`
          : ''
      }
    </div>
    `
      )
      .join('')}
  </div>

  <div class="controls-bar">
    <div style="display: flex; gap: 8px;">
      <button class="btn" id="prevBtn" onclick="prevSlide()">&larr; Previous</button>
      <button class="btn" id="nextBtn" onclick="nextSlide()">Next &rarr;</button>
    </div>
    <span id="slideIndicator" style="font-size: 14px; font-weight: 700; font-family: monospace;">Slide 1 / ${presentation.slides.length}</span>
    <button class="btn" onclick="toggleFullscreen()">Full Screen (F)</button>
  </div>

  <div class="notes-panel" id="notesPanel">
    <div class="notes-title" id="notesLabel">Speaker Notes (Slide 1)</div>
    <div id="notesText">"${presentation.slides[0]?.speakerNotes || 'No notes for this slide.'}"</div>
  </div>
</div>

<script>
  const slides = document.querySelectorAll('.slide');
  const notes = ${JSON.stringify(presentation.slides.map((s) => s.speakerNotes))};
  let current = 0;

  function showSlide(index) {
    if (index < 0 || index >= slides.length) return;
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    
    document.getElementById('slideIndicator').innerText = 'Slide ' + (current + 1) + ' / ' + slides.length;
    document.getElementById('notesLabel').innerText = 'Speaker Notes (Slide ' + (current + 1) + ')';
    document.getElementById('notesText').innerText = '"' + (notes[current] || '') + '"';
    document.getElementById('prevBtn').disabled = current === 0;
    document.getElementById('nextBtn').disabled = current === slides.length - 1;
  }

  function nextSlide() { showSlide(current + 1); }
  function prevSlide() { showSlide(current - 1); }

  function toggleFullscreen() {
    const elem = document.getElementById('stage');
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
  });

  showSlide(0);
</script>
</body>
</html>`;

    const blob = new Blob([htmlDeck], { type: 'text/html' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${presentation.title.replace(/\s+/g, '_')}_Deck.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setActiveExportMenu(false);
  };

  const handleDownloadMarkdownScript = () => {
    if (!presentation) return;
    const md = [
      `# ${presentation.title}`,
      `*Audience: ${audience} | Subject: ${subject || 'General'} | Total Slides: ${presentation.slides.length}*`,
      `\n---\n`,
      ...presentation.slides.map(
        (s, i) => `## Slide ${i + 1}: ${s.title}

### Key Talking Points:
${s.bullets.map((b) => `- ${b}`).join('\n')}

${s.keyTakeaway ? `> **Key Takeaway:** ${s.keyTakeaway}\n` : ''}
### 🎙️ Presenter Script / Speaker Notes:
${s.speakerNotes}

---
`
      )
    ].join('\n');

    const blob = new Blob([md], { type: 'text/markdown' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${presentation.title.replace(/\s+/g, '_')}_Speaker_Notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setActiveExportMenu(false);
  };

  const handleDownloadTextScript = () => {
    if (!presentation) return;
    const text = presentation.slides
      .map(
        (s, idx) => `SLIDE ${idx + 1}: ${s.title}
----------------------------------------
BULLETS:
${s.bullets.map((b) => `• ${b}`).join('\n')}

KEY TAKEAWAY:
${s.keyTakeaway || 'N/A'}

SPEAKER SCRIPT:
${s.speakerNotes}
========================================
`
      )
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${presentation.title.replace(/\s+/g, '_')}_Notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setActiveExportMenu(false);
  };

  const handleCopyDeck = () => {
    if (!presentation) return;
    const text = presentation.slides
      .map(
        (s, idx) => `SLIDE ${idx + 1}: ${s.title}
${s.bullets.map((b) => `• ${b}`).join('\n')}

Speaker Notes:
${s.speakerNotes}
Key Takeaway: ${s.keyTakeaway || 'N/A'}
------------------------------------`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!presentation) return;
    const file = new Blob([JSON.stringify(presentation, null, 2)], {
      type: 'application/json'
    });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `${presentation.title.replace(/\s+/g, '_')}_Deck.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setActiveExportMenu(false);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          setPresentation(parsed);
          setCurrentSlideIndex(0);
          if (parsed.theme && THEMES[parsed.theme as PresentationThemeId]) {
            setActiveTheme(parsed.theme);
          }
          setViewMode('slide');
        } else {
          alert('Invalid presentation JSON structure.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentTheme = THEMES[activeTheme];
  const currentSlide = presentation?.slides[currentSlideIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden File Input for Importing Deck */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      <ToolHeader
        toolNumber="03"
        title="AI Presentation Generator"
        subtitle="Generate, edit, and present complete 16:9 slide decks with speaker notes and multi-theme exports."
        icon={<Presentation className="w-6 h-6 text-[#2563EB]" />}
        badge="16:9 Widescreen Deck"
        category="Productivity & Decks"
        statusText="AI Ready"
      />

      {/* Main Grid: Form on Left (5 cols) + Player on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: PARAMETERS & PRESETS (5 COLS)                   */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Parameters Card */}
          <div className="bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all">
            <div className="flex items-center justify-between border-b border-[#DFE4F2] pb-3">
              <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2563EB]" />
                Presentation Parameters
              </h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#2563EB] flex items-center gap-1 cursor-pointer transition-colors"
                title="Import a previously saved presentation JSON file"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
            </div>

            {/* Quick Academic Presets */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Academic Topics
                </span>
                <span className="text-[10px] text-slate-400">Click to fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ACADEMIC_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs text-left">
              <div>
                <label className="text-slate-800 font-semibold block mb-1">
                  Presentation Topic *
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Distributed Consensus, Transformer Attention, Quantum Gates..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">
                    Slide Count (3–12)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={12}
                    value={slideCount}
                    onChange={(e) => setSlideCount(Math.min(12, Math.max(3, Number(e.target.value))))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Academic Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Computer Science, Physics..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science Undergraduates">Undergraduate Students</option>
                    <option value="Graduate / PhD Researchers">Graduate / PhD Researchers</option>
                    <option value="High School Students">High School Students</option>
                    <option value="Industry Professionals">Industry Professionals</option>
                    <option value="Beginners / General Public">General Public</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">Presentation Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Academic & Technical">Academic & Rigorous</option>
                    <option value="Minimalist & Modern">Minimalist & Punchy</option>
                    <option value="Corporate & Executive">Executive Briefing</option>
                    <option value="Storytelling & Casual">Narrative & Interactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Include speaker notes, highlight formulas, compare algorithm A vs B..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{presentation ? 'Regenerate Presentation Deck' : 'Generate Presentation Deck'}</span>
              </button>
            </form>
          </div>

          {/* Theme Selector Palette Box */}
          <div className="bg-white border border-[#DFE4F2] rounded-3xl p-5 space-y-3 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-[#DFE4F2] pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                Design Themes (5 Styles)
              </span>
              <span className="text-[11px] text-slate-500 capitalize">{activeTheme}</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(THEMES) as PresentationThemeId[]).map((themeKey) => {
                const t = THEMES[themeKey];
                const isSelected = activeTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setActiveTheme(themeKey)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm bg-indigo-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                    title={t.name}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-slate-300/40 shadow-inner flex items-center justify-center relative overflow-hidden"
                      style={{ background: t.previewBg }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: t.previewAccent }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center">
                      {t.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: SLIDE DECK PLAYER / SORTER / EDITOR (7 COLS)   */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Player Control Header */}
          <div className="bg-white border border-[#DFE4F2] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Presentation className="w-4 h-4 text-[#2563EB]" />
                {viewMode === 'slide' ? 'Slide Deck Player' : 'Slide Sorter Grid'}
              </span>

              {presentation && (
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('slide')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === 'slide'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Slide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3 h-3" />
                    <span>Grid Sorter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Actions & Export Buttons */}
            {presentation && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Edit Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    isEditing
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Toggle in-place editing of titles, bullets, and speaker notes"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Done Editing' : 'Edit Slide'}</span>
                </button>

                {/* Copy Deck */}
                <button
                  type="button"
                  onClick={handleCopyDeck}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy formatted text of all slides to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Export Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveExportMenu(!activeExportMenu)}
                    className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Deck</span>
                  </button>

                  {/* Export Menu Dropdown */}
                  {activeExportMenu && (
                    <div
                      className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-left animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setActiveExportMenu(false)}
                    >
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={pdfGenerating}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-500" />
                        <div>
                          <div className="font-semibold text-slate-900">
                            {pdfGenerating ? 'Generating PDF...' : '16:9 Landscape PDF'}
                          </div>
                          <div className="text-[10px] text-slate-500">Vector widescreen presentation</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadHtmlDeck}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-blue-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Interactive HTML Deck</div>
                          <div className="text-[10px] text-slate-500">Standalone presentation viewer</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadMarkdownScript}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Speaker Script (.md)</div>
                          <div className="text-[10px] text-slate-500">Presenter notes & cue cards</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadTextScript}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Plain Text Script (.txt)</div>
                          <div className="text-[10px] text-slate-500">Full transcript notes</div>
                        </div>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={handleDownloadJson}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Deck Data (.json)</div>
                          <div className="text-[10px] text-slate-500">Save project to reload later</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Toggle Responsive Fullscreen Presenter Mode (Press F)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
              </div>
            )}
          </div>

          {/* Player States */}
          {loading ? (
            <LoadingState toolName="Presentation Deck" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : presentation && presentation.slides.length > 0 ? (
            <div className="space-y-4">
              {/* ============================================================ */}
              {/* INLINE SLIDE VIEW MODE                                       */}
              {/* ============================================================ */}
              {viewMode === 'slide' && (
                <>
                  {/* Inline 16:9 Presentation Card Screen */}
                  <div
                    className={`relative min-h-[460px] sm:min-h-[500px] lg:aspect-video w-full rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 ${currentTheme.slideWrapper}`}
                  >
                    {/* Top Slide Meta Header */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] ${currentTheme.badgeStyle}`}>
                          Slide {currentSlideIndex + 1} of {presentation.slides.length}
                        </span>
                        {isEditing && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded">
                            Editing Mode
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono opacity-75 max-w-[200px] truncate hidden sm:inline">
                          {presentation.title}
                        </span>
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="p-1 rounded bg-black/40 hover:bg-black/70 text-white cursor-pointer"
                          title="Open Fullscreen Presenter Mode (F)"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Slide Content Area */}
                    <div className="max-w-2xl mx-auto text-left flex-1 min-h-0 my-2 flex flex-col justify-start w-full overflow-y-auto scrollbar-none pr-1 space-y-3 sm:space-y-3.5">
                      {isEditing ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                            Slide Title
                          </label>
                          <input
                            type="text"
                            value={currentSlide?.title || ''}
                            onChange={(e) => handleUpdateCurrentSlide('title', e.target.value)}
                            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-1.5 text-base sm:text-xl font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>
                      ) : (
                        <h3 className={`text-base sm:text-xl md:text-2xl font-black pb-2 border-b leading-tight tracking-tight shrink-0 ${currentTheme.titleStyle} ${currentTheme.titleBorder}`}>
                          {currentSlide?.title}
                        </h3>
                      )}

                      {/* Bullets List */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                              Bullet Points
                            </label>
                            <button
                              type="button"
                              onClick={handleAddBullet}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Bullet</span>
                            </button>
                          </div>
                          {currentSlide?.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${currentTheme.bulletDot}`} />
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                                className="flex-1 bg-black/20 border border-white/20 rounded px-2.5 py-1 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBullet(bIdx)}
                                disabled={currentSlide.bullets.length <= 1}
                                className="p-1 rounded text-red-400 hover:text-red-300 disabled:opacity-30 cursor-pointer"
                                title="Remove Bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className={`space-y-1.5 sm:space-y-2.5 text-xs sm:text-sm leading-relaxed ${currentTheme.bulletText}`}>
                          {currentSlide?.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2 sm:gap-2.5">
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${currentTheme.bulletDot}`} />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Key Takeaway Banner */}
                      {isEditing ? (
                        <div className="space-y-1 pt-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                            Key Takeaway
                          </label>
                          <input
                            type="text"
                            value={currentSlide?.keyTakeaway || ''}
                            onChange={(e) => handleUpdateCurrentSlide('keyTakeaway', e.target.value)}
                            placeholder="Key takeaway message..."
                            className="w-full bg-black/20 border border-white/20 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>
                      ) : (
                        currentSlide?.keyTakeaway && (
                          <div className="pt-2 shrink-0 mt-auto">
                            <div className={`p-2.5 sm:p-3 rounded-xl ${currentTheme.takeawayBox}`}>
                              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold block mb-0.5 ${currentTheme.takeawayLabel}`}>
                                Key Takeaway
                              </span>
                              <p className={`text-xs sm:text-sm font-medium leading-snug ${currentTheme.takeawayText}`}>
                                {currentSlide.keyTakeaway}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Bottom Slide Paging Controls */}
                    <div className={`flex justify-between items-center pt-3 border-t shrink-0 ${currentTheme.footerBorder}`}>
                      {/* Slide Indicator Dots */}
                      <div className="flex items-center gap-1.5 max-w-[200px] overflow-hidden">
                        {presentation.slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setCurrentSlideIndex(i)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              i === currentSlideIndex
                                ? `w-6 ${currentTheme.dotActive}`
                                : `w-2 ${currentTheme.dotInactive}`
                            }`}
                            aria-label={`Jump to slide ${i + 1}`}
                          />
                        ))}
                      </div>

                      {/* Previous / Next Arrow Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                          disabled={currentSlideIndex === 0}
                          className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 disabled:opacity-30 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
                          title="Previous Slide (Left Arrow)"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Prev</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))
                          }
                          disabled={currentSlideIndex === presentation.slides.length - 1}
                          className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 disabled:opacity-30 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
                          title="Next Slide (Right Arrow or Space)"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Filmstrip Thumbnails Navigation */}
                  <div className="bg-white border border-[#DFE4F2] rounded-2xl p-3 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        Slide Filmstrip
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {currentSlideIndex + 1} / {presentation.slides.length}
                      </span>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                      {presentation.slides.map((s, idx) => {
                        const isActive = idx === currentSlideIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`shrink-0 w-28 sm:w-32 aspect-video rounded-xl p-2 flex flex-col justify-between text-left transition-all cursor-pointer border ${
                              isActive
                                ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-md scale-102'
                                : 'hover:border-slate-400 opacity-75 hover:opacity-100 border-slate-300'
                            }`}
                            style={{ background: currentTheme.previewBg }}
                          >
                            <span
                              className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/40 self-start"
                              style={{ color: currentTheme.previewAccent }}
                            >
                              #{idx + 1}
                            </span>
                            <p
                              className="text-[10px] font-bold line-clamp-2 leading-tight"
                              style={{
                                color:
                                  activeTheme === 'academic' || activeTheme === 'editorial'
                                    ? '#0F172A'
                                    : '#FFFFFF'
                              }}
                            >
                              {s.title}
                            </p>
                          </button>
                        );
                      })}

                      {/* Add Slide Quick Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSlide()}
                        className="shrink-0 w-28 sm:w-32 aspect-video rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Add a new blank slide"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">New Slide</span>
                      </button>
                    </div>
                  </div>

                  {/* Speaker Notes Drawer */}
                  <div className="bg-white border border-[#DFE4F2] rounded-2xl p-4 text-left space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" />
                        Speaker Script & Presenter Notes (Slide {currentSlideIndex + 1}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSpeakerNotesInPlayer(!showSpeakerNotesInPlayer)}
                        className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        {showSpeakerNotesInPlayer ? 'Collapse' : 'Expand'}
                      </button>
                    </div>

                    {showSpeakerNotesInPlayer && (
                      <div>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={currentSlide?.speakerNotes || ''}
                            onChange={(e) => handleUpdateCurrentSlide('speakerNotes', e.target.value)}
                            placeholder="Enter presenter guidance notes..."
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                            "{currentSlide?.speakerNotes || 'No presenter notes provided for this slide.'}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Slide Operations Toolbar */}
                  {isEditing && (
                    <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-indigo-900">
                        Slide Actions (Slide {currentSlideIndex + 1}):
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(currentSlideIndex, 'left')}
                          disabled={currentSlideIndex === 0}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-slate-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                          title="Move slide left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Move Left</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(currentSlideIndex, 'right')}
                          disabled={currentSlideIndex === presentation.slides.length - 1}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-slate-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                          title="Move slide right"
                        >
                          <span>Move Right</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateSlide(currentSlideIndex)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-slate-700 flex items-center gap-1 cursor-pointer"
                          title="Duplicate this slide"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(currentSlideIndex)}
                          disabled={presentation.slides.length <= 1}
                          className="px-2.5 py-1 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-lg disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                          title="Delete this slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ============================================================ */}
              {/* SLIDE SORTER GRID VIEW MODE                                  */}
              {/* ============================================================ */}
              {viewMode === 'grid' && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Viewing all {presentation.slides.length} slides &bull; Reorder, duplicate, or delete cards
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddSlide()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {presentation.slides.map((s, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          idx === currentSlideIndex
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-white'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              Slide {idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, 'left')}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                                title="Move Earlier"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSlide(idx, 'right')}
                                disabled={idx === presentation.slides.length - 1}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 text-slate-600 cursor-pointer"
                                title="Move Later"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateSlide(idx)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(idx)}
                                disabled={presentation.slides.length <= 1}
                                className="p-1 rounded hover:bg-red-50 text-red-500 disabled:opacity-30 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{s.title}</h4>

                          <ul className="text-xs text-slate-600 space-y-1">
                            {s.bullets.slice(0, 2).map((b, bIdx) => (
                              <li key={bIdx} className="line-clamp-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                            {s.bullets.length > 2 && (
                              <li className="text-[10px] text-slate-400 font-mono">
                                + {s.bullets.length - 2} more bullet points
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 italic truncate max-w-[150px]">
                            {s.keyTakeaway ? `Takeaway: ${s.keyTakeaway}` : 'No takeaway'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSlideIndex(idx);
                              setViewMode('slide');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Open Slide &rarr;
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Slide Card in Sorter */}
                    <button
                      type="button"
                      onClick={() => handleAddSlide()}
                      className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer min-h-[160px]"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-xs font-bold">Add New Slide</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Presentation Generated"
              description="Enter your topic and slide parameters on the left to generate an interactive 16:9 presentation deck."
              icon={<Presentation className="w-8 h-8 text-indigo-400" />}
              actionHint="Generates slide titles, structured bullet points, key takeaways, and presenter notes."
            />
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* IMMERSIVE RESPONSIVE FULLSCREEN PRESENTATION STAGE (PORTAL)   */}
      {/* ============================================================ */}
      {isFullscreen && presentation && presentation.slides.length > 0 && (
        <div className="fixed inset-0 z-[99999] bg-[#07090E] flex flex-col justify-between select-none overflow-hidden animate-in fade-in duration-200">
          {/* Top HUD Bar */}
          <div className="w-full px-2 sm:px-6 py-2 sm:py-4 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-20 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <span className="px-1.5 sm:px-2 py-1 bg-white/10 rounded text-[10px] sm:text-xs font-mono font-bold text-white tracking-wider border border-white/10 shrink-0">
                Slide {currentSlideIndex + 1} / {presentation.slides.length}
              </span>
              <span className="text-[10px] sm:text-sm font-semibold text-white/90 truncate min-w-0 flex-1">
                {presentation.title}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Theme Quick Selector in Fullscreen */}
              <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                {(Object.keys(THEMES) as PresentationThemeId[]).map((tId) => (
                  <button
                    key={tId}
                    type="button"
                    onClick={() => setActiveTheme(tId)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      activeTheme === tId
                        ? 'border-white scale-110 shadow-sm'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ background: THEMES[tId].previewBg }}
                    title={THEMES[tId].name}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: THEMES[tId].previewAccent }} />
                  </button>
                ))}
              </div>

              {/* Toggle Notes in Fullscreen */}
              <button
                type="button"
                onClick={() => setShowFullscreenNotes(!showFullscreenNotes)}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  showFullscreenNotes
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-white/10 hover:bg-white/15 text-white/80 border-white/15'
                }`}
                title="Toggle Presenter Speaker Notes (N)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Notes</span>
              </button>

              {/* Exit Fullscreen */}
              <button
                type="button"
                onClick={exitFullscreen}
                className="px-2 sm:px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-sm"
                title="Exit Fullscreen (Esc)"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Responsively Constrained 16:9 Presentation Canvas */}
          <div className="flex-1 w-full min-h-0 flex items-center justify-center p-1 sm:p-3 md:p-6 lg:p-8 overflow-hidden relative">
            {/* Click zones / side arrows for mouse/touch presentation */}
            <button
              type="button"
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 disabled:opacity-0 text-white border border-white/10 transition-all z-20 cursor-pointer hidden md:flex items-center justify-center"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() =>
                setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))
              }
              disabled={currentSlideIndex === presentation.slides.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/80 disabled:opacity-0 text-white border border-white/10 transition-all z-20 cursor-pointer hidden md:flex items-center justify-center"
              title="Next Slide (Right Arrow or Space)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* The Scaled 16:9 Slide Box */}
            <div
              onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className={`w-full max-w-[1400px] h-full sm:h-auto sm:aspect-video rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between shadow-2xl relative transition-all duration-300 overflow-hidden ${currentTheme.slideWrapper}`}
            >
              {/* Slide Top Meta */}
              <div className="flex justify-between items-center text-xs shrink-0 pb-2">
                <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-semibold whitespace-nowrap shrink-0 ${currentTheme.badgeStyle}`}>
                  Slide {currentSlideIndex + 1} of {presentation.slides.length}
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm lg:text-base font-mono opacity-60 truncate max-w-[160px] sm:max-w-md md:max-w-xl lg:max-w-2xl text-right">
                  {presentation.title}
                </span>
              </div>

              {/* Slide Main Content: Title + Bullets + Takeaway */}
              <div className="flex-1 flex flex-col justify-start min-h-0 overflow-y-auto scrollbar-none pr-1 space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6 py-1">
                <h2 className={`text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold pb-1.5 sm:pb-2.5 lg:pb-3 xl:pb-4 border-b leading-tight tracking-tight shrink-0 ${currentTheme.titleStyle} ${currentTheme.titleBorder}`}>
                  {currentSlide?.title}
                </h2>

                <ul className={`space-y-1.5 sm:space-y-2.5 md:space-y-3 lg:space-y-4 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed ${currentTheme.bulletText}`}>
                  {currentSlide?.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 sm:gap-3.5">
                      <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 rounded-full mt-1.5 lg:mt-2 xl:mt-2.5 shrink-0 ${currentTheme.bulletDot}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {currentSlide?.keyTakeaway && (
                  <div className="pt-2 sm:pt-3 shrink-0 mt-auto">
                    <div className={`p-2 sm:p-3 md:p-4 lg:p-4 xl:p-5 rounded-xl sm:rounded-2xl ${currentTheme.takeawayBox}`}>
                      <span className={`text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wider font-bold block mb-0.5 sm:mb-2 ${currentTheme.takeawayLabel}`}>
                        Key Takeaway
                      </span>
                      <p className={`text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold leading-snug ${currentTheme.takeawayText}`}>
                        {currentSlide.keyTakeaway}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Footer with Dots and Controls */}
              <div className={`flex justify-between items-center pt-3 border-t shrink-0 ${currentTheme.footerBorder}`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {presentation.slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentSlideIndex(i)}
                      className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                        i === currentSlideIndex
                          ? `w-8 ${currentTheme.dotActive}`
                          : `w-2 sm:w-2.5 ${currentTheme.dotInactive}`
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))
                    }
                    disabled={currentSlideIndex === presentation.slides.length - 1}
                    className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 disabled:opacity-20 text-white font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Speaker Notes Panel in Fullscreen */}
            {showFullscreenNotes && (
              <div className="absolute bottom-6 right-6 max-w-md w-full bg-slate-950/95 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl z-30 text-left animate-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" />
                    Presenter Script &bull; Slide {currentSlideIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullscreenNotes(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic max-h-48 overflow-y-auto scrollbar-thin">
                  "{currentSlide?.speakerNotes || 'No notes for this slide.'}"
                </p>
              </div>
            )}
          </div>

          {/* Bottom HUD Bar / Keyboard Shortcuts Guide */}
          <div className="hidden md:flex w-full px-6 py-2 bg-black/50 backdrop-blur-md border-t border-white/10 items-center justify-between text-[11px] text-white/60 shrink-0">
            <div className="flex items-center gap-4">
              <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">Space</kbd> to navigate</span>
              <span className="hidden sm:inline">&bull; <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">N</kbd> for Speaker Notes</span>
            </div>
            <div>
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">Esc</kbd> to Exit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
