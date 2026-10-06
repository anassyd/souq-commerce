import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/^[A-Za-z0-9]+$/, "Use letters and numbers only"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
export type RegisterInput = z.infer<typeof registerSchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3, "Write a few words").max(1000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const productQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

const luhn = (num: string) => {
  let sum = 0;
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
};

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(3, "Enter the recipient's full name"),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{8,15}$/, "Enter a valid phone number"),
    street: z.string().trim().min(5, "Enter the street and building"),
    city: z.string().trim().min(2, "Enter a city"),
    country: z.string().min(2, "Choose a country"),
    payment: z.enum(["card", "cod"]),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvc: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.payment !== "card") return;
    const num = (d.cardNumber ?? "").replace(/\s/g, "");
    if (!/^\d{16}$/.test(num) || !luhn(num)) ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a valid 16-digit card number" });
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(d.expiry ?? "");
    if (!m) ctx.addIssue({ code: "custom", path: ["expiry"], message: "Use MM/YY" });
    else {
      const exp = new Date(2000 + Number(m[2]), Number(m[1]));
      if (exp <= new Date()) ctx.addIssue({ code: "custom", path: ["expiry"], message: "This card has expired" });
    }
    if (!/^\d{3,4}$/.test(d.cvc ?? "")) ctx.addIssue({ code: "custom", path: ["cvc"], message: "3 or 4 digits" });
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;
