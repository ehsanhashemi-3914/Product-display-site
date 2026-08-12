"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import { unlockAdmin } from "@/lib/auth/admin-session";
import { SITE } from "@/lib/config/site";
import { BrandLogo } from "@/components/products/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password) {
      setError("رمز عبور را وارد کنید.");
      return;
    }

    setSubmitting(true);
    try {
      // The password is checked on the server; this only reports the verdict.
      const result = await unlockAdmin(password, remember);
      if (!result.ok) {
        setError(result.error);
        setPassword("");
        return;
      }
      // On success the session store flips to "unlocked" and the gate swaps in the panel.
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="size-16" />
          <h1 className="mt-4 text-lg font-bold text-ink">ورود به پنل مدیریت</h1>
          <p className="mt-1 text-sm text-ink-muted">{SITE.name}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 rounded-xl border border-line bg-surface p-5 shadow-card"
        >
          <Field id="admin-password" label="رمز عبور" required error={error ?? undefined}>
            {(fieldProps) => (
              <div className="relative">
                <Input
                  {...fieldProps}
                  type={visible ? "text" : "password"}
                  value={password}
                  autoFocus
                  autoComplete="current-password"
                  placeholder="رمز عبور پنل"
                  className="pe-11"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setVisible((current) => !current)}
                  aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
                  className="focus-ring absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-lg text-ink-subtle transition-colors hover:text-ink"
                >
                  {visible ? (
                    <EyeOff aria-hidden="true" className="size-4.5" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4.5" />
                  )}
                </button>
              </div>
            )}
          </Field>

          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="focus-ring size-4 shrink-0 rounded border-line-strong accent-brand-600"
            />
            مرا روی این دستگاه به خاطر بسپار
          </label>

          <Button type="submit" fullWidth className="mt-5" loading={submitting}>
            {!submitting && <Lock aria-hidden="true" className="size-4" />}
            ورود
          </Button>
        </form>

        <Link
          href="/"
          className="focus-ring mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-md text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowRight aria-hidden="true" className="size-4" />
          بازگشت به صفحهٔ فروشگاه
        </Link>
      </div>
    </main>
  );
}
