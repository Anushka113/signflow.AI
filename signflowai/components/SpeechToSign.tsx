'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RefreshCw, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Map spoken words to icon filenames in /public/icons/
const signIcons: Record<string, string> = {
  hi: 'hi', hello: 'hi', hey: 'hi',
  love: 'love', loves: 'love',
  you: 'you', your: 'you',
  bathroom: 'bathroom', restroom: 'bathroom',
  dad: 'dad', father: 'dad',
  mother: 'mother', mom: 'mother',
  friend: 'friend', friends: 'friend',
  no: 'no', nah: 'no', nope: 'no',
  yes: 'yes', yeah: 'yes', yep: 'yes',
  please: 'please',
  school: 'school',
  deaf: 'deaf',
  baby: 'baby',
  i: 'I', me: 'I',
  bye: 'bye', goodbye: 'bye',
  good: 'good',
  excuse: 'excuseme', sorry: 'sad',
  help: 'help',
  sleep: 'sleep', tired: 'sleep',
  sad: 'sad', unhappy: 'sad',
};

const quickPhrases = [
  'Hi I love you',
  'Yes please help',
  'No thank you',
  'Goodbye friend',
  'I am sad',
  'Good morning',
  'Help me please',
  'I need sleep',
];

export default function SpeechToSign() {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [supported, setSupported] = useState(true);
  const [currentWord, setCurrentWord] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim = event.results[i][0].transcript;
        }
      }
      if (final) setSpokenText(prev => (prev + ' ' + final).trim());
      if (interim) setCurrentWord(interim);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => { setIsListening(false); setCurrentWord(''); };

    recognitionRef.current = rec;
    return () => rec.stop();
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (!isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentWord('');
    }
  };

  const reset = () => {
    setSpokenText('');
    setCurrentWord('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const setPhrase = (phrase: string) => {
    setSpokenText(phrase);
  };

  // Get matched words
  const matchedWords = spokenText
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.replace(/[^a-z]/g, '') in signIcons)
    .map(w => w.replace(/[^a-z]/g, ''));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Main panel */}
      <div className="lg:col-span-2 space-y-5">

        {/* Voice input card */}
        <div className="glass rounded-2xl p-6" style={{ borderColor: 'rgba(0,217,245,0.12)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Volume2 size={18} style={{ color: '#00d9f5' }} />
              <h3 className="text-xl" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>Voice Input</h3>
            </div>
            {!supported && (
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                Use Chrome for speech support
              </span>
            )}
          </div>

          {/* Big mic button */}
          <div className="flex flex-col items-center py-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              disabled={!supported}
              className="relative w-28 h-28 rounded-full flex items-center justify-center mb-4 transition-all disabled:opacity-40"
              style={isListening
                ? { background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)' }
                : { background: 'linear-gradient(135deg, #00f5a0, #00d9f5)', boxShadow: '0 0 40px rgba(0,245,160,0.3)' }
              }>
              {isListening && (
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: 'rgba(239,68,68,0.5)' }} />
              )}
              {isListening
                ? <MicOff size={36} style={{ color: '#ef4444' }} />
                : <Mic size={36} className="text-dark" />
              }
            </motion.button>

            <p className="text-sub text-sm font-medium">
              {!supported ? 'Not supported — use Chrome or Edge'
                : isListening ? '🔴 Listening... speak now'
                : 'Click to start speaking'}
            </p>

            {currentWord && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-2 text-sm" style={{ color: '#00d9f5' }}>
                Hearing: "{currentWord}"
              </motion.p>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sub text-sm transition-all hover:text-white glass">
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Spoken text display */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-3">Spoken Text</h3>
          <p className="text-white text-lg leading-relaxed min-h-[40px]">
            {spokenText || <span className="text-muted">Your words will appear here...</span>}
          </p>
        </div>

        {/* Sign output */}
        <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(0,245,160,0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>Sign Language Output</h3>
            <span className="text-xs text-muted">{matchedWords.length} sign{matchedWords.length !== 1 ? 's' : ''} matched</span>
          </div>

          {matchedWords.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-5xl mb-3">🤟</div>
              <p className="text-muted text-sm">Speak words like: hi, love, yes, no, help, please, bye...</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {matchedWords.map((word, i) => (
                  <motion.div key={`${word}-${i}`}
                    initial={{ opacity: 0, scale: 0.7, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-xl relative overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Image
                        src={`/icons/${signIcons[word]}.png`}
                        alt={`Sign for ${word}`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#00f5a0' }}>{word}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">

        {/* Quick phrases */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg mb-4" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em', color: '#00d9f5' }}>
            Quick Phrases
          </h3>
          <div className="space-y-2">
            {quickPhrases.map((phrase) => (
              <button key={phrase} onClick={() => setPhrase(phrase)}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-sub transition-all hover:text-white glass hover:border-white/15">
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

        {/* Available signs */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg mb-3" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>Available Sign Words</h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(signIcons).slice(0, 24).map(word => (
              <span key={word} onClick={() => setSpokenText(prev => prev + ' ' + word)}
                className="text-xs px-2 py-1 rounded-lg cursor-pointer transition-all hover:text-brand text-muted"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {word}
              </span>
            ))}
          </div>
          <p className="text-muted text-xs mt-3">Click any word to add it to your text</p>
        </div>
      </div>
    </div>
  );
}
