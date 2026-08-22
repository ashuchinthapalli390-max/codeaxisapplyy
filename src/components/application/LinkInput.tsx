"use client";

import React from "react";
import { Link2 } from "lucide-react";

interface LinkInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  onUrlChange?: (cleanUrl: string) => void;
}

export default function LinkInput({
  label,
  error,
  helperText,
  name,
  value,
  onChange,
  onUrlChange,
  className = "",
  ...props
}: LinkInputProps) {
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text/plain");
    if (text) {
      const cleaned = text.trim();
      // If parent supplied onUrlChange, invoke it with cleaned string
      if (onUrlChange) {
        e.preventDefault();
        onUrlChange(cleaned);
      }
    }
  };

  return (
    <div className="space-y-1.5 font-mono text-left w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={props.id || name} className="text-xs font-bold text-slate-200">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
            URL &bull; PASTE ALLOWED
          </span>
        </div>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-500 pointer-events-none">
          <Link2 className="w-3.5 h-3.5" />
        </div>
        <input
          name={name}
          type="url"
          value={value}
          onChange={onChange}
          onPaste={handlePaste}
          className={`w-full pl-9 pr-4 py-3 bg-black/60 border rounded-xl text-slate-100 text-xs focus:outline-none transition-all placeholder:text-slate-600 ${
            error
              ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              : "border-red-950/80 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
          } ${className}`}
          {...props}
        />
      </div>

      {error && <p className="text-[11px] text-red-400 font-bold">{error}</p>}
      {!error && helperText && <p className="text-[10px] text-slate-500">{helperText}</p>}
    </div>
  );
}
