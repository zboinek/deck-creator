"use client";

import { useState, useCallback } from "react";
import type { SessionRole } from "@/hooks/useSessionSync";

interface SessionControlsProps {
  slug: string;
  sessionCode: string | null;
  role: SessionRole;
  viewers: number;
  connected: boolean;
  liveSlide: number | null;
  currentSlide: number;
  onSessionStart: (code: string, token: string) => void;
  onSessionEnd: () => void;
  onReturnToLive: () => void;
}

export function SessionControls({
  slug,
  sessionCode,
  role,
  viewers,
  connected,
  liveSlide,
  currentSlide,
  onSessionStart,
  onSessionEnd,
  onReturnToLive,
}: SessionControlsProps) {
  const [starting, setStarting] = useState(false);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (data.code && data.token) {
        onSessionStart(data.code, data.token);
      }
    } catch {
      // failed to create session
    } finally {
      setStarting(false);
    }
  }, [slug, onSessionStart]);

  const handleEnd = useCallback(async () => {
    if (!sessionCode) return;
    onSessionEnd();
  }, [sessionCode, onSessionEnd]);

  const handleOpenDisplay = useCallback(() => {
    if (!sessionCode) return;
    const url = `/deck/${slug}?session=${sessionCode}&role=display`;
    window.open(url, "_blank");
  }, [sessionCode, slug]);

  if (!sessionCode) {
    return (
      <button
        onClick={handleStart}
        disabled={starting}
        className="session-start-btn"
      >
        {starting ? "Starting..." : "Live Session"}
      </button>
    );
  }

  if (role === "host") {
    return (
      <div className="session-host-controls">
        <div className="session-code-display">
          <span className="session-code-label">CODE</span>
          <span className="session-code-value">{sessionCode}</span>
        </div>
        <div className="session-viewers">
          <span className="session-viewers-dot" />
          {viewers} {viewers === 1 ? "viewer" : "viewers"}
        </div>
        <button onClick={handleEnd} className="session-end-btn">
          End
        </button>
      </div>
    );
  }

  if (role === "follower") {
    const isOffLive = liveSlide !== null && liveSlide !== currentSlide;

    return (
      <div className="session-follower-controls">
        <div className="session-live-badge">
          <span
            className={`session-live-dot ${connected ? "session-live-dot--active" : ""}`}
          />
          {connected ? "LIVE" : "Reconnecting..."}
        </div>
        {isOffLive && (
          <button onClick={onReturnToLive} className="session-return-btn">
            Return to live
          </button>
        )}
      </div>
    );
  }

  // display role shows nothing
  return null;
}
