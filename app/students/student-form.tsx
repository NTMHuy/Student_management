"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState, Values } from "./actions";
import { genderLabels } from "./labels";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  classes: { id: number; name: string; schoolYear: string }[];
  defaults?: Values;
  submitLabel: string;
};

const inputCls = "rounded border px-3 py-2";

export default function StudentForm({ action, classes, defaults, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Khi server trả lỗi, dùng lại giá trị vừa nhập (React tự reset form sau mỗi action)
  const v: Values = state.values ?? defaults ?? {};

  if (classes.length === 0) {
    return (
      <p className="rounded bg-yellow-100 px-3 py-2 text-sm">
        Chưa có lớp nào để chọn. Quản trị viên cần tạo lớp (và gán giáo viên chủ nhiệm) trước.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Mã học sinh
        <input name="studentCode" defaultValue={v.studentCode} placeholder="HS001" className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Họ và tên
        <input name="fullName" defaultValue={v.fullName} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Ngày sinh
        <input type="date" name="dateOfBirth" defaultValue={v.dateOfBirth} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Giới tính
        <select name="gender" defaultValue={v.gender ?? "MALE"} className={inputCls}>
          {Object.entries(genderLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Lớp
        <select name="classId" defaultValue={v.classId ?? ""} className={inputCls} required>
          <option value="" disabled>
            -- Chọn lớp --
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.schoolYear})
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" defaultValue={v.email} className={inputCls} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Số điện thoại
        <input name="phone" defaultValue={v.phone} className={inputCls} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Địa chỉ
        <textarea name="address" defaultValue={v.address} rows={2} className={inputCls} />
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {pending ? "Đang lưu..." : submitLabel}
        </button>
        <Link href="/students" className="rounded border px-4 py-2">
          Hủy
        </Link>
      </div>
    </form>
  );
}
