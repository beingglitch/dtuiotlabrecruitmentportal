"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const STATUS = ["pending", "approved", "rejected"];
const CHART_COLORS = ["#c2410c", "#0f6e56", "#854f0b", "#185fa5", "#534ab7", "#a32d2d", "#3b6d11"];

export default function Dashboard({ initial }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!term) return true;
      return [r.fullName, r.email, r.rollNumber, r.branch, r.program, r.city]
        .join(" ").toLowerCase().includes(term);
    });
  }, [rows, q, statusFilter]);

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  }), [rows]);

  const byBranch = useMemo(() => {
    const m = {};
    rows.forEach((r) => { m[r.branch] = (m[r.branch] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const byProgram = useMemo(() => {
    const m = {};
    rows.forEach((r) => { m[r.program] = (m[r.program] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [rows]);

  async function setStatus(id, status) {
    setBusy(true);
    const res = await fetch(`/api/students/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm("Delete this registration permanently?")) return;
    setBusy(true);
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
    setBusy(false);
  }

  async function saveEdit(updated) {
    setBusy(true);
    const res = await fetch(`/api/students/${updated.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (res.ok) {
      setRows((rs) => rs.map((r) => (r.id === updated.id ? { ...r, ...data, createdAt: r.createdAt } : r)));
      setEditing(null);
    } else {
      alert(data.error || "Failed to save");
    }
    setBusy(false);
  }

  function exportCSV() {
    const cols = ["fullName","email","phone","rollNumber","program","branch","yearOfStudy","gender","dateOfBirth","city","state","address","previousScore","status","createdAt"];
    const header = cols.join(",");
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) => cols.map((c) => esc(r[c])).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `dtu-iot-registrations-${new Date().toISOString().slice(0,10)}.csv`;
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
        <div className="wrap-wide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <BrandHeader compact />
          <div style={{ display: "flex", gap: 10 }}>
            <a className="btn btn-ghost btn-sm" href="/">View form ↗</a>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </div>

      <div className="wrap-wide" style={{ padding: "28px 20px 60px" }}>
        <h1 className="serif" style={{ fontSize: 28, marginBottom: 4 }}>Registrations dashboard</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>Manage and review IoT Lab student intake.</p>

        {/* stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          <Stat label="Total" value={stats.total} />
          <Stat label="Pending" value={stats.pending} tone="warn" />
          <Stat label="Approved" value={stats.approved} tone="ok" />
          <Stat label="Rejected" value={stats.rejected} tone="danger" />
        </div>

        {/* charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Registrations by branch</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byBranch} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ddd0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b665c" }} interval={0} angle={-18} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11, fill: "#6b665c" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {byBranch.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>By program</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byProgram} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 11 }}>
                  {byProgram.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* controls */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
            <input
              placeholder="Search name, email, roll, branch…"
              value={q} onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 200, font: "inherit", fontSize: 14, padding: "9px 12px",
                border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)" }}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ font: "inherit", fontSize: 14, padding: "9px 12px", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)" }}>
              <option value="all">All statuses</option>
              {STATUS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={exportCSV}>Export CSV</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th><th>Roll No.</th><th>Program</th><th>Branch</th>
                  <th>Year</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    No registrations match your search.
                  </td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div>
                    </td>
                    <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>{r.rollNumber}</td>
                    <td>{r.program}</td>
                    <td style={{ fontSize: 13 }}>{r.branch}</td>
                    <td>{r.yearOfStudy}</td>
                    <td>
                      <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} disabled={busy}
                        className={`badge badge-${r.status}`}
                        style={{ border: "none", font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", paddingLeft: 18, appearance: "none", borderRadius: 999 }}>
                        {STATUS.map((s) => <option key={s} value={s} style={{ background: "#fff", color: "var(--ink)" }}>{cap(s)}</option>)}
                      </select>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(r)} style={{ marginRight: 6 }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
            Showing {filtered.length} of {rows.length} registrations
          </div>
        </div>
      </div>

      {editing && <EditModal student={editing} onClose={() => setEditing(null)} onSave={saveEdit} busy={busy} />}
    </main>
  );
}

function Stat({ label, value, tone }) {
  const colors = {
    warn: "var(--warn)", ok: "var(--ok)", danger: "var(--danger)",
  };
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <div className="serif" style={{ fontSize: 34, fontWeight: 700, color: tone ? colors[tone] : "var(--ink)" }}>{value}</div>
    </div>
  );
}

function EditModal({ student, onClose, onSave, busy }) {
  const [f, setF] = useState(student);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const F = ({ label, k, type = "text" }) => (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={f[k] || ""} onChange={set(k)} />
    </div>
  );
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18 }}>Edit registration</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <F label="Full name" k="fullName" />
          <div className="grid-2">
            <F label="Email" k="email" />
            <F label="Phone" k="phone" />
          </div>
          <div className="grid-2">
            <F label="Roll number" k="rollNumber" />
            <F label="Year of study" k="yearOfStudy" />
          </div>
          <div className="grid-2">
            <F label="Program" k="program" />
            <F label="Branch" k="branch" />
          </div>
          <div className="grid-2">
            <F label="City" k="city" />
            <F label="State" k="state" />
          </div>
          <div className="field">
            <label>Notes (internal)</label>
            <textarea rows={3} value={f.notes || ""} onChange={set("notes")} />
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" onClick={() => onSave(f)} disabled={busy} style={{ minWidth: 120 }}>
            {busy ? <span className="spin" /> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
