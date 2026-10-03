import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Không có quyền truy cập</h1>
      <p className="mb-4 text-sm text-gray-600">
        Tài khoản của bạn không được phép thực hiện thao tác hoặc xem trang này.
      </p>
      <Link href="/" className="text-blue-600">
        ← Về trang tổng quan
      </Link>
    </main>
  );
}
