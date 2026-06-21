import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "slug", "group", "title", "domain", "summary", "overview",
  "deliverables", "skills", "equipment", "manpower",
  "timePerWeek", "duration", "prerequisites",
  "outcomes", "commercial", "stack",
  "orderIndex", "visible", "priority",
];

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const data = {};
    for (const k of ALLOWED) if (k in body) data[k] = body[k];
    const updated = await prisma.project.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e.code === "P2002") return NextResponse.json({ error: "Duplicate slug." }, { status: 409 });
    if (e.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
