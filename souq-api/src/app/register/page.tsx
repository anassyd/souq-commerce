import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { RedirectIfAuthed } from "@/components/auth/require-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a minute. You'll use it to check out and track orders."
      footer={<>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <RedirectIfAuthed />
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
