import { SheetRow } from '../types';

// ============================================================
// SAMPLE COHORTS
// ============================================================
export const SAMPLE_COHORTS: Record<string, { name: string; rows: SheetRow[] }> = {
  cs: {
    name: 'CS Undergraduates (Cohort A)',
    rows: [
      { id: 'row-1', name: 'Aarav Sharma', subject: 'Data Structures', marks: 94, attendance: 96, status: 'Exemplary' },
      { id: 'row-2', name: 'Ananya Verma', subject: 'Operating Systems', marks: 88, attendance: 92, status: 'Pass' },
      { id: 'row-3', name: 'Rohan Iyer', subject: 'Computer Networks', marks: 54, attendance: 65, status: 'Needs Attention' },
      { id: 'row-4', name: 'Priya Nair', subject: 'Database Systems', marks: 91, attendance: 98, status: 'Exemplary' },
      { id: 'row-5', name: 'Vikram Malhotra', subject: 'Data Structures', marks: 76, attendance: 85, status: 'Pass' },
      { id: 'row-6', name: 'Neha Gupta', subject: 'Web Architecture', marks: 82, attendance: 89, status: 'Pass' },
      { id: 'row-7', name: 'Kabir Patel', subject: 'Operating Systems', marks: 48, attendance: 58, status: 'Needs Attention' },
      { id: 'row-8', name: 'Sneha Kulkarni', subject: 'Database Systems', marks: 95, attendance: 100, status: 'Exemplary' },
      { id: 'row-9', name: 'Arjun Das', subject: 'Computer Networks', marks: 68, attendance: 75, status: 'Pass' },
      { id: 'row-10', name: 'Tanvi Joshi', subject: 'Web Architecture', marks: 85, attendance: 90, status: 'Pass' }
    ]
  },
  ai: {
    name: 'AI & Data Science Batch',
    rows: [
      { id: 'ai-1', name: 'Siddharth Rao', subject: 'Machine Learning', marks: 96, attendance: 98, status: 'Exemplary' },
      { id: 'ai-2', name: 'Meera Menon', subject: 'Deep Learning', marks: 89, attendance: 94, status: 'Pass' },
      { id: 'ai-3', name: 'Aditya Sen', subject: 'Linear Algebra', marks: 58, attendance: 62, status: 'Needs Attention' },
      { id: 'ai-4', name: 'Kavya Pillai', subject: 'Probability & Stats', marks: 92, attendance: 95, status: 'Exemplary' },
      { id: 'ai-5', name: 'Devendra Singh', subject: 'Machine Learning', marks: 74, attendance: 80, status: 'Pass' },
      { id: 'ai-6', name: 'Rhea Deshmukh', subject: 'Deep Learning', marks: 91, attendance: 93, status: 'Exemplary' },
      { id: 'ai-7', name: 'Manish Kumar', subject: 'Probability & Stats', marks: 52, attendance: 55, status: 'Needs Attention' },
      { id: 'ai-8', name: 'Ishita Banerjee', subject: 'Linear Algebra', marks: 84, attendance: 88, status: 'Pass' }
    ]
  },
  stem: {
    name: 'Advanced STEM Foundation',
    rows: [
      { id: 'stem-1', name: 'Rahul Choudhury', subject: 'Calculus III', marks: 93, attendance: 95, status: 'Exemplary' },
      { id: 'stem-2', name: 'Divya Reddy', subject: 'Quantum Physics', marks: 87, attendance: 91, status: 'Pass' },
      { id: 'stem-3', name: 'Karan Mehra', subject: 'Discrete Math', marks: 55, attendance: 60, status: 'Needs Attention' },
      { id: 'stem-4', name: 'Shruti Hegde', subject: 'Calculus III', marks: 90, attendance: 96, status: 'Exemplary' },
      { id: 'stem-5', name: 'Nikhil Jain', subject: 'Quantum Physics', marks: 78, attendance: 82, status: 'Pass' },
      { id: 'stem-6', name: 'Ayesha Khan', subject: 'Discrete Math', marks: 84, attendance: 89, status: 'Pass' }
    ]
  }
};

// ============================================================
// GOOGLE APPS SCRIPT READY-TO-DEPLOY TEMPLATE
// ============================================================
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `// ============================================================
// GOOGLE APPS SCRIPT WEB APP FOR STUDYNOVA AI
// Instructions:
// 1. In your Google Sheet, click Extensions > Apps Script
// 2. Paste this code into Code.gs
// 3. Click Deploy > New Deployment
// 4. Select type: Web app
// 5. Set 'Execute as': Me
// 6. Set 'Who has access': Anyone
// 7. Copy the Web App URL and paste it into StudyNova AI!
// ============================================================

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var rows = [];
    
    for (var i = 1; i < data.length; i++) {
      var rowObj = { id: 'row-' + i };
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        var key = headers[j];
        if (key === 'marks' || key === 'attendance') {
          val = Number(val) || 0;
        }
        rowObj[key] = val;
      }
      if (!rowObj.status) {
        var m = Number(rowObj.marks) || 0;
        rowObj.status = m >= 90 ? 'Exemplary' : (m < 60 ? 'Needs Attention' : 'Pass');
      }
      rows.push(rowObj);
    }
    
    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var body = JSON.parse(e.postData.contents);
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'name', 'subject', 'marks', 'attendance', 'status']);
    }
    
    var status = body.status;
    if (!status) {
      var m = Number(body.marks) || 0;
      status = m >= 90 ? 'Exemplary' : (m < 60 ? 'Needs Attention' : 'Pass');
    }
    
    sheet.appendRow([
      body.id || ('id-' + Date.now()),
      body.name || '',
      body.subject || '',
      Number(body.marks) || 0,
      Number(body.attendance) || 0,
      status
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Row added' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

// ============================================================
// CSV IMPORT & EXPORT UTILITIES
// ============================================================

/**
 * Converts SheetRow[] to standard CSV string
 */
export function rowsToCsv(rows: SheetRow[]): string {
  const headers = ['ID', 'Student Name', 'Subject', 'Marks', 'Attendance', 'Status'];
  const lines = [headers.join(',')];

  rows.forEach((r) => {
    const safeName = `"${r.name.replace(/"/g, '""')}"`;
    const safeSubject = `"${r.subject.replace(/"/g, '""')}"`;
    lines.push([r.id, safeName, safeSubject, r.marks, r.attendance, r.status].join(','));
  });

  return lines.join('\n');
}

/**
 * Parses raw CSV string to SheetRow[]
 */
export function parseCsvToRows(csvText: string): SheetRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('student'));
  const subjectIdx = headers.findIndex((h) => h.includes('subject') || h.includes('course'));
  const marksIdx = headers.findIndex((h) => h.includes('mark') || h.includes('score') || h.includes('grade'));
  const attIdx = headers.findIndex((h) => h.includes('att') || h.includes('presence'));
  const statusIdx = headers.findIndex((h) => h.includes('status'));

  const result: SheetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple comma split respecting quotes
    const cols = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length < 2) continue;

    const name = nameIdx !== -1 ? cols[nameIdx] : cols[0] || 'Unknown';
    const subject = subjectIdx !== -1 ? cols[subjectIdx] : cols[1] || 'General';
    const marks = marksIdx !== -1 ? Number(cols[marksIdx]) || 0 : Number(cols[2]) || 75;
    const attendance = attIdx !== -1 ? Number(cols[attIdx]) || 0 : Number(cols[3]) || 80;

    let status: 'Pass' | 'Fail' | 'Needs Attention' | 'Exemplary' = 'Pass';
    if (statusIdx !== -1 && cols[statusIdx]) {
      const s = cols[statusIdx].toLowerCase();
      if (s.includes('exemp')) status = 'Exemplary';
      else if (s.includes('fail') || s.includes('need') || s.includes('attent')) status = 'Needs Attention';
      else status = 'Pass';
    } else {
      if (marks >= 90) status = 'Exemplary';
      else if (marks < 60) status = 'Needs Attention';
      else status = 'Pass';
    }

    result.push({
      id: `csv-${Date.now()}-${i}`,
      name,
      subject,
      marks,
      attendance,
      status
    });
  }

  return result;
}

// ============================================================
// STATISTICAL & KPI CALCULATIONS
// ============================================================
export interface CohortKpis {
  totalStudents: number;
  averageMarks: number;
  averageAttendance: number;
  exemplaryCount: number;
  exemplaryPct: number;
  needsAttentionCount: number;
  needsAttentionPct: number;
  passCount: number;
  topStudent: { name: string; marks: number } | null;
  lowestStudent: { name: string; marks: number } | null;
  subjectAverages: { subject: string; avgMarks: number; count: number }[];
  gradeDistribution: {
    exemplary: number;
    pass: number;
    needsAttention: number;
  };
}

export function computeCohortKpis(rows: SheetRow[]): CohortKpis {
  if (rows.length === 0) {
    return {
      totalStudents: 0,
      averageMarks: 0,
      averageAttendance: 0,
      exemplaryCount: 0,
      exemplaryPct: 0,
      needsAttentionCount: 0,
      needsAttentionPct: 0,
      passCount: 0,
      topStudent: null,
      lowestStudent: null,
      subjectAverages: [],
      gradeDistribution: { exemplary: 0, pass: 0, needsAttention: 0 }
    };
  }

  const total = rows.length;
  let sumMarks = 0;
  let sumAtt = 0;
  let exemplaryCount = 0;
  let needsAttentionCount = 0;

  let top = rows[0];
  let lowest = rows[0];

  const subjectMap: Record<string, { sum: number; count: number }> = {};

  rows.forEach((r) => {
    sumMarks += r.marks;
    sumAtt += r.attendance;

    if (r.status === 'Exemplary') exemplaryCount++;
    else if (r.status === 'Needs Attention') needsAttentionCount++;

    if (r.marks > top.marks) top = r;
    if (r.marks < lowest.marks) lowest = r;

    if (!subjectMap[r.subject]) {
      subjectMap[r.subject] = { sum: 0, count: 0 };
    }
    subjectMap[r.subject].sum += r.marks;
    subjectMap[r.subject].count++;
  });

  const subjectAverages = Object.keys(subjectMap).map((subj) => ({
    subject: subj,
    avgMarks: Math.round(subjectMap[subj].sum / subjectMap[subj].count),
    count: subjectMap[subj].count
  }));

  const avgMarks = Math.round((sumMarks / total) * 10) / 10;
  const avgAtt = Math.round((sumAtt / total) * 10) / 10;

  return {
    totalStudents: total,
    averageMarks: avgMarks,
    averageAttendance: avgAtt,
    exemplaryCount,
    exemplaryPct: Math.round((exemplaryCount / total) * 100),
    needsAttentionCount,
    needsAttentionPct: Math.round((needsAttentionCount / total) * 100),
    passCount: total - needsAttentionCount,
    topStudent: { name: top.name, marks: top.marks },
    lowestStudent: { name: lowest.name, marks: lowest.marks },
    subjectAverages,
    gradeDistribution: {
      exemplary: exemplaryCount,
      pass: total - exemplaryCount - needsAttentionCount,
      needsAttention: needsAttentionCount
    }
  };
}
