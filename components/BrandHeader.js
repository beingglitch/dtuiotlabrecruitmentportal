"use client";

import { useState } from "react";

export default function BrandHeader({ compact = false }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {imgOk ? (
        // Drop the official logo at /public/dtu-logo.png and it appears here.
        <img
          src="/dtu-logo.png"
          alt="Delhi Technological University"
          width={compact ? 40 : 52}
          height={compact ? 40 : 52}
          style={{ objectFit: "contain", display: "block" }}
          onError={() => setImgOk(false)}
        />
      ) : (
        <Crest size={compact ? 40 : 52} />
      )}
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ fontWeight: 700, fontSize: compact ? 14 : 16, letterSpacing: "-.01em" }}>
          Delhi Technological University
        </div>
        <div style={{ fontSize: compact ? 11 : 12.5, color: "var(--muted)" }}>
          IoT Lab · Department of Software Engineering
        </div>
      </div>
    </div>
  );
}

function Crest({ size = 52 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: 10, background: "var(--ink)", color: "var(--paper)",
        display: "grid", placeItems: "center",
        border: "2px solid var(--amber)",
      }}
    >
      <span className="serif" style={{ fontWeight: 700, fontSize: size * 0.36, letterSpacing: "-.02em" }}>
        DTU
      </span>
    </div>
  );
}
