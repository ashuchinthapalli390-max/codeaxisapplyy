"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApplicationData } from "@/types/application";
import { generateApplicantPDF, generateAdminPDF } from "@/lib/pdf";
import { playButtonClick, playSuccessSound, playWarningTone } from "@/lib/audio";
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
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Mail,
  Calendar,
  ExternalLink,
  X,
} from "lucide-react";

type ViewMode = "active" | "test" | "trash";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // View state
  const [currentView, setCurrentView] = useState<ViewMode>("active");

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [scoreBandFilter, setScoreBandFilter] = useState("ALL");
  const [commitmentFilter, setCommitmentFilter] = useState("ALL");

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Delete Modals
  const [softDeleteApp, setSoftDeleteApp] = useState<ApplicationData | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [permDeleteApp, setPermDeleteApp] = useState<ApplicationData | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isPermDeleting, setIsPermDeleting] = useState(false);

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("view", currentView);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (scoreBandFilter !== "ALL") params.set("scoreBand", scoreBandFilter);
      if (commitmentFilter !== "ALL") params.set("commitment", commitmentFilter);
      params.set("limit", "200");

      const res = await fetch(`/api/admin/applications?${params.toString()}`, { credentials: "include" });
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
    }, 200);

    // Live polling every 6s, only when no modal is active and page is visible
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible" && !softDeleteApp && !permDeleteApp && selectedIds.length === 0) {
        fetchApps();
      }
    }, 6000);

    const handleFocus = () => {
      if (!softDeleteApp && !permDeleteApp) fetchApps();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearTimeout(delay);
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentView, searchTerm, statusFilter, scoreBandFilter, commitmentFilter]);

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
        credentials: "include",
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

  // Handle Soft Delete Execution
  const handleConfirmSoftDelete = async () => {
    if (!softDeleteApp) return;
    setIsDeleting(true);
    playButtonClick();

    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: softDeleteApp.reference_id || softDeleteApp.id,
          permanent: false,
          reason: deleteReason.trim() || "Admin soft delete",
        }),
      });

      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setApplications((prev) => prev.filter((a) => a.reference_id !== softDeleteApp.reference_id));
        setTotal((prev) => Math.max(0, prev - 1));
        setSoftDeleteApp(null);
        setDeleteReason("");
      } else {
        playWarningTone();
        alert(json.error || "Failed to delete application.");
      }
    } catch {
      playWarningTone();
      alert("Network error deleting application.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Permanent Delete Execution
  const handleConfirmPermDelete = async () => {
    if (!permDeleteApp) return;
    if (deleteConfirmationText.trim() !== "DELETE") {
      playWarningTone();
      alert('Please type "DELETE" to confirm permanent removal.');
      return;
    }

    setIsPermDeleting(true);
    playButtonClick();

    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: permDeleteApp.reference_id || permDeleteApp.id,
          permanent: true,
          confirmation: "DELETE",
        }),
      });

      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setApplications((prev) => prev.filter((a) => a.reference_id !== permDeleteApp.reference_id));
        setTotal((prev) => Math.max(0, prev - 1));
        setPermDeleteApp(null);
        setDeleteConfirmationText("");
      } else {
        playWarningTone();
        alert(json.error || "Failed to permanently delete application.");
      }
    } catch {
      playWarningTone();
      alert("Network error during permanent deletion.");
    } finally {
      setIsPermDeleting(false);
    }
  };

  // Handle Restore Execution
  const handleRestore = async (app: ApplicationData) => {
    playButtonClick();
    try {
      const res = await fetch("/api/admin/restore", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.reference_id || app.id }),
      });

      const json = await res.json();
      if (json.success) {
        playSuccessSound();
        setApplications((prev) => prev.filter((a) => a.reference_id !== app.reference_id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        playWarningTone();
        alert(json.error || "Failed to restore application.");
      }
    } catch {
      playWarningTone();
      alert("Network error restoring application.");
    }
  };

  // Handle Bulk Move to Trash (For Dummy Records)
  const handleBulkMoveToTrash = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Move ${selectedIds.length} selected record(s) to Trash?`)) return;

    setIsBulkDeleting(true);
    playButtonClick();

    try {
      for (const id of selectedIds) {
        await fetch("/api/admin/delete", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, permanent: false, reason: "Bulk moved dummy to Trash" }),
        });
      }
      playSuccessSound();
      setApplications((prev) => prev.filter((a) => !selectedIds.includes(a.reference_id || "")));
      setTotal((prev) => Math.max(0, prev - selectedIds.length));
      setSelectedIds([]);
    } catch {
      alert("Error moving records to Trash.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExportBulkCSV = async () => {
    playButtonClick();
    const res = await fetch("/api/admin/exports", {
      method: "POST",
      credentials: "include",
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
      credentials: "include",
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
            {currentView === "active"
              ? `Active Applications (${total})`
              : currentView === "test"
              ? `Test / Dummy Submissions (${total})`
              : `Trash Bin (${total})`}
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

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-red-950/60 pb-2">
        <button
          type="button"
          onClick={() => {
            playButtonClick();
            setCurrentView("active");
            setSelectedIds([]);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            currentView === "active"
              ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : "bg-black/60 border border-red-950 text-slate-400 hover:text-white"
          }`}
        >
          <span>Active Candidates</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playButtonClick();
            setCurrentView("test");
            setSelectedIds([]);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            currentView === "test"
              ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]"
              : "bg-black/60 border border-red-950 text-amber-400/80 hover:text-amber-300"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Test / Dummy Submissions</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playButtonClick();
            setCurrentView("trash");
            setSelectedIds([]);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            currentView === "trash"
              ? "bg-slate-700 text-white shadow-[0_0_15px_rgba(100,116,139,0.5)]"
              : "bg-black/60 border border-red-950 text-slate-400 hover:text-white"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Trash Bin</span>
        </button>
      </div>

      {/* Contextual Banner for Test View */}
      {currentView === "test" && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Test & Dummy Isolation Active</span>
            <p className="text-amber-200/90 leading-relaxed">
              These records match test patterns or were flagged as test submissions. Real applicant dossiers are completely separated.
              You can review each test entry and safely move selected dummy submissions to Trash.
            </p>
          </div>
        </div>
      )}

      {/* Contextual Banner for Trash View */}
      {currentView === "trash" && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-xs text-slate-300 flex items-start gap-3">
          <Trash2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Trash Bin Storage</span>
            <p className="text-slate-400 leading-relaxed">
              Applications here are excluded from active pipelines and public conversion stats. You can safely restore an application or permanently remove it (with required typing confirmation).
            </p>
          </div>
        </div>
      )}

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
        <div className="p-3 bg-red-950/50 border border-red-500/60 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-white">
            {selectedIds.length} candidate(s) selected
          </span>
          <div className="flex items-center space-x-2">
            {currentView === "test" && (
              <button
                type="button"
                onClick={handleBulkMoveToTrash}
                disabled={isBulkDeleting}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulkDeleting ? "MOVING..." : "MOVE SELECTED TO TRASH"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const app = applications.find((a) => selectedIds.includes(a.reference_id || ""));
                if (app) generateAdminPDF(app);
              }}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold cursor-pointer"
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
                    className="accent-red-600 rounded cursor-pointer"
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
                  <tr key={app.reference_id || app.id} className="hover:bg-red-950/15 transition-colors">
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(app.reference_id || "")}
                        className="accent-red-600 rounded cursor-pointer"
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
                      {currentView === "trash" ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          In Trash
                        </span>
                      ) : (
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
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        
                        {/* Dossier Link */}
                        <Link
                          href={`/admin/applications/${app.reference_id}`}
                          onClick={playButtonClick}
                          className="px-2 py-1 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold inline-flex items-center gap-1"
                          title="View Application Dossier"
                        >
                          <span>INSPECT</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        {/* If in Trash view: Restore & Permanent Delete buttons */}
                        {currentView === "trash" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(app)}
                              className="px-2 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Restore to Active"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>RESTORE</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                playWarningTone();
                                setPermDeleteApp(app);
                                setDeleteConfirmationText("");
                              }}
                              className="px-2 py-1 rounded-lg bg-red-950/80 border border-red-600 text-red-300 hover:bg-red-700 hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Permanently Delete Application"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>DELETE</span>
                            </button>
                          </>
                        ) : (
                          /* Active / Test actions */
                          <>
                            {/* Schedule Interview */}
                            <Link
                              href={`/admin/applications/${app.reference_id}?tab=interview`}
                              onClick={playButtonClick}
                              className="p-1.5 rounded-lg bg-blue-950/50 border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white transition-all"
                              title="Schedule Interview"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </Link>

                            {/* Email */}
                            <Link
                              href={`/admin/emails?to=${encodeURIComponent(app.email)}&ref=${encodeURIComponent(app.reference_id || "")}`}
                              onClick={playButtonClick}
                              className="p-1.5 rounded-lg bg-purple-950/50 border border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white transition-all"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </Link>

                            {/* Offer */}
                            <Link
                              href={`/admin/applications/${app.reference_id}?tab=offer`}
                              onClick={playButtonClick}
                              className="p-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all"
                              title="Generate Offer Letter"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </Link>

                            {/* Resume */}
                            {Boolean((app as any).resume_storage_path || app.resume_url) && (
                              <button
                                type="button"
                                onClick={async () => {
                                  playButtonClick();
                                  try {
                                    const res = await fetch(`/api/admin/applications/${app.reference_id}/resume`, { credentials: "include" });
                                    const json = await res.json();
                                    if (json.success && json.signedUrl) {
                                      window.open(json.signedUrl, "_blank");
                                    } else {
                                      alert(json.error || "Could not generate download link.");
                                    }
                                  } catch {
                                    alert("Network error fetching resume.");
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                                title="Download Resume (Secure Signed URL)"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Soft Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                playWarningTone();
                                setSoftDeleteApp(app);
                                setDeleteReason("");
                              }}
                              className="p-1.5 rounded-lg bg-red-950/60 border border-red-900 text-red-400 hover:bg-red-700 hover:text-white transition-all cursor-pointer"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {applications.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    {currentView === "trash"
                      ? "Trash Bin is empty. No deleted applications."
                      : currentView === "test"
                      ? "No test or dummy submissions identified."
                      : "No matching applications found. Adjust your search or filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: SOFT DELETE APPLICATION (MOVE TO TRASH)
         ========================================================================= */}
      {softDeleteApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0a0505] border border-red-600/60 p-6 space-y-5 text-left shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="flex items-center justify-between border-b border-red-950 pb-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Move Application to Trash
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSoftDeleteApp(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="text-white font-bold">{softDeleteApp.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference ID:</span>
                <span className="text-red-400 font-bold">{softDeleteApp.reference_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{softDeleteApp.email}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Reason for Removal (Optional):
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Duplicate submission, test run, or disqualified profile..."
                rows={3}
                className="w-full rounded-xl bg-black border border-red-950 p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              The application will be removed from the active pipeline and candidate metrics, and moved to Trash where it can be restored if needed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSoftDeleteApp(null)}
                className="px-4 py-2 rounded-xl bg-black border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSoftDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                {isDeleting ? "Moving to Trash..." : "Move to Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PERMANENT DELETE APPLICATION (REQUIRES "DELETE" CONFIRMATION)
         ========================================================================= */}
      {permDeleteApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0d0202] border-2 border-red-600 p-6 space-y-5 text-left shadow-[0_0_60px_rgba(239,68,68,0.5)]">
            <div className="flex items-center justify-between border-b border-red-900/80 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">
                  Permanent Deletion Warning
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPermDeleteApp(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="text-white font-bold">{permDeleteApp.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="text-red-400 font-bold">{permDeleteApp.reference_id}</span>
              </div>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-[11px] text-red-300 leading-relaxed">
              <strong>Irreversible Action:</strong> This will permanently erase this application row, all scheduled interview rounds, offer letters, audit history, and associated evaluation data. It cannot be undone.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Type <span className="text-red-400 font-mono font-black">DELETE</span> to permanently remove this application:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full rounded-xl bg-black border-2 border-red-900 focus:border-red-500 p-3 text-xs text-white placeholder-slate-700 font-mono tracking-widest font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermDeleteApp(null)}
                className="px-4 py-2 rounded-xl bg-black border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermDelete}
                disabled={deleteConfirmationText.trim() !== "DELETE" || isPermDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-950 disabled:text-slate-500 text-white text-xs font-black transition-all shadow-[0_0_20px_rgba(239,68,68,0.7)]"
              >
                {isPermDeleting ? "Permanently Deleting..." : "PERMANENTLY DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
