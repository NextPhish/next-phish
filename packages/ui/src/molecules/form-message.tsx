"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
export interface FormMessageProps {
  variant: "error" | "success" | "info";
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}
export function FormMessage({
  variant,
  title,
  children,
  action,
}: FormMessageProps) {
  const Icon =
    variant === "error"
      ? AlertCircle
      : variant === "success"
        ? CheckCircle2
        : Info;
  return (
    <div
      className={`np-form-message np-form-message--${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon size={19} aria-hidden="true" />
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
        {action && <div className="np-message-action">{action}</div>}
      </div>
    </div>
  );
}
export interface FormErrorSummaryProps {
  title?: string;
  errors: { id: string; message: string }[];
}
export function FormErrorSummary({
  title = "Please check the following fields",
  errors,
}: FormErrorSummaryProps) {
  if (!errors.length) return null;
  return (
    <FormMessage variant="error" title={title}>
      <ul>
        {errors.map(({ id, message }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => document.getElementById(id)?.focus()}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </FormMessage>
  );
}
