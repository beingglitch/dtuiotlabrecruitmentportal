import { prisma } from "@/lib/prisma";
import ProjectsClient from "./ProjectsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects · IoT Research Lab" };

export default async function ProjectsPage() {
  const rows = await prisma.project.findMany({
    where: { visible: true },
    orderBy: { orderIndex: "asc" },
  });
  // Serialize Date fields and parse JSON-array fields so the client gets
  // ready-to-use plain objects.
  const projects = rows.map((p) => ({
    ...p,
    deliverables: safeParse(p.deliverables, []),
    skills: safeParse(p.skills, []),
    outcomes: safeParse(p.outcomes, []),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  return <ProjectsClient projects={projects} />;
}

function safeParse(s, fallback) {
  if (!s) return fallback;
  try { return JSON.parse(s); } catch { return fallback; }
}
