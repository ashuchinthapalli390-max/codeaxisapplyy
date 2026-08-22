"use client";

import React from "react";
import { isFieldClipboardAllowed } from "@/lib/integrity";

interface ApplicationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  allowClipboard?: boolean;
  onClipboardViolation?: () => void;
}

export default function ApplicationInput({
  label,
  error,
  helperText,
  name,
  type = "text",
  allowClipboard,
  onClipboardViolation,
  onCopy,
  onCut,
  onPaste,
  className = "",
  ...props
}: ApplicationInputProps) {
  const isAllowed = allowClipboard ?? isFieldClipboardAllowed(name, type);

  const handleCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isAllowed) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onCopy?.(e);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isAllowed) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onCut?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isAllowed) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onPaste?.(e);
  };

  return (
    <div className="space-y-1.5 font-mono text-left w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={props.id || name} className="text-xs font-bold text-slate-200">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
          {isAllowed && (
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              LINK &bull; PASTE ALLOWED
            </span>
          )}
        </div>
      )}

      <input
        name={name}
        type={type}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        className={`w-full px-4 py-3 bg-black/60 border rounded-xl text-slate-100 text-xs focus:outline-none transition-all placeholder:text-slate-600 ${
          error
            ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            : "border-red-950/80 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
        } ${className}`}
        {...props}
      />

      {error && <p className="text-[11px] text-red-400 font-bold">{error}</p>}
      {!error && helperText && <p className="text-[10px] text-slate-500">{helperText}</p>}
    </div>
  );
}
