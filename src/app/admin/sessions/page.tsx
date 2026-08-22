"use client";

import React, { useState, useEffect } from "react";
import { AdminSession } from "@/types/admin";
import { Radio, Trash2, ShieldCheck, Laptop, Smartphone, Monitor, LogOut, CheckCircle2 } from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";
import { useRouter } from "next/navigation";

export default function AdminSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sessions");
      const json = await res.json();
      if (json.success) setSessions(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (token: string) => {
    playButtonClick();
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", token }),
      });
      const json = await res.json();
      if (json.success) {
        fetchSessions();
      }
    } catch {
      alert("Failed to revoke session.");
    }
  };

  const handleLogoutOthers = async () => {
    playButtonClick();
    if (!confirm("Are you sure you want to log out all other devices?")) return;
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_others" }),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        fetchSessions();
      }
    } catch {
      alert("Failed to revoke other sessions.");
    }
  };

  const handleLogoutEverywhere = async () => {
    playButtonClick();
    if (!confirm("Are you sure you want to log out of ALL devices including this one?")) return;
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_all" }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/login");
      }
    } catch {
      alert("Failed to revoke sessions.");
    }
  };

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            SESSION CONCURRENCY & HARDENING
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Active Admin Sessions ({sessions.length})
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleLogoutOthers}
            className="px-3.5 py-2 rounded-xl bg-black border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            LOGOUT ALL OTHER DEVICES
          </button>
          <button
            type="button"
            onClick={handleLogoutEverywhere}
            className="px-3.5 py-2 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 hover:bg-red-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            LOGOUT EVERYWHERE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`red-glass rounded-2xl p-5 border transition-all space-y-3 ${
              s.isCurrent
                ? "border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-black/80"
                : "border-red-500/30"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30">
                  {s.deviceInfo.toLowerCase().includes("android") || s.deviceInfo.toLowerCase().includes("iphone") ? (
                    <Smartphone className="w-5 h-5 text-red-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[160px]">{s.deviceInfo}</div>
                  <div className="text-[10px] text-slate-400">{s.ipAddress}</div>
                </div>
              </div>

              {s.isCurrent && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  THIS DEVICE
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-red-950/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Last active: {new Date(s.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <button
                type="button"
                onClick={() => handleRevokeSession(s.token)}
                className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
              >
                {s.isCurrent ? "LOGOUT" : "TERMINATE"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
