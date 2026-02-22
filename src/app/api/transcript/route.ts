import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      return parsed.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "A valid videoUrl is required." },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "Could not extract video ID. Please use a youtube.com/watch?v= or youtu.be/ URL.",
        },
        { status: 400 }
      );
    }

    // Fetch transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const transcript = transcriptItems.map((item) => item.text).join(" ");

    // Fetch video metadata via oEmbed (no API key needed)
    let videoTitle = "";
    let channelName = "";
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const oembedRes = await fetch(oembedUrl);
      if (oembedRes.ok) {
        const oembed = await oembedRes.json();
        videoTitle = oembed.title || "";
        channelName = oembed.author_name || "";
      }
    } catch {
      // oEmbed is best-effort; continue without metadata
    }

    return NextResponse.json({
      transcript,
      videoTitle,
      channelName,
      videoId,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch transcript.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
