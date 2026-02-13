// Spectrum — Service Worker (single-file, no ES module imports)
// Detection engine hub, message routing, badge management

// ============================================================
// DOMAIN LISTS (inlined from domain-lists.js)
// ============================================================
const NEWS_SOURCES = {
  farLeft: [
    { domain: "jacobin.com", name: "Jacobin" },
    { domain: "theintercept.com", name: "The Intercept" },
    { domain: "democracynow.org", name: "Democracy Now!" },
    { domain: "currentaffairs.org", name: "Current Affairs" },
    { domain: "truthout.org", name: "Truthout" },
    { domain: "commondreams.org", name: "Common Dreams" },
    { domain: "therealnews.com", name: "The Real News" },
    { domain: "inthesetimes.com", name: "In These Times" },
  ],
  left: [
    { domain: "msnbc.com", name: "MSNBC" },
    { domain: "huffpost.com", name: "HuffPost" },
    { domain: "vox.com", name: "Vox" },
    { domain: "theguardian.com", name: "The Guardian" },
    { domain: "slate.com", name: "Slate" },
    { domain: "motherjones.com", name: "Mother Jones" },
    { domain: "thenation.com", name: "The Nation" },
    { domain: "salon.com", name: "Salon" },
    { domain: "thedailybeast.com", name: "The Daily Beast" },
    { domain: "newrepublic.com", name: "The New Republic" },
  ],
  centerLeft: [
    { domain: "nytimes.com", name: "New York Times" },
    { domain: "washingtonpost.com", name: "Washington Post" },
    { domain: "cnn.com", name: "CNN" },
    { domain: "npr.org", name: "NPR" },
    { domain: "pbs.org", name: "PBS" },
    { domain: "bbc.com", name: "BBC" },
    { domain: "bbc.co.uk", name: "BBC" },
    { domain: "theatlantic.com", name: "The Atlantic" },
    { domain: "politico.com", name: "Politico" },
    { domain: "nbcnews.com", name: "NBC News" },
    { domain: "cbsnews.com", name: "CBS News" },
    { domain: "abcnews.go.com", name: "ABC News" },
    { domain: "time.com", name: "TIME" },
    { domain: "axios.com", name: "Axios" },
  ],
  center: [
    { domain: "reuters.com", name: "Reuters" },
    { domain: "apnews.com", name: "Associated Press" },
    { domain: "thehill.com", name: "The Hill" },
    { domain: "usatoday.com", name: "USA Today" },
    { domain: "bloomberg.com", name: "Bloomberg" },
    { domain: "c-span.org", name: "C-SPAN" },
    { domain: "aljazeera.com", name: "Al Jazeera" },
    { domain: "newsweek.com", name: "Newsweek" },
    { domain: "marketwatch.com", name: "MarketWatch" },
  ],
  centerRight: [
    { domain: "wsj.com", name: "Wall Street Journal" },
    { domain: "economist.com", name: "The Economist" },
    { domain: "forbes.com", name: "Forbes" },
    { domain: "nationalreview.com", name: "National Review" },
    { domain: "realclearpolitics.com", name: "RealClearPolitics" },
    { domain: "reason.com", name: "Reason" },
    { domain: "freebeacon.com", name: "Washington Free Beacon" },
    { domain: "spectator.org", name: "The American Spectator" },
  ],
  right: [
    { domain: "foxnews.com", name: "Fox News" },
    { domain: "nypost.com", name: "New York Post" },
    { domain: "washingtontimes.com", name: "Washington Times" },
    { domain: "thefederalist.com", name: "The Federalist" },
    { domain: "dailywire.com", name: "Daily Wire" },
    { domain: "dailycaller.com", name: "Daily Caller" },
    { domain: "townhall.com", name: "Townhall" },
    { domain: "theblaze.com", name: "The Blaze" },
  ],
  farRight: [
    { domain: "breitbart.com", name: "Breitbart" },
    { domain: "theepochtimes.com", name: "The Epoch Times" },
    { domain: "oann.com", name: "OANN" },
    { domain: "newsmax.com", name: "Newsmax" },
    { domain: "thegatewaypundit.com", name: "The Gateway Pundit" },
    { domain: "zerohedge.com", name: "Zero Hedge" },
    { domain: "infowars.com", name: "InfoWars" },
  ],
};

const DOMAIN_LOOKUP = {};
for (const [lean, sources] of Object.entries(NEWS_SOURCES)) {
  for (const source of sources) {
    DOMAIN_LOOKUP[source.domain] = { name: source.name, lean };
  }
}

var YOUTUBE_NEWS_CHANNELS = {
  "UCvixJtaXuNdMd7jA1eAEVSg": { name: "Democracy Now!", lean: "farLeft" },
  "UCaXkIU1QidjPwiAYu6GcHjg": { name: "MSNBC", lean: "left" },
  "UCZaT_X_mc0BI-djXOlfhqWQ": { name: "VICE News", lean: "left" },
  "UCupvZG-5ko_eiXAupbDfxWw": { name: "CNN", lean: "centerLeft" },
  "UCeY0bbntWzzVIaj2z3QigXg": { name: "NBC News", lean: "centerLeft" },
  "UC8p1vwvWtl6T73JiExfWs1g": { name: "CBS News", lean: "centerLeft" },
  "UCBi2mrWuNuyYy4gbM6fU18Q": { name: "ABC News", lean: "centerLeft" },
  "UCGRULEJq-gm7VGSNGKWmk5A": { name: "NPR", lean: "centerLeft" },
  "UC16niRr50-MSBwiO3YDb3RA": { name: "BBC News", lean: "centerLeft" },
  "UCIALMKvObZNtJ68-rmLjXzA": { name: "Al Jazeera English", lean: "center" },
  "UCYflgwKqIEagBNgTnlBXOqQ": { name: "PBS NewsHour", lean: "center" },
  "UChqUTb7kYRX8-EiaN3XFrSQ": { name: "Reuters", lean: "center" },
  "UC52X_8rR_3EWBoSdcerC_CA": { name: "Associated Press", lean: "center" },
  "UCXIJgqnII2ZOINSWNOGFThA": { name: "Fox News", lean: "right" },
  "UCnMkOwM_GGK0mBpMvBCOlUQ": { name: "Sky News Australia", lean: "right" },
  "UCy6jaRSBWnMnXEMfOFZ2fLw": { name: "Newsmax", lean: "farRight" },
};

const ALL_NEWS_DOMAINS = new Set(Object.keys(DOMAIN_LOOKUP));

function getDomainLean(hostname) {
  const cleaned = hostname.replace(/^www\./, "");
  if (DOMAIN_LOOKUP[cleaned]) return DOMAIN_LOOKUP[cleaned];
  for (const domain of ALL_NEWS_DOMAINS) {
    if (cleaned === domain || cleaned.endsWith("." + domain)) {
      return DOMAIN_LOOKUP[domain];
    }
  }
  return null;
}

// ============================================================
// DETECTION ENGINE (inlined from detector.js)
// ============================================================
const NEWS_KEYWORDS = [
  "breaking", "exclusive", "report", "investigation", "opinion", "editorial",
  "analysis", "politics", "election", "congress", "senate", "president",
  "supreme court", "legislation", "policy", "democrat", "republican",
  "controversy", "scandal", "protest", "crisis", "war", "conflict",
  "economy", "inflation", "recession", "immigration", "climate",
  "ruling", "verdict", "indictment", "testimony", "hearing",
];

function detectStrict(hostname, signals) {
  if (getDomainLean(hostname) !== null) {
    return { isNews: true, confidence: 0.95, method: "domain_match" };
  }
  if (hostname.includes("youtube.com") && signals.youtubeChannelId) {
    if (YOUTUBE_NEWS_CHANNELS[signals.youtubeChannelId]) {
      return { isNews: true, confidence: 0.9, method: "youtube_channel" };
    }
  }
  return { isNews: false, confidence: 0, method: null };
}

function detectStandard(hostname, signals) {
  const strict = detectStrict(hostname, signals);
  if (strict.isNews) return strict;

  if (signals.schemaType === "NewsArticle" || signals.schemaType === "ReportageNewsArticle") {
    return { isNews: true, confidence: 0.88, method: "schema_newsarticle" };
  }
  if (signals.ogType === "article") {
    if (signals.hasArticleTag || signals.hasByline) {
      return { isNews: true, confidence: 0.75, method: "og_article_plus_structure" };
    }
    return { isNews: true, confidence: 0.6, method: "og_article" };
  }
  if (signals.schemaType === "Article") {
    return { isNews: true, confidence: 0.65, method: "schema_article" };
  }
  return { isNews: false, confidence: 0, method: null };
}

function detectAggressive(hostname, signals) {
  const standard = detectStandard(hostname, signals);
  if (standard.isNews) return standard;

  let score = 0;
  if (signals.hasArticleTag) score += 0.2;
  if (signals.hasByline) score += 0.15;
  if (signals.hasDateline) score += 0.15;
  if (signals.paragraphCount > 5) score += 0.15;
  if (signals.paragraphCount > 10) score += 0.1;
  if (signals.hasHeadline) score += 0.1;
  if (signals.titleKeywordHits > 0) score += 0.1;
  if (signals.titleKeywordHits > 1) score += 0.1;

  if (hostname.includes("youtube.com") && signals.youtubeTitle) {
    const titleLower = signals.youtubeTitle.toLowerCase();
    const hits = NEWS_KEYWORDS.filter((kw) => titleLower.includes(kw)).length;
    if (hits >= 2) score += 0.3;
    else if (hits >= 1) score += 0.15;
  }

  if (score >= 0.5) {
    return { isNews: true, confidence: Math.min(score, 0.85), method: "heuristic" };
  }
  return { isNews: false, confidence: score, method: null };
}

function detectNews(hostname, signals, sensitivity) {
  let result;
  switch (sensitivity) {
    case "strict":
      result = detectStrict(hostname, signals);
      break;
    case "aggressive":
      result = detectAggressive(hostname, signals);
      break;
    case "standard":
    default:
      result = detectStandard(hostname, signals);
      break;
  }
  result.sourceLean = getDomainLean(hostname);
  return result;
}

// ============================================================
// API CLIENT (inlined from api-client.js)
// ============================================================
const API_BASE = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net";

async function analyzeArticle(data) {
  const response = await fetch(API_BASE + "/analyzeArticle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error("analyzeArticle failed (" + response.status + "): " + (json.error || "Unknown error"));
  }
  return json;
}

async function searchPerspectives(data) {
  const response = await fetch(API_BASE + "/searchPerspectives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error("searchPerspectives failed (" + response.status + "): " + (json.error || "Unknown error"));
  }
  return json;
}

// ============================================================
// SERVICE WORKER CORE
// ============================================================

const DEFAULTS = {
  sensitivity: "standard",
  dashboardPosition: "right",
  dashboardTransparency: 0.92,
  dashboardWidth: 380,
  includedSites: [],
  excludedSites: [],
  enabled: true,
};

const tabState = {};
var pendingDeepData = null;

// ---- Detection logic (shared by onUpdated retry and CONTENT_READY) ----
async function processDetection(tabId, signals) {
  if (!tabState[tabId] || tabState[tabId].status !== "checking") return;

  const hostname = tabState[tabId].hostname;
  const settings = await getSettings();

  const manualInclude = settings.includedSites.some(function (s) { return hostname.includes(s); });
  let detection;

  if (manualInclude) {
    detection = {
      isNews: true,
      confidence: 1,
      method: "manual_include",
      sourceLean: getDomainLean(hostname),
    };
  } else {
    detection = detectNews(hostname, signals, settings.sensitivity);
  }

  tabState[tabId].detection = detection;

  if (detection.isNews) {
    tabState[tabId].status = "detected";
    setBadge(tabId, "!", "#22C55E");
    chrome.tabs.sendMessage(tabId, {
      type: "NEWS_DETECTED",
      detection: detection,
      settings: {
        dashboardPosition: settings.dashboardPosition,
        dashboardTransparency: settings.dashboardTransparency,
        dashboardWidth: settings.dashboardWidth,
      },
    }).catch(function () {});
  } else {
    tabState[tabId].status = "not_news";
    clearBadge(tabId);
  }
}

function sendCheckPageWithRetry(tabId, retriesLeft, delay) {
  if (retriesLeft === undefined) retriesLeft = 4;
  if (delay === undefined) delay = 300;

  chrome.tabs.sendMessage(tabId, { type: "CHECK_PAGE" }, function (response) {
    if (chrome.runtime.lastError || !response) {
      if (retriesLeft > 0) {
        setTimeout(function () {
          sendCheckPageWithRetry(tabId, retriesLeft - 1, delay * 1.5);
        }, delay);
      } else {
        if (tabState[tabId]) {
          tabState[tabId].status = "no_content_script";
        }
        clearBadge(tabId);
      }
      return;
    }
    var signals = response.signals || {};
    processDetection(tabId, signals);
  });
}

// ---- Settings helpers ----
function getSettings() {
  return new Promise(function (resolve) {
    chrome.storage.local.get(Object.keys(DEFAULTS), function (stored) {
      resolve(Object.assign({}, DEFAULTS, stored));
    });
  });
}

function canMakeApiCall() {
  return new Promise(function (resolve) {
    chrome.storage.local.get(["apiCallLog"], function (result) {
      var log = result.apiCallLog || [];
      var now = Date.now();
      var recentCalls = log.filter(function (t) { return now - t < 3600000; });
      if (recentCalls.length >= 120) return resolve(false);
      var lastCall = recentCalls[recentCalls.length - 1] || 0;
      if (now - lastCall < 500) return resolve(false);
      recentCalls.push(now);
      chrome.storage.local.set({ apiCallLog: recentCalls }, function () { resolve(true); });
    });
  });
}

function getCachedAnalysis(url) {
  var cacheKey = "cache_" + btoa(url).slice(0, 60);
  return new Promise(function (resolve) {
    chrome.storage.local.get([cacheKey], function (result) {
      var cached = result[cacheKey];
      if (!cached) return resolve(null);
      if (Date.now() - cached.timestamp > 86400000) {
        chrome.storage.local.remove([cacheKey]);
        return resolve(null);
      }
      resolve(cached.analysis);
    });
  });
}

function cacheAnalysis(url, analysis) {
  var cacheKey = "cache_" + btoa(url).slice(0, 60);
  var entry = {};
  entry[cacheKey] = { analysis: analysis, timestamp: Date.now(), url: url };
  return new Promise(function (resolve) {
    chrome.storage.local.set(entry, resolve);
  });
}

// ---- Badge management ----
function setBadge(tabId, text, color) {
  chrome.action.setBadgeText({ text: text, tabId: tabId });
  chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });
}

function clearBadge(tabId) {
  chrome.action.setBadgeText({ text: "", tabId: tabId });
}

// ---- Tab navigation listener ----
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete" || !tab.url) return;
  if (!tab.url.startsWith("http")) {
    clearBadge(tabId);
    return;
  }

  getSettings().then(function (settings) {
    if (!settings.enabled) {
      clearBadge(tabId);
      return;
    }

    var url = new URL(tab.url);
    var hostname = url.hostname;

    if (settings.excludedSites.some(function (s) { return hostname.includes(s); })) {
      clearBadge(tabId);
      return;
    }

    tabState[tabId] = { url: tab.url, hostname: hostname, status: "checking" };
    sendCheckPageWithRetry(tabId);
  });
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  delete tabState[tabId];
});

// ---- Message handler ----
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var tabId = sender.tab ? sender.tab.id : undefined;

  switch (message.type) {
    case "CONTENT_READY": {
      if (!tabId || !sender.tab || !sender.tab.url) {
        sendResponse({ ok: true });
        break;
      }
      var readyUrl = sender.tab.url;
      if (!readyUrl.startsWith("http")) {
        sendResponse({ ok: true });
        break;
      }

      var readyHostname = new URL(readyUrl).hostname;

      var currentStatus = tabState[tabId] ? tabState[tabId].status : null;
      // Allow re-detection if no state, still checking, or was a failed state
      if (!currentStatus || currentStatus === "checking" || currentStatus === "no_content_script" || currentStatus === "unknown") {
        getSettings().then(function (settings) {
          if (!settings.enabled) return;
          if (settings.excludedSites.some(function (s) { return readyHostname.includes(s); })) return;

          tabState[tabId] = { url: readyUrl, hostname: readyHostname, status: "checking" };
          processDetection(tabId, message.signals || {});
        });
      }
      sendResponse({ ok: true });
      break;
    }

    case "ARTICLE_DATA": {
      handleArticleAnalysis(tabId, message.data);
      sendResponse({ received: true });
      break;
    }

    case "GET_PERSPECTIVES": {
      handlePerspectives(tabId, message.data)
        .then(function (result) { sendResponse(result); })
        .catch(function (err) { sendResponse({ error: err.message }); });
      return true;
    }

    case "OPEN_DEEP_ANALYSIS": {
      pendingDeepData = message.data;
      chrome.tabs.create({ url: chrome.runtime.getURL("deep-analysis.html") });
      sendResponse({ ok: true });
      break;
    }

    case "GET_DEEP_DATA": {
      sendResponse({ data: pendingDeepData || null });
      pendingDeepData = null;
      break;
    }

    case "GET_STATUS": {
      var state = tabState[message.tabId] || { status: "unknown" };
      sendResponse({
        status: state.status,
        detection: state.detection || null,
        analysis: state.analysis || null,
        url: state.url || null,
      });
      break;
    }

    case "TOGGLE_ENABLED": {
      chrome.storage.local.set({ enabled: message.enabled });
      chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, {
            type: "SETTINGS_CHANGED",
            settings: { enabled: message.enabled },
          }).catch(function () {});
        }
      });
      sendResponse({ ok: true });
      break;
    }

    case "SETTINGS_CHANGED": {
      chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
          chrome.tabs.sendMessage(tabs[i].id, message).catch(function () {});
        }
      });
      sendResponse({ ok: true });
      break;
    }

    case "RECHECK_TAB": {
      var recheckTabId = message.tabId;
      if (!recheckTabId) { sendResponse({ ok: false }); break; }

      chrome.tabs.get(recheckTabId, function (tab) {
        if (chrome.runtime.lastError || !tab || !tab.url || !tab.url.startsWith("http")) {
          sendResponse({ ok: false, reason: "invalid_tab" });
          return;
        }

        var hostname = new URL(tab.url).hostname;
        tabState[recheckTabId] = { url: tab.url, hostname: hostname, status: "checking" };

        // Try messaging the existing content script first
        chrome.tabs.sendMessage(recheckTabId, { type: "CHECK_PAGE" }, function (response) {
          if (chrome.runtime.lastError || !response) {
            // Content script not present — programmatically inject it
            chrome.scripting.executeScript({
              target: { tabId: recheckTabId },
              files: [
                "shared/constants.js",
                "shared/storage.js",
                "content/article-extractor.js",
                "content/youtube-detector.js",
                "content/content-script.js",
              ],
            }).then(function () {
              // Content script will self-announce via CONTENT_READY
            }).catch(function (err) {
              console.warn("[Spectrum] Could not inject content script:", err);
              if (tabState[recheckTabId]) {
                tabState[recheckTabId].status = "no_content_script";
              }
            });
            return;
          }
          // Content script responded — run detection
          processDetection(recheckTabId, response.signals || {});
        });
      });
      return true; // async sendResponse
    }
  }
});

// ---- Analysis pipeline ----
async function handleArticleAnalysis(tabId, articleData) {
  if (!tabId || !tabState[tabId]) return;

  if (tabState[tabId]) tabState[tabId].status = "analyzing";
  setBadge(tabId, "...", "#F59E0B");

  try {
    var cached = await getCachedAnalysis(articleData.url);
    if (cached) {
      if (tabState[tabId]) {
        tabState[tabId].status = "complete";
        tabState[tabId].analysis = cached;
      }
      var claimCount = (cached.claims && cached.claims.length) || 0;
      setBadge(tabId, String(claimCount), "#22C55E");
      chrome.tabs.sendMessage(tabId, {
        type: "ANALYSIS_RESULT",
        analysis: cached,
        fromCache: true,
      }).catch(function () {});
      return;
    }

    var allowed = await canMakeApiCall();
    if (!allowed) {
      chrome.tabs.sendMessage(tabId, {
        type: "ANALYSIS_ERROR",
        error: "Rate limit reached. Please wait a moment.",
      }).catch(function () {});
      if (tabState[tabId]) tabState[tabId].status = "rate_limited";
      setBadge(tabId, "!", "#EF4444");
      return;
    }

    var analyzeParams = {
      articleText: articleData.text,
      articleUrl: articleData.url,
      articleTitle: articleData.title,
      sourceDomain: articleData.domain,
      images: articleData.images || [],
    };

    var analysis;
    try {
      analysis = await analyzeArticle(analyzeParams);
    } catch (firstErr) {
      var isRateLimit = firstErr.message && firstErr.message.toLowerCase().indexOf("rate") !== -1;
      var retryWait = isRateLimit ? 8000 : 3000;
      console.warn("[Spectrum] First attempt failed, retrying in " + retryWait + "ms:", firstErr.message);
      setBadge(tabId, "\u2026", "#B8963E");
      await new Promise(function (r) { setTimeout(r, retryWait); });
      analysis = await analyzeArticle(analyzeParams);
    }

    await cacheAnalysis(articleData.url, analysis);

    if (tabState[tabId]) {
      tabState[tabId].status = "complete";
      tabState[tabId].analysis = analysis;
    }

    var count = (analysis.claims && analysis.claims.length) || 0;
    setBadge(tabId, String(count), "#22C55E");

    chrome.tabs.sendMessage(tabId, {
      type: "ANALYSIS_RESULT",
      analysis: analysis,
      fromCache: false,
    }).catch(function () {});
  } catch (err) {
    console.error("[Spectrum] Analysis error:", err);
    if (tabState[tabId]) tabState[tabId].status = "error";
    setBadge(tabId, "!", "#EF4444");
    chrome.tabs.sendMessage(tabId, {
      type: "ANALYSIS_ERROR",
      error: err.message,
    }).catch(function () {});
  }
}

async function handlePerspectives(tabId, data) {
  try {
    var allowed = await canMakeApiCall();
    if (!allowed) {
      return { error: "Rate limit reached. Please wait a moment." };
    }
    return await searchPerspectives(data);
  } catch (err) {
    console.error("[Spectrum] Perspectives error:", err);
    return { error: err.message };
  }
}

// ============================================================
// RESEARCH MONITOR — Notification polling
// ============================================================

const RESEARCH_API_URL = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net/searchResearch";
const RESEARCH_SITE_URL = "https://spectrum-research.web.app";

// Set up 6-hour alarm for research notification checks
chrome.runtime.onInstalled.addListener(function () {
  chrome.alarms.create("checkResearchUpdates", { periodInMinutes: 360 });
});

// Also create alarm on startup (in case extension was reloaded)
chrome.alarms.create("checkResearchUpdates", { periodInMinutes: 360 });

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "checkResearchUpdates") {
    checkResearchNotifications();
  }
});

async function checkResearchNotifications() {
  try {
    var response = await fetch(RESEARCH_API_URL + "?action=notification");
    if (!response.ok) return;

    var data = await response.json();
    if (!data.hasNew) return;

    var title = "Spectrum Research Monitor";
    var message = data.totalNew + " new paper" + (data.totalNew !== 1 ? "s" : "") + " found";
    if (data.highPriorityCount > 0) {
      message += " (" + data.highPriorityCount + " high-priority)";
    }

    chrome.notifications.create("research-update-" + data.date, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: title,
      message: message,
      priority: data.highPriorityCount > 0 ? 2 : 1,
    });
  } catch (err) {
    console.warn("[Spectrum] Research notification check failed:", err.message);
  }
}

// Open research site when notification is clicked
chrome.notifications.onClicked.addListener(function (notificationId) {
  if (notificationId.startsWith("research-update-")) {
    chrome.tabs.create({ url: RESEARCH_SITE_URL });
    chrome.notifications.clear(notificationId);
  }
});

console.log("[Spectrum] Service worker initialized");
