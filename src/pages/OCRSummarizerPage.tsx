import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Copy,
  Download,
  Check,
  RotateCcw,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { summarizeOCRAI, extractOCRAI } from '../services/aiService';
import { OCRSummaryData } from '../types';

export const OCRSummarizerPage: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<OCRSummaryData | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      processImageOCR(event.target?.result as string, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processImageOCR = async (base64String: string, mimeType: string) => {
    setIsOcrProcessing(true);
    setError(null);
    try {
      const text = await extractOCRAI(base64String, mimeType);
      setExtractedText(text);
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from image.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleSummarize = async () => {
    if (!extractedText.trim()) {
      setError('No extracted text available to summarize. Please upload an image or type note text.');
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      const summary = await summarizeOCRAI(extractedText);
      setSummaryData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to generate note summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const txt = `
${summaryData.shortSummary}

KEY POINTS:
${summaryData.keyPoints.map((k) => `- ${k}`).join('\n')}

DEFINITIONS:
${summaryData.importantDefinitions.map((d) => `- ${d.term}: ${d.definition}`).join('\n')}

FORMULAS:
${summaryData.importantFormulas.map((f) => `- ${f}`).join('\n')}

EXAM POINTS:
${summaryData.examPoints.map((e) => `- ${e}`).join('\n')}

QUICK REVISION:
${summaryData.quickRevision}
    `.trim();

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!summaryData) return;
    const element = document.createElement('a');
    const file = new Blob(
      [
        `OCR NOTE SUMMARY\n\n${summaryData.shortSummary}\n\nKEY POINTS:\n${summaryData.keyPoints.join('\n')}\n\nFORMULAS:\n${summaryData.importantFormulas.join('\n')}\n\nQUICK REVISION:\n${summaryData.quickRevision}`
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `ocr_note_summary_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClear = () => {
    setImagePreview(null);
    setExtractedText('');
    setSummaryData(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToolHeader
        toolNumber="10"
        title="OCR Notes Summarizer"
        subtitle="Scan notes, extract text and summarize them with AI."
        icon={<Camera className="w-6 h-6 text-[#EC4899]" />}
        badge="Vision & Documents"
        category="Vision & Documents"
        statusText="AI Ready"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Upload & OCR Verification (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm text-left transition-all">
          <div className="flex justify-between items-center border-b border-[#DFE4F2] pb-3">
            <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider font-display">
              Photo Upload & OCR
            </h2>
            <button
              onClick={handleClear}
              className="text-xs font-medium text-[#080909]/60 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Drag and Drop Box */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center space-y-3 cursor-pointer bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Click or drag note photo here</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Supports JPG, PNG, or WebP</p>
              </div>
            </div>
          </div>

          {/* Image Thumbnail Preview */}
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-48 sm:h-64 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2">
              <img
                src={imagePreview}
                alt="Uploaded note preview"
                className="max-w-full max-h-full object-contain object-center rounded-lg shadow-sm"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-slate-700 flex items-center gap-1">
                {isOcrProcessing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <span>OCR Scanned</span>
                )}
              </div>
            </div>
          )}

          {/* Extracted Text Verified Editor */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-800 dark:text-slate-300 font-semibold block">
                Extracted Text (Verify / Correct Mistakes)
              </label>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">Editable</span>
            </div>
            <textarea
              rows={8}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500 leading-relaxed"
              placeholder="Extracted text will appear here. You can manually correct any OCR recognition errors..."
            />
          </div>

          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !extractedText.trim()}
            className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#0D9488] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer pt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{summaryData ? 'Regenerate with AI' : 'Generate with AI'}</span>
          </button>
        </div>

        {/* Right Column: AI Structured Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Side-by-Side AI Summary
            </span>

            {summaryData && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download TXT</span>
                </button>
              </div>
            )}
          </div>

          {isSummarizing ? (
            <LoadingState toolName="OCR Note Summary" />
          ) : error ? (
            <ErrorState message={error} onRetry={handleSummarize} />
          ) : summaryData ? (
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-left space-y-6 shadow-xl transition-colors">
              {/* Executive Summary */}
              <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Short Executive Summary
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {summaryData.shortSummary}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Key Points
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {summaryData.keyPoints.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Definitions */}
              {summaryData.importantDefinitions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Important Definitions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {summaryData.importantDefinitions.map((d, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">{d.term}</span>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{d.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulas */}
              {summaryData.importantFormulas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Important Formulas & Equations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.importantFormulas.map((f, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg font-mono text-xs text-indigo-900 dark:text-indigo-200 font-bold"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Points & Quick Revision */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  High-Yield Exam Points
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {summaryData.examPoints.map((ep, idx) => (
                    <li key={idx} className="leading-relaxed">{ep}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Quick Revision
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  "{summaryData.quickRevision}"
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Summary Generated Yet"
              description="Upload your handwritten note photo on the left, verify the extracted text, and click 'Summarize Note with AI'."
              icon={<Camera className="w-8 h-8 text-indigo-400" />}
              actionHint="Includes short summaries, key formulas, important definitions, and exam points."
            />
          )}
        </div>
      </div>
    </div>
  );
};
