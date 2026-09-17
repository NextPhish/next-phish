import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading sending profiles"
      style={{ display: "grid", gap: 18 }}
    >
      <Skeleton style={{ width: "40%", height: 32 }} />
      <Skeleton style={{ width: "100%", height: 420, borderRadius: 12 }} />
    </div>
  );
}
