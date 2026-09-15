"use client";

import type { ReactNode } from "react";
import { Popover } from "radix-ui";
import { Info } from "lucide-react";

export function HelpPopover({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="np-help-trigger" aria-label={label}>
          <Info size={15} aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="np-theme np-help-content"
          sideOffset={6}
          collisionPadding={16}
          aria-label={label}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
