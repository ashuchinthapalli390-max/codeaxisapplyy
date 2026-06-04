"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-md cyber-glass rounded-3xl overflow-hidden relative transform transition-all duration-300 scale-100 flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Top Strip */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500 w-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-950/60 bg-slate-950/45">
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg border border-cyan-950 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-6 max-h-[80vh] overflow-y-auto font-mono text-xs text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
