import { prisma } from "@/lib/prisma";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const students = await prisma.student.findMany({ orderBy: { createdAt: "desc" } });
  // serialize dates
  const data = students.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));
  return <Dashboard initial={data} />;
}
