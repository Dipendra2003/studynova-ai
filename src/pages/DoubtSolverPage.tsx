import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  Copy,
  Check,
  Sparkles,
  User,
  Bot,
  Trash2,
  Download,
  Printer,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  Share2,
  ArrowRight,
  Terminal,
  CheckCircle2,
  MessageSquare,
  Clock,
  ExternalLink,
} from "lucide-react";
import { solveDoubtAI } from "../services/aiService";
import { ChatMessage } from "../types";
import {
  CHATBOT_STARTERS,
  QUICK_FOLLOW_UPS,
  DoubtChatSession,
  exportDoubtChatToMarkdown,
  generatePrintableDoubtHtml,
} from "../utils/doubtSolverHelpers";

const SESSIONS_STORAGE_KEY = "cognitivecraft_doubt_sessions";
const ACTIVE_SESSION_ID_KEY = "cognitivecraft_active_doubt_session";

/**
 * Lightweight, elegant Markdown renderer for AI Chatbot messages
 */
const ChatMarkdownRenderer: React.FC<{
  content: string;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
}> = ({ content, onCopyCode, copiedCode }) => {
  // Split content by code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <div key={`text-${lastIndex}`} className="space-y-2">
          {renderFormattedText(textBefore, onCopyCode, copiedCode)}
        </div>,
      );
    }

    const lang = match[1] || "code";
    const code = match[2];
    const isCopied = copiedCode === code;

    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-3 rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 text-slate-100 shadow-md max-w-full"
      >
        <div className="px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-purple-400">
            <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{lang}</span>
          </span>
          <button
            type="button"
            onClick={() => onCopyCode(code)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap text-emerald-300 break-words max-w-full">
          <code>{code}</code>
        </pre>
      </div>,
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(
      <div key={`text-${lastIndex}`} className="space-y-2">
        {renderFormattedText(remainingText, onCopyCode, copiedCode)}
      </div>,
    );
  }

  return <div className="space-y-2.5 leading-relaxed">{parts}</div>;
};

/**
 * Renders paragraphs, headings, bullet lists, numbered lists, bold, italic, inline code, links, and horizontal rules.
 * Handles mixed content where some lines are list items and some are not.
 */
function renderFormattedText(
  rawText: string,
  onCopyContent?: (text: string) => void,
  copiedContentId?: string | null,
): React.ReactNode[] {
  const lines = rawText.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr-${keyCounter++}`}
          className="border-t border-slate-200 my-3"
        />,
      );
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h5
          key={`h5-${keyCounter++}`}
          className="text-xs font-bold text-slate-900 mt-2.5 mb-1"
        >
          {formatInline(trimmed.replace(/^####\s+/, ""))}
        </h5>,
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${keyCounter++}`}
          className="text-sm font-bold text-slate-900 mt-3 mb-1"
        >
          {formatInline(trimmed.replace(/^###\s+/, ""))}
        </h4>,
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${keyCounter++}`}
          className="text-base font-bold text-slate-900 mt-3 mb-1"
        >
          {formatInline(trimmed.replace(/^##\s+/, ""))}
        </h3>,
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h2
          key={`h2-${keyCounter++}`}
          className="text-lg font-bold text-slate-900 mt-4 mb-2"
        >
          {formatInline(trimmed.replace(/^#\s+/, ""))}
        </h2>,
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().replace(/^>\s+/, ""));
        i++;
      }
      elements.push(
        <blockquote
          key={`bq-${keyCounter++}`}
          className="border-l-4 border-purple-500 bg-purple-50/50 pl-3.5 py-1.5 my-2 text-xs italic text-slate-700 rounded-r-xl"
        >
          {quoteLines.map((ql, idx) => (
            <React.Fragment key={idx}>
              {formatInline(ql)}
              {idx < quoteLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </blockquote>,
      );
      continue;
    }

    // Bullet list: collect consecutive bullet lines
    if (/^\s*[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\s*[-*•]\s+/, ""));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${keyCounter++}`}
          className="space-y-1.5 my-2 pl-4 list-disc marker:text-purple-600 text-xs"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1 leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Numbered list: collect consecutive numbered lines
    if (/^\s*\d+[.)]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${keyCounter++}`}
          className="space-y-1.5 my-2 pl-5 list-decimal marker:text-purple-600 marker:font-bold text-xs"
        >
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1 leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Markdown Table: detect lines starting with |
    if (/^\|.+\|/.test(trimmed)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\|.+\|/.test(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // Parse header row
        const headerCells = tableLines[0]
          .split("|")
          .filter((c) => c.trim() !== "")
          .map((c) => c.trim());

        // Check if second row is separator (|---|---|)
        const hasSeparator = /^\|[\s:]*-+[\s:]*\|/.test(tableLines[1]);
        const dataStartIdx = hasSeparator ? 2 : 1;

        // Parse data rows
        const dataRows = tableLines.slice(dataStartIdx).map((row) =>
          row
            .split("|")
            .filter((c) => c.trim() !== "")
            .map((c) => c.trim()),
        );

        const rawTableText = tableLines.join("\n");
        const tabSeparatedText = tableLines
          .filter((line) => !/^\|[\s:]*-+[\s:]*\|/.test(line)) // Remove separator
          .map((line) => {
            const inner = line.replace(/^\|(.+)\|$/, "$1");
            return inner
              .split("|")
              .map((cell) => cell.trim())
              .join("\t");
          })
          .join("\n");

        const isCopied = copiedContentId === tabSeparatedText;

        elements.push(
          <div
            key={`tbl-${keyCounter++}`}
            className="my-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white"
          >
            {onCopyContent && (
              <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Table Data
                </span>
                <button
                  type="button"
                  onClick={() => onCopyContent(tabSeparatedText)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 flex items-center gap-1 transition-colors cursor-pointer capitalize"
                >
                  {isCopied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{isCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-50 border-b border-purple-200">
                    {headerCells.map((cell, cIdx) => (
                      <th
                        key={cIdx}
                        className="px-3 py-2 text-left font-bold text-slate-900 border-r border-purple-100 last:border-r-0 whitespace-nowrap"
                      >
                        {formatInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`border-b border-slate-100 last:border-b-0 ${
                        rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      } hover:bg-purple-50/30 transition-colors`}
                    >
                      {headerCells.map((_, cIdx) => (
                        <td
                          key={cIdx}
                          className="px-3 py-1.5 text-slate-700 border-r border-slate-100 last:border-r-0"
                        >
                          {formatInline(row[cIdx] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>,
        );
        continue;
      }
    }

    // Regular paragraph: collect consecutive non-special lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i].trim()) &&
      !/^\s*[-*•]\s+/.test(lines[i].trim()) &&
      !/^\s*\d+[.)]\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("> ") &&
      !/^[-*_]{3,}$/.test(lines[i].trim()) &&
      !/^\|.+\|/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p
          key={`p-${keyCounter++}`}
          className="text-xs sm:text-[13px] leading-relaxed text-slate-800"
        >
          {paraLines.map((pl, idx) => (
            <React.Fragment key={idx}>
              {formatInline(pl)}
              {idx < paraLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>,
      );
    }
  }

  return elements;
}

/**
 * Formats inline markdown: ***bold italic***, **bold**, *italic*, `code`, and [links](url)
 */
function formatInline(str: string): React.ReactNode {
  // Regex to match: ***bold italic***, **bold**, *italic*, `code`, [text](url)
  const regex =
    /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*[^*]+?\*|`[^`]+?`|\[[^\]]+?\]\([^)]+?\))/g;
  const parts = str.split(regex);

  return parts.map((part, idx) => {
    // ***bold italic***
    if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
      return (
        <strong key={idx} className="font-bold italic text-slate-900">
          {part.slice(3, -3)}
        </strong>
      );
    }
    // **bold**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // *italic*
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**") &&
      part.length > 2
    ) {
      return (
        <em key={idx} className="italic text-slate-700">
          {part.slice(1, -1)}
        </em>
      );
    }
    // `inline code`
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[11px] border border-purple-200 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // [link text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-800 underline underline-offset-2 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export const DoubtSolverPage: React.FC = () => {
  // Layout State: Collapsible Sidebar (like ChatGPT / Gemini)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Chat Sessions History State (Stored in localStorage)
  const [sessions, setSessions] = useState<DoubtChatSession[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY) || null;
  });

  // Current active chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load session on startup or when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      const found = sessions.find((s) => s.id === activeSessionId);
      if (found) {
        setMessages(found.messages);
      }
    }
  }, [activeSessionId]);

  // Sync sessions to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_ID_KEY, activeSessionId);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
      }
    }
  }, [activeSessionId]);

  // Auto-save current messages to the active session
  useEffect(() => {
    if (messages.length === 0) return;

    if (!activeSessionId) {
      // Create new session automatically on first message
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 36).trim() +
          (firstUserMsg.content.length > 36 ? "..." : "")
        : "New Doubt Session";

      const newId = `session-${Date.now()}`;
      const newSession: DoubtChatSession = {
        id: newId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages,
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newId);
    } else {
      // Update existing session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages, updatedAt: Date.now() }
            : s,
        ),
      );
    }
  }, [messages]);

  // Cleanup speech synthesis and mic on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.abort();
      }
    };
  }, []);

  // Voice Input (Speech Recognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Speech Recognition is not supported by your browser.");
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        showToast("Listening... Speak your doubt now.");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) =>
            prev ? `${prev} ${transcript}` : transcript,
          );
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast("Voice input stopped or encountered an error.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      showToast("Could not initialize speech recognition.");
    }
  };

  // Text-to-Speech (Read Aloud)
  const handleToggleSpeech = (msgId: string, textToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isSpeaking && speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/[`*#_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    setIsSpeaking(true);
    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    const historyPayload = messages
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const botReply = await solveDoubtAI({
        question: query,
        history: historyPayload,
      });

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: `I encountered an issue formulating your explanation (${err.message || "Network error"}). Please try asking again.`,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    // Strip markdown formatting for clean clipboard text
    const cleanText = text
      .replace(/```[a-zA-Z0-9_-]*\n[\s\S]*?```/g, (match) => {
        // Keep code content but remove code fences
        return match.replace(/```[a-zA-Z0-9_-]*\n/, "").replace(/```$/, "");
      })
      .replace(/^#{1,6}\s+/gm, "") // Remove heading markers
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // Remove ***bold italic***
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
      .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
      .replace(/`([^`]+)`/g, "$1") // Remove `inline code`
      .replace(/^\|[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)*\|?\s*$/gm, "") // Remove table separator rows (|---|---|)
      .replace(/^\|(.+)\|$/gm, (_match, inner) => {
        // Convert table rows to tab-separated
        return inner
          .split("|")
          .map((cell: string) => cell.trim())
          .join("\t");
      })
      .replace(/^\s*[-*•]\s+/gm, "• ") // Normalize bullets
      .replace(/^\s*>\s+/gm, "") // Remove blockquote markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
      .replace(/\n{3,}/g, "\n\n") // Collapse excess newlines
      .trim();
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Copied answer to clipboard.");
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeText(codeText);
    setTimeout(() => setCopiedCodeText(null), 2000);
    showToast("Copied code example.");
  };

  // New Chat session
  const handleNewSession = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setMessages([]);
    setInputMessage("");
    setActiveSessionId(null);
    showToast("Started new doubt clearing chat.");
  };

  // Switch to saved session
  const handleSelectSession = (sessionId: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessageId(null);
    setActiveSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
    }
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Delete saved session
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setMessages([]);
      setActiveSessionId(null);
    }
    showToast("Deleted conversation.");
  };

  // Clear all saved sessions
  const handleClearAllSessions = () => {
    setSessions([]);
    setMessages([]);
    setActiveSessionId(null);
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
    showToast("Cleared all chat history.");
  };

  // Exports
  const handleExportMarkdown = () => {
    if (messages.length === 0) {
      showToast("No conversation to export.");
      return;
    }
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const title = currentSession?.title || "Doubt_Solver_Chat";
    const md = exportDoubtChatToMarkdown(messages, title);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Downloaded Markdown chat notes.");
    setExportMenuOpen(false);
  };

  const handleExportPrintable = () => {
    if (messages.length === 0) {
      showToast("No conversation to print.");
      return;
    }
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    const title = currentSession?.title || "AI Doubt Solver Notes";
    const html = generatePrintableDoubtHtml(messages, title);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
    setExportMenuOpen(false);
  };

  return (
    <div className="w-full h-full flex overflow-hidden relative bg-[#F7F8FA]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#080909] text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. COLLAPSIBLE SIDEBAR: CHATGPT / GEMINI HISTORY              */}
      {/* ============================================================ */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white border-r border-[#DFE4F2] flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 text-left ${
          sidebarOpen
            ? "w-72 sm:w-80 max-w-[85vw] translate-x-0 shadow-2xl lg:shadow-none"
            : "w-0 border-r-0 -translate-x-full lg:translate-x-0 overflow-hidden pointer-events-none"
        }`}
      >
        <div className="w-72 sm:w-80 flex flex-col h-full shrink-0">
          {/* Sidebar Top: New Chat & Close */}
          <div className="p-3.5 border-b border-[#DFE4F2] flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNewSession}
              className="flex-1 py-2.5 px-3.5 bg-[#080909] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>New Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar Body: Chat History */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 text-xs custom-scrollbar">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent Chats</span>
              </span>
              {sessions.length > 0 && (
                <span className="text-[10px] text-slate-400 font-normal">
                  {sessions.length} saved
                </span>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
                <p className="text-xs">No chat history yet.</p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Ask any doubt to begin your learning session.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((sess) => {
                  const isActive = activeSessionId === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess.id)}
                      className={`group w-full p-2.5 rounded-xl text-left font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? "bg-purple-50 text-[#7C3AED] border border-purple-200 font-bold shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive
                              ? "text-[#7C3AED]"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <span className="truncate text-xs">{sess.title}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, sess.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 hover:text-rose-600 text-slate-400 rounded-md transition-all cursor-pointer shrink-0"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Footer: Exporters & Clear All */}
          <div className="p-3 border-t border-[#DFE4F2] bg-slate-50/80 flex flex-col gap-2 shrink-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportPrintable}
                disabled={messages.length === 0}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Print chat as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleExportMarkdown}
                disabled={messages.length === 0}
                className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Download Markdown note"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.MD</span>
              </button>
            </div>

            {sessions.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllSessions}
                className="w-full py-1 text-[11px] text-slate-400 hover:text-rose-600 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All Chat History</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CHAT ARENA (CHATGPT / GEMINI STYLE)                  */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full min-w-0 min-h-0 overflow-hidden bg-white text-left">
        {/* Top Navbar */}
        <header className="h-13 sm:h-14 border-b border-[#DFE4F2] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3 bg-white shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Open sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate font-display flex items-center gap-2">
                  <span>AI Doubt Solver</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini AI</span>
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {isSpeaking && (
              <button
                type="button"
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setSpeakingMessageId(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stop Voice</span>
              </button>
            )}

            {/* Quick Export Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {exportMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left animate-in fade-in"
                  onMouseLeave={() => setExportMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={handleExportPrintable}
                    className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Printer className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Download Markdown</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleNewSession}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Start new chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Thread (Center Scrollable Column) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            {/* HERO EMPTY STATE (CHATGPT / GEMINI WELCOME) */}
            {messages.length === 0 ? (
              <div className="py-6 sm:py-10 text-center space-y-4 sm:space-y-6 animate-in fade-in duration-500">
                <div className="space-y-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-gradient-to-tr from-purple-100 to-indigo-100 border border-purple-200 text-[#7C3AED] flex items-center justify-center mx-auto shadow-xs">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                    What do you want to learn today?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed px-2">
                    Ask any doubt across coding, mathematics, science,
                    engineering, or homework. I'll break it down step-by-step.
                  </p>
                </div>

                {/* 4 Starter Prompt Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-2xl mx-auto">
                  {CHATBOT_STARTERS.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      onClick={() => handleSendMessage(starter.prompt)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#7C3AED] bg-slate-50/60 hover:bg-purple-50/40 text-slate-800 transition-all cursor-pointer group shadow-2xs flex flex-col justify-between space-y-1.5 hover:shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{starter.tag}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 group-hover:text-[#7C3AED] transition-transform" />
                        </div>
                        <span className="font-bold text-xs text-slate-900 group-hover:text-[#7C3AED] transition-colors block">
                          {starter.title}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {starter.subtitle}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ACTIVE MESSAGES STREAM */
              messages.map((m) => {
                const isUser = m.role === "user";
                const isCurrentSpeaking =
                  isSpeaking && speakingMessageId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`rounded-3xl p-4 sm:p-5 text-xs relative group leading-relaxed shadow-xs transition-all overflow-hidden ${
                        isUser
                          ? "max-w-[85%] bg-[#080909] text-white rounded-br-sm shadow-md"
                          : "w-full bg-white border border-slate-200 text-slate-800 rounded-bl-sm space-y-3"
                      }`}
                    >
                      {/* Message Header */}
                      <div
                        className={`flex items-center justify-between gap-4 text-[10px] pb-1.5 border-b font-mono ${
                          isUser
                            ? "border-white/10 text-white/70"
                            : "border-slate-100 text-slate-400"
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider">
                          {isUser ? "You" : "AI Doubt Solver"}
                        </span>
                        <div className="flex items-center gap-3">
                          {isUser && (
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              title="Copy your message"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>
                                {copiedId === m.id ? "Copied" : "Copy"}
                              </span>
                            </button>
                          )}
                          <span>{m.timestamp}</span>
                        </div>
                      </div>

                      {/* Message Content: Clean Markdown */}
                      {isUser ? (
                        <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px] font-medium">
                          {m.content}
                        </div>
                      ) : (
                        <ChatMarkdownRenderer
                          content={m.content}
                          onCopyCode={handleCopyCode}
                          copiedCode={copiedCodeText}
                        />
                      )}

                      {/* Actions for Assistant Message */}
                      {!isUser && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSpeech(m.id, m.content)
                              }
                              className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors cursor-pointer min-h-[28px] ${
                                isCurrentSpeaking
                                  ? "bg-purple-100 border-purple-300 text-[#7C3AED] font-bold"
                                  : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800"
                              }`}
                              title="Read explanation aloud"
                            >
                              {isCurrentSpeaking ? (
                                <>
                                  <VolumeX className="w-3.5 h-3.5 text-[#7C3AED]" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Read Aloud</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              className="p-1.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer min-h-[28px]"
                              title="Copy answer"
                            >
                              {copiedId === m.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {copiedId === m.id ? "Copied" : "Copy"}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Suggested Follow-Ups Chips */}
                      {!isUser &&
                        m.suggestedFollowUps &&
                        m.suggestedFollowUps.length > 0 && (
                          <div className="pt-2 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">
                              Suggested Follow-Ups:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.suggestedFollowUps.map((fu, fIdx) => (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => handleSendMessage(fu)}
                                  className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 font-medium transition-colors cursor-pointer text-left leading-snug"
                                >
                                  &bull; {fu}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-[#7C3AED] flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl rounded-bl-sm text-xs text-[#7C3AED] italic flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-[#7C3AED] shrink-0" />
                  <span>
                    AI Tutor is thinking and formulating step-by-step
                    explanation...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. PINNED FLOATING INPUT BAR (CHATGPT / GEMINI CAPSULE)      */}
        {/* ============================================================ */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-[#DFE4F2] shrink-0 z-10">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Follow-Up Chips Carousel */}
            <div className="relative flex items-center">
              <div
                className="flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar select-none py-1 scroll-smooth w-full"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 font-mono pl-0.5">
                  Quick:
                </span>
                {QUICK_FOLLOW_UPS.map((qf, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qf.prompt)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-slate-700 hover:text-[#7C3AED] font-medium shrink-0 transition-colors cursor-pointer shadow-2xs whitespace-nowrap text-[11px]"
                  >
                    {qf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Capsule Input */}
            <div className="bg-[#F7F8FA] border border-[#DFE4F2] focus-within:border-[#7C3AED] focus-within:bg-white rounded-3xl p-1.5 sm:p-2 flex items-end gap-1.5 sm:gap-2 shadow-sm transition-all">
              {/* Mic Voice Input */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center ${
                  isListening
                    ? "bg-rose-50 border-rose-400 text-rose-600 animate-pulse shadow-xs"
                    : "bg-white border-slate-200 text-slate-500 hover:text-[#7C3AED] hover:bg-purple-50"
                }`}
                title={isListening ? "Stop listening" : "Speak doubt verbally"}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any academic doubt, question, or problem..."
                className="flex-1 bg-transparent border-0 p-1.5 sm:p-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed min-h-[36px] sm:min-h-[40px] max-h-28 sm:max-h-36 custom-scrollbar"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#080909] hover:bg-[#7C3AED] disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Disclaimer Footer */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-1.5 sm:px-2 font-mono">
              <span className="hidden sm:inline">
                Press Enter to send &bull; Shift + Enter for new line
              </span>
              <span className="sm:hidden">Tap Send to submit</span>
              <span>Powered by StudyNova AI</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
