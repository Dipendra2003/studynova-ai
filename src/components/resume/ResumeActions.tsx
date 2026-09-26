import React from 'react';
import { Copy, Check, Download, RotateCcw, Sparkles, Edit3, Eye } from 'lucide-react';

interface ResumeActionsProps {
  onCopy: () => void;
  copied: boolean;
  onDownloadPdf: () => void;
  downloadingPdf: boolean;
  pdfDownloaded: boolean;
  onPrint?: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
  onReset: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
}

export const ResumeActions: React.FC<ResumeActionsProps> = ({
  onCopy,
  copied,
  onDownloadPdf,
  downloadingPdf,
  pdfDownloaded,
  onPrint,
  onRegenerate,
  regenerating,
  onReset,
  editMode,
  onToggleEditMode
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-white border border-[#DFE4F2] rounded-2xl shadow-xs no-print">
      {/* Left side actions: Edit mode & Regenerate */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            editMode
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'bg-[#F7F8FA] hover:bg-[#DFE4F2] text-[#080909] border border-[#DFE4F2]'
          }`}
          title={editMode ? 'Finish inline editing' : 'Edit generated resume text directly'}
        >
          {editMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{editMode ? 'Preview Mode' : 'Edit Inline'}</span>
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F8FA] hover:bg-[#DFE4F2] text-[#080909] border border-[#DFE4F2] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Regenerate bullet points with AI"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>{regenerating ? 'Generating...' : 'Regenerate'}</span>
        </button>
      </div>

      {/* Right side actions: Copy, Download PDF, Print, Reset */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F8FA] hover:bg-[#DFE4F2] text-[#080909] border border-[#DFE4F2] flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Copy formatted resume plaintext to clipboard"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#080909]/70" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        

        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
            pdfDownloaded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white disabled:opacity-50'
          }`}
          title="Download vector ATS-friendly PDF"
        >
          {pdfDownloaded ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>
            {downloadingPdf ? 'Generating PDF...' : pdfDownloaded ? 'Downloaded ✓' : 'Download PDF'}
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-xl text-[#080909]/40 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer ml-1"
          title="Reset and clear all fields"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
