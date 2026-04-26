"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Tooltip,
  Fade,
  Paper,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  VolumeDown,
  Fullscreen,
  FullscreenExit,
  Settings,
  Subtitles,
  PictureInPicture,
  Replay10,
  Forward10,
} from "@mui/icons-material";

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export default function VideoPlayer({
  url,
  isFinished,
  onProgress90,
}: {
  url: string;
  isFinished?: boolean;
  onProgress90?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasTriggered90, setHasTriggered90] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [showVolume, setShowVolume] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState<"main" | "speed" | null>(
    null,
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [centerIcon, setCenterIcon] = useState<"play" | "pause" | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    if (isPlaying && settingsAnchor === null) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying, settingsAnchor]);

  useEffect(() => {
    if (!hasTriggered90 && duration > 0 && currentTime >= duration * 0.9) {
      setHasTriggered90(true);
      console.log("Video reached 90% progress");
      console.log("isFinished:", isFinished);
      if (!isFinished) {
        console.log("Triggering onProgress90 callback...");
        onProgress90?.();
      }
    }
  }, [currentTime, duration, hasTriggered90, onProgress90, isFinished]);

  useEffect(() => {
    resetHideTimer();
  }, [isPlaying, settingsAnchor]);

  useEffect(() => {
    setHasTriggered90(false);
  }, [url]);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v || (e.target as HTMLElement).tagName === "INPUT") return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((p) => Math.min(1, +(p + 0.1).toFixed(2)));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((p) => Math.max(0, +(p - 0.1).toFixed(2)));
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const triggerCenter = (type: "play" | "pause") => {
    if (centerTimer.current) clearTimeout(centerTimer.current);
    setCenterIcon(type);
    centerTimer.current = setTimeout(() => setCenterIcon(null), 600);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      triggerCenter("play");
    } else {
      v.pause();
      triggerCenter("pause");
    }
  };

  const toggleMute = () => setIsMuted((p) => !p);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const togglePiP = () => {
    if (!document.pictureInPictureElement)
      videoRef.current?.requestPictureInPicture();
    else document.exitPictureInPicture();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (videoRef.current) videoRef.current.currentTime = pct * duration;
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pct * duration);
    setHoverX(e.clientX - rect.left);
  };

  const handleBufferUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.buffered.length) return;
    setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
  };

  const setSpeed = (s: number) => {
    setPlaybackSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSettingsAnchor(null);
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeOff : volume < 0.5 ? VolumeDown : VolumeUp;

  return (
    <Box
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (isPlaying && !settingsAnchor) {
          if (hideTimer.current) clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => setShowControls(false), 800);
        }
      }}
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: isFullscreen ? undefined : "16/9",
        height: isFullscreen ? "100vh" : undefined,
        background: "#000",
        borderRadius: isFullscreen ? 0 : "14px",
        overflow: "hidden",
        cursor: showControls ? "default" : "none",
        userSelect: "none",
      }}
    >
      <video
        ref={videoRef}
        src={url || "https://d2y2a413h0rb2v.cloudfront.net/test.mp4"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onProgress={handleBufferUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <Fade in={!!centerIcon} timeout={{ enter: 0, exit: 500 }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            bgcolor: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            width: 72,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {centerIcon === "play" ? (
            <PlayArrow sx={{ color: "white", fontSize: 40 }} />
          ) : (
            <Pause sx={{ color: "white", fontSize: 40 }} />
          )}
        </Box>
      </Fade>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          pointerEvents: "none",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      <Fade in={showControls} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            px: 1.5,
            pb: 1.5,
            zIndex: 5,
          }}
        >
          {/* PROGRESS BAR */}
          <Box
            ref={progressRef}
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
            sx={{
              position: "relative",
              height: 18,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mb: 0.5,
              "& .track": { height: 4 },
              "&:hover .track": { height: 6 },
              "&:hover .thumb": { opacity: 1 },
            }}
          >
            {/* Track */}
            <Box
              className="track"
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.25)",
                overflow: "hidden",
                transition: "height 0.15s",
              }}
            >
              {/* Buffered */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  width: `${buffered}%`,
                  height: "100%",
                  bgcolor: "rgba(255,255,255,0.4)",
                }}
              />
              {/* Played */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  width: `${progressPct}%`,
                  height: "100%",
                  bgcolor: "#ffd700",
                }}
              />
            </Box>

            {/* Thumb */}
            <Box
              className="thumb"
              sx={{
                position: "absolute",
                left: `calc(${progressPct}% - 6px)`,
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#ffd700",
                opacity: 0,
                transition: "opacity 0.15s, left 0.05s",
                pointerEvents: "none",
                zIndex: 2,
                boxShadow: "0 0 4px rgba(0,0,0,0.6)",
              }}
            />

            {/* Hover tooltip */}
            {hoverTime !== null && progressRef.current && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 22,
                  left: Math.max(
                    20,
                    Math.min(hoverX - 22, progressRef.current.offsetWidth - 60),
                  ),
                  bgcolor: "rgba(20,20,20,0.95)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 700,
                  px: 1,
                  py: 0.3,
                  borderRadius: 1,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {formatTime(hoverTime)}
              </Box>
            )}
          </Box>

          {/* BUTTON ROW */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* LEFT */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Tua lại 10 giây" placement="top">
                <IconButton
                  size="small"
                  sx={iconBtnSx}
                  onClick={() => {
                    if (videoRef.current)
                      videoRef.current.currentTime = Math.max(
                        0,
                        videoRef.current.currentTime - 10,
                      );
                  }}
                >
                  <Replay10 sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={isPlaying ? "Tạm dừng (k)" : "Phát (k)"}
                placement="top"
              >
                <IconButton sx={iconBtnSx} onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause sx={{ fontSize: 28 }} />
                  ) : (
                    <PlayArrow sx={{ fontSize: 28 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Tua tới 10 giây" placement="top">
                <IconButton
                  size="small"
                  sx={iconBtnSx}
                  onClick={() => {
                    if (videoRef.current)
                      videoRef.current.currentTime = Math.min(
                        videoRef.current.duration,
                        videoRef.current.currentTime + 10,
                      );
                  }}
                >
                  <Forward10 sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>

              {/* Volume group */}
              <Box
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Tooltip
                  title={isMuted ? "Bật âm (m)" : "Tắt âm (m)"}
                  placement="top"
                >
                  <IconButton size="small" sx={iconBtnSx} onClick={toggleMute}>
                    <VolumeIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
                <Box
                  sx={{
                    width: showVolume ? 80 : 0,
                    overflow: "hidden",
                    transition: "width 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    pl: showVolume ? 0.5 : 0,
                  }}
                >
                  <Slider
                    size="small"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(_, v) => {
                      setVolume(v as number);
                      setIsMuted((v as number) === 0);
                    }}
                    sx={{
                      width: 72,
                      color: "white",
                      "& .MuiSlider-thumb": {
                        width: 12,
                        height: 12,
                        transition: "none",
                      },
                      "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.3)" },
                    }}
                  />
                </Box>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "white",
                  ml: 1,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  letterSpacing: 0.3,
                }}
              >
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Box>

            {/* RIGHT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                position: "relative",
              }}
            >
              <Tooltip title="Phụ đề" placement="top">
                <IconButton size="small" sx={iconBtnSx}>
                  <Subtitles sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Settings */}
              <Box sx={{ position: "relative" }}>
                <Tooltip title="Cài đặt" placement="top">
                  <IconButton
                    size="small"
                    sx={{
                      ...iconBtnSx,
                      transform: settingsAnchor
                        ? "rotate(30deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                    onClick={() =>
                      setSettingsAnchor((p) => (p ? null : "main"))
                    }
                  >
                    <Settings sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>

                {/* Settings Panel */}
                <Fade in={!!settingsAnchor}>
                  <Paper
                    elevation={8}
                    sx={{
                      position: "absolute",
                      bottom: 44,
                      right: 0,
                      minWidth: 210,
                      bgcolor: "rgba(28,28,28,0.97)",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {settingsAnchor === "main" && (
                      <>
                        <Typography
                          sx={{
                            px: 2,
                            py: 1.2,
                            color: "rgba(255,255,255,0.7)",
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                          }}
                        >
                          CÀI ĐẶT
                        </Typography>
                        <Divider
                          sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                        />
                        <MenuItem
                          onClick={() => setSettingsAnchor("speed")}
                          sx={menuItemSx}
                        >
                          <Typography sx={{ fontSize: 14, color: "white" }}>
                            Tốc độ phát
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            {playbackSpeed === 1
                              ? "Bình thường"
                              : `${playbackSpeed}x`}{" "}
                            ›
                          </Typography>
                        </MenuItem>
                        <MenuItem sx={menuItemSx}>
                          <Typography sx={{ fontSize: 14, color: "white" }}>
                            Chất lượng
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            Tự động ›
                          </Typography>
                        </MenuItem>
                      </>
                    )}

                    {settingsAnchor === "speed" && (
                      <>
                        <MenuItem
                          onClick={() => setSettingsAnchor("main")}
                          sx={{
                            ...menuItemSx,
                            justifyContent: "flex-start",
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.6)",
                            }}
                          >
                            ‹
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            Tốc độ phát
                          </Typography>
                        </MenuItem>
                        <Divider
                          sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                        />
                        {SPEEDS.map((s) => (
                          <MenuItem
                            key={s}
                            onClick={() => setSpeed(s)}
                            sx={{ ...menuItemSx, justifyContent: "center" }}
                          >
                            <Typography
                              sx={{
                                fontSize: 14,
                                color:
                                  playbackSpeed === s ? "#ff0000" : "white",
                                fontWeight: playbackSpeed === s ? 700 : 400,
                              }}
                            >
                              {s === 1 ? "Bình thường" : `${s}x`}
                              {playbackSpeed === s && " ✓"}
                            </Typography>
                          </MenuItem>
                        ))}
                      </>
                    )}
                  </Paper>
                </Fade>
              </Box>

              <Tooltip title="Cửa sổ nhỏ" placement="top">
                <IconButton size="small" sx={iconBtnSx} onClick={togglePiP}>
                  <PictureInPicture sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={
                  isFullscreen ? "Thoát toàn màn hình (f)" : "Toàn màn hình (f)"
                }
                placement="top"
              >
                <IconButton
                  size="small"
                  sx={iconBtnSx}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <FullscreenExit sx={{ fontSize: 22 }} />
                  ) : (
                    <Fullscreen sx={{ fontSize: 22 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}

const iconBtnSx = {
  color: "white",
  p: 0.75,
  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
  transition: "background 0.15s",
};

const menuItemSx = {
  display: "flex",
  justifyContent: "space-between",
  px: 2,
  py: 1,
  "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
  transition: "background 0.15s",
};
