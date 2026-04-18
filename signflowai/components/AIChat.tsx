'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, Trash2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestions = [
  'How do I sign "I love you"?',
  'What are emergency ASL phrases?',
  'Explain ASL grammar rules',
  'How to sign the alphabet?',
  'Tips for learning ASL fast',
  'What is Deaf culture?',
  'How do I sign "help me"?',
  'How to communicate with a Deaf person?',
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your SignFlowAI assistant powered by Gemini 1.5 Pro 🤟 I'm an expert in ASL, Deaf culture, and accessible communication. Your chat history is saved automatically. What would you like to learn?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedHistory, setSavedHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Send full conversation history for context
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages, // Send full history for Gemini context
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'API error');
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${err.message || "I'm having trouble connecting. Please check your Gemini API key in .env.local"}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const loadHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/chat-history');
      const data = await res.json();
      setSavedHistory(data.history || []);
    } catch {
      setSavedHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/chat-history', { method: 'DELETE' });
      setSavedHistory([]);
      setHistoryCleared(true);
      setTimeout(() => setHistoryCleared(false), 2000);
    } catch { /* ignore */ }
  };

  const formatTime = (d: Date | string) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Chat panel */}
      <div className="lg:col-span-2">
        <div className="glass rounded-2xl flex flex-col" style={{ height: '620px', borderColor: 'rgba(123,97,255,0.15)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 p-5 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7b61ff, #00d9f5)' }}>
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">SignFlowAI Assistant</h3>
              <p className="text-xs text-muted">Gemini 1.5 Pro · History saved to MongoDB</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.05 }} onClick={loadHistory}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all glass hover:border-white/15"
                style={{ color: '#a78bfa' }}>
                <History size={12} /> History
              </motion.button>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#00f5a0' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: '#00f5a0' }} />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                  <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={msg.role === 'assistant'
                      ? { background: 'linear-gradient(135deg, #7b61ff, #00d9f5)' }
                      : { background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                    {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-dark" />}
                  </div>

                  <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                      style={msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, #00f5a0, #00d9f5)', color: '#020510', fontWeight: 500, borderBottomRightRadius: '4px' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#eef2ff', borderBottomLeftRadius: '4px' }
                      }>
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7b61ff, #00d9f5)' }}>
                  <Bot size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: '4px' }}>
                  <Loader2 size={13} className="animate-spin" style={{ color: '#7b61ff' }} />
                  <span className="text-xs text-muted">Gemini is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-3">
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about ASL signs, grammar, Deaf culture..."
                className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder:text-muted outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                disabled={isLoading} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7b61ff, #00d9f5)' }}>
                {isLoading ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Chat History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass rounded-2xl p-5 mt-4" style={{ borderColor: 'rgba(123,97,255,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em', color: '#a78bfa' }}>
                  Saved Chat History
                </h3>
                <div className="flex gap-2">
                  <button onClick={clearHistory}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg glass"
                    style={{ color: '#ef4444' }}>
                    <Trash2 size={11} /> {historyCleared ? 'Cleared!' : 'Clear All'}
                  </button>
                  <button onClick={() => setShowHistory(false)}
                    className="text-xs px-3 py-1.5 rounded-lg glass text-muted hover:text-white">
                    Close
                  </button>
                </div>
              </div>

              {loadingHistory ? (
                <div className="flex items-center gap-2 text-sub text-sm py-4">
                  <Loader2 size={14} className="animate-spin" /> Loading from MongoDB...
                </div>
              ) : savedHistory.length === 0 ? (
                <p className="text-muted text-sm">No history saved yet. Start chatting!</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {savedHistory.map((item, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs text-muted mb-1">{formatDate(item.timestamp)}</p>
                      <p className="text-sm font-medium" style={{ color: '#00f5a0' }}>You: {item.userMessage}</p>
                      <p className="text-xs text-sub mt-1 line-clamp-2">AI: {item.assistantReply}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(123,97,255,0.12)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#7b61ff' }} />
            <h3 className="text-lg" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em', color: '#a78bfa' }}>
              Try Asking
            </h3>
          </div>
          <div className="space-y-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMessage(s)} disabled={isLoading}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-sub transition-all hover:text-white glass hover:border-white/15 disabled:opacity-40">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tech stack badges */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg mb-3" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>Powered By</h3>
          <div className="space-y-2">
            {[
              { name: 'Gemini 1.5 Pro', desc: 'AI responses', color: '#4285f4' },
              { name: 'MongoDB Atlas', desc: 'Chat history saved', color: '#00ed64' },
              { name: 'Clerk', desc: 'Secure auth', color: '#7c3aed' },
            ].map(tech => (
              <div key={tech.name} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tech.color }} />
                <div>
                  <p className="text-xs font-semibold text-white">{tech.name}</p>
                  <p className="text-xs text-muted">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg mb-3" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>I Can Help With</h3>
          <ul className="space-y-2 text-xs text-sub">
            {['🤟 How to sign any word', '📚 ASL grammar & structure',
              '🆘 Emergency phrases', '🌍 Deaf culture & etiquette',
              '🎯 Learning tips & resources', '💬 Fingerspelling guide',
              '⚙️ How to use SignFlowAI'].map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
