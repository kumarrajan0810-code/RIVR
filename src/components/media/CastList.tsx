"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CastMember } from "@/providers/core/types";

interface CastListProps {
  cast: CastMember[];
  className?: string;
}

export function CastList({ cast, className }: CastListProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-display text-lg font-semibold text-foreground">Cast</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {cast.map((member) => (
          <div key={member.id} className="flex-shrink-0 w-[100px] text-center group">
            <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden bg-surface-elevated mb-2 mx-auto">
              {member.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-xl font-bold">
                  {member.name[0]}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-foreground line-clamp-1">{member.name}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
