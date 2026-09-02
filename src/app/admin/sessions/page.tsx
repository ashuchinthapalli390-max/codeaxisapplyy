"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Radio,
  Trash2,
  ShieldCheck,
  Laptop,
  Smartphone,
  Monitor,
  LogOut,
  CheckCircle2,
  Clock,
  Calendar,
  Globe,
  AlertCircle,
} from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";

interface SessionItem {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  lastActive: string;
  expiresAt?: string;
  rememberMe?: boolean;
  isCurrent?: boolean;
}

export default function AdminSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sessions", { credentials: "include" });
      const json = await res.json();
      if (json.success && json.data) {
        setSessions(json.data);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string, isCurrent?: boolean) => {
    playButtonClick();
    if (isCurrent) {
      if (!confirm("Are you sure you want to log out of this device?")) return;
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      router.replace("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", sessionId }),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        fetchSessions();
      } else {
        alert(json.error || "Failed to revoke session.");
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
        credentials: "include",
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_all" }),
      });
      const json = await res.json();
      if (json.success) {
        router.replace("/admin/login");
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

        <div className="flex flex-wrap items-center gap-2">
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

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          <Clock className="w-6 h-6 text-red-500 animate-spin mx-auto mb-2" />
          <span>Verifying active device concurrency...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-red-950 rounded-2xl text-xs text-slate-500">
          No active sessions recorded in database ledger.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`red-glass rounded-2xl p-5 border transition-all space-y-3 relative overflow-hidden ${
                s.isCurrent
                  ? "border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)] bg-black/80"
                  : "border-red-500/30 bg-black/60"
              }`}
            >
              {/* Device Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    s.isCurrent
                      ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                      : "bg-red-950/40 border-red-500/30 text-red-400"
                  }`}>
                    {s.deviceInfo.toLowerCase().includes("android") || s.deviceInfo.toLowerCase().includes("iphone") ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Monitor className="w-5 h-5" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{s.deviceInfo}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-500" />
                      <span>{s.ipAddress}</span>
                    </div>
                  </div>
                </div>

                {s.isCurrent && (
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold shrink-0">
                    THIS DEVICE
                  </span>
                )}
              </div>

              {/* Session Duration Badge */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-red-950/60">
                <span className="text-slate-500">Session Mode:</span>
                <span className={`font-bold ${s.rememberMe ? "text-cyan-400" : "text-amber-400"}`}>
                  {s.rememberMe ? "Remember Me (30 Days)" : "Standard (12 Hours)"}
                </span>
              </div>

              {/* Timestamps Matrix */}
              <div className="space-y-1 text-[10px] text-slate-400 bg-black/40 p-2.5 rounded-xl border border-red-950/60">
                <div className="flex justify-between">
                  <span>Logged in:</span>
                  <span className="text-slate-200">{new Date(s.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last active:</span>
                  <span className="text-slate-200">{new Date(s.lastActive).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {s.expiresAt && (
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="text-rose-400">{new Date(s.expiresAt).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(s.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRevokeSession(s.id, s.isCurrent)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    s.isCurrent
                      ? "bg-red-950/60 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white"
                      : "bg-black/60 hover:bg-red-600/40 border border-red-950 hover:border-red-500 text-slate-400 hover:text-white"
                  }`}
                >
                  {s.isCurrent ? "LOGOUT THIS DEVICE" : "REVOKE SESSION"}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
