"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores";
import { ApiError, apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user || !token) {
      if (user && !token) logout();
      router.replace("/admin/login");
      return;
    }

    let cancelled = false;
    apiFetch("/auth/me").catch((err) => {
      if (cancelled) return;
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        logout();
        router.replace("/admin/login");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user, token, router, logout]);

  if (!ready || !user || !token) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
  );
}
