import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { login } from "../actions";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 mb-8 text-muted">Your matches have been waiting for you.</p>
      <AuthForm
        action={login}
        submitLabel="Log in"
        pendingLabel="Logging in…"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        footer={{ text: "New here?", linkText: "Create an account", href: "/signup" }}
      />
    </>
  );
}
