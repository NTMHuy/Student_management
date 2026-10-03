import { prisma } from "@/lib/prisma";
import { classScope, requireUser } from "@/lib/dal";
import { createStudent } from "../actions";
import StudentForm from "../student-form";

export default async function NewStudentPage() {
  const user = await requireUser();
  const classes = await prisma.class.findMany({
    where: classScope(user),
    orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Thêm học sinh</h1>
      <StudentForm action={createStudent} classes={classes} submitLabel="Thêm học sinh" />
    </main>
  );
}
