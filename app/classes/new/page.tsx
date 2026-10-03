import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import ClassForm from "../class-form";
import { createClass } from "../actions";

export default async function NewClassPage() {
  await requireAdmin();
  const teachers = await prisma.teacher.findMany({ orderBy: { fullName: "asc" } });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Thêm lớp</h1>
      <ClassForm action={createClass} teachers={teachers} submitLabel="Thêm lớp" />
    </main>
  );
}
