// lib/hooks/useAdminAuth.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getMe, AdminUser } from "../api/admin";

/**
 * Guards admin pages. While checking, `status` is "checking" so the page
 * can render a blank/loading state instead of flashing protected content.
 * Redirects to /admin/login if there's no token or it's no longer valid.
 */
export function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<"checking" | "authed">("checking");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    getMe()
      .then((me) => {
        setAdmin(me);
        setStatus("authed");
      })
      .catch(() => {
        router.replace("/admin/login");
      });
    // router is stable from next/navigation; intentionally excluded to avoid
    // re-running this check on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { admin, status };
}