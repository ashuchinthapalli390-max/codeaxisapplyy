"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { playIntroPulse, playButtonClick } from "@/lib/audio";
import { Volume2, VolumeX, FastForward, CheckCircle2 } from "lucide-react";
import { isSoundEnabled, toggleSound } from "@/lib/audio";

interface IntroAnimationProps {
  onComplete: () => void;
  onExitStart?: () => void;
}

export default function IntroAnimation({ onComplete, onExitStart }: IntroAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<number>(1);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const finishCalledRef = useRef(false);
  const scrollPositionRef = useRef(0);

  // 1. Mount portal and handle reduced-motion / pre-flight
  useEffect(() => {
    setMounted(true);

    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        handleFinish(true);
        return;
      }
    }

    setSoundOn(isSoundEnabled());
    try {
      playIntroPulse();
    } catch {
      // Audio autoplay might be blocked, continue gracefully
    }

    // Lock page scrolling without jumping page position
    scrollPositionRef.current = window.scrollY;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = "100%";

    // Mark all other elements outside portal as inert/inaccessible
    const rootNodes = Array.from(document.body.children).filter(
      (el) => el !== containerRef.current && !containerRef.current?.contains(el)
    );
    rootNodes.forEach((node) => {
      (node as HTMLElement).setAttribute("aria-hidden", "true");
    });

    // Animation timeline phases
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
    }, 6200);

    // Safe absolute timeout fallback (7.5s) to guarantee the site is never blocked
    const fallbackTimer = setTimeout(() => {
      handleFinish(true);
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(fallbackTimer);

      // Restore scroll and attributes
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollPositionRef.current);

      rootNodes.forEach((node) => {
        (node as HTMLElement).removeAttribute("aria-hidden");
      });
    };
  }, []);

  // 2. Keyboard trap & accessibility
  useEffect(() => {
    if (!mounted || isExiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleFinish();
        return;
      }

      if (e.key === "Tab") {
        if (!containerRef.current) return;
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, isExiting]);

  const handleFinish = (immediate: boolean = false) => {
    if (finishCalledRef.current) return;
    finishCalledRef.current = true;

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("codexa_intro_viewed", "true");
      } catch {
        // sessionStorage might be restricted
      }
    }

    if (onExitStart) {
      onExitStart();
    }

    if (immediate) {
      onComplete();
      return;
    }

    setIsExiting(true);
    // Allow smooth fade-out exit transition (400ms) before unmounting from DOM
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const content = (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="CodeXa Welcome Introduction"
      tabIndex={-1}
      className={`fixed inset-0 z-[999999] w-screen h-screen bg-[#02040a] flex flex-col items-center justify-center overflow-hidden select-none transition-opacity duration-500 ease-in-out ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100dvh",
      }}
    >
      {/* Top Utility Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-30 font-mono text-xs">
        <button
          type="button"
          onClick={handleSoundToggle}
          className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/30 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] focus:outline-none focus:ring-2 focus:ring-red-500"
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
          className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-600/20 text-red-300 hover:bg-red-600/40 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer min-h-[40px] focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <span>SKIP INTRO</span>
          <FastForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spider-tech Central Radial Glow */}
      <div
        className={`absolute w-[450px] h-[450px] rounded-full bg-red-600/15 filter blur-[90px] transition-all duration-1000 pointer-events-none ${
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
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-black border-2 border-red-500/50 p-2 shadow-[0_0_50px_rgba(239,68,68,0.5)] ring-pulse-red flex items-center justify-center overflow-hidden">
            <img src="/logo.jpeg" alt="CodeXa Logo" className="w-full h-full object-contain rounded-2xl" />
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
            className="btn-red-sweep px-8 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl border border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer transition-all animate-bounce min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            ENTER CODEXA &rarr;
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
