/**
 * Shared Authoritative Physical Resume Metrics
 * Standard ISO A4 Portrait (210mm x 297mm)
 * Single Source of Truth for Browser Preview, Print, and PDF Exporter
 */

export const RESUME_METRICS = {
  // Physical Dimensions
  widthMm: 210,
  heightMm: 297,
  aspectRatio: 210 / 297, // ~0.70707

  // Point metrics (jsPDF standard: 72 points per inch)
  widthPt: 595.28,
  heightPt: 841.89,

  // Exact PDF Margins
  marginTopPt: 40,
  marginRightPt: 40,
  marginBottomPt: 40,
  marginLeftPt: 40,

  // Printable Content Area
  contentWidthPt: 515.28, // 595.28 - 80
  contentHeightPt: 761.89, // 841.89 - 80
  maxPageContentHeightPt: 745, // Threshold for triggering page breaks

  // Percentage Margins for Proportional CSS Preview
  marginHorizontalPercent: (40 / 595.28) * 100, // ~6.72%
  marginTopPercent: (40 / 841.89) * 100, // ~4.75%
  marginBottomPercent: (32 / 841.89) * 100, // ~3.80%

  // Typography Ratios (Line-height to font-size ~1.32 - 1.35)
  lineHeightRatio: 1.35,
  headerHeightEstimate: 58,
  sectionHeadingHeightPt: 20,
  lineHeightPt: 11.5,
  fontSizeBodyPt: 8.5,
  fontSizeHeadingPt: 10,
  fontSizeTitlePt: 18
};
