"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: "accent" | "danger" | "gold";
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  className,
  color = "accent",
  size = "sm",
}: ProgressBarProps) {
  return (
    <div
      className={cn(
        "w-full bg-surface-elevated/60 rounded-full overflow-hidden",
        size === "sm" && "h-1",
        size === "md" && "h-1.5",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300",
          color === "accent" && "bg-accent",
          color === "danger" && "bg-danger",
          color === "gold" && "bg-gold"
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
