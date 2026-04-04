"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, AlertTriangle, DollarSign, Menu } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
  { href: "/crisis", label: "Crisis", icon: AlertTriangle },
  { href: "/budget", label: "Budget", icon: DollarSign },
  { href: "/my-data", label: "More", icon: Menu },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 text-[10px] ${
                active ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
