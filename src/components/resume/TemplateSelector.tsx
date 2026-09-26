import React from 'react';
import { ResumeTemplateId } from '../../types';
import { FileText, Layout, Terminal } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplateId;
  onSelectTemplate: (templateId: ResumeTemplateId) => void;
}

const TEMPLATES: Array<{
  id: ResumeTemplateId;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'classic',
    name: 'Classic ATS',
    badge: 'Traditional',
    icon: FileText,
    description: 'Clean centered typography, uppercase headers, maximum ATS score'
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    badge: 'Editorial',
    icon: Layout,
    description: 'Left-aligned crisp hierarchy, subtle dividers, refined spacing'
  },
  {
    id: 'technical',
    name: 'Technical ATS',
    badge: 'Engineering',
    icon: Terminal,
    description: 'High-density skill matrix, prominent tech tags, developer layout'
  }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-[#DFE4F2] rounded-2xl shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#080909] font-display uppercase tracking-wider">
          ATS Template:
        </span>
        <span className="text-[11px] text-[#080909]/60 font-body hidden md:inline">
          Instant preview switch
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isActive = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#7C3AED] shadow-sm border border-[#DFE4F2]/80 font-display'
                  : 'text-[#080909]/70 hover:text-[#080909] hover:bg-white/60 font-body'
              }`}
              title={tmpl.description}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tmpl.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
