import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Copy,
  Download,
  Sparkles,
  FileText,
  Check,
  Printer,
  Layers,
  FileDown,
  Edit3,
  Eye,
  Upload,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
  BookMarked,
  FileCode,
  ListPlus
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generateNotesAI } from '../services/aiService';
import { downloadVectorNotesPdf, downloadElementAsPdf } from '../utils/pdfDownloader';
import { paginateNotesData, parseTableFromText, ParsedTable, NotesPage, NotesBlock } from '../utils/notesPaginator';
import { NotesData } from '../types';

const PRESET_TOPICS = [
  { topic: 'Process Scheduling & Deadlocks (FCFS, Round Robin, Banker\'s Algorithm)', subject: 'Operating Systems' },
  { topic: 'TCP vs UDP Protocols & OSI 7-Layer Reference Model', subject: 'Computer Networks' },
  { topic: 'Relational Database Normalization (1NF, 2NF, 3NF, BCNF) & ACID', subject: 'Database Systems' },
  { topic: 'Cellular Respiration, Glycolysis & Photosynthesis Reactions', subject: 'Biology' },
  { topic: 'Macroeconomic Fiscal Policy, Monetary Transmission & Inflation', subject: 'Economics' },
  { topic: 'Supervised Learning: Gradient Descent, Neural Networks & Backprop', subject: 'Machine Learning' }
];

export const NotesGeneratorPage: React.FC = () => {
  // Input Mode: 'topic' vs 'material'
  const [inputMode, setInputMode] = useState<'topic' | 'material'>('topic');

  // Form States
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [length, setLength] = useState<'concise' | 'balanced' | 'comprehensive'>('balanced');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [language, setLanguage] = useState('English');
  const [includeSourceInPdf, setIncludeSourceInPdf] = useState(true);

  // Workflow States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesData, setNotesData] = useState<NotesData | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Pagination & Preview View Mode
  const [previewViewMode, setPreviewViewMode] = useState<'paginated' | 'continuous'>('paginated');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);

  // Scroll to preview card top when flipping pages
  useEffect(() => {
    if (previewCardRef.current) {
      previewCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPage]);

  // Calculate A4 Page Model dynamically using shared paginator
  const pages: NotesPage[] = useMemo(() => (notesData ? paginateNotesData(notesData) : []), [notesData, includeSourceInPdf]);
  const totalPages = pages.length > 0 ? pages.length : 1;

  // Ensure currentPage stays within valid bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  // Keyboard navigation for flipping pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!notesData || previewViewMode !== 'paginated' || editMode) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notesData, previewViewMode, totalPages, editMode]);

  const handleApplyPreset = (preset: { topic: string; subject: string }) => {
    setTopic(preset.topic);
    setSubject(preset.subject);
    setError(null);
  };

  const handleGenerate = async (e?: React.FormEvent, customTopic?: string, customSubject?: string) => {
    if (e) e.preventDefault();

    const activeTopic = customTopic !== undefined ? customTopic : topic;
    const activeSubject = customSubject !== undefined ? customSubject : subject;
    const activeRaw = inputMode === 'material' ? rawContent : '';

    if (!activeTopic.trim() && !activeRaw.trim()) {
      setError('Please provide a Topic name or syllabus outline to generate notes.');
      return;
    }

    setLoading(true);
    setError(null);
    setEditMode(false);
    setCurrentPage(1);

    try {
      const data = await generateNotesAI({
        topic: activeTopic.trim() || (activeRaw.slice(0, 50).trim() + '...'),
        subject: activeSubject.trim() || 'General Academic',
        rawContent: activeRaw,
        length,
        difficulty,
        language
      });
      data.includeSourceInPdf = includeSourceInPdf;
      data.sourceContent = activeRaw || data.sourceContent || '';
      setNotesData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate study notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawContent(content);
        setInputMode('material');
        if (!topic.trim()) {
          const suggested = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTopic(suggested);
        }
      }
    };
    reader.readAsText(file);
  };

  const buildMarkdown = (notes: NotesData): string => {
    const sourceSectionMd =
      notes.sourceContent && notes.includeSourceInPdf !== false
        ? `\n\n## 7. Provided Study Material Reference\n${notes.sourceContent}\n`
        : '';

    const quickRevMd = notes.quickRevision
      ? `\n\n## High-Yield Quick Revision & Cram Summary\n${notes.quickRevision}\n`
      : '';

    return `# ${notes.title}

## Module Overview
${notes.overview}
${quickRevMd}
## 1. Core Concepts & Detailed Explanations
${notes.mainConcepts.map((c) => `### ${c.concept}\n${c.points.map((p) => `- ${p}`).join('\n')}`).join('\n\n')}

## 2. Key Terminology & Definitions
${notes.importantTerms.map((t) => `- **${t.term}**: ${t.definition}`).join('\n')}

## 3. High-Yield Key Takeaways
${notes.keyPoints.map((k) => `- ${k}`).join('\n')}

## 4. Practical Examples & Analogies
${notes.examples.map((ex) => `- ${ex}`).join('\n')}

## 5. Crucial Exam Tips & Trap Warnings
${notes.examPoints.map((ep) => `- ${ep}`).join('\n')}${sourceSectionMd}
    `.trim();
  };

  const handleCopy = () => {
    if (!notesData) return;
    const markdown = buildMarkdown(notesData);
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    if (!notesData) return;
    const markdown = buildMarkdown(notesData);
    const element = document.createElement('a');
    const file = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${notesData.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Study_Notes'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadTxt = () => {
    if (!notesData) return;
    const sourcePart = notesData.sourceContent
      ? `\n\n7. ORIGINAL SOURCE STUDY MATERIAL:\n${notesData.sourceContent}\n`
      : '';

    const quickRevTxt = notesData.quickRevision
      ? `\nHIGH-YIELD QUICK REVISION:\n${notesData.quickRevision}\n\n`
      : '\n';

    const element = document.createElement('a');
    const file = new Blob(
      [
        `${notesData.title}\n${'='.repeat(notesData.title.length)}\n\nOVERVIEW:\n${notesData.overview}\n${quickRevTxt}` +
          `1. MAIN CONCEPTS:\n${notesData.mainConcepts.map((c) => `\n[${c.concept}]\n${c.points.map((p) => `• ${p}`).join('\n')}`).join('\n')}\n\n` +
          `2. IMPORTANT TERMS:\n${notesData.importantTerms.map((t) => `• ${t.term}: ${t.definition}`).join('\n')}\n\n` +
          `3. KEY POINTS:\n${notesData.keyPoints.map((kp) => `• ${kp}`).join('\n')}\n\n` +
          `4. EXAMPLES:\n${notesData.examples.map((ex) => `• ${ex}`).join('\n')}\n\n` +
          `5. EXAM POINTS:\n${notesData.examPoints.map((ep) => `• ${ep}`).join('\n')}\n` +
          sourcePart
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${notesData.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Study_Notes'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = async () => {
    if (!notesData) return;
    setDownloadingPdf(true);
    const cleanName = notesData.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'Study_Notes';
    const filename = `${cleanName}.pdf`;

    const preparedData: NotesData = {
      ...notesData,
      sourceContent: notesData.sourceContent || rawContent,
      includeSourceInPdf
    };

    try {
      downloadVectorNotesPdf(preparedData, filename);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.warn('Vector PDF generation failed, attempting canvas fallback:', err);
      try {
        const targetEl =
          document.getElementById('printable-notes') ||
          document.getElementById('printable-notes-page-1') ||
          document.querySelector('[id^="printable-notes"]');
        if (targetEl && targetEl.id) {
          await downloadElementAsPdf(targetEl.id, filename);
          setPdfDownloaded(true);
          setTimeout(() => setPdfDownloaded(false), 3000);
        } else {
          window.print();
        }
      } catch (canvasErr) {
        console.error('All PDF download methods failed:', canvasErr);
        window.print();
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleClear = () => {
    setTopic('');
    setSubject('');
    setRawContent('');
    setNotesData(null);
    setError(null);
    setEditMode(false);
    setCurrentPage(1);
  };

  // Concept Edit Helpers
  const updateConcept = (cIdx: number, newTitle: string) => {
    if (!notesData) return;
    const updated = [...notesData.mainConcepts];
    updated[cIdx] = { ...updated[cIdx], concept: newTitle };
    setNotesData({ ...notesData, mainConcepts: updated });
  };

  const updatePoint = (cIdx: number, pIdx: number, newPoint: string) => {
    if (!notesData) return;
    const updated = [...notesData.mainConcepts];
    const pts = [...updated[cIdx].points];
    pts[pIdx] = newPoint;
    updated[cIdx] = { ...updated[cIdx], points: pts };
    setNotesData({ ...notesData, mainConcepts: updated });
  };

  const addPointToConcept = (cIdx: number) => {
    if (!notesData) return;
    const updated = [...notesData.mainConcepts];
    updated[cIdx] = { ...updated[cIdx], points: [...updated[cIdx].points, ''] };
    setNotesData({ ...notesData, mainConcepts: updated });
  };

  const removePointFromConcept = (cIdx: number, pIdx: number) => {
    if (!notesData) return;
    const updated = [...notesData.mainConcepts];
    updated[cIdx] = {
      ...updated[cIdx],
      points: updated[cIdx].points.filter((_, i) => i !== pIdx)
    };
    setNotesData({ ...notesData, mainConcepts: updated });
  };

  const addConcept = () => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      mainConcepts: [
        ...notesData.mainConcepts,
        {
          concept: `${notesData.mainConcepts.length + 1}. New Topic / Concept`,
          points: ['Enter detailed explanation, formulas, or operational steps...']
        }
      ]
    });
  };

  const removeConcept = (cIdx: number) => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      mainConcepts: notesData.mainConcepts.filter((_, i) => i !== cIdx)
    });
  };

  // Term Edit Helpers
  const updateTerm = (tIdx: number, term: string, definition: string) => {
    if (!notesData) return;
    const updated = [...notesData.importantTerms];
    updated[tIdx] = { term, definition };
    setNotesData({ ...notesData, importantTerms: updated });
  };

  const addTerm = () => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      importantTerms: [...notesData.importantTerms, { term: '', definition: '' }]
    });
  };

  const removeTerm = (tIdx: number) => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      importantTerms: notesData.importantTerms.filter((_, i) => i !== tIdx)
    });
  };

  // Key Point Edit Helpers
  const updateKeyPoint = (kIdx: number, text: string) => {
    if (!notesData) return;
    const updated = [...notesData.keyPoints];
    updated[kIdx] = text;
    setNotesData({ ...notesData, keyPoints: updated });
  };

  const addKeyPoint = () => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      keyPoints: [...notesData.keyPoints, '']
    });
  };

  const removeKeyPoint = (kIdx: number) => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      keyPoints: notesData.keyPoints.filter((_, i) => i !== kIdx)
    });
  };

  // Example Edit Helpers
  const updateExample = (eIdx: number, text: string) => {
    if (!notesData) return;
    const updated = [...notesData.examples];
    updated[eIdx] = text;
    setNotesData({ ...notesData, examples: updated });
  };

  const addExample = () => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      examples: [...notesData.examples, '']
    });
  };

  const removeExample = (eIdx: number) => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      examples: notesData.examples.filter((_, i) => i !== eIdx)
    });
  };

  // Exam Point Edit Helpers
  const updateExamPoint = (epIdx: number, text: string) => {
    if (!notesData) return;
    const updated = [...notesData.examPoints];
    updated[epIdx] = text;
    setNotesData({ ...notesData, examPoints: updated });
  };

  const addExamPoint = () => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      examPoints: [...notesData.examPoints, '']
    });
  };

  const removeExamPoint = (epIdx: number) => {
    if (!notesData) return;
    setNotesData({
      ...notesData,
      examPoints: notesData.examPoints.filter((_, i) => i !== epIdx)
    });
  };

  // Quick Revision Edit Helper
  const updateQuickRevision = (text: string) => {
    if (!notesData) return;
    setNotesData({ ...notesData, quickRevision: text });
  };

  // Helper to format inline markdown like **bold** into semantic tags and auto-bold key terms
  const formatInlineMarkdown = (text: string) => {
    if (!text) return text;

    // Auto-bold introductory labels like "Term Name:" if not already markdown bolded
    let processedText = text;
    if (!processedText.startsWith('**')) {
      const match = processedText.match(/^([A-Za-z0-9\s/&,–—\(\)-]{2,45}):(\s+)/);
      if (match) {
        processedText = `**${match[1]}:**${match[2]}${processedText.slice(match[0].length)}`;
      }
    }

    const parts = processedText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-black">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Helper to render high-contrast, clean academic tables
  const renderTableBlock = (table: ParsedTable, key: string | number) => {
    return (
      <div key={key} className="my-2 border border-black overflow-hidden text-left bg-white shadow-2xs">
        {table.title && (
          <div className="bg-slate-100 px-3 py-1.5 border-b border-black text-black font-extrabold text-[11px] tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0" />
            <span>{formatInlineMarkdown(table.title)}</span>
          </div>
        )}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse border-spacing-0">
            {table.header && table.header.length > 0 && (
              <thead>
                <tr className="bg-slate-100 border-b-2 border-black text-black">
                  {table.header.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-2.5 py-1.5 font-extrabold uppercase text-[10.5px] tracking-wider border-r border-black last:border-r-0 text-black whitespace-normal break-words"
                    >
                      {formatInlineMarkdown(col)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-black/30 text-black">
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-2.5 py-1.5 leading-relaxed font-normal border-r border-black/20 last:border-r-0 text-black text-[11px] align-top whitespace-normal break-words"
                    >
                      {formatInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper to render concept bullet points with markdown tables and code blocks
  const renderPointsHelper = (points: string[]) => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < points.length) {
      const p = points[i];

      // 1. Single point is a parsed table (e.g. contains || or markdown divider)
      const singleParsed = parseTableFromText(p);
      if (singleParsed) {
        elements.push(renderTableBlock(singleParsed, `tbl-single-${i}`));
        i++;
        continue;
      }

      // 2. Consecutive points form a markdown table (starts with |)
      if (p.trim().startsWith('|') && p.includes('|')) {
        const tableLines: string[] = [];
        let j = i;
        while (j < points.length && points[j].trim().startsWith('|')) {
          tableLines.push(points[j]);
          j++;
        }
        if (tableLines.length >= 2) {
          const combined = tableLines.join('\n');
          const multiParsed = parseTableFromText(combined);
          if (multiParsed) {
            elements.push(renderTableBlock(multiParsed, `tbl-multi-${i}`));
            i = j;
            continue;
          }
        }
      }

      // 3. Code block
      const isCode =
        p.includes('public class') ||
        p.includes('System.out.print') ||
        p.includes('def ') ||
        p.includes('print(') ||
        p.startsWith('```');

      if (isCode) {
        const cleanCode = p.replace(/^```[a-z]*\s*/, '').replace(/```$/, '');
        elements.push(
          <div key={`code-${i}`} className="my-1.5 text-left">
            <pre className="bg-slate-950 text-white p-2.5 rounded text-[11px] font-mono leading-relaxed overflow-x-auto border border-black">
              <code>{cleanCode}</code>
            </pre>
          </div>
        );
        i++;
        continue;
      }

      // 4. Standard bullet point with bold keywords
      elements.push(
        <div key={`pt-${i}`} className="leading-relaxed flex items-start gap-2 text-left my-0.5">
          <span className="text-black font-bold text-sm leading-none mt-0.5 shrink-0">•</span>
          <span className="text-black text-xs">{formatInlineMarkdown(p)}</span>
        </div>
      );
      i++;
    }

    return <div className="space-y-1 my-1">{elements}</div>;
  };

  // Helper to render individual blocks cleanly without boxes
  const renderBlock = (block: NotesBlock) => {
    switch (block.type) {
      case 'doc_header':
        return (
          <div key={block.id} className="border-b-2 border-black pb-2 mb-1.5 space-y-1 text-left">
            <div className="flex items-center gap-2 text-[10px] font-bold text-black uppercase tracking-wider">
              <span className="border border-black px-1.5 py-0.5">{subject || notesData?.title || 'STUDY NOTES'}</span>
              <span>•</span>
              <span>{language}</span>
              <span>•</span>
              <span className="capitalize">{difficulty}</span>
            </div>

            {editMode ? (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-black block mb-0.5">Document Title</label>
                  <input
                    type="text"
                    value={notesData?.title || ''}
                    onChange={(e) => notesData && setNotesData({ ...notesData, title: e.target.value })}
                    className="w-full bg-white border border-slate-400 rounded px-2.5 py-1 text-xs font-bold text-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-black block mb-0.5">Overview</label>
                  <textarea
                    rows={2}
                    value={notesData?.overview || ''}
                    onChange={(e) => notesData && setNotesData({ ...notesData, overview: e.target.value })}
                    className="w-full bg-white border border-slate-400 rounded p-2 text-xs text-black leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-lg sm:text-xl font-extrabold text-black tracking-tight leading-snug uppercase">
                  {block.title}
                </h1>
                {block.overview && (
                  <p className="text-xs text-black leading-relaxed text-justify pt-0.5">
                    {block.overview}
                  </p>
                )}
              </>
            )}
          </div>
        );

      case 'section_title':
        return (
          <div key={block.id} className="pt-2 border-b-2 border-black pb-1 flex items-center justify-between text-left mt-1 mb-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>{block.num}. {block.title}</span>
            </h3>
            {editMode && (
              <div className="flex items-center gap-2">
                {block.title.includes('Concepts') && (
                  <button
                    type="button"
                    onClick={addConcept}
                    className="text-[11px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer border border-black px-1.5 py-0.5 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Concept</span>
                  </button>
                )}
                {block.title.includes('Terminology') && (
                  <button
                    type="button"
                    onClick={addTerm}
                    className="text-[11px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer border border-black px-1.5 py-0.5 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Term</span>
                  </button>
                )}
                {block.title.includes('Key Points') && (
                  <button
                    type="button"
                    onClick={addKeyPoint}
                    className="text-[11px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer border border-black px-1.5 py-0.5 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Point</span>
                  </button>
                )}
                {block.title.includes('Examples') && (
                  <button
                    type="button"
                    onClick={addExample}
                    className="text-[11px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer border border-black px-1.5 py-0.5 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Example</span>
                  </button>
                )}
                {block.title.includes('Exam') && (
                  <button
                    type="button"
                    onClick={addExamPoint}
                    className="text-[11px] font-bold text-black hover:underline flex items-center gap-1 cursor-pointer border border-black px-1.5 py-0.5 rounded"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Exam Tip</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'concept':
        return renderConceptBox(block.conceptIndex, block.conceptTitle, block.points, block.id);

      case 'term': {
        const tIdx = notesData?.importantTerms?.findIndex((t) => t.term === block.term);
        return (
          <div key={block.id} className="text-xs text-black leading-relaxed flex items-start gap-2 text-left py-0.5">
            {editMode && tIdx !== undefined && tIdx >= 0 ? (
              <div className="space-y-1.5 flex-1 border border-slate-300 p-2 rounded bg-slate-50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={notesData?.importantTerms[tIdx]?.term || ''}
                    onChange={(e) => updateTerm(tIdx, e.target.value, notesData?.importantTerms[tIdx]?.definition || '')}
                    className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-black"
                    placeholder="Term name"
                  />
                  <button
                    type="button"
                    onClick={() => removeTerm(tIdx)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Delete term"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={notesData?.importantTerms[tIdx]?.definition || ''}
                  onChange={(e) => updateTerm(tIdx, notesData?.importantTerms[tIdx]?.term || '', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-black leading-relaxed"
                  placeholder="Definition..."
                />
              </div>
            ) : (
              <>
                <span className="font-extrabold text-black shrink-0">• {block.term}:</span>
                <span className="text-black font-normal">{formatInlineMarkdown(block.definition)}</span>
              </>
            )}
          </div>
        );
      }

      case 'key_point': {
        const kIdx = notesData?.keyPoints?.findIndex((k) => k === block.text);
        return (
          <div key={block.id} className="text-xs text-black flex items-start gap-2 leading-relaxed text-left py-0.5">
            <span className="text-black font-bold text-sm leading-none mt-0.5 shrink-0">•</span>
            {editMode && kIdx !== undefined && kIdx >= 0 ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={notesData?.keyPoints[kIdx] || ''}
                  onChange={(e) => updateKeyPoint(kIdx, e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-black"
                  placeholder="Key takeaway..."
                />
                <button
                  type="button"
                  onClick={() => removeKeyPoint(kIdx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Delete point"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-black">{formatInlineMarkdown(block.text)}</span>
            )}
          </div>
        );
      }

      case 'example': {
        const exIdx = notesData?.examples?.findIndex((ex) => ex === block.text);
        return (
          <div key={block.id} className="border-l-2 border-black pl-3 py-0.5 text-xs text-black leading-relaxed text-left my-0.5">
            {editMode && exIdx !== undefined && exIdx >= 0 ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={notesData?.examples[exIdx] || ''}
                  onChange={(e) => updateExample(exIdx, e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-black"
                  placeholder="Example or analogy..."
                />
                <button
                  type="button"
                  onClick={() => removeExample(exIdx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Delete example"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <span className="font-extrabold text-black">Example: </span>
                <span className="text-black font-normal">{formatInlineMarkdown(block.text)}</span>
              </div>
            )}
          </div>
        );
      }

      case 'exam_point': {
        const epIdx = notesData?.examPoints?.findIndex((ep) => ep === block.text);
        return (
          <div key={block.id} className="text-xs text-black leading-relaxed flex items-start gap-1.5 text-left py-0.5">
            <span className="font-extrabold text-black shrink-0">• Exam Note / Trap:</span>
            {editMode && epIdx !== undefined && epIdx >= 0 ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={notesData?.examPoints[epIdx] || ''}
                  onChange={(e) => updateExamPoint(epIdx, e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-black"
                  placeholder="Exam tip or trap..."
                />
                <button
                  type="button"
                  onClick={() => removeExamPoint(epIdx)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Delete exam tip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-black">{formatInlineMarkdown(block.text)}</span>
            )}
          </div>
        );
      }

      case 'quick_revision':
        return (
          <div key={block.id} className="border border-black p-2.5 text-left my-1">
            <span className="text-xs font-black uppercase tracking-wider text-black block mb-0.5">
              High-Yield Quick Revision
            </span>
            {editMode ? (
              <textarea
                rows={3}
                value={notesData?.quickRevision || ''}
                onChange={(e) => updateQuickRevision(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-black leading-relaxed"
                placeholder="High-retention summary for rapid 60-second review..."
              />
            ) : (
              <p className="text-xs text-black leading-relaxed font-medium">
                {block.text}
              </p>
            )}
          </div>
        );

      case 'source_paragraph':
        return (
          <p key={block.id} className="text-xs text-black whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 p-2.5 border border-black/30 text-left my-1">
            {block.text}
          </p>
        );

      default:
        return null;
    }
  };

  // Render Core Concept Section (Clean typography, no box)
  const renderConceptBox = (cIdx: number, overrideTitle?: string, overridePoints?: string[], blockKey?: string) => {
    if (!notesData) return null;
    const item = notesData.mainConcepts[cIdx];
    const displayTitle = overrideTitle || item?.concept || `Concept ${cIdx + 1}`;
    const displayPoints = overridePoints || item?.points || [];

    return (
      <div
        key={blockKey || `c_${cIdx}`}
        className="space-y-1 text-left py-1"
      >
        {editMode ? (
          <div className="space-y-2 border border-slate-300 p-2.5 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={displayTitle}
                onChange={(e) => updateConcept(cIdx, e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-black"
              />
              <button
                type="button"
                onClick={() => removeConcept(cIdx)}
                className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                title="Delete concept"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 pl-2">
              {displayPoints.map((p, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <span className="text-black font-bold">•</span>
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => updatePoint(cIdx, pIdx, e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-black"
                  />
                  <button
                    type="button"
                    onClick={() => removePointFromConcept(cIdx, pIdx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPointToConcept(cIdx)}
                className="text-[11px] text-black hover:underline flex items-center gap-1 pt-1 font-bold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Bullet Point</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <h4 className="text-xs sm:text-sm font-extrabold text-black flex items-center gap-2 border-b border-black/20 pb-0.5 mb-1 tracking-wide">
              <span>{displayTitle}</span>
            </h4>
            {renderPointsHelper(displayPoints)}
          </>
        )}
      </div>
    );
  };

  // Render a discrete A4 Page Card (Clean academic print preview)
  const renderPageCard = (page: NotesPage, isSingleMode: boolean = false) => {
    return (
      <div
        key={page.pageNumber}
        id={isSingleMode ? 'printable-notes' : `printable-notes-page-${page.pageNumber}`}
        className="w-full max-w-[794px] bg-white border border-slate-300 rounded-sm px-6 py-5 sm:px-8 sm:py-6 md:px-9 md:py-6 text-left shadow-2xl shadow-slate-900/15 flex flex-col justify-between relative transition-all mx-auto print:shadow-none print:border-none print:m-0 print:p-0"
        style={{
          width: '100%',
          maxWidth: '794px',
          aspectRatio: '210 / 297',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Running Header */}
        <div className="flex items-center justify-between text-[11px] font-bold text-black pb-1.5 border-b border-black shrink-0">
          <div className="flex items-center gap-2 max-w-[500px]">
            <span className="font-extrabold uppercase tracking-wider text-black text-[10px]">
              {subject || 'STUDY GUIDE'}
            </span>
            <span>·</span>
            <span className="font-bold text-black uppercase tracking-wide truncate text-xs">
              {notesData?.title || 'Study Notes'}
            </span>
          </div>
          <span className="font-mono text-black text-xs font-bold shrink-0">
            Page {page.pageNumber} of {totalPages}
          </span>
        </div>

        {/* Page Content Blocks Area */}
        <div className="space-y-1.5 flex-1 py-1.5 flex flex-col justify-start">
          {page.blocks.map((block) => renderBlock(block))}
        </div>

        {/* Bottom Running Footer */}
        <div className="pt-1.5 border-t border-black flex items-center justify-between text-[11px] text-black font-mono shrink-0 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black">Standard A4</span>
            <span>·</span>
            <span>210 × 297 mm</span>
          </div>
          <span className="text-black hidden sm:inline">AI Academic Notes</span>
          <span className="text-black font-bold">Page {page.pageNumber} of {totalPages}</span>
        </div>
      </div>
    );
  };

  const activePageDef = pages[currentPage - 1] || pages[0];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToolHeader
        toolNumber="02"
        title="AI Notes Generator"
        subtitle="Generate comprehensive, structured academic study notes from any topic, syllabus unit, or material."
        icon={<BookOpen className="w-6 h-6 text-[#F59E0B]" />}
        badge="Study Guide"
        category="Study & Research"
        statusText="AI Ready"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Card (5 cols on lg, 4 cols on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm transition-all text-left">
          {/* Header & Mode Switcher */}
          <div className="space-y-3 border-b border-[#DFE4F2] pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider flex items-center gap-2 font-display">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                <span>Notes Generator</span>
              </h2>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Segmented Mode Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputMode('topic')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMode === 'topic'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>From Topic / Unit</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode('material')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMode === 'material'
                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5 text-indigo-500" />
                <span>With Material / File</span>
              </button>
            </div>
          </div>

          {/* Quick-Start Preset Topics */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <ListPlus className="w-3 h-3 text-blue-600" />
              <span>Quick Presets:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-full font-medium transition-colors cursor-pointer text-slate-700 truncate max-w-full text-left"
                >
                  {preset.subject}: {preset.topic.split('(')[0].split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            {/* Topic Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-800 font-bold flex items-center gap-1">
                  <span>Topic, Unit, or Syllabus Outline</span>
                  <span className="text-rose-500">*</span>
                </label>
                {inputMode === 'topic' && (
                  <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Unit & syllabus ready</span>
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium resize-y"
                placeholder={
                  inputMode === 'topic'
                    ? `Enter any subject topic, compare two concepts, or paste a syllabus unit.\n\nExamples:\n• CPU Scheduling Algorithms (FCFS, SJF, Round Robin, Priority)\n• Difference between TCP and UDP protocols\n• Cellular Respiration & Krebs Cycle\n• Keynesian vs Classical Economic Theory`
                    : 'e.g. Chapter 4: Memory Management & Paging (or paste excerpt below)'
                }
                required={inputMode === 'topic' && !rawContent.trim()}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Enter single or multiple topics across STEM, Business, or Humanities. AI synthesizes comprehensive notes with definitions, examples, and exam predictions.
              </p>
            </div>

            {/* Subject / Course (Optional) */}
            <div>
              <label className="text-slate-600 block mb-1 font-medium">
                Subject / Course Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                placeholder="e.g. Computer Science, Biology, Chemistry, Economics, Law"
              />
            </div>

            {/* Mode B: Raw Material / Text area + File Upload */}
            {inputMode === 'material' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold flex items-center gap-1">
                    <span>Study Material / Lecture Text</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-semibold"
                      title="Upload .txt or .md file"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload .txt/.md</span>
                    </button>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed font-mono text-[11px]"
                  placeholder="Paste lecture transcripts, textbook excerpts, formulas, or unorganized paragraphs here... The AI will extract key definitions and synthesize comprehensive notes."
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{rawContent.length} characters</span>
                  <span>{rawContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>

                {/* Option to include raw content in PDF */}
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 mt-2">
                  <input
                    type="checkbox"
                    checked={includeSourceInPdf}
                    onChange={(e) => setIncludeSourceInPdf(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium leading-tight">
                    <span className="font-bold text-slate-900 block">
                      Include Raw Study Material in PDF Appendix
                    </span>
                    Retains verbatim source text at the end of the exported document.
                  </span>
                </label>
              </div>
            )}

            {/* Customization Options: Length, Difficulty, Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Notes Depth</label>
                <select
                  value={length}
                  onChange={(e: any) => setLength(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="balanced">Balanced (Standard)</option>
                  <option value="comprehensive">Comprehensive (Deep)</option>
                  <option value="concise">Concise (High-Density)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Target Level</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="intermediate">Undergrad / College</option>
                  <option value="beginner">High School / Intro</option>
                  <option value="advanced">Graduate / Research</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi / Hinglish</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#2563EB] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{notesData ? 'Regenerate Study Notes' : 'Generate Notes with AI'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Output / Preview Workspace (7 cols on lg, 8 cols on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Action Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Structured Study Notes</span>
              </span>
              {notesData && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold bg-emerald-50 text-emerald-800 border-emerald-200">
                  AI Live Generated
                </span>
              )}
            </div>

            {notesData && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewViewMode('paginated')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      previewViewMode === 'paginated'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="View one standard A4 page at a time with page switcher"
                  >
                    Single A4 Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewMode('continuous')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      previewViewMode === 'continuous'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="View all standard A4 pages stacked in a document layout"
                  >
                    All Pages (A4)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    editMode
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title={editMode ? 'Finish Editing' : 'Edit Notes Content'}
                >
                  {editMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{editMode ? 'Preview' : 'Edit'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy as formatted Markdown"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy MD'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMd}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Markdown (.md)"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>.MD</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Plain Text (.txt)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Download Vector Printable PDF"
                >
                  {downloadingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Exporting PDF...</span>
                    </>
                  ) : pdfDownloaded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print Study Notes"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            )}
          </div>

          {/* Notes Content Display */}
          {loading ? (
            <LoadingState
              toolName="Comprehensive Study Notes"
              steps={[
                'Parsing curriculum units & topics',
                'Synthesizing core concepts and mechanisms',
                'Generating terminology and exam tips',
                'Structuring high-retention study guide'
              ]}
            />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : notesData ? (
            <div className="space-y-3">
              {/* Pagination Top Toolbar (When in Paginated Mode) */}
              {previewViewMode === 'paginated' && totalPages > 1 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-800 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
                    {pages.map((p) => (
                      <button
                        key={p.pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(p.pageNumber)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          currentPage === p.pageNumber
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={`Page ${p.pageNumber}`}
                      >
                        <span>Page {p.pageNumber}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Realistic Workbench Paper Sheet Container */}
              <div
                id="printable-workbench"
                ref={previewCardRef}
                className="bg-slate-200/60 p-4 sm:p-8 rounded-3xl border border-slate-300/70 shadow-inner flex flex-col items-center gap-8 overflow-x-auto w-full"
              >
                {previewViewMode === 'paginated' ? (
                  // SINGLE PAGE RENDER
                  <div className="w-full flex justify-center py-2">
                    {renderPageCard(activePageDef, true)}
                  </div>
                ) : (
                  // CONTINUOUS ALL-PAGES RENDER
                  <div className="space-y-10 w-full flex flex-col items-center py-2">
                    {pages.map((pDef) => (
                      <div key={pDef.pageNumber} className="w-full flex justify-center">
                        {renderPageCard(pDef, false)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Pagination Controls (Paginated Mode) */}
              {previewViewMode === 'paginated' && totalPages > 1 && (
                <div className="flex items-center justify-between pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage <= 1}
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 disabled:opacity-30 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Page</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {pages.map((p) => (
                      <button
                        key={p.pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(p.pageNumber)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          currentPage === p.pageNumber
                            ? 'bg-blue-600 w-6'
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`Go to Page ${p.pageNumber}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-30 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Next Page</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Study Notes Generated Yet"
              description="Enter a topic or syllabus outline on the left and click 'Generate Notes with AI' to create comprehensive, structured revision guides."
              icon={<BookOpen className="w-8 h-8 text-blue-500" />}
              actionHint="Includes Paginated Preview, Module Overview, Core Concepts, Terminology, High-Yield Key Points, Practical Examples, and Exam Predictions."
            />
          )}
        </div>
      </div>
    </div>
  );
};
