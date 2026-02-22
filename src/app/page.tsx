"use client";

import { useState } from "react";

interface TranscriptResult {
  transcript: string;
  videoTitle: string;
  channelName: string;
  videoId: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          TrendScout
        </h1>
        <p className="mt-2 text-zinc-400 text-sm">
          AI-powered product discovery from YouTube creator content
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl flex gap-3">
        <input
          type="text"
          placeholder="Paste a YouTube video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          disabled={loading}
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 w-full max-w-2xl rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-10 w-full max-w-2xl space-y-4 animate-pulse">
          <div className="h-6 w-48 rounded bg-zinc-800" />
          <div className="h-4 w-32 rounded bg-zinc-800" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 rounded bg-zinc-800"
                style={{ width: `${85 - i * 8}%` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-10 w-full max-w-2xl">
          {/* Video info */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              {result.videoTitle || "Untitled Video"}
            </h2>
            {result.channelName && (
              <p className="text-sm text-zinc-400">{result.channelName}</p>
            )}
          </div>

          {/* Transcript */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Transcript
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {result.transcript}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
