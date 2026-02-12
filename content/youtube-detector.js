// Spectrum — YouTube-specific news detection signals

const YouTubeDetector = {
  isYouTubePage() {
    return window.location.hostname.includes("youtube.com") &&
      window.location.pathname === "/watch";
  },

  getSignals() {
    if (!this.isYouTubePage()) return null;

    const channelId = document.querySelector('meta[itemprop="channelId"]')?.content || "";
    const title = document.querySelector(
      'h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, #title h1'
    )?.textContent?.trim() || document.title;

    return {
      youtubeChannelId: channelId,
      youtubeTitle: title,
    };
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.YouTubeDetector = YouTubeDetector;
}
