interface PageNotFoundProps {
  message: string;
}

export function PageNotFound({ message }: PageNotFoundProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-[var(--np-muted)]">{message}</p>
    </div>
  );
}
