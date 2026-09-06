"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createBrowserClient } from "../../lib/supabase/client";
import { siteConfig } from "../../config/site";

export default function LoginPage() {
  const router = useRouter();
  const clientSetup = useMemo(() => {
    try {
      return { client: createBrowserClient(), error: null };
    } catch (error) {
      return {
        client: null,
        error: error instanceof Error ? error.message : "Supabase is not configured.",
      };
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientSetup.client) {
      setError(clientSetup.error);
      return;
    }
    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const { error: signInError } = await clientSetup.client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsSubmitting(false);

    if (signInError) {
      setError("Your email address or password is incorrect.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <Link className="text-sm font-bold text-slate-950" href="/">
          {siteConfig.name}
        </Link>
        <p className="mt-8 text-sm font-semibold text-indigo-600">Administrator access</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Sign in to your dashboard</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use the email and password created in Supabase Authentication.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Email address
            <input
              autoComplete="email"
              className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error || clientSetup.error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error ?? clientSetup.error}
            </p>
          ) : null}
          <button
            className="w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting || !clientSetup.client}
            type="submit"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
