"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RatingBadge } from "@/components/ui/Badge";
import { CastList } from "@/components/media/CastList";
import { SeasonSelector } from "@/components/media/SeasonSelector";
import { EpisodeList } from "@/components/media/EpisodeList";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { ErrorState } from "@/components/common/EmptyState";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { MOCK_SERIES, MOCK_EPISODES, getAllMedia } from "@/providers/mock/data";
import type { MediaItem, Episode } from "@/providers/core/types";

export default function SeriesDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toggleItem, isInList } = useWatchlistStore();

  const [series, setSeries] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  useEffect(() => {
    async function loadSeries() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSeries(data);
        } else {
          const found = MOCK_SERIES.find((m) => m.id === id);
          setSeries(found || null);
        }
      } catch {
        const found = MOCK_SERIES.find((m) => m.id === id);
        setSeries(found || null);
      } finally {
        setLoading(false);
      }
    }

    loadSeries();
  }, [id]);

  useEffect(() => {
    async function loadEpisodes() {
      if (!series) return;
      setEpisodesLoading(true);
      try {
        const res = await fetch(`/api/media/${id}/episodes?season=${activeSeason}`);
        if (res.ok) {
          const data = await res.json();
          if (data.episodes && data.episodes.length > 0) {
            setSeasonEpisodes(data.episodes);
            return;
          }
        }
        // Fallback
        const fallback = MOCK_EPISODES[`${id}:${activeSeason}`] || [];
        setSeasonEpisodes(fallback);
      } catch {
        const fallback = MOCK_EPISODES[`${id}:${activeSeason}`] || [];
        setSeasonEpisodes(fallback);
      } finally {
        setEpisodesLoading(false);
      }
    }

    loadEpisodes();
  }, [id, series, activeSeason]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!series) {
    return <ErrorState title="Series Not Found" message="This series could not be found." />;
  }

  const recommendations = getAllMedia()
    .filter((m) => m.id !== series.id && m.genres.some((g) => series.genres.some((sg) => sg.id === g.id)))
    .slice(0, 10);

  return (
    <div>
      {/* Hero backdrop */}
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] -mt-14">
        {series.backdrop ? (
          <Image src={series.backdrop} alt={series.title} fill className="object-cover object-top" priority sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
        )}
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-gradient-bottom absolute inset-0" />

        <div className="absolute top-20 left-4 md:left-8 z-10">
          <Link href="/tv" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all backdrop-blur-sm text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </section>

      <div className="px-4 md:px-8 -mt-28 relative z-10 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 hidden md:block">
            <div className="relative w-[200px] aspect-poster rounded-xl overflow-hidden shadow-2xl">
              {series.poster && <Image src={series.poster} alt={series.title} fill className="object-cover" sizes="200px" />}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{series.title}</h1>

            <div className="flex items-center flex-wrap gap-2">
              {series.rating && <RatingBadge rating={series.rating} />}
              {series.year && <Badge variant="outline">{series.year}</Badge>}
              {series.totalSeasons && <Badge variant="outline">{series.totalSeasons} Seasons</Badge>}
              {series.totalEpisodes && <Badge variant="outline">{series.totalEpisodes} Episodes</Badge>}
              {series.genres.map((genre) => <Badge key={genre.id}>{genre.name}</Badge>)}
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/watch/${series.id}?episode=${seasonEpisodes[0]?.id || `ep-${activeSeason}-1`}`}>
                <Button variant="primary" size="lg" className="font-bold text-black px-6 shadow-xl shadow-[#00DF81]/25">
                  <Play className="w-5 h-5 fill-black text-black" /> Watch Now
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => series && toggleItem(series)}
                className="cursor-pointer"
              >
                {series && isInList(series.id) ? (
                  <>
                    <Check className="w-5 h-5 text-accent" />
                    <span>In My List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add to List</span>
                  </>
                )}
              </Button>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">{series.overview}</p>

            {series.cast && <CastList cast={series.cast} />}
          </div>
        </div>

        {/* Seasons & Episodes */}
        {series.seasons && series.seasons.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Episodes</h2>
            <SeasonSelector
              seasons={series.seasons}
              activeSeason={activeSeason}
              onSeasonChange={setActiveSeason}
            />
            {episodesLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : (
              <EpisodeList episodes={seasonEpisodes} />
            )}
          </div>
        )}

        {recommendations.length > 0 && (
          <MediaCarousel title="You Might Also Like" items={recommendations} showType />
        )}
      </div>

      <div className="h-20" />
    </div>
  );
}
