"use client";

import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  optional?: boolean;
  allowClipboard?: boolean;
  onClipboardViolation?: () => void;
  "data-allow-paste"?: string | boolean;
  "data-clipboard-restricted"?: string | boolean;
}

export default function Input({
  label,
  error,
  optional = false,
  allowClipboard,
  onClipboardViolation,
  onCopy,
  onCut,
  onPaste,
  className = "",
  id,
  type = "text",
  name,
  ...props
}: InputProps) {
  const inputId = id || (name ? `input-${name}` : undefined);
  
  // By default, ALL inputs allow copy, cut, and paste freely.
  // Restrictions apply ONLY if explicitly marked with data-clipboard-restricted="true"
  // and NOT marked with data-allow-paste="true".
  const isExplicitlyRestricted =
    (props["data-clipboard-restricted"] === "true" || props["data-clipboard-restricted"] === true) &&
    props["data-allow-paste"] !== "true" &&
    props["data-allow-paste"] !== true;

  const isClipboardAllowed = allowClipboard !== undefined ? allowClipboard : !isExplicitlyRestricted;

  const handleCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isClipboardAllowed) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onCopy?.(e);
  };

  const handleCut = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isClipboardAllowed) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onCut?.(e);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isClipboardAllowed) {
      e.preventDefault();
      onClipboardViolation?.();
    }
    onPaste?.(e);
  };

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
          <div className="flex items-center gap-2">
            {optional && <span className="text-[10px] text-slate-500 font-normal">OPTIONAL</span>}
          </div>
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        data-allow-paste={props["data-allow-paste"] ?? "true"}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
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
