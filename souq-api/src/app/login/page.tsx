import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { RedirectIfAuthed } from "@/components/auth/require-auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to check out, track orders and write reviews."
      footer={<>New to Souq? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></>}
    >
      <RedirectIfAuthed />
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
