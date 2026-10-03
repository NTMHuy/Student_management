"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const inputCls = "rounded border px-3 py-2";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      {state.error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input type="email" name="email" defaultValue={state.email} className={inputCls} required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Mật khẩu
        <input type="password" name="password" className={inputCls} required />
      </label>

      <button type="submit" disabled={pending} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
