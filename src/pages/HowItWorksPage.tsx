import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { TOOLS_LIST } from '../data/toolsMeta';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left space-y-14">
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED] bg-[#DFE4F2]/60 px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Architecture & Execution Flow</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#080909] tracking-tight font-display">
          How StudyNova AI Works
        </h1>
        <p className="text-base sm:text-lg text-[#080909]/75 font-body leading-relaxed">
          Our platform connects client-side form controls to structured LLM prompt pipelines and dynamic visual renderers for immediate academic feedback.
        </p>
      </div>

      {/* The 3-Step Pipeline Diagram */}
      <div className="bg-white border border-[#DFE4F2] rounded-3xl p-8 sm:p-10 space-y-8 shadow-sm">
        <h2 className="text-sm font-bold text-[#080909] uppercase tracking-wider font-display">
          The 3-Stage Learning Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F7F8FA] p-6 rounded-2xl border border-[#DFE4F2] space-y-3">
            <span className="font-mono text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full">
              STAGE 01
            </span>
            <h3 className="text-base font-bold text-[#080909] font-display">Input & State Capture</h3>
            <p className="text-xs sm:text-sm text-[#080909]/70 font-body leading-relaxed">
              Users provide structured data through clean forms, textareas, image uploads, or live Google Sheets endpoints with instant client-side validation.
            </p>
          </div>

          <div className="bg-[#F7F8FA] p-6 rounded-2xl border border-[#DFE4F2] space-y-3">
            <span className="font-mono text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
              STAGE 02
            </span>
            <h3 className="text-base font-bold text-[#080909] font-display">AI Schema Generation</h3>
            <p className="text-xs sm:text-sm text-[#080909]/70 font-body leading-relaxed">
              The AI service layer formulates clear system delimiters and strict JSON schema instructions, safely parsing responses and handling unexpected formats.
            </p>
          </div>

          <div className="bg-[#F7F8FA] p-6 rounded-2xl border border-[#DFE4F2] space-y-3">
            <span className="font-mono text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
              STAGE 03
            </span>
            <h3 className="text-base font-bold text-[#080909] font-display">Dynamic Visual Rendering</h3>
            <p className="text-xs sm:text-sm text-[#080909]/70 font-body leading-relaxed">
              Validated data hydrates into 16:9 presentation slide decks, interactive 3D flippable flashcards, SVG hierarchical mind maps, or exportable ATS resumes.
            </p>
          </div>
        </div>
      </div>

      {/* 10 Tools Directory list */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#080909] font-display">
          Quick Access to All 10 Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          {TOOLS_LIST.map((tool) => (
            <Link
              key={tool.id}
              to={tool.route}
              className="p-4 bg-white rounded-2xl border border-[#DFE4F2] hover:border-[#080909]/40 hover:bg-[#F0EEFA]/40 text-[#080909] flex justify-between items-center shadow-xs transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#7C3AED] bg-[#DFE4F2]/50 px-2 py-0.5 rounded-md">
                  {tool.number}
                </span>
                <span className="font-bold font-display">{tool.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#080909]/50" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
