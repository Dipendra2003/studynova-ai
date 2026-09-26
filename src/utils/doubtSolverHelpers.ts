import { ChatMessage } from '../types';

export interface StarterPrompt {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  tag: string;
}

export const CHATBOT_STARTERS: StarterPrompt[] = [
  {
    id: 'recursion',
    title: 'Code & Recursion',
    subtitle: 'Trace execution stack & analyze O(N) complexity',
    prompt: 'Explain how Recursion works in programming with a call-stack dry run and base case breakdown.',
    tag: 'Computer Science'
  },
  {
    id: 'math',
    title: 'Math & Derivations',
    subtitle: 'Step-by-step mathematical proof & intuition',
    prompt: 'Explain the Fundamental Theorem of Calculus with intuitive geometric area and practical meaning.',
    tag: 'Mathematics'
  },
  {
    id: 'physics',
    title: 'Physics & Relativity',
    subtitle: 'Understand time dilation & spacetime intuitively',
    prompt: 'Explain Special Relativity time dilation vs General Relativity gravitational dilation with real-world examples.',
    tag: 'Physics'
  },
  {
    id: 'ai-ml',
    title: 'AI & Deep Learning',
    subtitle: 'How modern neural networks learn and adapt',
    prompt: 'How does the Attention mechanism in Transformers work? Explain Query, Key, and Value matrices simply.',
    tag: 'Artificial Intelligence'
  }
];

export const QUICK_FOLLOW_UPS = [
  { label: '💡 Real-World Analogy', prompt: 'Can you give me an intuitive real-world analogy to help me visualize this concept clearly?' },
  { label: '💻 Working Code Example', prompt: 'Can you provide a complete, commented working code example illustrating this?' },
  { label: '👶 Explain Like I am 10', prompt: 'Can you explain this again in the simplest possible terms, like I am 10 years old?' },
  { label: '📝 3-Bullet Takeaways', prompt: 'Summarize the core takeaways of this in exactly 3 concise bullet points.' },
  { label: '⚠️ Exam Traps & Misconceptions', prompt: 'What are the most common exam traps or mistakes students make with this topic?' },
  { label: '🧪 Quiz Practice Question', prompt: 'Can you give me 1 multiple-choice practice question on this concept to test my understanding?' }
];

/**
 * Chat Session format for local storage persistence
 */
export interface DoubtChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

/**
 * Formats a chat session into a clean, downloadable Markdown document
 */
export function exportDoubtChatToMarkdown(
  messages: ChatMessage[],
  title: string = 'AI Doubt Solver Chat'
): string {
  const lines: string[] = [];
  lines.push(`# 💬 ${title}`);
  lines.push(`**Export Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
  lines.push(`**Total Messages:** ${messages.length}\n`);
  lines.push('---\n');

  messages.forEach((msg, idx) => {
    const isUser = msg.role === 'user';
    if (isUser) {
      lines.push(`### 👤 Student (${msg.timestamp})`);
      lines.push(`> ${msg.content}\n`);
    } else {
      lines.push(`### 🤖 AI Tutor (${msg.timestamp})`);
      lines.push(`${msg.content}\n`);
      if (msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0) {
        lines.push(`*Suggested follow-ups:*`);
        msg.suggestedFollowUps.forEach((fu) => lines.push(`- ${fu}`));
        lines.push('');
      }
    }
    lines.push('---\n');
  });

  return lines.join('\n');
}

/**
 * Generates an offline-ready printable HTML document with clean chat paper styling
 */
export function generatePrintableDoubtHtml(
  messages: ChatMessage[],
  title: string = 'AI Doubt Solver Notes'
): string {
  const contentHtml = messages
    .map((msg) => {
      const isUser = msg.role === 'user';
      if (isUser) {
        return `
        <div class="msg-box user-box">
          <div class="box-header">
            <strong>Student Question</strong>
            <span>${msg.timestamp}</span>
          </div>
          <div class="user-query">${escapeHtml(msg.content)}</div>
        </div>`;
      }

      return `
      <div class="msg-box tutor-box">
        <div class="box-header">
          <strong>AI Doubt Solver Explanation</strong>
          <span>${msg.timestamp}</span>
        </div>
        <div class="tutor-content">${escapeHtml(msg.content).replace(/\n/g, '<br/>')}</div>
        ${
          msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0
            ? `<div class="follow-ups"><strong>Suggested Next Questions:</strong><ul>${msg.suggestedFollowUps
                .map((fu) => `<li>${escapeHtml(fu)}</li>`)
                .join('')}</ul></div>`
            : ''
        }
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 860px; margin: auto; line-height: 1.6; }
  h1 { font-size: 24px; border-bottom: 2px solid #7c3aed; padding-bottom: 8px; margin-bottom: 4px; color: #1e1b4b; }
  .meta-bar { font-size: 13px; color: #64748b; margin-bottom: 30px; display: flex; justify-content: space-between; }
  .msg-box { margin-bottom: 20px; border-radius: 12px; padding: 18px; page-break-inside: avoid; }
  .user-box { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #6366f1; }
  .tutor-box { background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #7c3aed; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .box-header { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; font-weight: 700; letter-spacing: 0.5px; }
  .user-query { font-size: 14px; font-weight: 600; color: #0f172a; }
  .tutor-content { font-size: 13px; color: #1e293b; line-height: 1.65; }
  .follow-ups { margin-top: 14px; padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #475569; }
  .follow-ups ul { margin: 6px 0 0 16px; padding: 0; }
  .btn-print { background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
  .no-print { margin-bottom: 20px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save to PDF</button>
  </div>
  <h1>StudyNova AI — Doubt Solver</h1>
  <div class="meta-bar">
    <span>${escapeHtml(title)}</span>
    <span>Generated: ${new Date().toLocaleDateString()}</span>
  </div>
  ${contentHtml}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
