import { z } from "zod";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[\d\s.-]{8,20}$/;

// Trường tùy chọn để rỗng ("") và được đổi thành null khi lưu
export const teacherSchema = z.object({
  teacherCode: z
    .string()
    .trim()
    .min(1, "Mã giáo viên không được để trống")
    .max(20, "Mã giáo viên tối đa 20 ký tự"),
  fullName: z
    .string()
    .trim()
    .min(1, "Họ tên không được để trống")
    .max(100, "Họ tên tối đa 100 ký tự"),
  email: z
    .string()
    .trim()
    .max(255, "Email tối đa 255 ký tự")
    .refine((v) => v === "" || emailRe.test(v), "Email không hợp lệ"),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || phoneRe.test(v), "Số điện thoại không hợp lệ"),
  subject: z.string().trim().max(100, "Bộ môn tối đa 100 ký tự"),
});
