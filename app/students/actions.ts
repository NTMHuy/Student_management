"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { classScope, requireUser, studentScope, type CurrentUser } from "@/lib/dal";
import { studentSchema } from "./schema";

export type Values = Record<string, string>;
// values: giữ lại dữ liệu đã nhập để form không bị xóa trắng khi có lỗi
export type FormState = { error?: string; values?: Values };

const FIELDS = [
  "studentCode",
  "fullName",
  "dateOfBirth",
  "gender",
  "classId",
  "email",
  "phone",
  "address",
] as const;

async function validate(formData: FormData, user: CurrentUser, excludeId?: number) {
  const values: Values = Object.fromEntries(
    FIELDS.map((k) => [k, String(formData.get(k) ?? "")])
  );
  const fail = (error: string) => ({ error, values });

  const parsed = studentSchema.safeParse(values);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;

  // id luôn > 0 nên 0 nghĩa là "không loại trừ ai" (dùng khi thêm mới)
  const notSelf = { NOT: { id: excludeId ?? 0 } };

  const codeTaken = await prisma.student.findFirst({
    where: { studentCode: d.studentCode, ...notSelf },
  });
  if (codeTaken) return fail("Mã học sinh đã tồn tại");

  if (d.email) {
    const emailTaken = await prisma.student.findFirst({
      where: { email: d.email, ...notSelf },
    });
    if (emailTaken) return fail("Email đã được dùng bởi học sinh khác");
  }

  // Phân quyền: giáo viên chỉ được dùng lớp mình chủ nhiệm
  const cls = await prisma.class.findFirst({
    where: { id: d.classId, ...classScope(user) },
  });
  if (!cls) return fail("Lớp không tồn tại hoặc bạn không có quyền với lớp này");

  return {
    data: {
      studentCode: d.studentCode,
      fullName: d.fullName,
      dateOfBirth: new Date(`${d.dateOfBirth}T00:00:00Z`),
      gender: d.gender,
      classId: d.classId,
      email: d.email || null,
      phone: d.phone || null,
      address: d.address || null,
    },
  };
}

export async function createStudent(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();
  const r = await validate(formData, user);
  if ("error" in r) return r;

  await prisma.student.create({ data: r.data });
  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudent(
  id: number,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser();

  // Học sinh phải nằm trong phạm vi của người dùng (Server Action có thể bị gọi trực tiếp)
  const target = await prisma.student.findFirst({
    where: { id, ...studentScope(user) },
    select: { id: true },
  });
  if (!target) redirect("/forbidden");

  const r = await validate(formData, user, id);
  if ("error" in r) return r;

  await prisma.student.update({ where: { id }, data: r.data });
  revalidatePath("/students");
  redirect("/students");
}

export async function deleteStudent(id: number): Promise<void> {
  const user = await requireUser();

  await prisma.student.deleteMany({ where: { id, ...studentScope(user) } });
  revalidatePath("/students");
  redirect("/students");
}
