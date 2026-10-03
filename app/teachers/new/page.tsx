import { requireAdmin } from "@/lib/dal";
import { createTeacher } from "../actions";
import TeacherForm from "../teacher-form";

export default async function NewTeacherPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Thêm giáo viên</h1>
      <TeacherForm action={createTeacher} submitLabel="Thêm giáo viên" />
    </main>
  );
}
