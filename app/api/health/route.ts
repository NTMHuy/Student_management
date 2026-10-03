import { prisma } from "@/lib/prisma";

export async function GET() {
  const [classes, students] = await Promise.all([
    prisma.class.count(),
    prisma.student.count(),
  ]);
  return Response.json({ ok: true, classes, students });
}