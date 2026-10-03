import type { Metadata } from "next";
import "./globals.css";
import Nav from "./nav";

export const metadata: Metadata = {
  title: "Quản lý học sinh",
  description: "Ứng dụng quản lý học sinh",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
