import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Copy,
  Check,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ReportService from "../../../services/reportService";
import { toast } from "sonner";

// Quick reply suggestion pills
const QUICK_SUGGESTIONS = [
  { label: "📊 Feedback Summary", text: "Summarize the overall feedback ratings and participant satisfaction." },
  { label: "⚠️ Flag Low Ratings", text: "Find any feedback ratings or questions scored below 8 that need attention." },
  { label: "📜 Certificate Stats", text: "Show summary statistics for issued certificates and active courses." },
  { label: "📋 TRG-218 Overview", text: "What are the key training record highlights for this year?" },
  { label: "📅 TRG-219 Activities", text: "Summarize the upcoming training activity calendar and scheduled courses." },
];

const REPORT_SCOPE_OPTIONS = [
  { value: "feedback", label: "Feedback Report" },
  { value: "certificate", label: "Certificate Report" },
  { value: "training_record", label: "TRG-218 Records" },
  { value: "training_activities", label: "TRG-219 Activities" },
];

// Helper to format basic markdown (bold, italic, lists, tables, headers)
const MarkdownContent = ({ content }) => {
  if (!content) return null;

  // Split content by lines
  const lines = content.split("\n");
  const elements = [];
  let tableBuffer = [];
  let inTable = false;

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                {tableBuffer[0].map((col, cIdx) => (
                  <th key={cIdx} className="px-3 py-2 whitespace-nowrap">
                    {formatInline(col.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tableBuffer.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-slate-50/50" : ""}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                      {formatInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
    }
    inTable = false;
  };

  const formatInline = (text) => {
    if (!text) return "";
    // Bold: **text**
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-900">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for markdown table line
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      // If it's a separator line (e.g. |---|---|)
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        // Skip separator row
        continue;
      }

      inTable = true;
      tableBuffer.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-bold text-slate-900">
          {formatInline(trimmed.substring(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mt-3 mb-1 text-sm font-extrabold text-slate-900">
          {formatInline(trimmed.substring(3))}
        </h3>
      );
      continue;
    }

    // Bullet list items
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 py-0.5 pl-1 text-xs sm:text-[13px] leading-relaxed">
          <span className="text-amber-600 font-bold select-none">•</span>
          <span className="flex-1">{formatInline(trimmed.substring(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 py-0.5 pl-1 text-xs sm:text-[13px] leading-relaxed">
          <span className="font-semibold text-indigo-600 select-none">{numMatch[1]}.</span>
          <span className="flex-1">{formatInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-xs sm:text-[13px] leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  }

  if (inTable) {
    flushTable();
  }

  return <div className="space-y-1">{elements}</div>;
};

const INITIAL_GREETING = `Welcome to **MOLMI Report AI**! 📊

I'm Aria, your intelligent report concierge. I can help you analyze and query reports across the MOLMI portal:
• **Feedback & Evaluation**: Overall participant ratings, faculty performance, and feedback comments
• **Certificate Issuance**: Candidate completions, topics, ranks, and dates
• **TRG-218 & TRG-219**: Annual training records and calendar activities
• **Risk & Concerns**: Flag records with low scores (<8) or suggestions for improvement

How can I assist your report review today?`;

const ReportAiChatbotWidget = ({
  isOpenDefault = false,
  activeFilters = {},
  onCloseExternal,
  forceOpenTrigger = 0,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [reportScope, setReportScope] = useState("feedback");
  const [messages, setMessages] = useState([
    {
      id: "greet-1",
      role: "assistant",
      content: INITIAL_GREETING,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (forceOpenTrigger > 0) {
      setIsOpen(true);
      setHasUnread(false);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [forceOpenTrigger]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Open / Close handlers
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setHasUnread(false);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
    if (onCloseExternal && !nextState) {
      onCloseExternal();
    }
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn
      const historyPayload = messages
        .filter((m) => m.id !== "greet-1")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const payload = {
        message: text,
        history: historyPayload,
        report_type: reportScope,
        params: activeFilters[reportScope] || activeFilters || {},
      };

      const response = await ReportService.askReportAi(payload);

      const botReplyText =
        response?.reply ||
        response?.answer?.summary ||
        "I analyzed the report data, but did not receive a response text.";

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reportMeta: response?.report,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: "assistant",
        isError: true,
        content:
          error?.reply ||
          error?.message ||
          "⚠️ Connection error. Please check your backend or try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error("Failed to get AI response.");
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `greet-${Date.now()}`,
        role: "assistant",
        content: INITIAL_GREETING,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast.success("Chat history cleared.");
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Textarea key handler
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInputPrompt(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 110)}px`;
  };

  return (
    <>
      {/* ── Floating Launcher Bubble ── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={handleToggle}
            className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-slate-900/20 border border-slate-700/50 hover:bg-slate-900 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Chat with Report AI</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-label="Toggle Report AI Chatbot"
          className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? "bg-slate-800 text-white hover:bg-slate-900 ring-4 ring-slate-400/20"
              : "bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 text-amber-400 hover:scale-105 hover:shadow-indigo-500/25 ring-4 ring-indigo-500/20"
          }`}
        >
          {isOpen ? (
            <ChevronDown className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
          ) : (
            <Bot className="h-6 w-6 text-amber-400 transition-transform group-hover:scale-110" />
          )}

          {/* Unread badge */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 ring-2 ring-white animate-pulse">
              AI
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Window Modal ── */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/25 backdrop-blur-xl transition-all duration-300 ease-out ${
          isExpanded
            ? "inset-4 sm:inset-10 z-[60]"
            : "bottom-24 right-4 sm:right-6 w-[420px] max-w-[calc(100vw-32px)] h-[620px] max-h-[calc(100vh-120px)]"
        } ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
            : "translate-y-6 scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md ring-2 ring-amber-400/40">
              <Bot className="h-5 w-5 text-slate-950" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-500" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  Aria — Report AI
                </h3>
                <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                  Concierge
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Online • MOLMI Portal Intelligence
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 text-slate-300">
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset conversation"
              className="rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
              className="hidden sm:block rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleToggle}
              title="Close chat"
              className="rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scope selector bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs">
          <span className="font-medium text-slate-600">Report Focus:</span>
          <select
            value={reportScope}
            onChange={(e) => setReportScope(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {REPORT_SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`group flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                <div
                  className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
                    isUser
                      ? "rounded-br-xs bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-indigo-950/10"
                      : msg.isError
                      ? "rounded-bl-xs border border-rose-200 bg-rose-50/90 text-rose-900"
                      : "rounded-bl-xs border border-slate-200/80 bg-white text-slate-800 shadow-slate-100"
                  }`}
                >
                  {/* Header / Report badge for bot replies */}
                  {!isUser && msg.reportMeta && (
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                      <FileSpreadsheet className="h-3 w-3" />
                      <span>
                        {msg.reportMeta.report_label || "Report Data"} ({msg.reportMeta.returned_row_count || 0} rows)
                      </span>
                    </div>
                  )}

                  {/* Message body */}
                  <MarkdownContent content={msg.content} />

                  {/* Copy button */}
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute -top-2 -right-2 hidden rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm opacity-0 group-hover:opacity-100 group-hover:flex items-center justify-center transition hover:text-slate-900"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                <span className="mt-1 px-1 text-[10px] text-slate-400 select-none">
                  {msg.time}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-xs border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-[11px] text-slate-400 italic">Aria is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="border-t border-slate-100 bg-white/80 px-3 pt-2 pb-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.text)}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-200/80 bg-amber-50/70 px-2.5 py-1 text-[11px] font-medium text-amber-900 shadow-xs transition hover:border-amber-400 hover:bg-amber-100/80 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-slate-100 bg-white p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3 py-1.5 shadow-inner focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={`Ask about ${reportScope === "general" ? "any report" : reportScope} data...`}
              className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            />

            <button
              type="button"
              disabled={!inputPrompt.trim() || isLoading}
              onClick={() => handleSendMessage()}
              aria-label="Send message"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {isLoading ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span>Enter to send • Shift+Enter for new line</span>
            <span className="text-slate-400 font-medium">MOLMI Report Assistant</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportAiChatbotWidget;
