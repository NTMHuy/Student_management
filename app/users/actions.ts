"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export type Values = Record<string, string>;
export type FormState = { error?: string; values?: Values };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  // Không trả lại mật khẩu về form khi có lỗi
  const values: Values = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: String(formData.get("role") ?? ""),
    teacherId: String(formData.get("teacherId") ?? ""),
  };
  const password = String(formData.get("password") ?? "");
  const fail = (error: string) => ({ error, values });

  if (!emailRe.test(values.email) || values.email.length > 255) return fail("Email không hợp lệ");
  if (password.length < 8) return fail("Mật khẩu phải có ít nhất 8 ký tự");
  if (password.length > 72) return fail("Mật khẩu tối đa 72 ký tự");
  if (values.role !== "ADMIN" && values.role !== "TEACHER") return fail("Vai trò không hợp lệ");
  const role = values.role;

  let teacherId: number | null = null;
  if (role === "TEACHER") {
    teacherId = Number(values.teacherId);
    if (!values.teacherId || !Number.isInteger(teacherId)) {
      return fail("Tài khoản giáo viên phải gắn với một hồ sơ giáo viên");
    }
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });
    if (!teacher) return fail("Giáo viên không tồn tại");
    if (teacher.user) return fail("Giáo viên này đã có tài khoản");
  }

  if (await prisma.user.findUnique({ where: { email: values.email } })) {
    return fail("Email này đã có tài khoản");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email: values.email, passwordHash, role, teacherId } });

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: number): Promise<void> {
  const admin = await requireAdmin();
  if (id === admin.id) redirect("/users?error=self");

  await prisma.user.deleteMany({ where: { id } });
  revalidatePath("/users");
  redirect("/users");
}
