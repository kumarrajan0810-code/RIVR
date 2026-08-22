"use client";

import { Settings, User, Monitor, Globe, Bell, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-surface border border-border">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">Rajan</h3>
          <p className="text-sm text-muted-foreground">Personal account</p>
        </div>
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
