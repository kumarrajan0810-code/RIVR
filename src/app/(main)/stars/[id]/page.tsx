"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Film, Video, Star, Sparkles, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { cn } from "@/lib/utils";
import { MediaType } from "@/providers/core/types";
import type { MediaItem } from "@/providers/core/types";

interface StarData {
  star: {
    id: string;
    tmdbId: number;
    name: string;
    biography: string;
    birthday?: string;
    placeOfBirth?: string;
    profileImage: string;
    role: "FEATURING" | "FROM";
    knownFor: string;
    isDirector: boolean;
  };
  directed: MediaItem[];
  starred: MediaItem[];
}

export default function StarDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<StarData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"directed" | "movies" | "shows">("directed");

  useEffect(() => {
    async function loadStar() {
      if (!params.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/media/stars/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          // Default tab based on role
          if (json.star?.isDirector) {
            setActiveTab("directed");
          } else {
            setActiveTab("movies");
          }
        }
      } catch (err) {
        console.error("Failed to load star details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStar();
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00DF81] animate-spin" />
      </div>
    );
  }

  if (!data || !data.star) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Star not found.</p>
        <Link href="/stars">
          <Button variant="secondary">Back to Star Power</Button>
        </Link>
      </div>
    );
  }

  const { star, directed, starred } = data;

  const starringMovies = starred.filter((item) => item.type === MediaType.MOVIE);
  const starringShows = starred.filter((item) => item.type === MediaType.SERIES);

  return (
    <div className="space-y-10 px-4 md:px-8 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#262626] border border-[#262626] text-[#F2F2F2] transition-all text-sm font-medium cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Stars</span>
      </button>

      {/* Hero Profile Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#121212] border border-[#262626] p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00DF81]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Portrait Image */}
          <div className="relative w-44 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-[#333333]">
            {star.profileImage ? (
              <Image
                src={star.profileImage}
                alt={star.name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 176px, 224px"
                priority
              />
            ) : (
              <div className="w-full h-full bg-[#1F1F1F] flex items-center justify-center">
                <Star className="w-12 h-12 text-muted" />
              </div>
            )}
          </div>

          {/* Info Details */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00DF81]/15 border border-[#00DF81]/30 text-[#00DF81] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{star.isDirector ? "Visionary Director" : "Acclaimed Star"}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight">
                {star.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[#81807E]">
                {star.knownFor && (
                  <span className="font-medium text-[#B3B3B2]">
                    Primary: {star.knownFor}
                  </span>
                )}
                {star.birthday && (
                  <span>• Born: {star.birthday}</span>
                )}
                {star.placeOfBirth && (
                  <span>• {star.placeOfBirth}</span>
                )}
              </div>
            </div>

            {/* Biography */}
            {star.biography ? (
              <p className="text-sm text-[#B3B3B2] leading-relaxed line-clamp-4 max-w-4xl">
                {star.biography}
              </p>
            ) : (
              <p className="text-sm text-[#81807E] italic">
                Explore the complete collection of titles featuring or directed by {star.name}.
              </p>
            )}

            {/* Stats Pills */}
            <div className="flex items-center gap-3 pt-2">
              {directed.length > 0 && (
                <div className="px-4 py-2 rounded-xl bg-[#1F1F1F] border border-[#262626] text-xs font-medium text-[#F2F2F2]">
                  <span className="text-[#00DF81] font-bold mr-1.5">{directed.length}</span>
                  Directed Works
                </div>
              )}
              {starringMovies.length > 0 && (
                <div className="px-4 py-2 rounded-xl bg-[#1F1F1F] border border-[#262626] text-xs font-medium text-[#F2F2F2]">
                  <span className="text-[#00DF81] font-bold mr-1.5">{starringMovies.length}</span>
                  Starring Films
                </div>
              )}
              {starringShows.length > 0 && (
                <div className="px-4 py-2 rounded-xl bg-[#1F1F1F] border border-[#262626] text-xs font-medium text-[#F2F2F2]">
                  <span className="text-[#00DF81] font-bold mr-1.5">{starringShows.length}</span>
                  TV Shows
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filmography Section */}
      <div className="space-y-8">
        {/* Section Underline Tabs */}
        <div className="flex items-center gap-6 border-b border-[#262626] overflow-x-auto no-scrollbar pb-0">
          {starringMovies.length > 0 && (
            <button
              onClick={() => setActiveTab("movies")}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "movies"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="w-4 h-4" />
              <span>Starring Movies</span>
              <span className={cn("text-xs font-normal", activeTab === "movies" ? "text-accent/80" : "text-muted-foreground")}>
                ({starringMovies.length})
              </span>
            </button>
          )}

          {starringShows.length > 0 && (
            <button
              onClick={() => setActiveTab("shows")}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "shows"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Star className="w-4 h-4" />
              <span>TV Series</span>
              <span className={cn("text-xs font-normal", activeTab === "shows" ? "text-accent/80" : "text-muted-foreground")}>
                ({starringShows.length})
              </span>
            </button>
          )}

          {directed.length > 0 && (
            <button
              onClick={() => setActiveTab("directed")}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === "directed"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="w-4 h-4" />
              <span>Directed Works</span>
              <span className={cn("text-xs font-normal", activeTab === "directed" ? "text-accent/80" : "text-muted-foreground")}>
                ({directed.length})
              </span>
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        {activeTab === "directed" && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              Films & Shows Directed by {star.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {directed.map((item) => (
                <MediaCard key={item.id} item={item} showType />
              ))}
            </div>
          </div>
        )}

        {activeTab === "movies" && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              Feature Films Starring {star.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {starringMovies.map((item) => (
                <MediaCard key={item.id} item={item} showType />
              ))}
            </div>
          </div>
        )}

        {activeTab === "shows" && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              TV Shows Featuring {star.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {starringShows.map((item) => (
                <MediaCard key={item.id} item={item} showType />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
