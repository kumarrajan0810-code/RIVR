"use client";

import { Film, AlertTriangle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center px-4", className)}>
      <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4 text-muted">
        {icon || <Film className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && (
        <Button variant="secondary" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center px-4", className)}>
      <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4 text-danger">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function NoResultsState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="w-7 h-7" />}
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try a different search term.`
          : "Try searching for a movie, TV show, or anime."
      }
    />
  );
}
