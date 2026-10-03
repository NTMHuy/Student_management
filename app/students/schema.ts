import { z } from "zod";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^\+?[\d\s.-]{8,20}$/;

// Dữ liệu từ form luôn là chuỗi; trường tùy chọn để rỗng ("") và được đổi thành null khi lưu
export const studentSchema = z.object({
  studentCode: z
    .string()
    .trim()
    .min(1, "Mã học sinh không được để trống")
    .max(20, "Mã học sinh tối đa 20 ký tự"),
  fullName: z
    .string()
    .trim()
    .min(1, "Họ tên không được để trống")
    .max(100, "Họ tên tối đa 100 ký tự"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh không hợp lệ")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00Z`);
      return !isNaN(d.getTime()) && d <= new Date();
    }, "Ngày sinh không hợp lệ hoặc nằm trong tương lai"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  classId: z.coerce.number().int().positive("Hãy chọn lớp"),
  email: z
    .string()
    .trim()
    .max(255, "Email tối đa 255 ký tự")
    .refine((v) => v === "" || emailRe.test(v), "Email không hợp lệ"),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || phoneRe.test(v), "Số điện thoại không hợp lệ"),
  address: z.string().trim().max(500, "Địa chỉ tối đa 500 ký tự"),
});
