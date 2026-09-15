"use client";
import {
  useEffect,
  useId,
  useState,
  type ReactNode,
  type ElementType,
} from "react";
import { Dialog } from "radix-ui";
import { Menu, Shield, X } from "lucide-react";
import { Button } from "../atoms/button";
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
}
export interface NavigationGroup {
  id: string;
  label?: string;
  items: NavigationItem[];
}
export interface AppShellProps {
  children: ReactNode;
  navigation: NavigationGroup[];
  activeItem: string;
  breadcrumb: ReactNode;
  organization?: ReactNode;
  profile?: ReactNode;
  headerActions?: ReactNode;
  brand?: ReactNode;
  linkComponent?: ElementType;
  labels?: { navigation: string; open: string; close: string; skip: string };
}
export function AppShell({
  children,
  navigation,
  activeItem,
  breadcrumb,
  organization,
  profile,
  headerActions,
  brand = "nextphish.",
  linkComponent: Link = "a",
  labels = {
    navigation: "Main navigation",
    open: "Open navigation",
    close: "Close navigation",
    skip: "Skip to content",
  },
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  const mainId = useId();
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);
  const contents = (
    <>
      <div className="np-brand">
        <span className="np-brand-mark">
          <Shield size={20} aria-hidden="true" />
        </span>
        {brand}
      </div>
      {organization && <div className="np-organization">{organization}</div>}
      <nav aria-label={labels.navigation}>
        {navigation.map((group) => (
          <div className="np-nav-group" key={group.id}>
            {group.label && <div className="np-nav-label">{group.label}</div>}
            {group.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={activeItem === item.id ? "page" : undefined}
                className="np-nav-link"
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="np-nav-count">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      {profile && <div className="np-sidebar-profile">{profile}</div>}
    </>
  );
  return (
    <div className="np-theme np-shell">
      <a className="np-skip" href={`#${mainId}`}>
        {labels.skip}
      </a>
      <aside className="np-sidebar np-sidebar-desktop">{contents}</aside>
      <div className="np-workspace">
        <header className="np-topbar">
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button
                variant="ghost"
                className="np-mobile-toggle"
                aria-label={labels.open}
              >
                <Menu size={21} aria-hidden="true" />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <div className="np-theme">
                <Dialog.Overlay className="np-overlay" />
                <Dialog.Content
                  className="np-sidebar np-sidebar-mobile"
                  aria-describedby={undefined}
                >
                  <Dialog.Title className="np-sr-only">
                    {labels.navigation}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      className="np-drawer-close"
                      aria-label={labels.close}
                    >
                      <X size={20} aria-hidden="true" />
                    </Button>
                  </Dialog.Close>
                  {contents}
                </Dialog.Content>
              </div>
            </Dialog.Portal>
          </Dialog.Root>
          <div className="np-breadcrumb">{breadcrumb}</div>
          <div className="np-header-actions">{headerActions}</div>
        </header>
        <main id={mainId} tabIndex={-1} className="np-content">
          {children}
        </main>
      </div>
    </div>
  );
}
