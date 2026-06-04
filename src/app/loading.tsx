import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#02050e] font-mono text-cyan-400">
      <div className="space-y-3 text-center">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        <div className="text-xs tracking-widest uppercase">LOADING_SYSTEM_RESOURCES...</div>
      </div>
    </div>
  );
}
