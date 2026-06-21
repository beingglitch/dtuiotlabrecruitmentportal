import { prisma } from "@/lib/prisma";
import ApplicationsDashboard from "./ApplicationsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const apps = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { project: { select: { id: true, slug: true, title: true, group: true } } },
  });
  const projects = await prisma.project.findMany({
    orderBy: { orderIndex: "asc" },
    select: { id: true, slug: true, title: true, group: true, visible: true },
  });
  const data = apps.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
  return <ApplicationsDashboard initial={data} projects={projects} />;
}
