import { ResumeData, ResumeTemplateId } from '../types';
import { PersonalDetailsData } from '../components/resume/PersonalDetailsSection';
import { RESUME_METRICS } from './resumeMetrics';

export interface PaginatedResumePageData {
  pageNumber: number;
  totalPages: number;
  showHeader: boolean;
  summary?: string;
  education?: ResumeData['education'];
  skills?: ResumeData['skills'];
  experience?: ResumeData['experience'];
  projects?: ResumeData['projects'];
  certifications?: string[];
  achievements?: string[];
}

/**
 * Accurately calculates page breaks and distributes resume content into discrete
 * physical A4 pages matching jsPDF's exact vertical point coordinates.
 */
export function paginateResumeData(
  formData: PersonalDetailsData,
  resumeData: ResumeData,
  templateId: ResumeTemplateId = 'classic'
): PaginatedResumePageData[] {
  const pages: PaginatedResumePageData[] = [];

  let currentPageNumber = 1;
  let currentHeight = 0;

  // Initialize first page
  let currentPage: PaginatedResumePageData = {
    pageNumber: currentPageNumber,
    totalPages: 1,
    showHeader: true
  };

  const checkAndAdvancePage = (neededHeight: number) => {
    if (currentHeight + neededHeight > RESUME_METRICS.maxPageContentHeightPt) {
      pages.push(currentPage);
      currentPageNumber++;
      currentHeight = 0;
      currentPage = {
        pageNumber: currentPageNumber,
        totalPages: 1,
        showHeader: false // Only Page 1 gets the full name & contact header
      };
    }
  };

  // 1. Candidate Header (Page 1 only)
  const headerHeight = 52;
  currentHeight += headerHeight;

  // 2. Professional Summary
  if (resumeData.summary && resumeData.summary.trim()) {
    const summaryLines = Math.max(1, Math.ceil(resumeData.summary.length / 95));
    const summaryHeight = 22 + summaryLines * 12.5 + 6;
    checkAndAdvancePage(summaryHeight);
    currentPage.summary = resumeData.summary;
    currentHeight += summaryHeight;
  }

  // 3. Technical Skills handler
  const handleSkills = () => {
    if (resumeData.skills && resumeData.skills.length > 0) {
      let skillsHeight = 22; // Section Title
      resumeData.skills.forEach((sg) => {
        const textLen = (sg.category || '').length + (sg.items || []).join(', ').length;
        const lineEstimate = Math.max(1, Math.ceil(textLen / 90));
        skillsHeight += lineEstimate * 11.5 + 3;
      });
      skillsHeight += 4;

      checkAndAdvancePage(skillsHeight);
      currentPage.skills = resumeData.skills;
      currentHeight += skillsHeight;
    }
  };

  if (templateId === 'technical') {
    handleSkills();
  }

  // 4. Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    const sectionTitleHeight = 22;
    checkAndAdvancePage(sectionTitleHeight + 28);

    currentPage.education = [];
    currentHeight += sectionTitleHeight;

    resumeData.education.forEach((edu) => {
      const itemHeight = 27.5;
      checkAndAdvancePage(itemHeight);
      if (!currentPage.education) currentPage.education = [];
      currentPage.education.push(edu);
      currentHeight += itemHeight;
    });
  }

  if (templateId !== 'technical') {
    handleSkills();
  }

  // 5. Professional Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    const sectionTitleHeight = 22;
    checkAndAdvancePage(sectionTitleHeight + 35);

    currentPage.experience = [];
    currentHeight += sectionTitleHeight;

    resumeData.experience.forEach((exp) => {
      const bulletLines = exp.bullets.reduce((acc, b) => acc + Math.max(1, Math.ceil(b.length / 90)), 0);
      const itemHeight = 16 + bulletLines * 12 + 4;

      if (currentHeight + itemHeight > RESUME_METRICS.maxPageContentHeightPt) {
        checkAndAdvancePage(itemHeight);
      }

      if (!currentPage.experience) currentPage.experience = [];
      currentPage.experience.push(exp);
      currentHeight += itemHeight;
    });
  }

  // 6. Key Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    const sectionTitleHeight = 22;
    checkAndAdvancePage(sectionTitleHeight + 30);

    currentPage.projects = [];
    currentHeight += sectionTitleHeight;

    resumeData.projects.forEach((proj) => {
      const descLines = Math.max(1, Math.ceil((proj.description || '').length / 90));
      const itemHeight = 16 + descLines * 12 + 4;

      checkAndAdvancePage(itemHeight);
      if (!currentPage.projects) currentPage.projects = [];
      currentPage.projects.push(proj);
      currentHeight += itemHeight;
    });
  }

  // 7. Certifications & Honors
  const hasCerts = resumeData.certifications && resumeData.certifications.length > 0;
  const hasAchs = resumeData.achievements && resumeData.achievements.length > 0;

  if (hasCerts || hasAchs) {
    const sectionTitleHeight = 22;
    const certCount = resumeData.certifications?.length || 0;
    const achCount = resumeData.achievements?.length || 0;
    const itemsHeight = (certCount + achCount) * 12.5 + 4;

    checkAndAdvancePage(sectionTitleHeight + Math.min(itemsHeight, 35));
    currentHeight += sectionTitleHeight;

    if (hasCerts) currentPage.certifications = resumeData.certifications;
    if (hasAchs) currentPage.achievements = resumeData.achievements;
    currentHeight += itemsHeight;
  }

  // Push final page
  pages.push(currentPage);

  // Update totalPages on all pages
  const finalTotalPages = pages.length;
  return pages.map((p) => ({ ...p, totalPages: finalTotalPages }));
}
