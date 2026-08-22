"use client";

import React, { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  optional?: boolean;
  minChars?: number;
  maxChars?: number;
  allowClipboard?: boolean;
  onClipboardViolation?: () => void;
}

export default function Textarea({
  label,
  error,
  optional = false,
  minChars,
  maxChars,
  allowClipboard = false,
  onClipboardViolation,
  onCopy,
  onCut,
  onPaste,
  className = "",
  id,
  name,
  value,
  ...props
}: TextareaProps) {
  const textareaId = id || (name ? `textarea-${name}` : undefined);
  const currentLength = typeof value === "string" ? value.length : 0;

  const handleCopy = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowClipboard) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onCopy?.(e);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowClipboard) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onCut?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowClipboard) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onPaste?.(e);
  };

  return (
    <div className="flex flex-col space-y-1.5 text-left w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={textareaId} className="text-xs font-mono font-bold text-slate-300">
            {label} {!optional && <span className="text-red-500">*</span>}
          </label>
          {(minChars || maxChars) && (
            <span
              className={`text-[10px] font-mono ${
                minChars && currentLength < minChars
                  ? "text-amber-400"
                  : currentLength > (maxChars || 1200)
                  ? "text-red-400 font-bold"
                  : "text-slate-500"
              }`}
            >
              {currentLength} {maxChars ? `/ ${maxChars}` : ""} chars {minChars && currentLength < minChars ? `(min ${minChars})` : ""}
            </span>
          )}
        </div>
      )}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        className={`w-full bg-[#05050a]/90 border rounded-xl p-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none transition-all duration-200 resize-y min-h-[100px] ${
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
