"use client";
import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
export interface PasswordInputProps extends Omit<
  ComponentProps<"input">,
  "type"
> {
  showLabel?: string;
  hideLabel?: string;
}
export function PasswordInput({
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="np-password-input">
      <Input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        disabled={props.disabled}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        aria-controls={props.id}
        onClick={() => setVisible(!visible)}
      >
        {visible ? (
          <EyeOff size={17} aria-hidden="true" />
        ) : (
          <Eye size={17} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
