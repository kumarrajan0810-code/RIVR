"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

import { SidebarToggleIcon } from "./Sidebar";
import { useUIStore } from "@/stores/uiStore";
import { BrandIcon, BrandWordmark } from "./BrandLogo";

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-[#262626]"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left Mobile Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile brand */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <BrandWordmark size="sm" />
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Link>
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
