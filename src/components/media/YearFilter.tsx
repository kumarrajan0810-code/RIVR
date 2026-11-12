"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface YearFilterProps {
  selectedYear: number | null;
  onSelectYear: (year: number | null) => void;
  className?: string;
}

const POPULAR_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const EXTENDED_YEARS: number[] = [];
for (let y = 2019; y >= 1980; y--) {
  EXTENDED_YEARS.push(y);
}

export function YearFilter({ selectedYear, onSelectYear, className }: YearFilterProps) {
  const isCustomYear = selectedYear !== null && !POPULAR_YEARS.includes(selectedYear);

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto no-scrollbar py-1", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1 flex-shrink-0 font-medium">
        <Calendar className="w-3.5 h-3.5 text-accent" />
        <span>Year:</span>
      </div>

      <button
        type="button"
        onClick={() => onSelectYear(null)}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
          selectedYear === null
            ? "bg-accent text-black shadow-md shadow-[#00DF81]/20 font-bold"
            : "bg-[#1f1f1f] text-muted-foreground hover:text-white hover:bg-[#2a2a2a]"
        )}
      >
        All
      </button>

      {POPULAR_YEARS.map((year) => {
        const isSelected = selectedYear === year;
        return (
          <button
            key={year}
            type="button"
            onClick={() => onSelectYear(isSelected ? null : year)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              isSelected
                ? "bg-accent text-black shadow-md shadow-[#00DF81]/20 font-bold"
                : "bg-[#1f1f1f] text-muted-foreground hover:text-white hover:bg-[#2a2a2a]"
            )}
          >
            {year}
          </button>
        );
      })}

      {/* Dropdown for older years */}
      <div className="relative flex-shrink-0">
        <select
          value={isCustomYear ? selectedYear : ""}
          onChange={(e) => {
            const val = e.target.value;
            onSelectYear(val ? parseInt(val, 10) : null);
          }}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1f1f1f] border border-white/10 hover:border-white/20 transition-all cursor-pointer appearance-none pr-6",
            isCustomYear ? "bg-accent text-black font-bold border-accent" : "text-muted-foreground hover:text-white"
          )}
        >
          <option value="" className="bg-[#181818] text-white">
            {isCustomYear ? `${selectedYear}` : "Older..."}
          </option>
          {EXTENDED_YEARS.map((y) => (
            <option key={y} value={y} className="bg-[#181818] text-white">
              {y}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
          ▼
        </span>
      </div>
    </div>
  );
}

