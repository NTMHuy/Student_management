"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState, Values } from "./actions";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: Values;
  submitLabel: string;
};

const inputCls = "rounded border px-3 py-2";

export default function TeacherForm({ action, defaults, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Khi server trả lỗi, dùng lại giá trị vừa nhập (React tự reset form sau mỗi action)
  const v: Values = state.values ?? defaults ?? {};

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Mã giáo viên
        <input name="teacherCode" defaultValue={v.teacherCode} placeholder="GV001" className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Họ và tên
        <input name="fullName" defaultValue={v.fullName} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Bộ môn
        <input name="subject" defaultValue={v.subject} placeholder="Toán" className={inputCls} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" defaultValue={v.email} className={inputCls} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Số điện thoại
        <input name="phone" defaultValue={v.phone} className={inputCls} />
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {pending ? "Đang lưu..." : submitLabel}
        </button>
        <Link href="/teachers" className="rounded border px-4 py-2">
          Hủy
        </Link>
      </div>
    </form>
  );
}
