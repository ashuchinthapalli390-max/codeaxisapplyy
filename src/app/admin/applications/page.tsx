"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApplicationData } from "@/types/application";
import { generateApplicantPDF, generateAdminPDF } from "@/lib/pdf";
import { playButtonClick } from "@/lib/audio";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [scoreBandFilter, setScoreBandFilter] = useState("ALL");
  const [commitmentFilter, setCommitmentFilter] = useState("ALL");

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (scoreBandFilter !== "ALL") params.set("scoreBand", scoreBandFilter);
      if (commitmentFilter !== "ALL") params.set("commitment", commitmentFilter);
      params.set("limit", "200");

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
        setTotal(json.total);
      }
    } catch (err) {
      console.error("Fetch apps error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchApps();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, statusFilter, scoreBandFilter, commitmentFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(applications.map((a) => a.reference_id || ""));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (refId: string) => {
    setSelectedIds((prev) =>
      prev.includes(refId) ? prev.filter((id) => id !== refId) : [...prev, refId]
    );
  };

  const handleQuickStatusChange = async (refId: string, newStatus: string) => {
    playButtonClick();
    try {
      const res = await fetch(`/api/admin/applications/${refId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((a) => (a.reference_id === refId ? { ...a, status: newStatus as any } : a))
        );
      }
    } catch {
      alert("Failed to update candidate status.");
    }
  };

  const handleExportBulkCSV = async () => {
    playButtonClick();
    const res = await fetch("/api/admin/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "csv", status: statusFilter !== "ALL" ? statusFilter : undefined }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CodeXa_Candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportBulkJSON = async () => {
    playButtonClick();
    const res = await fetch("/api/admin/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format: "json" }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CodeXa_Applications_Dump_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 text-left font-mono">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            DATABASE CANDIDATE REGISTRY
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Applicant Dossiers ({total})
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchApps}
            className="p-2 rounded-xl bg-black border border-red-950 hover:border-red-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 text-red-400 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportBulkCSV}
            className="px-3.5 py-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportBulkJSON}
            className="px-3.5 py-2 rounded-xl bg-black/60 border border-red-950 hover:border-red-500/40 text-slate-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="red-glass rounded-2xl p-4 border border-red-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, ref, college..."
            className="w-full bg-black/80 border border-red-950/80 focus:border-red-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black/80 border border-red-950/80 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Selected">Selected</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Not Selected">Not Selected</option>
        </select>

        {/* Score Band Filter */}
        <select
          value={scoreBandFilter}
          onChange={(e) => setScoreBandFilter(e.target.value)}
          className="bg-black/80 border border-red-950/80 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Score Bands</option>
          <option value="Exceptional Profile">Exceptional (85–100)</option>
          <option value="Strong Candidate">Strong (75–84)</option>
          <option value="Good Potential">Good (65–74)</option>
          <option value="Needs Review">Needs Review (&lt;65)</option>
        </select>

        {/* Commitment Filter */}
        <select
          value={commitmentFilter}
          onChange={(e) => setCommitmentFilter(e.target.value)}
          className="bg-black/80 border border-red-950/80 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Commitment Levels</option>
          <option value="Strong">Strong (3-4+ hrs)</option>
          <option value="Moderate">Moderate (2-3 hrs)</option>
          <option value="Needs Review">Needs Review (&lt;2 hrs)</option>
        </select>
      </div>

      {/* Bulk Action Bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl flex items-center justify-between text-xs">
          <span className="font-bold text-white">
            {selectedIds.length} candidate(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const app = applications.find((a) => selectedIds.includes(a.reference_id || ""));
                if (app) generateAdminPDF(app);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold"
            >
              DOWNLOAD ADMIN DOSSIER
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="red-glass rounded-3xl p-4 sm:p-6 border border-red-500/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-red-950 text-slate-500 text-[10px]">
                <th className="py-2.5 px-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === applications.length && applications.length > 0}
                    className="accent-red-600 rounded"
                  />
                </th>
                <th className="py-2.5 px-3">REFERENCE</th>
                <th className="py-2.5 px-3">CANDIDATE</th>
                <th className="py-2.5 px-3">COLLEGE / ROLL</th>
                <th className="py-2.5 px-3">SCORE</th>
                <th className="py-2.5 px-3">COMMITMENT</th>
                <th className="py-2.5 px-3">INTEGRITY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/60">
              {applications.map((app) => {
                const isChecked = selectedIds.includes(app.reference_id || "");

                return (
                  <tr key={app.reference_id} className="hover:bg-red-950/15 transition-colors">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(app.reference_id || "")}
                        className="accent-red-600 rounded"
                      />
                    </td>
                    <td className="py-3 px-3 font-bold text-red-400">
                      <Link
                        href={`/admin/applications/${app.reference_id}`}
                        className="hover:underline"
                      >
                        {app.reference_id}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{app.full_name}</div>
                      <div className="text-[10px] text-slate-500">{app.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300 truncate max-w-[160px]">{app.college_name}</div>
                      <div className="text-[10px] text-slate-500">{app.roll_number} ({app.branch})</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-black text-white">{app.total_score || 0}</span>
                      <span className="text-[10px] text-slate-500">/100</span>
                      <div className="text-[9px] text-slate-400">{app.score_band}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          app.commitment_signal === "Strong"
                            ? "bg-emerald-950 text-emerald-400"
                            : app.commitment_signal === "Moderate"
                            ? "bg-amber-950 text-amber-400"
                            : "bg-red-950 text-red-400"
                        }`}
                      >
                        {app.commitment_signal || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[10px] text-slate-300">
                        Pastes: <span className={app.copy_paste_warnings_count > 0 ? "text-amber-400 font-bold" : ""}>{app.copy_paste_warnings_count || 0}</span>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Switches: {app.tab_switch_count || 0}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={app.status || "Submitted"}
                        onChange={(e) => handleQuickStatusChange(app.reference_id || "", e.target.value)}
                        className="bg-black border border-red-950 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Waitlisted">Waitlisted</option>
                        <option value="Not Selected">Not Selected</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <Link
                        href={`/admin/applications/${app.reference_id}`}
                        onClick={playButtonClick}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold inline-flex items-center gap-1"
                      >
                        <span>INSPECT</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {applications.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No matching applications found. Adjust your search or filter queries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
