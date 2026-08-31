"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Lock } from "lucide-react";
import { ThemeToggle } from "@/components/molecules/theme-toggle";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const { login, user } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/admin");
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      router.replace("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle className="rounded-lg" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Comfort CMS</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-8 shadow-soft"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@comfort.am"
                required
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{t("loginError")}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#203E4B] text-white hover:bg-[#203E4B]/90"
            >
              {loading ? t("signingIn") : t("login")}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">{t("loginHint")}</p>
        </form>
      </div>
    </div>
  );
}
