"use client";

import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  optional?: boolean;
}

export default function Input({
  label,
  error,
  optional = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || (props.name ? `input-${props.name}` : undefined);

  return (
    <div className="flex flex-col space-y-1.5 text-left w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between"
        >
          <span>
            {label} {!optional && <span className="text-red-500">*</span>}
          </span>
          {optional && <span className="text-[10px] text-slate-500 font-normal">OPTIONAL</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-[#05050a]/90 border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none transition-all duration-200 ${
          error
            ? "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] bg-red-950/10"
            : "border-red-950/70 hover:border-red-500/30 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] font-mono text-red-400 font-bold">{error}</span>}
    </div>
  );
}
