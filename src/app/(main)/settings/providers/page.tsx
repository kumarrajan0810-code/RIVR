"use client";

import { useState } from "react";
import { Check, X, RefreshCw, ChevronRight, Database, Film, Sparkles, Server, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ProviderConfig } from "@/providers/core/types";

const MOCK_PROVIDERS: ProviderConfig[] = [
  {
    id: "videasy",
    name: "VIDEASY Streaming",
    enabled: true,
    type: "streaming",
    capabilities: ["streaming"],
    status: "connected",
    lastSync: "2026-08-22T16:00:00Z",
  },
  {
    id: "tmdb",
    name: "TMDB",
    enabled: true,
    type: "metadata",
    capabilities: ["search", "movie-metadata", "series-metadata", "trending", "popular", "recommendations"],
    status: "connected",
    lastSync: "2026-08-22T10:00:00Z",
  },
  {
    id: "anilist",
    name: "AniList",
    enabled: true,
    type: "metadata",
    capabilities: ["search", "anime-metadata", "trending", "popular", "recommendations"],
    status: "connected",
    lastSync: "2026-08-22T09:00:00Z",
  },
  {
    id: "jellyfin",
    name: "Jellyfin Server",
    enabled: false,
    type: "both",
    capabilities: ["search", "movie-metadata", "series-metadata", "streaming", "subtitles", "user-library"],
    status: "disconnected",
  },
  {
    id: "custom",
    name: "Custom Authorized HLS",
    enabled: false,
    type: "streaming",
    capabilities: ["streaming", "subtitles"],
    status: "disconnected",
  },
];

const providerIcons: Record<string, React.ReactNode> = {
  videasy: <PlaySquare className="w-5 h-5 text-accent" />,
  tmdb: <Film className="w-5 h-5" />,
  anilist: <Sparkles className="w-5 h-5" />,
  jellyfin: <Server className="w-5 h-5" />,
  custom: <Database className="w-5 h-5" />,
};

export default function ProviderSettingsPage() {
  const [providers, setProviders] = useState(MOCK_PROVIDERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const toggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled, status: !p.enabled ? "connected" : "disconnected" } : p
      )
    );
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    await new Promise((r) => setTimeout(r, 1500));
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "connected" } : p))
    );
    setTesting(null);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Media Providers</h1>
        <p className="text-muted-foreground text-sm">Configure your media sources</p>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div key={provider.id} className="rounded-xl border border-border bg-surface overflow-hidden">
            {/* Provider header */}
            <button
              onClick={() => setExpandedId(expandedId === provider.id ? null : provider.id)}
              className="flex items-center gap-4 w-full p-4 hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                provider.enabled ? "bg-accent/10 text-accent" : "bg-surface-elevated text-muted"
              )}>
                {providerIcons[provider.id]}
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-medium text-foreground">{provider.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={provider.type === "both" ? "accent" : provider.type === "metadata" ? "default" : "gold"} size="sm">
                    {provider.type}
                  </Badge>
                  <span className={cn(
                    "text-xs",
                    provider.status === "connected" ? "text-success" : provider.status === "error" ? "text-danger" : "text-muted-foreground"
                  )}>
                    {provider.status === "connected" ? "● Connected" : provider.status === "error" ? "● Error" : "○ Disconnected"}
                  </span>
                </div>
              </div>
              {/* Toggle */}
              <div
                onClick={(e) => { e.stopPropagation(); toggleProvider(provider.id); }}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0",
                  provider.enabled ? "bg-accent" : "bg-surface-elevated"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                  provider.enabled ? "translate-x-5.5" : "translate-x-0.5"
                )} />
              </div>
              <ChevronRight className={cn("w-4 h-4 text-muted transition-transform", expandedId === provider.id && "rotate-90")} />
            </button>

            {/* Expanded */}
            {expandedId === provider.id && (
              <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border">
                <div className="pt-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" size="sm">{cap}</Badge>
                    ))}
                  </div>
                </div>

                {provider.id === "videasy" && (
                  <div className="space-y-3 bg-surface-elevated/40 p-3 rounded-lg">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Accent Theme Color (Hex)</label>
                      <input type="text" defaultValue="8B5CF6" placeholder="8B5CF6" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Enable Netflix Overlay</span>
                      <span className="text-success font-medium">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sync Watch Progress (postMessage)</span>
                      <span className="text-success font-medium">Active</span>
                    </div>
                  </div>
                )}

                {provider.id === "jellyfin" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Server URL</label>
                      <input type="text" placeholder="http://192.168.1.100:8096" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">API Key</label>
                      <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={testing === provider.id}
                    onClick={() => testConnection(provider.id)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Test Connection
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
