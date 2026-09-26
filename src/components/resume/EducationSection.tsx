import React from 'react';
import { GraduationCap, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

interface EducationSectionProps {
  items: EducationItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onChange: (id: string, field: keyof Omit<EducationItem, 'id'>, value: string) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
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
          <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080909] font-display">
            Education
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
          <span>Add Education</span>
        </button>
      </div>

      {/* Entry Cards */}
      {items.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[#DFE4F2] rounded-2xl bg-[#F7F8FA]/60 text-xs text-[#080909]/60 font-body">
          No education entries added yet. Click &quot;Add Education&quot; to add your university or school.
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-[#F7F8FA] border border-[#DFE4F2] rounded-2xl p-4 space-y-3 relative group hover:border-[#7C3AED]/40 transition-colors"
            >
              {/* Item Top Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-[#080909]/70 border-b border-[#DFE4F2]/60 pb-2">
                <span className="font-mono text-[11px] font-bold text-[#7C3AED]">
                  #{index + 1} Degree
                </span>

                <div className="flex items-center gap-1">
                  {/* Reorder controls */}
                  <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded text-[#080909]/50 hover:text-[#080909] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
                    title="Move up"
                    aria-label={`Move education ${index + 1} up`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded text-[#080909]/50 hover:text-[#080909] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
                    title="Move down"
                    aria-label={`Move education ${index + 1} down`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                    title="Remove entry"
                    aria-label={`Remove education ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`edu-degree-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Degree / Program
                  </label>
                  <input
                    id={`edu-degree-${item.id}`}
                    type="text"
                    value={item.degree}
                    onChange={(e) => onChange(item.id, 'degree', e.target.value)}
                    placeholder="e.g. B.S. in Computer Science"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`edu-school-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    University / Institution
                  </label>
                  <input
                    id={`edu-school-${item.id}`}
                    type="text"
                    value={item.school}
                    onChange={(e) => onChange(item.id, 'school', e.target.value)}
                    placeholder="e.g. University of California, Berkeley"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`edu-field-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Major / Field of Study
                  </label>
                  <input
                    id={`edu-field-${item.id}`}
                    type="text"
                    value={item.field}
                    onChange={(e) => onChange(item.id, 'field', e.target.value)}
                    placeholder="e.g. Artificial Intelligence, Data Science"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor={`edu-start-${item.id}`}
                      className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                    >
                      Start Year
                    </label>
                    <input
                      id={`edu-start-${item.id}`}
                      type="text"
                      value={item.startYear}
                      onChange={(e) => onChange(item.id, 'startYear', e.target.value)}
                      placeholder="2022"
                      className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edu-end-${item.id}`}
                      className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                    >
                      Grad Year / Expected
                    </label>
                    <input
                      id={`edu-end-${item.id}`}
                      type="text"
                      value={item.endYear}
                      onChange={(e) => onChange(item.id, 'endYear', e.target.value)}
                      placeholder="2026"
                      className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
