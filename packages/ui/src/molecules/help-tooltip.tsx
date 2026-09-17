"use client";

import { useState, type ReactNode } from "react";
import { Tooltip } from "radix-ui";
import { CircleHelp } from "lucide-react";

/** Contextual help available on hover, keyboard focus and touch. */
export function HelpTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="np-help-trigger"
            aria-label={label}
            onClick={() => setOpen(true)}
          >
            <CircleHelp size={16} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="np-theme np-help-content np-help-tooltip"
            sideOffset={6}
            collisionPadding={16}
          >
            {children}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
