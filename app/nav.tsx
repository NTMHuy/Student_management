import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "./login/actions";

export default async function Nav() {
  const user = await getCurrentUser();
  if (!user) return null; // chưa đăng nhập (trang /login) thì không hiện menu

  const isAdmin = user.role === "ADMIN";

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-4xl items-center gap-4 p-3 text-sm">
        <Link href="/" className="font-semibold">
          Quản lý học sinh
        </Link>
        <Link href="/students">Học sinh</Link>
        <Link href="/classes">Lớp học</Link>
        {isAdmin && <Link href="/teachers">Giáo viên</Link>}
        {isAdmin && <Link href="/users">Người dùng</Link>}
        <span className="ml-auto text-gray-600">
          {user.email} ({isAdmin ? "Quản trị viên" : "Giáo viên"})
        </span>
        <form action={logout}>
          <button type="submit" className="text-red-600">
            Đăng xuất
          </button>
        </form>
      </nav>
    </header>
  );
}
