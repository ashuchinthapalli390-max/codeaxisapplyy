"use client";

import React, { useEffect, useState } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const LOG_MESSAGES = [
  "SYSTEM INIT: SECURE_CHANNEL_READY",
  "LOADING: Identity & Verification Modules...",
  "LOADING: Academic Credentials Verification...",
  "CONNECTING: MySQL Database Pool Server...",
  "LOADING: Mindset Assessment Engine (10 Scenarios)...",
  "LOADING: Coding Awareness Scan Matrices...",
  "COMPILING: Secure API Routes & Token Verification...",
  "AUTOSAVE_DRAFT: Checking local registry...",
  "PORTAL_SECURE: Preparing entry console..."
];

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  // Speed up progress bar over 8 seconds (8000ms)
  useEffect(() => {
    const duration = 8000;
    const intervalTime = 80;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Control terminal logs printing speed
  useEffect(() => {
    if (logIndex < LOG_MESSAGES.length && progress > 0) {
      const triggerPercentage = ((logIndex + 1) / LOG_MESSAGES.length) * 90;
      if (progress >= triggerPercentage) {
        setLogs((prev) => [...prev, LOG_MESSAGES[logIndex]]);
        setLogIndex((prev) => prev + 1);
      }
    }
  }, [progress, logIndex]);

  // Complete and transition when progress hits 100%
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500); // Small pause for UX satisfaction
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-slate-200">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Glow Logo Frame */}
        <div className="relative w-36 h-36 mb-10 rounded-2xl overflow-hidden border border-cyan-500/30 flex items-center justify-center bg-slate-950/80 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
          {/* Logo element */}
          <img 
            src="/logo.jpeg" 
            alt="CodeAxis Logo" 
            className="w-32 h-32 object-contain"
          />
          
          {/* Scanline scanner beam animation */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 opacity-60 shadow-[0_0_8px_#06b6d4] animate-bounce duration-[3000ms] pointer-events-none" />
        </div>

        {/* Console Text Loader */}
        <div className="w-full h-36 font-mono text-[10px] text-cyan-400/80 bg-slate-950/70 border border-cyan-950/50 rounded-lg p-3 overflow-hidden cyber-glass mb-6">
          <div className="flex justify-between items-center text-cyan-500 border-b border-cyan-950/50 pb-1.5 mb-2">
            <span>AXIS_SYSTEM_LOADER</span>
            <span className="animate-pulse">ONLINE</span>
          </div>
          <div className="space-y-1 h-[100px] overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start">
                <span className="text-cyan-600 mr-2">&gt;</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
            {progress < 100 && (
              <div className="flex items-center text-cyan-500/60">
                <span className="text-cyan-600 mr-2">&gt;</span>
                <span className="w-1.5 h-3 bg-cyan-400 inline-block cursor-blink" />
              </div>
            )}
          </div>
        </div>

        {/* Loading Progress Bar Container */}
        <div className="w-full">
          <div className="flex justify-between text-[11px] font-mono text-cyan-400 mb-2">
            <span>COMPILING PORTAL</span>
            <span>{Math.min(100, Math.floor(progress))}%</span>
          </div>
          
          {/* Cyber progress track */}
          <div className="w-full h-2.5 bg-slate-900 border border-cyan-950/50 rounded-full p-0.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-300 rounded-full transition-all ease-out duration-100 shadow-[0_0_8px_#06b6d4]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
