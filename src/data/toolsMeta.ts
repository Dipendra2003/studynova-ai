import { ToolMeta } from '../types';

export const TOOLS_LIST: ToolMeta[] = [
  {
    id: 'resume-builder',
    number: '01',
    name: 'AI Resume Builder',
    route: '/resume-builder',
    description: 'Create professional, ATS-friendly resumes from basic student information with live preview and PDF export.',
    tags: ['Resume', 'Career', 'ATS-Friendly', 'PDF Export'],
    iconName: 'FileText',
    category: 'Career & Applications',
    timeEstimate: '5–10 min',
    badge: 'Popular'
  },
  {
    id: 'notes-generator',
    number: '02',
    name: 'AI Notes Generator',
    route: '/notes-generator',
    description: 'Convert raw text, chapter summaries, or textbook paragraphs into structured revision notes with headings and terms.',
    tags: ['Summarization', 'Study Notes', 'Markdown', 'Quick Revision'],
    iconName: 'BookOpen',
    category: 'Study & Research',
    timeEstimate: '2–5 min'
  },
  {
    id: 'presentation-generator',
    number: '03',
    name: 'AI Presentation Generator',
    route: '/presentation-generator',
    description: 'Generate slide-by-slide presentation content with titles, bullet points, and speaker notes from any academic topic.',
    tags: ['Slides', 'Presentations', 'Deck Player', 'Speaker Notes'],
    iconName: 'Presentation',
    category: 'Productivity & Decks',
    timeEstimate: '3–5 min'
  },
  {
    id: 'mind-map-generator',
    number: '04',
    name: 'AI Mind Map Generator',
    route: '/mind-map-generator',
    description: 'Convert syllabus and complex topics into visual, hierarchical, and expandable interactive mind maps.',
    tags: ['Visual Learning', 'Mind Maps', 'Syllabus', 'SVG Hierarchy'],
    iconName: 'Network',
    category: 'Visual & Outlines',
    timeEstimate: '3–5 min',
    badge: 'Interactive'
  },
  {
    id: 'google-sheets',
    number: '05',
    name: 'Google Sheets Backend',
    route: '/google-sheets',
    description: 'Connect your frontend to Google Sheets as a live lightweight database, edit rows, and generate AI insights.',
    tags: ['Google Sheets', 'No-Cost DB', 'Live Sync', 'Data Analysis'],
    iconName: 'Table',
    category: 'Databases & APIs',
    timeEstimate: '5–10 min'
  },
  {
    id: 'quiz-generator',
    number: '06',
    name: 'AI Quiz / MCQ Generator',
    route: '/quiz-generator',
    description: 'Generate interactive multiple-choice quizzes from topics or notes with instant feedback and score tracking.',
    tags: ['Assessment', 'MCQ', 'Instant Feedback', 'Test Prep'],
    iconName: 'HelpCircle',
    category: 'Testing & Self-Assessment',
    timeEstimate: '3–5 min',
    badge: 'Active Recall'
  },
  {
    id: 'doubt-solver',
    number: '07',
    name: 'AI Doubt-Solving Chatbot',
    route: '/doubt-solver',
    description: 'Ask subject-related questions and receive multi-tier AI tutor explanations, real-world analogies, and exam tips.',
    tags: ['Tutor Chat', 'Subject Doubts', 'Analogies', 'Exam Tips'],
    iconName: 'MessageSquare',
    category: 'Tutoring & Doubts',
    timeEstimate: 'Instant'
  },
  {
    id: 'flashcard-generator',
    number: '08',
    name: 'AI Flashcard Generator',
    route: '/flashcard-generator',
    description: 'Generate interactive 3D flippable revision cards from study material for high-retention active recall.',
    tags: ['Flashcards', '3D Flip', 'Active Recall', 'Spaced Repetition'],
    iconName: 'Layers',
    category: 'Revision & Memory',
    timeEstimate: '3–5 min'
  },
  {
    id: 'study-planner',
    number: '09',
    name: 'AI Study Planner',
    route: '/study-planner',
    description: 'Generate personalized day-wise study timetables and balanced weekly matrices tailored to your exam dates.',
    tags: ['Study Schedule', 'Timetable', 'Time Management', 'Exam Prep'],
    iconName: 'Calendar',
    category: 'Planning & Routine',
    timeEstimate: '5 min'
  },
  {
    id: 'ocr-summarizer',
    number: '10',
    name: 'AI OCR Notes Summarizer',
    route: '/ocr-summarizer',
    description: 'Upload photos of handwritten or printed notes, verify extracted text, and generate condensed study summaries.',
    tags: ['OCR Scanner', 'Photo Notes', 'Text Extraction', 'Multimodal'],
    iconName: 'Camera',
    category: 'Vision & Documents',
    timeEstimate: '3–5 min',
    badge: 'Multimodal'
  }
];
