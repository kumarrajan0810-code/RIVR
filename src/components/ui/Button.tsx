"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variants
        variant === "primary" &&
          "bg-accent text-black font-bold hover:bg-accent-hover active:scale-[0.98] shadow-lg shadow-accent/25",
        variant === "secondary" &&
          "bg-surface text-foreground hover:bg-surface-hover border border-border backdrop-blur-sm",
        variant === "ghost" &&
          "text-muted-foreground hover:text-foreground hover:bg-surface-hover",
        variant === "danger" &&
          "bg-danger text-white hover:bg-danger/90 active:scale-[0.98]",
        variant === "outline" &&
          "border border-border text-foreground hover:bg-surface-hover hover:border-muted",
        // Sizes
        size === "sm" && "text-sm px-3 py-1.5 rounded-md",
        size === "md" && "text-sm px-4 py-2.5",
        size === "lg" && "text-base px-6 py-3",
        size === "icon" && "p-2.5 rounded-lg",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
