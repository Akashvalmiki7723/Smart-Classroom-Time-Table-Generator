'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons ────────────────────────────────────────────────────────────────────
const SparklesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const NavigateArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  userRole?: string;
  userId?: string;
  userName?: string;
  departmentId?: string;
}

// ─── Quick suggestions per role ───────────────────────────────────────────────
const SUGGESTIONS: Record<string, string[]> = {
  admin: [
    'Add a new user',
    'Take me to reports',
    'Show me all timetables',
    'Go to room management',
  ],
  coordinator: [
    'Create a new timetable',
    'Add a new room',
    'Take me to reports',
    'Manage batches',
  ],
  faculty: [
    'Show my schedule',
    'View my subjects',
    'Apply for leave',
    'Go to dashboard',
  ],
};

// ─── Markdown-lite renderer with navigation support ──────────────────────────
function renderMessage(text: string, onNavigate?: (path: string) => void) {
  // Extract navigation actions before rendering
  const navRegex = /\[NAVIGATE:([^|\]]+)\|([^\]]+)\]/g;
  const navActions: { path: string; label: string }[] = [];
  let match;
  while ((match = navRegex.exec(text)) !== null) {
    navActions.push({ path: match[1], label: match[2] });
  }
  // Remove navigation tags from text for display
  const cleanText = text.replace(/\[NAVIGATE:[^\]]+\]/g, '').trim();

  // Split into lines and process
  const lines = cleanText.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} style={{
            background: '#1e1e2e', color: '#cdd6f4', padding: '12px',
            borderRadius: '8px', fontSize: '12px', overflowX: 'auto',
            margin: '8px 0', lineHeight: '1.5',
          }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // Bold
    let processed: React.ReactNode = line;
    if (typeof processed === 'string' && processed.includes('**')) {
      const parts = processed.split(/\*\*(.*?)\*\*/g);
      processed = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
    }

    // Inline code
    if (typeof processed === 'string' && processed.includes('`')) {
      const parts = processed.split(/`(.*?)`/g);
      processed = parts.map((part, j) =>
        j % 2 === 1 ? (
          <code key={j} style={{
            background: 'rgba(155,142,199,0.15)', padding: '1px 5px',
            borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace',
          }}>{part}</code>
        ) : part
      );
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
          <span style={{ color: 'var(--purple)', flexShrink: 0 }}>•</span>
          <span>{typeof processed === 'string' ? processed.slice(2) : processed}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numberedMatch = line.match(/^(\d+)\.\s/);
    if (numberedMatch) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '6px', marginLeft: '4px' }}>
          <span style={{ color: 'var(--purple)', flexShrink: 0, fontWeight: 600, fontSize: '12px' }}>{numberedMatch[1]}.</span>
          <span>{typeof processed === 'string' ? processed.replace(/^\d+\.\s/, '') : processed}</span>
        </div>
      );
      return;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '6px' }} />);
      return;
    }

    elements.push(<div key={i}>{processed}</div>);
  });

  // Render navigation action buttons
  if (navActions.length > 0 && onNavigate) {
    elements.push(
      <div key="nav-actions" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
        {navActions.map((action, i) => (
          <button
            key={`nav-${i}`}
            onClick={() => onNavigate(action.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--purple), var(--lavender))',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(155,142,199,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(155,142,199,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(155,142,199,0.3)';
            }}
          >
            <NavigateArrowIcon />
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return <>{elements}</>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIChatbot({ userRole = 'faculty', userId, userName, departmentId }: AIChatbotProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userRole,
          userId,
          userName,
          departmentId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  const suggestions = SUGGESTIONS[userRole] || SUGGESTIONS.faculty;

  return (
    <>
      {/* ── Floating Action Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed z-50"
            style={{
              bottom: '24px',
              right: '24px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--purple), var(--lavender))',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 24px rgba(155,142,199,0.5), 0 2px 8px rgba(155,142,199,0.3)',
            }}
            aria-label="Open AI Assistant"
          >
            <SparklesIcon />
            {/* Ping indicator */}
            <span
              className="absolute -top-1 -right-1"
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#4ade80',
                border: '2px solid white',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50"
            style={{
              bottom: '24px',
              right: '24px',
              width: '400px',
              height: '560px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              boxShadow: '0 20px 60px rgba(45,32,64,0.18), 0 8px 24px rgba(45,32,64,0.1)',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, var(--purple), var(--lavender))',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SparklesIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', lineHeight: '1.2' }}>
                  AI Assistant
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '1px' }}>
                  Powered by Smart Classroom
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Clear chat"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrashIcon />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MinimizeIcon />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'var(--cream-light)',
              }}
            >
              {/* Welcome message */}
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(155,142,199,0.15), rgba(189,166,206,0.15))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: 'var(--purple)',
                    }}
                  >
                    <SparklesIcon />
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                    }}
                  >
                    Hi! I&apos;m your AI Assistant
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.5',
                    }}
                  >
                    Ask me anything about the Smart Classroom Timetable System. I&apos;m here to help!
                  </p>
                </div>
              )}

              {/* Quick suggestions */}
              {showSuggestions && messages.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '2px',
                    }}
                  >
                    Quick questions
                  </p>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        background: '#FFFFFF',
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        lineHeight: '1.4',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--purple)';
                        e.currentTarget.style.color = 'var(--purple)';
                        e.currentTarget.style.background = 'rgba(155,142,199,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius:
                        msg.role === 'user'
                          ? '14px 14px 4px 14px'
                          : '14px 14px 14px 4px',
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, var(--purple), var(--lavender))'
                          : '#FFFFFF',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      fontSize: '13px',
                      lineHeight: '1.55',
                      boxShadow:
                        msg.role === 'assistant'
                          ? '0 1px 4px rgba(45,32,64,0.06)'
                          : 'none',
                      border:
                        msg.role === 'assistant'
                          ? '1px solid var(--border-light)'
                          : 'none',
                    }}
                  >
                    {msg.role === 'assistant' ? renderMessage(msg.content, (path) => { router.push(path); setIsOpen(false); }) : msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '12px 18px',
                      borderRadius: '14px 14px 14px 4px',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      gap: '5px',
                      alignItems: 'center',
                      boxShadow: '0 1px 4px rgba(45,32,64,0.06)',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: 'var(--purple)',
                          opacity: 0.6,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ── */}
            <div
              style={{
                padding: '12px 16px',
                background: '#FFFFFF',
                borderTop: '1px solid var(--border-light)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  background: 'var(--cream-light)',
                  borderRadius: 'var(--radius)',
                  border: '1.5px solid var(--border)',
                  padding: '6px 6px 6px 14px',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--purple)';
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  rows={1}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    resize: 'none',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)',
                    maxHeight: '80px',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    border: 'none',
                    background:
                      input.trim() && !isLoading
                        ? 'linear-gradient(135deg, var(--purple), var(--lavender))'
                        : 'var(--border-light)',
                    color: input.trim() && !isLoading ? 'white' : 'var(--text-muted)',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <SendIcon />
                </button>
              </div>
              <p
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginTop: '6px',
                }}
              >
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
