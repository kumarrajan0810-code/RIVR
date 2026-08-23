"use client";

import { useState } from "react";
import { Settings, User, Monitor, Globe, Bell, Shield, Zap, Check, Key } from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/Button";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", description: "Manage your profiles and avatar", href: "#" },
      { icon: Shield, label: "Security", description: "Password and authentication", href: "#" },
    ],
  },
  {
    title: "Playback",
    items: [
      { icon: Monitor, label: "Quality", description: "Default playback quality settings", href: "#" },
      { icon: Globe, label: "Language", description: "Subtitle and audio language preferences", href: "#" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: Bell, label: "Notifications", description: "Manage notification preferences", href: "#" },
      { icon: Settings, label: "Providers", description: "Configure media providers", href: "/settings/providers" },
    ],
  },
];

export default function SettingsPage() {
  const { debridApiKey, debridProvider, setDebridApiKey, setDebridProvider } = useUserStore();
  const [apiKeyInput, setApiKeyInput] = useState(debridApiKey || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveDebrid = (e: React.FormEvent) => {
    e.preventDefault();
    setDebridApiKey(apiKeyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl space-y-8 pb-24">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your playback quality, CDN acceleration, and account preferences</p>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-border">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-[#00DF81]/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00DF81]/20">
          <span className="text-black font-bold text-xl">R</span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">Rajan</h3>
          <p className="text-sm text-muted-foreground">Personal account • RIVR VIP</p>
        </div>
      </div>

      {/* High-Speed Streaming CDN (Zero-Buffer Acceleration) */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-[#262626] space-y-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                Ultra-Fast CDN Mode
                <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                  10 Gbps
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Connect Real-Debrid or TorBox for zero-buffering 4K remux and multi-audio playback.
              </p>
            </div>
          </div>
          {debridApiKey ? (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 flex-shrink-0">
              <Check className="w-3.5 h-3.5" /> Active
            </span>
          ) : (
            <span className="text-xs text-muted-foreground bg-[#202020] px-2.5 py-1 rounded-full flex-shrink-0">
              Standard CDN
            </span>
          )}
        </div>

        <form onSubmit={handleSaveDebrid} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDebridProvider("realdebrid")}
              className={`p-3 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                debridProvider === "realdebrid"
                  ? "bg-white/10 border-accent text-white"
                  : "bg-surface-elevated border-border text-muted-foreground hover:text-white"
              }`}
            >
              <div className="font-semibold">Real-Debrid</div>
              <div className="text-[11px] opacity-70">Multi-Gigabit AWS CDN</div>
            </button>
            <button
              type="button"
              onClick={() => setDebridProvider("torbox")}
              className={`p-3 rounded-xl border text-sm font-medium text-left transition-all cursor-pointer ${
                debridProvider === "torbox"
                  ? "bg-white/10 border-accent text-white"
                  : "bg-surface-elevated border-border text-muted-foreground hover:text-white"
              }`}
            >
              <div className="font-semibold">TorBox Cloud</div>
              <div className="text-[11px] opacity-70">Direct Debrid Node</div>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your Real-Debrid / TorBox API Key..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="text-black font-bold px-6 py-2.5 whitespace-nowrap cursor-pointer shadow-lg shadow-[#00DF81]/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Saved!
                </>
              ) : (
                "Apply CDN Key"
              )}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Get your instant API token from{" "}
            <a
              href="https://real-debrid.com/apitoken"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              real-debrid.com/apitoken
            </a>{" "}
            or leave empty to use our standard cloud player suite.
          </p>
        </form>
      </div>

      {/* Settings groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h2>
          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-hover transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{item.label}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
