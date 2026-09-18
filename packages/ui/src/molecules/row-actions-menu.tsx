"use client";

import type { ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";
import { Button } from "../atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface RowActionItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export interface RowActionsMenuProps {
  label: string;
  items: RowActionItem[];
}

export function RowActionsMenu({ label, items }: RowActionsMenuProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={label}>
          <EllipsisVertical size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            aria-expanded={item.ariaExpanded}
            aria-controls={item.ariaControls}
            className={item.destructive ? "np-dropdown-item-danger" : undefined}
            onSelect={item.onSelect}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
