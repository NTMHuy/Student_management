import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, studentScope } from "@/lib/dal";
import { deleteStudent } from "../actions";
import DeleteButton from "../delete-button";
import { genderLabels } from "../labels";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId)) notFound();

  const s = await prisma.student.findFirst({
    where: { id: studentId, ...studentScope(user) },
    include: { class: true },
  });
  if (!s) notFound();

  const rows: [string, string][] = [
    ["Mã học sinh", s.studentCode],
    ["Họ và tên", s.fullName],
    ["Ngày sinh", s.dateOfBirth.toLocaleDateString("vi-VN", { timeZone: "UTC" })],
    ["Giới tính", genderLabels[s.gender]],
    ["Lớp", `${s.class.name} (${s.class.schoolYear})`],
    ["Email", s.email ?? "—"],
    ["Số điện thoại", s.phone ?? "—"],
    ["Địa chỉ", s.address ?? "—"],
  ];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Thông tin học sinh</h1>

      <dl className="mb-6 grid grid-cols-[160px_1fr] gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-gray-600">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex items-center gap-4">
        <Link href={`/students/${s.id}/edit`} className="rounded bg-blue-600 px-4 py-2 text-white">
          Chỉnh sửa
        </Link>
        <DeleteButton
          action={deleteStudent.bind(null, s.id)}
          confirmText={`Xóa học sinh ${s.fullName}?`}
          className="rounded border border-red-600 px-4 py-2 text-red-600"
        />
        <Link href="/students" className="text-gray-600">
          ← Danh sách
        </Link>
      </div>
    </main>
  );
}
