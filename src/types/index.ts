export interface ToolMeta {
  id: string;
  number: string;
  name: string;
  route: string;
  description: string;
  tags: string[];
  iconName: string;
  category: string;
  timeEstimate: string;
  badge?: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link?: string;
}

export interface CertificationEntry {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
}

export type ResumeTemplateId = 'classic' | 'modern' | 'technical';

export interface ResumeData {
  summary: string;
  education: {
    degree: string;
    school: string;
    period: string;
    grade?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  experience: {
    role: string;
    organization: string;
    period: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  certifications: string[];
  achievements: string[];
  isFallback?: boolean;
  templateId?: ResumeTemplateId;
  lastGeneratedAt?: string;
}

export interface NotesData {
  title: string;
  overview: string;
  mainConcepts: {
    concept: string;
    points: string[];
  }[];
  importantTerms: {
    term: string;
    definition: string;
  }[];
  keyPoints: string[];
  examples: string[];
  examPoints: string[];
  quickRevision?: string;
  sourceContent?: string;
  includeSourceInPdf?: boolean;
  isFallback?: boolean;
}

export type PresentationThemeId = 'midnight' | 'academic' | 'emerald' | 'editorial' | 'cyber';

export interface SlideData {
  title: string;
  bullets: string[];
  speakerNotes: string;
  keyTakeaway?: string;
  layout?: 'standard' | 'split' | 'takeaway';
}

export interface PresentationData {
  title: string;
  subtitle: string;
  theme?: PresentationThemeId;
  slides: SlideData[];
}

export interface MindMapNode {
  id: string;
  title: string;
  explanation?: string;
  children?: MindMapNode[];
}

export interface SheetRow {
  id: string;
  name: string;
  subject: string;
  marks: number;
  attendance: number;
  status: 'Pass' | 'Fail' | 'Needs Attention' | 'Exemplary';
}

export interface SheetAnalysis {
  summary: string;
  averagePerformance: string;
  highestLowest: string;
  attendanceTrends: string;
  observations: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  content: string;
  breakdown?: {
    simpleExplanation: string;
    technicalDefinition: string;
    example: string;
    realWorldAnalogy: string;
    examPoint: string;
  };
  mode?: 'structured' | 'socratic' | 'concise' | 'code';
  suggestedFollowUps?: string[];
  subjectTag?: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export interface StudyPlannerSlot {
  start: string;
  end: string;
  subject: string;
  activity: string;
}

export interface StudyPlannerDay {
  date: string;
  day: string;
  slots: StudyPlannerSlot[];
}

export interface StudyPlannerData {
  schedule: StudyPlannerDay[];
  strategyTips: string[];
}

export interface OCRSummaryData {
  shortSummary: string;
  keyPoints: string[];
  importantDefinitions: { term: string; definition: string }[];
  importantFormulas: string[];
  examPoints: string[];
  quickRevision: string;
}
