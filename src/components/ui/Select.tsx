"use client";

import React, { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  optional?: boolean;
}

export default function Select({
  label,
  options,
  error,
  optional = false,
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id || (props.name ? `select-${props.name}` : undefined);

  return (
    <div className="flex flex-col space-y-1.5 text-left w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between"
        >
          <span>
            {label} {!optional && <span className="text-red-500">*</span>}
          </span>
          {optional && <span className="text-[10px] text-slate-500 font-normal">OPTIONAL</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full bg-[#05050a]/90 border rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none transition-all duration-200 appearance-none cursor-pointer ${
            error
              ? "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] bg-red-950/10"
              : "border-red-950/70 hover:border-red-500/30 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
          } ${className}`}
          {...props}
        >
          <option value="" disabled className="bg-[#05050a] text-slate-500">
            -- Select an option --
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a14] text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-red-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <span className="text-[10px] font-mono text-red-400 font-bold">{error}</span>}
    </div>
  );
}
