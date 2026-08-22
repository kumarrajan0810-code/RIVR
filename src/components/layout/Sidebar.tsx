"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Film,
  Tv,
  Sparkles,
  Search,
  Heart,
  PlayCircle,
  Settings,
  Star,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { BrandIcon, BrandWordmark } from "./BrandLogo";

// ChatGPT / Figma style sidebar toggle icon
export function SidebarToggleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="3.5" />
      <path d="M9 3v18" />
    </svg>
  );
}

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/tv", label: "TV Shows", icon: Tv },
  { href: "/anime", label: "Anime", icon: Sparkles },
  { href: "/stars", label: "Star Power", icon: Star },
  { href: "/my-list", label: "My List", icon: Heart },
  { href: "/continue-watching", label: "Continue Watching", icon: PlayCircle },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r border-[#262626] bg-[#0F0F0F]/95 backdrop-blur-2xl transition-all duration-300 z-40 select-none",
        sidebarCollapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Brand & Collapse Header */}
      <div
        className={cn(
          "flex items-center h-16 px-3 border-b border-[#1F1F1F] transition-all",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!sidebarCollapsed ? (
          <>
            {/* Expanded: Full RIVЯ wordmark without old R icon */}
            <Link
              href="/"
              className="flex items-center pl-2 min-w-0 group hover:opacity-90 transition-opacity"
            >
              <BrandWordmark size="md" />
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#1F1F1F] transition-all cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <SidebarToggleIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          /* Collapsed: 3D Origami R logo icon which morphs into toggle icon on hover */
          <button
            onClick={toggleSidebar}
            className="group relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#1F1F1F] transition-all cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            {/* New 3D Green Origami R Logo Icon */}
            <div className="w-8 h-8 flex items-center justify-center group-hover:opacity-0 group-hover:scale-75 transition-all duration-200">
              <BrandIcon size={32} />
            </div>

            {/* Collapse toggle icon on hover (like ChatGPT) */}
            <div className="absolute inset-0 flex items-center justify-center text-foreground opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
              <SidebarToggleIcon className="w-5 h-5 text-[#00DF81]" />
            </div>

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#262626] border border-[#333333] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
              Expand sidebar
            </div>
          </button>
        )}
      </div>

      {/* Navigation Rails */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-white/10 text-white font-semibold shadow-sm"
                  : "text-[#81807E] hover:text-white hover:bg-white/5",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-white" : "text-[#81807E] group-hover:text-white"
                )}
              />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}

              {/* Collapsed Tooltip */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#262626] border border-[#333333] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-2.5 border-t border-[#1F1F1F] space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white font-semibold shadow-sm"
                  : "text-[#81807E] hover:text-white hover:bg-white/5",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-[#81807E] group-hover:text-white")} />
              {!sidebarCollapsed && <span>{item.label}</span>}

              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#262626] border border-[#333333] text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
