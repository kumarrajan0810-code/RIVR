"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RatingBadge } from "@/components/ui/Badge";
import { SeasonSelector } from "@/components/media/SeasonSelector";
import { EpisodeList } from "@/components/media/EpisodeList";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { ErrorState } from "@/components/common/EmptyState";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { MOCK_ANIME, getAllMedia } from "@/providers/mock/data";
import type { MediaItem } from "@/providers/core/types";

export default function AnimeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { toggleItem, isInList } = useWatchlistStore();
  const { getProgress } = useWatchHistory();

  const [anime, setAnime] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState(1);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAnime(data);
        } else {
          // Fallback to mock
          const found = MOCK_ANIME.find((m) => m.id === id);
          setAnime(found || null);
        }
      } catch {
        const found = MOCK_ANIME.find((m) => m.id === id);
        setAnime(found || null);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return <ErrorState title="Anime Not Found" message="This anime could not be found." />;
  }

  const selectedSeason = anime.seasons?.find((s) => s.seasonNumber === activeSeason) || anime.seasons?.[0];
  const episodes = selectedSeason?.episodes || [];
  const recommendations = getAllMedia()
    .filter((m) => m.id !== anime.id && m.genres.some((g) => anime.genres.some((ag) => ag.id === g.id)))
    .slice(0, 10);

  return (
    <div>
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] -mt-14">
        {anime.backdrop ? (
          <Image src={anime.backdrop} alt={anime.title} fill className="object-cover object-top" priority sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
        )}
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-gradient-bottom absolute inset-0" />

        <div className="absolute top-20 left-4 md:left-8 z-10">
          <Link href="/anime" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all backdrop-blur-sm text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </section>

      <div className="px-4 md:px-8 -mt-28 relative z-10 max-w-6xl space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 hidden md:block">
            <div className="relative w-[200px] aspect-poster rounded-xl overflow-hidden shadow-2xl">
              {anime.poster && <Image src={anime.poster} alt={anime.title} fill className="object-cover" sizes="200px" />}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">{anime.title}</h1>
              {anime.originalTitle && anime.originalTitle !== anime.title && (
                <p className="text-muted-foreground text-sm mt-1">{anime.originalTitle}</p>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {anime.rating && <RatingBadge rating={anime.rating} />}
              {anime.year && <Badge variant="outline">{anime.year}</Badge>}
              {anime.totalEpisodes && <Badge variant="outline">{anime.totalEpisodes} Episodes</Badge>}
              {anime.genres.map((genre) => <Badge key={genre.id}>{genre.name}</Badge>)}
            </div>

            <div className="flex items-center flex-wrap gap-3">
              {(() => {
                const savedProgress = anime ? getProgress(anime.id) : undefined;
                if (savedProgress && (savedProgress.position > 0 || savedProgress.episodeId)) {
                  const resumeEpId = savedProgress.episodeId || episodes[0]?.id || "ep-1";
                  const resumeUrl = `/watch/${anime.id}?episode=${encodeURIComponent(resumeEpId)}&t=${Math.floor(savedProgress.position || 0)}`;
                  const resumeLabel = savedProgress.episodeNumber
                    ? `Resume Ep ${savedProgress.episodeNumber}`
                    : "Resume Watching";

                  return (
                    <>
                      <Link href={resumeUrl}>
                        <Button variant="primary" size="lg" className="font-bold text-black px-6 shadow-xl shadow-white/10 flex items-center gap-2">
                          <Play className="w-5 h-5 fill-black text-black" />
                          <span>{resumeLabel}</span>
                          <span className="text-xs bg-black/25 text-black px-2 py-0.5 rounded-full font-semibold">
                            {Math.floor((savedProgress.position || 0) / 60)}m
                          </span>
                        </Button>
                      </Link>
                      <Link href={`/watch/${anime.id}?episode=${episodes[0]?.id || "ep-1"}&t=0`}>
                        <Button variant="secondary" size="lg" className="border border-white/10 hover:border-white/30 text-xs">
                          Start from Ep 1
                        </Button>
                      </Link>
                    </>
                  );
                }

                return (
                  <Link href={`/watch/${anime.id}?episode=${episodes[0]?.id || "ep-1"}`}>
                    <Button variant="primary" size="lg" className="font-bold text-black px-6 shadow-xl shadow-white/10">
                      <Play className="w-5 h-5 fill-black text-black" /> Watch Now
                    </Button>
                  </Link>
                );
              })()}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => anime && toggleItem(anime)}
                className="cursor-pointer"
              >
                {anime && isInList(anime.id) ? (
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

            <p className="text-muted-foreground text-sm leading-relaxed">{anime.overview}</p>

            {anime.studios && anime.studios.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Studio: </span>
                <span className="text-foreground font-medium">{anime.studios.map((s) => s.name).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {anime.seasons && anime.seasons.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Episodes</h2>
            <SeasonSelector seasons={anime.seasons} activeSeason={activeSeason} onSeasonChange={setActiveSeason} />
            <EpisodeList episodes={episodes} />
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
