"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "accent" | "gold" | "success" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", size = "sm", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md whitespace-nowrap",
        variant === "default" && "bg-surface-elevated text-muted-foreground",
        variant === "accent" && "bg-accent-subtle text-accent",
        variant === "gold" && "bg-gold/15 text-gold",
        variant === "success" && "bg-success/15 text-success",
        variant === "outline" && "border border-border text-muted-foreground",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-2.5 py-1",
        className
      )}
    >
      {children}
    </span>
  );
}

export function RatingBadge({ rating, className }: { rating: number; className?: string }) {
  return (
    <Badge variant="accent" className={cn("gap-1 font-semibold text-[#00DF81] bg-[#00DF81]/15 border border-[#00DF81]/25", className)}>
      <svg className="w-3 h-3 text-[#00DF81]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating.toFixed(1)}
    </Badge>
  );
}
