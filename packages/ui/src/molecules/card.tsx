import type { ComponentProps, ReactNode } from "react";
import { cn } from "../utils";
export function Card({ className, ...props }: ComponentProps<"section">) {
  return <section {...props} className={cn("np-card", className)} />;
}
export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="np-card-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("np-card-body", className)} />;
}
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("np-card-footer", className)} />;
}
