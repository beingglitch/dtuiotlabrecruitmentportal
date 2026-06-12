import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NEW_FIELDS = [
  "hoursPerWeek", "durationMonths", "workMode", "outcomeGoals",
  "programmingLangs", "hardwareLevel", "toolsKnown",
  "pastProjects", "githubUrl", "coursework",
  "otherOutcome", "otherLangs", "otherTools", "additionalInfo",
  "projectPreferences",
  "ownProjectTitle", "ownProjectDescription", "ownProjectResources", "ownProjectOutcome",
];

export async function GET() {
  const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(students);
}

export async function POST(req) {
  try {
    const b = await req.json();
    const required = ["fullName","dateOfBirth","gender","email","phone","address","city","state","program","branch","yearOfStudy","rollNumber"];
    for (const k of required) {
      if (!b[k] || !String(b[k]).trim()) {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }

    const data = {
      fullName: b.fullName, dateOfBirth: b.dateOfBirth, gender: b.gender,
      email: b.email, phone: b.phone, address: b.address, city: b.city, state: b.state,
      program: b.program, branch: b.branch, yearOfStudy: b.yearOfStudy,
      rollNumber: b.rollNumber, previousScore: b.previousScore || null,
    };
    for (const k of NEW_FIELDS) {
      if (k in b) data[k] = b[k] === "" ? null : b[k];
    }

    const created = await prisma.student.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e.code === "P2002") {
      const field = e.meta?.target?.[0] || "email/roll number";
      return NextResponse.json({ error: `A student with this ${field} already exists.` }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
