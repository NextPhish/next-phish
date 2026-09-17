"use client";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import type { SlugStatus } from "./slug-availability.types";
export function useSlugAvailability(slug: string): SlugStatus {
  const [result, setResult] = useState<{ slug: string; status: SlugStatus }>({
    slug: "",
    status: "idle",
  });
  const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  useEffect(() => {
    if (!valid) return;
    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const { data, error } = await authClient.organization.checkSlug({
          slug,
        });
        if (active)
          setResult({
            slug,
            status:
              error?.code === "ORGANIZATION_SLUG_ALREADY_TAKEN"
                ? "taken"
                : !error && data?.status
                  ? "available"
                  : "error",
          });
      } catch {
        if (active) setResult({ slug, status: "error" });
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [slug, valid]);
  return !valid ? "idle" : result.slug === slug ? result.status : "checking";
}
