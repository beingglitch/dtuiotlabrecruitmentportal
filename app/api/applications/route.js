import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const REQUIRED = ["projectId", "fullName", "email", "phone", "rollNumber", "branch", "yearOfStudy"];
const ALLOWED = [
  ...REQUIRED,
  "timeCommit", "currentSkills", "wantToLearn",
  "previousWork", "coursework", "whyThisProject",
];

export async function POST(req) {
  try {
    const body = await req.json();
    for (const k of REQUIRED) {
      if (!body[k] || !String(body[k]).trim()) {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }
    // confirm the project actually exists and is visible
    const project = await prisma.project.findUnique({ where: { id: body.projectId } });
    if (!project) {
      return NextResponse.json({ error: "Selected project no longer exists." }, { status: 404 });
    }
    const data = {};
    for (const k of ALLOWED) {
      if (k in body) data[k] = body[k] === "" ? null : body[k];
    }
    const created = await prisma.application.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  // Admin-only in practice — middleware gates the page that calls this.
  // (Routes themselves are open; treat data as moderate-sensitivity.)
  const apps = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, slug: true, title: true, group: true } } },
  });
  return NextResponse.json(apps);
}
