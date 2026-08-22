"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandIconProps {
  size?: number;
  className?: string;
}

export function BrandIcon({ size = 32, className }: BrandIconProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/logo-r.png"
        alt="RIVR Logo"
        width={size}
        height={size}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}

interface BrandWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  height?: number;
}

export function BrandWordmark({ className, size = "md", height }: BrandWordmarkProps) {
  const defaultHeights = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const finalHeight = height ?? defaultHeights[size] ?? 32;
  const finalWidth = Math.round(finalHeight * 2.15);

  return (
    <div
      className={cn(
        "relative flex-shrink-0 flex items-center justify-start select-none",
        className
      )}
      style={{ height: finalHeight, width: finalWidth }}
    >
      <Image
        src="/brand/logo-rivr.png"
        alt="RIVЯ"
        width={finalWidth}
        height={finalHeight}
        className="object-contain object-left h-full w-auto"
        priority
      />
    </div>
  );
}
