"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, AlertTriangle, DollarSign, Menu } from "lucide-react";

const tabs = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
    crisis: false,
  },
  {
    label: "Buddy",
    href: "/buddy",
    icon: MessageCircle,
    crisis: false,
  },
  {
    label: "Crisis",
    href: "/crisis",
    icon: AlertTriangle,
    crisis: true,
  },
  {
    label: "Budget",
    href: "/budget",
    icon: DollarSign,
    crisis: false,
  },
  {
    label: "More",
    href: "/my-data",
    icon: Menu,
    crisis: false,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        className="w-full max-w-md pointer-events-auto bg-white border-t border-gray-100"
        style={{
          boxShadow: "0 -4px 24px 0 oklch(0.51 0.22 260 / 0.08), 0 -1px 4px 0 oklch(0 0 0 / 0.05)",
        }}
      >
        <ul className="flex items-center h-16 px-1" role="list">
          {tabs.map(({ label, href, icon: Icon, crisis }) => {
            const isActive = pathname === href;
            const isActiveCrisis = isActive && crisis;

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-xl transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                >
                  <span
                    className={[
                      "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150",
                      isActiveCrisis
                        ? "bg-[oklch(0.96_0.04_27)]"
                        : isActive
                        ? "bg-[oklch(0.94_0.04_260)]"
                        : "bg-transparent",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-5 w-5 transition-colors duration-150",
                        isActiveCrisis
                          ? "text-[oklch(0.58_0.22_27)] stroke-[2.2px]"
                          : isActive
                          ? "text-primary stroke-[2.2px]"
                          : "text-gray-400 stroke-[1.6px]",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className={[
                      "text-[10px] font-semibold leading-none tracking-wide transition-colors duration-150",
                      isActiveCrisis
                        ? "text-[oklch(0.58_0.22_27)]"
                        : isActive
                        ? "text-primary"
                        : "text-gray-400",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
