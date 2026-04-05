"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
    Home,
    MessageCircle,
    AlertTriangle,
    DollarSign,
    GitBranch,
    Users,
    Settings,
    Menu,
    X,
    LogIn,
    LogOut,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { DataBadge } from "./data-badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "AI Buddy", href: "/buddy", icon: MessageCircle },
    { label: "Crisis", href: "/crisis", icon: AlertTriangle },
    { label: "Budget", href: "/budget", icon: DollarSign },
    { label: "Flow", href: "/flow", icon: GitBranch },
    { label: "Community", href: "/community", icon: Users },
    { label: "My Data", href: "/my-data", icon: Settings },
] as const;

function UserSection({ collapsed }: { collapsed?: boolean }) {
    const { user } = useUser();

    if (!user) {
        return (
            <Link href="/sign-in">
                <Button
                    variant="ghost"
                    size={collapsed ? "icon" : "sm"}
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                >
                    <LogIn className="h-4 w-4" />
                    {!collapsed && <span className="text-xs">Sign In</span>}
                </Button>
            </Link>
        );
    }

    return (
        <div
            className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : "px-1"}`}
        >
            {user.picture ? (
                <Image
                    src={user.picture}
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full shrink-0 ring-2 ring-[#F5C518]/40"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 ring-2 ring-[#F5C518]/40">
                    <span className="text-xs font-bold text-primary">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                </div>
            )}
            {!collapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                        {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
            )}
            {!collapsed && (
                <a
                    href="/auth/logout"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Sign out"
                    onClick={() => {
                        if (user?.sub) {
                            localStorage.removeItem(
                                `shockplan_buddy_messages_${user.sub}`,
                            );
                        }
                    }}
                >
                    <LogOut className="h-3.5 w-3.5" />
                </a>
            )}
        </div>
    );
}

function SidebarContent({
    pathname,
    collapsed,
}: {
    pathname: string;
    collapsed?: boolean;
}) {
    return (
        <>
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1A1A1A] shadow-md shrink-0">
                    <Image
                        src="/logo.png"
                        alt="ShockPlan"
                        width={28}
                        height={28}
                        className="rounded-lg object-contain"
                    />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        ShockPlan
                    </span>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3 mt-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    const isCrisis = href === "/crisis";
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={[
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                                isActive && isCrisis
                                    ? "bg-destructive/10 text-destructive font-semibold"
                                    : isActive
                                      ? "bg-[#1A1A1A] text-white dark:bg-white dark:text-[#1A1A1A] font-semibold"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            ].join(" ")}
                        >
                            <Icon
                                className={[
                                    "h-4.5 w-4.5 shrink-0",
                                    isActive && isCrisis
                                        ? "stroke-[2.2px]"
                                        : isActive
                                          ? "stroke-[2.2px]"
                                          : "stroke-[1.7px]",
                                ].join(" ")}
                                size={18}
                            />
                            {!collapsed && <span>{label}</span>}
                            {isActive && !collapsed && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-4 pt-3 space-y-3 border-t border-border/50 mt-2">
                <UserSection collapsed={collapsed} />
                <div className="flex items-center justify-between">
                    <ThemeToggle collapsed={collapsed} />
                </div>
                <DataBadge
                    collapsed={collapsed}
                    className={collapsed ? "justify-center w-full" : "px-1"}
                />
            </div>
        </>
    );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
    return (
        <nav
            aria-label="Main navigation"
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
            <div className="bg-card/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom,0px)]">
                <ul
                    className="flex flex-nowrap items-stretch min-h-16 overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch] px-1 gap-0.5"
                    role="list"
                >
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        const isCrisis = href === "/crisis";
                        return (
                            <li key={href} className="shrink-0 w-18 sm:w-19">
                                <Link
                                    href={href}
                                    aria-current={isActive ? "page" : undefined}
                                    className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-xl transition-colors"
                                >
                                    <span
                                        className={[
                                            "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                                            isActive && isCrisis
                                                ? "bg-destructive/10"
                                                : isActive
                                                  ? "bg-[#1A1A1A] dark:bg-white"
                                                  : "",
                                        ].join(" ")}
                                    >
                                        <Icon
                                            className={[
                                                "h-5 w-5 transition-colors",
                                                isActive && isCrisis
                                                    ? "text-destructive stroke-[2.2px]"
                                                    : isActive
                                                      ? "text-white dark:text-[#1A1A1A] stroke-[2.2px]"
                                                      : "text-muted-foreground stroke-[1.6px]",
                                            ].join(" ")}
                                        />
                                    </span>
                                    <span
                                        className={[
                                            "text-[9px] sm:text-[10px] font-semibold leading-tight text-center px-0.5 line-clamp-2 max-w-full",
                                            isActive && isCrisis
                                                ? "text-destructive"
                                                : isActive
                                                  ? "text-[#1A1A1A] dark:text-white"
                                                  : "text-muted-foreground",
                                        ].join(" ")}
                                    >
                                        {label}
                                    </span>
                                    {isActive && (
                                        <span
                                            className={`w-1 h-1 rounded-full ${isCrisis ? "bg-destructive" : "bg-[#F5C518]"}`}
                                        />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 border-r border-border bg-linear-to-b from-card to-card/80 backdrop-blur-sm sticky top-0 h-screen shrink-0">
                <SidebarContent pathname={pathname} />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="relative w-64 h-full bg-card flex flex-col shadow-2xl">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-4 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <SidebarContent pathname={pathname} />
                    </aside>
                </div>
            )}

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card/90 backdrop-blur-md border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(true)}
                            className="h-9 w-9"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1A1A1A] shadow-sm">
                                <Image
                                    src="/logo.png"
                                    alt="ShockPlan"
                                    width={24}
                                    height={24}
                                    className="rounded-md object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                ShockPlan
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <DataBadge collapsed />
                        <ThemeToggle collapsed />
                    </div>
                </header>

                <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
                    {children}
                </main>
            </div>

            <MobileBottomNav pathname={pathname} />
        </div>
    );
}
