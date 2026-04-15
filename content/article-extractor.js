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
      detectedLanguage: this._detectLanguage(),
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

    // Korean portal author selectors
    const koAuthor = document.querySelector(
      '.media_end_head_journalist_name, .info_reporter .name, ' +
      '#article_body_content .author, .article_head .reporter, ' +
      '.byline_area .reporter_name, .head_view .txt_info'
    );
    if (koAuthor) {
      var authorText = koAuthor.textContent.trim();
      // Strip 기자 suffix (e.g. "홍길동 기자" → "홍길동")
      return authorText.replace(/\s*기자\s*$/, "").trim();
    }

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

    // Korean portal date selectors (e.g. "2026.02.17 오후 3:45")
    const koDate = document.querySelector(
      '.media_end_head_info_datestamp_time, .info_reporter .date, ' +
      '.article_head .date, .head_view .txt_date, .article_info .date'
    );
    if (koDate) {
      var dateText = (koDate.getAttribute("data-date-time") || koDate.textContent || "").trim();
      if (dateText) return dateText;
    }

    return null;
  },

  _extractBody() {
    // Korean portal selectors (Naver News, Daum News)
    let container = document.querySelector(
      '#newsct_article, .newsct_body, #dic_area, ' +        // Naver News
      '.article_view, #harmonyContainer, #articleBody, ' +   // Daum News
      '.article-body, .article-body-text'                    // Arc/Fusion CMS (조선일보, 중앙일보, 동아일보)
    );

    // Standard priority: <article> > [role="main"] > largest text block
    if (!container) {
      container = document.querySelector("article");
    }

    if (!container) {
      container = document.querySelector('[role="main"]');
    }

    if (!container) {
      container = this._findLargestTextBlock();
    }

    if (!container) {
      return { text: "", paragraphs: [] };
    }

    // Detect Korean for paragraph threshold
    var isKorean = this._detectLanguage() === "ko";
    var minParagraphLen = isKorean ? 15 : 30;

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
      // Lower threshold for Korean (shorter sentences, denser characters)
      if (text.length > minParagraphLen) {
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
    const candidates = document.querySelectorAll(
      "main, .content, .article-body, .story-body, #content, .post-content, " +
      "#newsct_article, .newsct_body, #dic_area, .article_view, #harmonyContainer, #articleBody"
    );
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

  // Detect page language from HTML attributes / meta tags
  _detectLanguage() {
    // 1. <html lang="ko">
    var lang = (document.documentElement.lang || "").trim().toLowerCase();
    if (lang) return lang.slice(0, 2);

    // 2. <meta http-equiv="content-language" content="ko">
    var metaLang = document.querySelector('meta[http-equiv="content-language"]');
    if (metaLang && metaLang.content) return metaLang.content.trim().toLowerCase().slice(0, 2);

    // 3. <meta property="og:locale" content="ko_KR">
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale && ogLocale.content) return ogLocale.content.trim().toLowerCase().slice(0, 2);

    return "en";
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

    // Transcript extraction is handled by service worker via chrome.scripting.executeScript
    // (MAIN world has youtube.com origin + cookies; content script fetch returns empty)

    // Language: prefer transcript language, fall back to page detection
    var detectedLanguage = (transcript && transcript.language) || this._detectLanguage() || null;

    // Extract YouTube thumbnail for image framing analysis
    var params = new URLSearchParams(window.location.search);
    var videoId = params.get("v");
    var images = [];
    var imageDataUrls = [];
    if (videoId) {
      var thumbSrc = "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg";
      images.push({ alt: title, caption: "Video thumbnail", src: thumbSrc });
      try {
        imageDataUrls = await this._fetchImageDataUrls(images, 1);
      } catch (e) {
        // Non-critical — thumbnail fetch can fail (CORS, no maxres)
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
      detectedLanguage: detectedLanguage,
      images: images,
      imageDataUrls: imageDataUrls,
    };
  },
  // ==================== FRONT PAGE EXTRACTION ====================
  // Detects if current page is a news front/index page and extracts headlines

  isFrontPage() {
    var path = window.location.pathname;
    var domain = window.location.hostname.replace(/^www\./, "");

    // URL patterns: root, /index, /home, section index (no article slug)
    var isFrontPath = path === "/" || path === "" ||
      /^\/(index|home|main)\b/i.test(path) ||
      /^\/[a-z-]+\/?$/i.test(path); // e.g. /politics/ or /economy/

    if (!isFrontPath) return false;

    // Confirm: multiple headline elements suggest a listing page
    var headlineCount = document.querySelectorAll(
      // Arc/Fusion CMS (Chosun, JoongAng, Donga)
      '.story-card__headline, ' +
      // Generic news patterns
      'article h2, article h3, .headline-list a, .article-list a, ' +
      // Korean portals
      '.news_tit, .list_news .tit, .cluster_text a, ' +
      // Common patterns
      '[class*="story-card"] a[href], [class*="article-card"] a[href], ' +
      '.top-stories a, .lead-story a'
    ).length;

    return headlineCount >= 3;
  },

  extractFrontPage() {
    var domain = window.location.hostname.replace(/^www\./, "");
    var headlines = [];
    var seen = new Set();

    // Arc/Fusion CMS headline cards (Chosun, JoongAng, Donga)
    document.querySelectorAll('.story-card').forEach(function(card, idx) {
      var headlineEl = card.querySelector('[class*="story-card__headline"] a, [class*="story-card__headline"]');
      if (!headlineEl) return;
      var title = headlineEl.textContent.trim();
      if (!title || title.length < 5 || seen.has(title)) return;
      seen.add(title);

      var link = headlineEl.closest('a') || headlineEl.querySelector('a') || card.querySelector('a[href]');
      var href = link ? link.href : "";
      var snippet = "";
      var snippetEl = card.querySelector('[class*="deck"], [class*="summary"], [class*="subheadline"], p');
      if (snippetEl) snippet = snippetEl.textContent.trim();

      // Determine section from card's section heading or URL
      var section = "";
      var sectionEl = card.closest('[class*="flex-chain-wrapper"]');
      if (sectionEl) {
        var sectionTitle = sectionEl.querySelector('[class*="heading-title"]');
        if (sectionTitle) section = sectionTitle.textContent.trim();
      }
      if (!section && href) {
        var match = href.match(/chosun\.com\/([^/]+)\//);
        if (match) section = match[1];
      }

      headlines.push({
        position: idx + 1,
        title: title,
        snippet: snippet,
        section: section,
        url: href,
        isTopStory: idx < 5,
      });
    });

    // Naver News front page
    if (headlines.length === 0) {
      document.querySelectorAll('.news_tit, .cluster_text a, .rankingnews_name a, .sa_text a').forEach(function(el, idx) {
        var title = el.textContent.trim();
        if (!title || title.length < 5 || seen.has(title)) return;
        seen.add(title);
        headlines.push({
          position: idx + 1,
          title: title,
          snippet: "",
          section: "",
          url: el.href || "",
          isTopStory: idx < 5,
        });
      });
    }

    // Generic fallback: article links with substantial text
    if (headlines.length === 0) {
      document.querySelectorAll('article a, [class*="article"] a, [class*="story"] a, h2 a, h3 a').forEach(function(el, idx) {
        var title = el.textContent.trim();
        if (!title || title.length < 10 || seen.has(title)) return;
        seen.add(title);
        headlines.push({
          position: idx + 1,
          title: title,
          snippet: "",
          section: "",
          url: el.href || "",
          isTopStory: idx < 5,
        });
      });
    }

    var siteName = document.querySelector('meta[property="og:site_name"]');
    var pageTitle = document.querySelector('meta[property="og:title"]');

    return {
      isFrontPage: true,
      domain: domain,
      siteName: siteName ? siteName.content : domain,
      pageTitle: (pageTitle ? pageTitle.content : document.title).trim(),
      url: window.location.href,
      headlines: headlines.slice(0, 50), // cap at 50
      headlineCount: headlines.length,
      topStories: headlines.filter(function(h) { return h.isTopStory; }),
      detectedLanguage: this._detectLanguage(),
      extractedAt: new Date().toISOString(),
    };
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.ArticleExtractor = ArticleExtractor;
}
