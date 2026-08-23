import type { MediaProvider } from "./provider";
import type { ProviderConfig } from "./types";

/**
 * Provider Registry — singleton that manages all media providers.
 * Providers are registered at startup and can be enabled/disabled at runtime.
 */
class ProviderRegistryImpl {
  private providers = new Map<string, MediaProvider>();
  private enabledProviders = new Set<string>();

  register(provider: MediaProvider): void {
    this.providers.set(provider.id, provider);
    this.enabledProviders.add(provider.id);
  }

  unregister(providerId: string): void {
    this.providers.delete(providerId);
    this.enabledProviders.delete(providerId);
  }

  enable(providerId: string): void {
    if (this.providers.has(providerId)) {
      this.enabledProviders.add(providerId);
    }
  }

  disable(providerId: string): void {
    this.enabledProviders.delete(providerId);
  }

  isEnabled(providerId: string): boolean {
    return this.enabledProviders.has(providerId);
  }

  get(providerId: string): MediaProvider | undefined {
    return this.providers.get(providerId);
  }

  getEnabled(): MediaProvider[] {
    return Array.from(this.enabledProviders)
      .map((id) => this.providers.get(id))
      .filter((p): p is MediaProvider => p !== undefined);
  }

  getAll(): MediaProvider[] {
    return Array.from(this.providers.values());
  }

  getConfigs(): ProviderConfig[] {
    return this.getAll().map((p) => ({
      ...p.getConfig(),
      enabled: this.isEnabled(p.id),
    }));
  }

  getByCapability(capability: string): MediaProvider[] {
    return this.getEnabled().filter((p) =>
      p.capabilities.includes(capability as never)
    );
  }

  getMetadataProviders(): MediaProvider[] {
    return this.getEnabled().filter(
      (p) => p.type === "metadata" || p.type === "both"
    );
  }

  getStreamingProviders(): MediaProvider[] {
    return this.getEnabled().filter(
      (p) => p.type === "streaming" || p.type === "both"
    );
  }
}

// Singleton
export const providerRegistry = new ProviderRegistryImpl();

// Auto-register built-in providers
import { videasyProvider } from "../videasy/provider";
import { vidkingProvider } from "../vidking/provider";
import { vidlinkProvider } from "../vidlink/provider";
import { autoEmbedProvider } from "../autoembed/provider";
import { cineProProvider } from "../cinepro/provider";
import { debridProvider } from "../debrid/provider";
import { aniListProvider } from "../anilist/provider";
import { tmdbProvider } from "../tmdb/provider";

providerRegistry.register(aniListProvider);
providerRegistry.register(tmdbProvider);
providerRegistry.register(debridProvider);
providerRegistry.register(videasyProvider);
providerRegistry.register(vidlinkProvider);
providerRegistry.register(vidkingProvider);
providerRegistry.register(cineProProvider);
providerRegistry.register(autoEmbedProvider);
