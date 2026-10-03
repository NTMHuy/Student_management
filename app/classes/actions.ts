"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export type Values = Record<string, string>;
export type FormState = { error?: string; values?: Values };

const FIELDS = ["name", "schoolYear", "homeroomTeacherId"] as const;

async function validate(formData: FormData, excludeId?: number) {
  const values: Values = Object.fromEntries(
    FIELDS.map((k) => [k, String(formData.get(k) ?? "")])
  );
  const fail = (error: string) => ({ error, values });

  const name = values.name.trim();
  const schoolYear = values.schoolYear.trim();

  if (!name) return fail("Tên lớp không được để trống");
  if (name.length > 20) return fail("Tên lớp tối đa 20 ký tự");

  const m = /^(\d{4})-(\d{4})$/.exec(schoolYear);
  if (!m || Number(m[2]) !== Number(m[1]) + 1) {
    return fail("Năm học phải có dạng 2025-2026");
  }

  // Giáo viên chủ nhiệm: để trống = chưa có
  let homeroomTeacherId: number | null = null;
  if (values.homeroomTeacherId !== "") {
    homeroomTeacherId = Number(values.homeroomTeacherId);
    const teacher = Number.isInteger(homeroomTeacherId)
      ? await prisma.teacher.findUnique({ where: { id: homeroomTeacherId } })
      : null;
    if (!teacher) return fail("Giáo viên không tồn tại");
  }

  // id luôn > 0 nên 0 nghĩa là "không loại trừ ai" (dùng khi thêm mới)
  const exists = await prisma.class.findFirst({
    where: { name, schoolYear, NOT: { id: excludeId ?? 0 } },
  });
  if (exists) return fail("Lớp này đã tồn tại trong năm học đó");

  return { data: { name, schoolYear, homeroomTeacherId } };
}

export async function createClass(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const r = await validate(formData);
  if ("error" in r) return r;

  await prisma.class.create({ data: r.data });
  revalidatePath("/classes");
  redirect("/classes");
}

export async function updateClass(
  id: number,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const r = await validate(formData, id);
  if ("error" in r) return r;

  await prisma.class.update({ where: { id }, data: r.data });
  revalidatePath("/classes");
  revalidatePath("/teachers");
  redirect("/classes");
}

export async function deleteClass(id: number): Promise<void> {
  await requireAdmin();
  // students.class_id dùng ON DELETE RESTRICT nên chặn xóa từ trước để báo lỗi dễ hiểu
  const count = await prisma.student.count({ where: { classId: id } });
  if (count > 0) redirect("/classes?error=has-students");

  await prisma.class.delete({ where: { id } });
  revalidatePath("/classes");
  revalidatePath("/teachers");
  redirect("/classes");
}
