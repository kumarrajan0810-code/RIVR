"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  PictureInPicture2, SkipForward, SkipBack,
  ArrowLeft, Settings, Subtitles, Loader2, ListVideo, X,
} from "lucide-react";
import { cn, formatRuntime } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import { StreamType, type Stream, type Episode, type Season } from "@/providers/core/types";

interface VideoPlayerProps {
  stream: Stream | null;
  availableStreams?: Stream[];
  onSelectStream?: (stream: Stream) => void;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number, progressPct?: number) => void;
  startAt?: number;
  autoPlay?: boolean;
  // Episode navigation props
  episodes?: Episode[];
  currentEpisodeId?: string;
  currentSeasonNumber?: number;
  currentEpisodeNumber?: number;
  onSelectEpisode?: (episode: Episode) => void;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  nextEpisodeLabel?: string;
  seasons?: Season[];
  activeSeason?: number;
  onSelectSeason?: (seasonNumber: number) => void;
  episodesLoading?: boolean;
}

export function VideoPlayer({
  stream,
  availableStreams = [],
  onSelectStream,
  title,
  subtitle,
  onBack,
  onTimeUpdate,
  startAt = 0,
  autoPlay = true,
  episodes = [],
  currentEpisodeId,
  currentSeasonNumber,
  currentEpisodeNumber,
  onSelectEpisode,
  onNextEpisode,
  hasNextEpisode = false,
  nextEpisodeLabel,
  seasons = [],
  activeSeason,
  onSelectSeason,
  episodesLoading = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const {
    isPlaying, currentTime, duration, volume, isMuted,
    isFullscreen, isBuffering, controlsVisible,
    setPlaying, setCurrentTime, setDuration, setVolume,
    toggleMute, setFullscreen, setBuffering, setControlsVisible,
  } = usePlayerStore();

  const [showVolume, setShowVolume] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [showResumeBanner, setShowResumeBanner] = useState(Boolean(startAt && startAt > 0));

  useEffect(() => {
    if (startAt && startAt > 0) {
      setShowResumeBanner(true);
      const timer = setTimeout(() => setShowResumeBanner(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [startAt]);

  const isExternalEmbed = stream?.type === StreamType.EXTERNAL || Boolean(stream && !stream.isHls);

  // ---- PostMessage listener for Videasy & Vidking iframe progress tracking ----
  useEffect(() => {
    if (!isExternalEmbed) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && typeof data === "object") {
          // 1. Vidking event: { type: "PLAYER_EVENT", data: { event: "timeupdate", currentTime: 120, duration: 7200, progress: 1.6 } }
          if (data.type === "PLAYER_EVENT" && data.data) {
            const { currentTime: cur, duration: dur, progress: prog } = data.data;
            if (typeof cur === "number" && typeof dur === "number" && dur > 0) {
              setCurrentTime(cur);
              setDuration(dur);
              onTimeUpdate?.(cur, dur, prog);
            }
          }
          // 2. Videasy event: { timestamp: 120, duration: 7200, progress: 1.6 }
          else if (data.timestamp !== undefined && data.duration !== undefined && data.duration > 0) {
            setCurrentTime(data.timestamp);
            setDuration(data.duration);
            onTimeUpdate?.(data.timestamp, data.duration, data.progress);
          }
        }
      } catch {
        // Ignore non-JSON messages from browser extensions
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isExternalEmbed, setCurrentTime, setDuration, onTimeUpdate]);

  // ---- HLS setup for direct video ----
  useEffect(() => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    if (!video || !stream) return;

    let hls: import("hls.js").default | null = null;

    const initPlayer = async () => {
      if (stream.isHls) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream.url;
        } else {
          const Hls = (await import("hls.js")).default;
          if (Hls.isSupported()) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 60,
              maxBufferLength: 60,
              maxMaxBufferLength: 120,
              maxBufferSize: 60 * 1024 * 1024,
              maxBufferHole: 0.5,
              highBufferWatchdogPeriod: 2,
              fragLoadingMaxRetry: 5,
              manifestLoadingMaxRetry: 5,
              levelLoadingMaxRetry: 5,
              fragLoadingRetryDelay: 500,
              manifestLoadingRetryDelay: 500,
              levelLoadingRetryDelay: 500,
              progressive: true,
            });
            hls.loadSource(stream.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls?.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls?.recoverMediaError();
                    break;
                  default:
                    hls?.destroy();
                    break;
                }
              }
            });
          }
        }
      } else {
        video.src = stream.url;
      }

      if (startAt > 0) {
        video.currentTime = startAt;
      }

      if (autoPlay) {
        video.play().catch(() => {});
      }
    };

    initPlayer();

    return () => {
      hls?.destroy();
    };
  }, [stream, startAt, autoPlay, isExternalEmbed]);

  // ---- Video event handlers ----
  useEffect(() => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };
    const onDur = () => setDuration(video.duration);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDur);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, [setPlaying, setCurrentTime, setDuration, setBuffering, onTimeUpdate, isExternalEmbed]);

  // ---- Controls visibility timer ----
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3500);
  }, [isPlaying, setControlsVisible]);

  // ---- Playback controls ----
  const togglePlay = useCallback(() => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isExternalEmbed]);

  const seek = useCallback((seconds: number) => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }, [isExternalEmbed]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    video.muted = newVolume === 0;
    setVolume(newVolume);
  }, [setVolume, isExternalEmbed]);

  const handleToggleMute = useCallback(() => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    toggleMute();
  }, [toggleMute, isExternalEmbed]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current || document.documentElement;
    if (!container) return;

    try {
      const doc = document as any;
      const isCurrentlyFS = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (isCurrentlyFS) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
        setFullscreen(false);
      } else {
        const el = container as any;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
        setFullscreen(true);
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  }, [setFullscreen]);

  // Sync fullscreen state with browser changes
  useEffect(() => {
    const handleFSChange = () => {
      const isFS = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setFullscreen(isFS);
    };

    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("webkitfullscreenchange", handleFSChange);
    document.addEventListener("mozfullscreenchange", handleFSChange);
    document.addEventListener("MSFullscreenChange", handleFSChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("webkitfullscreenchange", handleFSChange);
      document.removeEventListener("mozfullscreenchange", handleFSChange);
      document.removeEventListener("MSFullscreenChange", handleFSChange);
    };
  }, [setFullscreen]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isExternalEmbed) return;
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
  }, [isExternalEmbed]);

  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isExternalEmbed) return;
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setHoverTime(pct * video.duration);
    setHoverX(e.clientX - rect.left);
  }, [isExternalEmbed]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ---- Keyboard shortcuts ----
  useKeyboard([
    { key: " ", handler: togglePlay, description: "Play/Pause" },
    { key: "k", handler: togglePlay, description: "Play/Pause" },
    { key: "f", handler: toggleFullscreen, description: "Fullscreen" },
    { key: "m", handler: handleToggleMute, description: "Mute" },
    { key: "ArrowLeft", handler: () => seek(-10), description: "Rewind 10s" },
    { key: "ArrowRight", handler: () => seek(10), description: "Forward 10s" },
    { key: "j", handler: () => seek(-10), description: "Rewind 10s" },
    { key: "l", handler: () => seek(10), description: "Forward 10s" },
    { key: "ArrowUp", handler: () => handleVolumeChange(Math.min(1, volume + 0.1)), description: "Volume Up" },
    { key: "ArrowDown", handler: () => handleVolumeChange(Math.max(0, volume - 0.1)), description: "Volume Down" },
    { key: "n", shift: true, handler: () => { if (hasNextEpisode && onNextEpisode) onNextEpisode(); }, description: "Next Episode" },
    { key: "e", handler: () => { if (episodes.length > 0) setShowEpisodesDrawer((v) => !v); }, description: "Toggle Episodes Drawer" },
    { key: "Escape", handler: () => setShowEpisodesDrawer(false), description: "Close Drawer" },
  ]);

  // Episodes drawer overlay node (Netflix-style clean white aesthetic)
  const episodesDrawerNode = showEpisodesDrawer && episodes.length > 0 && (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setShowEpisodesDrawer(false)}
    >
      <div
        className="relative w-full max-w-md md:max-w-lg h-full bg-[#121212] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#161616] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <ListVideo className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white leading-tight">Episodes</h3>
              <p className="text-[11px] text-white/50">{episodes.length} episodes in this season</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowEpisodesDrawer(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Season Selector Tabs */}
        {seasons && seasons.length > 1 && (
          <div className="px-4 py-2.5 border-b border-white/10 bg-[#141414] overflow-x-auto flex items-center gap-2 flex-shrink-0 scrollbar-none">
            {seasons.map((s) => {
              const isSelected = activeSeason === s.seasonNumber;
              return (
                <button
                  key={s.id || s.seasonNumber}
                  type="button"
                  onClick={() => onSelectSeason?.(s.seasonNumber)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer",
                    isSelected
                      ? "bg-white text-black font-bold shadow-md shadow-white/10"
                      : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
                  )}
                >
                  {s.title || `Season ${s.seasonNumber}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Up Next Quick Card */}
        {hasNextEpisode && onNextEpisode && (
          <div className="p-4 border-b border-white/10 bg-white/[0.04] flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Up Next</span>
                <p className="text-xs text-white font-medium truncate mt-0.5">
                  {nextEpisodeLabel || "Next Episode"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onNextEpisode();
                  setShowEpisodesDrawer(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Play Next</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Episodes List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {episodesLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center text-white/50">
              <Loader2 className="w-7 h-7 text-white/80 animate-spin mb-3" />
              <p className="text-xs">Loading season episodes...</p>
            </div>
          ) : episodes.length === 0 ? (
            <div className="py-20 text-center text-white/50">
              <p className="text-xs">No episodes found for this season.</p>
            </div>
          ) : (
            episodes.map((ep) => {
              const isPlaying =
                ep.id === currentEpisodeId ||
                (currentSeasonNumber !== undefined &&
                  currentEpisodeNumber !== undefined &&
                  ep.seasonNumber === currentSeasonNumber &&
                  ep.episodeNumber === currentEpisodeNumber);
              const thumb = ep.thumbnail || ep.still;

              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => {
                    onSelectEpisode?.(ep);
                    setShowEpisodesDrawer(false);
                  }}
                  className={cn(
                    "w-full text-left group p-2 rounded-xl transition-all cursor-pointer flex gap-3 items-center border",
                    isPlaying
                      ? "bg-white/10 border-white/30 text-white shadow-sm"
                      : "hover:bg-white/[0.06] border-transparent text-white/75 hover:text-white"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-[#222222] flex-shrink-0 border border-white/5">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={ep.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 group-hover:bg-black/55 transition-colors">
                      {isPlaying ? (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-black shadow-md">
                          <Play className="w-3 h-3 fill-black ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-black/70 group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-colors">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-white/90">
                        E{ep.episodeNumber}
                      </span>
                      {isPlaying && (
                        <span className="text-[9px] font-extrabold bg-white text-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                          Now Playing
                        </span>
                      )}
                      {ep.runtime && (
                        <span className="text-[11px] text-white/40 ml-auto flex-shrink-0">
                          {formatRuntime(ep.runtime)}
                        </span>
                      )}
                    </div>
                    <h4
                      className={cn(
                        "text-xs sm:text-sm font-medium truncate",
                        isPlaying ? "text-white font-bold" : "text-white/90 group-hover:text-white transition-colors"
                      )}
                    >
                      {ep.title}
                    </h4>
                    {ep.overview && (
                      <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  if (!stream) {
    return (
      <div className="w-full h-screen bg-player-bg flex items-center justify-center text-foreground">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Play className="w-8 h-8" />
          </div>
          <p className="text-muted-foreground mb-4">No playable source is currently available.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-sm font-medium transition-colors cursor-pointer"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- External Embed Mode (Videasy & Vidking Iframe providers) ---
  if (isExternalEmbed) {
    return (
      <div ref={containerRef} className="relative w-full h-screen bg-player-bg flex flex-col overflow-hidden">
        {/* Floating Top Nav Bar */}
        <div className="player-top-gradient absolute top-0 left-0 right-0 z-30 px-4 md:px-6 pt-3 pb-8 pointer-events-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 mr-2">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md text-white transition-all cursor-pointer shadow-lg active:scale-95 flex-shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              {title && <h2 className="text-sm md:text-base font-semibold text-white drop-shadow truncate">{title}</h2>}
              {subtitle && <p className="text-xs text-white/70 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* In-player Episode Navigation Buttons */}
            {episodes.length > 0 && (
              <>
                {hasNextEpisode && onNextEpisode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNextEpisode();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
                    title={nextEpisodeLabel ? `Next: ${nextEpisodeLabel} (Shift+N)` : "Next Episode (Shift+N)"}
                  >
                    <SkipForward className="w-3.5 h-3.5 fill-black" />
                    <span className="hidden sm:inline">Next Ep</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEpisodesDrawer((prev) => !prev);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border backdrop-blur-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-lg",
                    showEpisodesDrawer
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black/60 hover:bg-black/90 border-white/15 text-white"
                  )}
                  title="Browse Episodes (E)"
                >
                  <ListVideo className={cn("w-3.5 h-3.5", showEpisodesDrawer ? "text-black" : "text-white")} />
                  <span>Episodes</span>
                </button>
              </>
            )}

            {availableStreams.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSourceMenu(!showSourceMenu)}
                  className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Source: {stream.provider.toUpperCase()}</span>
                </button>

                {showSourceMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#181818] border border-[#2e2e2e] rounded-xl shadow-2xl p-1 z-40">
                    <p className="text-[11px] font-semibold text-muted-foreground px-2 py-1">Available Sources</p>
                    {availableStreams.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectStream?.(s);
                          setShowSourceMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between",
                          s.id === stream.id ? "bg-white text-black font-bold" : "text-[#B3B3B2] hover:text-white hover:bg-white/10"
                        )}
                      >
                        <span className="truncate">{s.title}</span>
                        <span className="text-[10px] opacity-75 ml-2 uppercase font-semibold">{s.provider}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dedicated Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md text-white transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-white" />
              ) : (
                <Maximize className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Iframe player with full fullscreen permissions */}
        <div className="w-full h-full flex-1 relative bg-black">
          {showResumeBanner && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#181818]/95 border border-white/20 text-white px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>
                Resumed from {Math.floor(startAt / 60)}:{(Math.floor(startAt % 60)).toString().padStart(2, "0")}
              </span>
            </div>
          )}
          <iframe
            key={stream.url}
            src={stream.url}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
            title={title || "Video Player"}
          />
        </div>

        {/* Episodes Drawer */}
        {episodesDrawerNode}
      </div>
    );
  }

  // --- Direct HLS / Native Video Mode ---
  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-player-bg select-none"
      onMouseMove={showControls}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
      />

      {/* Buffering */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Resume Indicator Banner */}
      {showResumeBanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#181818]/95 border border-white/20 text-white px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-medium pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Resumed from {Math.floor(startAt / 60)}:{(Math.floor(startAt % 60)).toString().padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300 pointer-events-none",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="player-top-gradient absolute top-0 left-0 right-0 px-4 md:px-6 pt-4 pb-12 pointer-events-auto">
          <div className="flex items-center gap-3">
            <button onClick={(e) => { e.stopPropagation(); onBack?.(); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              {title && <h2 className="text-base md:text-lg font-semibold text-white truncate">{title}</h2>}
              {subtitle && <p className="text-xs text-white/70 truncate">{subtitle}</p>}
            </div>

            {/* In-player Episode Navigation Buttons */}
            {episodes.length > 0 && (
              <>
                {hasNextEpisode && onNextEpisode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNextEpisode();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
                    title={nextEpisodeLabel ? `Next: ${nextEpisodeLabel} (Shift+N)` : "Next Episode (Shift+N)"}
                  >
                    <SkipForward className="w-3.5 h-3.5 fill-black" />
                    <span className="hidden sm:inline">Next Ep</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEpisodesDrawer((prev) => !prev);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border backdrop-blur-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-lg",
                    showEpisodesDrawer
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black/60 hover:bg-black/90 border-white/15 text-white"
                  )}
                  title="Browse Episodes (E)"
                >
                  <ListVideo className={cn("w-3.5 h-3.5", showEpisodesDrawer ? "text-black" : "text-white")} />
                  <span>Episodes</span>
                </button>
              </>
            )}

            {availableStreams.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowSourceMenu(!showSourceMenu)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Source: {stream.provider.toUpperCase()}</span>
                </button>

                {showSourceMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#181818] border border-[#2e2e2e] rounded-xl shadow-2xl p-1 z-40">
                    <p className="text-[11px] font-semibold text-muted-foreground px-2 py-1">Available Sources</p>
                    {availableStreams.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectStream?.(s);
                          setShowSourceMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between",
                          s.id === stream.id ? "bg-white text-black font-bold" : "text-[#B3B3B2] hover:text-white hover:bg-white/10"
                        )}
                      >
                        <span className="truncate">{s.title}</span>
                        <span className="text-[10px] opacity-75 ml-2 uppercase font-semibold">{s.provider}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="player-bottom-gradient absolute bottom-0 left-0 right-0 px-4 md:px-6 pt-12 pb-4 pointer-events-auto space-y-2">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-1.5 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all group/bar"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Progress fill (clean Netflix white) */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-white rounded-full shadow-sm"
              style={{ width: `${progressPct}%` }}
            />

            {/* Scrubber head */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `${progressPct}%` }}
            />

            {/* Hover tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 rounded bg-[#1e1e1e] border border-white/10 text-white text-xs font-mono shadow-lg pointer-events-none"
                style={{ left: `${hoverX}px` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between text-white">
            {/* Left: Play/Pause, Skip, Volume, Time */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={isPlaying ? "Pause (k)" : "Play (k)"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => seek(-10)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Rewind 10s (j)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => seek(10)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Forward 10s (l)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button
                  onClick={handleToggleMute}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title={isMuted ? "Unmute (m)" : "Mute (m)"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                {showVolume && (
                  <div className="w-20 pl-1 pr-2 py-2 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>
                )}
              </div>

              {/* Time display */}
              <div className="text-xs font-mono text-white/80 select-none">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/40">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Subtitles, Settings, Fullscreen */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Drawer */}
      {episodesDrawerNode}
    </div>
  );
}
