import {
  ResumeData,
  NotesData,
  PresentationData,
  MindMapNode,
  SheetRow,
  SheetAnalysis,
  QuizData,
  ChatMessage,
  Flashcard,
  StudyPlannerData,
  OCRSummaryData
} from '../types';

/**
 * Reusable AI Service Layer
 * Architecture:
 * Client UI -> /api/* (Server-side Gemini 3.8 Flash SDK) -> Validated Schema
 * Strict Zero Mock/Dummy Data Policy: Always throws real errors on failures.
 */

/**
 * Clean & safely parse JSON from AI response
 */
export function safeParseJson<T>(rawText: string, fallback: T): T {
  try {
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidate = codeBlockMatch ? codeBlockMatch[1] : rawText;

    const firstBrace = candidate.indexOf('{');
    const firstBracket = candidate.indexOf('[');
    let startIdx = -1;

    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    if (startIdx !== -1) {
      const cleanString = candidate.slice(startIdx).trim();
      return JSON.parse(cleanString) as T;
    }

    return JSON.parse(rawText) as T;
  } catch (error) {
    console.warn('safeParseJson error, returning fallback:', error);
    return fallback;
  }
}

// ============================================================
// 1. RESUME GENERATOR SERVICE
// ============================================================

/**
 * Validates and normalizes candidate resume data against expected schema.
 * Rejects malformed structures gracefully.
 */
export function validateAndNormalizeResumeData(raw: any, isFallback: boolean = false): ResumeData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid resume data: Expected an object');
  }

  const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';

  const education = Array.isArray(raw.education)
    ? raw.education
        .filter((e: any) => e && (e.degree || e.school))
        .map((e: any) => ({
          degree: String(e.degree || '').trim(),
          school: String(e.school || '').trim(),
          period: String(e.period || '').trim(),
          grade: e.grade ? String(e.grade).trim() : undefined
        }))
    : [];

  const skills = Array.isArray(raw.skills)
    ? raw.skills
        .filter((s: any) => s && (s.category || (Array.isArray(s.items) && s.items.length > 0)))
        .map((s: any) => ({
          category: String(s.category || 'Skills').trim(),
          items: Array.isArray(s.items) ? s.items.map((i: any) => String(i).trim()).filter(Boolean) : []
        }))
    : [];

  const experience = Array.isArray(raw.experience)
    ? raw.experience
        .filter((exp: any) => exp && (exp.role || exp.organization))
        .map((exp: any) => ({
          role: String(exp.role || '').trim(),
          organization: String(exp.organization || '').trim(),
          period: String(exp.period || '').trim(),
          bullets: Array.isArray(exp.bullets)
            ? exp.bullets.map((b: any) => String(b).trim()).filter(Boolean)
            : []
        }))
    : [];

  const projects = Array.isArray(raw.projects)
    ? raw.projects
        .filter((p: any) => p && p.title)
        .map((p: any) => ({
          title: String(p.title || '').trim(),
          description: String(p.description || '').trim(),
          technologies: Array.isArray(p.technologies)
            ? p.technologies.map((t: any) => String(t).trim()).filter(Boolean)
            : []
        }))
    : [];

  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications.map((c: any) => String(c).trim()).filter(Boolean)
    : [];

  const achievements = Array.isArray(raw.achievements)
    ? raw.achievements.map((a: any) => String(a).trim()).filter(Boolean)
    : [];

  return {
    summary,
    education,
    skills,
    experience,
    projects,
    certifications,
    achievements,
    isFallback,
    lastGeneratedAt: new Date().toISOString()
  };
}

export async function generateResumeAI(formData: {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  careerObjective: string;
  education: Array<{ degree: string; school: string; field: string; startYear: string; endYear: string }>;
  skills: string;
  experience: Array<{ role: string; organization: string; startDate: string; endDate: string; highlights: string }>;
  projects: Array<{ title: string; description: string; technologies: string }>;
  certifications: Array<{ title: string; issuer: string; issueDate: string }>;
  achievements: string;
}, _options: { allowFallback?: boolean } = {}): Promise<ResumeData> {
  if (!formData.fullName.trim()) {
    throw new Error('Full Name is required to build a resume.');
  }

  const res = await fetch('/api/generate-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to generate resume (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return validateAndNormalizeResumeData(data, false);
}

// ============================================================
// 2. NOTES GENERATOR SERVICE
// ============================================================
export async function generateNotesAI(params: {
  topic: string;
  subject: string;
  rawContent: string;
  length: 'concise' | 'balanced' | 'comprehensive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
}): Promise<NotesData> {
  const rawTopic = params.topic?.trim() || '';
  const rawContent = params.rawContent?.trim() || '';

  if (!rawTopic && !rawContent) {
    throw new Error('Please provide either a Topic or Raw Study Material to generate notes.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch('/api/generate-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `AI generation failed (HTTP ${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    if (
      !data ||
      !data.title ||
      !data.overview ||
      !Array.isArray(data.mainConcepts) ||
      data.mainConcepts.length === 0
    ) {
      throw new Error('Incomplete notes structure received from AI service. Please try again.');
    }

    if (!data.sourceContent && rawContent) {
      data.sourceContent = rawContent;
    }
    data.isFallback = false;
    return data as NotesData;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('The AI model took longer than 60 seconds to process your request. Please try again or simplify your query.');
    }
    throw err instanceof Error ? err : new Error(String(err) || 'Failed to generate study notes.');
  }
}

// ============================================================
// 3. PRESENTATION GENERATOR SERVICE
// ============================================================
export async function generatePresentationAI(params: {
  topic: string;
  slideCount: number;
  audience: string;
  subject: string;
  style: string;
}): Promise<PresentationData> {
  if (!params.topic.trim()) {
    throw new Error('Topic is required for generating a presentation.');
  }

  const res = await fetch('/api/generate-presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to generate presentation (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.slides) || data.slides.length === 0) {
    throw new Error('Invalid presentation structure received from AI.');
  }

  return data as PresentationData;
}

// ============================================================
// 4. MIND MAP GENERATOR SERVICE
// ============================================================
export async function generateMindMapAI(syllabusText: string): Promise<MindMapNode> {
  const cleanText = syllabusText.trim();
  if (!cleanText) {
    throw new Error('Syllabus or topic text is required to generate a mind map.');
  }

  const res = await fetch('/api/generate-mindmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ syllabusText: cleanText })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to generate mind map (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !data.title) {
    throw new Error('Invalid mind map structure received from AI.');
  }

  return data as MindMapNode;
}

// ============================================================
// 5. GOOGLE SHEETS AI ANALYSIS SERVICE
// ============================================================
export async function analyzeSheetDataAI(rows: SheetRow[]): Promise<SheetAnalysis> {
  if (!rows || rows.length === 0) {
    throw new Error('No records available in the sheet to analyze.');
  }

  const res = await fetch('/api/analyze-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to analyze spreadsheet (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !data.summary) {
    throw new Error('Invalid sheet analysis structure received from AI.');
  }

  return data as SheetAnalysis;
}

// ============================================================
// 6. QUIZ GENERATOR SERVICE
// ============================================================
export async function generateQuizAI(params: {
  topic: string;
  notes?: string;
  count: number;
  difficulty: string;
}): Promise<QuizData> {
  if (!params.topic?.trim() && !params.notes?.trim()) {
    throw new Error('Topic or notes are required to generate a quiz.');
  }

  const res = await fetch('/api/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to generate quiz (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('Invalid quiz questions received from AI.');
  }

  return data as QuizData;
}

export async function explainQuizAnswerAI(params: {
  question: string;
  options: string[];
  correctAnswer: number;
  userChoice?: number;
  topic?: string;
}): Promise<string> {
  const res = await fetch('/api/explain-quiz-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to explain answer (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.explanation || 'No detailed rationale available.';
}

// ============================================================
// 7. DOUBT SOLVER CHATBOT SERVICE
// ============================================================
export async function solveDoubtAI(params: {
  question: string;
  subject?: string;
  level?: string;
  language?: string;
  mode?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<ChatMessage> {
  if (!params.question?.trim()) {
    throw new Error('Question is required.');
  }

  const res = await fetch('/api/solve-doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to solve doubt (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !data.content) {
    throw new Error('Invalid response received from tutor AI.');
  }

  return data as ChatMessage;
}

// ============================================================
// 8. FLASHCARD GENERATOR SERVICE
// ============================================================
export async function generateFlashcardsAI(params: {
  topic: string;
  material: string;
  count: number;
  difficulty: string;
}): Promise<Flashcard[]> {
  if (!params.topic?.trim() && !params.material?.trim()) {
    throw new Error('Topic or study material is required to generate flashcards.');
  }

  const res = await fetch('/api/generate-flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to generate flashcards (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid flashcards array received from AI.');
  }

  return data as Flashcard[];
}

// ============================================================
// 9. STUDY PLANNER SERVICE
// ============================================================
export async function generateStudyPlannerAI(params: {
  subjects: string;
  examDate: string;
  availableHours: number;
  studyDays: string[];
  preferredTime: string;
  prioritySubjects: string;
}): Promise<StudyPlannerData> {
  if (!params.subjects?.trim()) {
    throw new Error('Please specify your subjects to generate a study timetable.');
  }

  const res = await fetch('/api/generate-study-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to generate study timetable (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.schedule) || data.schedule.length === 0) {
    throw new Error('Invalid study timetable received from AI.');
  }

  return data as StudyPlannerData;
}

// ============================================================
// 10. OCR SUMMARIZER SERVICE
// ============================================================
export async function extractOCRAI(base64Image: string, mimeType: string): Promise<string> {
  if (!base64Image) {
    throw new Error('Image data is required for OCR extraction.');
  }

  const res = await fetch('/api/extract-ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, mimeType })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to extract OCR (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.text || '';
}

export async function summarizeOCRAI(rawOcrText: string): Promise<OCRSummaryData> {
  const text = rawOcrText?.trim();
  if (!text) {
    throw new Error('No extracted OCR text provided to summarize.');
  }

  const res = await fetch('/api/summarize-ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawOcrText: text })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to summarize text (HTTP ${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  if (!data || !data.shortSummary) {
    throw new Error('Invalid summary received from AI.');
  }

  return data as OCRSummaryData;
}
