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

  async fetchTranscript() {
    if (!this.isYouTubePage()) return null;
    try {
      var params = new URLSearchParams(window.location.search);
      var videoId = params.get("v");
      if (!videoId) return null;

      var langs = ["en", "ko"];
      for (var li = 0; li < langs.length; li++) {
        try {
          var resp = await fetch("https://www.youtube.com/api/timedtext?lang=" + langs[li] + "&v=" + videoId);
          if (!resp.ok) continue;
          var xml = await resp.text();
          if (!xml || xml.length < 50) continue;

          var parser = new DOMParser();
          var doc = parser.parseFromString(xml, "text/xml");
          var textNodes = doc.querySelectorAll("text");
          if (textNodes.length === 0) continue;

          var lines = [];
          textNodes.forEach(function (node) {
            var t = node.textContent || "";
            // Decode HTML entities
            var temp = document.createElement("span");
            temp.innerHTML = t;
            lines.push(temp.textContent.trim());
          });

          var fullText = lines.join(" ").replace(/\s+/g, " ").trim();
          if (fullText.length < 20) continue;

          return { text: fullText, language: langs[li], length: fullText.length };
        } catch (e) {
          continue;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.YouTubeDetector = YouTubeDetector;
}
