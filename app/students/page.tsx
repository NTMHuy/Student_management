import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { classScope, requireUser, studentScope } from "@/lib/dal";
import { deleteStudent } from "./actions";
import DeleteButton from "./delete-button";
import { genderLabels } from "./labels";

const PAGE_SIZE = 10;
const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string; gender?: string; page?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const classId = Number(sp.classId);
  const gender = GENDERS.find((g) => g === sp.gender);

  const where = {
    ...studentScope(user),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" as const } },
            { studentCode: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(Number.isInteger(classId) && classId > 0 ? { classId } : {}),
    ...(gender ? { gender } : {}),
  };

  const total = await prisma.student.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(sp.page) || 1), totalPages);

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { class: true },
      orderBy: { studentCode: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.class.findMany({
      where: classScope(user),
      orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
    }),
  ]);

  // Giữ nguyên bộ lọc khi chuyển trang
  const base = new URLSearchParams();
  if (q) base.set("q", q);
  if (sp.classId) base.set("classId", sp.classId);
  if (gender) base.set("gender", gender);
  const pageHref = (p: number) => {
    const s = new URLSearchParams(base);
    s.set("page", String(p));
    return `/students?${s}`;
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Học sinh ({total})</h1>
        <Link href="/students/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + Thêm học sinh
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Tìm theo tên hoặc mã"
          className="rounded border px-3 py-2"
        />
        <select name="classId" defaultValue={sp.classId ?? ""} className="rounded border px-3 py-2">
          <option value="">Tất cả lớp</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.schoolYear})
            </option>
          ))}
        </select>
        <select name="gender" defaultValue={gender ?? ""} className="rounded border px-3 py-2">
          <option value="">Mọi giới tính</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {genderLabels[g]}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded border px-4 py-2">
          Lọc
        </button>
        <Link href="/students" className="px-2 py-2 text-sm text-gray-600">
          Xóa lọc
        </Link>
      </form>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Mã</th>
            <th>Họ tên</th>
            <th>Lớp</th>
            <th>Giới tính</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="py-2">{s.studentCode}</td>
              <td>
                <Link href={`/students/${s.id}`} className="text-blue-600">
                  {s.fullName}
                </Link>
              </td>
              <td>{s.class.name}</td>
              <td>{genderLabels[s.gender]}</td>
              <td className="flex justify-end gap-3 py-2">
                <Link href={`/students/${s.id}/edit`} className="text-blue-600">
                  Sửa
                </Link>
                <DeleteButton
                  action={deleteStudent.bind(null, s.id)}
                  confirmText={`Xóa học sinh ${s.fullName}?`}
                />
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                Không có học sinh nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? <Link href={pageHref(page - 1)}>← Trước</Link> : <span className="text-gray-400">← Trước</span>}
          <span>
            Trang {page}/{totalPages}
          </span>
          {page < totalPages ? <Link href={pageHref(page + 1)}>Sau →</Link> : <span className="text-gray-400">Sau →</span>}
        </div>
      )}
    </main>
  );
}
