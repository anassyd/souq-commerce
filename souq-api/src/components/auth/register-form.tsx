"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { cn } from "@/lib/utils";

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}

export function RegisterForm() {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/";
  const registerUser = useAuth((s) => s.register);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const pw = watch("password") ?? "";
  const score = strength(pw);

  const onSubmit = async (values: RegisterInput) => {
    const res = await registerUser({ name: values.name, email: values.email, password: values.password });
    if (!res.ok) {
      if (res.field === "email") setError("email", { message: res.error });
      else toast.error(res.error);
      return;
    }
    toast.success("Account created. Welcome to Souq!");
    router.replace(callbackUrl);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField id="name" label="Full name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
      </FormField>
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
      </FormField>
      <FormField id="password" label="Password" error={errors.password?.message} hint="8+ letters and numbers. Accounts live on a public demo server, so don't reuse a real password.">
        <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
      </FormField>
      {pw && (
        <div className="flex gap-1.5" aria-label={`Password strength ${["weak", "weak", "fair", "strong"][score]}`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < score ? ["bg-red-500", "bg-amber-500", "bg-emerald-500"][score - 1] : "bg-muted")} />
          ))}
        </div>
      )}
      <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
        <PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
