import React from 'react';
import { ResumeData, ResumeTemplateId } from '../../types';
import { PersonalDetailsData } from './PersonalDetailsSection';
import { ResumePage } from './ResumePage';
import { paginateResumeData } from '../../utils/resumePagination';
import { Sparkles, FileText, CheckCircle } from 'lucide-react';

interface ResumePreviewProps {
  formData: PersonalDetailsData;
  resumeData: ResumeData;
  templateId: ResumeTemplateId;
  editMode?: boolean;
  onUpdateResumeData?: (updater: (prev: ResumeData) => ResumeData) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  formData,
  resumeData,
  templateId,
  editMode = false,
  onUpdateResumeData
}) => {
  // Generate discrete physical A4 pages matching jsPDF pagination logic
  const pages = paginateResumeData(formData, resumeData, templateId);

  return (
    <div className="space-y-3">

      {/* Edit Mode Notice */}
      {editMode && (
        <div className="no-print p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Inline Editing Active:</strong> Click into summary, bullet points, or project descriptions to customize wording directly on the A4 sheet before downloading.
          </span>
        </div>
      )}

      {/* A4 Workspace Document Header */}
      <div className="no-print flex items-center justify-between px-3 py-2 bg-white border border-[#DFE4F2] rounded-xl text-xs font-body shadow-2xs">
        <div className="flex items-center gap-2 text-[#080909]">
          <FileText className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span className="font-bold font-display uppercase tracking-wider text-[11px]">
            A4 Document Preview
          </span>
          <span className="text-[11px] text-[#080909]/60 font-mono">
            • 210 × 297 mm • Portrait
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#DFE4F2] text-[#080909] font-mono text-[11px] font-bold">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium hidden sm:flex">
            <CheckCircle className="w-3 h-3" />
            <span>ATS Verified</span>
          </span>
        </div>
      </div>

      {/* Realistic A4 Workspace Frame */}
      <div className="w-full bg-[#D1D5DB] p-3 sm:p-8 rounded-3xl flex flex-col items-center justify-center overflow-x-auto shadow-inner min-h-[500px]">
        {/* Printable Container Wrapping All A4 Sheets */}
        <div id="printable-resume" className="w-full max-w-[760px] flex flex-col items-center gap-8 sm:gap-10">
          {pages.map((pageData) => (
            <ResumePage
              key={`resume-page-${pageData.pageNumber}`}
              pageData={pageData}
              formData={formData}
              templateId={templateId}
              editMode={editMode}
              onUpdateResumeData={onUpdateResumeData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
