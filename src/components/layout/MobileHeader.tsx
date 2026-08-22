"use client";

import Link from "next/link";
import { BrandWordmark } from "./BrandLogo";

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-[#262626]">
      <Link href="/" className="flex items-center">
        <BrandWordmark size="sm" height={24} />
      </Link>
    </header>
  );
}
