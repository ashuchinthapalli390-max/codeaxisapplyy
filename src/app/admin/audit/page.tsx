"use client";

import React, { useState, useEffect } from "react";
import { AdminAuditLog } from "@/types/admin";
import { History, Shield, RefreshCw } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit", { credentials: "include" });
      const json = await res.json();
      if (json.success) setLogs(json.data);
    } catch (err) {
      console.error("Audit error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 text-left font-mono">
      <div className="flex items-center justify-between border-b border-red-950 pb-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
            SECURITY & EVENT MONITORING
          </span>
          <h1 className="text-2xl font-black text-white uppercase">
            Audit Ledger ({logs.length} events)
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-black border border-red-950 text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 text-red-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="red-glass rounded-3xl p-6 border border-red-500/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-red-950 text-slate-500 text-[10px]">
                <th className="py-2.5 px-3">EVENT ACTION</th>
                <th className="py-2.5 px-3">DETAILS</th>
                <th className="py-2.5 px-3">ADMIN USER</th>
                <th className="py-2.5 px-3 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-950/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-red-950/15">
                  <td className="py-3 px-3">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold border border-red-900">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white font-medium">{log.details}</td>
                  <td className="py-3 px-3 text-slate-400">{log.adminUser || "Master Admin"}</td>
                  <td className="py-3 px-3 text-right text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
