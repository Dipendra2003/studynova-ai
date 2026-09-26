import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionHint?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionHint = 'Configure your parameters and click "Generate with AI" to see results.'
}) => {
  return (
    <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center space-y-4 bg-white/70 border border-dashed border-[#DFE4F2] rounded-3xl min-h-[420px] transition-all">
      <div className="w-14 h-14 rounded-2xl bg-[#DFE4F2]/60 border border-[#DFE4F2] flex items-center justify-center text-[#7C3AED] shadow-xs">
        {icon || <Sparkles className="w-6 h-6 text-[#7C3AED]" />}
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base sm:text-lg font-bold text-[#080909] font-display">{title}</h3>
        <p className="text-xs sm:text-sm text-[#080909]/60 leading-relaxed font-body">{description}</p>
      </div>
      {actionHint && (
        <span className="text-xs font-semibold text-[#7C3AED] bg-[#DFE4F2]/50 px-4 py-1.5 rounded-full border border-[#DFE4F2] font-body">
          {actionHint}
        </span>
      )}
    </div>
  );
};
