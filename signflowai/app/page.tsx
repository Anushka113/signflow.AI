'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

const words = ['Instant.', 'Human.', 'Powerful.', 'Accessible.'];

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,245,160,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,217,245,0.06) 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,245,160,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,160,0.5) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-dark font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>SF</div>
            <span style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.1em', fontSize: '20px' }}>SignFlowAI</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <button className="text-sm text-sub hover:text-white transition-colors px-4 py-2">Sign In</button>
              </Link>
              <Link href="/sign-up">
                <button className="text-sm font-semibold px-5 py-2 rounded-lg text-dark transition-all hover:opacity-90 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                  Get Started Free
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="text-sm font-semibold px-5 py-2 rounded-lg text-dark transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                  Dashboard →
                </button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase"
            style={{ background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)', color: '#00f5a0' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" style={{ background: '#00f5a0' }}></span>
            AI-Powered Sign Language Platform
          </div>

          <h1 className="text-[clamp(60px,12vw,160px)] leading-[0.9] mb-6 tracking-tight"
            style={{ fontFamily: 'Bebas Neue' }}>
            <span className="block text-white">SIGN</span>
            <span className="block gradient-text">FLOW</span>
            <span className="block text-white/20">AI</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-xl text-sub font-light">Communication that's</span>
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xl font-bold gradient-text"
            >
              {words[wordIndex]}
            </motion.span>
          </div>

          <p className="text-sub max-w-2xl mx-auto text-lg leading-relaxed mb-12">
            SignFlowAI bridges the gap between Deaf and hearing communities using real-time ASL detection,
            speech-to-sign translation, and an AI assistant — all in one beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <SignedOut>
              <Link href="/sign-up">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-xl text-dark font-bold text-lg glow-brand transition-all"
                  style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                  Start for Free →
                </motion.button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-xl text-dark font-bold text-lg glow-brand transition-all"
                  style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                  Go to Dashboard →
                </motion.button>
              </Link>
            </SignedIn>
            <a href="#features">
              <button className="px-8 py-4 rounded-xl text-sub font-semibold text-lg transition-all hover:text-white glass">
                See Features ↓
              </button>
            </a>
          </div>
        </motion.div>

        {/* Floating stats */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-2xl w-full">
          {[
            { num: '18+', label: 'ASL Signs' },
            { num: 'Real-Time', label: 'Detection' },
            { num: 'GPT-4', label: 'Powered AI' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-black gradient-text mb-1" style={{ fontFamily: 'Bebas Neue', fontSize: '36px' }}>{s.num}</div>
              <div className="text-xs text-muted uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl mb-4" style={{ fontFamily: 'Bebas Neue' }}>
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-sub text-lg max-w-xl mx-auto">Four powerful tools, one seamless platform designed for real human connection.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: '👁️',
                title: 'ASL → Speech',
                desc: 'Point your webcam and sign. Our Roboflow YOLOv8 model detects 18+ ASL words in real time, translates them into natural sentences via GPT, and speaks them aloud.',
                tag: 'Live Detection',
                color: '#00f5a0',
              },
              {
                icon: '🎙️',
                title: 'Speech → Sign',
                desc: 'Speak naturally and watch your words instantly transform into sign language icons. Perfect for hearing people communicating with Deaf individuals.',
                tag: 'Voice Powered',
                color: '#00d9f5',
              },
              {
                icon: '🤖',
                title: 'AI Chatbot',
                desc: 'Ask anything about ASL — how to sign a word, emergency phrases, or communication tips. Powered by GPT-4 with accessibility-focused responses.',
                tag: 'GPT-4',
                color: '#7b61ff',
              },
              {
                icon: '🔊',
                title: 'Text to Speech',
                desc: 'Translated ASL sentences are automatically converted to natural-sounding audio using OpenAI\'s TTS Nova voice, so spoken responses feel human.',
                tag: 'Auto Audio',
                color: '#f59e0b',
              },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass rounded-2xl p-8 hover:border-white/15 transition-all group"
                style={{ borderColor: `${f.color}15` }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl" style={{ fontFamily: 'Bebas Neue', color: f.color }}>{f.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}30` }}>{f.tag}</span>
                </div>
                <p className="text-sub leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <div className="glass rounded-3xl max-w-3xl mx-auto p-16" style={{ borderColor: 'rgba(0,245,160,0.15)' }}>
          <h2 className="text-6xl mb-6" style={{ fontFamily: 'Bebas Neue' }}>
            Ready to <span className="gradient-text">Connect?</span>
          </h2>
          <p className="text-sub text-lg mb-10">Join SignFlowAI and start breaking the sign language barrier today.</p>
          <SignedOut>
            <Link href="/sign-up">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="px-10 py-5 rounded-xl text-dark font-bold text-xl glow-brand"
                style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                Create Free Account →
              </motion.button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.05 }}
                className="px-10 py-5 rounded-xl text-dark font-bold text-xl glow-brand"
                style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                Open Dashboard →
              </motion.button>
            </Link>
          </SignedIn>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-muted text-sm">
        © 2024 SignFlowAI — Breaking barriers, one sign at a time.
      </footer>
    </div>
  );
}
