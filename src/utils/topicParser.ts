/**
 * Academic Unit & Multi-Topic Parser
 * Parses single topics, multiple topics, unit headers, chapter outlines,
 * syllabus lists, and inline numbered sequences into structured academic modules.
 */

export type AcademicInputMode = 'SINGLE_TOPIC' | 'MULTIPLE_TOPICS' | 'UNIT' | 'CHAPTER' | 'SYLLABUS' | 'SOURCE_BACKED';

export type AcademicIntent =
  | 'EXPLAIN'
  | 'COMPARE'
  | 'DIFFERENCE'
  | 'DEFINE'
  | 'TEACH'
  | 'SUMMARIZE'
  | 'STEPS'
  | 'WORKING'
  | 'HOW_IT_WORKS'
  | 'ADVANTAGES_DISADVANTAGES'
  | 'EXAMPLES'
  | 'FORMULA'
  | 'DERIVATION'
  | 'ALGORITHM'
  | 'CODE'
  | 'UNIT_NOTES';

export interface RequestAnalysis {
  intents: AcademicIntent[];
  topics: string[];
  cleanAcademicTitle: string;
  subject: string;
  unit?: string;
  comparisonRequested: boolean;
  comparisonSubjects?: string[];
}

export interface ParsedAcademicUnit {
  mode: AcademicInputMode;
  unitTitle: string;
  unitNumber?: string;
  subject: string;
  topics: string[];
  rawCleanInput: string;
  isMultiTopic: boolean;
  requestAnalysis: RequestAnalysis;
}

export function parseAcademicTopics(input: string, fallbackSubject: string = '', hasSourceMaterial: boolean = false): ParsedAcademicUnit {
  if (!input || !input.trim()) {
    const activeSubject = fallbackSubject?.trim() || 'Computer Science';
    const emptyAnalysis: RequestAnalysis = {
      intents: ['EXPLAIN'],
      topics: [activeSubject],
      cleanAcademicTitle: activeSubject.toUpperCase(),
      subject: activeSubject,
      comparisonRequested: false
    };
    return {
      mode: hasSourceMaterial ? 'SOURCE_BACKED' : 'SINGLE_TOPIC',
      unitTitle: emptyAnalysis.cleanAcademicTitle,
      subject: activeSubject,
      topics: [],
      rawCleanInput: '',
      isMultiTopic: false,
      requestAnalysis: emptyAnalysis
    };
  }

  const cleanInput = input.trim();
  let remainingText = cleanInput;
  let unitTitle = '';
  let unitNumber = '';
  let detectedSubject = fallbackSubject?.trim() || '';
  let detectedMode: AcademicInputMode = 'SINGLE_TOPIC';

  // 1. Check for Unit / Chapter / Module Header Prefix (e.g. "UNIT 1 — OPERATING SYSTEM", "Chapter 3: Thermodynamics", "Module 4 - DBMS")
  const unitHeaderMatch = cleanInput.match(
    /^(?:UNIT|CHAPTER|MODULE|SECTION|PART|SYLLABUS)\s*([0-9IVXLCDM]+)?\s*[:—–-]?\s*([A-Za-z0-9\s,&/()\-]+?)(?=\s+(?:\d+[.)]|\([0-9a-zA-Z]+\)|[A-Za-z][.)]|\n|[-*•]))/i
  );

  if (unitHeaderMatch) {
    unitNumber = unitHeaderMatch[1] ? unitHeaderMatch[1].trim() : '';
    const unitName = unitHeaderMatch[2].trim();
    if (!detectedSubject && unitName) {
      detectedSubject = formatTopicName(unitName);
    }
    const unitPrefix = unitNumber ? `UNIT ${unitNumber}: ` : '';
    unitTitle = `${unitPrefix}${unitName}`.trim().toUpperCase();
    remainingText = cleanInput.slice(unitHeaderMatch[0].length).trim();
    detectedMode = 'UNIT';
  }

  const rawTopics: string[] = [];

  // 2. Multi-line processing (lines separated by newlines)
  const lines = remainingText.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);

  if (lines.length > 1) {
    for (const line of lines) {
      // Check if line is a standalone unit header
      const lineHeaderMatch = line.match(/^(?:UNIT|CHAPTER|MODULE|SECTION)\s*([0-9IVXLCDM]+)?\s*[:—–-]?\s*(.+)$/i);
      if (lineHeaderMatch && !unitTitle) {
        unitNumber = lineHeaderMatch[1] ? lineHeaderMatch[1].trim() : '';
        const name = lineHeaderMatch[2].trim();
        if (!detectedSubject && name) {
          detectedSubject = formatTopicName(name);
        }
        const num = unitNumber ? `UNIT ${unitNumber}: ` : '';
        unitTitle = `${num}${name}`.toUpperCase();
        detectedMode = 'UNIT';
        continue;
      }

      const stripped = line.replace(/^[-*•\d.)\]\s]+/, '').trim();
      if (stripped.length > 1) {
        rawTopics.push(stripped);
      }
    }
  } else {
    // Single line processing
    // 2a. Parenthesized subtopic extraction (e.g. "Process Scheduling & Deadlocks (FCFS, Round Robin, Banker's Algorithm)")
    const parenMatches = [...remainingText.matchAll(/\(([^)]+)\)/g)];
    if (parenMatches.length > 0) {
      // Extract subtopics from inside parentheses
      const subtopics: string[] = [];
      for (const m of parenMatches) {
        const inner = m[1].trim();
        const innerParts = inner.split(/[,;•|]+/).map((p) => p.trim()).filter(Boolean);
        innerParts.forEach((ip) => {
          const cleanIP = ip.replace(/^[-*•\d.)\]\s]+/, '').trim();
          if (cleanIP.length > 1) {
            subtopics.push(cleanIP);
          }
        });
      }

      // Extract main topics from outside parentheses
      const outerText = remainingText.replace(/\(([^)]+)\)/g, ' , ').trim();
      const outerParts = outerText.split(/\s*(?:&|\band\b|[,;•|])\s*/i).map((p) => p.trim()).filter(Boolean);
      outerParts.forEach((op) => {
        const cleanOP = op.replace(/^[-*•\d.)\]\s]+/, '').trim();
        if (cleanOP.length > 1) {
          rawTopics.push(cleanOP);
        }
      });

      // Append all subtopics
      rawTopics.push(...subtopics);

      if (rawTopics.length > 1) {
        detectedMode = 'MULTIPLE_TOPICS';
      }
    } else {
      const inlineNumbered = remainingText.split(/(?:\s+|^)(?:\d+[\.\)]|\([0-9a-zA-Z]+\)|[A-Za-z][\.\)])\s+/);

      if (inlineNumbered.length > 2 || (inlineNumbered.length === 2 && inlineNumbered[0].length < inlineNumbered[1].length)) {
        inlineNumbered.forEach((part, idx) => {
          const trimmed = part.trim();
          if (!trimmed) return;

          if (idx === 0 && !unitTitle && trimmed.length > 2 && trimmed.length < 80) {
            unitTitle = trimmed.replace(/[:—–-]+$/, '').trim().toUpperCase();
            detectedMode = 'UNIT';
          } else if (trimmed.length > 1) {
            rawTopics.push(trimmed);
          }
        });
      } else if (remainingText.includes(',') || remainingText.includes(';') || remainingText.includes('•') || remainingText.includes('|') || /\s+and\s+/i.test(remainingText) || /\s*&\s*/.test(remainingText)) {
        const parts = remainingText.split(/\s*(?:&|\band\b|[,;•|])\s*/i).map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          parts.forEach((p) => {
            const cleanP = p.replace(/^[-*•\d.)\]\s]+/, '').trim();
            if (cleanP.length > 1) {
              rawTopics.push(cleanP);
            }
          });
          detectedMode = 'MULTIPLE_TOPICS';
        }
      }
    }
  }

  // Deduplicate identical sequential topics while preserving order
  let uniqueTopics = rawTopics.filter((t, idx, arr) => t.length > 0 && arr.indexOf(t) === idx);

  // 3. Smart Natural Language Parsing if no structured topics were extracted
  let parsedNL: { topics: string[]; unitTitle?: string; mode: AcademicInputMode } | null = null;
  if (uniqueTopics.length === 0) {
    parsedNL = parseNaturalLanguageQuery(cleanInput);
    uniqueTopics = parsedNL.topics;
    if (parsedNL.unitTitle && !unitTitle) {
      unitTitle = parsedNL.unitTitle;
    }
    detectedMode = parsedNL.mode;
  }

  // Deduce subject
  if (!detectedSubject || detectedSubject === 'Computer Science' || (uniqueTopics.length > 0 && detectedSubject === uniqueTopics[0])) {
    detectedSubject = inferAcademicSubject(cleanInput, fallbackSubject);
  }
  if (!detectedSubject) {
    detectedSubject = 'Computer Science';
  }

  // Multi-Topic / Unit Mode Determination
  if (detectedMode !== 'UNIT') {
    detectedMode = uniqueTopics.length > 1 ? 'MULTIPLE_TOPICS' : 'SINGLE_TOPIC';
  }

  // Perform Intent Analysis & Clean Academic Title Generation
  const requestAnalysis = analyzeUserRequest(cleanInput, uniqueTopics, unitTitle, detectedSubject, unitNumber);

  const finalTitle = requestAnalysis.cleanAcademicTitle;

  return {
    mode: detectedMode,
    unitTitle: finalTitle,
    unitNumber,
    subject: detectedSubject,
    topics: uniqueTopics,
    rawCleanInput: cleanInput,
    isMultiTopic: uniqueTopics.length > 1,
    requestAnalysis
  };
}

/**
 * Intelligent Intent Classification Engine
 */
function analyzeUserRequest(
  input: string,
  extractedTopics: string[],
  fallbackTitle?: string,
  detectedSubject?: string,
  unitNumber?: string
): RequestAnalysis {
  const lower = input.toLowerCase().trim();
  const intents: AcademicIntent[] = [];

  // Detect Intents
  if (/\b(?:explain|describe|discuss|teach\s+me|overview|tell\s+me\s+about|notes\s+on)\b/i.test(lower)) {
    intents.push('EXPLAIN');
  }
  if (/\b(?:compare|comparison|versus|\bvs\b|compared\s+to|compared\s+with)\b/i.test(lower)) {
    intents.push('COMPARE');
  }
  if (/\b(?:difference|differences|diff\s+between)\b/i.test(lower)) {
    intents.push('DIFFERENCE');
  }
  if (/\b(?:what\s+is|what\s+are|define|definition|meaning\s+of)\b/i.test(lower)) {
    intents.push('DEFINE');
  }
  if (/\b(?:how\s+does|how\s+do|working\s+of|how\s+it\s+works|execution\s+flow)\b/i.test(lower)) {
    intents.push('HOW_IT_WORKS');
    intents.push('WORKING');
  }
  if (/\b(?:advantage|advantages|disadvantage|disadvantages|pros\s+and\s+cons|benefits|drawbacks)\b/i.test(lower)) {
    intents.push('ADVANTAGES_DISADVANTAGES');
  }
  if (/\b(?:example|examples|sample|case\s+study)\b/i.test(lower)) {
    intents.push('EXAMPLES');
  }
  if (/\b(?:algorithm|pseudocode|dry\s+run|steps\s+to|procedure)\b/i.test(lower)) {
    intents.push('ALGORITHM');
    intents.push('STEPS');
  }
  if (/\b(?:code|syntax|program|implementation|snippet)\b/i.test(lower)) {
    intents.push('CODE');
  }
  if (/\b(?:formula|derivation|equation|theorem|proof)\b/i.test(lower)) {
    intents.push('FORMULA');
  }

  // Default fallback intent if none matched
  if (intents.length === 0) {
    if (extractedTopics.length > 1) {
      intents.push('EXPLAIN');
    } else {
      intents.push('EXPLAIN');
      intents.push('DEFINE');
    }
  }

  const comparisonRequested = intents.includes('COMPARE') || intents.includes('DIFFERENCE');

  // Clean Academic Title Formulation (NEVER use conversational sentence as title)
  let cleanAcademicTitle = '';

  if (fallbackTitle && /^(?:UNIT|CHAPTER|MODULE|SECTION)\s+[0-9IVXLCDM]+/i.test(fallbackTitle)) {
    cleanAcademicTitle = fallbackTitle.toUpperCase();
  } else if (input.includes('(') && input.includes(')')) {
    cleanAcademicTitle = input.trim().replace(/^[-*•\s]+/, '').toUpperCase();
  } else if (comparisonRequested && extractedTopics.length >= 2) {
    const mainTwo = extractedTopics.slice(0, 2);
    if (intents.includes('EXPLAIN')) {
      cleanAcademicTitle = `${mainTwo.join(' AND ').toUpperCase()} — EXPLANATION AND COMPARISON`;
    } else {
      cleanAcademicTitle = `${mainTwo.join(' VS ').toUpperCase()}`;
    }
  } else if (extractedTopics.length > 1) {
    cleanAcademicTitle = `${extractedTopics.slice(0, 3).join(' AND ').toUpperCase()}`;
  } else if (extractedTopics.length === 1) {
    const single = extractedTopics[0].toUpperCase();
    if (intents.includes('HOW_IT_WORKS')) {
      cleanAcademicTitle = `${single} — WORKING`;
    } else if (intents.includes('ALGORITHM')) {
      cleanAcademicTitle = `${single} ALGORITHM`;
    } else if (intents.includes('ADVANTAGES_DISADVANTAGES')) {
      cleanAcademicTitle = `${single} — PROS & CONS`;
    } else {
      cleanAcademicTitle = single;
    }
  } else {
    cleanAcademicTitle = 'STUDY MODULE';
  }

  const subjectName = detectedSubject || 'Computer Science';

  return {
    intents,
    topics: extractedTopics.length > 0 ? extractedTopics : [subjectName],
    cleanAcademicTitle,
    subject: subjectName,
    unit: unitNumber ? `Unit ${unitNumber}` : undefined,
    comparisonRequested,
    comparisonSubjects: comparisonRequested ? extractedTopics : undefined
  };
}

/**
 * Intelligent Natural Language Query Extractor
 * Converts prompts like "explain java and python and also difference between them"
 * into clean topics: ["Java", "Python", "Key Differences Between Java and Python"]
 */
function parseNaturalLanguageQuery(input: string): { topics: string[]; unitTitle?: string; mode: AcademicInputMode } {
  let text = input.trim();

  // Strip common conversational preambles
  text = text.replace(
    /^(?:explain|describe|discuss|teach\s+me|write\s+notes\s+on|give\s+notes\s+on|notes\s+(?:on|for)|overview\s+of|what\s+is|what\s+are|introduction\s+to|details\s+about|guide\s+on|summary\s+of|tell\s+me\s+about|provide\s+notes\s+for|a\s+detailed\s+guide\s+on)\s+/i,
    ''
  ).trim();

  // Handle explicit comparison / difference queries
  // e.g., "java and python and also difference between them", "difference between java and python"
  const diffSuffixMatch = text.match(/^(.*?)\s+(?:and\s+also\s+|and\s+)?(?:difference|differences|compare|comparison)\s+(?:between\s+them|among\s+them|between\s+each\s+other)?$/i);
  const diffPrefixMatch = text.match(/^(?:difference|differences|compare|comparison)\s+(?:between|of|among)?\s+(.*)$/i);

  let subjectsStr = text;
  let wantsComparison = false;

  if (diffSuffixMatch) {
    subjectsStr = diffSuffixMatch[1];
    wantsComparison = true;
  } else if (diffPrefixMatch) {
    subjectsStr = diffPrefixMatch[1];
    wantsComparison = true;
  } else if (/\b(?:vs\.?|versus|compared\s+to|compared\s+with)\b/i.test(text)) {
    wantsComparison = true;
  }

  // Split subjects by "and", "vs", "versus", "as well as", commas
  const rawParts = subjectsStr
    .split(/\b(?:and\s+also|and|vs\.?|versus|as\s+well\s+as|compared\s+to)\b|[,;]/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^(between|them|each\s+other|also|difference|differences|compare)$/i.test(p));

  const cleanedTopics: string[] = [];

  rawParts.forEach((part) => {
    const formatted = formatTopicName(part);
    if (formatted && !cleanedTopics.includes(formatted)) {
      cleanedTopics.push(formatted);
    }
  });

  if (cleanedTopics.length >= 2 && wantsComparison) {
    const comparisonTopic = `Key Differences & Comparison: ${cleanedTopics.slice(0, 3).join(' vs ')}`;
    if (!cleanedTopics.includes(comparisonTopic)) {
      cleanedTopics.push(comparisonTopic);
    }

    const title = `${cleanedTopics.slice(0, 2).join(' & ')} — Core Concepts & Comparative Study`;
    return {
      topics: cleanedTopics,
      unitTitle: title,
      mode: 'MULTIPLE_TOPICS'
    };
  }

  if (cleanedTopics.length > 1) {
    return {
      topics: cleanedTopics,
      unitTitle: `${cleanedTopics.slice(0, 2).join(' & ')} ${cleanedTopics.length > 2 ? 'Module' : 'Guide'}`,
      mode: 'MULTIPLE_TOPICS'
    };
  }

  // Single topic fallback
  const singleFormatted = formatTopicName(text);
  return {
    topics: [singleFormatted],
    unitTitle: singleFormatted,
    mode: 'SINGLE_TOPIC'
  };
}

/**
 * Format and capitalize topic names cleanly
 */
function formatTopicName(name: string): string {
  let clean = name.replace(/^[-*•\d.)\]\s]+/, '').replace(/[:—–-]+$/, '').trim();
  if (!clean) return 'General Concept';

  const lower = clean.toLowerCase();

  // Known acronyms and proper names
  const knownMap: Record<string, string> = {
    java: 'Java',
    python: 'Python',
    'c++': 'C++',
    cpp: 'C++',
    csharp: 'C#',
    'c#': 'C#',
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    html: 'HTML & Web Standards',
    css: 'CSS & Layout Engines',
    sql: 'SQL & Relational Databases',
    dbms: 'Database Management Systems (DBMS)',
    os: 'Operating Systems',
    cn: 'Computer Networks',
    dsa: 'Data Structures & Algorithms',
    oop: 'Object-Oriented Programming (OOP)',
    ai: 'Artificial Intelligence (AI)',
    ml: 'Machine Learning (ML)',
    dl: 'Deep Learning (DL)',
    nlp: 'Natural Language Processing (NLP)',
    aws: 'Amazon Web Services (AWS)',
    gcp: 'Google Cloud Platform (GCP)'
  };

  if (knownMap[lower]) {
    return knownMap[lower];
  }

  // Capitalize title words nicely
  return clean
    .split(/\s+/)
    .map((word) => {
      const wLower = word.toLowerCase();
      if (['and', 'or', 'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by'].includes(wLower)) {
        return wLower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function inferAcademicSubject(text: string, fallbackSubject?: string): string {
  if (fallbackSubject && fallbackSubject.trim() && fallbackSubject !== 'Computer Science') {
    return fallbackSubject.trim();
  }
  const t = (text || '').toLowerCase();
  if (/os|operating system|process|thread|deadlock|paging|semaphore|cpu scheduling|scheduling|fcfs|round robin|banker|sjf|priority scheduling|concurrency|mutex/i.test(t)) return 'Operating Systems';
  if (/network|tcp|udp|ip|dns|http|router|osi|subnet|socket/i.test(t)) return 'Computer Networks';
  if (/dbms|database|sql|nosql|acid|relation|normalization|b-tree|index/i.test(t)) return 'Database Systems';
  if (/cell|dna|rna|protein|photosynthesis|respiration|organism|gene|mitochondria/i.test(t)) return 'Biology';
  if (/atom|molecule|reaction|thermodynamics|acid|base|organic|kinetic/i.test(t)) return 'Chemistry';
  if (/force|velocity|quantum|relativity|circuit|magnetism|optics|newton/i.test(t)) return 'Physics';
  if (/derivative|integral|matrix|vector|calculus|algebra|probability|statistics/i.test(t)) return 'Mathematics';
  if (/inflation|gdp|monetary|fiscal|market|elasticity|demand|supply|macroeconomic/i.test(t)) return 'Economics';
  if (/history|war|revolution|treaty|civilization|empire|colonial/i.test(t)) return 'History';
  return fallbackSubject?.trim() || 'Computer Science';
}

