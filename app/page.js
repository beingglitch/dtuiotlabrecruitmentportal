"use client";

import { useState } from "react";
import BrandHeader from "@/components/BrandHeader";

const PROGRAMS = ["B.Tech", "M.Tech", "BCA", "MCA", "Ph.D"];
const BRANCHES = [
  "Software Engineering", "Computer Science", "Information Technology",
  "Electronics & Communication", "Mechanical", "Electrical", "Civil",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const EMPTY = {
  fullName: "", dateOfBirth: "", gender: "",
  email: "", phone: "", address: "", city: "", state: "",
  program: "", branch: "", yearOfStudy: "", rollNumber: "", previousScore: "",
};

export default function RegisterPage() {
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
    const required = ["fullName","dateOfBirth","gender","email","phone","address","city","state","program","branch","yearOfStudy","rollNumber"];
    for (const k of required) if (!String(form[k]).trim()) e[k] = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a 10-digit phone number";
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
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setDone(true);
    } catch (err) {
      setServerErr(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="wrap" style={{ paddingTop: 80, textAlign: "center" }}>
        <div className="card" style={{ padding: 48 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--ok-soft)", color: "var(--ok)",
            display: "grid", placeItems: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
          <h1 className="serif" style={{ fontSize: 28, marginBottom: 8 }}>Registration received</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Thanks, {form.fullName.split(" ")[0]}. Your application is now pending review.
            You'll be contacted at {form.email}.
          </p>
          <button className="btn btn-ghost" onClick={() => { setForm(EMPTY); setDone(false); }}>
            Register another student
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <header style={{ marginBottom: 32 }}>
        <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 20, marginBottom: 24 }}>
          <BrandHeader />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
          color: "var(--amber)", marginBottom: 8 }}>Student Registration · 2026</div>
        <h1 className="serif" style={{ fontSize: 36, lineHeight: 1.1, marginBottom: 10 }}>
          IoT Lab Registration
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 520 }}>
          Register for the IoT Lab at the Department of Software Engineering, DTU.
          Fields marked with <span style={{ color: "var(--amber)" }}>*</span> are required.
          It takes about three minutes.
        </p>
      </header>

      <Section n="01" title="Personal details">
        <Field label="Full name" req error={errors.fullName}>
          <input className={errors.fullName ? "invalid" : ""} value={form.fullName} onChange={set("fullName")} placeholder="e.g. Aarav Sharma" />
        </Field>
        <div className="grid-2">
          <Field label="Date of birth" req error={errors.dateOfBirth}>
            <input type="date" className={errors.dateOfBirth ? "invalid" : ""} value={form.dateOfBirth} onChange={set("dateOfBirth")} />
          </Field>
          <Field label="Gender" req error={errors.gender}>
            <select className={errors.gender ? "invalid" : ""} value={form.gender} onChange={set("gender")}>
              <option value="">Select…</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section n="02" title="Contact information">
        <div className="grid-2">
          <Field label="Email address" req error={errors.email}>
            <input className={errors.email ? "invalid" : ""} value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </Field>
          <Field label="Phone number" req error={errors.phone} hint="10-digit mobile number">
            <input className={errors.phone ? "invalid" : ""} value={form.phone} onChange={set("phone")} placeholder="9876543210" />
          </Field>
        </div>
        <Field label="Address" req error={errors.address}>
          <input className={errors.address ? "invalid" : ""} value={form.address} onChange={set("address")} placeholder="House no., street, locality" />
        </Field>
        <div className="grid-2">
          <Field label="City" req error={errors.city}>
            <input className={errors.city ? "invalid" : ""} value={form.city} onChange={set("city")} placeholder="New Delhi" />
          </Field>
          <Field label="State" req error={errors.state}>
            <input className={errors.state ? "invalid" : ""} value={form.state} onChange={set("state")} placeholder="Delhi" />
          </Field>
        </div>
      </Section>

      <Section n="03" title="Academic details">
        <div className="grid-2">
          <Field label="Program" req error={errors.program}>
            <select className={errors.program ? "invalid" : ""} value={form.program} onChange={set("program")}>
              <option value="">Select…</option>
              {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Branch / Department" req error={errors.branch}>
            <select className={errors.branch ? "invalid" : ""} value={form.branch} onChange={set("branch")}>
              <option value="">Select…</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid-3">
          <Field label="Year of study" req error={errors.yearOfStudy}>
            <select className={errors.yearOfStudy ? "invalid" : ""} value={form.yearOfStudy} onChange={set("yearOfStudy")}>
              <option value="">Select…</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </Field>
          <Field label="Roll / Enrollment no." req error={errors.rollNumber}>
            <input className={errors.rollNumber ? "invalid" : ""} value={form.rollNumber} onChange={set("rollNumber")} placeholder="2K26/SE/001" />
          </Field>
          <Field label="Previous score" hint="Optional">
            <input value={form.previousScore} onChange={set("previousScore")} placeholder="e.g. 92.4%" />
          </Field>
        </div>
      </Section>

      {serverErr && (
        <div style={{ background: "var(--danger-soft)", color: "var(--danger)", padding: "12px 16px",
          borderRadius: "var(--radius-sm)", marginBottom: 16, fontSize: 14, fontWeight: 600 }}>
          {serverErr}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
        <button className="btn btn-amber" onClick={submit} disabled={submitting} style={{ minWidth: 160 }}>
          {submitting ? <span className="spin" /> : "Submit registration"}
        </button>
      </div>
    </main>
  );
}

function Section({ n, title, children }) {
  return (
    <section className="card" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
        <span className="serif" style={{ fontSize: 13, color: "var(--amber)", fontWeight: 700 }}>{n}</span>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, req, error, hint, children }) {
  return (
    <div className="field">
      <label>{label}{req && <span className="req"> *</span>}</label>
      {children}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && <div className="err">{error}</div>}
    </div>
  );
}
