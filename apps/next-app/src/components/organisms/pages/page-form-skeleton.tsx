"use client";
import { Skeleton } from "@next-phish/ui";
import { useTranslation } from "@/src/lib/i18n/client";
export function PageFormSkeleton() {
  const t = useTranslation();
  return (
    <div
      role="status"
      aria-label={t("pages.editorLabel")}
      className="grid min-w-0 gap-6"
    >
      <Skeleton style={{ width: "42%", height: "3.5rem" }} />
      <div className="grid min-w-0 gap-6 min-[1100px]:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-6">
          <Skeleton
            style={{ width: "100%", height: "7rem", borderRadius: "1rem" }}
          />
          <Skeleton
            style={{ width: "100%", height: "42rem", borderRadius: "1rem" }}
          />
        </div>
        <Skeleton
          style={{ width: "100%", height: "28rem", borderRadius: "1rem" }}
        />
      </div>
    </div>
  );
}
