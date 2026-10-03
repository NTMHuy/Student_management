import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import DeleteButton from "@/app/students/delete-button";
import { deleteUser } from "./actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await requireAdmin();
  const { error } = await searchParams;

  const users = await prisma.user.findMany({
    include: { teacher: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Người dùng ({users.length})</h1>
        <Link href="/users/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Tạo tài khoản
        </Link>
      </div>

      {error === "self" && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
          Không thể xóa tài khoản đang đăng nhập.
        </p>
      )}

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Email</th>
            <th>Vai trò</th>
            <th>Giáo viên</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{u.email}</td>
              <td>{u.role === "ADMIN" ? "Quản trị viên" : "Giáo viên"}</td>
              <td>{u.teacher?.fullName ?? "—"}</td>
              <td className="flex justify-end py-2">
                {u.id !== admin.id && (
                  <DeleteButton
                    action={deleteUser.bind(null, u.id)}
                    confirmText={`Xóa tài khoản ${u.email}?`}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
