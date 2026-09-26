import { User, Mail, Phone, MapPin, Globe, Compass } from 'lucide-react';
import { Linkedin, Github } from '../SocialIcons';

export interface PersonalDetailsData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  careerObjective: string;
}

interface PersonalDetailsSectionProps {
  data: PersonalDetailsData;
  onChange: (field: keyof PersonalDetailsData, value: string) => void;
  errors?: Partial<Record<keyof PersonalDetailsData, string>>;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  data,
  onChange,
  errors = {}
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#DFE4F2]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#080909] font-display">
            Personal Details & Links
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#080909]/50 font-body">Required: Name & Email</span>
      </div>

      {/* Row 1: Full Name & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="resume-fullName"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Full Name</span>
              <span className="text-rose-500">*</span>
            </span>
            {errors.fullName && (
              <span className="text-[10px] text-rose-500 font-normal">{errors.fullName}</span>
            )}
          </label>
          <input
            id="resume-fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            value={data.fullName}
            onChange={(e) => onChange('fullName', e.target.value)}
            placeholder="e.g. Alex Morgan"
            className={`w-full bg-[#F7F8FA] border rounded-xl px-3.5 py-2.5 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body ${
              errors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-[#DFE4F2] focus:border-[#7C3AED]'
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="resume-email"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Email Address</span>
              <span className="text-rose-500">*</span>
            </span>
            {errors.email && (
              <span className="text-[10px] text-rose-500 font-normal">{errors.email}</span>
            )}
          </label>
          <input
            id="resume-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="e.g. alex.morgan@university.edu"
            className={`w-full bg-[#F7F8FA] border rounded-xl px-3.5 py-2.5 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body ${
              errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-[#DFE4F2] focus:border-[#7C3AED]'
            }`}
          />
        </div>
      </div>

      {/* Row 2: Phone & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="resume-phone"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-[#080909]/60" />
            <span>Phone Number</span>
          </label>
          <input
            id="resume-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="e.g. +1 (555) 234-5678"
            className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-3.5 py-2.5 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body"
          />
        </div>

        <div>
          <label
            htmlFor="resume-location"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-[#080909]/60" />
            <span>Location</span>
          </label>
          <input
            id="resume-location"
            name="location"
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="e.g. San Francisco, CA"
            className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-3.5 py-2.5 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body"
          />
        </div>
      </div>

      {/* Row 3: LinkedIn, GitHub, Portfolio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="resume-linkedin"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </span>
            {errors.linkedin && (
              <span className="text-[10px] text-rose-500 font-normal">{errors.linkedin}</span>
            )}
          </label>
          <input
            id="resume-linkedin"
            name="linkedin"
            type="text"
            value={data.linkedin}
            onChange={(e) => onChange('linkedin', e.target.value)}
            placeholder="linkedin.com/in/username"
            className={`w-full bg-[#F7F8FA] border rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body ${
              errors.linkedin ? 'border-rose-400 focus:border-rose-500' : 'border-[#DFE4F2] focus:border-[#7C3AED]'
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="resume-github"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-[#080909]" />
              <span>GitHub</span>
            </span>
            {errors.github && (
              <span className="text-[10px] text-rose-500 font-normal">{errors.github}</span>
            )}
          </label>
          <input
            id="resume-github"
            name="github"
            type="text"
            value={data.github}
            onChange={(e) => onChange('github', e.target.value)}
            placeholder="github.com/username"
            className={`w-full bg-[#F7F8FA] border rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body ${
              errors.github ? 'border-rose-400 focus:border-rose-500' : 'border-[#DFE4F2] focus:border-[#7C3AED]'
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="resume-portfolio"
            className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Portfolio</span>
            </span>
            {errors.portfolio && (
              <span className="text-[10px] text-rose-500 font-normal">{errors.portfolio}</span>
            )}
          </label>
          <input
            id="resume-portfolio"
            name="portfolio"
            type="text"
            value={data.portfolio}
            onChange={(e) => onChange('portfolio', e.target.value)}
            placeholder="yourportfolio.dev"
            className={`w-full bg-[#F7F8FA] border rounded-xl px-3 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body ${
              errors.portfolio ? 'border-rose-400 focus:border-rose-500' : 'border-[#DFE4F2] focus:border-[#7C3AED]'
            }`}
          />
        </div>
      </div>

      {/* Row 4: Career Objective */}
      <div>
        <label
          htmlFor="resume-careerObjective"
          className="block text-xs font-bold text-[#080909] mb-1 font-body flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Career Objective / Target Focus</span>
          </span>
          <span className="text-[10px] text-[#080909]/50">Guides AI summary tone</span>
        </label>
        <textarea
          id="resume-careerObjective"
          name="careerObjective"
          rows={2}
          value={data.careerObjective}
          onChange={(e) => onChange('careerObjective', e.target.value)}
          placeholder="e.g. Aspiring full-stack software engineer interested in scalable cloud systems and developer productivity tools."
          className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-xl px-3.5 py-2 text-xs text-[#080909] placeholder:text-[#080909]/35 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all font-body leading-relaxed"
        />
      </div>
    </div>
  );
};
