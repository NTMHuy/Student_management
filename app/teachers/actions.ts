"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { teacherSchema } from "./schema";

export type Values = Record<string, string>;
export type FormState = { error?: string; values?: Values };

const FIELDS = ["teacherCode", "fullName", "email", "phone", "subject"] as const;

async function validate(formData: FormData, excludeId?: number) {
  const values: Values = Object.fromEntries(
    FIELDS.map((k) => [k, String(formData.get(k) ?? "")])
  );
  const fail = (error: string) => ({ error, values });

  const parsed = teacherSchema.safeParse(values);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;

  // id luôn > 0 nên 0 nghĩa là "không loại trừ ai" (dùng khi thêm mới)
  const notSelf = { NOT: { id: excludeId ?? 0 } };

  const codeTaken = await prisma.teacher.findFirst({
    where: { teacherCode: d.teacherCode, ...notSelf },
  });
  if (codeTaken) return fail("Mã giáo viên đã tồn tại");

  if (d.email) {
    const emailTaken = await prisma.teacher.findFirst({
      where: { email: d.email, ...notSelf },
    });
    if (emailTaken) return fail("Email đã được dùng bởi giáo viên khác");
  }

  return {
    data: {
      teacherCode: d.teacherCode,
      fullName: d.fullName,
      email: d.email || null,
      phone: d.phone || null,
      subject: d.subject || null,
    },
  };
}

export async function createTeacher(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const r = await validate(formData);
  if ("error" in r) return r;

  await prisma.teacher.create({ data: r.data });
  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function updateTeacher(
  id: number,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const r = await validate(formData, id);
  if ("error" in r) return r;

  await prisma.teacher.update({ where: { id }, data: r.data });
  revalidatePath("/teachers");
  revalidatePath("/classes");
  redirect("/teachers");
}

export async function deleteTeacher(id: number): Promise<void> {
  await requireAdmin();
  // classes.homeroom_teacher_id và users.teacher_id dùng ON DELETE SET NULL
  await prisma.teacher.deleteMany({ where: { id } });
  revalidatePath("/teachers");
  revalidatePath("/classes");
  redirect("/teachers");
}
