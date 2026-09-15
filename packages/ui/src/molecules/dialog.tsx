"use client";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Dialog as Primitive } from "radix-ui";
import { X } from "lucide-react";
import { Button } from "../atoms/button";
export interface DialogProps extends ComponentProps<typeof Primitive.Root> {
  title: string;
  description: string;
  trigger?: ReactElement;
  footer?: ReactNode;
  closeLabel?: string;
  onCloseAutoFocus?: ComponentProps<
    typeof Primitive.Content
  >["onCloseAutoFocus"];
}
export function Dialog({
  title,
  description,
  trigger,
  children,
  footer,
  closeLabel = "Close dialog",
  onCloseAutoFocus,
  ...props
}: DialogProps) {
  return (
    <Primitive.Root {...props}>
      {trigger && <Primitive.Trigger asChild>{trigger}</Primitive.Trigger>}
      <Primitive.Portal>
        <div className="np-theme">
          <Primitive.Overlay className="np-overlay" />
          <Primitive.Content
            className="np-dialog"
            onCloseAutoFocus={onCloseAutoFocus}
          >
            <div className="np-dialog-header">
              <Primitive.Title>{title}</Primitive.Title>
              <Primitive.Close asChild>
                <Button variant="ghost" aria-label={closeLabel}>
                  <X size={18} aria-hidden="true" />
                </Button>
              </Primitive.Close>
            </div>
            <Primitive.Description className="np-dialog-description">
              {description}
            </Primitive.Description>
            <div className="np-dialog-body">{children}</div>
            {footer && <div className="np-dialog-footer">{footer}</div>}
          </Primitive.Content>
        </div>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
export const DialogClose = Primitive.Close;
