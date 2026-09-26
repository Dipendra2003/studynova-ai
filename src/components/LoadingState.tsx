import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  toolName?: string;
  steps?: string[];
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  steps = [
    'Analyzing your input',
    'Structuring the content',
    'Preparing your result'
  ]
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center space-y-6 bg-[#F7F8FA] border border-[#DFE4F2] rounded-3xl transition-all shadow-xs">
      {/* Animated Indicator */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[#DFE4F2] border border-[#DFE4F2] flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-[#7C3AED]" />
        </div>
        <div className="absolute -top-1.5 -right-1.5">
          <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-[#080909] tracking-tight font-display">
          AI is thinking...
        </h3>
        <p className="text-xs text-[#080909]/60 font-body">
          Synthesizing your educational material with creative AI precision.
        </p>
      </div>

      {/* Progressive Step Progress */}
      <div className="w-full max-w-sm space-y-2.5 text-left bg-white p-4 rounded-2xl border border-[#DFE4F2] shadow-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[#DFE4F2] shrink-0" />
              )}
              <span
                className={
                  isDone
                    ? 'text-[#080909]/40 line-through'
                    : isCurrent
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-[#080909]/50'
                }
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtle skeleton bar */}
      <div className="w-full max-w-md space-y-2 pt-2">
        <div className="h-2 bg-[#DFE4F2]/80 rounded-full animate-pulse w-3/4 mx-auto" />
        <div className="h-2 bg-[#DFE4F2]/50 rounded-full animate-pulse w-5/6 mx-auto" />
      </div>
    </div>
  );
};
