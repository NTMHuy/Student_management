import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import LoginForm from "./login-form";

export default async function LoginPage() {
  // Đã đăng nhập hợp lệ thì không cần vào trang này nữa
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Đăng nhập</h1>
      <LoginForm />
    </main>
  );
}
