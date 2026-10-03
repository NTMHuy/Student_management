import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { classScope, requireUser } from "@/lib/dal";
import DeleteButton from "@/app/students/delete-button";
import { deleteClass } from "./actions";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const { error } = await searchParams;

  const classes = await prisma.class.findMany({
    where: classScope(user),
    orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
    include: {
      homeroomTeacher: true,
      _count: { select: { students: true } },
    },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isAdmin ? "Lớp học" : "Lớp phụ trách"}</h1>
        {isAdmin && (
          <Link href="/classes/new" className="rounded bg-blue-600 px-4 py-2 text-white">
            + Thêm lớp
          </Link>
        )}
      </div>

      {error === "has-students" && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
          Không thể xóa lớp đang có học sinh. Hãy chuyển hoặc xóa học sinh trước.
        </p>
      )}

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Tên lớp</th>
            <th>Năm học</th>
            <th>GV chủ nhiệm</th>
            <th>Số học sinh</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td>{c.schoolYear}</td>
              <td>{c.homeroomTeacher?.fullName ?? "—"}</td>
              <td>{c._count.students}</td>
              <td className="flex justify-end gap-3 py-2">
                <Link href={`/students?classId=${c.id}`} className="text-blue-600">
                  Học sinh
                </Link>
                {isAdmin && (
                  <>
                    <Link href={`/classes/${c.id}/edit`} className="text-blue-600">
                      Sửa
                    </Link>
                    <DeleteButton
                      action={deleteClass.bind(null, c.id)}
                      confirmText={`Xóa lớp ${c.name} (${c.schoolYear})?`}
                    />
                  </>
                )}
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                {isAdmin ? "Chưa có lớp nào." : "Bạn chưa được gán làm giáo viên chủ nhiệm lớp nào."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
