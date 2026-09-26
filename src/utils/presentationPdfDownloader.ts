import { jsPDF } from 'jspdf';
import { PresentationData, PresentationThemeId } from '../types';

interface ThemePdfColors {
  bg: [number, number, number];
  cardBg: [number, number, number];
  title: [number, number, number];
  text: [number, number, number];
  accent: [number, number, number];
  badgeBg: [number, number, number];
  badgeText: [number, number, number];
  border: [number, number, number];
  headerText: [number, number, number];
}

const THEME_COLORS: Record<PresentationThemeId, ThemePdfColors> = {
  midnight: {
    bg: [15, 23, 42], // Slate 900
    cardBg: [30, 41, 59], // Slate 800
    title: [255, 255, 255],
    text: [226, 232, 240], // Slate 200
    accent: [129, 140, 248], // Indigo 400
    badgeBg: [6, 78, 59], // Emerald 900
    badgeText: [110, 231, 183], // Emerald 300
    border: [51, 65, 85],
    headerText: [148, 163, 184]
  },
  academic: {
    bg: [255, 255, 255],
    cardBg: [248, 250, 252],
    title: [15, 23, 42],
    text: [51, 65, 85],
    accent: [37, 99, 235], // Blue 600
    badgeBg: [254, 243, 199], // Amber 100
    badgeText: [146, 64, 14], // Amber 800
    border: [203, 213, 225],
    headerText: [100, 116, 139]
  },
  emerald: {
    bg: [6, 78, 59], // Deep Emerald
    cardBg: [4, 120, 87],
    title: [255, 255, 255],
    text: [209, 250, 229],
    accent: [52, 211, 153], // Mint 400
    badgeBg: [2, 44, 34],
    badgeText: [167, 243, 208],
    border: [5, 150, 105],
    headerText: [167, 243, 208]
  },
  editorial: {
    bg: [253, 251, 247], // Warm Cream
    cardBg: [255, 255, 255],
    title: [17, 24, 39],
    text: [55, 65, 81],
    accent: [217, 119, 6], // Amber 600
    badgeBg: [243, 244, 246],
    badgeText: [31, 41, 55],
    border: [229, 231, 235],
    headerText: [107, 114, 128]
  },
  cyber: {
    bg: [9, 13, 22], // Obsidian Dark
    cardBg: [17, 24, 39],
    title: [244, 63, 94], // Rose 500
    text: [226, 232, 240],
    accent: [6, 182, 212], // Cyan 500
    badgeBg: [30, 41, 59],
    badgeText: [56, 189, 248],
    border: [51, 65, 85],
    headerText: [148, 163, 184]
  }
};

const sanitize = (str: string): string => {
  if (!str) return '';
  return String(str)
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/[■▸►✔✕✓💡⚠️📌🎯★☆●]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Downloads full presentation deck as a 16:9 Landscape Vector PDF
 */
export function downloadPresentationPdf(
  presentation: PresentationData,
  themeId: PresentationThemeId = 'midnight',
  filename?: string
): void {
  const widthPt = 960;
  const heightPt = 540; // 16:9 Widescreen aspect ratio

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [widthPt, heightPt]
  });

  const theme = THEME_COLORS[themeId] || THEME_COLORS.midnight;
  const totalSlides = presentation.slides.length;
  const margin = 50;
  const contentWidth = widthPt - margin * 2;

  presentation.slides.forEach((slide, idx) => {
    if (idx > 0) {
      doc.addPage([widthPt, heightPt], 'landscape');
    }

    // 1. Background Fill
    doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
    doc.rect(0, 0, widthPt, heightPt, 'F');

    // 2. Top Header Bar
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(theme.headerText[0], theme.headerText[1], theme.headerText[2]);
    const deckTitle = sanitize(presentation.title).toUpperCase();
    doc.text(deckTitle.length > 50 ? `${deckTitle.substring(0, 47)}...` : deckTitle, margin, 42);

    const slideCounter = `SLIDE ${idx + 1} OF ${totalSlides}`;
    doc.text(slideCounter, widthPt - margin, 42, { align: 'right' });

    // Header divider line
    doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
    doc.setLineWidth(1);
    doc.line(margin, 52, widthPt - margin, 52);

    // 3. Slide Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);
    const titleLines = doc.splitTextToSize(sanitize(slide.title), contentWidth);
    let currentY = 85;
    for (const tl of titleLines) {
      doc.text(tl, margin, currentY);
      currentY += 26;
    }

    // Title accent underline
    doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    doc.setLineWidth(2.5);
    doc.line(margin, currentY - 14, margin + 80, currentY - 14);
    currentY += 14;

    // 4. Bullet Points
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);

    slide.bullets.forEach((bullet) => {
      // Draw circular bullet dot
      doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
      doc.circle(margin + 5, currentY - 4.5, 3.5, 'F');

      const cleanBullet = sanitize(bullet);
      const bLines = doc.splitTextToSize(cleanBullet, contentWidth - 25);
      for (let bIdx = 0; bIdx < bLines.length; bIdx++) {
        doc.text(bLines[bIdx], margin + 20, currentY);
        currentY += 18;
      }
      currentY += 8;
    });

    // 5. Key Takeaway Badge (if available)
    if (slide.keyTakeaway && slide.keyTakeaway.trim()) {
      currentY = Math.max(currentY + 6, heightPt - 105);
      const takeawayText = `KEY TAKEAWAY: ${sanitize(slide.keyTakeaway)}`;
      const takeawayLines = doc.splitTextToSize(takeawayText, contentWidth - 24);
      const boxHeight = takeawayLines.length * 14 + 16;

      doc.setFillColor(theme.badgeBg[0], theme.badgeBg[1], theme.badgeBg[2]);
      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 6, 6, 'F');

      doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
      doc.setLineWidth(0.75);
      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 6, 6, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.badgeText[0], theme.badgeText[1], theme.badgeText[2]);
      let takeY = currentY + 14;
      for (const line of takeawayLines) {
        doc.text(line, margin + 12, takeY);
        takeY += 14;
      }
    }

    // 6. Running Slide Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(theme.headerText[0], theme.headerText[1], theme.headerText[2]);
    doc.text('AI Academic Presentation Deck · Widescreen 16:9', margin, heightPt - 20);
    doc.text(`Page ${idx + 1}`, widthPt - margin, heightPt - 20, { align: 'right' });
  });

  // 7. Optional Speaker Notes Appendix Page
  doc.addPage([widthPt, heightPt], 'landscape');
  doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
  doc.rect(0, 0, widthPt, heightPt, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);
  doc.text('PRESENTER SCRIPT & SPEAKER NOTES SUMMARY', margin, 50);

  doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
  doc.setLineWidth(1);
  doc.line(margin, 60, widthPt - margin, 60);

  let notesY = 85;
  presentation.slides.forEach((s, idx) => {
    if (notesY > heightPt - 60) {
      doc.addPage([widthPt, heightPt], 'landscape');
      doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
      doc.rect(0, 0, widthPt, heightPt, 'F');
      notesY = 50;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
    doc.text(`Slide ${idx + 1}: ${sanitize(s.title)}`, margin, notesY);
    notesY += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
    const noteLines = doc.splitTextToSize(`"${sanitize(s.speakerNotes || 'No notes.')}"`, contentWidth);
    for (const nl of noteLines) {
      doc.text(nl, margin, notesY);
      notesY += 12;
    }
    notesY += 10;
  });

  const finalName = filename || `${presentation.title.replace(/\s+/g, '_')}_Presentation.pdf`;
  doc.save(finalName);
}
