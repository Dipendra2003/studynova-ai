import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData, NotesData, StudyPlannerData } from '../types';
import { paginateNotesData, parseTableFromText } from './notesPaginator';

/**
 * Downloads any DOM element as a PDF document.
 * Defensive fallback handling if DOM canvas capture fails.
 */
export async function downloadElementAsPdf(
  elementId: string,
  filename: string = 'Document.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found in DOM`);
  }

  try {
    const canvas = await (html2canvas as any)(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.warn('DOM html2canvas capture failed:', error);
    throw error;
  }
}

/**
 * Direct Vector ATS Resume PDF generator using jsPDF
 * Creates crisp, ATS-compliant, selectable text PDF without any canvas dependencies.
 */
export function downloadVectorResumePdf(
  fullName: string,
  contactInfo: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  },
  resume: ResumeData,
  filename: string = 'Resume.pdf',
  templateId: 'classic' | 'modern' | 'technical' = 'classic'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const margin = 40;
  let y = 44;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;

  const checkPageBreak = (neededHeight: number = 24) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 10;
    }
  };

  // Helper to print multi-line text cleanly line by line
  const printTextLines = (
    text: string,
    x: number,
    width: number,
    lineHeight: number,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    fontSize: number = 9,
    color: [number, number, number] = [51, 65, 85]
  ) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, width);
    for (const line of lines) {
      checkPageBreak(lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    }
  };

  // 1. Candidate Name Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(templateId === 'technical' ? 18 : 20);
  doc.setTextColor(15, 23, 42); // slate-950
  const nameText = (fullName || 'Student Resume').trim().toUpperCase();

  if (templateId === 'classic') {
    const nameLines = doc.splitTextToSize(nameText, maxLineWidth);
    for (const nl of nameLines) {
      doc.text(nl, pageWidth / 2, y, { align: 'center' });
      y += 20;
    }
  } else {
    const nameLines = doc.splitTextToSize(nameText, maxLineWidth);
    for (const nl of nameLines) {
      doc.text(nl, margin, y);
      y += 20;
    }
  }
  y += 2;

  // 2. Contact details line
  const contacts = [
    contactInfo.email,
    contactInfo.phone,
    contactInfo.location,
    contactInfo.linkedin,
    contactInfo.github,
    contactInfo.portfolio
  ].filter(Boolean);

  if (contacts.length > 0) {
    const separator = templateId === 'technical' ? '  |  ' : '  •  ';
    const contactLine = contacts.join(separator);
    if (templateId === 'classic') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const splitContacts = doc.splitTextToSize(contactLine, maxLineWidth);
      for (const cl of splitContacts) {
        checkPageBreak(11);
        doc.text(cl, pageWidth / 2, y, { align: 'center' });
        y += 11;
      }
    } else {
      printTextLines(contactLine, margin, maxLineWidth, 11, 'normal', 8.5, [71, 85, 105]);
    }
    y += 4;
  }

  // Divider line
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(templateId === 'classic' ? 1.5 : 1.0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  const addSectionTitle = (title: string) => {
    checkPageBreak(32);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(templateId === 'technical' ? 9.5 : 10);
    doc.setTextColor(templateId === 'modern' ? 124 : 15, templateId === 'modern' ? 58 : 23, templateId === 'modern' ? 237 : 42); // #7C3AED for modern
    const formattedTitle = templateId === 'technical' ? `// ${title.toUpperCase()}` : title.toUpperCase();
    doc.text(formattedTitle, margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
  };

  // Summary Section
  if (resume.summary) {
    addSectionTitle('Professional Summary');
    printTextLines(resume.summary, margin, maxLineWidth, 12.5, 'normal', 9, [51, 65, 85]);
    y += 6;
  }

  // Education Section
  if (resume.education && Array.isArray(resume.education) && resume.education.length > 0) {
    addSectionTitle('Education');
    resume.education.forEach((edu) => {
      checkPageBreak(28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.school || 'University', margin, y);

      if (edu.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(String(edu.period), pageWidth - margin, y, { align: 'right' });
      }
      y += 12;

      const degreeText = `${edu.degree || 'Degree'}${edu.grade ? ` (GPA/Grade: ${edu.grade})` : ''}`;
      printTextLines(degreeText, margin, maxLineWidth, 11.5, 'italic', 8.5, [71, 85, 105]);
      y += 4;
    });
  }

  // Technical Skills Section
  if (resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0) {
    addSectionTitle('Technical Skills & Core Competencies');
    resume.skills.forEach((cat) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const categoryName = typeof cat === 'string' ? 'Skills' : (cat.category || 'Competencies');
      const catLabel = `${categoryName}: `;
      doc.text(catLabel, margin, y);

      const items = Array.isArray(cat?.items) ? cat.items.join(', ') : (typeof cat === 'string' ? cat : '');
      const labelWidth = doc.getTextWidth(catLabel);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const splitItems = doc.splitTextToSize(items, maxLineWidth - labelWidth);
      doc.text(splitItems, margin + labelWidth, y);
      y += splitItems.length * 11.5 + 3;
    });
    y += 4;
  }

  // Professional Experience
  if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
    addSectionTitle('Professional Experience');
    resume.experience.forEach((exp) => {
      checkPageBreak(32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${exp.role || 'Role'} — ${exp.organization || 'Organization'}`, margin, y);

      if (exp.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(String(exp.period), pageWidth - margin, y, { align: 'right' });
      }
      y += 12;

      const bullets = Array.isArray(exp.bullets) ? exp.bullets : (exp.bullets ? [String(exp.bullets)] : []);
      bullets.forEach((b) => {
        printTextLines(`•  ${b}`, margin + 4, maxLineWidth - 8, 11.5, 'normal', 8.5, [51, 65, 85]);
        y += 1;
      });
      y += 4;
    });
  }

  // Key Projects
  if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
    addSectionTitle('Key Projects');
    resume.projects.forEach((proj) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.title || 'Project', margin, y);

      if (proj.technologies) {
        const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(', ') : String(proj.technologies);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(79, 70, 229);
        doc.text(techStr, pageWidth - margin, y, { align: 'right' });
      }
      y += 12;

      printTextLines(proj.description || '', margin, maxLineWidth, 11.5, 'normal', 8.5, [51, 65, 85]);
      y += 4;
    });
  }

  // Certifications & Achievements
  const hasCerts = resume.certifications && Array.isArray(resume.certifications) && resume.certifications.length > 0;
  const hasAchievements = resume.achievements && Array.isArray(resume.achievements) && resume.achievements.length > 0;
  if (hasCerts || hasAchievements) {
    addSectionTitle('Certifications & Honors');
    const items = [
      ...(hasCerts ? resume.certifications : []),
      ...(hasAchievements ? resume.achievements : [])
    ];
    items.forEach((item) => {
      printTextLines(`•  ${item}`, margin + 4, maxLineWidth - 8, 11.5, 'normal', 8.5, [51, 65, 85]);
      y += 1;
    });
  }

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  doc.save(filename);
}

/**
 * Direct Vector Study Notes PDF generator using jsPDF
 * Creates structured, full-depth, fully-paginated notes without missing ANY content.
 * Strictly avoids non-ASCII emoji characters that break jsPDF encoding, using clean vector styling.
 */
export function downloadVectorNotesPdf(
  notes: NotesData,
  filename: string = 'Study_Notes.pdf'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;

  const sanitizeText = (str: string): string => {
    if (!str) return '';
    return String(str)
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .replace(/[\u2600-\u27BF]/g, '')
      .replace(/[■▸►✔✕✓💡⚠️📌🎯★☆●]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const pages = paginateNotesData(notes);

  pages.forEach((page, pIdx) => {
    if (pIdx > 0) {
      doc.addPage();
    }

    let y = margin + 5;

    page.blocks.forEach((block) => {
      switch (block.type) {
        case 'doc_header': {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text('AI ACADEMIC REVISION GUIDE', margin, y);

          const now = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.text(`Generated on ${now}`, pageWidth - margin, y, { align: 'right' });
          y += 12;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1);
          doc.line(margin, y, pageWidth - margin, y);
          y += 14;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          const titleLines = doc.splitTextToSize(sanitizeText(block.title), maxLineWidth);
          for (const tl of titleLines) {
            doc.text(tl, margin, y);
            y += 16;
          }
          y += 2;

          if (block.overview) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(0, 0, 0);
            const overviewLines = doc.splitTextToSize(sanitizeText(block.overview), maxLineWidth);
            for (const ol of overviewLines) {
              doc.text(ol, margin, y);
              y += 11.5;
            }
            y += 6;
          }

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(margin, y, pageWidth - margin, y);
          y += 12;
          break;
        }

        case 'section_title': {
          y += 4;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`${block.num}. ${block.title.toUpperCase()}`, margin, y);
          y += 4;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1);
          doc.line(margin, y, pageWidth - margin, y);
          y += 12;
          break;
        }

        case 'concept': {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);

          const conceptLines = doc.splitTextToSize(sanitizeText(block.conceptTitle), maxLineWidth);
          for (const cl of conceptLines) {
            doc.text(cl, margin, y);
            y += 12;
          }
          y += 2;

          block.points.forEach((pt) => {
            const cleanPt = sanitizeText(pt);
            if (!cleanPt) return;

            const table = parseTableFromText(cleanPt);
            if (table) {
              const colCount = Math.max(table.header.length, 1);
              const colWidth = (maxLineWidth - 4) / colCount;

              if (table.title) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(0, 0, 0);
                doc.text(table.title.toUpperCase(), margin + 2, y);
                y += 12;
              }

              // Draw header row
              doc.setFillColor(241, 245, 249);
              doc.rect(margin + 2, y - 9, maxLineWidth - 4, 13, 'F');
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.75);
              doc.rect(margin + 2, y - 9, maxLineWidth - 4, 13, 'S');

              doc.setFont('helvetica', 'bold');
              doc.setFontSize(7.5);
              doc.setTextColor(0, 0, 0);
              table.header.forEach((h, hIdx) => {
                const cellX = margin + 4 + hIdx * colWidth;
                const cellText = doc.splitTextToSize(sanitizeText(h), colWidth - 6);
                doc.text(cellText[0] || '', cellX, y);
              });
              y += 8;

              // Draw data rows
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7);
              table.rows.forEach((r, rIdx) => {
                let maxLines = 1;
                const cellLinesList: string[][] = [];
                for (let cIdx = 0; cIdx < colCount; cIdx++) {
                  const cellVal = sanitizeText(r[cIdx] || '');
                  const cLines = doc.splitTextToSize(cellVal, colWidth - 6);
                  cellLinesList.push(cLines);
                  if (cLines.length > maxLines) maxLines = cLines.length;
                }
                const rowH = Math.max(13, maxLines * 9 + 4);

                if (rIdx % 2 === 1) {
                  doc.setFillColor(248, 250, 252);
                  doc.rect(margin + 2, y - 7, maxLineWidth - 4, rowH, 'F');
                }
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.4);
                doc.rect(margin + 2, y - 7, maxLineWidth - 4, rowH, 'S');

                for (let cIdx = 0; cIdx < colCount; cIdx++) {
                  const cellX = margin + 4 + cIdx * colWidth;
                  const cLines = cellLinesList[cIdx] || [];
                  let textY = y;
                  for (const line of cLines) {
                    doc.text(line, cellX, textY);
                    textY += 8.5;
                  }
                }
                y += rowH;
              });
              y += 4;
              return;
            }

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(0, 0, 0);

            // Black bullet dot
            doc.text('•', margin + 2, y);

            const ptLines = doc.splitTextToSize(cleanPt, maxLineWidth - 12);
            for (const pl of ptLines) {
              doc.text(pl, margin + 10, y);
              y += 11.5;
            }
            y += 2;
          });
          y += 4;
          break;
        }

        case 'term': {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${sanitizeText(block.term)}:`, margin + 2, y);

          const termWidth = doc.getTextWidth(`• ${sanitizeText(block.term)}: `);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);

          const defLines = doc.splitTextToSize(sanitizeText(block.definition), maxLineWidth - 12);
          for (let dIdx = 0; dIdx < defLines.length; dIdx++) {
            if (dIdx === 0 && termWidth < 120) {
              doc.text(defLines[dIdx], margin + 2 + termWidth, y);
            } else {
              if (dIdx === 0) y += 11.5;
              doc.text(defLines[dIdx], margin + 10, y);
            }
            y += 11.5;
          }
          y += 2;
          break;
        }

        case 'key_point': {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          doc.text('•', margin + 2, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);

          const kpLines = doc.splitTextToSize(sanitizeText(block.text), maxLineWidth - 12);
          for (const kpl of kpLines) {
            doc.text(kpl, margin + 10, y);
            y += 11.5;
          }
          y += 2;
          break;
        }

        case 'example': {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1.5);
          const exLines = doc.splitTextToSize(sanitizeText(block.text), maxLineWidth - 16);
          const blockH = exLines.length * 11.5 + 4;
          doc.line(margin + 2, y - 4, margin + 2, y + blockH - 8);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          doc.text('Example: ', margin + 8, y);

          const prefixWidth = doc.getTextWidth('Example: ');
          doc.setFont('helvetica', 'normal');
          for (let eIdx = 0; eIdx < exLines.length; eIdx++) {
            if (eIdx === 0) {
              doc.text(exLines[eIdx], margin + 8 + prefixWidth, y);
            } else {
              doc.text(exLines[eIdx], margin + 8, y);
            }
            y += 11.5;
          }
          y += 4;
          break;
        }

        case 'exam_point': {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          doc.text('• Exam Note / Warning:', margin + 2, y);

          const epPrefixW = doc.getTextWidth('• Exam Note / Warning: ');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);

          const epLines = doc.splitTextToSize(sanitizeText(block.text), maxLineWidth - 12);
          for (let epIdx = 0; epIdx < epLines.length; epIdx++) {
            if (epIdx === 0 && epPrefixW < 140) {
              doc.text(epLines[epIdx], margin + 2 + epPrefixW, y);
            } else {
              if (epIdx === 0) y += 11.5;
              doc.text(epLines[epIdx], margin + 10, y);
            }
            y += 11.5;
          }
          y += 3;
          break;
        }

        case 'source_paragraph': {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);

          const paraLines = doc.splitTextToSize(sanitizeText(block.text), maxLineWidth);
          for (const pl of paraLines) {
            doc.text(pl, margin, y);
            y += 11;
          }
          y += 4;
          break;
        }

        case 'quick_revision': {
          const qrLines = doc.splitTextToSize(sanitizeText(block.text), maxLineWidth - 16);
          const boxHeight = qrLines.length * 11.5 + 20;

          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1);
          doc.rect(margin, y, maxLineWidth, boxHeight, 'S');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text('HIGH-YIELD QUICK REVISION & EXAM SUMMARY', margin + 8, y + 11);

          let qrY = y + 21;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          for (const ql of qrLines) {
            doc.text(ql, margin + 8, qrY);
            qrY += 11.5;
          }
          y += boxHeight + 8;
          break;
        }
      }
    });
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    if (i > 1) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(0, 0, 0);
      const topTitle = sanitizeText(notes.title || 'Study Notes');
      const truncatedTop = topTitle.length > 50 ? topTitle.slice(0, 48) + '...' : topTitle;
      doc.text(`${truncatedTop.toUpperCase()} | AI ACADEMIC NOTES`, margin, 24);
      doc.text(`Page ${i}`, pageWidth - margin, 24, { align: 'right' });
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, 28, pageWidth - margin, 28);
    }

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.75);
    doc.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text('Standard A4 · 210 × 297 mm | AI Academic Notes', margin, pageHeight - 20);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 20, { align: 'right' });
  }

  doc.save(filename);
}

/**
 * Direct Vector Study Planner PDF generator using jsPDF
 */
export function downloadVectorPlannerPdf(
  planner: StudyPlannerData,
  filename: string = 'Study_Timetable.pdf'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const margin = 40;
  let y = 46;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;
  const bottomThreshold = pageHeight - margin - 25;

  const checkPageBreak = (neededHeight: number = 24) => {
    if (y + neededHeight > bottomThreshold) {
      doc.addPage();
      y = margin + 15;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('Personalized Study Schedule', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Structured day-wise revision timetable generated with StudyNova AI.', margin, y);
  y += 16;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  if (planner.schedule && Array.isArray(planner.schedule)) {
    planner.schedule.forEach((dayPlan) => {
      checkPageBreak(36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(67, 56, 202);
      doc.text(`${dayPlan.day} (${dayPlan.date})`, margin, y);
      y += 13;

      if (dayPlan.slots && Array.isArray(dayPlan.slots)) {
        dayPlan.slots.forEach((slot) => {
          checkPageBreak(22);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          const timeSlot = `${slot.start} - ${slot.end}`;
          doc.text(timeSlot, margin + 4, y);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(`[${slot.subject}]`, margin + 105, y);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          const actLines = doc.splitTextToSize(slot.activity, maxLineWidth - 215);
          doc.text(actLines, margin + 215, y);
          y += Math.max(14, actLines.length * 11 + 3);
        });
      }
      y += 8;
    });
  }

  if (planner.strategyTips && planner.strategyTips.length > 0) {
    checkPageBreak(40);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(180, 83, 9);
    doc.text('Revision Strategy Tips', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    planner.strategyTips.forEach((tip) => {
      const tipLines = doc.splitTextToSize(`•  ${tip}`, maxLineWidth - 8);
      for (const tl of tipLines) {
        checkPageBreak(11.5);
        doc.text(tl, margin + 4, y);
        y += 11.5;
      }
      y += 2;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('StudyNova AI — Personalized Study Timetable', margin, pageHeight - 18);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 18, { align: 'right' });
  }

  doc.save(filename);
}
