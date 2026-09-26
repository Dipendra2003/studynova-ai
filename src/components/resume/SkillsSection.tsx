import React from 'react';
import { Cpu, Tag } from 'lucide-react';

interface SkillsSectionProps {
  skills: string;
  onChange: (skills: string) => void;
}

const COMMON_SUGGESTIONS = [
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'SQL',
  'PostgreSQL',
  'Docker',
  'Git',
  'REST APIs',
  'Tailwind CSS',
  'Java',
  'C++',
  'AWS',
  'Linux'
];

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onChange }) => {
  const currentSkillsList = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const addSuggestion = (suggestion: string) => {
    if (currentSkillsList.some((s) => s.toLowerCase() === suggestion.toLowerCase())) return;
    const updated = currentSkillsList.length > 0 ? `${skills.trim()}, ${suggestion}` : suggestion;
    onChange(updated);
  };

  const removeSkill = (indexToRemove: number) => {
    const updated = currentSkillsList.filter((_, idx) => idx !== indexToRemove).join(', ');
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#DFE4F2]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080909] font-display">
            Technical & Domain Skills
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#DFE4F2] text-[#080909]/70 font-semibold">
            {currentSkillsList.length} tags
          </span>
        </div>
        <span className="text-[10px] text-[#080909]/50 font-body">Comma separated</span>
      </div>

      <div>
        <label
          htmlFor="resume-skills-input"
          className="block text-xs font-bold text-[#080909] mb-1 font-body"
        >
          Enter Skills & Frameworks
        </label>
        <textarea
          id="resume-skills-input"
          name="skills"
          rows={3}
          value={skills}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, Docker, Git"
          className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-3.5 py-2.5 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body leading-relaxed"
        />
      </div>

      {/* Live Tags Preview */}
      {currentSkillsList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentSkillsList.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#DFE4F2] text-[11px] font-medium text-[#080909] font-mono shadow-2xs group"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(idx)}
                className="text-[#080909]/40 hover:text-rose-500 transition-colors cursor-pointer text-xs leading-none"
                aria-label={`Remove skill ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Add Suggestions */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold text-[#080909]/60 flex items-center gap-1 font-body">
          <Tag className="w-3 h-3" />
          <span>Quick Add Popular Skills:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SUGGESTIONS.map((item) => {
            const isAdded = currentSkillsList.some((s) => s.toLowerCase() === item.toLowerCase());
            return (
              <button
                key={item}
                type="button"
                onClick={() => addSuggestion(item)}
                disabled={isAdded}
                className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                  isAdded
                    ? 'bg-[#DFE4F2]/50 text-[#080909]/40 cursor-default line-through'
                    : 'bg-[#DFE4F2] hover:bg-[#7C3AED] hover:text-white text-[#080909]'
                }`}
              >
                +{item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
