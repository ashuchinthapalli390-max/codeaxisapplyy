"use client";

import React, { ButtonHTMLAttributes } from "react";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button3D({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: Button3DProps) {
  const baseStyle =
    "font-mono font-bold tracking-wider rounded-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer border";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 border-cyan-400/30 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:from-blue-700 hover:via-cyan-600 hover:to-cyan-500",
    secondary:
      "bg-slate-950/80 border-cyan-950 text-cyan-400 hover:border-cyan-500/40 hover:bg-slate-950 hover:text-cyan-300",
    danger:
      "bg-red-950/20 border-red-900 text-red-400 hover:border-red-500/50 hover:bg-red-950/40 hover:text-red-350 shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_18px_rgba(239,68,68,0.25)]",
  };

  const sizes = {
    sm: "py-2 px-3 text-[10px]",
    md: "py-3 px-4 text-[11px]",
    lg: "py-4 px-6 text-xs",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
