import { prisma } from "@/lib/prisma";
import ProjectsAdmin from "./ProjectsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const rows = await prisma.project.findMany({
    orderBy: { orderIndex: "asc" },
  });
  // Serialize dates so it travels as a Server Component prop
  const data = rows.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  return <ProjectsAdmin initial={data} />;
}
