import { NextResponse, type NextRequest } from "next/server";

// Chỉ kiểm tra "có cookie phiên hay không" để chuyển hướng nhanh.
// Việc xác thực thật sự nằm ở lib/dal.ts và bên trong từng Server Action.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") return NextResponse.next();

  if (!request.cookies.has("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // /api/health để công khai (sau này Railway có thể dùng để kiểm tra sức khỏe)
  matcher: ["/((?!api/health|_next/static|_next/image|favicon.ico).*)"],
};
