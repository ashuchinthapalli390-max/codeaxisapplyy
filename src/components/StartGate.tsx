"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Zap } from "lucide-react";
import Button3D from "@/components/ui/Button3D";

import { getMuted, setMuted, playIntroMusic, stopIntroMusic, playButtonClick } from "@/lib/audio";

interface StartGateProps {
  onStart: () => void;
}

export default function StartGate({ onStart }: StartGateProps) {
  const [muted, setMutedState] = useState(() => getMuted());

  const toggleMuted = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setMutedState(nextMuted);
    if (nextMuted) {
      stopIntroMusic();
    } else {
      playIntroMusic();
    }
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#02040a] flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 start-gate-grid opacity-70 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 cyber-grid-floor pointer-events-none opacity-60" />

      <div className="relative w-full max-w-md start-gate-card rounded-3xl p-6 text-center">
        <button
          type="button"
          onClick={toggleMuted}
          className="absolute top-4 right-4 w-10 h-10 rounded-2xl border border-cyan-500/25 bg-slate-950/70 text-cyan-300 flex items-center justify-center hover:border-cyan-300/60 hover:text-white transition-colors cursor-pointer"
          aria-label={muted ? "Unmute intro audio" : "Mute intro audio"}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="mx-auto mb-5 w-24 h-24 rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-2 shadow-[0_0_35px_rgba(0,240,255,0.22)]">
          <img src="/logo.jpeg" alt="CodeXa Agency logo" className="w-full h-full object-contain rounded-2xl" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-950/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-cyan-300">
          <Zap className="w-3.5 h-3.5" />
          CodeXa Core Boot
        </div>

        <h1 className="mt-5 text-3xl md:text-4xl font-black font-mono uppercase tracking-wide text-white">
          CodeXa Agency
        </h1>
        <p className="mt-2 text-xs font-mono uppercase tracking-[0.18em] text-cyan-300">
          Developer Internship Portal
        </p>
        <p className="mt-4 text-xs leading-relaxed text-slate-400 font-mono">
          Tap to initialize the cinematic intro, unlock the application console, and enter the CodeXa digital system.
        </p>

        <Button3D
          type="button"
          variant="primary"
          onClick={() => {
            playButtonClick();
            playIntroMusic();
            onStart();
          }}
          className="mt-7 w-full py-4 text-xs uppercase tracking-[0.18em] rounded-2xl premium-button-depth"
        >
          <span>Tap to Start Experience</span>
        </Button3D>

        <div className="mt-5 grid grid-cols-3 gap-2 text-[9px] font-mono uppercase tracking-wider text-cyan-500/70">
          <span className="rounded-xl border border-cyan-950/70 bg-slate-950/40 py-2">AI</span>
          <span className="rounded-xl border border-cyan-950/70 bg-slate-950/40 py-2">Build</span>
          <span className="rounded-xl border border-cyan-950/70 bg-slate-950/40 py-2">Deploy</span>
        </div>
      </div>
    </section>
  );
}
