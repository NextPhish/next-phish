import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading email templates"
      style={{ display: "grid", gap: 20 }}
    >
      <Skeleton style={{ width: "42%", height: 32 }} />
      <Skeleton style={{ width: "100%", height: 420, borderRadius: 12 }} />
    </div>
  );
}
