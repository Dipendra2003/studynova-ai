import React from 'react';
import { ResumeData, ResumeTemplateId } from '../../types';
import { PersonalDetailsData } from './PersonalDetailsSection';
import { PaginatedResumePageData } from '../../utils/resumePagination';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Linkedin, Github } from '../SocialIcons';

interface ResumePageProps {
  pageData: PaginatedResumePageData;
  formData: PersonalDetailsData;
  templateId: ResumeTemplateId;
  editMode?: boolean;
  onUpdateResumeData?: (updater: (prev: ResumeData) => ResumeData) => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({
  pageData,
  formData,
  templateId,
  editMode = false,
  onUpdateResumeData
}) => {
  // Helpers for inline edit updates
  const handleSummaryChange = (newVal: string) => {
    if (!onUpdateResumeData) return;
    onUpdateResumeData((prev) => ({ ...prev, summary: newVal }));
  };

  const handleExpBulletChange = (expRole: string, expOrg: string, bulletIdx: number, newVal: string) => {
    if (!onUpdateResumeData) return;
    onUpdateResumeData((prev) => {
      const newExp = prev.experience.map((e) => {
        if (e.role === expRole && e.organization === expOrg) {
          const newBullets = [...e.bullets];
          newBullets[bulletIdx] = newVal;
          return { ...e, bullets: newBullets };
        }
        return e;
      });
      return { ...prev, experience: newExp };
    });
  };

  const handleProjDescChange = (projTitle: string, newVal: string) => {
    if (!onUpdateResumeData) return;
    onUpdateResumeData((prev) => {
      const newProj = prev.projects.map((p) => {
        if (p.title === projTitle) {
          return { ...p, description: newVal };
        }
        return p;
      });
      return { ...prev, projects: newProj };
    });
  };

  const hasEducation = pageData.education && pageData.education.length > 0;
  const hasSkills = pageData.skills && pageData.skills.length > 0;
  const hasExperience = pageData.experience && pageData.experience.length > 0;
  const hasProjects = pageData.projects && pageData.projects.length > 0;
  const hasCertifications = pageData.certifications && pageData.certifications.length > 0;
  const hasAchievements = pageData.achievements && pageData.achievements.length > 0;

  return (
    <div
      className="a4-resume-sheet relative w-full max-w-[680px] mx-auto bg-white text-slate-900 shadow-2xl border border-slate-200/80 transition-all font-sans text-left flex flex-col justify-between select-text group/sheet"
      style={{
        aspectRatio: '210 / 297',
        boxSizing: 'border-box'
      }}
    >
      {/* Visual Page Number Badge in Workspace */}
      <div className="no-print absolute -top-3 right-4 px-2.5 py-0.5 bg-[#080909] text-white text-[10px] font-mono font-bold rounded-full shadow-md z-10">
        Page {pageData.pageNumber} of {pageData.totalPages}
      </div>

      {/* Main A4 Content Body with PDF Equivalent Margins (6.72% horizontal, 4.75% vertical) */}
      <div
        className="flex-1 flex flex-col space-y-2.5 sm:space-y-3 overflow-hidden text-left"
        style={{
          paddingLeft: '6.72%',
          paddingRight: '6.72%',
          paddingTop: '4.75%',
          paddingBottom: '2.5%'
        }}
      >
        {/* ========================================================================= */}
        {/* 1. CANDIDATE HEADER (Page 1 Only)                                         */}
        {/* ========================================================================= */}
        {pageData.showHeader && (
          <>
            {templateId === 'classic' && (
              <div className="text-center border-b-2 border-slate-900 pb-2 mb-1">
                <h1 className="a4-candidate-name text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wider font-serif">
                  {formData.fullName || 'Candidate Name'}
                </h1>
                <div className="a4-contact-bar flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[9.5px] sm:text-[10px] text-slate-700 mt-1 font-medium">
                  {formData.email && <span>{formData.email}</span>}
                  {formData.phone && <span>• {formData.phone}</span>}
                  {formData.location && <span>• {formData.location}</span>}
                  {formData.linkedin && <span>• {formData.linkedin}</span>}
                  {formData.github && <span>• {formData.github}</span>}
                  {formData.portfolio && <span>• {formData.portfolio}</span>}
                </div>
              </div>
            )}

            {templateId === 'modern' && (
              <div className="border-b border-slate-200 pb-2 mb-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h1 className="a4-candidate-name text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight font-sans">
                    {formData.fullName || 'Candidate Name'}
                  </h1>
                  {formData.location && (
                    <span className="a4-sub-text text-[9.5px] sm:text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#7C3AED]" />
                      <span>{formData.location}</span>
                    </span>
                  )}
                </div>
                <div className="a4-contact-bar flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9.5px] sm:text-[10px] text-slate-600 mt-1 font-medium">
                  {formData.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 text-[#7C3AED]" />
                      <span>{formData.email}</span>
                    </span>
                  )}
                  {formData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-[#7C3AED]" />
                      <span>{formData.phone}</span>
                    </span>
                  )}
                  {formData.linkedin && (
                    <span className="flex items-center gap-1">
                      <Linkedin className="w-2.5 h-2.5 text-[#0A66C2]" />
                      <span>{formData.linkedin}</span>
                    </span>
                  )}
                  {formData.github && (
                    <span className="flex items-center gap-1">
                      <Github className="w-2.5 h-2.5 text-slate-900" />
                      <span>{formData.github}</span>
                    </span>
                  )}
                  {formData.portfolio && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{formData.portfolio}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {templateId === 'technical' && (
              <div className="border-b-2 border-slate-900 pb-1.5 mb-1 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h1 className="a4-candidate-name text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                    {formData.fullName || 'Candidate Name'}
                  </h1>
                  <span className="a4-sub-text text-[9.5px] sm:text-[10px] text-slate-600">
                    {formData.location || 'Developer / Engineer'}
                  </span>
                </div>
                <div className="a4-contact-bar flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] sm:text-[9.5px] text-slate-700 mt-0.5">
                  {formData.email && <span>{formData.email}</span>}
                  {formData.phone && <span>| {formData.phone}</span>}
                  {formData.github && <span>| {formData.github}</span>}
                  {formData.linkedin && <span>| {formData.linkedin}</span>}
                  {formData.portfolio && <span>| {formData.portfolio}</span>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Continuation header on subsequent pages */}
        {!pageData.showHeader && (
          <div className="a4-sub-text border-b border-slate-200 pb-1 mb-1 flex justify-between items-center text-[9.5px] text-slate-500 font-medium">
            <span>{formData.fullName || 'Candidate Resume'} — (Continued)</span>
            <span className="font-mono">Page {pageData.pageNumber}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. PROFESSIONAL SUMMARY                                                   */}
        {/* ========================================================================= */}
        {pageData.summary && (
          <div>
            <h2
              className={`a4-section-title text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest pb-0.5 mb-1 ${
                templateId === 'classic'
                  ? 'text-slate-900 font-serif border-b border-slate-300'
                  : templateId === 'modern'
                  ? 'text-[#7C3AED] font-sans flex items-center gap-1.5'
                  : 'text-slate-950 font-mono bg-slate-100 px-1 py-0.5 inline-block border-l-2 border-slate-900'
              }`}
            >
              {templateId === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
              <span>{templateId === 'technical' ? '// SUMMARY' : 'Professional Summary'}</span>
            </h2>
            {editMode ? (
              <textarea
                rows={2}
                value={pageData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                className="w-full a4-body-text text-[9px] sm:text-[10px] text-slate-800 leading-[1.35] border border-indigo-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-indigo-50/30 font-sans"
              />
            ) : (
              <p className="a4-body-text text-[9px] sm:text-[10px] text-slate-800 leading-[1.35] font-sans">
                {pageData.summary}
              </p>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TECHNICAL SKILLS (Top in Technical, middle in others)                 */}
        {/* ========================================================================= */}
        {templateId === 'technical' && hasSkills && (
          <div>
            <h2 className="a4-section-title text-[9.5px] sm:text-[10px] font-bold text-slate-950 uppercase tracking-widest bg-slate-100 px-1 py-0.5 inline-block mb-1 border-l-2 border-slate-900 font-mono">
              // TECHNICAL SKILLS
            </h2>
            <div className="space-y-0.5 a4-body-text text-[9px] sm:text-[9.5px] font-sans">
              {pageData.skills!.map((sg, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-bold text-slate-900 font-mono a4-sub-text text-[9px] sm:text-[9.5px] sm:w-36 shrink-0">
                    {sg.category}:
                  </span>
                  <span className="text-slate-800 leading-[1.3]">{sg.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. EDUCATION SECTION                                                      */}
        {/* ========================================================================= */}
        {hasEducation && (
          <div>
            <h2
              className={`a4-section-title text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest pb-0.5 mb-1 ${
                templateId === 'classic'
                  ? 'text-slate-900 font-serif border-b border-slate-300'
                  : templateId === 'modern'
                  ? 'text-[#7C3AED] font-sans flex items-center gap-1.5'
                  : 'text-slate-950 font-mono bg-slate-100 px-1 py-0.5 inline-block border-l-2 border-slate-900'
              }`}
            >
              {templateId === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
              <span>{templateId === 'technical' ? '// EDUCATION' : 'Education'}</span>
            </h2>
            <div className="space-y-1">
              {pageData.education!.map((edu, idx) => (
                <div key={idx} className="a4-body-text text-[9px] sm:text-[10px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{edu.school}</span>
                    <span className="a4-sub-text text-slate-600 font-normal text-[8.5px] sm:text-[9px] font-mono">
                      {edu.period}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700">
                    <span className="italic">{edu.degree}</span>
                    {edu.grade && (
                      <span className="a4-sub-text text-[8.5px] sm:text-[9px] font-mono text-slate-600">
                        {edu.grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills for Classic and Modern */}
        {templateId !== 'technical' && hasSkills && (
          <div>
            <h2
              className={`a4-section-title text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest pb-0.5 mb-1 ${
                templateId === 'classic'
                  ? 'text-slate-900 font-serif border-b border-slate-300'
                  : 'text-[#7C3AED] font-sans flex items-center gap-1.5'
              }`}
            >
              {templateId === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
              <span>Technical Skills & Core Competencies</span>
            </h2>
            <div className="space-y-0.5 a4-body-text text-[9px] sm:text-[10px] text-slate-800">
              {pageData.skills!.map((skillGroup, idx) => (
                <div key={idx} className="leading-[1.32]">
                  <span className="font-bold text-slate-900">{skillGroup.category}: </span>
                  <span>{skillGroup.items.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PROFESSIONAL EXPERIENCE                                                */}
        {/* ========================================================================= */}
        {hasExperience && (
          <div>
            <h2
              className={`a4-section-title text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest pb-0.5 mb-1 ${
                templateId === 'classic'
                  ? 'text-slate-900 font-serif border-b border-slate-300'
                  : templateId === 'modern'
                  ? 'text-[#7C3AED] font-sans flex items-center gap-1.5'
                  : 'text-slate-950 font-mono bg-slate-100 px-1 py-0.5 inline-block border-l-2 border-slate-900'
              }`}
            >
              {templateId === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
              <span>{templateId === 'technical' ? '// EXPERIENCE' : 'Professional Experience'}</span>
            </h2>
            <div className="space-y-2">
              {pageData.experience!.map((exp, idx) => (
                <div key={idx} className="a4-body-text text-[9px] sm:text-[10px] space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {exp.role} {templateId === 'technical' ? `@ ${exp.organization}` : `— ${exp.organization}`}
                    </span>
                    <span className="a4-sub-text text-slate-600 font-normal text-[8.5px] sm:text-[9px] font-mono">
                      {exp.period}
                    </span>
                  </div>
                  <ul className="a4-bullet-list list-disc pl-3.5 space-y-0.5 text-slate-800 pt-0.5">
                    {exp.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-[1.33]">
                        {editMode ? (
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) =>
                              handleExpBulletChange(exp.role, exp.organization, bIdx, e.target.value)
                            }
                            className="w-full text-[9px] sm:text-[10px] text-slate-800 border-b border-indigo-300 bg-indigo-50/30 px-1 py-0.5 focus:outline-none"
                          />
                        ) : (
                          bullet
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. KEY PROJECTS                                                           */}
        {/* ========================================================================= */}
        {hasProjects && (
          <div>
            <h2
              className={`a4-section-title text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest pb-0.5 mb-1 ${
                templateId === 'classic'
                  ? 'text-slate-900 font-serif border-b border-slate-300'
                  : templateId === 'modern'
                  ? 'text-[#7C3AED] font-sans flex items-center gap-1.5'
                  : 'text-slate-950 font-mono bg-slate-100 px-1 py-0.5 inline-block border-l-2 border-slate-900'
              }`}
            >
              {templateId === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
              <span>{templateId === 'technical' ? '// PROJECTS' : 'Key Projects'}</span>
            </h2>
            <div className="space-y-1.5">
              {pageData.projects!.map((proj, idx) => (
                <div key={idx} className="a4-body-text text-[9px] sm:text-[10px] space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{proj.title}</span>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="a4-sub-text text-slate-600 font-normal text-[8.5px] sm:text-[9px] font-mono">
                        {templateId === 'technical'
                          ? `[${proj.technologies.join(', ')}]`
                          : proj.technologies.join(' • ')}
                      </span>
                    )}
                  </div>
                  {editMode ? (
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleProjDescChange(proj.title, e.target.value)}
                      className="w-full text-[9px] sm:text-[10px] text-slate-800 border border-indigo-300 rounded p-1 bg-indigo-50/30 focus:outline-none leading-[1.33]"
                    />
                  ) : (
                    <p className="leading-[1.33]">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. CERTIFICATIONS & HONORS                                                */}
        {/* ========================================================================= */}
        {(hasCertifications || hasAchievements) && (
          <div>
            <h2
              className={`a4-section-title text-[10px] sm:text-[10.5px] font-bold uppercase tracking-widest pb-0.5 mb-1 ${
                templateId === 'classic'
                  ? 'text-slate-900 font-serif border-b border-slate-300'
                  : templateId === 'modern'
                  ? 'text-[#7C3AED] font-sans flex items-center gap-1.5'
                  : 'text-slate-950 font-mono bg-slate-100 px-1 py-0.5 inline-block border-l-2 border-slate-900'
              }`}
            >
              {templateId === 'modern' && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />}
              <span>{templateId === 'technical' ? '// CERTIFICATES & HONORS' : 'Certifications & Honors'}</span>
            </h2>
            <ul className="a4-bullet-list list-disc pl-3.5 space-y-0.5 text-[9px] sm:text-[10px] text-slate-800">
              {pageData.certifications?.map((c, idx) => (
                <li key={`cert-${idx}`} className="leading-[1.33]">{c}</li>
              ))}
              {pageData.achievements?.map((a, idx) => (
                <li key={`ach-${idx}`} className="leading-[1.33]">{a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. PHYSICAL A4 FOOTER (Page number at exact bottom right)                 */}
      {/* ========================================================================= */}
      <div
        className="a4-sub-text flex justify-between items-center text-[9px] text-slate-400 font-mono border-t border-slate-100"
        style={{
          paddingLeft: '6.72%',
          paddingRight: '6.72%',
          paddingBottom: '2.5%',
          paddingTop: '1%'
        }}
      >
        <span>Standard ISO A4 • 210 × 297 mm</span>
        <span>
          Page {pageData.pageNumber} of {pageData.totalPages}
        </span>
      </div>
    </div>
  );
};
