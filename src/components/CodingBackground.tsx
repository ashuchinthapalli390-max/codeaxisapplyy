"use client";

import React, { useEffect, useState } from "react";

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

export default function CodingBackground() {
  const [lines, setLines] = useState<CodeLine[]>([]);

  useEffect(() => {
    // Generate floating code lines
    const generated: CodeLine[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      text: SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)],
      left: `${Math.random() * 80 + 5}%`,
      delay: `${Math.random() * 20}s`,
      duration: `${Math.random() * 15 + 20}s`,
      size: Math.random() > 0.5 ? "text-xs" : "text-[10px]",
    }));
    setLines(generated);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#02050e] overflow-hidden -z-10 select-none">
      {/* Scanline pattern overlay */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />

      {/* CRT Vignette glow */}
      <div className="absolute inset-0 crt-vignette opacity-80 pointer-events-none" />

      {/* Cyber blue/cyan radial glow spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-red-950/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      {/* VS Code Inspired Sidebar Grid Lines */}
      {/* Left Sidebar simulated line */}
      <div className="absolute left-16 top-0 bottom-0 w-[1px] bg-cyan-950/30 hidden md:block" />
      <div className="absolute left-64 top-0 bottom-0 w-[1px] bg-cyan-950/20 hidden md:block" />
      {/* Bottom Terminal panel simulated line */}
      <div className="absolute bottom-40 left-0 right-0 h-[1px] bg-cyan-950/20 hidden md:block" />

      {/* VS Code Layout Accent - Small Red/Cyan squares representing active file statuses */}
      <div className="absolute left-[70px] top-6 w-1.5 h-1.5 rounded-full bg-cyan-500/40 hidden md:block" />
      <div className="absolute left-[70px] top-12 w-1.5 h-1.5 rounded-full bg-red-500/40 hidden md:block" />
      <div className="absolute left-[70px] top-18 w-1.5 h-1.5 rounded-full bg-cyan-500/40 hidden md:block" />

      {/* Floating Code Streams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {lines.map((line) => (
          <div
            key={line.id}
            className={`absolute font-mono text-cyan-400/10 code-stream whitespace-nowrap ${line.size}`}
            style={{
              left: line.left,
              animationDelay: line.delay,
              animationDuration: line.duration,
              top: "100%",
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Cyber terminal corner indicator decorations */}
      <div className="absolute top-4 left-4 text-[9px] font-mono text-cyan-600/40">
        SYS_STATUS: ONLINE // AXIS_PORTAL_v2.6
      </div>
      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-cyan-600/40">
        LATENCY: 12ms // LOC: 2026.06.03
      </div>
    </div>
  );
}
