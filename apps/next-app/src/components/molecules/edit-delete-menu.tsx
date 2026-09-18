"use client";

import { Pencil, Trash2 } from "lucide-react";
import { RowActionsMenu } from "@next-phish/ui";

interface Props {
  label: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function EditDeleteMenu({
  label,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: Props) {
  return (
    <RowActionsMenu
      label={label}
      items={[
        {
          label: editLabel,
          icon: <Pencil size={16} aria-hidden="true" />,
          onSelect: onEdit,
        },
        {
          label: deleteLabel,
          icon: <Trash2 size={16} aria-hidden="true" />,
          onSelect: onDelete,
          destructive: true,
        },
      ]}
    />
  );
}
