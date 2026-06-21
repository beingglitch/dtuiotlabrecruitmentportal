import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REQUIRED = ["fullName", "email", "title", "description"];
const ALLOWED = [
  ...REQUIRED,
  "rollNumber", "branch", "resources", "expectedOutcome",
];

export async function POST(req) {
  try {
    const body = await req.json();
    for (const k of REQUIRED) {
      if (!body[k] || !String(body[k]).trim()) {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }
    const data = {};
    for (const k of ALLOWED) {
      if (k in body) data[k] = body[k] === "" ? null : body[k];
    }
    const created = await prisma.suggestion.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  const rows = await prisma.suggestion.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rows);
}
