import React from 'react';
import { Code, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string;
}

interface ProjectsSectionProps {
  items: ProjectItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onChange: (id: string, field: keyof Omit<ProjectItem, 'id'>, value: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
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
          <Code className="w-4 h-4 text-[#7C3AED]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080909] font-display">
            Key Projects
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
          <span>Add Project</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[#DFE4F2] rounded-2xl bg-[#F7F8FA]/60 text-xs text-[#080909]/60 font-body">
          No projects added yet. Click &quot;Add Project&quot; to showcase your software, research, or course builds.
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
                  #{index + 1} Project
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 rounded text-[#080909]/50 hover:text-[#080909] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
                    title="Move up"
                    aria-label={`Move project ${index + 1} up`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-1 rounded text-[#080909]/50 hover:text-[#080909] hover:bg-white disabled:opacity-20 transition-all cursor-pointer"
                    title="Move down"
                    aria-label={`Move project ${index + 1} down`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                    title="Remove entry"
                    aria-label={`Remove project ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={`proj-title-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Project Title
                  </label>
                  <input
                    id={`proj-title-${item.id}`}
                    type="text"
                    value={item.title}
                    onChange={(e) => onChange(item.id, 'title', e.target.value)}
                    placeholder="e.g. Distributed Task Queue"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`proj-tech-${item.id}`}
                    className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                  >
                    Technologies Used (comma separated)
                  </label>
                  <input
                    id={`proj-tech-${item.id}`}
                    type="text"
                    value={item.technologies}
                    onChange={(e) => onChange(item.id, 'technologies', e.target.value)}
                    placeholder="e.g. Go, Redis, Docker, gRPC"
                    className="w-full bg-white border border-[#DFE4F2] rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] font-body"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={`proj-desc-${item.id}`}
                  className="block text-[11px] font-bold text-[#080909] mb-1 font-body"
                >
                  Project Summary & Impact
                </label>
                <textarea
                  id={`proj-desc-${item.id}`}
                  rows={2}
                  value={item.description}
                  onChange={(e) => onChange(item.id, 'description', e.target.value)}
                  placeholder="e.g. Built an asynchronous task worker with exponential backoff retries and Prometheus telemetry."
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
