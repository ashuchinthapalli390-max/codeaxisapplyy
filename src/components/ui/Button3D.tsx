"use client";

import React, { ButtonHTMLAttributes } from "react";

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "accent";
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
    "btn-red-sweep font-mono font-bold tracking-wider rounded-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-red-600 via-rose-600 to-red-500 border-red-400/40 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:from-red-500 hover:via-rose-500 hover:to-red-400",
    secondary:
      "bg-[#050508]/80 border-red-950/80 text-red-400 hover:border-red-500/50 hover:bg-red-950/20 hover:text-white shadow-sm",
    danger:
      "bg-red-950/30 border-red-800 text-red-300 hover:border-red-500 hover:bg-red-900/40 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]",
    ghost:
      "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-red-950/20",
    accent:
      "bg-gradient-to-r from-slate-900 to-black border-red-500/30 text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]",
  };

  const sizes = {
    sm: "py-2 px-3.5 text-[10px]",
    md: "py-3 px-5 text-xs",
    lg: "py-4 px-7 text-sm",
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
