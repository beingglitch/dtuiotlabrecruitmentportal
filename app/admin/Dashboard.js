"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { PROJECTS, GROUPS, projectById } from "@/lib/projects";

const STATUS = ["pending", "approved", "rejected"];

const PRIORITY_LABEL = {
  "first-choice": "First choice", high: "High", medium: "Medium",
  low: "Low", not: "Not interested",
};
const PRIORITY_RANK = { "first-choice": 5, high: 4, medium: 3, low: 2, not: 0 };

function parseJSON(s, fallback) {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}
const CHART_COLORS = ["#c2410c", "#0f6e56", "#854f0b", "#185fa5", "#534ab7", "#a32d2d", "#3b6d11"];

export default function Dashboard({ initial }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (projectFilter !== "all") {
        const prefs = parseJSON(r.projectPreferences, {});
        const v = prefs[projectFilter];
        if (!v || v === "not") return false;
      }
      if (!term) return true;
      return [r.fullName, r.email, r.rollNumber, r.branch, r.program, r.city]
        .join(" ").toLowerCase().includes(term);
    });
  }, [rows, q, statusFilter, projectFilter]);

  // Aggregate project interest across all rows for the analytics chart.
  const projectInterest = useMemo(() => {
    const counts = Object.fromEntries(PROJECTS.map((p) => [p.id, 0]));
    rows.forEach((r) => {
      const prefs = parseJSON(r.projectPreferences, {});
      Object.entries(prefs).forEach(([pid, pri]) => {
        if (pri && pri !== "not" && pid in counts) counts[pid] += 1;
      });
    });
    return PROJECTS.map((p) => ({ name: p.title, value: counts[p.id], group: p.group }));
  }, [rows]);

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
    const baseCols = ["fullName","email","phone","rollNumber","program","branch","yearOfStudy","gender","dateOfBirth","city","state","address","previousScore","status","createdAt","hoursPerWeek","durationMonths","workMode","hardwareLevel","githubUrl","ownProjectTitle"];
    const projectCols = PROJECTS.map((p) => `priority:${p.id}`);
    const header = [...baseCols, ...projectCols, "outcomeGoals", "programmingLangs", "toolsKnown"].join(",");
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) => {
      const prefs = parseJSON(r.projectPreferences, {});
      const out = parseJSON(r.outcomeGoals, []);
      const langs = parseJSON(r.programmingLangs, []);
      const tools = parseJSON(r.toolsKnown, []);
      const cells = [
        ...baseCols.map((c) => esc(r[c])),
        ...PROJECTS.map((p) => esc(prefs[p.id] || "")),
        esc(out.join("; ")), esc(langs.join("; ")), esc(tools.join("; ")),
      ];
      return cells.join(",");
    });
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

        {/* project interest chart */}
        <div className="card" style={{ padding: 20, marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Project interest (anyone who marked it Low or higher)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={projectInterest} margin={{ left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3ddd0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b665c" }} interval={0} angle={-20} textAnchor="end" height={90} />
              <YAxis tick={{ fontSize: 11, fill: "#6b665c" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {projectInterest.map((d, i) => {
                  // Group A = ink (multi-person), Group B = teal (solo)
                  const fill = d.group === "A" ? "#16161a" : "#0f6e56";
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
              style={{ font: "inherit", fontSize: 14, padding: "9px 12px", border: "1px solid var(--line-strong)", borderRadius: "var(--radius-sm)", maxWidth: 240 }}>
              <option value="all">Any project</option>
              {PROJECTS.map((p) => <option key={p.id} value={p.id}>Interested: {p.title}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={exportCSV}>Export CSV</button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th><th>Roll No.</th><th>Program</th><th>Branch</th>
                  <th>Year</th><th>Top picks</th><th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    No registrations match your search.
                  </td></tr>
                )}
                {filtered.map((r) => {
                  const prefs = parseJSON(r.projectPreferences, {});
                  const top = Object.entries(prefs)
                    .filter(([, pri]) => pri && pri !== "not")
                    .sort((a, b) => (PRIORITY_RANK[b[1]] || 0) - (PRIORITY_RANK[a[1]] || 0))
                    .slice(0, 2);
                  return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div>
                    </td>
                    <td style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>{r.rollNumber}</td>
                    <td>{r.program}</td>
                    <td style={{ fontSize: 13 }}>{r.branch}</td>
                    <td>{r.yearOfStudy}</td>
                    <td style={{ fontSize: 12, maxWidth: 220 }}>
                      {top.length === 0 && r.ownProjectTitle && (
                        <span style={{ color: "var(--amber)", fontStyle: "italic" }}>
                          Own idea: {r.ownProjectTitle.slice(0, 32)}{r.ownProjectTitle.length > 32 ? "…" : ""}
                        </span>
                      )}
                      {top.length === 0 && !r.ownProjectTitle && (
                        <span style={{ color: "var(--muted)" }}>—</span>
                      )}
                      {top.map(([pid, pri]) => {
                        const p = projectById(pid);
                        if (!p) return null;
                        return (
                          <div key={pid} style={{ lineHeight: 1.3 }}>
                            <span style={{ fontWeight: 600 }}>{p.title}</span>
                            <span style={{ color: "var(--muted)" }}> · {PRIORITY_LABEL[pri] || pri}</span>
                          </div>
                        );
                      })}
                    </td>
                    <td>
                      <span className={`badge badge-${r.status}`}>{cap(r.status)}</span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {r.status !== "approved" && (
                        <button className="btn btn-sm" onClick={() => setStatus(r.id, "approved")} disabled={busy}
                          style={{ marginRight: 6, background: "var(--ok-soft)", color: "var(--ok)", border: "1px solid #c6dfa8" }}>
                          Approve
                        </button>
                      )}
                      {r.status !== "rejected" && (
                        <button className="btn btn-sm" onClick={() => setStatus(r.id, "rejected")} disabled={busy}
                          style={{ marginRight: 6, background: "var(--danger-soft)", color: "var(--danger)", border: "1px solid #f0c0c0" }}>
                          Reject
                        </button>
                      )}
                      {r.status !== "pending" && (
                        <button className="btn btn-sm btn-ghost" onClick={() => setStatus(r.id, "pending")} disabled={busy} style={{ marginRight: 6 }}>
                          Reset
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewing(r)} style={{ marginRight: 6 }}>Details</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(r)} style={{ marginRight: 6 }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--line)" }}>
            Showing {filtered.length} of {rows.length} registrations
          </div>
        </div>
      </div>

      {editing && <EditModal student={editing} onClose={() => setEditing(null)} onSave={saveEdit} busy={busy} />}
      {viewing && <DetailsModal student={viewing} onClose={() => setViewing(null)} />}
    </main>
  );
}

function DetailsModal({ student, onClose }) {
  const r = student;
  const prefs = parseJSON(r.projectPreferences, {});
  const out = parseJSON(r.outcomeGoals, []);
  const langs = parseJSON(r.programmingLangs, []);
  const tools = parseJSON(r.toolsKnown, []);
  const rankedPrefs = Object.entries(prefs)
    .filter(([, pri]) => pri && pri !== "not")
    .sort((a, b) => (PRIORITY_RANK[b[1]] || 0) - (PRIORITY_RANK[a[1]] || 0));

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{r.fullName}</h2>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{r.email} · {r.rollNumber}</div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <DetailGroup title="Commitment">
            <dl className="kv">
              <dt>Hours / week</dt><dd>{r.hoursPerWeek || "—"}</dd>
              <dt>Duration</dt><dd>{r.durationMonths || "—"}</dd>
              <dt>Work mode</dt><dd>{r.workMode || "—"}</dd>
              <dt>Outcome goals</dt><dd>{out.length ? out.join(" · ") : "—"}</dd>
              <dt>Other goal</dt><dd>{r.otherOutcome || "—"}</dd>
            </dl>
          </DetailGroup>

          <DetailGroup title="Prior experience">
            <dl className="kv">
              <dt>Languages</dt><dd>{langs.length ? langs.join(", ") : "—"}</dd>
              <dt>Other languages</dt><dd>{r.otherLangs || "—"}</dd>
              <dt>Hardware level</dt><dd>{r.hardwareLevel || "—"}</dd>
              <dt>Tools known</dt><dd>{tools.length ? tools.join(", ") : "—"}</dd>
              <dt>Other tools</dt><dd>{r.otherTools || "—"}</dd>
              <dt>Past projects</dt><dd>{r.pastProjects || "—"}</dd>
              <dt>GitHub</dt><dd>{r.githubUrl ? <a href={r.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber)" }}>{r.githubUrl}</a> : "—"}</dd>
              <dt>Coursework</dt><dd>{r.coursework || "—"}</dd>
              <dt>Additional info</dt><dd style={{ whiteSpace: "pre-wrap" }}>{r.additionalInfo || "—"}</dd>
            </dl>
          </DetailGroup>

          <DetailGroup title={`Project preferences (${rankedPrefs.length})`}>
            {rankedPrefs.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>No preferences set.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {rankedPrefs.map(([pid, pri]) => {
                  const p = projectById(pid);
                  if (!p) return null;
                  return (
                    <li key={pid} style={{ padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                        <span className={`tier-pill ${GROUPS[p.group].pillClass}`}>{GROUPS[p.group].short}</span>
                        <strong style={{ fontSize: 14 }}>{p.title}</strong>
                        <span style={{ fontSize: 12, color: "var(--amber)", fontWeight: 700 }}>{PRIORITY_LABEL[pri] || pri}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.domain}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </DetailGroup>

          {(r.ownProjectTitle || r.ownProjectDescription) && (
            <DetailGroup title="Own project proposal">
              <dl className="kv">
                <dt>Title</dt><dd>{r.ownProjectTitle || "—"}</dd>
                <dt>Description</dt><dd>{r.ownProjectDescription || "—"}</dd>
                <dt>Resources needed</dt><dd>{r.ownProjectResources || "—"}</dd>
                <dt>Expected outcome</dt><dd>{r.ownProjectOutcome || "—"}</dd>
              </dl>
            </DetailGroup>
          )}

          {r.notes && (
            <DetailGroup title="Internal notes">
              <p style={{ fontSize: 13.5, whiteSpace: "pre-wrap" }}>{r.notes}</p>
            </DetailGroup>
          )}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function DetailGroup({ title, children }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>{title}</h3>
      {children}
    </section>
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
