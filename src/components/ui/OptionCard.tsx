"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  optionKey?: string;
  badge?: string;
}

export default function OptionCard({
  label,
  selected,
  onClick,
  optionKey,
  badge,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-left font-mono transition-all duration-300 flex items-start space-x-3 cursor-pointer relative overflow-hidden ${
        selected
          ? "bg-red-950/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white"
          : "bg-[#05050a]/80 border-red-950/70 text-slate-300 hover:border-red-500/40 hover:bg-red-950/10 hover:text-white"
      }`}
    >
      {optionKey && (
        <div
          className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
            selected
              ? "bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              : "bg-black/60 border-red-950 text-slate-400"
          }`}
        >
          {optionKey}
        </div>
      )}
      <div className="flex-grow space-y-1">
        <div className="text-xs font-semibold leading-relaxed flex items-center justify-between">
          <span>{label}</span>
          {badge && (
            <span className="text-[9px] px-2 py-0.5 rounded bg-red-950/50 text-red-300 border border-red-500/30">
              {badge}
            </span>
          )}
        </div>
      </div>
      {selected && (
        <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
      )}
    </button>
  );
}
