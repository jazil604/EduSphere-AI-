"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, CheckCircle2, LoaderCircle, PencilLine, Search, Trash2 } from "lucide-react";
import { adminFetchJson } from "@/components/admin/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminUserListItem, AdminUserListResponse } from "@/services/admin.service";

type TabKey = "all" | "students" | "teachers";
type StatusKey = "all" | "active" | "blocked";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All Users" },
  { key: "students", label: "Students" },
  { key: "teachers", label: "Teachers" },
];

export function UserTable() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabKey>("all");
  const [status, setStatus] = useState<StatusKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryKey = useMemo(() => ["admin-users", tab, status, search, page, limit], [tab, status, search, page]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      adminFetchJson<AdminUserListResponse>(
        `/api/admin/users?tab=${tab}&status=${status}&search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
      ),
    placeholderData: (previous) => previous,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; body: Record<string, unknown> }) => {
      const { id, body } = payload;
      return adminFetchJson(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetchJson(`/api/admin/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (payload: { id: string; approved: boolean }) =>
      adminFetchJson(`/api/admin/users/${payload.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved: payload.approved }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] });
    },
  });

  const data = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-3xl p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <Button
                key={item.key}
                onClick={() => {
                  setTab(item.key);
                  setPage(1);
                }}
                size="sm"
                variant={tab === item.key ? "default" : "secondary"}
                type="button"
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative">
              <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
              <Input
                className="min-w-[240px] pl-9"
                placeholder="Search name or email"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="h-11 rounded-lg border border-outline-variant/70 bg-white/80 px-3 text-sm outline-none"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusKey);
                setPage(1);
              }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {query.isLoading ? (
        <div className="glass-card rounded-3xl p-6 text-sm text-on-surface-variant">Loading users...</div>
      ) : query.isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Failed to load users.</div>
      ) : (
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-outline-variant/40">
              <thead className="bg-white/50">
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Profile</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 bg-white/40">
                {data.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-primary">{user.name}</p>
                        <p className="text-sm text-on-surface-variant">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant capitalize">{user.role}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant">
                      {user.role === "student" ? (
                        <div>
                          <p>Level: {user.studentProfile?.skillLevel ?? "n/a"}</p>
                          <p>Points: {user.studentProfile?.totalPoints ?? 0}</p>
                        </div>
                      ) : user.role === "teacher" ? (
                        <div>
                          <p>{user.teacherProfile?.department || "No department"}</p>
                          <p>{user.teacherProfile?.isApproved ? "Approved" : "Pending approval"}</p>
                        </div>
                      ) : (
                        <span>Platform admin</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          user.isActive
                            ? "rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700"
                            : "rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700"
                        }
                      >
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.role === "teacher" ? (
                          user.teacherProfile?.isApproved ? (
                            <Button
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate({ id: user._id, approved: false })}
                              size="sm"
                              variant="secondary"
                              type="button"
                            >
                              <Ban aria-hidden className="size-4" />
                              Reject
                            </Button>
                          ) : (
                            <Button
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate({ id: user._id, approved: true })}
                              size="sm"
                              type="button"
                            >
                              <CheckCircle2 aria-hidden className="size-4" />
                              Approve
                            </Button>
                          )
                        ) : null}

                        <Button
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({
                              id: user._id,
                              body: { isActive: !user.isActive },
                            })
                          }
                          size="sm"
                          variant="secondary"
                          type="button"
                        >
                          <PencilLine aria-hidden className="size-4" />
                          {user.isActive ? "Block" : "Unblock"}
                        </Button>

                        <Button
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(`Delete ${user.name}?`)) {
                              deleteMutation.mutate(user._id);
                            }
                          }}
                          size="sm"
                          variant="secondary"
                          type="button"
                        >
                          <Trash2 aria-hidden className="size-4" />
                          Delete
                        </Button>
                      </div>
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

      {updateMutation.isPending || deleteMutation.isPending || approveMutation.isPending ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <LoaderCircle aria-hidden className="size-4 animate-spin" />
          Updating user data...
        </div>
      ) : null}
    </div>
  );
}
