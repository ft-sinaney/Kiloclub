"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, ShieldCheck } from "lucide-react";
import type { Profile } from "@kiloclub/shared";
import { setUserRole } from "@/lib/actions";
import { formatDate } from "@/lib/format";

export function UsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => !needle || `${u.full_name ?? ""} ${u.email ?? ""}`.toLowerCase().includes(needle));
  }, [users, q]);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-700 p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-500" />
          <input className="input pl-9" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {error && <p className="bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-ink-900 text-left text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 text-right font-medium">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700">
            {rows.map((u) => {
              const isSelf = u.id === currentUserId;
              const isAdmin = u.role === "admin";
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{u.full_name || "—"} {isSelf && <span className="text-xs text-ink-500">(you)</span>}</p>
                    <p className="text-xs text-ink-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-400/15 px-2.5 py-1 text-xs font-semibold text-gold-300">
                        <ShieldCheck className="size-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs text-ink-300">Customer</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && (
                      <button
                        type="button"
                        disabled={pending}
                        className={isAdmin ? "btn-outline px-3 py-1.5 text-xs" : "btn-gold px-3 py-1.5 text-xs"}
                        onClick={() => {
                          const message = isAdmin
                            ? `Remove admin access from ${u.email}?`
                            : `Give ${u.email} full admin access? They'll be able to edit and delete products.`;
                          if (!confirm(message)) return;
                          setError(null);
                          startTransition(async () => {
                            const result = await setUserRole(u.id, isAdmin ? "customer" : "admin");
                            if (!result.ok) setError(result.error);
                          });
                        }}
                      >
                        {isAdmin ? "Remove admin" : "Make admin"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-ink-500">No users found.</p>}
      </div>
    </div>
  );
}
