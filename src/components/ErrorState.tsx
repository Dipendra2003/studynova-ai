import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while processing your AI request.',
  onRetry
}) => {
  return (
    <div className="w-full py-10 px-6 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-[#DFE4F2] rounded-3xl transition-all shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-[#080909] font-display">Generation Notice</h4>
        <p className="text-xs sm:text-sm text-[#080909]/70 max-w-sm font-body">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-[#080909] hover:bg-[#7C3AED] text-white rounded-full text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
