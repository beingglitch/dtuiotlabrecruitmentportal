"use client";

import { useState } from "react";
import BrandHeader from "@/components/BrandHeader";
import {
  PROJECTS,
  GROUPS,
  PRIORITY_OPTIONS,
  HOURS_PER_WEEK,
  DURATION_MONTHS,
  WORK_MODES,
  OUTCOME_GOALS,
  HARDWARE_LEVELS,
  PROGRAMMING_LANGS,
  TOOLS_KNOWN,
} from "@/lib/projects";

const PROGRAMS = ["B.Tech", "M.Tech", "B.Des", "BBA", "MBA", "M.Sc", "Ph.D"];
const BRANCHES = [
  // Core B.Tech engineering branches
  "Computer Science & Engineering",
  "Computer Engineering",
  "Software Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Environmental Engineering",
  "Production & Industrial Engineering",
  "Mathematics & Computing",
  "Engineering Physics",

  // B.Tech specializations
  "Computer Science & Engineering (Data Science & Analytics)",
  "Information Technology (Cyber Security)",
  "Electronics Engineering (VLSI Design & Technology)",
  "Mechanical Engineering (Automotive Engineering)",

  // Applied sciences & other schools (M.Tech / B.Des / PhD / management)
  "Applied Chemistry",
  "Applied Mathematics",
  "Applied Physics",
  "Geospatial Science & Technology",
  "Design (B.Des)",
  "Delhi School of Management (DSM)",
  "University School of Management & Entrepreneurship (USME)",
  "Humanities",
  "Physical Education",

  "Other",
];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const EMPTY = {
  fullName: "", dateOfBirth: "", gender: "",
  email: "", phone: "", address: "", city: "", state: "",
  program: "", branch: "", yearOfStudy: "", rollNumber: "", previousScore: "",

  hoursPerWeek: "", durationMonths: "", workMode: "",
  outcomeGoals: [],

  programmingLangs: [], hardwareLevel: "", toolsKnown: [],
  pastProjects: "", githubUrl: "", coursework: "",

  otherOutcome: "", otherLangs: "", otherTools: "",
  additionalInfo: "",

  projectPreferences: {}, // { projectId: priorityValue }

  ownProjectTitle: "", ownProjectDescription: "",
  ownProjectResources: "", ownProjectOutcome: "",
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

  const toggle = (k, value) => () => {
    setForm((f) => {
      const arr = f[k] || [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...f, [k]: next };
    });
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  // Each ranked priority (low / medium / high / first-choice) can only be held
  // by one project at a time. Reassigning moves it — the previous holder is
  // cleared. "not interested" is unlimited.
  const UNIQUE_PRIORITIES = new Set(["low", "medium", "high", "first-choice"]);
  // priority value → projectId of the project currently holding it
  const heldBy = Object.entries(form.projectPreferences).reduce((acc, [pid, pri]) => {
    if (UNIQUE_PRIORITIES.has(pri)) acc[pri] = pid;
    return acc;
  }, {});
  const setPriority = (projectId) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f.projectPreferences };
      if (value) {
        if (UNIQUE_PRIORITIES.has(value)) {
          for (const [pid, pri] of Object.entries(next)) {
            if (pid !== projectId && pri === value) delete next[pid];
          }
        }
        next[projectId] = value;
      } else {
        delete next[projectId];
      }
      return { ...f, projectPreferences: next };
    });
  };

  function validate() {
    const e = {};
    const required = ["fullName","dateOfBirth","gender","email","phone","address","city","state","program","branch","yearOfStudy","rollNumber"];
    for (const k of required) if (!String(form[k]).trim()) e[k] = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a 10-digit phone number";

    // At least one signal of interest: either a project priority OR an own-project title.
    const hasAnyPriority = Object.values(form.projectPreferences || {}).some(
      (v) => v && v !== "not"
    );
    const hasOwn = form.ownProjectTitle.trim().length > 0;
    if (!hasAnyPriority && !hasOwn) {
      e.projectPreferences =
        "Pick a priority on at least one project, or describe your own idea below.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerErr("");
    if (!validate()) {
      document.querySelector(".invalid, .err-banner")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        // Serialize arrays/objects as JSON strings — schema stores them as String?.
        outcomeGoals: JSON.stringify(form.outcomeGoals),
        programmingLangs: JSON.stringify(form.programmingLangs),
        toolsKnown: JSON.stringify(form.toolsKnown),
        projectPreferences: JSON.stringify(form.projectPreferences),
      };
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <p style={{ color: "var(--muted)", maxWidth: 580 }}>
          Register for the IoT Lab at the Department of Software Engineering, DTU.
          Fields marked with <span style={{ color: "var(--amber)" }}>*</span> are required.
          Read the project briefs in <strong>Section 06</strong> before picking your preferences — equipment, time, and
          outcomes are listed inline so you know what you're signing up for.
        </p>
      </header>

      {/* ───────────── 01 — Personal ───────────── */}
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

      {/* ───────────── 02 — Contact ───────────── */}
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

      {/* ───────────── 03 — Academic ───────────── */}
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

      {/* ───────────── 04 — Commitment ───────────── */}
      <Section n="04" title="Time & commitment"
        intro="Be realistic — this helps us match you to a project you can actually finish.">
        <div className="grid-3">
          <Field label="Hours per week">
            <select value={form.hoursPerWeek} onChange={set("hoursPerWeek")}>
              <option value="">Select…</option>
              {HOURS_PER_WEEK.map((h) => <option key={h}>{h}</option>)}
            </select>
          </Field>
          <Field label="Duration you can commit">
            <select value={form.durationMonths} onChange={set("durationMonths")}>
              <option value="">Select…</option>
              {DURATION_MONTHS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Preferred work mode">
            <select value={form.workMode} onChange={set("workMode")}>
              <option value="">Select…</option>
              {WORK_MODES.map((w) => <option key={w}>{w}</option>)}
            </select>
          </Field>
        </div>
        <Field label="What do you want to get out of this?"
          hint="Select all that apply — we'll match the project type to your goal.">
          <div className="chip-group">
            {OUTCOME_GOALS.map((g) => (
              <button key={g} type="button"
                className="chip chip-amber"
                aria-pressed={form.outcomeGoals.includes(g)}
                onClick={toggle("outcomeGoals", g)}>
                {g}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Other goal (specify)" hint="Anything not in the list above.">
          <input value={form.otherOutcome} onChange={set("otherOutcome")}
            placeholder="e.g. Publish on arXiv, contribute to a specific open-source project" />
        </Field>
      </Section>

      {/* ───────────── 05 — Prior experience ───────────── */}
      <Section n="05" title="Prior experience"
        intro="Tell us what you already know — there's no wrong answer here. Tier-1 projects assume nothing.">
        <Field label="Programming languages you're comfortable with">
          <div className="chip-group">
            {PROGRAMMING_LANGS.map((l) => (
              <button key={l} type="button" className="chip"
                aria-pressed={form.programmingLangs.includes(l)}
                onClick={toggle("programmingLangs", l)}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Other languages (specify)" hint="Comma-separated.">
          <input value={form.otherLangs} onChange={set("otherLangs")}
            placeholder="e.g. Kotlin, Verilog, Solidity" />
        </Field>
        <Field label="Hardware / embedded experience">
          <select value={form.hardwareLevel} onChange={set("hardwareLevel")}>
            <option value="">Select…</option>
            {HARDWARE_LEVELS.map((h) => <option key={h}>{h}</option>)}
          </select>
        </Field>
        <Field label="Tools & frameworks you've used">
          <div className="chip-group">
            {TOOLS_KNOWN.map((t) => (
              <button key={t} type="button" className="chip"
                aria-pressed={form.toolsKnown.includes(t)}
                onClick={toggle("toolsKnown", t)}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Other tools (specify)" hint="Comma-separated.">
          <input value={form.otherTools} onChange={set("otherTools")}
            placeholder="e.g. KiCad, Altium, MATLAB Simulink, Unity" />
        </Field>
        <Field label="Past projects (briefly)"
          hint="A line or two about anything you've built. Class projects count.">
          <textarea rows={3} value={form.pastProjects} onChange={set("pastProjects")}
            placeholder="e.g. Smart attendance system with RFID + Flask backend (mini-project, 4th sem)" />
        </Field>
        <div className="grid-2">
          <Field label="GitHub / portfolio URL" hint="Optional">
            <input value={form.githubUrl} onChange={set("githubUrl")} placeholder="https://github.com/your-handle" />
          </Field>
          <Field label="Relevant coursework" hint="Optional">
            <input value={form.coursework} onChange={set("coursework")} placeholder="Embedded Systems, Networks, ML…" />
          </Field>
        </div>
        <Field label="Anything else we should know? (optional)"
          hint="Equipment you already own, time conflicts, accessibility needs, niche skills — anything.">
          <textarea rows={3} value={form.additionalInfo} onChange={set("additionalInfo")}
            placeholder="e.g. I have my own RTL-SDR and a small RC quadcopter — happy to use them on lab projects." />
        </Field>
      </Section>

      {/* ───────────── 06 — Project preferences ───────────── */}
      <Section n="06" title="Project preferences"
        intro="Projects come in two groups. Each ranked priority (Low / Medium / High / First choice) can be set on only one project — picking it on a second project moves it. This forces you to rank: we can see your one true #1. Mark only what you actually want; leave the rest blank. If nothing fits, jump to Section 07 and pitch your own.">

        {errors.projectPreferences && (
          <div className="err-banner" style={{
            background: "var(--danger-soft)", color: "var(--danger)",
            padding: "10px 14px", borderRadius: "var(--radius-sm)",
            fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>{errors.projectPreferences}</div>
        )}

        {["A", "B"].map((groupId) => (
          <div key={groupId} style={{ marginBottom: 28 }}>
            <div style={{ marginBottom: 14 }}>
              <span className={`tier-pill ${GROUPS[groupId].pillClass}`}>{GROUPS[groupId].label}</span>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, maxWidth: 620 }}>
                {GROUPS[groupId].blurb}
              </p>
            </div>
            {PROJECTS.filter((p) => p.group === groupId).map((p) => {
              const priority = form.projectPreferences[p.id] || "";
              const selected = priority && priority !== "not";
              return (
                <article key={p.id} className={`project-card ${selected ? "is-selected" : ""}`}>
                  <div className="project-card-head">
                    <div>
                      <h3>{p.title}</h3>
                      <div className="domain">{p.domain}</div>
                    </div>
                  </div>
                  <p className="summary">{p.summary}</p>
                  <dl className="project-meta">
                    <div><dt>Equipment</dt><dd>{p.equipment}</dd></div>
                    <div><dt>Budget</dt><dd>{p.budget}</dd></div>
                    <div><dt>Manpower</dt><dd>{p.manpower}</dd></div>
                    <div><dt>Time / week</dt><dd>{p.timePerWeek}</dd></div>
                    <div><dt>Duration</dt><dd>{p.duration}</dd></div>
                    <div><dt>Prerequisites</dt><dd>{p.prerequisites}</dd></div>
                    <div><dt>Outcome</dt><dd>{p.outcomes.join(" · ")}</dd></div>
                    <div><dt>Commercial viability</dt><dd>{p.commercial}</dd></div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <dt>Tech stack</dt><dd>{p.stack}</dd>
                    </div>
                  </dl>
                  <div className="priority-row">
                    <label htmlFor={`pri-${p.id}`}>Your priority</label>
                    <select id={`pri-${p.id}`} value={priority} onChange={setPriority(p.id)}>
                      {PRIORITY_OPTIONS.map((o) => {
                        // If this priority is currently held by *another* project,
                        // append a note so the student knows picking it will move it.
                        const taken = UNIQUE_PRIORITIES.has(o.value) && heldBy[o.value] && heldBy[o.value] !== p.id;
                        const label = taken
                          ? `${o.label} — currently on "${PROJECTS.find((x) => x.id === heldBy[o.value])?.title || "another project"}"`
                          : o.label;
                        return <option key={o.value} value={o.value}>{label}</option>;
                      })}
                    </select>
                    {selected && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        Only one project per priority level.
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </Section>

      {/* ───────────── 07 — Own idea ───────────── */}
      <Section n="07" title="Have your own project idea? (optional)"
        intro="If you have a project you want to pitch — within IoT, comms, edge AI, or anything adjacent — describe it here. Genuinely good ideas can get lab time, budget, and a faculty mentor.">
        <Field label="Project title">
          <input value={form.ownProjectTitle} onChange={set("ownProjectTitle")}
            placeholder="e.g. Acoustic drone detection using a low-cost microphone array" />
        </Field>
        <Field label="What would you build, and why does it matter?"
          hint="2–4 sentences. Be specific about what the end output is.">
          <textarea rows={4} value={form.ownProjectDescription} onChange={set("ownProjectDescription")}
            placeholder="Describe the goal, the approach, and what the working prototype looks like." />
        </Field>
        <Field label="Resources you think you'll need"
          hint="Equipment, budget estimate, software, mentorship.">
          <textarea rows={3} value={form.ownProjectResources} onChange={set("ownProjectResources")}
            placeholder="e.g. 4× MEMS mics, a Raspberry Pi 4, a small GPU instance for training — ~₹8,000 total" />
        </Field>
        <Field label="What's the expected outcome?"
          hint="Prototype, paper, internal demo, open-source release, etc.">
          <input value={form.ownProjectOutcome} onChange={set("ownProjectOutcome")}
            placeholder="A working demo + a write-up by end of semester" />
        </Field>
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

function Section({ n, title, intro, children }) {
  return (
    <section className="card" style={{ padding: 28, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: intro ? 8 : 20 }}>
        <span className="serif" style={{ fontSize: 13, color: "var(--amber)", fontWeight: 700 }}>{n}</span>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h2>
      </div>
      {intro && (
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 20, maxWidth: 620 }}>{intro}</p>
      )}
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
