"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/media/HeroSection";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { StreamingNetworkRail } from "@/components/media/StreamingNetworkRail";
import { StarPowerRail } from "@/components/media/StarPowerRail";
import { useHistoryStore } from "@/stores/historyStore";
import { useWatchlistStore } from "@/stores/watchlistStore";
import {
  MOCK_MOVIES,
  MOCK_SERIES,
  MOCK_ANIME,
} from "@/providers/mock/data";
import type { MediaItem, WatchProgress } from "@/providers/core/types";

export default function HomePage() {
  const continueWatching = useHistoryStore((state) => state.items);
  const { toggleItem } = useWatchlistStore();
  const [hasMounted, setHasMounted] = useState(false);

  const [heroItems, setHeroItems] = useState<MediaItem[]>([
    MOCK_MOVIES[0],
    MOCK_ANIME[0],
    MOCK_SERIES[0],
    MOCK_MOVIES[1],
  ]);
  const [trendingNow, setTrendingNow] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>(MOCK_MOVIES);
  const [popularTV, setPopularTV] = useState<MediaItem[]>(MOCK_SERIES);
  const [popularAnime, setPopularAnime] = useState<MediaItem[]>(MOCK_ANIME);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function loadFreshContent() {
      try {
        // 1. Fetch live new movies, TV shows, and anime in parallel
        const [moviesRes, tvRes, animeRes, trendingRes] = await Promise.all([
          fetch("/api/media/popular?type=movie"),
          fetch("/api/media/popular?type=series"),
          fetch("/api/media/trending?type=anime"),
          fetch("/api/media/trending"),
        ]);

        const [moviesData, tvData, animeData, trendingData] = await Promise.all([
          moviesRes.ok ? moviesRes.json() : { items: [] },
          tvRes.ok ? tvRes.json() : { items: [] },
          animeRes.ok ? animeRes.json() : { items: [] },
          trendingRes.ok ? trendingRes.json() : { items: [] },
        ]);

        const liveMovies: MediaItem[] = moviesData.items?.length ? moviesData.items : MOCK_MOVIES;
        const liveTV: MediaItem[] = tvData.items?.length ? tvData.items : MOCK_SERIES;
        const liveAnime: MediaItem[] = animeData.items?.length ? animeData.items : MOCK_ANIME;
        const liveTrending: MediaItem[] = trendingData.items?.length ? trendingData.items : [...liveMovies.slice(0, 4), ...liveTV.slice(0, 3), ...liveAnime.slice(0, 3)];

        setPopularMovies(liveMovies);
        setPopularTV(liveTV);
        setPopularAnime(liveAnime);
        setTrendingNow(liveTrending);

        // 2. Curate Hero items: Latest hot movies, current season anime, and top new series with valid backdrops
        const curatedHero: MediaItem[] = [];
        if (liveMovies[0] && liveMovies[0].backdrop) curatedHero.push(liveMovies[0]);
        if (liveAnime[0] && liveAnime[0].backdrop) curatedHero.push(liveAnime[0]);
        if (liveTV[0] && liveTV[0].backdrop) curatedHero.push(liveTV[0]);
        if (liveMovies[1] && liveMovies[1].backdrop) curatedHero.push(liveMovies[1]);
        if (liveAnime[1] && liveAnime[1].backdrop) curatedHero.push(liveAnime[1]);
        if (liveTV[1] && liveTV[1].backdrop) curatedHero.push(liveTV[1]);

        if (curatedHero.length >= 3) {
          setHeroItems(curatedHero);
        }
      } catch (err) {
        console.error("Error loading fresh home content:", err);
      }
    }

    loadFreshContent();
  }, []);

  // Build progress map for continue watching
  const progressMap = new Map<string, WatchProgress>();
  continueWatching.forEach((item) => {
    progressMap.set(item.id, item.progress);
  });

  return (
    <div className="space-y-10 md:space-y-14">
      {/* Hero with rotating latest movies, anime & shows */}
      <HeroSection items={heroItems} />

      {/* Content rails */}
      <div className="space-y-10 md:space-y-14 px-4 md:px-8">
        {/* Continue Watching */}
        {hasMounted && continueWatching.length > 0 && (
          <MediaCarousel
            title="Continue Watching"
            items={continueWatching}
            progressMap={progressMap}
            seeAllHref="/continue-watching"
          />
        )}

        {/* Trending Now */}
        <MediaCarousel
          title="Trending Now"
          items={trendingNow.length > 0 ? trendingNow : [...popularMovies.slice(0, 4), ...popularTV.slice(0, 3)]}
          showType
        />

        {/* Only on Streaming Providers (Netflix, Prime, HBO Max, Disney+, Apple TV+, Paramount+, Hulu) */}
        <StreamingNetworkRail />

        {/* Star Power Curated Actors & Directors */}
        <StarPowerRail />

        {/* Popular & New Movies */}
        <MediaCarousel
          title="New & Popular Movies"
          items={popularMovies}
          seeAllHref="/movies"
        />

        {/* Top TV Shows */}
        <MediaCarousel
          title="Hit TV Series"
          items={popularTV}
          seeAllHref="/tv"
        />

        {/* Trending Anime */}
        <MediaCarousel
          title="Trending Anime (Current Season)"
          items={popularAnime}
          seeAllHref="/anime"
        />
      </div>
    </div>
  );
}
