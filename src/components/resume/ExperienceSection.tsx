import React from 'react';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  highlights: string;
}

interface ExperienceSectionProps {
  items: ExperienceItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onChange: (id: string, field: keyof Omit<ExperienceItem, 'id'>, value: string) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  items,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  onChange
}) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#DFE4F2]">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080909] font-display">
            Experience / Internships
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#DFE4F2] text-[#080909]/70 font-semibold">
            {items.length} {items.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="text-xs font-bold text-[#7C3AED] hover:text-[#5B21B6] transition-colors flex items-center gap-1 cursor-pointer font-body"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Experience</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[#DFE4F2] rounded-2xl bg-[#F7F8FA]/60 text-xs text-[#080909]/60 font-body">
          No experience entries added. Click &quot;Add Experience&quot; to include internships, research, or work history.
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-[#F7F8FA] border border-[#DFE4F2] rounded-2xl p-4 space-y-3 relative group hover:border-[#7C3AED]/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#080909]/70 border-b border-[#DFE4F2]/60 pb-2">
                <span className="font-mono text-[11px] font-bold text-[#7C3AED]">
                  #{index + 1} Role
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded text-[#080909]/50 hover:text-[#080909] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
                    title="Move up"
                    aria-label={`Move experience ${index + 1} up`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded text-[#080909]/50 hover:text-[#080909] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
                    title="Move down"
                    aria-label={`Move experience ${index + 1} down`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                    title="Remove entry"
                    aria-label={`Remove experience ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`exp-role-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Job Title / Role
                  </label>
                  <input
                    id={`exp-role-${item.id}`}
                    type="text"
                    value={item.role}
                    onChange={(e) => onChange(item.id, 'role', e.target.value)}
                    placeholder="e.g. Software Engineering Intern"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`exp-org-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Company / Organization
                  </label>
                  <input
                    id={`exp-org-${item.id}`}
                    type="text"
                    value={item.organization}
                    onChange={(e) => onChange(item.id, 'organization', e.target.value)}
                    placeholder="e.g. Acme Tech Labs"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`exp-start-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Start Date
                  </label>
                  <input
                    id={`exp-start-${item.id}`}
                    type="text"
                    value={item.startDate}
                    onChange={(e) => onChange(item.id, 'startDate', e.target.value)}
                    placeholder="e.g. June 2024"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`exp-end-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    End Date
                  </label>
                  <input
                    id={`exp-end-${item.id}`}
                    type="text"
                    value={item.endDate}
                    onChange={(e) => onChange(item.id, 'endDate', e.target.value)}
                    placeholder="e.g. August 2024 or Present"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`exp-highlights-${item.id}`}
                  className="block text-[11px] font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
                >
                  <span>Key Responsibilities & Accomplishments</span>
                  <span className="text-[10px] text-[#080909]/50 font-normal">Separate with newlines or periods</span>
                </label>
                <textarea
                  id={`exp-highlights-${item.id}`}
                  rows={3}
                  value={item.highlights}
                  onChange={(e) => onChange(item.id, 'highlights', e.target.value)}
                  placeholder="e.g. Optimized database queries and backend API caching. Collaborated with 4 engineers to deploy automated CI/CD pipeline."
                  className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
