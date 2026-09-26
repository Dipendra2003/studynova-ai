import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ToolHeaderProps {
  toolNumber?: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  badge?: string;
  category?: string;
  statusText?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  toolNumber,
  title,
  subtitle,
  icon,
  badge,
  category,
  statusText = 'AI Ready'
}) => {
  return (
    <div className="mb-10 text-left space-y-4">
      {/* Top row: Back button and status indicator */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-bold text-[#080909]/75 hover:text-[#080909] bg-white border border-[#DFE4F2] hover:border-[#080909] px-4 py-2 rounded-full transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>← All Tools</span>
        </Link>

        <div className="flex items-center gap-3">
          {category && (
            <span className="hidden sm:inline text-xs font-medium text-[#080909]/60 font-body">
              {category}
            </span>
          )}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DFE4F2]/70 border border-[#DFE4F2] text-[11px] font-bold text-[#080909]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>{statusText}</span>
          </div>
        </div>
      </div>

      {/* Main Editorial Header */}
      <div className="pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5">
            {toolNumber && (
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] border border-[#7C3AED]/30">
                {toolNumber}
              </span>
            )}
            {badge && (
              <span className="text-[11px] font-bold text-[#080909]/70 uppercase tracking-wider font-body">
                {badge}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#080909] tracking-tight font-display flex items-center gap-3">
            {icon && (
              <span className="p-2 rounded-2xl bg-white border border-[#DFE4F2] shadow-sm inline-flex items-center justify-center shrink-0">
                {icon}
              </span>
            )}
            <span>{title}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#080909]/70 font-body leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
