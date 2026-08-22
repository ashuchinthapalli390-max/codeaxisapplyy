"use client";

import React from "react";
import { isFieldClipboardAllowed } from "@/lib/integrity";

interface ClipboardGuardProps {
  children: React.ReactNode;
  allowClipboard?: boolean;
  onViolation?: () => void;
  className?: string;
}

/**
 * Protective wrapper for form sections.
 * Automatically intercepts copy/cut/paste on protected inputs within its subtree.
 */
export default function ClipboardGuard({
  children,
  allowClipboard = false,
  onViolation,
  className = "",
}: ClipboardGuardProps) {
  const handleCopy = (e: React.ClipboardEvent) => {
    if (allowClipboard) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      const name = target.getAttribute("name") || "";
      const type = target.getAttribute("type") || "";
      if (isFieldClipboardAllowed(name, type)) return;

      e.preventDefault();
      onViolation?.();
    }
  };

  const handleCut = (e: React.ClipboardEvent) => {
    if (allowClipboard) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      const name = target.getAttribute("name") || "";
      const type = target.getAttribute("type") || "";
      if (isFieldClipboardAllowed(name, type)) return;

      e.preventDefault();
      onViolation?.();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (allowClipboard) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
      const name = target.getAttribute("name") || "";
      const type = target.getAttribute("type") || "";
      if (isFieldClipboardAllowed(name, type)) return;

      e.preventDefault();
      onViolation?.();
    }
  };

  return (
    <div
      onCopy={handleCopy}
      onCut={handleCut}
      onPaste={handlePaste}
      className={className}
    >
      {children}
    </div>
  );
}
