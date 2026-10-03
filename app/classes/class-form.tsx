"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState, Values } from "./actions";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  teachers: { id: number; teacherCode: string; fullName: string }[];
  defaults?: Values;
  submitLabel: string;
};

const inputCls = "rounded border px-3 py-2";

export default function ClassForm({ action, teachers, defaults, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Khi server trả lỗi, dùng lại giá trị vừa nhập (React tự reset form sau mỗi action)
  const v: Values = state.values ?? defaults ?? {};

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Tên lớp
        <input name="name" defaultValue={v.name} placeholder="10A1" className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Năm học
        <input name="schoolYear" defaultValue={v.schoolYear} placeholder="2025-2026" className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Giáo viên chủ nhiệm
        <select name="homeroomTeacherId" defaultValue={v.homeroomTeacherId ?? ""} className={inputCls}>
          <option value="">-- Chưa có --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName} ({t.teacherCode})
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {pending ? "Đang lưu..." : submitLabel}
        </button>
        <Link href="/classes" className="rounded border px-4 py-2">
          Hủy
        </Link>
      </div>
    </form>
  );
}
