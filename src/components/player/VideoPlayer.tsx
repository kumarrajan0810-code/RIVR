"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  PictureInPicture2, SkipForward, SkipBack,
  ArrowLeft, Settings, Subtitles, Loader2,
} from "lucide-react";
import { cn, formatRuntime } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import { StreamType, type Stream } from "@/providers/core/types";

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
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const isExternalEmbed = stream?.type === StreamType.EXTERNAL || (!stream?.isHls && (stream?.url.includes("player.videasy.net") || stream?.url.includes("vidking.net")));

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
              backBufferLength: 90,
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
  ]);

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
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 backdrop-blur-md text-white transition-all cursor-pointer shadow-lg active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1 min-w-0">
              {title && <h2 className="text-sm md:text-base font-semibold text-white drop-shadow truncate">{title}</h2>}
              {subtitle && <p className="text-xs text-white/70 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                          s.id === stream.id ? "bg-[#00DF81] text-black font-bold" : "text-[#B3B3B2] hover:text-white hover:bg-[#262626]"
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
          <iframe
            src={stream.url}
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *"
            title={title || "Video Player"}
          />
        </div>
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
                          s.id === stream.id ? "bg-[#00DF81] text-black font-bold" : "text-[#B3B3B2] hover:text-white hover:bg-[#262626]"
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
            {/* Progress fill */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-accent rounded-full"
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
                className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 rounded bg-surface-elevated text-foreground text-xs font-mono shadow-lg pointer-events-none"
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
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-accent"
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
    </div>
  );
}
