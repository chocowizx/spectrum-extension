// Spectrum — Article extractor
// Extracts clean article content, title, author, date from news pages

const ArticleExtractor = {
  async extract() {
    const title = this._extractTitle();
    const author = this._extractAuthor();
    const date = this._extractDate();
    const { text, paragraphs } = this._extractBody();
    const domain = window.location.hostname.replace(/^www\./, "");
    const images = this._extractImages();
    const imageDataUrls = await this._fetchImageDataUrls(images);

    return {
      title,
      author,
      date,
      text,
      paragraphs,
      url: window.location.href,
      domain,
      wordCount: text.split(/\s+/).length,
      images,
      imageDataUrls,
    };
  },

  _extractTitle() {
    // Priority: og:title > h1 > document.title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) return ogTitle.content;

    const h1 = document.querySelector("article h1, [role='main'] h1, .article-title, .headline, h1");
    if (h1) return h1.textContent.trim();

    return document.title;
  },

  _extractAuthor() {
    // Try meta tags
    const metaAuthor = document.querySelector(
      'meta[name="author"], meta[property="article:author"], meta[name="byl"]'
    );
    if (metaAuthor) return metaAuthor.content;

    // Try schema.org
    const schemaAuthor = document.querySelector('[itemprop="author"] [itemprop="name"], [itemprop="author"]');
    if (schemaAuthor) return schemaAuthor.textContent.trim();

    // Try common class names
    const byline = document.querySelector(
      ".byline, .author, .article-author, [class*='byline'], [class*='author'], [data-testid='byline']"
    );
    if (byline) return byline.textContent.trim().replace(/^by\s+/i, "");

    return null;
  },

  _extractDate() {
    // Try meta tags
    const metaDate = document.querySelector(
      'meta[property="article:published_time"], meta[name="date"], meta[name="publish-date"], time[datetime]'
    );
    if (metaDate) return metaDate.content || metaDate.getAttribute("datetime");

    // Try time element
    const time = document.querySelector("article time, time[datetime]");
    if (time) return time.getAttribute("datetime") || time.textContent.trim();

    return null;
  },

  _extractBody() {
    // Priority: <article> > [role="main"] > largest text block
    let container = document.querySelector("article");

    if (!container) {
      container = document.querySelector('[role="main"]');
    }

    if (!container) {
      container = this._findLargestTextBlock();
    }

    if (!container) {
      return { text: "", paragraphs: [] };
    }

    // Clone to avoid modifying the page
    const clone = container.cloneNode(true);

    // Remove unwanted elements
    const unwanted = clone.querySelectorAll(
      "nav, aside, footer, header, .ad, .advertisement, .sidebar, .comments, " +
      ".social-share, .related, .newsletter, .subscription, [role='complementary'], " +
      "[role='navigation'], .nav, .menu, script, style, iframe, figure figcaption, " +
      ".caption, .image-credit, [data-testid='share-tools'], .share-tools"
    );
    unwanted.forEach((el) => el.remove());

    // Extract paragraphs
    const pElements = clone.querySelectorAll("p");
    const paragraphs = [];
    let fullText = "";

    pElements.forEach((p) => {
      const text = p.textContent.trim();
      // Filter out very short paragraphs (likely captions/labels)
      if (text.length > 30) {
        paragraphs.push({
          text,
          startIndex: fullText.length,
          endIndex: fullText.length + text.length,
        });
        fullText += text + "\n\n";
      }
    });

    return { text: fullText.trim(), paragraphs };
  },

  _findLargestTextBlock() {
    const candidates = document.querySelectorAll("main, .content, .article-body, .story-body, #content, .post-content");
    if (candidates.length > 0) {
      // Return the one with the most text
      let best = candidates[0];
      let bestLen = 0;
      candidates.forEach((c) => {
        const len = c.textContent.length;
        if (len > bestLen) {
          bestLen = len;
          best = c;
        }
      });
      return best;
    }

    // Fallback: find div with most paragraph children
    const divs = document.querySelectorAll("div");
    let best = null;
    let bestPCount = 0;
    divs.forEach((div) => {
      const pCount = div.querySelectorAll(":scope > p").length;
      if (pCount > bestPCount) {
        bestPCount = pCount;
        best = div;
      }
    });
    return bestPCount >= 3 ? best : document.body;
  },

  // Extract image metadata from article (Upgrade #3 — scoped)
  _extractImages() {
    const container = document.querySelector("article, [role='main'], main, .article-body");
    if (!container) return [];
    const imgs = container.querySelectorAll("img");
    const results = [];
    imgs.forEach((img) => {
      const src = img.src || img.dataset.src || "";
      if (!src || src.includes("data:") || src.includes("pixel") || src.includes("tracking")) return;
      const alt = (img.alt || "").trim();
      // Look for nearby caption
      const figure = img.closest("figure");
      const caption = figure ? (figure.querySelector("figcaption")?.textContent?.trim() || "") : "";
      if (alt || caption) {
        results.push({ alt, caption, src: src.slice(0, 500) });
      }
    });
    return results.slice(0, 5); // cap at 5 images
  },

  // Fetch and compress article images as base64 data URLs (max 2)
  async _fetchImageDataUrls(images, maxImages) {
    if (!maxImages) maxImages = 2;
    var results = [];
    var candidates = (images || []).slice(0, maxImages);
    for (var i = 0; i < candidates.length; i++) {
      try {
        var src = candidates[i].src;
        if (!src) continue;
        var resp = await fetch(src);
        if (!resp.ok) continue;
        var blob = await resp.blob();
        if (!blob.type.startsWith("image/")) continue;
        var bmp = await createImageBitmap(blob);
        var maxW = 512;
        var w = bmp.width;
        var h = bmp.height;
        if (w > maxW) { h = Math.round(h * (maxW / w)); w = maxW; }
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bmp, 0, 0, w, h);
        bmp.close();
        var dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        results.push(dataUrl);
      } catch (e) {
        // CORS or other failure — skip silently
      }
    }
    return results;
  },

  // Extract YouTube-specific content
  async extractYouTube() {
    const title = document.querySelector(
      'h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, #title h1'
    )?.textContent?.trim() || document.title;

    const channelName = document.querySelector(
      '#channel-name yt-formatted-string a, ytd-channel-name yt-formatted-string a'
    )?.textContent?.trim() || "";

    const channelId = document.querySelector(
      'meta[itemprop="channelId"]'
    )?.content || "";

    const description = document.querySelector(
      '#description-inner, ytd-text-inline-expander .content, #description .content'
    )?.textContent?.trim() || "";

    var textContent = `${title}\n\nBy: ${channelName}\n\n${description}`;
    var transcript = null;

    // Attempt transcript extraction
    if (typeof YouTubeDetector !== "undefined" && YouTubeDetector.fetchTranscript) {
      try {
        transcript = await YouTubeDetector.fetchTranscript();
        if (transcript && transcript.text) {
          textContent += "\n\n--- TRANSCRIPT ---\n" + transcript.text.slice(0, 8000);
        }
      } catch (e) {
        // Non-critical
      }
    }

    return {
      title,
      author: channelName,
      date: null,
      text: textContent,
      paragraphs: [{ text: description, startIndex: 0, endIndex: description.length }],
      url: window.location.href,
      domain: "youtube.com",
      wordCount: textContent.split(/\s+/).length,
      youtubeChannelId: channelId,
      isYouTube: true,
      transcript: transcript,
    };
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.ArticleExtractor = ArticleExtractor;
}
