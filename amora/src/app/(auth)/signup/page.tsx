import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { signup } from "../actions";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 mb-8 text-muted">It takes 20 seconds. Your first match takes less.</p>
      <AuthForm
        action={signup}
        submitLabel="Create account"
        pendingLabel="Creating account…"
        fields={[
          { name: "name", label: "First name", type: "text", autoComplete: "given-name", placeholder: "Alex" },
          { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" },
          { name: "birthdate", label: "Date of birth", type: "date", autoComplete: "bday", max: today },
        ]}
        agreement={
          <>
            I&apos;m 18 or older, I understand every profile here is an AI character, and I agree to the{" "}
            <Link href="/terms" className="text-text underline underline-offset-2">
              terms
            </Link>
            .
          </>
        }
        footer={{ text: "Already have an account?", linkText: "Log in", href: "/login" }}
      />
    </>
  );
}
