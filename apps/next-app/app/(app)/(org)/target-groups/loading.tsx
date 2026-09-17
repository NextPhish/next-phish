import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading target groups"
      className="grid min-w-0 gap-6"
    >
      <Skeleton style={{ width: "36%", height: "3.5rem" }} />
      <Skeleton
        style={{ width: "100%", height: "28rem", borderRadius: "1rem" }}
      />
    </div>
  );
}
