import { prisma } from "@/lib/prisma";
import SuggestionsAdmin from "./SuggestionsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSuggestionsPage() {
  const rows = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
  });
  const data = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
  return <SuggestionsAdmin initial={data} />;
}
