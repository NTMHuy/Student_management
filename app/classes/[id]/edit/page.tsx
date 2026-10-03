import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import ClassForm from "../../class-form";
import { updateClass } from "../../actions";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const classId = Number(id);
  if (!Number.isInteger(classId)) notFound();

  const [cls, teachers] = await Promise.all([
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.teacher.findMany({ orderBy: { fullName: "asc" } }),
  ]);
  if (!cls) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sửa lớp {cls.name}</h1>
      <ClassForm
        action={updateClass.bind(null, cls.id)}
        teachers={teachers}
        submitLabel="Lưu thay đổi"
        defaults={{
          name: cls.name,
          schoolYear: cls.schoolYear,
          homeroomTeacherId: cls.homeroomTeacherId ? String(cls.homeroomTeacherId) : "",
        }}
      />
    </main>
  );
}
