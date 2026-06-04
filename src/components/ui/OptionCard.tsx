"use client";

import React from "react";

interface OptionCardProps {
  letter: string;
  text: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({ letter, text, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border font-mono transition-all duration-300 transform active:scale-[0.99] flex items-center space-x-3 cursor-pointer ${
        selected
          ? "bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          : "bg-slate-950/70 border-cyan-950/70 hover:border-cyan-500/30 text-slate-350 hover:bg-slate-950/90"
      }`}
    >
      {/* Option Letter Indicator */}
      <span
        className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${
          selected
            ? "bg-cyan-400 text-slate-950 shadow-[0_0_8px_#06b6d4]"
            : "bg-slate-900 border border-cyan-950 text-cyan-500"
        }`}
      >
        {letter}
      </span>
      
      {/* Option Text */}
      <span className="text-[11px] leading-relaxed flex-1">{text}</span>
    </button>
  );
}
