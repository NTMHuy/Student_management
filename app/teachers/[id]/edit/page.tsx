import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { updateTeacher } from "../../actions";
import TeacherForm from "../../teacher-form";

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const teacherId = Number(id);
  if (!Number.isInteger(teacherId)) notFound();

  const t = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!t) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sửa giáo viên {t.teacherCode}</h1>
      <TeacherForm
        action={updateTeacher.bind(null, t.id)}
        submitLabel="Lưu thay đổi"
        defaults={{
          teacherCode: t.teacherCode,
          fullName: t.fullName,
          email: t.email ?? "",
          phone: t.phone ?? "",
          subject: t.subject ?? "",
        }}
      />
    </main>
  );
}
