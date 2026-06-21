import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const allowed = ["status", "notes"];
    const data = {};
    for (const k of allowed) if (k in body) data[k] = body[k];
    const updated = await prisma.suggestion.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await prisma.suggestion.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
