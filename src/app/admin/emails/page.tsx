"use client";

import React, { useState, useEffect } from "react";
import { EmailTemplate, EmailLog } from "@/types/admin";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button3D from "@/components/ui/Button3D";
import { Mail, CheckCircle2, Save, Send, Clock, XCircle } from "lucide-react";
import { playButtonClick, playSuccessSound } from "@/lib/audio";

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [selectedTmpl, setSelectedTmpl] = useState<EmailTemplate | null>(null);
  const [activeView, setActiveView] = useState<"templates" | "logs">("templates");

  useEffect(() => {
    fetch("/api/admin/emails", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setTemplates(json.data);
          if (json.data.length > 0) setSelectedTmpl(json.data[0]);
        }
      });

    fetch("/api/admin/emails?view=logs", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setLogs(json.data);
      });
  }, []);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTmpl) return;
    playButtonClick();

    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedTmpl),
      });
      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        alert("Template saved successfully.");
      }
    } catch {
      alert("Failed to save template.");
    }
  };

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex items-center justify-between border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            COMMUNICATION DISPATCHER
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Email Center & Resend Automation
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveView("templates")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === "templates"
                ? "bg-red-600 text-white"
                : "bg-black text-slate-400 border border-red-950"
            }`}
          >
            TEMPLATES
          </button>
          <button
            type="button"
            onClick={() => setActiveView("logs")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === "logs"
                ? "bg-red-600 text-white"
                : "bg-black text-slate-400 border border-red-950"
            }`}
          >
            DISPATCH LOGS ({logs.length})
          </button>
        </div>
      </div>

      {activeView === "templates" && selectedTmpl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Template selector pills */}
          <div className="lg:col-span-4 space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  playButtonClick();
                  setSelectedTmpl(t);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                  selectedTmpl.id === t.id
                    ? "bg-red-950/60 border-red-500 text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    : "bg-black/60 border-red-950 text-slate-400 hover:text-white"
                }`}
              >
                <span>{t.templateType}</span>
                <Mail className="w-4 h-4 text-red-400" />
              </button>
            ))}
          </div>

          {/* Template Editor Form */}
          <form
            onSubmit={handleSaveTemplate}
            className="lg:col-span-8 red-glass rounded-3xl p-6 border border-red-500/30 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-red-950 pb-2">
              <span className="text-xs font-bold text-white uppercase">Editing: {selectedTmpl.templateType}</span>
              <span className="text-[10px] text-slate-500">Supports &#123;&#123;name&#125;&#125;, &#123;&#123;reference_id&#125;&#125;</span>
            </div>

            <Input
              label="Subject Line"
              value={selectedTmpl.subject}
              onChange={(e) => setSelectedTmpl({ ...selectedTmpl, subject: e.target.value })}
              required
            />

            <Input
              label="Heading Title"
              value={selectedTmpl.heading}
              onChange={(e) => setSelectedTmpl({ ...selectedTmpl, heading: e.target.value })}
              required
            />

            <Textarea
              label="Email Body Content"
              value={selectedTmpl.body}
              onChange={(e) => setSelectedTmpl({ ...selectedTmpl, body: e.target.value })}
              rows={8}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Primary Button Text"
                value={selectedTmpl.ctaText || ""}
                onChange={(e) => setSelectedTmpl({ ...selectedTmpl, ctaText: e.target.value })}
              />
              <Input
                label="Primary Button Link"
                value={selectedTmpl.ctaLink || ""}
                onChange={(e) => setSelectedTmpl({ ...selectedTmpl, ctaLink: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button3D type="submit" variant="primary" className="py-2.5 px-6 text-xs font-bold">
                <Save className="w-4 h-4" />
                <span>SAVE EMAIL TEMPLATE</span>
              </Button3D>
            </div>
          </form>
        </div>
      )}

      {activeView === "logs" && (
        <div className="red-glass rounded-3xl p-6 border border-red-500/30 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-red-950 text-slate-500 text-[10px]">
                  <th className="py-2.5 px-3">REFERENCE</th>
                  <th className="py-2.5 px-3">RECIPIENT</th>
                  <th className="py-2.5 px-3">TEMPLATE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-950/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-red-950/15">
                    <td className="py-3 px-3 font-bold text-red-400">{log.referenceId}</td>
                    <td className="py-3 px-3">
                      <div className="text-white font-bold">{log.recipientName}</div>
                      <div className="text-[10px] text-slate-500">{log.recipientEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{log.templateType}</td>
                    <td className="py-3 px-3">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
