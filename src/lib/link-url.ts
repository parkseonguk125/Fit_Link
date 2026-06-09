import { extractYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";

export type ParsedLink =
  | { mediaType: "YOUTUBE"; url: string }
  | { mediaType: "LINK"; url: string };

export function parseLinkUrl(input: string): ParsedLink | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    const youtubeId = extractYoutubeId(url.href);
    if (youtubeId) {
      return {
        mediaType: "YOUTUBE",
        url: youtubeEmbedUrl(youtubeId),
      };
    }

    return { mediaType: "LINK", url: url.href };
  } catch {
    return null;
  }
}

export function linkDisplayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
