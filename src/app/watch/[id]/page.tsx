"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { videasyProvider } from "@/providers/videasy/provider";
import { vidkingProvider } from "@/providers/vidking/provider";
import { vidlinkProvider } from "@/providers/vidlink/provider";
import { vidyProvider } from "@/providers/vidy/provider";
import { vidRiftProvider } from "@/providers/vidrift/provider";
import { atlanticProvider } from "@/providers/atlantic/provider";
import { cineProProvider } from "@/providers/cinepro/provider";
import { autoEmbedProvider } from "@/providers/autoembed/provider";
import { debridProvider } from "@/providers/debrid/provider";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useUserStore } from "@/stores/userStore";
import { parseEpisodeInfo } from "@/lib/utils";
import { MediaType, type Stream, type MediaItem, type Episode } from "@/providers/core/types";
import { MOCK_EPISODES } from "@/providers/mock/data";

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const episodeId = searchParams.get("episode") || undefined;
  const timeParam = searchParams.get("t");
  const serverParam = searchParams.get("server") || searchParams.get("provider") || undefined;
  const parsedTime = timeParam ? parseInt(timeParam, 10) : undefined;

  const [media, setMedia] = useState<MediaItem | null>(null);
  const { getProgress, recordProgress } = useWatchHistory();
  const { debridApiKey } = useUserStore();

  const [availableStreams, setAvailableStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);

  // Preferred server/provider lock for this series (persists during the session)
  const [preferredProvider, setPreferredProvider] = useState<string | null>(() => {
    if (serverParam) return serverParam;
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem(`revara_preferred_provider_${id}`) || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const preferredProviderRef = useRef<string | null>(preferredProvider);
  useEffect(() => {
    preferredProviderRef.current = preferredProvider;
  }, [preferredProvider]);

  // Synchronize serverParam if present in URL
  useEffect(() => {
    if (serverParam && serverParam !== preferredProvider) {
      setPreferredProvider(serverParam);
      preferredProviderRef.current = serverParam;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`revara_preferred_provider_${id}`, serverParam);
        } catch {}
      }
    }
  }, [serverParam, id, preferredProvider]);

  // Parse current episode info from search param
  const parsedEp = parseEpisodeInfo(episodeId);

  // Active Season state (for episode drawer navigation)
  const [activeSeason, setActiveSeason] = useState<number>(() => parsedEp.season || 1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  // Synchronize active season when episodeId parameter changes
  useEffect(() => {
    if (episodeId) {
      const info = parseEpisodeInfo(episodeId);
      if (info.season && info.season !== activeSeason) {
        setActiveSeason(info.season);
      }
    }
  }, [episodeId]);

  // Load media details
  useEffect(() => {
    async function fetchMedia() {
      if (!media) {
        try {
          const res = await fetch(`/api/media/${id}`);
          if (res.ok) {
            const data = await res.json();
            setMedia(data);
          }
        } catch (err) {
          console.error("Error loading watch media:", err);
        }
      }
    }
    fetchMedia();
  }, [id, media]);

  // Load season episodes for series / anime / drama
  useEffect(() => {
    if (!media || media.type === MediaType.MOVIE) {
      setSeasonEpisodes([]);
      return;
    }

    let isMounted = true;
    async function loadEpisodes() {
      // 1. Check if media.seasons already has episodes for activeSeason
      const localSeason = media?.seasons?.find((s) => s.seasonNumber === activeSeason);
      if (localSeason?.episodes && localSeason.episodes.length > 0) {
        if (isMounted) {
          setSeasonEpisodes(localSeason.episodes);
          setEpisodesLoading(false);
        }
        return;
      }

      // 2. Fetch from API endpoint
      setEpisodesLoading(true);
      try {
        const res = await fetch(`/api/media/${id}/episodes?season=${activeSeason}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.episodes && data.episodes.length > 0) {
            setSeasonEpisodes(data.episodes);
            setEpisodesLoading(false);
            return;
          }
        }
        // 3. Fallback to mock data
        const fallback = MOCK_EPISODES[`${id}:${activeSeason}`] || [];
        if (isMounted) setSeasonEpisodes(fallback);
      } catch {
        const fallback = MOCK_EPISODES[`${id}:${activeSeason}`] || [];
        if (isMounted) setSeasonEpisodes(fallback);
      } finally {
        if (isMounted) setEpisodesLoading(false);
      }
    }

    loadEpisodes();
    return () => {
      isMounted = false;
    };
  }, [id, media, activeSeason]);

  // Resume position: URL parameter ?t=... takes precedence, then saved progress
  const savedProgress = getProgress(id, episodeId);
  const startAt =
    parsedTime !== undefined && !isNaN(parsedTime) && parsedTime >= 0
      ? parsedTime
      : savedProgress?.position || 0;

  // Auto-redirect to first episode or saved episode if watching a series without ?episode=
  useEffect(() => {
    if (!media || media.type === MediaType.MOVIE || episodeId) return;

    const currentServer = preferredProviderRef.current;
    const serverQuery = currentServer ? `&server=${encodeURIComponent(currentServer)}` : "";

    if (savedProgress?.episodeId) {
      router.replace(
        `/watch/${id}?episode=${encodeURIComponent(savedProgress.episodeId)}${serverQuery}&t=${Math.floor(savedProgress.position || 0)}`
      );
      return;
    }

    if (seasonEpisodes.length > 0) {
      router.replace(
        `/watch/${id}?episode=${encodeURIComponent(seasonEpisodes[0].id)}${serverQuery}&t=0`
      );
    }
  }, [media, episodeId, savedProgress, seasonEpisodes, id, router]);

  // Find active episode object
  let activeEpisode: Episode | undefined = seasonEpisodes.find(
    (e) => e.id === episodeId || (e.seasonNumber === parsedEp.season && e.episodeNumber === parsedEp.episode)
  );

  if (!activeEpisode && media?.seasons) {
    for (const season of media.seasons) {
      const ep = season.episodes?.find(
        (e) => e.id === episodeId || (e.seasonNumber === parsedEp.season && e.episodeNumber === parsedEp.episode)
      );
      if (ep) {
        activeEpisode = ep;
        break;
      }
    }
  }

  // Compute Next Episode
  const currentIndex = seasonEpisodes.findIndex(
    (e) => e.id === episodeId || (e.seasonNumber === parsedEp.season && e.episodeNumber === parsedEp.episode)
  );

  let nextEpisode: Episode | undefined;
  let hasNextEpisode = false;
  let nextEpisodeLabel = "";

  if (currentIndex !== -1 && currentIndex < seasonEpisodes.length - 1) {
    nextEpisode = seasonEpisodes[currentIndex + 1];
    hasNextEpisode = true;
    nextEpisodeLabel = `S${nextEpisode.seasonNumber} E${nextEpisode.episodeNumber}: ${nextEpisode.title}`;
  } else if (media?.seasons && (currentIndex === seasonEpisodes.length - 1 || (currentIndex === -1 && seasonEpisodes.length > 0))) {
    const nextSeason = media.seasons.find((s) => s.seasonNumber === (parsedEp.season || 1) + 1);
    if (nextSeason) {
      hasNextEpisode = true;
      nextEpisodeLabel = `Season ${nextSeason.seasonNumber} Episode 1`;
    }
  }

  // Episode metadata for progress recording
  const epMeta = episodeId
    ? {
        seasonNumber: activeEpisode?.seasonNumber || parsedEp.season,
        episodeNumber: activeEpisode?.episodeNumber || parsedEp.episode,
        episodeTitle: activeEpisode?.title || `Episode ${parsedEp.episode}`,
      }
    : {};

  // Handlers for in-player episode switching with server preservation
  const handleNextEpisode = () => {
    const currentServer = currentStream?.provider || preferredProviderRef.current;
    const serverQuery = currentServer ? `&server=${encodeURIComponent(currentServer)}` : "";

    if (nextEpisode) {
      router.replace(`/watch/${id}?episode=${encodeURIComponent(nextEpisode.id)}${serverQuery}&t=0`);
    } else if (media?.seasons) {
      const nextSeason = media.seasons.find((s) => s.seasonNumber === (parsedEp.season || 1) + 1);
      if (nextSeason) {
        const nextEpId = nextSeason.episodes?.[0]?.id || `${id}-s${nextSeason.seasonNumber}e1`;
        setActiveSeason(nextSeason.seasonNumber);
        router.replace(`/watch/${id}?episode=${encodeURIComponent(nextEpId)}${serverQuery}&t=0`);
      }
    }
  };

  const handleSelectEpisode = (ep: Episode) => {
    const currentServer = currentStream?.provider || preferredProviderRef.current;
    const serverQuery = currentServer ? `&server=${encodeURIComponent(currentServer)}` : "";
    router.replace(`/watch/${id}?episode=${encodeURIComponent(ep.id)}${serverQuery}&t=0`);
  };

  const handleSelectSeason = (seasonNum: number) => {
    setActiveSeason(seasonNum);
  };

  // User manually selects a server / stream from the source menu
  const handleSelectStream = (stream: Stream) => {
    setPreferredProvider(stream.provider);
    preferredProviderRef.current = stream.provider;
    setCurrentStream(stream);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`revara_preferred_provider_${id}`, stream.provider);
      } catch {}
    }
  };

  // Load streams whenever episodeId changes, keeping user's chosen server fixed
  useEffect(() => {
    async function loadStreams() {
      const results = await Promise.allSettled([
        debridProvider.getStreams(id, episodeId, media?.externalIds?.imdbId, debridApiKey),
        vidyProvider.getStreams(id, episodeId),
        vidRiftProvider.getStreams(id, episodeId),
        atlanticProvider.getStreams(id, episodeId),
        videasyProvider.getStreams(id, episodeId),
        vidlinkProvider.getStreams(id, episodeId),
        vidkingProvider.getStreams(id, episodeId),
        cineProProvider.getStreams(id, episodeId),
        autoEmbedProvider.getStreams(id, episodeId),
      ]);

      const streams: Stream[] = [];
      results.forEach((res) => {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          streams.push(...res.value);
        }
      });

      setAvailableStreams(streams);

      // Check if user has a locked / preferred provider for this series
      const target =
        preferredProviderRef.current ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem(`revara_preferred_provider_${id}`)
          : null);

      let matchedStream: Stream | undefined;
      if (target) {
        matchedStream = streams.find(
          (s) => s.provider.toLowerCase() === target.toLowerCase()
        );
      }

      // If matched, keep playing on that same server!
      // Otherwise fallback to first available stream
      const chosenStream = matchedStream || streams[0] || null;
      setCurrentStream(chosenStream);

      // If user hasn't explicitly picked a server yet, initialize it to the playing stream
      // so subsequent "Next Episode" clicks stay on this exact same server
      if (chosenStream && !target) {
        preferredProviderRef.current = chosenStream.provider;
        setPreferredProvider(chosenStream.provider);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(`revara_preferred_provider_${id}`, chosenStream.provider);
          } catch {}
        }
      }
    }

    loadStreams();
  }, [id, episodeId, media, debridApiKey]);

  // 1. Immediately record initial progress when media is loaded
  useEffect(() => {
    if (!media) return;
    const initialPos = startAt > 0 ? startAt : (savedProgress?.position || 15);
    const totalDur = (media.runtime || 120) * 60;
    const initialPct = savedProgress?.percentage || Math.max(Math.round((initialPos / totalDur) * 100), 5);
    recordProgress(media, {
      mediaId: id,
      episodeId,
      ...epMeta,
      position: initialPos,
      duration: totalDur,
      percentage: Math.max(initialPct, 5),
      lastWatched: new Date().toISOString(),
      completed: false,
    });
  }, [media, id, episodeId, startAt]);

  // 2. Continuous time tracker for iframe/video sessions
  useEffect(() => {
    if (!media) return;
    const interval = setInterval(() => {
      const current = getProgress(id, episodeId);
      const newPos = (current?.position || startAt || 15) + 5;
      const totalDur = (media.runtime || 120) * 60;
      const newPct = Math.min(Math.round((newPos / totalDur) * 100), 90);

      recordProgress(media, {
        mediaId: id,
        episodeId,
        ...epMeta,
        position: newPos,
        duration: totalDur,
        percentage: Math.max(newPct, 5),
        lastWatched: new Date().toISOString(),
        completed: false,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [media, id, episodeId, startAt]);

  const handleTimeUpdate = (currentTime: number, duration: number, progressPct?: number) => {
    if (duration <= 0 || !media) return;
    const percentage = progressPct !== undefined ? progressPct : Math.round((currentTime / duration) * 100);
    const progressData = {
      mediaId: id,
      episodeId,
      ...epMeta,
      position: Math.floor(currentTime),
      duration: Math.floor(duration),
      percentage,
      lastWatched: new Date().toISOString(),
      completed: percentage >= 90,
    };
    recordProgress(media, progressData);
  };

  // Build player subtitle
  let subtitle = media?.genres.map((g) => g.name).join(", ");
  if (episodeId && media?.type !== MediaType.MOVIE) {
    const sNum = activeEpisode?.seasonNumber || parsedEp.season;
    const eNum = activeEpisode?.episodeNumber || parsedEp.episode;
    const epTitle = activeEpisode?.title ? ` - ${activeEpisode.title}` : "";
    subtitle = `Season ${sNum} Episode ${eNum}${epTitle}`;
  }

  return (
    <VideoPlayer
      stream={currentStream}
      availableStreams={availableStreams}
      onSelectStream={handleSelectStream}
      title={media?.title ?? "Playing Media"}
      subtitle={subtitle}
      startAt={startAt}
      onTimeUpdate={handleTimeUpdate}
      onBack={() => router.back()}
      autoPlay
      episodes={media?.type !== MediaType.MOVIE ? seasonEpisodes : []}
      currentEpisodeId={episodeId}
      currentSeasonNumber={parsedEp.season}
      currentEpisodeNumber={parsedEp.episode}
      onSelectEpisode={handleSelectEpisode}
      onNextEpisode={handleNextEpisode}
      hasNextEpisode={hasNextEpisode}
      nextEpisodeLabel={nextEpisodeLabel}
      seasons={media?.type !== MediaType.MOVIE ? media?.seasons : undefined}
      activeSeason={activeSeason}
      onSelectSeason={handleSelectSeason}
      episodesLoading={episodesLoading}
    />
  );
}
