"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Lightbulb,
    CheckCircle2,
    Trophy,
    Menu,
    LogOut,
    // UserCircle,
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ---------------- NAV CONTENT COMPONENT ---------------- */

interface NavContentProps {
    setOpen: (open: boolean) => void;
    handleLogout: () => void;
    userFullName?: string;
}

function NavContent({
    setOpen,
    handleLogout,
    userFullName
}: NavContentProps) {
    const displayName = userFullName || "User";

    const initials = displayName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1">
                <div className="text-2xl font-bold text-primary mb-8 px-2">
                    Innovation
                </div>

                <nav className="space-y-2 text-sm">
                    <Link
                        href="/"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <Link
                        href="/innovations"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <Lightbulb size={20} />
                        My Innovations
                    </Link>

                    <Link
                        href="/approvals"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <CheckCircle2 size={20} />
                        Approvals
                    </Link>

                    <Link
                        href="/leaderboard"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setOpen(false)}
                    >
                        <Trophy size={20} />
                        Leaderboard
                    </Link>
                </nav>
            </div>

            {/* Logout Section */}
            <div className="mt-auto pt-6">
                <Separator className="mb-4" />

                <div className="px-3 py-3">
                    <div className="flex items-center justify-center gap-3">
                        <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <div className="text-sm font-medium leading-tight truncate">
                                {displayName}
                            </div>
                            {/* Optional second line – role, email, etc. */}
                            {/* <div className="text-xs text-muted-foreground truncate">
                                {userRole || "Team Member"}
                            </div> */}
                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-center gap-3 p-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    Logout
                </Button>
            </div>
        </div>
    );
}

/* ---------------- SIDEBAR COMPONENT ---------------- */

interface SidebarProps {
    userFullName?: string;
}

export default function Sidebar({ userFullName }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        try {
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                router.push("/login");
                router.refresh();
            } else {
                alert("Logout failed. Please try again.");
            }
        } catch (err) {
            console.error("Logout error:", err);
            alert("Something went wrong. Please try again.");
        }

        setOpen(false);
    }

    return (
        <>
            {/* Mobile Hamburger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-6 bg-white dark:bg-zinc-900">
                        <NavContent
                            setOpen={setOpen}
                            handleLogout={handleLogout}
                            userFullName={userFullName}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "hidden md:flex",
                    "w-64 bg-white dark:bg-zinc-900 border-r border-border",
                    "h-screen p-6 flex-col fixed left-0 top-0 z-40"
                )}
            >
                <NavContent
                    setOpen={setOpen}
                    handleLogout={handleLogout}
                    userFullName={userFullName}
                />
            </div>

            {/* Spacer for Desktop */}
            <div className="hidden md:block w-64 shrink-0" aria-hidden="true" />
        </>
    );
}