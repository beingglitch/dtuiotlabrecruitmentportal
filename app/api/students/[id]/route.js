import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const b = await req.json();
    const allowed = [
      "fullName","dateOfBirth","gender","email","phone","address","city","state",
      "program","branch","yearOfStudy","rollNumber","previousScore","status","notes",
      "hoursPerWeek","durationMonths","workMode","outcomeGoals",
      "programmingLangs","hardwareLevel","toolsKnown",
      "pastProjects","githubUrl","coursework",
      "otherOutcome","otherLangs","otherTools","additionalInfo",
      "projectPreferences",
      "ownProjectTitle","ownProjectDescription","ownProjectResources","ownProjectOutcome",
    ];
    const data = {};
    for (const k of allowed) if (k in b) data[k] = b[k];
    const updated = await prisma.student.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    if (e.code === "P2002") {
      const field = e.meta?.target?.[0] || "value";
      return NextResponse.json({ error: `Duplicate ${field}.` }, { status: 409 });
    }
    if (e.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.student.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
