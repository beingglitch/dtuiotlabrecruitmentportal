import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.project.findMany({
    where: { visible: true },
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json(rows);
}
