import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type LinkHref =
  | string
  | {
      pathname?: string;
      query?: Record<string, string | number | boolean>;
      hash?: string;
    };

interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href: LinkHref;
  children?: ReactNode;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean | null;
}

function toHref(href: LinkHref) {
  if (typeof href === "string") return href;
  const query = href.query
    ? `?${new URLSearchParams(
        Object.entries(href.query).map(([key, value]) => [key, String(value)]),
      )}`
    : "";
  return `${href.pathname ?? ""}${query}${href.hash ? `#${href.hash}` : ""}`;
}

/** Storybook adapter: keeps links functional without loading the Next runtime. */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function StorybookLink(
  { href, replace, scroll, prefetch, ...props },
  ref,
) {
  void replace;
  void scroll;
  void prefetch;
  return <a ref={ref} href={toHref(href)} {...props} />;
});

export default Link;
