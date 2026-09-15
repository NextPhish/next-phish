"use client";

import type { ComponentProps } from "react";
import { DropdownMenu as Primitive } from "radix-ui";
import { cn } from "../utils";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export function DropdownMenuContent({
  className,
  children,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <div className="np-theme">
        <Primitive.Content
          {...props}
          sideOffset={sideOffset}
          className={cn("np-dropdown-menu", className)}
        >
          {children}
        </Primitive.Content>
      </div>
    </Primitive.Portal>
  );
}
export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item {...props} className={cn("np-dropdown-item", className)} />
  );
}
export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      {...props}
      className={cn("np-dropdown-label", className)}
    />
  );
}
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return (
    <Primitive.Separator
      {...props}
      className={cn("np-dropdown-separator", className)}
    />
  );
}
