"use client";
import type { ComponentProps } from "react";
import { Checkbox as Primitive } from "radix-ui";
import { Check, Minus } from "lucide-react";
import { cn } from "../utils";
export function Checkbox({
  className,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root {...props} className={cn("np-checkbox", className)}>
      <Primitive.Indicator>
        <Minus className="np-checkbox-mixed" size={13} aria-hidden="true" />
        <Check className="np-checkbox-checked" size={13} aria-hidden="true" />
      </Primitive.Indicator>
    </Primitive.Root>
  );
}
