"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function LandingPage() {
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    let ctx;
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Hero: stagger from slightly below — opacity stays at 1 so contrast
        // is never an issue even if the animation is interrupted.
        gsap.from(".hero-anim", {
          y: 22,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.07,
          clearProps: "transform",
        });
        // Section reveals on scroll — slide-up only, no fade.
        sectionsRef.current.forEach((el) => {
          if (!el) return;
          gsap.from(el.querySelectorAll(".gsap-fade"), {
            y: 18,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.06,
            clearProps: "transform",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          });
        });
      });
    })();
    return () => { try { ctx?.revert(); } catch {} };
  }, []);

  return (
    <>
      {/* Sticky nav */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <img src="/dtu-logo.png" alt="DTU" onError={(e) => (e.currentTarget.style.display = "none")} />
            <div className="brand-text">
              <div className="brand-title">IoT Research and Innovation Lab</div>
              <div className="brand-sub">Department of Software Engineering</div>
              <div className="brand-sub">Delhi Technological University</div>
            </div>
          </Link>
          <div className="nav-links">
            <a href="#about" className="nav-secondary">About</a>
            <a href="#projects" className="nav-secondary">Projects</a>
            <Link href="/suggest" className="nav-secondary">Suggest</Link>
            <a href="#contact" className="nav-secondary">Contact</a>
            <Link href="/admin">Admin</Link>
            <Link href="/projects" className="btn btn-amber btn-sm">View projects</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" ref={heroRef}>
        <div className="wrap-wide" style={{ width: "100%" }}>
          <div className="eyebrow hero-anim" style={{ marginBottom: 16 }}>
            <span style={{ color: "var(--amber)", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", fontSize: 11 }}>
              · Call for Applications · 2026
            </span>
          </div>
          <h1 className="hero-anim">
            Research projects at the<br />
            <em>IoT Research Lab</em>, DTU.
          </h1>
          <p className="lede hero-anim">
            The IoT Research Lab at the Department of Software Engineering,
            Delhi Technological University (DTU), invites applications from
            motivated students to work on real-world, high-impact research projects.
          </p>
          <div className="cta-row hero-anim">
            <Link href="/projects" className="btn btn-amber" style={{ padding: "13px 24px" }}>
              Apply & see project details →
            </Link>
            <a href="#about" className="btn btn-ghost">What we do</a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="landing-section" id="about" ref={(el) => (sectionsRef.current[0] = el)}>
        <div className="wrap-wide">
          <div className="eyebrow gsap-fade">About the lab</div>
          <h2 className="gsap-fade">
            Real problems. <em>Real systems.</em><br />
            No toy projects.
          </h2>
          <div className="about-grid">
            <div className="body gsap-fade">
              <p>
                The lab focuses on building advanced, tangible systems for AI and
                IoT-based autonomous systems, resilient communications, and edge AI,
                with a strong emphasis on defence-technology applications.
              </p>
              <p>
                Students selected for these positions will work in small teams alongside
                practising engineers — moving away from toy projects to deliver functioning
                prototypes, open-source libraries, or publishable research papers.
              </p>
            </div>
            <aside className="about-card gsap-fade">
              <h4>Faculty Lead</h4>
              <div className="name">Prof. Sanjay Patidar</div>
              <div className="role">Department of Software Engineering, DTU</div>
              <div className="bio" style={{ marginBottom: 12 }}>
                Founder of the IoT Research Lab.
              </div>
              <div style={{ fontSize: 13 }}>
                <a className="link" href="mailto:sanjaypatidar@dtu.ac.in">
                  sanjaypatidar@dtu.ac.in
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Projects preview */}
      <section className="landing-section" id="projects" ref={(el) => (sectionsRef.current[1] = el)}>
        <div className="wrap-wide">
          <div className="eyebrow gsap-fade">Available project tracks</div>
          <h2 className="gsap-fade">
            Pick a track. <em>Ship something real.</em>
          </h2>
          <p className="body gsap-fade">
            Applicants can apply to one of two distinct tracks based on their
            interests and skills. Each project has a full brief on the projects page.
            Have a different idea? Suggest it.
          </p>
          <div className="preview-tiles">
            <div className="preview-tile gsap-fade">
              <div className="tag">Group A · Multi-disciplinary team projects</div>
              <h3>Long-term, collaborative work.</h3>
              <p>
                A few months of focused effort within small teams. Core focus areas:
                military-grade Ground Control Systems (GCS); resilient communication
                systems and mesh networks; drone swarms and counter-drone detection;
                advanced perception systems for autonomous platforms.
              </p>
            </div>
            <div className="preview-tile gsap-fade">
              <div className="tag">Group B · Solo engineering modules</div>
              <h3>One person. One concrete deliverable.</h3>
              <p>
                Highly focused, individual modules. Core focus areas:
                flight-controller and Electronic Speed Controller (ESC) firmware;
                GNSS driver implementation and LoRa telemetry integration;
                ROS2 sensor drivers; RF spectrum analysis and network diagnostics.
              </p>
            </div>
          </div>
          <div className="cta-row gsap-fade" style={{ marginTop: 36 }}>
            <Link href="/projects" className="btn btn-amber" style={{ padding: "13px 24px" }}>
              Apply & see project details →
            </Link>
            <Link href="/suggest" className="btn btn-ghost">Suggest a project</Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="landing-section" id="contact" ref={(el) => (sectionsRef.current[2] = el)}>
        <div className="wrap-wide">
          <div className="eyebrow gsap-fade">Contact</div>
          <h2 className="gsap-fade">Get in touch.</h2>
          <p className="body gsap-fade">
            For applications, use the form on the projects page. For everything else (research
            collaboration, industry mentorship, or general queries), write to us directly.
          </p>
          <div className="contact-grid">
            <div className="contact-tile gsap-fade">
              <h4>Faculty</h4>
              <div className="muted" style={{ marginBottom: 10 }}>
                Prof. Sanjay Patidar<br />
                Department of Software Engineering<br />
                Delhi Technological University<br />
                Shahbad Daulatpur, Delhi-110042
              </div>
              <div style={{ fontSize: 13 }}>
                <a className="link" href="mailto:sanjaypatidar@dtu.ac.in">
                  sanjaypatidar@dtu.ac.in
                </a>
              </div>
            </div>
            <div className="contact-tile gsap-fade">
              <h4>For applicants</h4>
              <div className="muted">
                Open the <Link href="/projects" className="link">projects page</Link>, read the
                briefs, and submit the form at the bottom. To pitch a different idea, use the{" "}
                <Link href="/suggest" className="link">suggest a project</Link> page.
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        IoT Research Lab · Department of Software Engineering · Delhi Technological University
      </footer>
    </>
  );
}
