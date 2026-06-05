"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Button3D from "@/components/ui/Button3D";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { ApplicationData } from "@/types/application";
import { generateReceiptPdf } from "@/lib/pdf";
import { exportToCsv } from "@/lib/csv";
import { exportToJson } from "@/lib/jsonExport";
import { 
  Search, Filter, Download, Trash2, Edit3, Clipboard, 
  ExternalLink, FileText, CheckCircle, RefreshCw, LogOut, Info, RotateCcw
} from "lucide-react";

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Tabs and Pagination
  const [viewTab, setViewTab] = useState<"active" | "trash">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [autoStatusFilter, setAutoStatusFilter] = useState("");
  const [manualStatusFilter, setManualStatusFilter] = useState("");
  const [scoreRange, setScoreRange] = useState("");
  const [duplicateFilter, setDuplicateFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // all | today

  // Stats Counters
  const [stats, setStats] = useState({
    totalApplications: 0,
    trashCount: 0,
    todayApplications: 0,
    autoSelected: 0,
    strongShortlist: 0,
    pendingReview: 0,
    lowPriority: 0,
    rejected: 0,
    duplicateWarnings: 0,
    highestScore: 0
  });

  // Selected applicant details
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [manualStatus, setManualStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Debounce search query to optimize server load
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [debouncedSearch, autoStatusFilter, manualStatusFilter, scoreRange, duplicateFilter, dateFilter, viewTab]);

  // Load applications server-side
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
        search: debouncedSearch.trim(),
        autoStatus: autoStatusFilter || "all",
        manualStatus: manualStatusFilter || "all",
        is_deleted: viewTab === "trash" ? "true" : "false"
      });

      const response = await fetch(`/api/admin/applications?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setApplications(result.data.applications || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.total || 0);
        if (result.data.stats) {
          setStats(result.data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, autoStatusFilter, manualStatusFilter, viewTab, token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  // Handle updates
  const handleUpdateStatusAndNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedApp.id,
          manual_status: manualStatus,
          admin_notes: adminNotes,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setIsDetailsOpen(false);
        setSelectedApp(null);
        fetchApplications(); // refresh list & stats
      } else {
        alert(result.error || "Update failed.");
      }
    } catch (err) {
      console.error("Error updating application:", err);
      alert("Update failed. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle soft deletions
  const handleDeleteApp = async (id: number) => {
    if (!confirm("Are you sure you want to move this application to Trash?")) return;
    try {
      const response = await fetch("/api/admin/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        setIsDetailsOpen(false);
        setSelectedApp(null);
        fetchApplications(); // refresh list & stats
      } else {
        alert(result.error || "Deletion failed.");
      }
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Deletion failed. Try again.");
    }
  };

  // Handle restoration of soft-deleted entries
  const handleRestoreApp = async (id: number) => {
    if (!confirm("Are you sure you want to restore this application?")) return;
    try {
      const response = await fetch("/api/admin/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (result.success) {
        setIsDetailsOpen(false);
        setSelectedApp(null);
        fetchApplications(); // refresh list & stats
      } else {
        alert(result.error || "Restoration failed.");
      }
    } catch (err) {
      console.error("Error restoring application:", err);
      alert("Restoration failed. Try again.");
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  // Fetch all filtered records helper for batch exports
  const fetchAllMatchingForExport = async (): Promise<ApplicationData[]> => {
    try {
      const queryParams = new URLSearchParams({
        page: "1",
        limit: "10000", // fetch all matching without pagination limit
        search: debouncedSearch.trim(),
        autoStatus: autoStatusFilter || "all",
        manualStatus: manualStatusFilter || "all",
        is_deleted: viewTab === "trash" ? "true" : "false"
      });

      const response = await fetch(`/api/admin/applications?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success && result.data?.applications) {
        return result.data.applications;
      }
    } catch (err) {
      console.error("Error compiling export:", err);
    }
    return [];
  };

  // Export CSV
  const handleExportCsv = async () => {
    const list = await fetchAllMatchingForExport();
    if (list.length === 0) {
      alert("No matching records found to export.");
      return;
    }
    const csvContent = exportToCsv(list);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CodeAxis-Applicants-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJson = async () => {
    const list = await fetchAllMatchingForExport();
    if (list.length === 0) {
      alert("No matching records found to export.");
      return;
    }
    const jsonContent = exportToJson(list);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CodeAxis-Applicants-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export selected/all PDFs
  const handleDownloadAllReceipts = async () => {
    const list = await fetchAllMatchingForExport();
    if (list.length === 0) {
      alert("No applicants found to generate PDFs.");
      return;
    }
    if (list.length > 15 && !confirm(`Generate ${list.length} PDF receipts? Your browser will trigger multiple downloads.`)) {
      return;
    }
    list.forEach((app, idx) => {
      setTimeout(() => {
        generateReceiptPdf(app);
      }, idx * 650); // Debounce to prevent browser crash
    });
  };

  // Open details modal
  const openDetails = (app: ApplicationData) => {
    setSelectedApp(app);
    setManualStatus(app.manual_status || "Pending");
    setAdminNotes(app.admin_notes || "");
    setIsDetailsOpen(true);
  };

  // Score filtering helper (since score matching is simpler on frontend)
  const scoreFilteredApps = applications.filter((app) => {
    let matchesScore = true;
    const score = app.total_score || 0;
    if (scoreRange === "85-100") matchesScore = score >= 85;
    else if (scoreRange === "70-84") matchesScore = score >= 70 && score < 85;
    else if (scoreRange === "55-69") matchesScore = score >= 55 && score < 70;
    else if (scoreRange === "0-54") matchesScore = score < 55;

    let matchesDuplicate = true;
    if (duplicateFilter === "Yes" && !app.duplicate_warning) matchesDuplicate = false;
    if (duplicateFilter === "No" && app.duplicate_warning) matchesDuplicate = false;

    let matchesDate = true;
    if (dateFilter === "today" && app.created_at) {
      const todayStr = new Date().toDateString();
      matchesDate = new Date(app.created_at).toDateString() === todayStr;
    }

    return matchesScore && matchesDuplicate && matchesDate;
  });

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 p-4 font-mono pb-20 select-none">
      
      {/* Dashboard Header */}
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between border-b border-cyan-950/60 pb-4 mb-6 space-y-3 md:space-y-0">
        <div>
          <h1 className="text-lg font-bold tracking-wider text-cyan-400 flex items-center space-x-2">
            <span>CODEAXIS APPLICANT ADMINISTRATIVE COCKPIT</span>
          </h1>
          <span className="text-[10px] text-slate-500">AUTHORIZED DB ACCESS ZONE</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button3D variant="secondary" size="sm" onClick={fetchApplications} disabled={loading} className="py-2.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">REFRESH</span>
          </Button3D>
          <Button3D variant="danger" size="sm" onClick={onLogout} className="py-2.5">
            <LogOut className="w-3.5 h-3.5" />
            <span>LOCK</span>
          </Button3D>
        </div>
      </div>

      {/* 3D Metrics Cards Grid */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
        {[
          { label: "ACTIVE", val: stats.totalApplications, color: "text-white border-cyan-950/60" },
          { label: "AUTO_SEL", val: stats.autoSelected, color: "text-emerald-400 border-emerald-950/60 bg-emerald-950/5" },
          { label: "STRONG_SL", val: stats.strongShortlist, color: "text-cyan-400 border-cyan-950/60 bg-cyan-950/5" },
          { label: "PENDING_RV", val: stats.pendingReview, color: "text-amber-400 border-amber-950/60 bg-amber-950/5" },
          { label: "LOW_PRI", val: stats.lowPriority, color: "text-slate-400 border-slate-900 bg-slate-950/10" },
          { label: "REJECTED", val: stats.rejected, color: "text-red-400 border-red-950/60 bg-red-950/5" },
          { label: "DUPL_WARN", val: stats.duplicateWarnings, color: stats.duplicateWarnings > 0 ? "text-rose-500 border-rose-950/80 bg-rose-950/10 shadow-[0_0_10px_rgba(244,63,94,0.1)]" : "text-slate-550 border-slate-950" },
          { label: "TRASH", val: stats.trashCount, color: stats.trashCount > 0 ? "text-rose-400 border-rose-950 bg-rose-950/10" : "text-slate-550 border-slate-950" },
          { label: "HIGH_SCR", val: stats.highestScore, color: "text-cyan-300 border-cyan-850/50" },
        ].map((card, i) => (
          <div key={i} className={`p-3.5 stat-card-3d flex flex-col justify-between text-center ${card.color}`}>
            <span className="text-[8.5px] text-slate-500 tracking-wider font-semibold uppercase">{card.label}</span>
            <span className="text-xl font-black mt-1.5">{card.val}</span>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div className="w-full max-w-6xl mx-auto flex space-x-2 mb-4">
        <button
          onClick={() => setViewTab("active")}
          className={`flex-1 py-3 px-4 rounded-xl border font-mono font-bold tracking-wider text-xs transition-all duration-300 cursor-pointer ${
            viewTab === "active"
              ? "bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "bg-slate-950/50 border-cyan-950/40 text-slate-400 hover:text-slate-350 hover:border-cyan-500/25"
          }`}
        >
          ACTIVE APPLICANTS ({stats.totalApplications})
        </button>
        <button
          onClick={() => setViewTab("trash")}
          className={`flex-1 py-3 px-4 rounded-xl border font-mono font-bold tracking-wider text-xs transition-all duration-300 cursor-pointer ${
            viewTab === "trash"
              ? "bg-rose-950/30 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.12)]"
              : "bg-slate-950/50 border-cyan-950/40 text-slate-400 hover:text-slate-350 hover:border-cyan-500/25"
          }`}
        >
          TRASH BIN ({stats.trashCount})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="w-full max-w-6xl mx-auto cyber-glass rounded-3xl p-5 mb-6 space-y-4">
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-950/80 border border-cyan-950 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
            placeholder="Search applicants by Name, Email, Phone, College, Roll Number, Reference ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          <div>
            <label className="block text-[8px] text-cyan-500 mb-1">AUTO STATUS</label>
            <select
              value={autoStatusFilter}
              onChange={(e) => setAutoStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-950 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Tiers</option>
              <option value="Auto Selected">Auto Selected</option>
              <option value="Strong Shortlist">Strong Shortlist</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Low Priority Review">Low Priority Review</option>
            </select>
          </div>

          <div>
            <label className="block text-[8px] text-cyan-500 mb-1">MANUAL STATUS</label>
            <select
              value={manualStatusFilter}
              onChange={(e) => setManualStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-950 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Selected">Selected</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Duplicate">Duplicate</option>
            </select>
          </div>

          <div>
            <label className="block text-[8px] text-cyan-500 mb-1">SCORE FILTER</label>
            <select
              value={scoreRange}
              onChange={(e) => setScoreRange(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-950 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Scores</option>
              <option value="85-100">85 - 100 (Auto Selected)</option>
              <option value="70-84">70 - 84 (Strong Shortlist)</option>
              <option value="55-69">55 - 69 (Pending Review)</option>
              <option value="0-54">Below 55 (Low Priority)</option>
            </select>
          </div>

          <div>
            <label className="block text-[8px] text-cyan-500 mb-1">DUPLICATES</label>
            <select
              value={duplicateFilter}
              onChange={(e) => setDuplicateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-950 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Entries</option>
              <option value="Yes">Warnings Only</option>
              <option value="No">No Warnings</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[8px] text-cyan-500 mb-1">SUBMIT DATE</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-950 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Time</option>
              <option value="today">Today Only</option>
            </select>
          </div>

        </div>

        {/* Global Exports Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-cyan-950/40">
          <Button3D variant="secondary" size="sm" onClick={handleExportCsv} className="py-2 px-3">
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV ({totalCount})</span>
          </Button3D>
          <Button3D variant="secondary" size="sm" onClick={handleExportJson} className="py-2 px-3">
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT JSON ({totalCount})</span>
          </Button3D>
          <Button3D variant="secondary" size="sm" onClick={handleDownloadAllReceipts} className="py-2 px-3">
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD MATCHING PDFs</span>
          </Button3D>
        </div>

      </div>

      {/* Applicant List Viewport */}
      <div className="w-full max-w-6xl mx-auto">
        {loading ? (
          <div className="cyber-glass rounded-3xl p-12 text-center text-cyan-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
            <span>DECRYPTING SERVER APPLICATION RECORDS...</span>
          </div>
        ) : scoreFilteredApps.length === 0 ? (
          <div className="cyber-glass rounded-3xl p-12 text-center text-slate-500">
            <Info className="w-8 h-8 mx-auto mb-3 text-slate-600" />
            <span>NO APPLICATIONS MATCH THE CURRENT CRITERIA</span>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto cyber-glass rounded-3xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-cyan-950/60 text-cyan-400">
                    <th className="p-4 font-bold tracking-wider">REF ID</th>
                    <th className="p-4 font-bold tracking-wider">FULL NAME</th>
                    <th className="p-4 font-bold tracking-wider">COLLEGE / BRANCH</th>
                    <th className="p-4 font-bold tracking-wider text-center">SCORE</th>
                    <th className="p-4 font-bold tracking-wider text-center">AUTO TIER</th>
                    <th className="p-4 font-bold tracking-wider text-center">STATUS</th>
                    <th className="p-4 font-bold tracking-wider text-center">WARN</th>
                    <th className="p-4 font-bold tracking-wider text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-950/30">
                  {scoreFilteredApps.map((app) => {
                    const isDupe = app.duplicate_warning;
                    return (
                      <tr 
                        key={app.id} 
                        className={`hover:bg-slate-950/45 transition-colors duration-200 cursor-pointer ${
                          isDupe ? "bg-rose-950/5 border-l-2 border-l-rose-500/40" : ""
                        }`}
                        onClick={() => openDetails(app)}
                      >
                        <td className="p-4 font-bold text-white">{app.reference_id}</td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-200 text-xs">{app.full_name}</div>
                          <div className="text-[9px] text-slate-500">{app.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px] truncate text-slate-350">{app.college_name}</div>
                          <div className="text-[9px] text-slate-500">{app.course} - {app.branch}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-cyan-300">{app.total_score}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            app.auto_status === "Auto Selected" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" :
                            app.auto_status === "Strong Shortlist" ? "bg-cyan-950 text-cyan-400 border border-cyan-500/20" :
                            app.auto_status === "Pending Review" ? "bg-amber-950 text-amber-400 border border-amber-500/20" :
                            "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}>
                            {app.auto_status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            app.manual_status === "Selected" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                            app.manual_status === "Shortlisted" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" :
                            app.manual_status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                            app.manual_status === "Duplicate" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" :
                            "bg-slate-950 text-slate-500 border border-cyan-950"
                          }`}>
                            {app.manual_status || "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-rose-500">
                          {isDupe ? "⚠" : "-"}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => openDetails(app)}
                              className="p-1.5 border border-cyan-950 text-cyan-400 hover:border-cyan-500/30 rounded-lg cursor-pointer"
                              title="Details"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => generateReceiptPdf(app)}
                              className="p-1.5 border border-cyan-950 text-cyan-400 hover:border-cyan-500/30 rounded-lg cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {app.is_deleted ? (
                              <button
                                onClick={() => handleRestoreApp(app.id!)}
                                className="p-1.5 border border-cyan-950 text-emerald-400 hover:border-emerald-500/30 rounded-lg cursor-pointer"
                                title="Restore Application"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteApp(app.id!)}
                                className="p-1.5 border border-cyan-950 text-red-400 hover:border-red-500/30 rounded-lg cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card Grid (Optimized for 360px-412px screens) */}
            <div className="block md:hidden space-y-3">
              {scoreFilteredApps.map((app) => {
                const isDupe = app.duplicate_warning;
                return (
                  <div
                    key={app.id}
                    onClick={() => openDetails(app)}
                    className={`cyber-glass rounded-2xl p-4 text-[11px] space-y-3 active:scale-[0.99] transition-transform duration-200 cursor-pointer ${
                      isDupe ? "border-rose-950/80 bg-rose-950/5 shadow-[0_0_10px_rgba(244,63,94,0.05)]" : ""
                    }`}
                  >
                    {/* Header: Ref ID & Duplicate Warn */}
                    <div className="flex justify-between items-center border-b border-cyan-950/40 pb-2">
                      <span className="font-bold text-white text-xs">{app.reference_id}</span>
                      <div className="flex items-center space-x-2">
                        {isDupe && <span className="text-[10px] text-rose-500 font-bold">DUPE ⚠</span>}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </div>

                    {/* Candidate Identity */}
                    <div>
                      <div className="text-white font-bold text-xs">{app.full_name}</div>
                      <div className="text-slate-500 text-[10px] truncate">{app.email}</div>
                      <div className="text-slate-400 mt-1">{app.college_name}</div>
                      <div className="text-slate-500 text-[10px]">{app.course} - {app.branch}</div>
                    </div>

                    {/* Scores & Badges */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-slate-500 mr-1 text-[10px]">Score:</span>
                        <span className="text-cyan-300 font-bold">{app.total_score}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                          app.auto_status === "Auto Selected" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/10" :
                          app.auto_status === "Strong Shortlist" ? "bg-cyan-950 text-cyan-400 border border-cyan-500/10" :
                          app.auto_status === "Pending Review" ? "bg-amber-950 text-amber-400 border border-amber-500/10" :
                          "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}>
                          {app.auto_status?.replace(" Review", "")}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold ${
                          app.manual_status === "Selected" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                          app.manual_status === "Shortlisted" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" :
                          app.manual_status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/25" :
                          app.manual_status === "Duplicate" ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" :
                          "bg-slate-950 text-slate-500 border border-cyan-950"
                        }`}>
                          {app.manual_status || "Pending"}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-slate-950/40 border border-cyan-950/60 p-3 rounded-2xl">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-cyan-950 text-cyan-400 hover:border-cyan-500/30 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[10px] cursor-pointer"
                >
                  &larr; PREVIOUS
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  PAGE {currentPage} OF {totalPages} ({totalCount} MATCHES)
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-cyan-950 text-cyan-400 hover:border-cyan-500/30 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[10px] cursor-pointer"
                >
                  NEXT &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details View Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedApp(null);
        }}
        title={selectedApp ? `Applicant Profile: ${selectedApp.reference_id}` : "Applicant Profile"}
      >
        {selectedApp && (
          <div className="space-y-6 text-left font-mono text-[11px] pb-6">
            
            {/* DUPLICATE WARNING */}
            {selectedApp.duplicate_warning && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/40 text-rose-400 rounded-xl leading-relaxed flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase text-[10px]">Duplicate Registry Warning</div>
                  <div>Reasons: {selectedApp.duplicate_reason}</div>
                </div>
              </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="space-y-2">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Quick Actions</div>
              <div className="grid grid-cols-3 gap-2">
                <Button3D
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(`${selectedApp.full_name}\n${selectedApp.email}\nPhone: ${selectedApp.phone_number}\nWhatsApp: ${selectedApp.whatsapp_number || "Same"}\nDiscord: ${selectedApp.discord_username || "N/A"}`, "Contacts")}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </Button3D>
                <Button3D
                  variant="secondary"
                  size="sm"
                  onClick={() => generateReceiptPdf(selectedApp)}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </Button3D>
                {selectedApp.is_deleted ? (
                  <Button3D
                    variant="primary"
                    size="sm"
                    onClick={() => handleRestoreApp(selectedApp.id!)}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESTORE</span>
                  </Button3D>
                ) : (
                  <Button3D
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteApp(selectedApp.id!)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE</span>
                  </Button3D>
                )}
              </div>
            </div>

            {/* SECTIONS */}
            {/* 1. Scores & Status Editor */}
            <div className="p-4 border border-cyan-950/60 rounded-2xl bg-slate-950/20 space-y-4">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Evaluation & Update</div>
              
              <div className="grid grid-cols-2 gap-2 text-center border-b border-cyan-950/40 pb-3">
                <div className="border border-cyan-950 rounded-xl p-2">
                  <div className="text-[8px] text-slate-500">AUTO STATUS</div>
                  <div className="font-bold text-white text-xs mt-1">{selectedApp.auto_status}</div>
                </div>
                <div className="border border-cyan-950 rounded-xl p-2">
                  <div className="text-[8px] text-slate-500">TOTAL SCORE</div>
                  <div className="font-bold text-cyan-400 text-xs mt-1">{selectedApp.total_score} / 100</div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 border-b border-cyan-950/40 pb-3">
                <div>Mindset Score: <span className="text-white font-bold">{selectedApp.mindset_score} / 45</span></div>
                <div>Coding Aware: <span className="text-white font-bold">{selectedApp.coding_awareness_score} / 35</span></div>
                <div>Profile Comp: <span className="text-white font-bold">{selectedApp.profile_completion_score} / 10</span></div>
                <div>Written Qual: <span className="text-white font-bold">{selectedApp.written_quality_score} / 10</span></div>
              </div>

              {selectedApp.is_deleted ? (
                <div className="p-4 border border-rose-950/60 rounded-2xl bg-rose-950/10 space-y-3 text-center">
                  <div className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">RECORD IN TRASH BIN</div>
                  <p className="text-[10px] text-slate-350 leading-relaxed">
                    This applicant details are currently soft-deleted. No status modifications can be saved until this record is restored.
                  </p>
                  <Button3D
                    variant="primary"
                    onClick={() => handleRestoreApp(selectedApp.id!)}
                    className="w-full py-2.5 text-[11px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESTORE ENTRY NOW</span>
                  </Button3D>
                </div>
              ) : (
                /* Status Update Fields */
                <div className="space-y-3">
                  <Select
                    label="Update Manual Status"
                    name="manual_status"
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                    options={[
                      { value: "Pending", label: "Pending Review" },
                      { value: "Selected", label: "Selected (Auto Selected)" },
                      { value: "Shortlisted", label: "Shortlisted" },
                      { value: "Rejected", label: "Rejected" },
                      { value: "Duplicate", label: "Duplicate Entry" },
                    ]}
                  />
                  
                  <Textarea
                    label="Administrative Notes"
                    name="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Type updates or candidate audit info..."
                  />

                  <Button3D
                    variant="primary"
                    onClick={handleUpdateStatusAndNotes}
                    disabled={updating}
                    className="w-full py-2.5 text-[11px]"
                  >
                    {updating ? "UPDATING CONSOLE..." : "SAVE CONSOLE STATUS"}
                  </Button3D>
                </div>
              )}
            </div>

            {/* 2. Identity Info */}
            <div className="space-y-2 border-t border-cyan-950/40 pt-3">
              <div className="text-[10px] text-cyan-500 font-bold uppercase">Identity & Verification</div>
              <div className="grid grid-cols-2 gap-y-2 text-[10px]">
                <div>Name: <span className="text-white font-bold">{selectedApp.full_name}</span></div>
                <div>DOB: <span className="text-white">{selectedApp.date_of_birth}</span></div>
                <div className="col-span-2">Email: <span className="text-white">{selectedApp.email}</span></div>
                <div>Phone: <span className="text-white">{selectedApp.phone_number}</span></div>
                <div>WhatsApp: <span className="text-white">{selectedApp.whatsapp_number || "Same"}</span></div>
                <div>Discord: <span className="text-white">{selectedApp.discord_username || "N/A"}</span></div>
                <div>City/State: <span className="text-white">{selectedApp.city_state}</span></div>
              </div>
            </div>

            {/* 3. Academic Info */}
            <div className="space-y-2 border-t border-cyan-950/40 pt-3">
              <div className="text-[10px] text-cyan-500 font-bold uppercase">Academic Module</div>
              <div className="grid grid-cols-2 gap-y-2 text-[10px]">
                <div className="col-span-2">College: <span className="text-white">{selectedApp.college_name}</span></div>
                <div>Course: <span className="text-white">{selectedApp.course}</span></div>
                <div>Branch: <span className="text-white">{selectedApp.branch}</span></div>
                <div>Year: <span className="text-white">{selectedApp.academic_year}</span></div>
                <div>Semester: <span className="text-white">{selectedApp.semester}</span></div>
                <div className="col-span-2">Roll Number: <span className="text-white font-bold">{selectedApp.roll_number}</span></div>
              </div>
            </div>

            {/* 4. Coding Profile Presence */}
            <div className="space-y-2 border-t border-cyan-950/40 pt-3">
              <div className="text-[10px] text-cyan-500 font-bold uppercase">Coding Repositories</div>
              <div className="space-y-1 text-[10px] text-cyan-400">
                {selectedApp.github_link && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500">GitHub:</span>
                    <a href={selectedApp.github_link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center shrink-0">
                      <span>{selectedApp.github_link}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1 shrink-0" />
                    </a>
                  </div>
                )}
                {selectedApp.portfolio_link && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500">Portfolio:</span>
                    <a href={selectedApp.portfolio_link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center shrink-0">
                      <span>{selectedApp.portfolio_link}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1 shrink-0" />
                    </a>
                  </div>
                )}
                {selectedApp.linkedin_link && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500">LinkedIn:</span>
                    <a href={selectedApp.linkedin_link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center shrink-0">
                      <span>{selectedApp.linkedin_link}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-1 shrink-0" />
                    </a>
                  </div>
                )}
                {!selectedApp.github_link && !selectedApp.portfolio_link && !selectedApp.linkedin_link && (
                  <div className="text-slate-550">No external developer links provided.</div>
                )}
              </div>
            </div>

            {/* 5. Readiness Scan */}
            <div className="space-y-2 border-t border-cyan-950/40 pt-3">
              <div className="text-[10px] text-cyan-500 font-bold uppercase">Readiness Parameters</div>
              <div className="grid grid-cols-2 gap-y-2 text-[10px]">
                <div>Coding Level: <span className="text-white">{selectedApp.coding_level}</span></div>
                <div>Device Access: <span className="text-white">{selectedApp.device_status}</span></div>
                <div>Daily Hours: <span className="text-white">{selectedApp.daily_availability}</span></div>
                <div>Readiness: <span className="text-white">{selectedApp.module_readiness}</span></div>
                <div className="col-span-2">Exp: <span className="text-white">{selectedApp.project_experience}</span></div>
              </div>
            </div>

            {/* 6. Intent Mapping Written Answers */}
            <div className="space-y-3 border-t border-cyan-950/40 pt-3">
              <div className="text-[10px] text-cyan-500 font-bold uppercase">Intent Mapping Essay Details</div>
              
              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">What do you want to build in future?</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.future_build_goal || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">Why do you want to join CodeAxis / Codexa?</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.join_reason || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">Why should we select you?</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.selection_reason || "N/A"}
                </p>
              </div>
            </div>

            {/* 7. Thought Process Essay Questions */}
            <div className="space-y-3 border-t border-cyan-950/40 pt-3">
              <div className="text-[10px] text-cyan-500 font-bold uppercase">Thought Process Essay Details</div>
              
              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">Failure & Stuck Experience Response:</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.failure_experience_answer || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">AI tools & resources trust response:</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.trust_with_tools_answer || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">Value priority (learning/money/cert):</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.priority_answer || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">Response if not selected:</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.not_selected_answer || "N/A"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-slate-500 text-[10px]">Code works but not understood response:</div>
                <p className="text-slate-200 text-[10px] bg-slate-950/60 p-2.5 border border-cyan-950/40 rounded-xl leading-relaxed">
                  {selectedApp.code_understanding_answer || "N/A"}
                </p>
              </div>
            </div>

            {/* 8. Submitted dates */}
            <div className="text-[9px] text-slate-600 border-t border-cyan-950/40 pt-3">
              RECORD_CREATED_AT: {selectedApp.created_at ? new Date(selectedApp.created_at).toISOString() : "N/A"}<br />
              RECORD_UPDATED_AT: {selectedApp.updated_at ? new Date(selectedApp.updated_at).toISOString() : "N/A"}
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
