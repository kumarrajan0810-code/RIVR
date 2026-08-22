import { NextRequest, NextResponse } from "next/server";
import { tmdbClient } from "@/providers/tmdb/client";
import { MOCK_SERIES, MOCK_MOVIES } from "@/providers/mock/data";
import type { MediaItem } from "@/providers/core/types";

// Mapping network keys to TMDB network IDs & watch provider IDs
const NETWORK_CONFIG: Record<
  string,
  { name: string; networkId: number; providerId: number; color: string }
> = {
  netflix: { name: "Netflix", networkId: 213, providerId: 8, color: "#E50914" },
  prime: { name: "Prime Video", networkId: 1024, providerId: 9, color: "#00A8E1" },
  hbo: { name: "HBO Max", networkId: 3186, providerId: 1899, color: "#9900FF" },
  disney: { name: "Disney+", networkId: 2739, providerId: 337, color: "#113CCF" },
  apple: { name: "Apple TV+", networkId: 2552, providerId: 350, color: "#FFFFFF" },
  paramount: { name: "Paramount+", networkId: 4330, providerId: 531, color: "#0064FF" },
  hulu: { name: "Hulu", networkId: 453, providerId: 15, color: "#1CE783" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const networkKey = (searchParams.get("network") || "netflix").toLowerCase();
  const config = NETWORK_CONFIG[networkKey] || NETWORK_CONFIG.netflix;

  try {
    if (tmdbClient.hasApiKey()) {
      // Fetch both popular TV and Movies for the network
      const [tvItems, movieItems] = await Promise.all([
        tmdbClient.getByNetwork(config.networkId),
        tmdbClient.getByWatchProvider(config.providerId, "movie"),
      ]);

      const combined = [...tvItems, ...movieItems].filter(
        (item, index, self) =>
          self.findIndex((t) => t.id === item.id) === index && (item.poster || item.backdrop)
      );

      if (combined.length > 0) {
        return NextResponse.json({
          network: config,
          items: combined.slice(0, 20),
        });
      }
    }
  } catch (err) {
    console.error("Error fetching network media:", err);
  }

  // Fallback to mock data
  const fallbackItems: MediaItem[] = [...MOCK_SERIES, ...MOCK_MOVIES];
  return NextResponse.json({
    network: config,
    items: fallbackItems,
  });
}
