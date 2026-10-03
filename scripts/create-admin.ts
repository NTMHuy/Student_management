import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const [rawEmail, password] = process.argv.slice(2);

if (!rawEmail || !password) {
  console.error("Cách dùng: npx tsx scripts/create-admin.ts <email> <mật khẩu>");
  process.exit(1);
}
if (password.length < 8 || password.length > 72) {
  console.error("Mật khẩu phải từ 8 đến 72 ký tự");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
  });
  console.log(`Đã tạo/cập nhật tài khoản ADMIN: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
