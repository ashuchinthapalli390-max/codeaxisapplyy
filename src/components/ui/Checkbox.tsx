"use client";

import React, { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  error?: string;
}

export default function Checkbox({
  label,
  error,
  checked,
  className = "",
  id,
  ...props
}: CheckboxProps) {
  const checkboxId = id || (props.name ? `checkbox-${props.name}` : undefined);

  return (
    <div className="flex flex-col space-y-1 text-left">
      <label
        htmlFor={checkboxId}
        className="flex items-start space-x-3 cursor-pointer group"
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
              checked
                ? "bg-gradient-to-r from-red-600 to-rose-600 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                : "bg-[#05050a] border-red-950/80 group-hover:border-red-500/50"
            } ${error ? "border-red-500" : ""}`}
          >
            {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
          </div>
        </div>
        <div className="text-xs font-mono text-slate-300 leading-relaxed group-hover:text-white select-none">
          {label}
        </div>
      </label>
      {error && <span className="text-[10px] font-mono text-red-400 font-bold ml-8">{error}</span>}
    </div>
  );
}
