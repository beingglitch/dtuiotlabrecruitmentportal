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

const REQUIRED = ["slug", "group", "title", "domain", "summary"];

export async function GET() {
  const rows = await prisma.project.findMany({
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req) {
  try {
    const body = await req.json();
    for (const k of REQUIRED) {
      if (!body[k] || !String(body[k]).trim()) {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }
    if (!["A", "B"].includes(body.group)) {
      return NextResponse.json({ error: "group must be 'A' or 'B'" }, { status: 400 });
    }
    // Default orderIndex to "end of list" if not provided.
    if (body.orderIndex == null) {
      const last = await prisma.project.findFirst({
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      });
      body.orderIndex = (last?.orderIndex ?? -1) + 1;
    }
    const data = {};
    for (const k of ALLOWED) if (k in body) data[k] = body[k];
    // Default empty JSON arrays for the array-shaped fields.
    for (const k of ["deliverables", "skills", "outcomes"]) {
      if (!(k in data)) data[k] = "[]";
    }
    // Default empty strings for required-non-null DB columns.
    for (const k of ["overview", "equipment", "manpower", "timePerWeek", "duration", "prerequisites", "commercial", "stack"]) {
      if (!(k in data)) data[k] = "";
    }
    const created = await prisma.project.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "A project with this slug already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
