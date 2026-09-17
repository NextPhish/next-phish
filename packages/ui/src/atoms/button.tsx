import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../utils";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  loading?: boolean;
}
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "np-button",
        `np-button--${variant}`,
        `np-button--${size}`,
        className,
      )}
    >
      {loading && (
        <LoaderCircle className="np-spinner" size={16} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
export function ButtonLink({
  variant = "secondary",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: ButtonVariant }) {
  return (
    <a
      {...props}
      className={cn(
        "np-button",
        "np-button--md",
        `np-button--${variant}`,
        className,
      )}
    />
  );
}
