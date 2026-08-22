"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Search, Film, Tv, Heart } from "lucide-react";

const mobileNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV", icon: Tv },
  { href: "/my-list", label: "My List", icon: Heart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#262626] bg-[#0F0F0F]/95 backdrop-blur-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors flex-1 min-w-0 select-none",
                isActive ? "text-white font-semibold" : "text-[#81807E] hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform", isActive ? "text-white scale-110" : "text-[#81807E]")} />
              <span className={cn("text-[10px] truncate", isActive ? "text-white" : "text-[#81807E]")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
