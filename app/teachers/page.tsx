import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import DeleteButton from "@/app/students/delete-button";
import { deleteTeacher } from "./actions";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  const teachers = await prisma.teacher.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { teacherCode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    include: { _count: { select: { classes: true } } },
    orderBy: { teacherCode: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Giáo viên ({teachers.length})</h1>
        <Link href="/teachers/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Thêm giáo viên
        </Link>
      </div>

      <form className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc mã"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="rounded border px-4 py-2">
          Tìm
        </button>
        <Link href="/teachers" className="px-2 py-2 text-sm text-gray-600">
          Xóa lọc
        </Link>
      </form>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Mã</th>
            <th>Họ tên</th>
            <th>Bộ môn</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Lớp chủ nhiệm</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-2">{t.teacherCode}</td>
              <td>{t.fullName}</td>
              <td>{t.subject ?? "—"}</td>
              <td>{t.email ?? "—"}</td>
              <td>{t.phone ?? "—"}</td>
              <td>{t._count.classes}</td>
              <td className="flex justify-end gap-3 py-2">
                <Link href={`/teachers/${t.id}/edit`} className="text-blue-600">
                  Sửa
                </Link>
                <DeleteButton
                  action={deleteTeacher.bind(null, t.id)}
                  confirmText={
                    t._count.classes > 0
                      ? `Xóa giáo viên ${t.fullName}? ${t._count.classes} lớp chủ nhiệm sẽ không còn giáo viên chủ nhiệm.`
                      : `Xóa giáo viên ${t.fullName}?`
                  }
                />
              </td>
            </tr>
          ))}
          {teachers.length === 0 && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-gray-500">
                Không có giáo viên nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
