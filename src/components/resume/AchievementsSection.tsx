import React from 'react';
import { Trophy } from 'lucide-react';

interface AchievementsSectionProps {
  achievements: string;
  onChange: (value: string) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#DFE4F2]">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080909] font-display">
            Honors & Achievements
          </h3>
        </div>
        <span className="text-[10px] text-[#080909]/50 font-body">One per line</span>
      </div>

      <div>
        <label
          htmlFor="resume-achievements-input"
          className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
        >
          <span>Key Academic & Extracurricular Accomplishments</span>
          <span className="text-[10px] text-[#080909]/50 font-normal">Optional</span>
        </label>
        <textarea
          id="resume-achievements-input"
          name="achievements"
          rows={3}
          value={achievements}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Dean's Honor List (Fall 2023, Spring 2024)&#10;1st Place — Annual University Hackathon (out of 45 teams)&#10;Published undergraduate research paper on transformer attention efficiency"
          className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-3.5 py-2.5 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body leading-relaxed"
        />
      </div>
    </div>
  );
};
