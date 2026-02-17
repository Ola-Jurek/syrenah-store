"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Suspense } from 'react';


function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło");
        setLoading(false);
        return;
      }

      router.push(callbackUrl ? callbackUrl : "/account");
      router.refresh();
    } catch {
      setError("Wystąpił nieoczekiwany błąd");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 bg-[#FDFBF7]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-sm font-serif text-neutral-700 tracking-[0.2em] uppercase">
            Logowanie
          </h1>
          <p className="mt-3 text-xs text-neutral-400">
            Zaloguj się do swojego konta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-4 py-3 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
            >
              Adres email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-[#E8E3D8] bg-white text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:border-[#C1A88C] transition-colors"
              placeholder="anna@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-widest text-neutral-500 mb-2"
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-[#E8E3D8] bg-white text-neutral-700 placeholder:text-neutral-300 focus:outline-none focus:border-[#C1A88C] transition-colors"
              placeholder="Wpisz hasło"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8E3D8] text-neutral-700 py-2.5 text-xs uppercase tracking-widest hover:bg-[#DDD7C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-neutral-400">
          Nie masz konta?{" "}
          <Link
            href="/register"
            className="text-neutral-600 hover:text-neutral-800 underline underline-offset-2 transition-colors"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-xs uppercase tracking-widest text-neutral-400">Ładowanie...</div>}>
      <LoginForm />
    </Suspense>
  );
}