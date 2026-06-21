import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Body: { order: [projectId, projectId, ...] }
// Writes the array index into each project's orderIndex.
export async function POST(req) {
  try {
    const { order } = await req.json();
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Expected { order: [...] }" }, { status: 400 });
    }
    await prisma.$transaction(
      order.map((id, idx) =>
        prisma.project.update({
          where: { id },
          data: { orderIndex: idx },
        })
      )
    );
    return NextResponse.json({ ok: true, count: order.length });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
