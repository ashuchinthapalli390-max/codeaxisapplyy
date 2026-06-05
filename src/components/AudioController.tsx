"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getMuted, setMuted, playIntroMusic, stopIntroMusic } from "@/lib/audio";

export default function AudioController() {
  const [muted, setMutedState] = useState(true);

  useEffect(() => {
    const currentMuted = getMuted();
    const timer = setTimeout(() => {
      setMutedState(currentMuted);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
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
    <button
      type="button"
      onClick={handleToggle}
      className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-2xl border border-cyan-500/25 bg-slate-950/70 text-cyan-300 flex items-center justify-center hover:border-cyan-300/60 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.1)] active:scale-95 cursor-pointer"
      aria-label={muted ? "Unmute audio" : "Mute audio"}
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}
