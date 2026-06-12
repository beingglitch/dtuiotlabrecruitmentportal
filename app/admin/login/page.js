"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Login failed");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <form className="card" onSubmit={submit} style={{ padding: 36, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
          color: "var(--amber)", marginBottom: 8 }}>Admin access</div>
        <h1 className="serif" style={{ fontSize: 26, marginBottom: 6 }}>Sign in</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>
          Enter the admin password to manage registrations.
        </p>
        <div className="field">
          <label>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            className={err ? "invalid" : ""} placeholder="••••••••" autoFocus />
          {err && <div className="err">{err}</div>}
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? <span className="spin" /> : "Sign in"}
        </button>
        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          ← Back to registration
        </a>
      </form>
    </main>
  );
}
