"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";

const HOURS_PER_WEEK = ["< 5 hrs", "5–10 hrs", "10–15 hrs", "15+ hrs"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const EMPTY_APP = {
  projectId: "",
  fullName: "", email: "", phone: "", rollNumber: "",
  branch: "", yearOfStudy: "",
  timeCommit: "",
  currentSkills: "", wantToLearn: "",
  previousWork: "", coursework: "",
  whyThisProject: "",
};

export default function ProjectsClient({ projects }) {
  const scrollRef = useRef(null);
  const sectionRefs = useRef([]);
  const formRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  function applyToProject(projectId) {
    formRef.current?.setProject(projectId);
    jumpTo(projects.length);
  }

  // Track which section is in view (for the progress dots)
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = sectionRefs.current.findIndex((el) => el === entry.target);
            if (idx >= 0) setActiveIdx(idx);
          }
        }
      },
      { root, threshold: [0.5] }
    );
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [projects.length]);

  // GSAP fade for left-column content as each viewport scrolls into view
  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        sectionRefs.current.forEach((el) => {
          if (!el) return;
          gsap.from(el.querySelectorAll(".vp-anim"), {
            y: 18,
            duration: 0.55,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              scroller: scrollRef.current,
              start: "top 70%",
              once: true,
            },
          });
        });
      }, scrollRef);
    })();
    return () => { try { ctx?.revert(); } catch {} };
  }, [projects.length]);

  function jumpTo(idx) {
    const el = sectionRefs.current[idx];
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      {/* Fixed nav floats over the scroll-snap container */}
      <nav className="nav proj-scroll-nav">
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
            <Link href="/suggest" className="nav-secondary">Suggest</Link>
            <Link href="/admin" className="nav-secondary">Admin</Link>
            <button
              type="button"
              className="btn btn-amber btn-sm"
              onClick={() => jumpTo(projects.length)}
            >
              Apply
            </button>
          </div>
        </div>
      </nav>

    <div className="proj-scroll" ref={scrollRef}>
      {/* Floating progress dots */}
      <div className="proj-progress" aria-label="Project navigation">
        {projects.map((p, i) => (
          <button
            key={p.id}
            aria-current={i === activeIdx}
            title={p.title}
            onClick={() => jumpTo(i)}
          />
        ))}
        <button
          aria-current={activeIdx === projects.length}
          title="Apply"
          onClick={() => jumpTo(projects.length)}
        />
      </div>

      {/* One viewport per project */}
      {projects.map((p, i) => (
        <section
          key={p.id}
          className="proj-vp"
          ref={(el) => (sectionRefs.current[i] = el)}
        >
          <div className="vp-inner">
            <div className="vp-left">
              <div className="pos vp-anim">
                {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} &nbsp;·&nbsp;
                <span className={`tier-pill ${p.group === "A" ? "tier-research" : "tier-foundation"}`}>
                  Group {p.group}
                </span>
                {p.priority > 0 && (
                  <span className="stars-display" style={{ marginLeft: 12 }}>
                    {p.priority >= 4 && <span className="hot-pill">Hot</span>}
                    <span className="stars readonly" aria-label={`Priority ${p.priority} of 5`}>
                      {Array.from({ length: 5 }, (_, k) => (
                        <span key={k} className={`star ${k < p.priority ? "filled" : ""}`}>
                          {k < p.priority ? "★" : ""}
                        </span>
                      ))}
                    </span>
                  </span>
                )}
              </div>
              <h2 className="vp-anim">{p.title}</h2>
              <div className="domain vp-anim">{p.domain}</div>
              <p className="overview vp-anim">{p.overview || p.summary}</p>

              {p.deliverables?.length > 0 && (
                <>
                  <h4 className="vp-anim">What you'll build</h4>
                  <ul>
                    {p.deliverables.map((d, j) => <li key={j} className="vp-anim">{d}</li>)}
                  </ul>
                </>
              )}

              {p.skills?.length > 0 && (
                <>
                  <h4 className="vp-anim">Skills you'll gain</h4>
                  <ul>
                    {p.skills.map((s, j) => <li key={j} className="vp-anim">{s}</li>)}
                  </ul>
                </>
              )}
            </div>
            <aside className="vp-right vp-anim">
              <h3>At a glance</h3>
              <div className="kv-row"><dt>Time / week</dt><dd>{p.timePerWeek}</dd></div>
              <div className="kv-row"><dt>Duration</dt><dd>{p.duration}</dd></div>
              <div className="kv-row"><dt>Prerequisites</dt><dd>{p.prerequisites}</dd></div>
              <div className="kv-row"><dt>Outcomes</dt><dd>{p.outcomes?.join(" · ") || ""}</dd></div>
              <div className="kv-row"><dt>Commercial outlook</dt><dd>{p.commercial}</dd></div>
              <div className="kv-row"><dt>Tech stack</dt><dd>{p.stack}</dd></div>
              <button
                className="btn btn-amber"
                onClick={() => applyToProject(p.id)}
                style={{ width: "100%", marginTop: 18, padding: "12px 16px" }}
              >
                Apply for this project →
              </button>
            </aside>
          </div>
        </section>
      ))}

      {/* Application form viewport */}
      <ApplyForm
        ref={formRef}
        projects={projects}
        sectionRef={(el) => (sectionRefs.current[projects.length] = el)}
      />
    </div>
    </>
  );
}

const ApplyForm = forwardRef(function ApplyForm({ projects, sectionRef }, ref) {
  const [form, setForm] = useState(EMPTY_APP);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  // Allow the parent (a per-project "Apply" button) to preselect a project.
  useImperativeHandle(ref, () => ({
    setProject(projectId) {
      setForm((f) => ({ ...f, projectId }));
      setErrors((er) => ({ ...er, projectId: undefined }));
    },
  }), []);

  function validate() {
    const e = {};
    const required = ["projectId", "fullName", "email", "phone", "rollNumber", "branch", "yearOfStudy", "whyThisProject"];
    for (const k of required) if (!String(form[k]).trim()) e[k] = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a 10-digit phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerErr("");
    if (!validate()) {
      document.querySelector(".apply-vp .invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
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
      <section className="apply-vp" ref={sectionRef}>
        <div className="apply-inner" style={{ textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: "rgba(255,255,255,.1)", color: "var(--amber-2)",
            display: "grid", placeItems: "center",
            margin: "0 auto 24px", fontSize: 32,
          }}>✓</div>
          <h2>Application received.</h2>
          <p className="lede">
            Thanks {form.fullName.split(" ")[0]}, your application for{" "}
            <strong style={{ color: "var(--amber-2)" }}>
              {projects.find((p) => p.id === form.projectId)?.title}
            </strong>{" "}
            is in. We respond within 7 working days at {form.email}.
          </p>
          <Link href="/" className="btn btn-amber" style={{ marginTop: 12 }}>
            Back to home →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="apply-vp" ref={sectionRef} id="apply">
      <div className="apply-inner">
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".14em",
          textTransform: "uppercase", color: "var(--amber-2)", marginBottom: 14,
        }}>
          Apply
        </div>
        <h2>One project. <em style={{ color: "var(--amber-2)", fontStyle: "normal" }}>One application.</em></h2>
        <p className="lede">
          Pick the project you want to work on, tell us briefly about yourself and why
          it interests you. Takes ~3 minutes.
        </p>

        <div className="field">
          <label>
            Which project? <span className="req">*</span>
          </label>
          <select
            className={errors.projectId ? "invalid" : ""}
            value={form.projectId}
            onChange={set("projectId")}
          >
            <option value="">Select a project…</option>
            <optgroup label="Group A · Multi-disciplinary">
              {projects.filter((p) => p.group === "A").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.priority > 0 ? "★".repeat(p.priority) + "  " : ""}{p.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="Group B · Solo modules">
              {projects.filter((p) => p.group === "B").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.priority > 0 ? "★".repeat(p.priority) + "  " : ""}{p.title}
                </option>
              ))}
            </optgroup>
          </select>
          {errors.projectId && <div className="err">{errors.projectId}</div>}
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
            <label>Phone <span className="req">*</span></label>
            <input
              className={errors.phone ? "invalid" : ""}
              value={form.phone} onChange={set("phone")}
              placeholder="9876543210"
            />
            {errors.phone && <div className="err">{errors.phone}</div>}
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Roll / Enrolment no. <span className="req">*</span></label>
            <input
              className={errors.rollNumber ? "invalid" : ""}
              value={form.rollNumber} onChange={set("rollNumber")}
              placeholder="2K26/SE/001"
            />
            {errors.rollNumber && <div className="err">{errors.rollNumber}</div>}
          </div>
          <div className="field">
            <label>Year of study <span className="req">*</span></label>
            <select
              className={errors.yearOfStudy ? "invalid" : ""}
              value={form.yearOfStudy} onChange={set("yearOfStudy")}
            >
              <option value="">Select…</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
            {errors.yearOfStudy && <div className="err">{errors.yearOfStudy}</div>}
          </div>
        </div>

        <div className="field">
          <label>Branch / Department <span className="req">*</span></label>
          <input
            className={errors.branch ? "invalid" : ""}
            value={form.branch} onChange={set("branch")}
            placeholder="e.g. Software Engineering"
          />
          {errors.branch && <div className="err">{errors.branch}</div>}
        </div>

        <div className="field">
          <label>Time you can devote</label>
          <select value={form.timeCommit} onChange={set("timeCommit")}>
            <option value="">Select…</option>
            {HOURS_PER_WEEK.map((h) => <option key={h}>{h}</option>)}
          </select>
          <div className="hint">Hours per week. Be realistic.</div>
        </div>

        <div className="field">
          <label>Current skills</label>
          <textarea
            rows={3} value={form.currentSkills} onChange={set("currentSkills")}
            placeholder="Languages, tools, hardware experience. What you can use today."
          />
        </div>

        <div className="field">
          <label>What do you want to learn?</label>
          <textarea
            rows={2} value={form.wantToLearn} onChange={set("wantToLearn")}
            placeholder="Specific skills or topics you hope to pick up on this project."
          />
        </div>

        <div className="field">
          <label>Previous work</label>
          <textarea
            rows={3} value={form.previousWork} onChange={set("previousWork")}
            placeholder="Class projects, hackathons, internships, side projects. A few lines."
          />
        </div>

        <div className="field">
          <label>Relevant coursework</label>
          <input
            value={form.coursework} onChange={set("coursework")}
            placeholder="Embedded Systems, Networks, ML, Signals…"
          />
        </div>

        <div className="field">
          <label>Why this project? <span className="req">*</span></label>
          <textarea
            className={errors.whyThisProject ? "invalid" : ""}
            rows={4} value={form.whyThisProject} onChange={set("whyThisProject")}
            placeholder="The single most important field on this form. Tell us in 3-5 sentences why this specific project is the right one for you."
          />
          {errors.whyThisProject && <div className="err">{errors.whyThisProject}</div>}
        </div>

        {serverErr && (
          <div className="err-banner" style={{ marginBottom: 14 }}>{serverErr}</div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18 }}>
          <button
            className="btn btn-amber" onClick={submit} disabled={submitting}
            style={{ minWidth: 180, padding: "13px 24px" }}
          >
            {submitting ? <span className="spin" /> : "Submit application"}
          </button>
          <span style={{ fontSize: 12, color: "rgba(251,248,241,.6)" }}>
            Required fields marked <span style={{ color: "var(--amber-2)", fontWeight: 700 }}>*</span>
          </span>
        </div>
      </div>
    </section>
  );
});
