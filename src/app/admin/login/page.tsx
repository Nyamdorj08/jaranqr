"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { restaurant } from "@/lib/restaurant";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-brand-secondary">{restaurant.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">Админ хэсэгт нэвтрэх</p>

        <div className="mt-5 space-y-3">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-neutral-600">
              И-мэйл
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-neutral-600">
              Нууц үг
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-xl bg-brand-primary py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Нэвтэрч байна..." : "Нэвтрэх"}
        </button>
      </form>
    </div>
  );
}
