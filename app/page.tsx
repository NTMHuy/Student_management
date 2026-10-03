import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { classScope, requireUser, studentScope } from "@/lib/dal";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const [studentCount, classCount, teacherCount, recent, byClass] = await Promise.all([
    prisma.student.count({ where: studentScope(user) }),
    prisma.class.count({ where: classScope(user) }),
    isAdmin ? prisma.teacher.count() : Promise.resolve(null),
    prisma.student.findMany({
      where: studentScope(user),
      include: { class: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.class.findMany({
      where: classScope(user),
      include: { _count: { select: { students: true } } },
      orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
    }),
  ]);

  const max = Math.max(1, ...byClass.map((c) => c._count.students));

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Tổng quan</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Học sinh" value={studentCount} />
        <StatCard label={isAdmin ? "Lớp học" : "Lớp phụ trách"} value={classCount} />
        {teacherCount !== null && <StatCard label="Giáo viên" value={teacherCount} />}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold">Học sinh mới</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between border-b pb-2">
                <Link href={`/students/${s.id}`} className="text-blue-600">
                  {s.fullName}
                </Link>
                <span className="text-gray-600">
                  {s.class.name} · {s.createdAt.toLocaleDateString("vi-VN")}
                </span>
              </li>
            ))}
            {recent.length === 0 && <li className="text-gray-500">Chưa có học sinh nào.</li>}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Phân bố học sinh theo lớp</h2>
          <div className="flex flex-col gap-2">
            {byClass.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0">
                  {c.name} <span className="text-gray-500">({c.schoolYear})</span>
                </span>
                <div className="h-3 flex-1 rounded bg-gray-100">
                  <div
                    className="h-3 rounded bg-blue-500"
                    style={{ width: `${(c._count.students / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{c._count.students}</span>
              </div>
            ))}
            {byClass.length === 0 && (
              <p className="text-sm text-gray-500">
                {isAdmin ? "Chưa có lớp nào." : "Bạn chưa được gán làm giáo viên chủ nhiệm lớp nào."}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
