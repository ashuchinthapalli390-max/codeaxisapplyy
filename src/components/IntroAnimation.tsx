"use client";

import React, { useState, useEffect } from "react";
import { playIntroPulse, playButtonClick } from "@/lib/audio";
import { Volume2, VolumeX, FastForward, CheckCircle2 } from "lucide-react";
import { isSoundEnabled, toggleSound } from "@/lib/audio";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<number>(1); // 1: Heartbeat glow -> 2: Web lines -> 3: Logo reveal -> 4: Terminal init -> 5: System Ready
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    playIntroPulse();

    const t1 = setTimeout(() => setPhase(2), 1200);
    const t2 = setTimeout(() => setPhase(3), 2400);
    const t3 = setTimeout(() => {
      setPhase(4);
      setTerminalLines(["> initializing developer network..."]);
    }, 3000);

    const t4 = setTimeout(() => {
      setTerminalLines((prev) => [...prev, "> loading application environment..."]);
    }, 3800);

    const t5 = setTimeout(() => {
      setTerminalLines((prev) => [
        ...prev,
        "✓ system ready",
        "✓ developer network online",
      ]);
      setPhase(5);
    }, 4600);

    const t6 = setTimeout(() => {
      handleFinish();
    }, 6400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("codexa_intro_viewed", "true");
    }
    onComplete();
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#02040a] flex flex-col items-center justify-center overflow-hidden select-none">
      
      {/* Top Utility Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-30 font-mono text-xs">
        <button
          type="button"
          onClick={handleSoundToggle}
          className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/30 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5 text-red-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{soundOn ? "AUDIO ON" : "MUTED"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playButtonClick();
            handleFinish();
          }}
          className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-600/20 text-red-300 hover:bg-red-600/40 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>SKIP INTRO</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spider-tech Central Radial Glow */}
      <div
        className={`absolute w-[450px] h-[450px] rounded-full bg-red-600/15 filter blur-[90px] transition-all duration-1000 ${
          phase >= 1 ? "scale-100 opacity-80" : "scale-50 opacity-0"
        }`}
      />

      {/* Spider-tech Geometric Web Line Canvas Background */}
      <div
        className={`absolute inset-0 spider-grid pointer-events-none transition-opacity duration-1000 ${
          phase >= 2 ? "opacity-60" : "opacity-0"
        }`}
      />

      {/* Main Visual Center Stage */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6 space-y-6">
        
        {/* Logo Container */}
        <div
          className={`relative transition-all duration-700 transform ${
            phase >= 3 ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-red-950/80 to-black border-2 border-red-500/50 p-2 shadow-[0_0_50px_rgba(239,68,68,0.45)] ring-pulse-red flex items-center justify-center">
            <img src="/logo.jpeg" alt="CodeXa Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </div>

        {/* Cinematic Titles */}
        <div
          className={`space-y-2 transition-all duration-700 transform ${
            phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="text-2xl sm:text-4xl font-black font-mono tracking-widest text-white glow-red">
            CODEXA APPLY
          </div>
          <div className="text-xs sm:text-sm font-mono tracking-[0.25em] text-red-400 font-bold uppercase">
            Developer Recruitment Universe
          </div>
        </div>

        {/* Terminal Boot Telemetry */}
        <div
          className={`w-full bg-black/70 border border-red-500/30 rounded-2xl p-4 font-mono text-left text-xs transition-all duration-500 ${
            phase >= 4 ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="flex items-center justify-between border-b border-red-950/60 pb-2 mb-3 text-[10px] text-red-400">
            <span>SYSTEM_BOOT_DAEMON</span>
            <span className="animate-pulse">● INITIALIZING</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300 min-h-[70px]">
            {terminalLines.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 ${
                  line.startsWith("✓") ? "text-emerald-400 font-bold" : "text-red-300"
                }`}
              >
                {line.startsWith("✓") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <span>{line}</span>
              </div>
            ))}
            {phase < 5 && (
              <div className="flex items-center text-red-500">
                <span className="cursor-blink">_</span>
              </div>
            )}
          </div>
        </div>

        {/* Enter Button */}
        {phase >= 5 && (
          <button
            type="button"
            onClick={() => {
              playButtonClick();
              handleFinish();
            }}
            className="btn-red-sweep px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl border border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer transition-all animate-bounce"
          >
            ENTER CODEXA &rarr;
          </button>
        )}

      </div>
    </div>
  );
}
