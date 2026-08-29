"use client";

import React, { useState } from "react";
import Button3D from "@/components/ui/Button3D";
import Select from "@/components/ui/Select";
import { Download, FileText, Database, Sparkles } from "lucide-react";
import { playButtonClick } from "@/lib/audio";

export default function AdminExportsPage() {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    playButtonClick();
    setIsExporting(true);

    try {
      const res = await fetch("/api/admin/exports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, status: statusFilter !== "ALL" ? statusFilter : undefined }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CodeXa_Candidates_Export_${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
    } catch {
      alert("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="border-b border-red-950 pb-4">
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
          DATA EXTRACTION & BACKUPS
        </span>
        <h1 className="text-2xl font-black text-white uppercase">
          Export Center
        </h1>
      </div>

      <div className="max-w-xl red-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 space-y-6">
        <div className="space-y-4">
          <Select
            label="Export Format"
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            options={[
              { value: "csv", label: "CSV Spreadsheet (Excel / Google Sheets compatible)" },
              { value: "json", label: "JSON Raw Application Database (Full Data Backup)" },
            ]}
          />

          <Select
            label="Filter Candidate Dataset"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "ALL", label: "All Applicants (Complete Cohort)" },
              { value: "Selected", label: "Selected Candidates Only" },
              { value: "Shortlisted", label: "Shortlisted Candidates Only" },
              { value: "Under Review", label: "Under Review Candidates Only" },
              { value: "Not Selected", label: "Rejected Candidates Only" },
            ]}
          />
        </div>

        <Button3D
          type="button"
          variant="primary"
          disabled={isExporting}
          onClick={handleExport}
          className="w-full py-4 text-xs font-bold"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? "GENERATING EXPORT FILE..." : `DOWNLOAD ${format.toUpperCase()} EXPORT`}</span>
        </Button3D>
      </div>
    </div>
  );
}
