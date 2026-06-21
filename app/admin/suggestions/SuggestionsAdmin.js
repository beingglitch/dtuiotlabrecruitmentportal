"use client";

import { useState } from "react";
import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

const STATUS = ["new", "reviewing", "accepted", "rejected"];
const STATUS_BADGE = {
  new: "badge-pending",
  reviewing: "badge-pending",
  accepted: "badge-approved",
  rejected: "badge-rejected",
};

export default function SuggestionsAdmin({ initial }) {
  const [rows, setRows] = useState(initial);
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);

  async function setStatus(id, status) {
    setBusy(true);
    const res = await fetch(`/api/suggestions/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    setBusy(false);
  }

  async function remove(id) {
    if (!confirm("Delete this suggestion?")) return;
    setBusy(true);
    const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
    if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
    setBusy(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--paper-2)" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap-wide" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px" }}>
          <BrandHeader compact />
          <div className="admin-topbar-actions">
            <Link className="btn btn-ghost btn-sm" href="/admin">Applications</Link>
            <Link className="btn btn-ghost btn-sm" href="/admin/projects">Manage projects</Link>
            <Link className="btn btn-ghost btn-sm" href="/">View site ↗</Link>
          </div>
        </div>
      </div>

      <div className="wrap-wide" style={{ padding: "28px 22px 60px" }}>
        <h1 className="serif" style={{ fontSize: 28, marginBottom: 4 }}>Suggestions</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
          Project pitches submitted via the public site.
        </p>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>From</th><th>Title</th><th>Submitted</th><th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
                    No suggestions yet.
                  </td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.fullName}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div>
                    </td>
                    <td style={{ fontSize: 13.5, maxWidth: 400 }}>{r.title}</td>
                    <td style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[r.status] || "badge-pending"}`}>{cap(r.status)}</span>
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {r.status !== "accepted" && (
                        <button className="btn btn-sm" onClick={() => setStatus(r.id, "accepted")} disabled={busy}
                          style={{ marginRight: 6, background: "var(--ok-soft)", color: "var(--ok)", border: "1px solid #c6dfa8" }}>
                          Accept
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
        </div>
      </div>

      {viewing && <SuggestionModal s={viewing} onClose={() => setViewing(null)} />}
    </main>
  );
}

function SuggestionModal({ s, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{s.title}</h2>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {s.fullName} · {s.email}
              {s.rollNumber && ` · ${s.rollNumber}`}
              {s.branch && ` · ${s.branch}`}
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: "var(--muted)" }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <Section title="Description">{s.description}</Section>
          {s.resources && <Section title="Resources needed">{s.resources}</Section>}
          {s.expectedOutcome && <Section title="Expected outcome">{s.expectedOutcome}</Section>}
          {s.notes && <Section title="Internal notes">{s.notes}</Section>}
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
