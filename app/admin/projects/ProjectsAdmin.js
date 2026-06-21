"use client";

import { useState } from "react";
import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

const EMPTY_PROJECT = {
  slug: "",
  group: "A",
  title: "",
  domain: "",
  summary: "",
  overview: "",
  deliverables: "",   // newline-separated in the editor; converted to JSON on save
  skills: "",         // ditto
  outcomes: "",       // ditto
  equipment: "",
  manpower: "",
  timePerWeek: "",
  duration: "",
  prerequisites: "",
  commercial: "",
  stack: "",
  visible: true,
  priority: 0,
};

export default function ProjectsAdmin({ initial }) {
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  async function toggleVisible(id, next) {
    setBusy(true);
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: next }),
    });
    if (res.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, visible: next } : r)));
    setBusy(false);
  }

  async function setPriority(id, next) {
    // optimistic UI: update locally first, then persist
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, priority: next } : r)));
    setBusy(true);
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: next }),
    });
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm("Delete this project? Existing applications referencing it will also be removed.")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
    setBusy(false);
  }

  async function persistOrder(nextRows) {
    setRows(nextRows);  // optimistic
    setBusy(true);
    await fetch("/api/admin/projects/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: nextRows.map((r) => r.id) }),
    });
    setBusy(false);
  }

  function onDragStart(id) { setDraggingId(id); }
  function onDragEnd() { setDraggingId(null); setDragOverId(null); }
  function onDragOver(e, overId) {
    e.preventDefault();
    if (overId !== dragOverId) setDragOverId(overId);
  }
  function onDrop(e, targetId) {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null); setDragOverId(null);
      return;
    }
    const fromIdx = rows.findIndex((r) => r.id === draggingId);
    const toIdx = rows.findIndex((r) => r.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...rows];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setDraggingId(null); setDragOverId(null);
    persistOrder(next);
  }

  async function save(project) {
    setBusy(true);
    const payload = {
      ...project,
      deliverables: arrToJSON(project.deliverables),
      skills:       arrToJSON(project.skills),
      outcomes:     arrToJSON(project.outcomes),
    };
    let res;
    if (project.id) {
      res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/admin/projects`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Save failed");
      setBusy(false);
      return;
    }
    // re-fetch the full list so order/visibility/etc stay in sync
    const refreshed = await fetch("/api/admin/projects").then((r) => r.json());
    setRows(refreshed);
    setEditing(null); setCreating(false);
    setBusy(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper-2)" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap-wide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
          <BrandHeader compact />
          <div className="admin-topbar-actions">
            <Link className="btn btn-ghost btn-sm" href="/admin">Applications</Link>
            <Link className="btn btn-ghost btn-sm" href="/admin/suggestions">Suggestions</Link>
            <Link className="btn btn-ghost btn-sm" href="/">View site ↗</Link>
          </div>
        </div>
      </div>

      <div className="wrap-wide" style={{ padding: "28px 22px 60px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
          <h1 className="serif" style={{ fontSize: 28 }}>Projects</h1>
          <button className="btn btn-amber btn-sm" onClick={() => setCreating(true)}>+ Add project</button>
        </div>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
          Drag rows to reorder. The order here is the order projects appear on the public site.
          Toggle visibility to hide a project without deleting it.
        </p>

        <div className="admin-proj-table">
          <div className="row" style={{ background: "var(--paper-2)", color: "var(--muted)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
            <div></div>
            <div>Project</div>
            <div>Group</div>
            <div>Time</div>
            <div>Priority</div>
            <div>Visible</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {rows.map((r) => (
            <div
              key={r.id}
              className={`row ${draggingId === r.id ? "dragging" : ""} ${dragOverId === r.id ? "drag-over" : ""} ${!r.visible ? "hidden-row" : ""}`}
              draggable
              onDragStart={() => onDragStart(r.id)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => onDragOver(e, r.id)}
              onDrop={(e) => onDrop(e, r.id)}
            >
              <div className="grip" title="Drag to reorder">⋮⋮</div>
              <div className="title-cell">
                <div className="title">{r.title}</div>
                <div className="slug">{r.slug} · {r.domain}</div>
              </div>
              <div className="meta-cell">
                <span className={`tier-pill ${r.group === "A" ? "tier-research" : "tier-foundation"}`}>
                  Group {r.group}
                </span>
              </div>
              <div className="meta-cell">{r.timePerWeek}</div>
              <div onClick={(e) => e.stopPropagation()}>
                <Stars value={r.priority || 0} onChange={(v) => setPriority(r.id, v)} />
              </div>
              <div>
                <label className="switch" title={r.visible ? "Public" : "Hidden"}>
                  <input
                    type="checkbox"
                    checked={r.visible}
                    disabled={busy}
                    onChange={(e) => toggleVisible(r.id, e.target.checked)}
                  />
                  <span className="track" />
                  <span className="thumb" />
                </label>
              </div>
              <div className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(r)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            No projects yet. <button className="link" onClick={() => setCreating(true)}>Add the first one</button>.
          </div>
        )}
      </div>

      {editing && <ProjectModal project={editing} onClose={() => setEditing(null)} onSave={save} busy={busy} />}
      {creating && <ProjectModal project={EMPTY_PROJECT} onClose={() => setCreating(false)} onSave={save} busy={busy} isNew />}
    </main>
  );
}

function ProjectModal({ project, onClose, onSave, busy, isNew = false }) {
  const [f, setF] = useState(() => ({
    ...project,
    deliverables: jsonToLines(project.deliverables),
    skills:       jsonToLines(project.skills),
    outcomes:     jsonToLines(project.outcomes),
  }));
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18 }}>{isNew ? "Add project" : "Edit project"}</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <div className="grid-2">
            <div className="field">
              <label>Slug (URL-safe)</label>
              <input value={f.slug} onChange={set("slug")} placeholder="e.g. mil-gcs" />
            </div>
            <div className="field">
              <label>Group</label>
              <select value={f.group} onChange={set("group")}>
                <option value="A">A · Multi-disciplinary</option>
                <option value="B">B · Solo module</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Title</label>
            <input value={f.title} onChange={set("title")} />
          </div>
          <div className="field">
            <label>Domain (short tagline)</label>
            <input value={f.domain} onChange={set("domain")} placeholder="GCS · UAV · defence software" />
          </div>
          <div className="field">
            <label>Summary (one line)</label>
            <input value={f.summary} onChange={set("summary")} />
          </div>
          <div className="field">
            <label>Overview (paragraph)</label>
            <textarea rows={4} value={f.overview} onChange={set("overview")} />
          </div>
          <div className="field">
            <label>Deliverables (one per line)</label>
            <textarea rows={5} value={f.deliverables} onChange={set("deliverables")} />
          </div>
          <div className="field">
            <label>Skills (one per line)</label>
            <textarea rows={4} value={f.skills} onChange={set("skills")} />
          </div>
          <div className="field">
            <label>Outcomes (one per line)</label>
            <textarea rows={3} value={f.outcomes} onChange={set("outcomes")} />
          </div>
          <div className="grid-2">
            <div className="field"><label>Equipment</label><input value={f.equipment} onChange={set("equipment")} /></div>
            <div className="field"><label>Manpower</label><input value={f.manpower} onChange={set("manpower")} /></div>
          </div>
          <div className="grid-2">
            <div className="field"><label>Time / week</label><input value={f.timePerWeek} onChange={set("timePerWeek")} placeholder="e.g. 8 hrs" /></div>
            <div className="field"><label>Duration</label><input value={f.duration} onChange={set("duration")} placeholder="e.g. 12+ months" /></div>
          </div>
          <div className="field"><label>Prerequisites</label><input value={f.prerequisites} onChange={set("prerequisites")} /></div>
          <div className="field"><label>Commercial outlook</label><input value={f.commercial} onChange={set("commercial")} /></div>
          <div className="field"><label>Tech stack</label><input value={f.stack} onChange={set("stack")} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label className="switch">
              <input type="checkbox" checked={!!f.visible} onChange={set("visible")} />
              <span className="track" /><span className="thumb" />
            </label>
            <span style={{ fontSize: 13 }}>Visible on public site</span>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Priority (hot rating)</label>
            <Stars value={f.priority || 0} onChange={(v) => setF((s) => ({ ...s, priority: v }))} />
            <div className="hint">0 stars = no badge. 4 or 5 stars = shown as "Hot" on the public site.</div>
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-amber" onClick={() => onSave(f)} disabled={busy} style={{ minWidth: 120 }}>
            {busy ? <span className="spin" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stars({ value, onChange, max = 5 }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Priority">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            className={`star ${filled ? "filled" : ""}`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(value === n ? 0 : n)}
            title={`Set priority to ${n}${value === n ? " (click to clear)" : ""}`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}

function jsonToLines(s) {
  if (!s) return "";
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) return arr.join("\n");
    return "";
  } catch { return s || ""; }
}

function arrToJSON(text) {
  if (!text) return "[]";
  const arr = String(text).split("\n").map((l) => l.trim()).filter(Boolean);
  return JSON.stringify(arr);
}
