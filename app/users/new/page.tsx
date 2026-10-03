import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { createUser } from "../actions";
import UserForm from "../user-form";

export default async function NewUserPage() {
  await requireAdmin();

  // Chỉ liệt kê giáo viên chưa có tài khoản
  const teachers = await prisma.teacher.findMany({
    where: { user: { is: null } },
    orderBy: { fullName: "asc" },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Tạo tài khoản</h1>
      <UserForm action={createUser} teachers={teachers} />
    </main>
  );
}
