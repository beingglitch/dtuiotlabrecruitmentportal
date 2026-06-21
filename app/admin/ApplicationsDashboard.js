"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";

const STATUS = ["pending", "shortlisted", "accepted", "rejected"];

const STATUS_TONE = {
  pending: "warn",
  shortlisted: "amber",
  accepted: "ok",
  rejected: "danger",
};

const STATUS_BADGE_CLASS = {
  pending: "badge-pending",
  shortlisted: "badge-pending",
  accepted: "badge-approved",
  rejected: "badge-rejected",
};

export default function ApplicationsDashboard({ initial, projects }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (projectFilter !== "all" && r.projectId !== projectFilter) return false;
      if (!term) return true;
      return [r.fullName, r.email, r.rollNumber, r.branch, r.project?.title]
        .filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [rows, q, statusFilter, projectFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    shortlisted: rows.filter((r) => r.status === "shortlisted").length,
    accepted: rows.filter((r) => r.status === "accepted").length,
  }), [rows]);

  async function setStatus(id, status) {
    setBusy(true);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm("Delete this application permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
    if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
    setBusy(false);
  }

  function exportCSV() {
    const cols = ["fullName","email","phone","rollNumber","branch","yearOfStudy","timeCommit","status","createdAt"];
    const header = ["project", ...cols, "currentSkills","wantToLearn","previousWork","coursework","whyThisProject"].join(",");
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) => [
      esc(r.project?.title || ""),
      ...cols.map((c) => esc(r[c])),
      esc(r.currentSkills), esc(r.wantToLearn), esc(r.previousWork),
      esc(r.coursework), esc(r.whyThisProject),
    ].join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `iot-lab-applications-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login"); router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper-2)" }}>
      {/* top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap-wide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
          <BrandHeader compact />
          <div className="admin-topbar-actions">
            <Link className="btn btn-ghost btn-sm" href="/admin/projects">Manage projects</Link>
            <Link className="btn btn-ghost btn-sm" href="/admin/suggestions">Suggestions</Link>
            <Link className="btn btn-ghost btn-sm" href="/">View site ↗</Link>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="wrap-wide" style={{ padding: "28px 22px 60px" }}>
        <h1 className="serif" style={{ fontSize: 28, marginBottom: 4 }}>Applications</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
          Per-project applications from the public site.
        </p>

        {/* stat cards */}
        <div className="admin-stats">
          <Stat label="Total" value={stats.total} />
          <Stat label="Pending" value={stats.pending} tone="warn" />
          <Stat label="Shortlisted" value={stats.shortlisted} tone="warn" />
          <Stat label="Accepted" value={stats.accepted} tone="ok" />
        </div>

        {/* controls + table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
            <input
              placeholder="Search name, email, roll, project…"
              value={q} onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 200, font: "inherit", fontSize: 14, padding: "9px 12px",
                border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)" }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ font: "inherit", fontSize: 14, padding: "9px 12px", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)" }}>
              <option value="all">All statuses</option>
              {STATUS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
            </select>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
              style={{ font: "inherit", fontSize: 14, padding: "9px 12px", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)", maxWidth: 280 }}>
              <option value="all">All projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={exportCSV}>Export CSV</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Applicant</th><th>Project</th><th>Roll No.</th>
                  <th>Year</th><th>Time</th><th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    No applications match.
                  </td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.project?.title || ""}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {r.project?.group && (
                          <span className={`tier-pill ${r.project.group === "A" ? "tier-research" : "tier-foundation"}`} style={{ fontSize: 9, padding: "1px 6px", marginRight: 6 }}>
                            {r.project.group}
                          </span>
                        )}
                        {r.branch}
                      </div>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{r.rollNumber}</td>
                    <td style={{ fontSize: 13 }}>{r.yearOfStudy}</td>
                    <td style={{ fontSize: 13 }}>{r.timeCommit || ""}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE_CLASS[r.status] || "badge-pending"}`}>{cap(r.status)}</span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {r.status !== "accepted" && (
                        <button className="btn btn-sm" onClick={() => setStatus(r.id, "accepted")} disabled={busy}
                          style={{ marginRight: 6, background: "var(--ok-soft)", color: "var(--ok)", border: "1px solid #c6dfa8" }}>
                          Accept
                        </button>
                      )}
                      {r.status !== "shortlisted" && (
                        <button className="btn btn-sm" onClick={() => setStatus(r.id, "shortlisted")} disabled={busy}
                          style={{ marginRight: 6, background: "var(--warn-soft)", color: "var(--warn)", border: "1px solid #e8c98a" }}>
                          Shortlist
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button className="btn btn-sm" onClick={() => setStatus(r.id, "rejected")} disabled={busy}
                          style={{ marginRight: 6, background: "var(--danger-soft)", color: "var(--danger)", border: "1px solid #f0c0c0" }}>
                          Reject
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewing(r)} style={{ marginRight: 6 }}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
            Showing {filtered.length} of {rows.length} applications
          </div>
        </div>
      </div>

      {viewing && <DetailModal app={viewing} onClose={() => setViewing(null)} />}
    </main>
  );
}

function Stat({ label, value, tone }) {
  const colors = { warn: "var(--warn)", ok: "var(--ok)", danger: "var(--danger)" };
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <div className="serif" style={{ fontSize: 34, fontWeight: 700, color: tone ? colors[tone] : "var(--ink)" }}>{value}</div>
    </div>
  );
}

function DetailModal({ app: a, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{a.fullName}</h2>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {a.email} · {a.phone} · {a.rollNumber}
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Applied to</h3>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{a.project?.title || ""}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {a.project?.group && `Group ${a.project.group}`} · {a.branch} · {a.yearOfStudy}
            </div>
          </div>

          <Section title="Why this project?">{a.whyThisProject || ""}</Section>
          <Section title="Current skills">{a.currentSkills || ""}</Section>
          <Section title="Want to learn">{a.wantToLearn || ""}</Section>
          <Section title="Previous work">{a.previousWork || ""}</Section>
          <Section title="Coursework">{a.coursework || ""}</Section>
          <Section title="Time commitment">{a.timeCommit || ""}</Section>

          {a.notes && <Section title="Internal notes">{a.notes}</Section>}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{title}</h3>
      <div style={{ fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
