"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { getMediaById, MOCK_STREAMS } from "@/providers/mock/data";
import { videasyProvider } from "@/providers/videasy/provider";
import { vidkingProvider } from "@/providers/vidking/provider";
import { vidlinkProvider } from "@/providers/vidlink/provider";
import { vidsrcProvider } from "@/providers/vidsrc/provider";
import { autoEmbedProvider } from "@/providers/autoembed/provider";
import { superEmbedProvider } from "@/providers/superembed/provider";
import { cineProProvider } from "@/providers/cinepro/provider";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import type { Stream, MediaItem } from "@/providers/core/types";

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const episodeId = searchParams.get("episode") || undefined;

  const [media, setMedia] = useState<MediaItem | null>(() => getMediaById(id) || null);
  const { getProgress, recordProgress } = useWatchHistory();

  const [availableStreams, setAvailableStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);

  // Resume position
  const savedProgress = getProgress(id, episodeId);
  const startAt = savedProgress?.position || 0;

  // Load media details if not mock
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

  useEffect(() => {
    async function loadStreams() {
      const results = await Promise.allSettled([
        videasyProvider.getStreams(id, episodeId),
        vidlinkProvider.getStreams(id, episodeId),
        vidkingProvider.getStreams(id, episodeId),
        cineProProvider.getStreams(id, episodeId),
        vidsrcProvider.getStreams(id, episodeId),
        autoEmbedProvider.getStreams(id, episodeId),
        superEmbedProvider.getStreams(id, episodeId),
      ]);

      const streams: Stream[] = [];
      results.forEach((res) => {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          streams.push(...res.value);
        }
      });

      // Add HLS mock stream as fallback
      streams.push(...MOCK_STREAMS);

      setAvailableStreams(streams);
      setCurrentStream(streams[0] || null);
    }

    loadStreams();
  }, [id, episodeId]);

  // 1. Immediately record initial progress when media is loaded
  useEffect(() => {
    if (!media) return;
    const initialPos = savedProgress?.position || 15;
    const initialPct = savedProgress?.percentage || 5;
    recordProgress(media, {
      mediaId: id,
      episodeId,
      position: initialPos,
      duration: (media.runtime || 120) * 60,
      percentage: Math.max(initialPct, 5),
      lastWatched: new Date().toISOString(),
      completed: false,
    });
  }, [media, id, episodeId]);

  // 2. Continuous time tracker for iframe/video sessions
  useEffect(() => {
    if (!media) return;
    const interval = setInterval(() => {
      const current = getProgress(id, episodeId);
      const newPos = (current?.position || 15) + 5;
      const totalDur = (media.runtime || 120) * 60;
      const newPct = Math.min(Math.round((newPos / totalDur) * 100), 90);

      recordProgress(media, {
        mediaId: id,
        episodeId,
        position: newPos,
        duration: totalDur,
        percentage: Math.max(newPct, 5),
        lastWatched: new Date().toISOString(),
        completed: false,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [media, id, episodeId]);

  const handleTimeUpdate = (currentTime: number, duration: number, progressPct?: number) => {
    if (duration <= 0 || !media) return;
    const percentage = progressPct !== undefined ? progressPct : Math.round((currentTime / duration) * 100);
    const progressData = {
      mediaId: id,
      episodeId,
      position: Math.floor(currentTime),
      duration: Math.floor(duration),
      percentage,
      lastWatched: new Date().toISOString(),
      completed: percentage >= 90,
    };
    recordProgress(media, progressData);
  };

  // Build subtitle (e.g. Season 1 Episode 2 - Title)
  let subtitle = media?.genres.map((g) => g.name).join(", ");
  if (episodeId && media?.seasons) {
    for (const season of media.seasons) {
      const ep = season.episodes?.find((e) => e.id === episodeId);
      if (ep) {
        subtitle = `S${ep.seasonNumber} E${ep.episodeNumber}: ${ep.title}`;
        break;
      }
    }
  }

  return (
    <VideoPlayer
      stream={currentStream}
      availableStreams={availableStreams}
      onSelectStream={(s) => setCurrentStream(s)}
      title={media?.title ?? "Playing Media"}
      subtitle={subtitle}
      startAt={startAt}
      onTimeUpdate={handleTimeUpdate}
      onBack={() => router.back()}
      autoPlay
    />
  );
}
