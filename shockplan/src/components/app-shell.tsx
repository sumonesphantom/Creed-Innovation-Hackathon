"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
    Home,
    MessageCircle,
    AlertTriangle,
    DollarSign,
    Shield,
    Lock,
    Settings,
    Menu,
    X,
    LogIn,
    LogOut,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "AI Buddy", href: "/buddy", icon: MessageCircle },
    { label: "Crisis", href: "/crisis", icon: AlertTriangle },
    { label: "Budget", href: "/budget", icon: DollarSign },
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
            className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-1"}`}
        >
            {user.picture ? (
                <Image
                    src={user.picture}
                    alt=""
                    className="w-7 h-7 rounded-full shrink-0"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                </div>
            )}
            {!collapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                        {user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {user.email}
                    </p>
                </div>
            )}
            {!collapsed && (
                <a
                    href="/auth/logout?returnTo=/"
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Sign out"
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
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm shrink-0">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        ShockPlan
                    </span>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={[
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            ].join(" ")}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-4 space-y-3">
                <UserSection collapsed={collapsed} />
                <div className="flex items-center justify-between">
                    <ThemeToggle collapsed={collapsed} />
                </div>
                <div
                    className={`flex items-center gap-1.5 text-xs text-muted-foreground ${collapsed ? "justify-center" : "px-1"}`}
                >
                    <Lock className="h-3 w-3 shrink-0" />
                    {!collapsed && <span>Encrypted</span>}
                </div>
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
            <div className="bg-card border-t border-border backdrop-blur-lg">
                <ul className="flex items-center h-16 px-1" role="list">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href;
                        const isCrisis = href === "/crisis";
                        return (
                            <li key={href} className="flex-1">
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
                                                  ? "bg-primary/10"
                                                  : "",
                                        ].join(" ")}
                                    >
                                        <Icon
                                            className={[
                                                "h-5 w-5 transition-colors",
                                                isActive && isCrisis
                                                    ? "text-destructive stroke-[2.2px]"
                                                    : isActive
                                                      ? "text-primary stroke-[2.2px]"
                                                      : "text-muted-foreground stroke-[1.6px]",
                                            ].join(" ")}
                                        />
                                    </span>
                                    <span
                                        className={[
                                            "text-[10px] font-semibold leading-none",
                                            isActive && isCrisis
                                                ? "text-destructive"
                                                : isActive
                                                  ? "text-primary"
                                                  : "text-muted-foreground",
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

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 border-r border-border bg-card/50 backdrop-blur-sm sticky top-0 h-screen shrink-0">
                <SidebarContent pathname={pathname} />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="relative w-64 h-full bg-card flex flex-col shadow-xl">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-4 right-3 p-1 text-muted-foreground hover:text-foreground"
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
                <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
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
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shadow-sm">
                                <Shield className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                ShockPlan
                            </span>
                        </div>
                    </div>
                    <ThemeToggle collapsed />
                </header>

                <main className="flex-1 pb-20 lg:pb-0">{children}</main>
            </div>

            <MobileBottomNav pathname={pathname} />
        </div>
    );
}
