'use client';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Play, Square, Volume2, Loader2, Trash2, Camera, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ASLToSpeech() {
  const webcamRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recognizedSigns, setRecognizedSigns] = useState<string[]>([]);
  const [translatedSentence, setTranslatedSentence] = useState('');
  const [liveSign, setLiveSign] = useState('');
  const [liveConfidence, setLiveConfidence] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [ttsMode, setTtsMode] = useState<'elevenlabs' | 'browser'>('elevenlabs');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (isCapturing) {
      intervalRef.current = setInterval(captureFrame, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isCapturing]);

  const startCapture = () => {
    if (!cameraReady) { setError('Please wait for the camera to load.'); return; }
    setIsCapturing(true);
    setRecognizedSigns([]);
    setTranslatedSentence('');
    setLiveSign('');
    setAudioUrl('');
    setError('');
  };

  const stopCapture = () => {
    setIsCapturing(false);
    setRecognizedSigns(prev => {
      if (prev.length > 0) {
        setTimeout(() => runTranslation(prev), 100);
      } else {
        setError('No signs detected. Try signing more clearly in good lighting!');
      }
      return prev;
    });
  };

  const captureFrame = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const apiKey = process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY;
    if (!apiKey) {
      setError('Missing NEXT_PUBLIC_ROBOFLOW_API_KEY in .env.local');
      setIsCapturing(false);
      return;
    }

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://detect.roboflow.com/handsspeak/2',
        params: { api_key: apiKey },
        data: imageSrc.split(',')[1],
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const predictions = response.data.predictions;
      if (predictions && predictions.length > 0) {
        const top = predictions[0];
        setLiveSign(top.class);
        setLiveConfidence(Math.round(top.confidence * 100));
        setRecognizedSigns(prev => {
          if (prev[prev.length - 1] === top.class) return prev;
          return [...prev, top.class];
        });
      } else {
        setLiveSign('');
        setLiveConfidence(0);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Invalid Roboflow API key. Check your .env.local file.');
        setIsCapturing(false);
      }
    }
  };

  const runTranslation = (signs: string[]) => {
    setIsTranslating(true);
    const unique = signs.filter((s, i) => signs.indexOf(s) === i);
    const sentence = unique.join(' ');
    const result = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    setTranslatedSentence(result);
    setIsTranslating(false);
    speakWithElevenLabs(result);
  };

  // ElevenLabs TTS — natural human voice
  const speakWithElevenLabs = async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        // Fallback to browser TTS if ElevenLabs fails
        setTtsMode('browser');
        speakBrowser(text);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setTtsMode('elevenlabs');

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      } else {
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => setIsSpeaking(false);
      }
    } catch {
      // Fallback to browser TTS
      setTtsMode('browser');
      speakBrowser(text);
    }
  };

  // Browser TTS fallback — always works, free
  const speakBrowser = (text: string) => {
    if (!('speechSynthesis' in window)) { setIsSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.lang = 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const speakAgain = () => {
    if (translatedSentence) speakWithElevenLabs(translatedSentence);
  };

  const clearAll = () => {
    setRecognizedSigns([]);
    setTranslatedSentence('');
    setLiveSign('');
    setAudioUrl('');
    setError('');
    setIsSpeaking(false);
    window.speechSynthesis?.cancel();
  };

  const supportedSigns = ['I', 'apple', 'can', 'get', 'good', 'have', 'help', 'how', 'like', 'love', 'my', 'no', 'sorry', 'thank-you', 'want', 'yes', 'you', 'your'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">

        {/* Camera card */}
        <div className="glass rounded-2xl p-6" style={{ borderColor: 'rgba(0,245,160,0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Camera size={18} style={{ color: '#00f5a0' }} />
              <h3 className="text-xl" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>Recognition Camera</h3>
            </div>
            <div className="flex items-center gap-2">
              {isCapturing && (
                <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />LIVE
                </span>
              )}
              <span className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(0,245,160,0.08)', color: '#00f5a0', border: '1px solid rgba(0,245,160,0.2)' }}>
                Roboflow YOLOv8
              </span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-card mb-4" style={{ aspectRatio: '16/9' }}>
            <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: 'user' }}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={() => setError('Camera access denied. Click Allow when browser asks!')} />

            {isCapturing && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 right-0 h-0.5 opacity-60"
                  style={{ background: 'linear-gradient(90deg, transparent, #00f5a0, transparent)', animation: 'scan 2s linear infinite' }} />
                {['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r',
                  'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map((cls, i) => (
                  <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: '#00f5a0', borderWidth: '2px' }} />
                ))}
              </div>
            )}

            <AnimatePresence>
              {liveSign && isCapturing && (
                <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-dark font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                  {liveSign} · {liveConfidence}%
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isCapturing ? (
              <button onClick={startCapture}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-dark font-semibold hover:opacity-90 hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>
                <Play size={16} /> Start Signing
              </button>
            ) : (
              <button onClick={stopCapture}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Square size={16} /> Stop & Translate
              </button>
            )}
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sub text-sm glass">
              <Trash2 size={15} /> Clear
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Output cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(123,97,255,0.15)' }}>
            <span className="text-xs px-2 py-1 rounded-full font-semibold mb-3 inline-block"
              style={{ background: 'rgba(123,97,255,0.12)', color: '#7b61ff', border: '1px solid rgba(123,97,255,0.2)' }}>
              Detected Signs
            </span>
            <div className="min-h-[60px] flex flex-wrap gap-2 mt-2">
              {recognizedSigns.length === 0 ? (
                <p className="text-muted text-sm">Signs appear here as you sign...</p>
              ) : recognizedSigns.map((sign, i) => (
                <motion.span key={i} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(123,97,255,0.15)', color: '#a78bfa', border: '1px solid rgba(123,97,255,0.25)' }}>
                  {sign}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(0,217,245,0.12)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(0,217,245,0.1)', color: '#00d9f5', border: '1px solid rgba(0,217,245,0.2)' }}>
                Translation
              </span>
              {translatedSentence && (
                <button onClick={speakAgain}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg"
                  style={{ background: isSpeaking ? 'rgba(0,245,160,0.2)' : 'rgba(0,245,160,0.08)', color: '#00f5a0', border: '1px solid rgba(0,245,160,0.2)' }}>
                  <Volume2 size={11} />
                  {isSpeaking ? 'Speaking...' : ttsMode === 'elevenlabs' ? '🎙 ElevenLabs' : '🔊 Speak Again'}
                </button>
              )}
            </div>
            <div className="min-h-[60px]">
              {isTranslating ? (
                <div className="flex items-center gap-2 text-sub text-sm">
                  <Loader2 size={14} className="animate-spin" /> Building sentence...
                </div>
              ) : translatedSentence ? (
                <div>
                  <p className="text-white font-medium leading-relaxed">{translatedSentence}</p>
                  {audioUrl && ttsMode === 'elevenlabs' && (
                    <div className="mt-3 flex items-center gap-2">
                      <Mic size={12} style={{ color: '#00f5a0' }} />
                      <span className="text-xs text-muted">ElevenLabs voice</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted text-sm">Translation appears after you stop...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg mb-4" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em', color: '#00f5a0' }}>Supported Signs</h3>
          <div className="flex flex-wrap gap-2">
            {supportedSigns.map(sign => (
              <span key={sign} className="text-xs px-2.5 py-1 rounded-lg text-muted"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {sign}
              </span>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
          <h3 className="text-lg mb-3" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em', color: '#f59e0b' }}>💡 Tips</h3>
          <ul className="space-y-2 text-sm text-sub">
            {['Hold each sign steady for 1–2 seconds',
              'Good lighting = better accuracy',
              'Keep your hand centered in frame',
              'ElevenLabs gives natural human voice',
              'Falls back to browser voice if needed'].map((tip, i) => (
              <li key={i} className="flex items-start gap-2"><span style={{ color: '#f59e0b' }}>→</span>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-lg mb-3" style={{ fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>How It Works</h3>
          <ol className="space-y-3 text-sm text-sub">
            {[
              { step: '1', text: 'Camera captures frame every second' },
              { step: '2', text: 'Roboflow YOLOv8 detects your sign' },
              { step: '3', text: 'Signs collected into a sequence' },
              { step: '4', text: 'Smart sentence is built' },
              { step: '5', text: 'ElevenLabs speaks it naturally!' },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-dark flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00f5a0, #00d9f5)' }}>{step}</span>
                {text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
