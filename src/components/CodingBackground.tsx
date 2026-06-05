"use client";

import React, { useEffect, useState, useRef } from "react";

interface CodeLine {
  id: number;
  text: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
}

const SNIPPETS = [
  "const [stage, setStage] = useState('intro');",
  "import { useState, useEffect } from 'react';",
  "await db.applications.create({ data });",
  "npm run dev --port 3000",
  "const score = calculateScore(answers);",
  "return <InteractiveWizard steps={9} />",
  "const ref = `CAX-2026-${index}`;",
  "<div className='cyber-glass shadow-glow'>",
  "const conn = await mysql.createConnection(url);",
  "export default function Portal() {",
  "if (score >= 85) status = 'Auto Selected';",
  "localStorage.setItem('draft', JSON.stringify(form));",
  "const response = await fetch('/api/submit', {",
  "headers: { 'Content-Type': 'application/json' }",
  "success: true, reference_id: 'CAX-2026-103948'",
];

// Seeded pseudo-random so values are stable between SSR and hydration,
// preventing a hydration mismatch and avoiding an unnecessary re-render.
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function buildLines(count: number): CodeLine[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    text: SNIPPETS[Math.floor(seededRandom(i * 3) * SNIPPETS.length)],
    // Spread across three horizontal bands so lines don't cluster
    left: `${(seededRandom(i * 3 + 1) * 80 + 5).toFixed(2)}%`,
    // Stagger delays evenly so the GPU never animates all at once
    delay: `-${(seededRandom(i * 3 + 2) * 20).toFixed(1)}s`,
    duration: `${(seededRandom(i * 3 + 3) * 15 + 20).toFixed(1)}s`,
    size: seededRandom(i * 3 + 4) > 0.5 ? "text-xs" : "text-[10px]",
  }));
}

// Reduced line count for low-end devices detected via deviceMemory / hardwareConcurrency
function getOptimalLineCount(): number {
  if (typeof navigator === "undefined") return 10;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (mem !== undefined && mem <= 2) return 6;
  if (cores <= 2) return 6;
  if (cores <= 4) return 10;
  return 14;
}

export default function CodingBackground() {
  const [lines, setLines] = useState<CodeLine[]>(() => buildLines(10));
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    // Respect the user's OS-level "reduce motion" preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;

    const timer = setTimeout(() => {
      if (!mq.matches) {
        setLines(buildLines(getOptimalLineCount()));
      } else {
        // No floating lines for users who prefer reduced motion
        setLines([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full bg-[#02050e] overflow-hidden -z-10 select-none"
      aria-hidden="true"
    >
      {/* Scanline pattern overlay — single static div, no animation cost */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />

      {/* CRT Vignette */}
      <div className="absolute inset-0 crt-vignette opacity-80 pointer-events-none" />

      {/*
        Radial glow spots.
        Key optimisations:
        - `will-change: transform` promotes each to its own compositor layer so
          the blur is calculated once and cached by the GPU.
        - Smaller size (40% instead of 50%) reduces the blur surface area.
        - Lower opacity so blend modes are cheaper.
      */}
      <div
        className="absolute top-[-8%] left-[-8%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 pointer-events-none"
        style={{ filter: "blur(90px)", willChange: "transform" }}
      />
      <div
        className="absolute bottom-[-8%] right-[-8%] w-[40%] h-[40%] rounded-full bg-blue-950/15 pointer-events-none"
        style={{ filter: "blur(90px)", willChange: "transform" }}
      />
      <div
        className="absolute top-[30%] right-[10%] w-[25%] h-[25%] rounded-full bg-red-950/5 pointer-events-none"
        style={{ filter: "blur(70px)", willChange: "transform" }}
      />

      {/*
        Grid — CSS background-image is composited in a single draw call;
        no extra DOM element cost here.
      */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* VS Code-inspired sidebar decorations */}
      <div className="absolute left-16 top-0 bottom-0 w-[1px] bg-cyan-950/30 hidden md:block" />
      <div className="absolute left-64 top-0 bottom-0 w-[1px] bg-cyan-950/20 hidden md:block" />
      <div className="absolute bottom-40 left-0 right-0 h-[1px] bg-cyan-950/20 hidden md:block" />

      <div className="absolute left-[70px] top-6  w-1.5 h-1.5 rounded-full bg-cyan-500/40 hidden md:block" />
      <div className="absolute left-[70px] top-12 w-1.5 h-1.5 rounded-full bg-red-500/40  hidden md:block" />
      <div className="absolute left-[70px] top-18 w-1.5 h-1.5 rounded-full bg-cyan-500/40 hidden md:block" />

      {/*
        Floating code streams.
        Each element uses:
        - `will-change: transform` → own compositor layer, GPU-accelerated translate
        - Negative animation-delay (negative = starts mid-animation on load, no
          initial delay burst that would cause all 14 to animate simultaneously)
        - `translateZ(0)` forces layer promotion even on older browsers
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`absolute font-mono text-cyan-400/10 code-stream whitespace-nowrap ${line.size}`}
            style={{
              left: line.left,
              top: "100%",
              animationDelay: line.delay,
              animationDuration: line.duration,
              // GPU layer promotion — avoids layout/paint on every frame
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Terminal corner indicators */}
      <div className="absolute top-4 left-4 text-[9px] font-mono text-cyan-600/40">
        SYS_STATUS: ONLINE // AXIS_PORTAL_v2.6
      </div>
      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-cyan-600/40">
        LATENCY: 12ms // LOC: 2026.06.03
      </div>
    </div>
  );
}
