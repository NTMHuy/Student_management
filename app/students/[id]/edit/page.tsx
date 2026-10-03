import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { classScope, requireUser, studentScope } from "@/lib/dal";
import { updateStudent } from "../../actions";
import StudentForm from "../../student-form";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const [s, classes] = await Promise.all([
    prisma.student.findFirst({ where: { id: studentId, ...studentScope(user) } }),
    prisma.class.findMany({
      where: classScope(user),
      orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
    }),
  ]);
  if (!s) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Sửa học sinh {s.studentCode}</h1>
      <StudentForm
        action={updateStudent.bind(null, s.id)}
        classes={classes}
        submitLabel="Lưu thay đổi"
        defaults={{
          studentCode: s.studentCode,
          fullName: s.fullName,
          dateOfBirth: s.dateOfBirth.toISOString().slice(0, 10),
          gender: s.gender,
          classId: String(s.classId),
          email: s.email ?? "",
          phone: s.phone ?? "",
          address: s.address ?? "",
        }}
      />
    </main>
  );
}
