import type { ComponentProps } from "react";
import { cn } from "../utils";
export type Tone = "neutral" | "success" | "warning" | "danger" | "info";
export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      {...props}
      className={cn("np-badge", `np-tone--${tone}`, className)}
    />
  );
}
