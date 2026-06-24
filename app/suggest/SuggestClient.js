"use client";

import { useState } from "react";
import Link from "next/link";

const EMPTY = {
  fullName: "", email: "", rollNumber: "", branch: "",
  title: "", description: "",
  resources: "", expectedOutcome: "",
};

export default function SuggestClient() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function validate() {
    const e = {};
    const required = ["fullName", "email", "title", "description"];
    for (const k of required) if (!String(form[k]).trim()) e[k] = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerErr("");
    if (!validate()) {
      document.querySelector(".invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--paper)", padding: "80px 0" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="card" style={{ padding: 56 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: "var(--ok-soft)", color: "var(--ok)",
              display: "grid", placeItems: "center",
              margin: "0 auto 24px", fontSize: 32,
            }}>✓</div>
            <h1 className="serif" style={{ fontSize: 32, marginBottom: 10, letterSpacing: "-.015em" }}>
              Thanks, {form.fullName.split(" ")[0]}.
            </h1>
            <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 15 }}>
              Your suggestion is in. We'll review it and write back at{" "}
              <strong style={{ color: "var(--ink)" }}>{form.email}</strong> if there's a fit.
            </p>
            <Link href="/" className="btn btn-ghost">Back to home</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <img src="/dtu-logo.png" alt="DTU" onError={(e) => (e.currentTarget.style.display = "none")} />
            <div className="brand-text">
              <div className="brand-title">IoT Research and Innovation Lab</div>
              <div className="brand-sub">Department of Software Engineering</div>
              <div className="brand-sub">Delhi Technological University</div>
              <div className="brand-sub">Delhi, India</div>
            </div>
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-secondary">Home</Link>
            <Link href="/projects" className="nav-secondary">Projects</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/projects" className="btn btn-amber btn-sm">Apply</Link>
          </div>
        </div>
      </nav>

      <main style={{ minHeight: "100vh", background: "var(--paper)", padding: "60px 0 80px" }}>
        <div className="wrap">
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: ".14em",
            textTransform: "uppercase", color: "var(--amber)", marginBottom: 12,
          }}>
            Suggest a project
          </div>
          <h1 className="serif" style={{
            fontSize: 38, lineHeight: 1.05, letterSpacing: "-.02em",
            marginBottom: 12, maxWidth: 600,
          }}>
            Have an idea we haven't listed?
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.55, marginBottom: 32, maxWidth: 580 }}>
            Pitch it. We read every submission. If it fits the lab's direction,
            we'll get back to you about scope, mentorship, and how to start.
          </p>

          <div className="section" style={{ marginBottom: 18 }}>
            <div className="section-head">
              <span className="section-num">01</span>
              <h2 className="section-title">You</h2>
            </div>

            <div className="field">
              <label>Full name <span className="req">*</span></label>
              <input
                className={errors.fullName ? "invalid" : ""}
                value={form.fullName} onChange={set("fullName")}
                placeholder="e.g. Aarav Sharma"
              />
              {errors.fullName && <div className="err">{errors.fullName}</div>}
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Email <span className="req">*</span></label>
                <input
                  className={errors.email ? "invalid" : ""}
                  value={form.email} onChange={set("email")}
                  placeholder="you@example.com"
                />
                {errors.email && <div className="err">{errors.email}</div>}
              </div>
              <div className="field">
                <label>Roll / enrolment no.</label>
                <input value={form.rollNumber} onChange={set("rollNumber")} placeholder="Optional" />
              </div>
            </div>

            <div className="field">
              <label>Branch / department</label>
              <input value={form.branch} onChange={set("branch")} placeholder="Optional" />
            </div>
          </div>

          <div className="section" style={{ marginBottom: 18 }}>
            <div className="section-head">
              <span className="section-num">02</span>
              <h2 className="section-title">The idea</h2>
            </div>

            <div className="field">
              <label>Project title <span className="req">*</span></label>
              <input
                className={errors.title ? "invalid" : ""}
                value={form.title} onChange={set("title")}
                placeholder="One line. Specific, not generic."
              />
              {errors.title && <div className="err">{errors.title}</div>}
            </div>

            <div className="field">
              <label>What would you build? <span className="req">*</span></label>
              <textarea
                className={errors.description ? "invalid" : ""}
                rows={5} value={form.description} onChange={set("description")}
                placeholder="3 to 5 sentences. Describe the goal, the approach, and what the working output looks like."
              />
              {errors.description && <div className="err">{errors.description}</div>}
            </div>

            <div className="field">
              <label>Resources you'd need</label>
              <textarea
                rows={3} value={form.resources} onChange={set("resources")}
                placeholder="Equipment, software, mentorship. Optional."
              />
            </div>

            <div className="field">
              <label>Expected outcome</label>
              <input
                value={form.expectedOutcome} onChange={set("expectedOutcome")}
                placeholder="Prototype, paper, internal demo, open-source release."
              />
            </div>
          </div>

          {serverErr && (
            <div className="err-banner" style={{ marginBottom: 14 }}>{serverErr}</div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
            <button
              className="btn btn-amber" onClick={submit} disabled={submitting}
              style={{ minWidth: 180, padding: "13px 24px" }}
            >
              {submitting ? <span className="spin" /> : "Submit suggestion"}
            </button>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
              Required fields marked <span style={{ color: "var(--amber)", fontWeight: 700 }}>*</span>
            </span>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="footer-title">IoT Research and Innovation Lab</div>
          <div>Department of Software Engineering</div>
          <div>Delhi Technological University</div>
          <div>Delhi, India <span aria-label="India">🇮🇳</span></div>
        </div>
        <div className="footer-meta">
          <a className="link" href="mailto:sanjaypatidar@dtu.ac.in">sanjaypatidar@dtu.ac.in</a>
        </div>
      </footer>
    </>
  );
}
