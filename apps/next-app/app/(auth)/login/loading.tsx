import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@next-phish/ui";

export default function LoginLoading() {
  return (
    <div className="np-theme grid min-h-screen grid-cols-2 bg-[var(--np-background)] max-[700px]:grid-cols-1">
      <aside className="flex flex-col justify-between bg-[var(--np-nav)] px-[12%] py-[50px] text-white max-[700px]:min-h-[180px] max-[700px]:p-[30px]">
        <div className="inline-flex w-fit items-center gap-[11px] text-[21px] font-[650] tracking-[-0.5px] text-white">
          <span className="grid h-[35px] w-[31px] place-items-center rounded-[9px_9px_13px_13px] bg-[#7666ec] text-white">
            <ShieldCheck className="size-[19px]" aria-hidden="true" />
          </span>
          nextphish.
        </div>
        <div aria-hidden="true">
          <Skeleton className="mt-[25px] h-[38px] w-[210px] rounded-[7px] max-[700px]:mt-[30px]" />
          <Skeleton className="my-3 mb-[30px] h-[18px] w-[245px] rounded-[7px]" />
        </div>
        <span />
      </aside>
      <main className="flex items-center justify-center p-10 max-[700px]:px-[25px] max-[700px]:py-[35px]">
        <div className="w-[min(360px,100%)]">
          <Skeleton className="h-[22px] w-[145px] rounded-[7px]" />
          <Skeleton className="mt-[25px] h-[38px] w-[210px] rounded-[7px]" />
          <Skeleton className="my-3 mb-[30px] h-[18px] w-[245px] rounded-[7px]" />
          <div className="grid gap-5">
            <div className="np-field">
              <Skeleton className="h-[13px] w-[78px] rounded-[7px]" />
              <Skeleton className="h-[41px] w-full rounded-[7px]" />
            </div>
            <div className="np-field">
              <Skeleton className="h-[13px] w-[78px] rounded-[7px]" />
              <Skeleton className="h-[41px] w-full rounded-[7px]" />
            </div>
            <Skeleton className="mt-2 h-10 w-full rounded-[7px]" />
            <Skeleton className="mt-2 h-10 w-full rounded-[7px]" />
          </div>
        </div>
      </main>
    </div>
  );
}
