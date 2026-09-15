import type { ComponentProps } from "react";
import { cn } from "../utils";
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cn("np-skeleton", className)}
    />
  );
}

/** A reusable placeholder for asynchronously loaded option lists. */
export function SkeletonList({
  label = "Loading options…",
}: {
  label?: string;
}) {
  return (
    <div className="np-skeleton-list" role="status">
      <span className="np-sr-only">{label}</span>
      {["first", "second", "third", "fourth"].map((key) => (
        <div className="np-skeleton-list-row" key={key}>
          <Skeleton />
        </div>
      ))}
    </div>
  );
}
