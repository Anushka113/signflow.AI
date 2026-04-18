'use client';

import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import ASLToSpeech from '@/components/ASLToSpeech';
import SpeechToSign from '@/components/SpeechToSign';
import AIChat from '@/components/AIChat';
import Link from 'next/link';

const tabs = [
  { id: 'asl', label: 'ASL → Speech', icon: '👁️', desc: 'Webcam sign detection' },
  { id: 'speech', label: 'Speech → Sign', icon: '🎙️', desc: 'Voice to sign icons' },
  { id: 'chat', label: 'AI Assistant', icon: '🤖', desc: 'Ask anything about ASL' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('asl');
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-dark flex flex-col">

      {/* Fixed ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,245,160,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(0,217,245,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Topbar */}
      <header className="relative z-50 glass border-b border-white/5 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-dark font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>SF</div>
            <span style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.1em', fontSize: '20px' }}>SignFlowAI</span>
          </Link>

          {/* Tab nav - center */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl glass">
            {tabs.map(tab => (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-dark font-semibold'
                    : 'text-sub hover:text-white'
                }`}
                style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' } : {}}>
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">
              Hey, {user?.firstName || 'there'} 👋
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden flex gap-1 p-3 glass border-b border-white/5 relative z-40">
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id ? 'text-dark' : 'text-sub'
            }`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' } : {}}>
            <div>{tab.icon}</div>
            <div>{tab.label.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">

        {/* Section header */}
        <div className="mb-8">
          {tabs.map(tab => tab.id === activeTab && (
            <motion.div key={tab.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-5xl gradient-text" style={{ fontFamily: 'Bebas Neue' }}>{tab.label}</h1>
              <p className="text-sub mt-1">{tab.desc}</p>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            {activeTab === 'asl' && <ASLToSpeech />}
            {activeTab === 'speech' && <SpeechToSign />}
            {activeTab === 'chat' && <AIChat />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
