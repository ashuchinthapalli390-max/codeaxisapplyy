"use client";

import React, { useEffect } from "react";
import Button3D from "@/components/ui/Button3D";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App level crash boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#02050e] px-4 font-mono text-center">
      <div className="max-w-md w-full cyber-glass rounded-3xl p-6 border-red-500/40">
        <div className="text-red-500 text-lg font-bold uppercase tracking-wider mb-2">
          &gt; SYSTEM_COMPILE_ERROR
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          The runtime encountered an unhandled exception: {error.message || "Unknown compile flag error."}
        </p>
        <div className="flex justify-center">
          <Button3D variant="danger" onClick={() => reset()} className="py-2.5 px-6">
            HOT_RELOAD_SYSTEM
          </Button3D>
        </div>
      </div>
    </div>
  );
}
