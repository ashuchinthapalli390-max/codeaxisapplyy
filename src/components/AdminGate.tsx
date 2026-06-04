"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button3D from "@/components/ui/Button3D";
import { KeyRound, ShieldAlert } from "lucide-react";

interface AdminGateProps {
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export default function AdminGate({ onSuccess, onCancel }: AdminGateProps) {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setError("Please enter the access key.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/verify-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passkey }),
      });

      const result = await response.json();

      if (result.success && result.token) {
        onSuccess(result.token);
      } else {
        setError(result.error || "Access Declined. Invalid access key.");
      }
    } catch (err) {
      console.error("Passkey verification error:", err);
      setError("Declined. Connection issue.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen px-4 py-8">
      <div className="w-full max-w-md mx-auto cyber-glass rounded-3xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Top design trim */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        <div className="absolute top-3 left-4 text-[9px] font-mono text-red-500/40">SYS_AUTH</div>
        <div className="absolute top-3 right-4 text-[9px] font-mono text-red-500/40">RESTRICTED_ZONE</div>

        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/35 flex items-center justify-center mb-6 mt-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <KeyRound className="w-8 h-8 text-red-400" />
        </div>

        {/* Heading */}
        <h2 className="text-lg font-bold tracking-tight text-white mb-2 font-mono uppercase">
          Admin Authorization
        </h2>
        <p className="text-[10px] text-slate-400 font-mono mb-6">
          Enter credentials to unlock applicant console.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          <Input
            label="Admin Passkey"
            name="passkey"
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="••••••••••••••"
            required
            autoComplete="current-password"
            className="text-center tracking-widest text-base"
          />

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-500/40 text-red-400 text-[10px] font-mono rounded-xl leading-normal text-left flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <Button3D
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
              disabled={isVerifying}
            >
              CANCEL
            </Button3D>
            
            <Button3D
              type="submit"
              variant="danger"
              className="flex-[2]"
              disabled={isVerifying}
            >
              {isVerifying ? "VERIFYING..." : "UNLOCK ACCESS"}
            </Button3D>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-[9px] font-mono text-slate-650 opacity-40">
          SECURE ENCRYPTED AUTHENTICATION v1.2
        </div>
      </div>
    </div>
  );
}
