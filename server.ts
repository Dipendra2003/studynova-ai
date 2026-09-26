import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseAcademicTopics } from './src/utils/topicParser.js';
import { validateAndEnsureAllTopics } from './src/utils/academicKnowledge.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check if AI is configured
const hasApiKey = Boolean(apiKey && apiKey.trim().length > 5);

// Model Fallback Chain for Rate Limits / Quotas
const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

async function generateWithModelFallback(params: {
  contents: any;
  config: any;
  timeoutMs?: number;
}): Promise<any> {
  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const timeoutMs = params.timeoutMs || 45000;
      const generatePromise = ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`AI generation request timed out for model ${model}`)), timeoutMs)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} failed (Quota / RateLimit / Timeout):`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini AI model attempts failed.');
}

// ==========================================
// 1. NOTES GENERATOR ENDPOINT
// ==========================================
app.post('/api/generate-notes', async (req: Request, res: Response) => {
  const { topic, subject, rawContent, length, difficulty, language } = req.body;

  if (!topic?.trim() && !rawContent?.trim()) {
    res.status(400).json({ error: 'Please provide either a Topic or Raw Study Material.' });
    return;
  }

  const isTopicOnly = !rawContent || rawContent.trim().length === 0;
  const parsedUnit = parseAcademicTopics(topic || '', subject || '', !isTopicOnly);
  const reqAnalysis = parsedUnit.requestAnalysis;
  const activeSubject = reqAnalysis.subject || subject || 'Computer Science';

  if (hasApiKey) {
    try {
      const lengthPrompt =
        length === 'concise'
          ? 'Keep the notes succinct, high-density, and focused on essential formulas, core definitions, and primary principles without omitting any requested topic.'
          : length === 'comprehensive'
          ? 'Provide thorough, exhaustive, teaching-quality explanations with multiple subtopics (e.g. 1.1, 1.2), mechanisms, concrete examples, edge cases, formulas, comparisons, pseudocode/code if applicable, and in-depth coverage for every requested topic.'
          : 'Provide balanced, high-yield, classroom and exam-preparation study notes covering every requested topic thoroughly.';

      const topicsListFormatted = reqAnalysis.topics.length > 0
        ? reqAnalysis.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')
        : (topic || 'General Topic');

      const systemInstruction = `You are an expert academic professor and curriculum designer across STEM, Computer Science, Mathematics, Humanities, Business, and Health Sciences.
User Request Analysis:
- Clean Academic Document Title: "${reqAnalysis.cleanAcademicTitle}"
- Subject / Field: "${activeSubject}"
- Unit Header: "${parsedUnit.unitTitle || ''}"
- User Intents Identified: [${reqAnalysis.intents.join(', ')}]
- Clean Topics Extracted (${reqAnalysis.topics.length} total): [${reqAnalysis.topics.join(', ')}]
- Comparison Requested: ${reqAnalysis.comparisonRequested}
- Difficulty Level: ${difficulty || 'intermediate'}
- Length Setting: ${length || 'balanced'}
- Target Language: ${language || 'English'}

CRITICAL GENERATION RULES:
1. NEVER USE THE USER'S CONVERSATIONAL SENTENCE AS THE TITLE. Always use the clean academic title "${reqAnalysis.cleanAcademicTitle}".
2. STRICT TOPIC ADHERENCE - ZERO UNWANTED CONTENT:
   Answer ONLY and EXACTLY what is requested. DO NOT hallucinate or attach unrequested background history, generic introductory fluff, or unrelated chapters. Keep every sentence laser-focused on the requested concepts.
3. AUTOMATIC BOLD KEYWORDS (HIGH RETENTION):
   Enclose EVERY important technical keyword, core term, law name, algorithm name, equation, and critical concept in double asterisks (e.g. **keyword**, **TCP Handshake**, **Convoy Effect**, **Safe Sequence**) so it automatically renders bold in student notes.
4. EXHAUSTIVE, UNCOMPROMISING TOPIC COVERAGE:
   The user provided ${reqAnalysis.topics.length} distinct topic(s):
${reqAnalysis.topics.map((t, i) => `   ${i + 1}. ${t}`).join('\n')}
   You MUST generate a dedicated, separate concept entry in "mainConcepts" for EVERY single topic listed above. DO NOT merge, silently skip, omit, or replace any topic.
5. IN-DEPTH MULTI-FACETED BREAKDOWN FOR EACH CONCEPT & ALGORITHM:
   For every concept/algorithm in "mainConcepts" (e.g. Process Scheduling, Deadlocks, FCFS, Round Robin, Banker's Algorithm), provide 4-7 thorough bullet points covering:
   - **Precise Formal Academic Definition & Core Objective**
   - **Complete Step-by-Step Working Mechanism / Execution Flow**
   - **Key Formulas, Mathematical Equations & Invariants**
   - **Concrete Practical Example or Walkthrough**
   - **Advantages, Disadvantages & Critical Trade-offs**
   - **Real-world Operating System / Production System Use Cases**
6. REAL SUBJECT-SPECIFIC CONTENT ONLY (ZERO GENERIC BOILERPLATE):
   - Generate actual, high-density academic notes specific to "${activeSubject}".
   - NEVER output generic placeholder filler sentences.
7. INTENT-AWARE CONTENT STRUCTURE:
   - "Explain X" -> Complete conceptual explanation with real mechanisms and examples.
   - "What is X?" -> Precise formal definition, core characteristics, and applications.
   - "Difference between X and Y" / "Compare X and Y" -> Provide individual explanations AND a structured Markdown comparison table (| Basis | X | Y |) with factual dimensions.
   - "How does X work?" -> Step-by-step operational mechanism and execution flow.
   - "X with algorithm and dry run" -> Step-by-step algorithm, pseudocode block, and dry run trace.
8. EXAM POINTS & TERMINOLOGY:
   - "importantTerms": Comprehensive list (8-14 terms) covering every key technical term, metric, and definition.
   - "examPoints": 5-8 high-yield exam predictions, scoring guidelines, calculation traps, and tricky test questions.
   - "keyPoints": 5-8 high-yield fundamental takeaways.
   - "examples": Real-world practical applications, numerical calculations, and code/math walkthroughs for each topic.
   - "quickRevision": 3-4 sentence high-density cram summary synthesizing all algorithms and core principles for rapid 60-second review.`;

      const prompt = `ACADEMIC SPECIFICATION & INTENT SUMMARY:
Document Title: ${reqAnalysis.cleanAcademicTitle}
Subject: ${activeSubject}
Intents: ${reqAnalysis.intents.join(', ')}
Topics to cover (${reqAnalysis.topics.length} total): ${reqAnalysis.topics.join(', ')}
Comparison Requested: ${reqAnalysis.comparisonRequested}
Language: ${language || 'English'}
Difficulty: ${difficulty || 'intermediate'}
Length: ${length || 'balanced'}

ALL TOPICS / OPERATIONS TO SATISFY (EACH MUST HAVE A THOROUGH, DEDICATED ENTRY IN mainConcepts):
${topicsListFormatted}
${!isTopicOnly ? `\nRAW SOURCE STUDY MATERIAL / TEXTBOOK CONTENT:\n${rawContent}\n` : ''}

Generate an exhaustive, structured academic study guide JSON covering all definitions, operational mechanisms, mathematical criteria, numerical examples, and trade-offs adhering strictly to the schema.`;

      const response = await generateWithModelFallback({
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.35,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              overview: { type: Type.STRING },
              mainConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING },
                    points: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ['concept', 'points']
                }
              },
              importantTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ['term', 'definition']
                }
              },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              examples: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              examPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              quickRevision: { type: Type.STRING }
            },
            required: [
              'title',
              'overview',
              'mainConcepts',
              'importantTerms',
              'keyPoints',
              'examples',
              'examPoints',
              'quickRevision'
            ]
          }
        }
      });

      const text = response.text;
      if (text) {
        let parsed = JSON.parse(text);
        parsed.isFallback = false;
        res.json(parsed);
        return;
      }
    } catch (error: any) {
      console.error('Gemini API call failed for notes:', error?.message || error);
      res.status(500).json({
        error: `AI Generation Error: ${error?.message || 'Failed to generate study notes with Gemini AI.'}`
      });
      return;
    }
  } else {
    res.status(401).json({
      error: 'GEMINI_API_KEY is not configured or is invalid. Please configure a valid API key in .env.'
    });
    return;
  }
});

// ==========================================
// 2. RESUME GENERATOR ENDPOINT
// ==========================================
app.post('/api/generate-resume', async (req: Request, res: Response) => {
  const formData = req.body;
  if (!formData?.fullName?.trim()) {
    res.status(400).json({ error: 'Full Name is required.' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const systemInstruction = `You are an elite academic and professional career consultant specializing in ATS-optimized resumes for students and graduates.
CRITICAL INTEGRITY RULES:
1. Grounding: Rely strictly on information supplied in the candidate details.
2. Anti-Fabrication: NEVER invent employers, job titles, university names, degrees, certifications, achievements, dates, or GPAs.
3. No Fake Metrics: Quantify accomplishments ONLY when numbers, percentages, or metrics were provided in the input. Never invent arbitrary percentages.
4. Empty Sections: If a section has no provided data, return an empty array [].
5. Tone: Action-verb driven, concise, free of fluff/buzzwords, and formatted for Applicant Tracking Systems (ATS).`;

    const prompt = `CANDIDATE DETAILS (INPUT FORM DATA):
${JSON.stringify(formData, null, 2)}

Please generate the structured resume JSON adhering strictly to the schema.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  period: { type: Type.STRING },
                  grade: { type: Type.STRING }
                },
                required: ['degree', 'school', 'period']
              }
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['category', 'items']
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  organization: { type: Type.STRING },
                  period: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['role', 'organization', 'period', 'bullets']
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'description', 'technologies']
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            achievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['summary', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.isFallback = false;
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for resume:', error?.message || error);
    res.status(500).json({ error: `AI Resume Generation Error: ${error?.message || 'Failed to generate resume with Gemini.'}` });
  }
});

// ==========================================
// 3. DOUBT SOLVER CHATBOT ENDPOINT (REAL GEMINI AI)
// ==========================================
app.post('/api/solve-doubt', async (req: Request, res: Response) => {
  const { question, history = [] } = req.body;
  if (!question?.trim()) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid in .env' });
    return;
  }

  try {
    const trimmedQ = question.trim().toLowerCase();
    const GREETING_REGEX = /^(hi+|hello+|hey+|hola|namaste|hlo|helo|yo|sup|howdy|greetings|help|who\s*are\s*you|what\s*can\s*you\s*(do|teach)|how\s*are\s*you|good\s*(morning|afternoon|evening)|hi\s+(there|sir|ma'?am|tutor|bot|ai|dr|professor)|hello\s+(there|sir|ma'?am|tutor|bot|ai|dr|professor)|hey\s+(there|sir|ma'?am|tutor|bot|ai|dr|professor))[!?.,\s]*$/i;

    if (GREETING_REGEX.test(trimmedQ)) {
      res.json({
        id: `asst-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: `Hello! 👋 I'm your **AI Doubt Solver & Learning Assistant**.

I'm ready to help you with anything you're studying or working on:
- 💡 **Concept Clarification:** Deep, intuitive explanations for tricky concepts
- 💻 **Code & Algorithms:** Python, Java, C++, JavaScript, SQL, debugging, and $O(N)$ complexity
- 📐 **Math & Physics:** Step-by-step problem solutions, formulas, and derivations
- 📝 **Exam & Homework Prep:** High-yield summaries, key takeaways, and practice doubts

What question, topic, or code problem would you like to explore?`,
        suggestedFollowUps: [
          'Explain Recursion in programming with a call-stack dry run',
          'How does Bayes Theorem work with an intuitive real-world example?',
          'Explain Time Complexity and Big-O notation simply'
        ]
      });
      return;
    }

    // Build conversation history for multi-turn context
    const chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history.slice(-10)) {
        if (msg.role && typeof msg.content === 'string' && msg.content.trim()) {
          chatHistory.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content.slice(0, 1000) }]
          });
        }
      }
    }

    // Add the current user question
    chatHistory.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const systemPrompt = `You are an AI Doubt Solver — a helpful, knowledgeable tutor and chatbot.

RULES:
- Answer the student's question naturally and conversationally, exactly like ChatGPT or Google Gemini would.
- DO NOT use any fixed template, rigid structure, or predefined format. Every response should be unique and organic based on what was asked.
- If the question is simple, give a short answer. If it's complex, explain in depth. Match your response length to the question's complexity.
- Use markdown formatting naturally — bold for emphasis, code blocks for code, headers only when the answer is long enough to need them.
- Be friendly, direct, and helpful. No unnecessary fluff or filler.
- Never produce fake, mock, or placeholder content.`;

    // Use plain text response — NO JSON schema forcing
    const response = await generateWithModelFallback({
      contents: chatHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const rawText = response.text || '';

    // Extract the AI's natural response
    let content = rawText.trim();
    if (!content) {
      content = 'Sorry, I could not generate a response. Please try again.';
    }

    // Generate simple follow-ups locally — NO extra API call
    const qLower = question.toLowerCase();
    let suggestedFollowUps: string[] = [];
    if (qLower.includes('code') || qLower.includes('program') || qLower.includes('function')) {
      suggestedFollowUps = ['Can you optimize this code?', 'What is the time complexity?', 'Can you explain how this works step by step?'];
    } else if (qLower.includes('math') || qLower.includes('formula') || qLower.includes('equation') || qLower.includes('calculate')) {
      suggestedFollowUps = ['Can you solve another example?', 'What are the real-world applications?', 'Can you derive this formula?'];
    } else if (qLower.includes('explain') || qLower.includes('what is') || qLower.includes('define')) {
      suggestedFollowUps = ['Can you give a real-world example?', 'How is this different from similar concepts?', 'Why is this important?'];
    } else if (qLower.includes('difference') || qLower.includes('compare') || qLower.includes('vs')) {
      suggestedFollowUps = ['Which one should I use and when?', 'Can you explain each one in more detail?', 'Are there any other alternatives?'];
    } else {
      suggestedFollowUps = ['Can you explain this in more detail?', 'Can you give an example?', 'What are the key takeaways?'];
    }

    res.json({
      id: `asst-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content,
      suggestedFollowUps
    });
  } catch (error: any) {
    console.error('Gemini API call failed for doubt solver:', error?.message || error);
    res.status(500).json({ error: `AI Tutor Error: ${error?.message || 'Failed to solve doubt.'}` });
  }
});

// ==========================================
// 4. QUIZ GENERATOR ENDPOINT
// ==========================================
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  const { topic, notes, count, difficulty } = req.body;
  if (!topic?.trim() && !notes?.trim()) {
    res.status(400).json({ error: 'Topic or notes required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = `You are a high-level academic test creator and pedagogy specialist.
Generate a rigorous, engaging, and strictly focused multiple-choice quiz.

TARGET TOPIC: ${topic || 'General Academic Subject'}
SUPPLEMENTARY NOTES / CONTEXT: ${notes || 'None provided'}
QUESTION COUNT: ${count || 5}
DIFFICULTY LEVEL: ${difficulty || 'Intermediate'}

MANDATORY RULES FOR ACCURACY AND RELEVANCE:
1. STRICT RELEVANCE: Every single question, choice, and explanation MUST be directly relevant to the specified TARGET TOPIC and SUPPLEMENTARY NOTES. Never invent unrelated trivia, switch topics, or ask generic filler questions.
2. 4 DISTINCT OPTIONS: Each question must have exactly 4 plausible, well-formulated options. Only one option can be correct.
3. CORRECT ANSWER INDEX: "correctAnswer" must be a zero-based integer (0, 1, 2, or 3) pointing to the exact correct option in "options" (0 = A, 1 = B, 2 = C, 3 = D).
4. ACCURATE & RELEVANT RATIONALE (EXPLANATION):
   - The explanation MUST explicitly justify why options[correctAnswer] is the true, correct answer for this question.
   - It must directly address the question and avoid contradicting the correctAnswer index.
   - It should briefly clarify why the other options/distractors are incorrect or what misconceptions they represent.
   - Keep the explanation concise, professional, educational, and 100% on-topic.
5. SEQUENTIAL IDS: Assign sequential integers 1, 2, 3, etc. for id.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'explanation']
              }
            }
          },
          required: ['topic', 'questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Normalize and validate every question for perfect index alignment and non-empty rationale
    if (parsed && Array.isArray(parsed.questions)) {
      parsed.questions = parsed.questions.map((q: any, idx: number) => {
        const rawOptions = Array.isArray(q.options) && q.options.length >= 2 
          ? q.options.map((opt: any) => String(opt).trim())
          : ['Option A', 'Option B', 'Option C', 'Option D'];

        let corr = typeof q.correctAnswer === 'number' ? Math.floor(q.correctAnswer) : parseInt(String(q.correctAnswer), 10);
        if (isNaN(corr) || corr < 0 || corr >= rawOptions.length) {
          corr = 0;
        }

        const fallbackExplanation = `The correct answer is "${rawOptions[corr]}" because it directly satisfies the condition stated in the question.`;
        const cleanExplanation = q.explanation?.trim() ? q.explanation.trim() : fallbackExplanation;

        return {
          id: idx + 1,
          question: q.question?.trim() || `Question ${idx + 1}`,
          options: rawOptions,
          correctAnswer: corr,
          explanation: cleanExplanation
        };
      });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for quiz:', error?.message || error);
    res.status(500).json({ error: `AI Quiz Error: ${error?.message || 'Failed to generate quiz questions.'}` });
  }
});

// ==========================================
// 4B. QUIZ TAILORED ANSWER RATIONALE ENDPOINT
// ==========================================
app.post('/api/explain-quiz-answer', async (req: Request, res: Response) => {
  const { question, options, correctAnswer, userChoice, topic } = req.body;
  if (!question || !Array.isArray(options)) {
    res.status(400).json({ error: 'Question and options are required.' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const isUserCorrect = typeof userChoice === 'number' && userChoice === correctAnswer;
    const userOptionText = typeof userChoice === 'number' && options[userChoice] ? options[userChoice] : 'Unanswered';
    const correctOptionText = options[correctAnswer] || 'Correct Option';

    const prompt = `You are a helpful educational tutor reviewing a multiple-choice question.

SUBJECT / TOPIC: ${topic || 'General Knowledge'}
QUESTION: "${question}"
ALL OPTIONS:
${options.map((opt: string, i: number) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

CORRECT ANSWER: ${String.fromCharCode(65 + correctAnswer)}. ${correctOptionText}
STUDENT'S ANSWER: ${typeof userChoice === 'number' ? `${String.fromCharCode(65 + userChoice)}. ${userOptionText}` : 'Left Unanswered'}
STUDENT OUTCOME: ${isUserCorrect ? 'CORRECT' : 'INCORRECT'}

TASK:
Provide a clear, pedagogical, 100% relevant explanation broken into 3 concise parts:
1. WHY THE CORRECT ANSWER IS RIGHT: Explain clearly why "${correctOptionText}" is the exact correct answer.
2. ${isUserCorrect ? 'WHY DISTRACTORS ARE INCORRECT:' : 'MISCONCEPTION / WHY YOUR CHOICE WAS WRONG:'} ${isUserCorrect ? 'Briefly note why other options are false.' : `Explain why choosing "${userOptionText}" is mistaken or what misconception it represents.`}
3. KEY TAKEAWAY: One memorable rule or summary sentence to retain this concept permanently.

Keep tone supportive, clear, academic, and directly tied to the question. Avoid generic filler.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        temperature: 0.3
      }
    });

    res.json({ explanation: response.text || 'Unable to generate detailed rationale.' });
  } catch (error: any) {
    console.error('Failed to generate answer rationale:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Failed to generate answer explanation.' });
  }
});

// ==========================================
// 5. FLASHCARDS ENDPOINT
// ==========================================
app.post('/api/generate-flashcards', async (req: Request, res: Response) => {
  const { topic, material, count, difficulty } = req.body;
  if (!topic?.trim() && !material?.trim()) {
    res.status(400).json({ error: 'Topic or material required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = `TOPIC: ${topic || 'General Academic'}
MATERIAL: ${material || 'None'}
COUNT: ${count || 6}
DIFFICULTY: ${difficulty || 'intermediate'}

Generate ${count || 6} high-impact flashcards covering definitions, key formulas, core concepts, and application questions.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['id', 'question', 'answer', 'category']
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for flashcards:', error?.message || error);
    res.status(500).json({ error: `AI Flashcards Error: ${error?.message || 'Failed to generate flashcards.'}` });
  }
});

// ==========================================
// 6. OCR EXTRACTOR & SUMMARIZER ENDPOINTS
// ==========================================
app.post('/api/extract-ocr', async (req: Request, res: Response) => {
  const { base64Image, mimeType } = req.body;
  if (!base64Image) {
    res.status(400).json({ error: 'Image data is required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = 'Extract all readable text from this image exactly as written. Preserve formatting, newlines, and structure as much as possible. Do not include any conversational text, just output the raw extracted text.';
    
    // Strip the data:image/png;base64, part if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    ];

    const response = await generateWithModelFallback({
      contents,
      config: {
        temperature: 0.1 // Low temperature for factual extraction
      }
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API call failed for OCR extraction:', error?.message || error);
    res.status(500).json({ error: `OCR Extraction Error: ${error?.message || 'Failed to extract text from image.'}` });
  }
});

app.post('/api/summarize-ocr', async (req: Request, res: Response) => {
  const { rawOcrText } = req.body;
  if (!rawOcrText?.trim()) {
    res.status(400).json({ error: 'OCR text is required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = `EXTRACTED OCR / HANDWRITTEN / PRINTED TEXT:
"""${rawOcrText}"""

Clean up formatting, extract core academic insights, key definitions, formulas, and high-yield exam takeaways.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shortSummary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            importantDefinitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                },
                required: ['term', 'definition']
              }
            },
            importantFormulas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            examPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            quickRevision: { type: Type.STRING }
          },
          required: ['shortSummary', 'keyPoints', 'importantDefinitions', 'importantFormulas', 'examPoints', 'quickRevision']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for OCR summary:', error?.message || error);
    res.status(500).json({ error: `AI OCR Summary Error: ${error?.message || 'Failed to summarize OCR text.'}` });
  }
});

// ==========================================
// 7. PRESENTATION GENERATOR ENDPOINT
// ==========================================
app.post('/api/generate-presentation', async (req: Request, res: Response) => {
  const { topic, slideCount, audience, subject, style } = req.body;
  if (!topic?.trim()) {
    res.status(400).json({ error: 'Presentation topic is required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const targetCount = Math.min(Math.max(Number(slideCount) || 5, 3), 12);
    const prompt = `PRESENTATION TOPIC: ${topic}
TARGET AUDIENCE: ${audience || 'Students & Engineers'}
ACADEMIC SUBJECT: ${subject || 'Academic'}
STYLE / TONE: ${style || 'Academic & Technical'}
REQUIRED SLIDE COUNT: ${targetCount}

Generate a comprehensive, highly relevant educational slide deck with exactly ${targetCount} slides.
Ensure each slide has:
- title: concise, compelling topic slide title
- bullets: 3-5 insightful, technically thorough bullet points tailored specifically to this topic
- speakerNotes: authentic guidance script for the presenter detailing what to say and explain
- keyTakeaway: one punchy summary takeaway sentence`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are a master academic lecturer and presentation architect. You produce deep, topic-specific slide content with zero generic placeholder text.',
        temperature: 0.35,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  speakerNotes: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING }
                },
                required: ['title', 'bullets', 'speakerNotes', 'keyTakeaway']
              }
            }
          },
          required: ['title', 'subtitle', 'slides']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for presentation:', error?.message || error);
    res.status(500).json({ error: `AI Presentation Error: ${error?.message || 'Failed to generate presentation deck.'}` });
  }
});

// ==========================================
// 8. MIND MAP GENERATOR ENDPOINT
// ==========================================
app.post('/api/generate-mindmap', async (req: Request, res: Response) => {
  const { syllabusText } = req.body;
  if (!syllabusText?.trim()) {
    res.status(400).json({ error: 'Syllabus or topic outline text is required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = `SYLLABUS / CURRICULUM / TOPIC INPUT:
"""${syllabusText}"""

Parse and organize this curriculum into a structured hierarchical visual mind map tree.
Extract the main root subject, 3-6 primary units/modules, and under each module provide 2-4 concrete sub-branches with detailed conceptual explanations.`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert curriculum designer and educational knowledge-graph architect. Build accurate, deeply hierarchical tree structures from study outlines.',
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            explanation: { type: Type.STRING },
            children: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  children: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                      },
                      required: ['id', 'title', 'explanation']
                    }
                  }
                },
                required: ['id', 'title', 'explanation']
              }
            }
          },
          required: ['id', 'title', 'explanation', 'children']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for mind map:', error?.message || error);
    res.status(500).json({ error: `AI Mind Map Error: ${error?.message || 'Failed to generate visual mind map.'}` });
  }
});

// ==========================================
// 9. STUDY PLANNER ENDPOINT
// ==========================================
app.post('/api/generate-study-planner', async (req: Request, res: Response) => {
  const { subjects, examDate, availableHours, studyDays, preferredTime, prioritySubjects } = req.body;
  if (!subjects?.trim()) {
    res.status(400).json({ error: 'Subjects list is required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = `STUDENT SUBJECTS: ${subjects}
TARGET EXAM DATE: ${examDate || 'Upcoming Exam Season'}
DAILY STUDY HOURS AVAILABLE: ${availableHours || 4} hours/day
SELECTED STUDY DAYS: ${Array.isArray(studyDays) ? studyDays.join(', ') : 'Monday through Saturday'}
PREFERRED STUDY TIMING: ${preferredTime || 'Morning & Evening'}
PRIORITY / WEAK SUBJECTS: ${prioritySubjects || 'Equal weightage'}

Generate a realistic, high-yield study timetable with daily scheduled slots and actionable learning strategies (Pomodoro, Active Recall, Spaced Repetition).
For each selected study day, create 2 to 4 structured time slots with concrete start/end times, assigned subject, and specific learning activities (e.g. formula derivation, PYQ problem solving, self-quizzing).`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite academic productivity coach and cognitive learning strategist.',
        temperature: 0.35,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  day: { type: Type.STRING },
                  slots: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        start: { type: Type.STRING },
                        end: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        activity: { type: Type.STRING }
                      },
                      required: ['start', 'end', 'subject', 'activity']
                    }
                  }
                },
                required: ['date', 'day', 'slots']
              }
            },
            strategyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['schedule', 'strategyTips']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for study planner:', error?.message || error);
    res.status(500).json({ error: `AI Study Planner Error: ${error?.message || 'Failed to generate study timetable.'}` });
  }
});

// ==========================================
// 10. GOOGLE SHEETS DATA ANALYSIS ENDPOINT
// ==========================================
app.post('/api/analyze-sheet', async (req: Request, res: Response) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400).json({ error: 'Student spreadsheet rows are required' });
    return;
  }

  if (!hasApiKey) {
    res.status(401).json({ error: 'GEMINI_API_KEY is not configured or is invalid.' });
    return;
  }

  try {
    const prompt = `STUDENT SPREADSHEET RECORDS:
${JSON.stringify(rows, null, 2)}

Analyze this student performance dataset and provide:
1. summary: A concise executive summary of the cohort's performance and attendance
2. averagePerformance: Key metrics formatted string (Average Marks, Overall Pass Rate)
3. highestLowest: The top performer name and score, and bottom performer name and score
4. attendanceTrends: Analysis of attendance correlation with scores
5. observations: 3 to 5 deep, data-driven pedagogical observations and recommendations targeting at-risk students and grade trends`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic data analyst and educational evaluation specialist.',
        temperature: 0.25,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            averagePerformance: { type: Type.STRING },
            highestLowest: { type: Type.STRING },
            attendanceTrends: { type: Type.STRING },
            observations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['summary', 'averagePerformance', 'highestLowest', 'attendanceTrends', 'observations']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API call failed for sheet analysis:', error?.message || error);
    res.status(500).json({ error: `AI Sheet Analysis Error: ${error?.message || 'Failed to analyze student data.'}` });
  }
});



// ==========================================
// VITE MIDDLEWARE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
