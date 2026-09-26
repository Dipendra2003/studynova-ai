/**
 * Shared A4 Document Page Model & Pagination Engine for Notes
 *
 * A4 Standard Dimensions:
 * - Dimensions: 210mm x 297mm (595.28pt x 841.89pt / 794px x 1123px)
 * - Calibrated density: packs maximum high-retention content onto full pages
 *   before breaking to the next page, with a guaranteed bottom safety buffer
 *   so content is NEVER cut off by the running footer.
 */

import { NotesData } from '../types';

export const NOTES_PAGE_CONFIG = {
  widthMm: 210,
  heightMm: 297,
  widthPt: 595.28,
  heightPt: 841.89,
  marginTopPt: 30,
  marginRightPt: 36,
  marginBottomPt: 30,
  marginLeftPt: 36,
  usableWidthPt: 523.28,
  usableHeightPage1Pt: 710,
  usableHeightPageNPt: 730
};

export interface ParsedTable {
  title?: string;
  header: string[];
  rows: string[][];
}

export function parseTableFromText(text: string): ParsedTable | null {
  if (!text || typeof text !== 'string') return null;
  if (!text.includes('|')) return null;

  const pipeCount = (text.match(/\|/g) || []).length;
  const hasDivider = text.includes('---') || text.includes('-|-');
  if (!hasDivider && pipeCount < 4) return null;

  let title: string | undefined;
  let body = text;

  const firstPipe = text.indexOf('|');
  if (firstPipe > 0) {
    const rawTitle = text.substring(0, firstPipe).replace(/^[•\*\-\s]+/, '').replace(/[:\s]+$/, '').trim();
    if (rawTitle.length > 2 && rawTitle.length < 90) {
      title = rawTitle;
    }
    body = text.substring(firstPipe);
  }

  // Normalize delimiters (replace || with newline+pipe)
  const normalized = body
    .replace(/\|\|/g, '\n|')
    .replace(/(\|(?:\s*:?---+:?\s*\|)+)/g, '$1\n|');

  const rawLines = normalized.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.includes('|'));
  const rows: string[][] = [];

  for (const line of rawLines) {
    let cells = line.split('|').map((c) => c.trim());
    if (cells.length > 0 && cells[0] === '') cells.shift();
    if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    if (cells.length === 0) continue;
    if (cells.every((c) => /^:?-+:?$/.test(c.replace(/\s+/g, '')))) continue;
    if (cells.length > 1) rows.push(cells);
  }

  if (rows.length < 2) return null;
  return { title, header: rows[0], rows: rows.slice(1) };
}

export interface NotesBlockDocHeader {
  id: string;
  type: 'doc_header';
  title: string;
  overview: string;
}

export interface NotesBlockSectionTitle {
  id: string;
  type: 'section_title';
  num: string;
  title: string;
}

export interface NotesBlockConcept {
  id: string;
  type: 'concept';
  conceptIndex: number;
  conceptTitle: string;
  points: string[];
}

export interface NotesBlockTerm {
  id: string;
  type: 'term';
  term: string;
  definition: string;
}

export interface NotesBlockBullet {
  id: string;
  type: 'key_point' | 'example' | 'exam_point';
  text: string;
}

export interface NotesBlockQuickRevision {
  id: string;
  type: 'quick_revision';
  text: string;
}

export interface NotesBlockSourceParagraph {
  id: string;
  type: 'source_paragraph';
  text: string;
}

export type NotesBlock =
  | NotesBlockDocHeader
  | NotesBlockSectionTitle
  | NotesBlockConcept
  | NotesBlockTerm
  | NotesBlockBullet
  | NotesBlockQuickRevision
  | NotesBlockSourceParagraph;

export interface NotesPage {
  pageNumber: number;
  blocks: NotesBlock[];
}

export function estimateLines(text: string, maxCharsPerLine: number = 110): number {
  if (!text) return 0;
  const lines = text.split('\n');
  let count = 0;
  for (const l of lines) {
    if (!l.trim()) {
      count += 1;
    } else {
      count += Math.max(1, Math.ceil(l.length / maxCharsPerLine));
    }
  }
  return count;
}

export function estimatePointHeight(pt: string): number {
  if (!pt) return 0;

  // Accurately calculate table height if point is a table
  const table = parseTableFromText(pt);
  if (table) {
    const titleHeight = table.title ? 20 : 0;
    const headerHeight = 20;
    let rowsHeight = 0;
    for (const r of table.rows) {
      const maxLen = Math.max(...r.map((c) => c.length), 0);
      const lines = Math.max(1, Math.ceil(maxLen / 35));
      rowsHeight += lines * 12 + 4;
    }
    return titleHeight + headerHeight + rowsHeight + 10;
  }

  if (pt.includes('public class') || pt.includes('def ') || pt.startsWith('```')) {
    const codeLines = pt.split('\n').length;
    return codeLines * 13 + 16;
  }

  const lines = estimateLines(pt, 110);
  return lines * 12.5 + 3;
}

export function estimateTermHeight(def: string): number {
  const lines = estimateLines(def, 110);
  return 12 + lines * 12;
}

export function paginateNotesData(notes: NotesData): NotesPage[] {
  if (!notes) return [];

  const pages: NotesPage[] = [];
  let currentPageBlocks: NotesBlock[] = [];
  let currentPageNum = 1;
  let currentY = 30; // Top margin in pt

  const getUsableLimit = () =>
    currentPageNum === 1 ? NOTES_PAGE_CONFIG.usableHeightPage1Pt : NOTES_PAGE_CONFIG.usableHeightPageNPt;

  const startNextPage = () => {
    if (currentPageBlocks.length > 0) {
      pages.push({
        pageNumber: currentPageNum,
        blocks: currentPageBlocks
      });
      currentPageNum++;
      currentPageBlocks = [];
    }
    currentY = 30;
  };

  let blockIdCounter = 1;
  const genId = () => `b_${blockIdCounter++}`;

  // 1. Document Header (Page 1 Top)
  if (notes.title || notes.overview) {
    const titleLines = estimateLines(notes.title || '', 60);
    const titleHeight = titleLines * 16 + 4;
    const overviewLines = estimateLines(notes.overview || '', 110);
    const overviewHeight = overviewLines > 0 ? overviewLines * 12 + 6 : 0;
    const headerHeight = 18 + titleHeight + overviewHeight + 6;

    currentPageBlocks.push({
      id: genId(),
      type: 'doc_header',
      title: notes.title || 'Structured Study Notes',
      overview: notes.overview || ''
    });
    currentY += headerHeight;
  }

  // Section title helper with orphan protection
  const pushSectionTitle = (num: string, title: string, minSpaceNeeded: number = 45) => {
    const limit = getUsableLimit();
    if (currentY + minSpaceNeeded > limit && currentPageBlocks.length > 0) {
      startNextPage();
    }
    currentPageBlocks.push({
      id: genId(),
      type: 'section_title',
      num,
      title
    });
    currentY += 24;
  };

  // 2. Main Concepts Section
  if (notes.mainConcepts && notes.mainConcepts.length > 0) {
    pushSectionTitle('1', 'Core Concepts & Detailed Explanations', 40);

    notes.mainConcepts.forEach((mc, cIdx) => {
      const conceptTitle = mc.concept || `Concept ${cIdx + 1}`;
      const points = Array.isArray(mc.points) ? mc.points : [String(mc.points)];
      let remainingPoints = [...points];
      let isContinuation = false;

      while (remainingPoints.length > 0) {
        const limit = getUsableLimit();
        const available = limit - currentY;
        const headerHeight = 18;
        const firstPtHeight = estimatePointHeight(remainingPoints[0]);
        const secondPtHeight = remainingPoints.length > 1 ? estimatePointHeight(remainingPoints[1]) : 0;
        const minNeededToStart = !isContinuation && remainingPoints.length > 1
          ? (headerHeight + firstPtHeight + secondPtHeight * 0.7)
          : (headerHeight + firstPtHeight);

        // Never leave an orphan concept header or an awkward single-bullet fragment
        if (available < minNeededToStart && currentPageBlocks.length > 0) {
          startNextPage();
        }

        const pageLimit = getUsableLimit();
        let fittingPoints: string[] = [];
        let accumulatedHeight = headerHeight;

        let pIdx = 0;
        while (pIdx < remainingPoints.length) {
          const ptH = estimatePointHeight(remainingPoints[pIdx]);
          if (currentY + accumulatedHeight + ptH > pageLimit && fittingPoints.length > 0) {
            break;
          }
          fittingPoints.push(remainingPoints[pIdx]);
          accumulatedHeight += ptH;
          pIdx++;
        }

        if (fittingPoints.length === 0) {
          fittingPoints.push(remainingPoints[0]);
          accumulatedHeight += firstPtHeight;
          pIdx = 1;
        }

        const titleToUse = isContinuation ? `${conceptTitle} (Cont.)` : conceptTitle;

        currentPageBlocks.push({
          id: genId(),
          type: 'concept',
          conceptIndex: cIdx,
          conceptTitle: titleToUse,
          points: fittingPoints
        });

        currentY += accumulatedHeight + 6;
        remainingPoints = remainingPoints.slice(pIdx);
        isContinuation = true;

        if (remainingPoints.length > 0) {
          startNextPage();
        }
      }
    });
  }

  // 3. Key Terminology Section
  if (notes.importantTerms && notes.importantTerms.length > 0) {
    pushSectionTitle('2', 'Key Terminology & Definitions', 40);

    notes.importantTerms.forEach((t) => {
      const termHeight = estimateTermHeight(t.definition || '');
      if (currentY + termHeight > getUsableLimit() && currentPageBlocks.length > 0) {
        startNextPage();
      }
      currentPageBlocks.push({
        id: genId(),
        type: 'term',
        term: t.term || 'Term',
        definition: t.definition || ''
      });
      currentY += termHeight;
    });
  }

  // 4. High-Yield Key Points Section
  if (notes.keyPoints && notes.keyPoints.length > 0) {
    pushSectionTitle('3', 'High-Yield Key Points', 35);

    notes.keyPoints.forEach((kp) => {
      const kpLines = estimateLines(kp, 110);
      const kpHeight = kpLines * 12 + 3;
      if (currentY + kpHeight > getUsableLimit() && currentPageBlocks.length > 0) {
        startNextPage();
      }
      currentPageBlocks.push({
        id: genId(),
        type: 'key_point',
        text: kp
      });
      currentY += kpHeight;
    });
  }

  // 5. Practical Examples & Applications Section
  if (notes.examples && notes.examples.length > 0) {
    pushSectionTitle('4', 'Practical Examples & Applications', 35);

    notes.examples.forEach((ex) => {
      const exLines = estimateLines(ex, 110);
      const exHeight = exLines * 12 + 3;
      if (currentY + exHeight > getUsableLimit() && currentPageBlocks.length > 0) {
        startNextPage();
      }
      currentPageBlocks.push({
        id: genId(),
        type: 'example',
        text: ex
      });
      currentY += exHeight;
    });
  }

  // 6. Exam Predictions & Key Warnings Section
  if (notes.examPoints && notes.examPoints.length > 0) {
    pushSectionTitle('5', 'Exam Predictions & Key Warnings', 35);

    notes.examPoints.forEach((ep) => {
      const epLines = estimateLines(ep, 110);
      const epHeight = epLines * 12 + 3;
      if (currentY + epHeight > getUsableLimit() && currentPageBlocks.length > 0) {
        startNextPage();
      }
      currentPageBlocks.push({
        id: genId(),
        type: 'exam_point',
        text: ep
      });
      currentY += epHeight;
    });
  }

  // 7. High-Yield Quick Revision & Cram Summary
  if (notes.quickRevision && notes.quickRevision.trim()) {
    pushSectionTitle('6', 'High-Yield Quick Revision', 40);

    const qrLines = estimateLines(notes.quickRevision, 110);
    const qrHeight = 18 + qrLines * 12 + 8;
    if (currentY + qrHeight > getUsableLimit() && currentPageBlocks.length > 0) {
      startNextPage();
    }
    currentPageBlocks.push({
      id: genId(),
      type: 'quick_revision',
      text: notes.quickRevision
    });
    currentY += qrHeight;
  }

  // 8. Source Material Appendix
  if (notes.sourceContent && notes.sourceContent.trim() && notes.includeSourceInPdf !== false) {
    pushSectionTitle(notes.quickRevision ? '7' : '6', 'Provided Study Material Reference', 35);

    const paragraphs = notes.sourceContent.split(/\n+/).map((p) => p.trim()).filter(Boolean);
    paragraphs.forEach((p) => {
      const pLines = estimateLines(p, 110);
      const pHeight = pLines * 11 + 3;
      if (currentY + pHeight > getUsableLimit() && currentPageBlocks.length > 0) {
        startNextPage();
      }
      currentPageBlocks.push({
        id: genId(),
        type: 'source_paragraph',
        text: p
      });
      currentY += pHeight;
    });
  }

  // Finalize last non-empty page
  if (currentPageBlocks.length > 0) {
    pages.push({
      pageNumber: currentPageNum,
      blocks: currentPageBlocks
    });
  }

  return pages.length > 0
    ? pages
    : [
        {
          pageNumber: 1,
          blocks: []
        }
      ];
}
