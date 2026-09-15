"use client";
import type { ComponentProps } from "react";
import { Tabs as Primitive } from "radix-ui";
import { cn } from "../utils";
export const Tabs = Primitive.Root;
export function TabsList({
  className,
  ...props
}: ComponentProps<typeof Primitive.List>) {
  return (
    <Primitive.List {...props} className={cn("np-tabs-list", className)} />
  );
}
export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      {...props}
      className={cn("np-tabs-trigger", className)}
    />
  );
}
export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      {...props}
      className={cn("np-tabs-content", className)}
    />
  );
}
