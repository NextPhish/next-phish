import { Skeleton } from "@next-phish/ui";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading campaigns" className="grid gap-6">
      <Skeleton style={{ width: "38%", height: "4rem" }} />
      <Skeleton
        style={{ width: "100%", height: "32rem", borderRadius: "1rem" }}
      />
    </div>
  );
}
