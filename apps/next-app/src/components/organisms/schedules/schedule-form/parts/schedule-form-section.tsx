import type { ReactNode } from "react";

export function ScheduleFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#dfe3ec] bg-white p-6 shadow-[0_1px_2px_rgb(16_24_40_/_4%)] [&>header]:mb-5 [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-bold [&_header_p]:mt-[0.3rem] [&_header_p]:mb-0 [&_header_p]:text-sm [&_header_p]:text-[#626d80]">
      <header>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}
