"use client";
import {
  useRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { Dialog as Primitive } from "radix-ui";
import { X } from "lucide-react";
import { Button } from "../atoms/button";
export interface DialogProps extends ComponentProps<typeof Primitive.Root> {
  title: string;
  description: string;
  trigger?: ReactElement;
  footer?: ReactNode;
  closeLabel?: string;
  dismissible?: boolean;
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
  dismissible = true,
  onCloseAutoFocus,
  ...props
}: DialogProps) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <Primitive.Root {...props}>
      {trigger && <Primitive.Trigger asChild>{trigger}</Primitive.Trigger>}
      <Primitive.Portal>
        <div className="np-theme">
          <Primitive.Overlay className="np-overlay" />
          <Primitive.Content
            className="np-dialog"
            onOpenAutoFocus={() => {
              previousFocus.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
            }}
            onCloseAutoFocus={(event) => {
              onCloseAutoFocus?.(event);
              if (
                !event.defaultPrevented &&
                !trigger &&
                previousFocus.current?.isConnected
              ) {
                event.preventDefault();
                previousFocus.current.focus();
              }
            }}
            onEscapeKeyDown={(event) => {
              if (!dismissible) event.preventDefault();
            }}
            onPointerDownOutside={(event) => {
              if (!dismissible) event.preventDefault();
            }}
          >
            <div className="np-dialog-header">
              <Primitive.Title>{title}</Primitive.Title>
              {dismissible && (
                <Primitive.Close asChild>
                  <Button variant="ghost" aria-label={closeLabel}>
                    <X size={18} aria-hidden="true" />
                  </Button>
                </Primitive.Close>
              )}
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
