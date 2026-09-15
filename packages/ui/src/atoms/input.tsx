import type { ComponentProps } from "react";
import { cn } from "../utils";
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input {...props} className={cn("np-input", className)} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={cn("np-input", "np-textarea", className)} />
  );
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select {...props} className={cn("np-input", "np-select", className)} />
  );
}
