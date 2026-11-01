"use client";

import { useEffect, useRef, useState } from "react";

export function ArticleAudio({ slug, title, author, series, version }: { slug: string; title: string; author?: string; series?: string; version?: string }) {
  const anchor = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const [docked, setDocked] = useState(false);
  const [height, setHeight] = useState<number>();
  const audio = useRef<HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const [failed, setFailed] = useState(false);
  const src = `/api/podcasts/${slug}/audio${version ? `?v=${encodeURIComponent(version)}` : ""}`;

  useEffect(() => {
    const target = anchor.current;
    const player = panel.current;
    if (!target || !player) return;
    const measure = () => {
      if (!player.classList.contains("article-audio--docked")) {
        setHeight(player.getBoundingClientRect().height);
      }
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(player);
    const observer = new IntersectionObserver(([entry]) => {
      setDocked(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    observer.observe(target);
    return () => { resize.disconnect(); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    const metadata = new MediaMetadata({ title, artist: author || "", album: series || "" });
    navigator.mediaSession.metadata = metadata;
    return () => {
      if (navigator.mediaSession.metadata === metadata) navigator.mediaSession.metadata = null;
    };
  }, [title, author, series]);

  return (
    <div ref={anchor} className="article-audio-anchor" style={{ minHeight: height }}>
    <section ref={panel} className={`article-audio${docked ? " article-audio--docked" : ""}`} aria-label="Odtwarzacz podcastu">
      <div className="article-audio-heading">
        <div>
          <h2>Posłuchaj podcastu</h2>
          <p>Słuchaj i czytaj artykuł we własnym tempie.</p>
        </div>
        <label className="article-audio-speed">
          Prędkość
          <select value={speed} onChange={(event) => {
            const rate = Number(event.target.value);
            setSpeed(rate);
            if (audio.current) audio.current.playbackRate = rate;
          }}>
            {[1, 1.2, 1.3, 1.4, 1.5].map(rate => <option key={rate} value={rate}>{rate}×</option>)}
          </select>
        </label>
      </div>
      <audio ref={audio} controls preload="metadata" src={src} aria-label={`Podcast: ${title}`} onError={() => setFailed(true)} onRateChange={() => {
        if (audio.current) setSpeed(audio.current.playbackRate);
      }} />
      {failed && <p role="alert">Nie udało się odtworzyć podcastu. <a href={src}>Otwórz plik audio</a>.</p>}
    </section>
    </div>
  );
}
