"use client";

import React, { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  optional?: boolean;
}

export default function Textarea({ label, error, optional, className = "", ...props }: TextareaProps) {
  return (
    <div className="w-full mb-4 text-left">
      <label className="block text-[11px] font-mono font-semibold tracking-wider text-cyan-400 mb-1.5 uppercase">
        {label} {optional && <span className="text-[9px] text-slate-500 font-normal lowercase">(optional)</span>}
      </label>
      <textarea
        className={`w-full bg-slate-950/80 border ${
          error ? "border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]" : "border-cyan-950/80 focus:border-cyan-500/50"
        } rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 min-h-[90px] resize-y ${className}`}
        {...props}
      />
      {error && <span className="block text-[10px] font-mono text-red-400 mt-1 font-semibold">&gt; {error}</span>}
    </div>
  );
}
