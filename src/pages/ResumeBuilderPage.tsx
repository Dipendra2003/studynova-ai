import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  Edit3,
  Eye
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generateResumeAI } from '../services/aiService';
import { downloadElementAsPdf, downloadVectorResumePdf } from '../utils/pdfDownloader';
import { ResumeData, ResumeTemplateId } from '../types';

// Modular Sections
import { PersonalDetailsSection, PersonalDetailsData } from '../components/resume/PersonalDetailsSection';
import { EducationSection, EducationItem } from '../components/resume/EducationSection';
import { ExperienceSection, ExperienceItem } from '../components/resume/ExperienceSection';
import { ProjectsSection, ProjectItem } from '../components/resume/ProjectsSection';
import { SkillsSection } from '../components/resume/SkillsSection';
import { CertificationsSection, CertificationItem } from '../components/resume/CertificationsSection';
import { AchievementsSection } from '../components/resume/AchievementsSection';
import { TemplateSelector } from '../components/resume/TemplateSelector';
import { ResumePreview } from '../components/resume/ResumePreview';
import { ResumeActions } from '../components/resume/ResumeActions';

const DRAFT_STORAGE_KEY = 'ai_student_tools_resume_draft_v2';

export const ResumeBuilderPage: React.FC = () => {
  // Form State - Starts completely clean and empty
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    careerObjective: ''
  });

  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      id: '1',
      school: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: ''
    }
  ]);

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([
    {
      id: '1',
      role: '',
      organization: '',
      startDate: '',
      endDate: '',
      highlights: ''
    }
  ]);

  const [projectList, setProjectList] = useState<ProjectItem[]>([
    {
      id: '1',
      title: '',
      description: '',
      technologies: ''
    }
  ]);

  const [skills, setSkills] = useState('');
  const [certificationList, setCertificationList] = useState<CertificationItem[]>([]);
  const [achievements, setAchievements] = useState('');

  // UI & Execution State
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>('classic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PersonalDetailsData, string>>>({});
  const [draftBanner, setDraftBanner] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Responsive active view for mobile/tablet & split screens (< lg)
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.personalDetails?.fullName || parsed?.personalDetails?.email) {
          setDraftBanner(true);
        }
      }
    } catch (e) {
      console.warn('Could not read draft from localStorage', e);
    }
  }, []);

  // Save draft periodically/on form updates
  const saveDraftToStorage = () => {
    try {
      const draftObj = {
        personalDetails,
        educationList,
        experienceList,
        projectList,
        skills,
        certificationList,
        achievements,
        selectedTemplate,
        resumeData
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftObj));
      setDraftSavedToast(true);
      setTimeout(() => setDraftSavedToast(false), 2500);
    } catch (e) {
      console.warn('Failed to save draft to localStorage', e);
    }
  };

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed.personalDetails) setPersonalDetails(parsed.personalDetails);
      if (Array.isArray(parsed.educationList)) setEducationList(parsed.educationList);
      if (Array.isArray(parsed.experienceList)) setExperienceList(parsed.experienceList);
      if (Array.isArray(parsed.projectList)) setProjectList(parsed.projectList);
      if (typeof parsed.skills === 'string') setSkills(parsed.skills);
      if (Array.isArray(parsed.certificationList)) setCertificationList(parsed.certificationList);
      if (typeof parsed.achievements === 'string') setAchievements(parsed.achievements);
      if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
      if (parsed.resumeData) setResumeData(parsed.resumeData);
      setDraftBanner(false);
    } catch (e) {
      console.warn('Failed to restore draft', e);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftBanner(false);
    } catch (e) {
      console.warn('Failed to clear draft', e);
    }
  };

  // -------------------------------------------------------------
  // REORDERING & LIST HANDLERS
  // -------------------------------------------------------------
  const moveItem = <T,>(list: T[], index: number, direction: 'up' | 'down'): T[] => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return list;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    return updated;
  };

  // Education Handlers
  const addEducation = () => {
    setEducationList([
      ...educationList,
      { id: String(Date.now()), school: '', degree: '', field: '', startYear: '', endYear: '' }
    ]);
  };
  const removeEducation = (id: string) => {
    setEducationList(educationList.filter((e) => e.id !== id));
  };
  const handleEducationChange = (id: string, field: keyof Omit<EducationItem, 'id'>, value: string) => {
    setEducationList(educationList.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  // Experience Handlers
  const addExperience = () => {
    setExperienceList([
      ...experienceList,
      { id: String(Date.now()), role: '', organization: '', startDate: '', endDate: '', highlights: '' }
    ]);
  };
  const removeExperience = (id: string) => {
    setExperienceList(experienceList.filter((e) => e.id !== id));
  };
  const handleExperienceChange = (id: string, field: keyof Omit<ExperienceItem, 'id'>, value: string) => {
    setExperienceList(experienceList.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  // Project Handlers
  const addProject = () => {
    setProjectList([
      ...projectList,
      { id: String(Date.now()), title: '', description: '', technologies: '' }
    ]);
  };
  const removeProject = (id: string) => {
    setProjectList(projectList.filter((p) => p.id !== id));
  };
  const handleProjectChange = (id: string, field: keyof Omit<ProjectItem, 'id'>, value: string) => {
    setProjectList(projectList.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Certification Handlers
  const addCertification = () => {
    setCertificationList([
      ...certificationList,
      { id: String(Date.now()), title: '', issuer: '', issueDate: '' }
    ]);
  };
  const removeCertification = (id: string) => {
    setCertificationList(certificationList.filter((c) => c.id !== id));
  };
  const handleCertificationChange = (id: string, field: keyof Omit<CertificationItem, 'id'>, value: string) => {
    setCertificationList(certificationList.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // -------------------------------------------------------------
  // VALIDATION & SUBMISSION
  // -------------------------------------------------------------
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PersonalDetailsData, string>> = {};

    if (!personalDetails.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    if (!personalDetails.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalDetails.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      setError('Please complete the required fields (Full Name and valid Email).');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      ...personalDetails,
      skills,
      achievements,
      education: educationList,
      experience: experienceList,
      projects: projectList,
      certifications: certificationList
    };

    try {
      const generated = await generateResumeAI(payload, { allowFallback: true });
      setResumeData(generated);

      // Auto-switch to preview on smaller/split screens so user sees the result immediately
      setMobileView('preview');

      // Auto-save draft after successful generation
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            personalDetails,
            educationList,
            experienceList,
            projectList,
            skills,
            certificationList,
            achievements,
            selectedTemplate,
            resumeData: generated
          })
        );
      } catch (storageErr) {
        console.warn('Could not auto-save generated resume', storageErr);
      }
    } catch (err: any) {
      setError(err?.message || 'We could not generate your resume right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // EXPORT ACTIONS: PDF, PRINT, COPY, RESET
  // -------------------------------------------------------------
  const handleDownloadPdf = async () => {
    if (!resumeData) return;

    setDownloadingPdf(true);
    const cleanName = personalDetails.fullName.trim().replace(/\s+/g, '_') || 'Resume';
    const filename = `${cleanName}_Resume.pdf`;

    try {
      downloadVectorResumePdf(
        personalDetails.fullName,
        {
          email: personalDetails.email,
          phone: personalDetails.phone,
          location: personalDetails.location,
          linkedin: personalDetails.linkedin,
          github: personalDetails.github,
          portfolio: personalDetails.portfolio
        },
        resumeData,
        filename,
        selectedTemplate
      );
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.warn('Vector PDF generation failed, falling back to high-res canvas slice:', err);
      try {
        await downloadElementAsPdf('printable-resume', filename);
        setPdfDownloaded(true);
        setTimeout(() => setPdfDownloaded(false), 3000);
      } catch (fallbackErr) {
        console.error('All PDF engines failed:', fallbackErr);
        setError('PDF download encountered an issue. You can use Print -> Save as PDF instead.');
      }
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!resumeData) return;

    const contacts = [
      personalDetails.email,
      personalDetails.phone,
      personalDetails.location,
      personalDetails.linkedin,
      personalDetails.github,
      personalDetails.portfolio
    ]
      .filter(Boolean)
      .join(' | ');

    const plain = `
${personalDetails.fullName.toUpperCase()}
${contacts}

==================================================
PROFESSIONAL SUMMARY
==================================================
${resumeData.summary}

==================================================
EDUCATION
==================================================
${resumeData.education.map((e) => `${e.school} — ${e.degree} (${e.period})${e.grade ? ` [GPA: ${e.grade}]` : ''}`).join('\n')}

==================================================
TECHNICAL SKILLS
==================================================
${resumeData.skills.map((s) => `${s.category}: ${s.items.join(', ')}`).join('\n')}

==================================================
EXPERIENCE
==================================================
${resumeData.experience.map((exp) => `${exp.role} — ${exp.organization} (${exp.period})\n${exp.bullets.map((b) => `  • ${b}`).join('\n')}`).join('\n\n')}

==================================================
KEY PROJECTS
==================================================
${resumeData.projects.map((p) => `${p.title}${p.technologies.length ? ` [${p.technologies.join(', ')}]` : ''}\n  ${p.description}`).join('\n\n')}

${
  resumeData.certifications.length || resumeData.achievements.length
    ? `==================================================
CERTIFICATIONS & HONORS
==================================================
${[...resumeData.certifications, ...resumeData.achievements].map((c) => `  • ${c}`).join('\n')}`
    : ''
}
    `.trim();

    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPersonalDetails({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
      careerObjective: ''
    });
    setEducationList([
      { id: '1', school: '', degree: '', field: '', startYear: '', endYear: '' }
    ]);
    setExperienceList([
      { id: '1', role: '', organization: '', startDate: '', endDate: '', highlights: '' }
    ]);
    setProjectList([
      { id: '1', title: '', description: '', technologies: '' }
    ]);
    setSkills('');
    setCertificationList([]);
    setAchievements('');
    setResumeData(null);
    setError(null);
    setEditMode(false);
    setFormErrors({});
    clearDraft();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
      {/* Standard Tool Header */}
      <div className="no-print mb-6">
        <ToolHeader
          toolNumber="01"
          title="AI Resume Builder"
          subtitle="Build a polished ATS-friendly resume from your experience, skills and education."
          icon={<FileText className="w-6 h-6 text-[#7C3AED]" />}
          badge="ATS-Friendly"
          category="Career & Applications"
          statusText="AI Ready"
        />
      </div>

      {/* Saved Draft Restore Banner */}
      {draftBanner && !resumeData && (
        <div className="mb-6 p-3.5 sm:p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs no-print">
          <div className="flex items-center gap-2 text-xs text-indigo-950 font-body">
            <Save className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <span>
              <strong>Resume Draft Found:</strong> You have an unsaved resume draft stored locally.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Restore Draft
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Draft Saved Toast */}
      {draftSavedToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-[#080909] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 no-print animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Resume draft saved locally</span>
        </div>
      )}

      {/* Responsive Segmented View Switcher (Visible on mobile/tablet/split-screen < lg) */}
      <div className="lg:hidden mb-5 p-1 bg-white border border-[#DFE4F2] rounded-2xl shadow-xs flex items-center gap-1 no-print">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileView === 'editor'
              ? 'bg-[#080909] text-white shadow-xs'
              : 'text-[#080909]/70 hover:text-[#080909] hover:bg-[#F7F8FA]'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>1. Profile Form</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileView === 'preview'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-[#080909]/70 hover:text-[#080909] hover:bg-[#F7F8FA]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>2. Live A4 Preview</span>
          {resumeData && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
          )}
        </button>
      </div>

      {/* 2-Column Responsive Layout: Side-by-side on desktop (lg:), single-view tabbed on mobile/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INPUT WORKSPACE (5 cols)                                     */}
        {/* ========================================================================= */}
        <div
          className={`lg:col-span-5 bg-white border border-[#DFE4F2] rounded-3xl p-4 sm:p-7 space-y-5 sm:space-y-6 shadow-sm no-print ${
            mobileView === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFE4F2] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              <h2 className="text-xs font-black text-[#080909] uppercase tracking-wider font-display">
                Candidate Profile Data
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={saveDraftToStorage}
                className="text-[11px] font-bold text-[#7C3AED] hover:text-[#5B21B6] flex items-center gap-1 cursor-pointer font-body"
                title="Save draft to local storage"
              >
                <Save className="w-3 h-3" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-medium text-[#080909]/40 hover:text-rose-500 flex items-center gap-1 cursor-pointer ml-1 sm:ml-2"
                title="Clear all fields"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5 sm:space-y-6 text-left">
            {/* Section 1: Personal Details */}
            <PersonalDetailsSection
              data={personalDetails}
              onChange={(field, val) => {
                setPersonalDetails((prev) => ({ ...prev, [field]: val }));
                if (formErrors[field]) {
                  setFormErrors((prev) => ({ ...prev, [field]: undefined }));
                }
              }}
              errors={formErrors}
            />

            {/* Section 2: Education */}
            <EducationSection
              items={educationList}
              onAdd={addEducation}
              onRemove={removeEducation}
              onMoveUp={(idx) => setEducationList(moveItem(educationList, idx, 'up'))}
              onMoveDown={(idx) => setEducationList(moveItem(educationList, idx, 'down'))}
              onChange={handleEducationChange}
            />

            {/* Section 3: Experience */}
            <ExperienceSection
              items={experienceList}
              onAdd={addExperience}
              onRemove={removeExperience}
              onMoveUp={(idx) => setExperienceList(moveItem(experienceList, idx, 'up'))}
              onMoveDown={(idx) => setExperienceList(moveItem(experienceList, idx, 'down'))}
              onChange={handleExperienceChange}
            />

            {/* Section 4: Projects */}
            <ProjectsSection
              items={projectList}
              onAdd={addProject}
              onRemove={removeProject}
              onMoveUp={(idx) => setProjectList(moveItem(projectList, idx, 'up'))}
              onMoveDown={(idx) => setProjectList(moveItem(projectList, idx, 'down'))}
              onChange={handleProjectChange}
            />

            {/* Section 5: Technical Skills */}
            <SkillsSection skills={skills} onChange={setSkills} />

            {/* Section 6: Certifications */}
            <CertificationsSection
              items={certificationList}
              onAdd={addCertification}
              onRemove={removeCertification}
              onMoveUp={(idx) => setCertificationList(moveItem(certificationList, idx, 'up'))}
              onMoveDown={(idx) => setCertificationList(moveItem(certificationList, idx, 'down'))}
              onChange={handleCertificationChange}
            />

            {/* Section 7: Achievements */}
            <AchievementsSection achievements={achievements} onChange={setAchievements} />

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#7C3AED] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
                <span>{resumeData ? 'Regenerate Resume with AI' : 'Generate with AI'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY A4 DOCUMENT WORKSPACE (7 cols)                       */}
        {/* ========================================================================= */}
        <div
          className={`lg:col-span-7 space-y-4 lg:sticky lg:top-24 lg:self-start ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Template Selector & Action Controls (shown when resumeData exists) */}
          {resumeData && (
            <div className="space-y-3 no-print">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
              <ResumeActions
                onCopy={handleCopyText}
                copied={copied}
                onDownloadPdf={handleDownloadPdf}
                downloadingPdf={downloadingPdf}
                pdfDownloaded={pdfDownloaded}
                onPrint={handlePrint}
                onRegenerate={handleGenerate}
                regenerating={loading}
                onReset={handleReset}
                editMode={editMode}
                onToggleEditMode={() => setEditMode(!editMode)}
              />
            </div>
          )}

          {/* Body Preview State Switcher */}
          {loading ? (
            <LoadingState toolName="Resume Profile" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : resumeData ? (
            <ResumePreview
              formData={personalDetails}
              resumeData={resumeData}
              templateId={selectedTemplate}
              editMode={editMode}
              onUpdateResumeData={(updater) =>
                setResumeData((prev) => (prev ? updater(prev) : null))
              }
            />
          ) : (
            <EmptyState
              title="No Resume Generated Yet"
              description="Fill out your candidate profile on the left and click 'Generate with AI' to build your ATS-ready resume."
              icon={<FileText className="w-6 h-6 text-[#7C3AED]" />}
              actionHint="Fill in your details and click 'Generate with AI'"
            />
          )}
        </div>
      </div>

      {/* Floating Mobile Quick Actions Bar (< lg screens) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#080909]/95 backdrop-blur-md text-white p-2 rounded-2xl shadow-2xl flex items-center justify-between gap-2 border border-white/10 no-print">
        <button
          type="button"
          onClick={() => setMobileView(mobileView === 'editor' ? 'preview' : 'editor')}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          {mobileView === 'editor' ? (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preview Sheet</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Form</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={loading}
          className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{loading ? 'Generating...' : 'Generate with AI'}</span>
        </button>
      </div>
    </div>
  );
};
