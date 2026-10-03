import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

// Lấy người dùng hiện tại từ database (vai trò luôn mới nhất, tài khoản bị xóa thì mất quyền ngay)
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, teacherId: true },
  });
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/forbidden");
  return user;
}

// Phạm vi dữ liệu: ADMIN thấy tất cả, TEACHER chỉ thấy lớp mình chủ nhiệm và học sinh của các lớp đó.
// (teacherId ?? -1: tài khoản giáo viên chưa gắn hồ sơ giáo viên thì không thấy gì)
export function classScope(user: CurrentUser) {
  return user.role === "ADMIN" ? {} : { homeroomTeacherId: user.teacherId ?? -1 };
}

export function studentScope(user: CurrentUser) {
  return user.role === "ADMIN" ? {} : { class: classScope(user) };
}
