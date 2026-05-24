"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = code.trim().toUpperCase();
      if (trimmed.length !== 6) {
        setError("Code must be 6 characters");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/sessions/${trimmed}`);
        if (!res.ok) {
          setError("Session not found. Check the code and try again.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        router.push(`/deck/${data.slug}?session=${trimmed}`);
      } catch {
        setError("Failed to connect. Please try again.");
        setLoading(false);
      }
    },
    [code, router]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(val);
    setError(null);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "var(--surface-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="w-full max-w-md px-6">
        <button
          onClick={() => router.push("/")}
          className="mb-12 transition-colors"
          style={{
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            fontWeight: 500,
          }}
        >
          &larr; Back to decks
        </button>

        <div
          className="mb-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase" as const,
            color: "var(--text-muted)",
          }}
        >
          Join Session
        </div>

        <h1
          className="mb-3"
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            letterSpacing: "var(--tracking-tighter)",
            lineHeight: "var(--leading-tight)",
          }}
        >
          Enter session code
        </h1>

        <p
          className="mb-10"
          style={{
            fontSize: "var(--text-base)",
            color: "var(--text-secondary)",
            lineHeight: "var(--leading-relaxed)",
          }}
        >
          Ask the presenter for the 6-character code shown on their screen.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={handleChange}
            placeholder="ABC123"
            maxLength={6}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="join-code-input"
          />

          {error && (
            <p className="join-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={code.length !== 6 || loading}
            className="join-submit-btn"
          >
            {loading ? "Joining..." : "Join Presentation"}
          </button>
        </form>
      </div>
    </div>
  );
}
