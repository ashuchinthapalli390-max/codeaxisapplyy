"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button3D from "@/components/ui/Button3D";
import { Settings, Save, CheckCircle2, MessageCircle, Mail } from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSettings(json.data);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    playButtonClick();

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert("Failed to save settings.");
    }
  };

  if (!settings) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          SYSTEM PREFERENCES
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Onboarding & Global Configurations
        </h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
        
        {/* Onboarding Links */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-950 pb-2">
            1. Candidate Onboarding Links (Sent upon Selection)
          </h3>
          <div className="space-y-3">
            <Input
              label="Private WhatsApp Developer Community Group URL"
              value={settings.whatsappGroupUrl || ""}
              onChange={(e) => setSettings({ ...settings, whatsappGroupUrl: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
            />
            <Input
              label="Official Discord Server Invite Link"
              value={settings.discordInviteUrl || ""}
              onChange={(e) => setSettings({ ...settings, discordInviteUrl: e.target.value })}
              placeholder="https://discord.gg/..."
            />
          </div>
        </div>

        {/* Agency Contacts */}
        <div className="space-y-4 pt-4 border-t border-red-950">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-950 pb-2">
            2. System Notification Routing
          </h3>
          <div className="space-y-3">
            <Input
              label="Founder Admin Alert Email"
              value={settings.founderEmail || "ashuchinthapalli3900@gmail.com"}
              onChange={(e) => setSettings({ ...settings, founderEmail: e.target.value })}
            />
          </div>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button3D type="submit" variant="primary" className="py-3 px-8 text-xs font-bold">
            <Save className="w-4 h-4" />
            <span>SAVE CONFIGURATION</span>
          </Button3D>
        </div>
      </form>
    </div>
  );
}
