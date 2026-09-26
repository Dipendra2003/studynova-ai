/**
 * Academic Curriculum & Topic Structuring Engine
 * Provides authentic, content-grounded syllabus organization,
 * intent analysis, and structured fallback frameworks with ZERO mock or dummy data.
 */

import { NotesData } from '../types';
import { parseAcademicTopics } from './topicParser';

export function inferSubjectFromTopic(topicName: string, fallbackSubject?: string): string {
  if (fallbackSubject && fallbackSubject.trim() && fallbackSubject !== 'Computer Science') {
    return fallbackSubject.trim();
  }
  const t = topicName.toLowerCase();
  if (/os|operating system|process|thread|deadlock|paging|semaphore|cpu scheduling|scheduling|fcfs|round robin|banker|sjf|priority scheduling|concurrency|mutex/i.test(t)) return 'Operating Systems';
  if (/network|tcp|udp|ip|dns|http|router|osi|subnet/i.test(t)) return 'Computer Networks';
  if (/dbms|database|sql|nosql|acid|relation|normalization|b-tree/i.test(t)) return 'Database Systems';
  if (/cell|dna|rna|protein|photosynthesis|respiration|organism|gene/i.test(t)) return 'Biology';
  if (/atom|molecule|reaction|thermodynamics|acid|base|organic/i.test(t)) return 'Chemistry';
  if (/force|velocity|quantum|relativity|circuit|magnetism|optics/i.test(t)) return 'Physics';
  if (/derivative|integral|matrix|vector|calculus|algebra|probability/i.test(t)) return 'Mathematics';
  if (/inflation|gdp|monetary|fiscal|market|elasticity|demand|supply/i.test(t)) return 'Economics';
  if (/history|war|revolution|treaty|civilization|empire/i.test(t)) return 'History';
  return fallbackSubject?.trim() || 'General Academic';
}

/**
 * Validates notes structure without injecting generic boilerplate.
 */
export function validateAndEnsureAllTopics(parsed: NotesData, _userTopics: string[], _subjectName: string): NotesData {
  if (!parsed || !Array.isArray(parsed.mainConcepts)) {
    return parsed;
  }
  // Ensure every concept has valid points
  parsed.mainConcepts = parsed.mainConcepts.filter((c) => c && c.concept && Array.isArray(c.points) && c.points.length > 0);
  return parsed;
}
