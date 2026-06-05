"use client";

import React, { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export default function Checkbox({ label, error, className = "", id, checked, onChange, ...props }: CheckboxProps) {
  return (
    <div className={`w-full mb-4 text-left ${className}`}>
      <label 
        htmlFor={id}
        className="flex items-start space-x-3 cursor-pointer select-none font-mono"
      >
        <div className="relative flex items-center mt-0.5">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          {/* Custom Checkbox Frame */}
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${
              checked
                ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)] text-cyan-400"
                : "bg-slate-950 border-cyan-950/80 hover:border-cyan-500/40 text-transparent"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
          </div>
        </div>
        
        {/* Label Text */}
        <span className="text-[11px] leading-relaxed text-slate-300">{label}</span>
      </label>
      {error && <span className="block text-[10px] font-mono text-red-400 mt-1.5 font-semibold pl-8">&gt; {error}</span>}
    </div>
  );
}
