"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Menu, X, User, LogOut, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

const navLinks = [
  { href: "/models", label: "Models" },
  { href: "/tools", label: "Tools" },
  { href: "/effects", label: "Effects" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, credits, plan, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "U";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();
  const showLoading = !mounted || loading;

  /* eslint-disable react-hooks/set-state-in-effect -- Required for SSR hydration safety */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">AI Studio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {showLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <Badge variant="secondary" className="gap-1">
                <CreditCard className="h-3 w-3" />
                {credits} credits
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {plan}
                    </Badge>
                  </div>
                  <DropdownMenuItem>
                    <Link href="/generate" className="flex w-full items-center"><Sparkles className="mr-2 h-4 w-4" />Generate</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/history" className="flex w-full items-center"><User className="mr-2 h-4 w-4" />History</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/billing" className="flex w-full items-center"><CreditCard className="mr-2 h-4 w-4" />Billing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:text-foreground">
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-600"
              >
                Start for Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <nav className="flex flex-col gap-2 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/generate" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Generate
                </Link>
                <Link href="/history" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  History
                </Link>
                <Link href="/billing" className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  Billing
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/login" className="flex h-9 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="flex h-9 w-full items-center justify-center rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-medium text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Start for Free
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
