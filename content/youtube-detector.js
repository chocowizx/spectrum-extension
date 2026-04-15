// Spectrum — YouTube-specific news detection signals

const YouTubeDetector = {
  isYouTubePage() {
    return window.location.hostname.includes("youtube.com") &&
      window.location.pathname === "/watch";
  },

  _extractChannelId() {
    // Method 1: meta tag
    var meta = document.querySelector('meta[itemprop="channelId"]');
    if (meta && meta.content) return meta.content;

    // Method 2: channel link in owner section (/channel/UCxxxxx)
    var ownerLinks = document.querySelectorAll(
      'ytd-video-owner-renderer a, #owner a, ytd-channel-name a, #channel-name a'
    );
    for (var i = 0; i < ownerLinks.length; i++) {
      var href = ownerLinks[i].href || "";
      var match = href.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
      if (match) return match[1];
    }

    // Method 3: ytInitialData / ytInitialPlayerResponse in script tags
    try {
      var scripts = document.querySelectorAll("script");
      for (var j = 0; j < scripts.length; j++) {
        var text = scripts[j].textContent || "";
        if (text.indexOf("ytInitialData") === -1 && text.indexOf("ytInitialPlayerResponse") === -1) continue;
        var cidMatch = text.match(/"(?:externalChannelId|channelId)"\s*:\s*"(UC[a-zA-Z0-9_-]+)"/);
        if (cidMatch) return cidMatch[1];
      }
    } catch (e) {}

    // Method 4: any /channel/UC link on page
    var allLinks = document.querySelectorAll('a[href*="/channel/UC"]');
    if (allLinks.length > 0) {
      var m = allLinks[0].href.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
      if (m) return m[1];
    }

    // Method 5: inject main-world script to read ytInitialPlayerResponse (SPA navigation)
    try {
      var dataEl = document.getElementById("__spectrum_yt_cid");
      if (dataEl && dataEl.textContent) return dataEl.textContent;
    } catch (e) {}

    return "";
  },

  _extractChannelName() {
    // Try visible channel name in the DOM
    var selectors = [
      '#channel-name a',
      '#owner-name a',
      'ytd-channel-name a',
      'ytd-video-owner-renderer #text a',
      'ytd-video-owner-renderer ytd-channel-name yt-formatted-string a',
      '#upload-info #channel-name yt-formatted-string a',
    ];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var el = document.querySelector(selectors[i]);
        if (el && el.textContent && el.textContent.trim()) return el.textContent.trim();
      } catch (e) {}
    }
    // Fallback: try textContent of channel-name container directly
    var container = document.querySelector('#channel-name, ytd-channel-name');
    if (container) {
      var text = container.textContent.trim();
      if (text) return text;
    }
    // Fallback: ownerChannelName from script tags
    try {
      var scripts = document.querySelectorAll("script");
      for (var j = 0; j < scripts.length; j++) {
        var t = scripts[j].textContent || "";
        var m = t.match(/"ownerChannelName"\s*:\s*"([^"]+)"/);
        if (m) return m[1];
      }
    } catch (e) {}
    return "";
  },

  _injectChannelIdExtractor() {
    // Inject a script into the main world to read ytInitialPlayerResponse
    // which contains channelId but is only accessible from page JS context
    if (document.getElementById("__spectrum_yt_cid")) return;
    try {
      var script = document.createElement("script");
      script.textContent = '(function(){try{' +
        'var d=document.createElement("span");d.id="__spectrum_yt_cid";d.style.display="none";' +
        'var r=window.ytInitialPlayerResponse||window.ytplayer&&window.ytplayer.config&&window.ytplayer.config.args;' +
        'if(r){var c=JSON.stringify(r).match(/"channelId"\\s*:\\s*"(UC[a-zA-Z0-9_-]+)"/);' +
        'if(c)d.textContent=c[1];}' +
        'document.body.appendChild(d);' +
        '}catch(e){}})();';
      document.documentElement.appendChild(script);
      script.remove();
    } catch (e) {}
  },

  _injectCaptionTracksExtractor() {
    // Inject main-world script to extract captionTracks from ytInitialPlayerResponse
    // Needed for SPA navigation where script tags don't contain the new video's data
    var existing = document.getElementById("__spectrum_yt_captions");
    if (existing) existing.remove(); // always re-inject (video may have changed)
    try {
      var script = document.createElement("script");
      script.textContent = '(function(){try{' +
        'var d=document.createElement("span");d.id="__spectrum_yt_captions";d.style.display="none";' +
        'var r=window.ytInitialPlayerResponse;' +
        'if(!r&&window.ytplayer&&window.ytplayer.config)r=window.ytplayer.config.args;' +
        'if(r&&r.captions&&r.captions.playerCaptionsTracklistRenderer&&r.captions.playerCaptionsTracklistRenderer.captionTracks){' +
        'd.textContent=JSON.stringify(r.captions.playerCaptionsTracklistRenderer.captionTracks);' +
        '}' +
        'document.body.appendChild(d);' +
        '}catch(e){}})();';
      document.documentElement.appendChild(script);
      script.remove();
    } catch (e) {}
  },

  getSignals() {
    if (!this.isYouTubePage()) return null;

    // Try to extract channelId from main-world JS variables
    this._injectChannelIdExtractor();

    const channelId = this._extractChannelId();
    const channelName = this._extractChannelName();
    const title = document.querySelector(
      'h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, #title h1'
    )?.textContent?.trim() || document.title;

    return {
      youtubeChannelId: channelId,
      youtubeChannelName: channelName,
      youtubeTitle: title,
    };
  },

  _parseTimedTextXml(xml, language) {
    if (!xml || xml.length < 50) return null;
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(xml, "text/xml");
      var lines = [];
      var segments = [];

      // Format 1: <transcript><text start="0" dur="5.2">...</text></transcript>
      var textNodes = doc.querySelectorAll("text");
      if (textNodes.length > 0) {
        textNodes.forEach(function (node) {
          var t = node.textContent || "";
          var temp = document.createElement("span");
          temp.innerHTML = t;
          var cleanText = temp.textContent.trim();
          if (!cleanText) return;
          lines.push(cleanText);
          var startAttr = node.getAttribute("start");
          var durAttr = node.getAttribute("dur");
          if (startAttr !== null) {
            segments.push({
              start: parseFloat(startAttr),
              dur: durAttr ? parseFloat(durAttr) : 0,
              text: cleanText
            });
          }
        });
      }

      // Format 2 (srv3): <timedtext><body><p t="0" d="5200"><s>...</s></p></body></timedtext>
      if (segments.length === 0) {
        var pNodes = doc.querySelectorAll("body > p");
        if (pNodes.length > 0) {
          pNodes.forEach(function (p) {
            var cleanText = (p.textContent || "").trim();
            if (!cleanText) return;
            lines.push(cleanText);
            var tAttr = p.getAttribute("t");
            var dAttr = p.getAttribute("d");
            if (tAttr !== null) {
              segments.push({
                start: parseFloat(tAttr) / 1000,
                dur: dAttr ? parseFloat(dAttr) / 1000 : 0,
                text: cleanText
              });
            }
          });
        }
      }

      if (segments.length === 0) return null;
      var fullText = lines.join(" ").replace(/\s+/g, " ").trim();
      if (fullText.length < 20) return null;
      return { text: fullText, segments: segments, language: language, length: fullText.length };
    } catch (e) {
      return null;
    }
  },

  _extractCaptionTracks() {
    // Method A: Read from injected main-world element (works on SPA navigation)
    try {
      var injected = document.getElementById("__spectrum_yt_captions");
      if (injected && injected.textContent) {
        var parsed = JSON.parse(injected.textContent);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Method B: Search script tags (works on initial page load)
    try {
      var scripts = document.querySelectorAll("script");
      for (var i = 0; i < scripts.length; i++) {
        var text = scripts[i].textContent || "";
        if (text.indexOf("captionTracks") === -1) continue;
        var match = text.match(/"captionTracks"\s*:\s*(\[.*?\])/);
        if (match) {
          return JSON.parse(match[1]);
        }
      }
    } catch (e) {}
    return [];
  },

  async fetchTranscript() {
    if (!this.isYouTubePage()) return null;
    try {
      var params = new URLSearchParams(window.location.search);
      var videoId = params.get("v");
      if (!videoId) return null;
      var self = this;

      // Inject main-world extractor for SPA navigation support
      this._injectCaptionTracksExtractor();

      // Method 1: Try caption tracks from page data (most reliable)
      var tracks = this._extractCaptionTracks();
      if (tracks.length > 0) {
        // Prefer en/ko, then any track
        var preferred = ["en", "ko"];
        var sorted = tracks.slice().sort(function (a, b) {
          var ai = preferred.indexOf((a.languageCode || "").slice(0, 2));
          var bi = preferred.indexOf((b.languageCode || "").slice(0, 2));
          if (ai === -1) ai = 99;
          if (bi === -1) bi = 99;
          return ai - bi;
        });
        for (var ti = 0; ti < sorted.length; ti++) {
          try {
            var trackUrl = sorted[ti].baseUrl;
            if (!trackUrl) continue;
            // Try srv3 format first (most reliable), then raw URL
            var fmts = ["srv3", ""];
            for (var fi = 0; fi < fmts.length; fi++) {
              var fetchUrl = trackUrl;
              if (fmts[fi]) {
                fetchUrl += (trackUrl.indexOf("?") === -1 ? "?" : "&") + "fmt=" + fmts[fi];
              }
              var resp = await fetch(fetchUrl);
              if (!resp.ok) continue;
              var xml = await resp.text();
              if (!xml || xml.length < 50) continue;
              var result = self._parseTimedTextXml(xml, (sorted[ti].languageCode || "").slice(0, 2));
              if (result) return result;
            }
          } catch (e) { continue; }
        }
      }

      // Method 2: Direct timedtext API (manual + auto-generated captions)
      var langs = ["en", "ko"];
      var kinds = ["", "asr"]; // "" = manual, "asr" = auto-generated
      var fmts2 = ["srv3", ""];
      for (var li = 0; li < langs.length; li++) {
        for (var ki = 0; ki < kinds.length; ki++) {
          for (var fi2 = 0; fi2 < fmts2.length; fi2++) {
            try {
              var url = "https://www.youtube.com/api/timedtext?lang=" + langs[li] + "&v=" + videoId;
              if (kinds[ki]) url += "&kind=" + kinds[ki];
              if (fmts2[fi2]) url += "&fmt=" + fmts2[fi2];
              var resp2 = await fetch(url);
              if (!resp2.ok) continue;
              var xml2 = await resp2.text();
              if (!xml2 || xml2.length < 50) continue;
              var result2 = self._parseTimedTextXml(xml2, langs[li]);
              if (result2) return result2;
            } catch (e) { continue; }
          }
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
