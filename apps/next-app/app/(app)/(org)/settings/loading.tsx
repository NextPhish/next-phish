import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading settings"
      className="grid min-w-0 gap-6"
    >
      <Skeleton style={{ width: "35%", height: "4rem" }} />
      <Skeleton
        style={{ width: "100%", height: "18rem", borderRadius: "1rem" }}
      />
    </div>
  );
}
