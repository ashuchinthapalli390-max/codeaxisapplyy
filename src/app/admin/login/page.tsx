"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button3D from "@/components/ui/Button3D";
import { Lock, ShieldAlert, Sparkles, Terminal, ArrowLeft } from "lucide-react";
import { playButtonClick, playWarningTone, playSuccessSound } from "@/lib/audio";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    playButtonClick();

    if (!accessKey.trim()) {
      setErrorMsg("Please enter your admin access key.");
      playWarningTone();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });

      const json = await res.json();

      if (json.success) {
        playSuccessSound();
        router.push("/admin/dashboard");
      } else {
        setErrorMsg(json.error || "Authentication failed. Invalid master key.");
        playWarningTone();
      }
    } catch {
      setErrorMsg("Network error communicating with authentication daemon.");
      playWarningTone();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center p-4 font-mono select-none">
      
      {/* Background Ambience */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-red-600/10 filter blur-[90px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        
        {/* Return to Home link */}
        <div className="text-left">
          <Link
            href="/"
            onClick={playButtonClick}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO PUBLIC WEBSITE</span>
          </Link>
        </div>

        {/* Lock Terminal Card */}
        <div className="red-glass rounded-3xl p-8 border border-red-500/40 space-y-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(239,68,68,0.2)]">
          
          <div className="flex items-center space-x-3 border-b border-red-950 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Lock className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-widest uppercase">
                CODEXA ADMIN NETWORK
              </div>
              <div className="text-[10px] text-red-400">SECURED ACCESS GATEWAY</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                MASTER ACCESS KEY *
              </label>
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="ENTER ACCESS KEY"
                className="w-full bg-black/80 border border-red-950/80 focus:border-red-500 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all font-mono"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button3D
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              <span>{isLoading ? "VERIFYING CRYPTO HASH..." : "UNLOCK COMMAND CENTER"}</span>
            </Button3D>
          </form>

          <div className="p-3 rounded-xl bg-black/50 border border-red-950/60 text-[10px] text-slate-500 leading-relaxed">
            Note: All login attempts and IP addresses are recorded in the immutable audit security ledger.
          </div>

        </div>

      </div>
    </div>
  );
}
