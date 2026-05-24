"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type SessionRole = "host" | "follower" | "display";

interface UseSessionSyncOptions {
  sessionCode: string | null;
  role: SessionRole;
  hostToken: string | null;
  onRemoteSlideChange: (slide: number) => void;
  onSessionEnd?: () => void;
}

interface UseSessionSyncReturn {
  broadcastSlide: (slide: number) => void;
  liveSlide: number | null;
  viewers: number;
  connected: boolean;
}

export function useSessionSync({
  sessionCode,
  role,
  hostToken,
  onRemoteSlideChange,
  onSessionEnd,
}: UseSessionSyncOptions): UseSessionSyncReturn {
  const [liveSlide, setLiveSlide] = useState<number | null>(null);
  const [viewers, setViewers] = useState(0);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const onRemoteSlideChangeRef = useRef(onRemoteSlideChange);
  const onSessionEndRef = useRef(onSessionEnd);

  useEffect(() => {
    onRemoteSlideChangeRef.current = onRemoteSlideChange;
  }, [onRemoteSlideChange]);

  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  useEffect(() => {
    if (!sessionCode || role === "host") return;

    const es = new EventSource(`/api/sessions/${sessionCode}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.ended) {
          onSessionEndRef.current?.();
          es.close();
          setConnected(false);
          return;
        }

        if (typeof data.slide === "number") {
          setLiveSlide(data.slide);
          if (typeof data.viewers === "number") {
            setViewers(data.viewers);
          }
          onRemoteSlideChangeRef.current(data.slide);
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [sessionCode, role]);

  const broadcastSlide = useCallback(
    (slide: number) => {
      if (!sessionCode || role !== "host" || !hostToken) return;

      fetch(`/api/sessions/${sessionCode}/navigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slide, token: hostToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.viewers === "number") {
            setViewers(data.viewers);
          }
        })
        .catch(() => {});
    },
    [sessionCode, role, hostToken]
  );

  return { broadcastSlide, liveSlide, viewers, connected };
}
