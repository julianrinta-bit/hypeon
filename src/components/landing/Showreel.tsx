'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Showreel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isVolumeHover, setIsVolumeHover] = useState(false);

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    // Safari 13 fallback: addListener/removeListener
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      (mq as any).addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        (mq as any).removeListener(handler);
      }
    };
  }, []);

  // Auto-hide controls after 3 seconds of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
  }, [isPlaying, resetHideTimer]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('loadedmetadata', onDurationChange);
    video.addEventListener('progress', onProgress);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('loadedmetadata', onDurationChange);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!hasStarted) setHasStarted(true);
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [hasStarted]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
  }, []);

  const handleProgressDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    handleProgressClick(e);
  }, [isSeeking, handleProgressClick]);

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = volumeRef.current;
    if (!video || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.volume = pct;
    setVolume(pct);
    setIsMuted(pct === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    // Check if already fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    // Standard Fullscreen API (desktop browsers)
    if (el.requestFullscreen) {
      el.requestFullscreen();
    }
    // iOS Safari: only supports fullscreen on the video element itself
    else if ((video as any).webkitEnterFullscreen) {
      (video as any).webkitEnterFullscreen();
    }
    // Older webkit (iPad Safari, some mobile browsers)
    else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    }
  }, []);

  const seek = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle when the video container or its children are focused, or when no other input is focused
      const active = document.activeElement;
      const isInput = active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.tagName === 'SELECT';
      if (isInput) return;

      const container = containerRef.current;
      if (!container) return;

      // Check if focus is within the player or the player has been interacted with
      if (!container.contains(active) && active !== document.body) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          resetHideTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-5);
          resetHideTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(5);
          resetHideTimer();
          break;
        case 'ArrowUp':
          e.preventDefault();
          {
            const v = videoRef.current;
            if (v) {
              const newVol = Math.min(1, v.volume + 0.1);
              v.volume = newVol;
              setVolume(newVol);
              if (newVol > 0) { v.muted = false; setIsMuted(false); }
            }
          }
          resetHideTimer();
          break;
        case 'ArrowDown':
          e.preventDefault();
          {
            const v = videoRef.current;
            if (v) {
              const newVol = Math.max(0, v.volume - 0.1);
              v.volume = newVol;
              setVolume(newVol);
            }
          }
          resetHideTimer();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          resetHideTimer();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, seek, toggleFullscreen, toggleMute, resetHideTimer]);

  // Mouse up anywhere ends seeking
  useEffect(() => {
    const handler = () => setIsSeeking(false);
    window.addEventListener('mouseup', handler);
    return () => window.removeEventListener('mouseup', handler);
  }, []);

  // Pause video when scrolled out of view
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <section className="showreel section" id="showreel">
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>—</span> Watch how we think</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="showreel-wrapper">
            <div
              ref={containerRef}
              className={`showreel-player${isPlaying && !showControls ? ' showreel-player--hide-cursor' : ''}${isFullscreen ? ' showreel-player--fullscreen' : ''}`}
              onMouseMove={resetHideTimer}
              onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
              tabIndex={0}
              role="application"
              aria-label="Video player"
            >
              {/* Video element */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                className="showreel-video"
                src="/video/hypeon-vsl.mp4"
                poster="/video/hypeon-vsl-poster.jpg"
                preload="none"
                playsInline
                onClick={togglePlay}
                aria-label="Hype On Media — strategy breakdown with Chris"
              />

              {/* Big play button overlay (before first play) */}
              {!hasStarted && (
                <button
                  className="showreel-play-overlay"
                  onClick={togglePlay}
                  aria-label="Play video"
                >
                  <span className="showreel-play-icon">
                    <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true">
                      <path d="M2 1.5L26 16L2 30.5V1.5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              )}

              {/* Paused overlay (after first play, when paused) */}
              {hasStarted && !isPlaying && (
                <button
                  className="showreel-play-overlay showreel-play-overlay--paused"
                  onClick={togglePlay}
                  aria-label="Resume video"
                >
                  <span className="showreel-play-icon showreel-play-icon--small">
                    <svg width="22" height="26" viewBox="0 0 28 32" fill="none" aria-hidden="true">
                      <path d="M2 1.5L26 16L2 30.5V1.5Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              )}

              {/* Controls bar */}
              <div
                className={`showreel-controls${showControls && hasStarted ? ' showreel-controls--visible' : ''}${!hasStarted ? '' : ''}`}
                style={prefersReducedMotion ? { transition: 'none' } : undefined}
              >
                {/* Progress bar */}
                <div
                  ref={progressRef}
                  className="showreel-progress"
                  onClick={handleProgressClick}
                  onMouseDown={(e) => { setIsSeeking(true); handleProgressClick(e); }}
                  onMouseMove={handleProgressDrag}
                  role="slider"
                  aria-label="Video progress"
                  aria-valuenow={Math.round(currentTime)}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration)}
                  tabIndex={0}
                >
                  <div className="showreel-progress__buffered" style={{ width: `${bufferedPct}%` }} />
                  <div className="showreel-progress__filled" style={{ width: `${progressPct}%` }} />
                  <div className="showreel-progress__thumb" style={{ left: `${progressPct}%` }} />
                </div>

                <div className="showreel-controls__row">
                  {/* Play/Pause */}
                  <button className="showreel-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="2" y="1" width="4" height="14" rx="1" fill="currentColor" />
                        <rect x="10" y="1" width="4" height="14" rx="1" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 1.5L14 8L3 14.5V1.5Z" fill="currentColor" />
                      </svg>
                    )}
                  </button>

                  {/* Volume */}
                  <div
                    className="showreel-volume-group"
                    onMouseEnter={() => setIsVolumeHover(true)}
                    onMouseLeave={() => setIsVolumeHover(false)}
                  >
                    <button className="showreel-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                      {isMuted || volume === 0 ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      ) : volume < 0.5 ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                          <path d="M15.54 8.46a5 5 0 010 7.07" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                          <path d="M15.54 8.46a5 5 0 010 7.07" />
                          <path d="M19.07 4.93a10 10 0 010 14.14" />
                        </svg>
                      )}
                    </button>
                    <div className={`showreel-volume-slider${isVolumeHover ? ' showreel-volume-slider--visible' : ''}`}>
                      <div
                        ref={volumeRef}
                        className="showreel-volume-track"
                        onClick={handleVolumeClick}
                        role="slider"
                        aria-label="Volume"
                        aria-valuenow={Math.round(isMuted ? 0 : volume * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        tabIndex={0}
                      >
                        <div className="showreel-volume-track__filled" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                        <div className="showreel-volume-track__thumb" style={{ left: `${isMuted ? 0 : volume * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="showreel-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Spacer */}
                  <span className="showreel-spacer" />

                  {/* Fullscreen */}
                  <button className="showreel-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                    {isFullscreen ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="4 14 10 14 10 20" />
                        <polyline points="20 10 14 10 14 4" />
                        <line x1="14" y1="10" x2="21" y2="3" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <p className="showreel-caption">Meet Chris from our strategy team — 4 min</p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
