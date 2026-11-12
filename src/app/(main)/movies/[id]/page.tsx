"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RatingBadge } from "@/components/ui/Badge";
import { CastList } from "@/components/media/CastList";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { ErrorState } from "@/components/common/EmptyState";
import { formatRuntime } from "@/lib/utils";
import { MOCK_MOVIES, getAllMedia } from "@/providers/mock/data";
import { useWatchlistStore } from "@/stores/watchlistStore";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import type { MediaItem } from "@/providers/core/types";

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { toggleItem, isInList } = useWatchlistStore();
  const { getProgress } = useWatchHistory();
  const [movie, setMovie] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovie() {
      setLoading(true);
      try {
        const res = await fetch(`/api/media/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMovie(data);
        } else {
          const found = MOCK_MOVIES.find((m) => m.id === id);
          setMovie(found || null);
        }
      } catch {
        const found = MOCK_MOVIES.find((m) => m.id === id);
        setMovie(found || null);
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return <ErrorState title="Movie Not Found" message="This movie could not be found." />;
  }

  const recommendations = getAllMedia()
    .filter(
      (m) =>
        m.id !== movie.id &&
        m.genres.some((g) => movie.genres.some((mg) => mg.id === g.id))
    )
    .slice(0, 10);

  return (
    <div>
      {/* Hero backdrop */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] -mt-14">
        {movie.backdrop ? (
          <Image
            src={movie.backdrop}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
        )}
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-gradient-bottom absolute inset-0" />

        {/* Back button */}
        <div className="absolute top-20 left-4 md:left-8 z-10">
          <Link
            href="/movies"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-all backdrop-blur-sm text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 md:px-8 -mt-32 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 hidden md:block">
            <div className="relative w-[220px] aspect-poster rounded-xl overflow-hidden shadow-2xl">
              {movie.poster && (
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-muted-foreground italic text-sm">&ldquo;{movie.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center flex-wrap gap-2">
              {movie.rating && <RatingBadge rating={movie.rating} />}
              {movie.year && <Badge variant="outline">{movie.year}</Badge>}
              {movie.runtime && <Badge variant="outline">{formatRuntime(movie.runtime)}</Badge>}
              {movie.genres.map((genre) => (
                <Badge key={genre.id}>{genre.name}</Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-3">
              {(() => {
                const savedProgress = movie ? getProgress(movie.id) : undefined;
                if (savedProgress && savedProgress.position > 0) {
                  return (
                    <>
                      <Link href={`/watch/${movie.id}?t=${Math.floor(savedProgress.position)}`}>
                        <Button variant="primary" size="lg" className="font-bold text-black px-6 shadow-xl shadow-white/10 flex items-center gap-2">
                          <Play className="w-5 h-5 fill-black text-black" />
                          <span>Resume Movie</span>
                          <span className="text-xs bg-black/25 text-black px-2 py-0.5 rounded-full font-semibold">
                            {Math.floor(savedProgress.position / 60)}m
                          </span>
                        </Button>
                      </Link>
                      <Link href={`/watch/${movie.id}?t=0`}>
                        <Button variant="secondary" size="lg" className="border border-white/10 hover:border-white/30 text-xs">
                          Start Over
                        </Button>
                      </Link>
                    </>
                  );
                }

                return (
                  <Link href={`/watch/${movie.id}`}>
                    <Button variant="primary" size="lg" className="font-bold text-black px-6 shadow-xl shadow-white/10">
                      <Play className="w-5 h-5 fill-black text-black" />
                      Watch Now
                    </Button>
                  </Link>
                );
              })()}
              <Button
                variant="secondary"
                size="lg"
                onClick={() => movie && toggleItem(movie)}
                className="cursor-pointer"
              >
                {movie && isInList(movie.id) ? (
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

            {/* Overview */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">Overview</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{movie.overview}</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {movie.directors && movie.directors.length > 0 && (
                <div>
                  <span className="text-muted-foreground block">Director</span>
                  <span className="text-foreground font-medium">{movie.directors.map((d) => d.name).join(", ")}</span>
                </div>
              )}
              {movie.studios && movie.studios.length > 0 && (
                <div>
                  <span className="text-muted-foreground block">Studio</span>
                  <span className="text-foreground font-medium">{movie.studios.map((s) => s.name).join(", ")}</span>
                </div>
              )}
              {movie.status && (
                <div>
                  <span className="text-muted-foreground block">Status</span>
                  <span className="text-foreground font-medium">{movie.status}</span>
                </div>
              )}
            </div>

            {/* Cast */}
            {movie.cast && <CastList cast={movie.cast} />}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <MediaCarousel title="You Might Also Like" items={recommendations} showType />
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
}
