"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState, Values } from "./actions";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  teachers: { id: number; teacherCode: string; fullName: string }[];
};

const inputCls = "rounded border px-3 py-2";

export default function UserForm({ action, teachers }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const v: Values = state.values ?? {};

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Email đăng nhập
        <input type="email" name="email" defaultValue={v.email} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Mật khẩu (ít nhất 8 ký tự)
        <input type="password" name="password" className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Vai trò
        <select name="role" defaultValue={v.role ?? "TEACHER"} className={inputCls}>
          <option value="TEACHER">Giáo viên</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Hồ sơ giáo viên (bắt buộc nếu vai trò là Giáo viên)
        <select name="teacherId" defaultValue={v.teacherId ?? ""} className={inputCls}>
          <option value="">-- Không gắn --</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName} ({t.teacherCode})
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {pending ? "Đang lưu..." : "Tạo tài khoản"}
        </button>
        <Link href="/users" className="rounded border px-4 py-2">
          Hủy
        </Link>
      </div>
    </form>
  );
}
