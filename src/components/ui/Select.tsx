"use client";

import React, { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  optional?: boolean;
}

export default function Select({ label, options, error, optional, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full mb-4 text-left">
      <label className="block text-[11px] font-mono font-semibold tracking-wider text-cyan-400 mb-1.5 uppercase">
        {label} {optional && <span className="text-[9px] text-slate-500 font-normal lowercase">(optional)</span>}
      </label>
      <div className="relative">
        <select
          className={`w-full bg-slate-950/80 border ${
            error ? "border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.25)]" : "border-cyan-950/80 focus:border-cyan-500/50"
          } rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300 appearance-none cursor-pointer ${className}`}
          {...props}
        >
          <option value="" disabled className="bg-slate-950 text-slate-600">
            Select option...
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-500">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <span className="block text-[10px] font-mono text-red-400 mt-1 font-semibold">&gt; {error}</span>}
    </div>
  );
}
