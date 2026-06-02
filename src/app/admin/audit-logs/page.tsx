"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetchJson } from "@/components/admin/api";
import { Button } from "@/components/ui/button";

type AuditLogRow = {
  _id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { _id: string; name: string; email: string; role: string } | null;
};

type AuditLogResponse = {
  items: AuditLogRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminAuditLogsPage() {
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryKey = useMemo(() => ["admin-audit-logs", userId, action, startDate, endDate, page], [userId, action, startDate, endDate, page]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      adminFetchJson<AuditLogResponse>(
        `/api/admin/audit-logs?page=${page}&limit=${limit}&userId=${encodeURIComponent(userId)}&action=${encodeURIComponent(action)}&startDate=${startDate}&endDate=${endDate}`,
      ),
    placeholderData: (previous) => previous,
  });

  async function exportCsv() {
    const response = await fetch(
      `/api/admin/audit-logs?format=csv&userId=${encodeURIComponent(userId)}&action=${encodeURIComponent(action)}&startDate=${startDate}&endDate=${endDate}`,
    );
    if (!response.ok) {
      throw new Error("Failed to export CSV.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "audit-logs.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell
      description="Review the most important platform events and export them for compliance or reporting."
      title="Audit Logs"
    >
      <div className="glass-card rounded-3xl p-5">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto]">
          <div className="relative">
            <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <input
              className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 pl-9 pr-3 text-sm outline-none"
              placeholder="Filter by user id"
              value={userId}
              onChange={(event) => {
                setUserId(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="relative">
            <Filter aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <input
              className="h-11 w-full rounded-lg border border-outline-variant/70 bg-white/80 pl-9 pr-3 text-sm outline-none"
              placeholder="Action type"
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <input
            className="h-11 rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
          />
          <input
            className="h-11 rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
          />
          <Button onClick={() => void exportCsv()} size="sm" type="button" variant="secondary">
            <Download aria-hidden className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading audit logs...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load audit logs.</div>
      ) : (
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant/40">
              <thead className="bg-white/50">
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  <th className="px-5 py-4">When</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Entity</th>
                  <th className="px-5 py-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 bg-white/40">
                {query.data?.items.map((row) => (
                  <tr key={row._id}>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">{row.user?.email ?? "System"}</td>
                    <td className="px-5 py-4 text-sm font-medium text-primary">{row.action}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {row.entityType}
                      {row.entityId ? ` #${row.entityId}` : ""}
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      <pre className="max-w-[360px] overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-white/70 p-3 text-xs">
                        {JSON.stringify(row.metadata ?? {}, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-outline-variant/30 px-5 py-4">
            <p className="text-sm text-on-surface-variant">
              Page {query.data?.page ?? 1} of {query.data?.totalPages ?? 1}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={page <= 1 || query.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                size="sm"
                variant="secondary"
                type="button"
              >
                Previous
              </Button>
              <Button
                disabled={page >= (query.data?.totalPages ?? 1) || query.isFetching}
                onClick={() => setPage((current) => current + 1)}
                size="sm"
                variant="secondary"
                type="button"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

