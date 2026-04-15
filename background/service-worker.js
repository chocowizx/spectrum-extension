// Spectrum — Service Worker (single-file, no ES module imports)
// Detection engine hub, message routing, badge management

// Load credibility scoring module
importScripts("../shared/credibility.js");
// Load state-affiliated media database (Upgrade #9)
importScripts("../shared/stateMedia.js");
// Load sentiment baselines for outlet deviation scoring
importScripts("../shared/sentimentBaselines.js");

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
    { domain: "propublica.org", name: "ProPublica" },
    { domain: "theconversation.com", name: "The Conversation" },
    { domain: "haaretz.com", name: "Haaretz" },
    { domain: "mirror.co.uk", name: "The Mirror" },
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
    { domain: "newyorker.com", name: "The New Yorker" },
    { domain: "businessinsider.com", name: "Business Insider" },
    { domain: "independent.co.uk", name: "The Independent" },
    { domain: "cbc.ca", name: "CBC" },
    { domain: "abc.net.au", name: "ABC Australia" },
    { domain: "smh.com.au", name: "Sydney Morning Herald" },
    { domain: "thestar.com", name: "Toronto Star" },
    { domain: "irishtimes.com", name: "The Irish Times" },
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
    { domain: "foreignpolicy.com", name: "Foreign Policy" },
    { domain: "france24.com", name: "France 24" },
    { domain: "dw.com", name: "DW" },
    { domain: "scmp.com", name: "South China Morning Post" },
    { domain: "straitstimes.com", name: "The Straits Times" },
    { domain: "japantimes.co.jp", name: "The Japan Times" },
    { domain: "asia.nikkei.com", name: "Nikkei Asia" },
    { domain: "timesofisrael.com", name: "Times of Israel" },
    { domain: "theglobeandmail.com", name: "Globe and Mail" },
    { domain: "channelnewsasia.com", name: "CNA" },
    { domain: "news.sky.com", name: "Sky News" },
    { domain: "ft.com", name: "Financial Times" },
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
    { domain: "thedispatch.com", name: "The Dispatch" },
    { domain: "telegraph.co.uk", name: "The Telegraph" },
    { domain: "thetimes.com", name: "The Times" },
    { domain: "spectator.co.uk", name: "The Spectator UK" },
    { domain: "nationalpost.com", name: "National Post" },
    { domain: "theaustralian.com.au", name: "The Australian" },
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
    { domain: "theamericanconservative.com", name: "The American Conservative" },
    { domain: "dailymail.co.uk", name: "Daily Mail" },
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
  korean: [
    { domain: "chosun.com", name: "조선일보", lean: "right" },
    { domain: "joongang.co.kr", name: "중앙일보", lean: "centerRight" },
    { domain: "donga.com", name: "동아일보", lean: "right" },
    { domain: "hani.co.kr", name: "한겨레", lean: "left" },
    { domain: "khan.co.kr", name: "경향신문", lean: "left" },
    { domain: "news.kbs.co.kr", name: "KBS", lean: "center" },
    { domain: "imnews.imbc.com", name: "MBC", lean: "center" },
    { domain: "news.sbs.co.kr", name: "SBS", lean: "center" },
    { domain: "news.jtbc.co.kr", name: "JTBC", lean: "centerLeft" },
    { domain: "ytn.co.kr", name: "YTN", lean: "center" },
    { domain: "yna.co.kr", name: "연합뉴스", lean: "center" },
    { domain: "ohmynews.com", name: "오마이뉴스", lean: "left" },
    { domain: "ichannela.com", name: "채널A", lean: "right" },
    { domain: "news.naver.com", name: "네이버 뉴스", lean: "center" },
    { domain: "n.news.naver.com", name: "네이버 뉴스", lean: "center" },
    { domain: "v.daum.net", name: "다음 뉴스", lean: "center" },
    { domain: "news.daum.net", name: "다음 뉴스", lean: "center" },
    { domain: "hankyung.com", name: "한국경제", lean: "centerRight" },
    { domain: "mk.co.kr", name: "매일경제", lean: "centerRight" },
    { domain: "seoul.co.kr", name: "서울신문", lean: "centerLeft" },
    { domain: "segye.com", name: "세계일보", lean: "centerRight" },
    { domain: "kmib.co.kr", name: "국민일보", lean: "center" },
    { domain: "heraldcorp.com", name: "헤럴드경제", lean: "center" },
    { domain: "pressian.com", name: "프레시안", lean: "left" },
    { domain: "newstapa.org", name: "뉴스타파", lean: "left" },
    { domain: "mediatoday.co.kr", name: "미디어오늘", lean: "left" },
    { domain: "nocutnews.co.kr", name: "노컷뉴스", lean: "centerLeft" },
    { domain: "newsis.com", name: "뉴시스", lean: "center" },
    { domain: "mt.co.kr", name: "머니투데이", lean: "center" },
    { domain: "munhwa.com", name: "문화일보", lean: "centerRight" },
    { domain: "news.tvchosun.com", name: "TV조선", lean: "right" },
    { domain: "mbn.co.kr", name: "MBN", lean: "right" },
    { domain: "news.zum.com", name: "ZUM 뉴스", lean: "center" },
  ],
  spanish: [
    { domain: "elpais.com", name: "El País", lean: "centerLeft" },
    { domain: "elmundo.es", name: "El Mundo", lean: "centerRight" },
    { domain: "abc.es", name: "ABC", lean: "right" },
    { domain: "lavanguardia.com", name: "La Vanguardia", lean: "center" },
    { domain: "lanacion.com.ar", name: "La Nación", lean: "centerRight" },
    { domain: "clarin.com", name: "Clarín", lean: "centerRight" },
    { domain: "univision.com", name: "Univision", lean: "centerLeft" },
    { domain: "telemundo.com", name: "Telemundo", lean: "center" },
    { domain: "infobae.com", name: "Infobae", lean: "centerRight" },
    { domain: "elconfidencial.com", name: "El Confidencial", lean: "center" },
  ],
  french: [
    { domain: "lemonde.fr", name: "Le Monde", lean: "centerLeft" },
    { domain: "lefigaro.fr", name: "Le Figaro", lean: "centerRight" },
    { domain: "liberation.fr", name: "Libération", lean: "left" },
    { domain: "lexpress.fr", name: "L'Express", lean: "center" },
    { domain: "lepoint.fr", name: "Le Point", lean: "centerRight" },
    { domain: "mediapart.fr", name: "Mediapart", lean: "left" },
    { domain: "bfmtv.com", name: "BFMTV", lean: "center" },
    { domain: "rfi.fr", name: "RFI", lean: "center" },
  ],
  german: [
    { domain: "spiegel.de", name: "Der Spiegel", lean: "centerLeft" },
    { domain: "faz.net", name: "Frankfurter Allgemeine Zeitung", lean: "centerRight" },
    { domain: "bild.de", name: "Bild", lean: "right" },
    { domain: "sueddeutsche.de", name: "Süddeutsche Zeitung", lean: "centerLeft" },
    { domain: "zeit.de", name: "Die Zeit", lean: "centerLeft" },
    { domain: "welt.de", name: "Die Welt", lean: "centerRight" },
  ],
  arabic: [
    { domain: "alarabiya.net", name: "Al Arabiya", lean: "centerRight" },
    { domain: "aawsat.com", name: "Asharq Al-Awsat", lean: "centerRight" },
    { domain: "aljazeera.net", name: "Al Jazeera Arabic", lean: "centerLeft" },
    { domain: "alhurra.com", name: "Alhurra", lean: "center" },
    { domain: "alquds.com", name: "Al-Quds", lean: "center" },
    { domain: "middleeasteye.net", name: "Middle East Eye", lean: "left" },
    { domain: "skynewsarabia.com", name: "Sky News Arabia", lean: "centerRight" },
    { domain: "rt.com/arabic", name: "RT Arabic", lean: "farRight" },
  ],
  japanese: [
    { domain: "asahi.com", name: "朝日新聞", lean: "left" },
    { domain: "yomiuri.co.jp", name: "読売新聞", lean: "right" },
    { domain: "mainichi.jp", name: "毎日新聞", lean: "centerLeft" },
    { domain: "nikkei.com", name: "日本経済新聞", lean: "centerRight" },
    { domain: "sankei.com", name: "産経新聞", lean: "right" },
    { domain: "nhk.or.jp", name: "NHK", lean: "center" },
  ],
};

const DOMAIN_LOOKUP = {};
for (const [category, sources] of Object.entries(NEWS_SOURCES)) {
  for (const source of sources) {
    DOMAIN_LOOKUP[source.domain] = { name: source.name, lean: source.lean || category };
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
  // Korean news channels
  "UCF4Wxdo3inmxP-Y59wXDsFw": { name: "MBCNEWS", lean: "center" },
  "UCcQTRi69dsVYHN3exePtZ1A": { name: "KBS News", lean: "center" },
  "UCkinYTS9IHqOEwR1Sze2JTw": { name: "SBS 뉴스", lean: "center" },
  "UCsU-I-vHLiaMfV_ceaYz5rQ": { name: "JTBC News", lean: "centerLeft" },
  "UChlgI3UHCOnwUGzWzbJ3H5w": { name: "YTN", lean: "center" },
  "UCTHCOPwqNfZ0uiKOvFyhGwg": { name: "연합뉴스TV", lean: "center" },
  "UCuw1hxBo5mDVUhgMzRDk3aw": { name: "TV조선", lean: "right" },
  "UCIIpmDPVk7nzNHEUSHmvkUg": { name: "채널A 뉴스", lean: "right" },
};

// Reverse lookup: channel name → channel info (for fallback when ID extraction fails)
var YOUTUBE_NEWS_CHANNELS_BY_NAME = {};
for (var _ytcid in YOUTUBE_NEWS_CHANNELS) {
  var _ytch = YOUTUBE_NEWS_CHANNELS[_ytcid];
  YOUTUBE_NEWS_CHANNELS_BY_NAME[_ytch.name.toLowerCase()] = { id: _ytcid, name: _ytch.name, lean: _ytch.lean };
}

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

function getYouTubeNewsChannel(signals) {
  // Try channel ID first (most reliable)
  if (signals.youtubeChannelId && YOUTUBE_NEWS_CHANNELS[signals.youtubeChannelId]) {
    return YOUTUBE_NEWS_CHANNELS[signals.youtubeChannelId];
  }
  // Fallback: match by channel name (handles SPA navigation + /@handle URLs)
  if (signals.youtubeChannelName) {
    var name = signals.youtubeChannelName.toLowerCase().trim();
    if (YOUTUBE_NEWS_CHANNELS_BY_NAME[name]) return YOUTUBE_NEWS_CHANNELS_BY_NAME[name];
    // Fuzzy: check if any known channel name is contained in the extracted name
    for (var knownName in YOUTUBE_NEWS_CHANNELS_BY_NAME) {
      if (name.indexOf(knownName) !== -1 || knownName.indexOf(name) !== -1) {
        return YOUTUBE_NEWS_CHANNELS_BY_NAME[knownName];
      }
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
  if (hostname.includes("youtube.com")) {
    var ytChannel = getYouTubeNewsChannel(signals);
    if (ytChannel) {
      return { isNews: true, confidence: 0.9, method: "youtube_channel", sourceLean: { name: ytChannel.name, lean: ytChannel.lean } };
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
  if (!result.sourceLean) result.sourceLean = getDomainLean(hostname);
  return result;
}

// ============================================================
// API CLIENT (inlined from api-client.js)
// ============================================================
const API_BASE = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net";

async function getInstallId() {
  return new Promise(function (resolve) {
    chrome.storage.local.get("spectrumInstallId", function (result) {
      if (result.spectrumInstallId) {
        resolve(result.spectrumInstallId);
      } else {
        var id = crypto.randomUUID();
        chrome.storage.local.set({ spectrumInstallId: id }, function () {
          resolve(id);
        });
      }
    });
  });
}

async function analyzeArticle(data) {
  var installId = await getInstallId();
  const response = await fetch(API_BASE + "/analyzeArticle", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Spectrum-Install-Id": installId },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (response.status === 429) {
    throw new Error("RATE_LIMIT:" + (json.message || "Daily limit reached") + ":" + (json.resetAt || ""));
  }
  if (!response.ok) {
    throw new Error("analyzeArticle failed (" + response.status + "): " + (json.error || "Unknown error"));
  }
  return json;
}

async function searchPerspectives(data) {
  var installId = await getInstallId();
  const response = await fetch(API_BASE + "/searchPerspectives", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Spectrum-Install-Id": installId },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (response.status === 429) {
    throw new Error("RATE_LIMIT:" + (json.message || "Daily limit reached") + ":" + (json.resetAt || ""));
  }
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
      if (recentCalls.length >= (SPECTRUM.RATE_LIMIT.MAX_PER_HOUR || 30)) return resolve(false);
      var lastCall = recentCalls[recentCalls.length - 1] || 0;
      if (now - lastCall < 500) return resolve(false);
      recentCalls.push(now);
      chrome.storage.local.set({ apiCallLog: recentCalls }, function () { resolve(true); });
    });
  });
}

function canMakeChunkCall() {
  return new Promise(function (resolve) {
    chrome.storage.local.get(["chunkCallLog"], function (result) {
      var log = result.chunkCallLog || [];
      var now = Date.now();
      var recentCalls = log.filter(function (t) { return now - t < 3600000; });
      if (recentCalls.length >= 300) return resolve(false);
      var lastCall = recentCalls[recentCalls.length - 1] || 0;
      if (now - lastCall < 200) return resolve(false);
      recentCalls.push(now);
      chrome.storage.local.set({ chunkCallLog: recentCalls }, function () { resolve(true); });
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
      // Allow re-detection if no state, still checking, failed state, or not_news (YouTube late hydration)
      if (!currentStatus || currentStatus === "checking" || currentStatus === "no_content_script" || currentStatus === "unknown" || currentStatus === "not_news") {
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
      // Debounce: skip if already analyzing this tab
      if (tabState[tabId] && (tabState[tabId].status === "analyzing" || tabState[tabId].status === "analyzing_chunks")) {
        console.log("[Spectrum:DEBUG] Skipping duplicate ARTICLE_DATA for tab", tabId);
        sendResponse({ received: true });
        break;
      }
      handleArticleAnalysis(tabId, message.data);
      sendResponse({ received: true });
      break;
    }

    case "FRONT_PAGE_DATA": {
      if (tabState[tabId] && (tabState[tabId].status === "analyzing")) {
        sendResponse({ received: true });
        break;
      }
      handleFrontPageAnalysis(tabId, message.data);
      sendResponse({ received: true });
      break;
    }

    case "SAVE_FEEDBACK": {
      var fb = message.data || {};
      chrome.storage.local.get(["spectrumFeedback"], function (result) {
        var list = result.spectrumFeedback || [];
        fb.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        fb.timestamp = Date.now();
        list.unshift(fb);
        if (list.length > 200) list.length = 200;
        chrome.storage.local.set({ spectrumFeedback: list }, function () {
          sendResponse({ ok: true });
        });
      });
      return true;
    }

    case "GET_FEEDBACK": {
      chrome.storage.local.get(["spectrumFeedback"], function (result) {
        sendResponse({ items: result.spectrumFeedback || [] });
      });
      return true;
    }

    case "ANALYZE_VIDEO_CHUNK": {
      handleVideoChunkAnalysis(tabId, message.data)
        .then(function (result) {
          chrome.tabs.sendMessage(tabId, {
            type: "VIDEO_CHUNK_RESULT",
            chunkIndex: message.data.chunkIndex,
            analysis: result,
          }).catch(function () {});
        })
        .catch(function (err) {
          chrome.tabs.sendMessage(tabId, {
            type: "VIDEO_CHUNK_ERROR",
            chunkIndex: message.data.chunkIndex,
            error: err.message,
          }).catch(function () {});
        });
      sendResponse({ received: true });
      break;
    }

    case "GET_PERSPECTIVES": {
      handlePerspectives(tabId, message.data)
        .then(function (result) { sendResponse(result); })
        .catch(function (err) { sendResponse({ error: err.message }); });
      return true;
    }

    case "FACTCHECK_CLAIM": {
      var allowed = canMakeApiCall();
      Promise.resolve(allowed).then(function (ok) {
        if (!ok) { sendResponse({ error: "Rate limit reached. Please wait a moment." }); return; }
        return searchPerspectives({ claim: message.data.claim, mode: "factcheck" });
      }).then(function (result) {
        if (result) sendResponse(result);
      }).catch(function (err) {
        sendResponse({ error: err.message });
      });
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

// ============================================================
// ARTICLE SNAPSHOT SYSTEM (Upgrade #8 — Narrative Tracking)
// ============================================================

// Simple djb2 hash for body text — no crypto needed
function hashString(str) {
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & 0xFFFFFFFF;
  }
  return (hash >>> 0).toString(36);
}

// Strip tracking params to produce a stable URL key
function snapshotUrlKey(url) {
  try {
    var u = new URL(url);
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","ref","fbclid","gclid"].forEach(function(p) {
      u.searchParams.delete(p);
    });
    return u.origin + u.pathname;
  } catch (e) {
    return url;
  }
}

function getArticleSnapshots() {
  return new Promise(function (resolve) {
    chrome.storage.local.get(["articleSnapshots"], function (result) {
      resolve(result.articleSnapshots || {});
    });
  });
}

function saveArticleSnapshots(snapshots) {
  return new Promise(function (resolve) {
    chrome.storage.local.set({ articleSnapshots: snapshots }, resolve);
  });
}

// Evict oldest entries if over 500 (LRU by lastSeen)
function evictSnapshots(snapshots) {
  var MAX = 500;
  var keys = Object.keys(snapshots);
  if (keys.length <= MAX) return snapshots;
  keys.sort(function (a, b) {
    return (snapshots[a].lastSeen || 0) - (snapshots[b].lastSeen || 0);
  });
  for (var i = 0; i < keys.length - MAX; i++) {
    delete snapshots[keys[i]];
  }
  return snapshots;
}

// Compare current article to stored snapshot. Returns change object or null.
async function checkAndUpdateSnapshot(articleData, analysis) {
  var urlKey = snapshotUrlKey(articleData.url);
  var snapshots = await getArticleSnapshots();
  var existing = snapshots[urlKey] || null;

  var currentBodyHash = hashString((articleData.text || "").slice(0, 8000));
  var currentTitle = (articleData.title || "").trim();
  var currentLean = analysis.overallLean || null;
  var currentLeanScore = analysis.leanScore || null;
  var claimCount = (analysis.claims && analysis.claims.length) || 0;
  var now = Date.now();

  var changes = null;

  if (existing) {
    var detected = [];

    if (existing.title && currentTitle && existing.title !== currentTitle) {
      detected.push({ type: "headline", old: existing.title, current: currentTitle });
    }

    if (existing.bodyHash && currentBodyHash !== existing.bodyHash) {
      detected.push({ type: "content", since: existing.timestamp });
    }

    if (existing.overallLean && currentLean && existing.overallLean !== currentLean) {
      detected.push({ type: "lean", old: existing.overallLean, current: currentLean });
    }

    if (detected.length > 0) {
      changes = {
        detected: detected,
        originalTimestamp: existing.timestamp,
        originalTitle: existing.title,
      };
    }

    // Update snapshot with current values, preserve original timestamp
    existing.bodyHash = currentBodyHash;
    existing.title = currentTitle;
    existing.overallLean = currentLean;
    existing.leanScore = currentLeanScore;
    existing.claimCount = claimCount;
    existing.lastSeen = now;
    if (changes && changes.detected.some(function(c) { return c.type === "headline"; })) {
      if (!existing.headlines) existing.headlines = [];
      existing.headlines.push({ title: currentTitle, timestamp: now });
      if (existing.headlines.length > 10) existing.headlines = existing.headlines.slice(-10);
    }
    snapshots[urlKey] = existing;
  } else {
    snapshots[urlKey] = {
      url: articleData.url,
      title: currentTitle,
      bodyHash: currentBodyHash,
      overallLean: currentLean,
      leanScore: currentLeanScore,
      claimCount: claimCount,
      timestamp: now,
      lastSeen: now,
      headlines: [],
    };
  }

  snapshots = evictSnapshots(snapshots);
  await saveArticleSnapshots(snapshots);
  return changes;
}

// ---- Analysis pipeline ----
async function handleFrontPageAnalysis(tabId, frontPageData) {
  if (!tabId || !tabState[tabId]) return;
  tabState[tabId].status = "analyzing";

  var domain = frontPageData.domain || "";
  var sourceInfo = getDomainLean(domain);
  var sourceLean = sourceInfo ? sourceInfo.lean : "unknown";
  var sourceName = sourceInfo ? sourceInfo.name : frontPageData.siteName || domain;

  // Build headline text for analysis
  var headlineText = frontPageData.headlines.map(function(h, i) {
    var parts = [(i + 1) + "."];
    if (h.section) parts.push("[" + h.section + "]");
    parts.push(h.title);
    if (h.snippet) parts.push("— " + h.snippet);
    if (h.isTopStory) parts.push("(TOP STORY)");
    return parts.join(" ");
  }).join("\n");

  // Fetch missing stories context for this outlet
  var missingContext = "";
  try {
    var coverageResp = await fetch(
      "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net/getCoverageMatrix?domain=" + encodeURIComponent(domain)
    );
    var coverageData = await coverageResp.json();

    if (coverageData.missingStories && coverageData.missingCount > 0) {
      var stories = Object.values(coverageData.missingStories).slice(0, 10);
      missingContext = "\n\n--- CROSS-OUTLET CONTEXT ---\n" +
        "The following " + stories.length + " stories are being covered by other outlets today but are ABSENT from this outlet's front page:\n" +
        stories.map(function(s, i) {
          return (i + 1) + ". \"" + s.topic + "\" (" + (s.category || "other") + ") — covered by " + s.coveredCount + " outlets including: " + s.coveredBy.slice(0, 4).map(function(c) { return c.source; }).join(", ");
        }).join("\n") +
        "\n--- END CROSS-OUTLET CONTEXT ---";
    }
  } catch (err) {
    console.warn("[FrontPage] Could not fetch coverage matrix:", err.message);
  }

  try {
    var analysis = await analyzeArticle({
      mode: "frontPage",
      url: frontPageData.url,
      title: frontPageData.pageTitle,
      source: sourceName,
      sourceLean: sourceLean,
      headlineCount: frontPageData.headlineCount,
      content: headlineText + missingContext,
      detectedLanguage: frontPageData.detectedLanguage,
      extractedAt: frontPageData.extractedAt,
    });

    tabState[tabId].status = "complete";
    tabState[tabId].analysis = analysis;
    analysis.isFrontPage = true;
    analysis.detectedLanguage = frontPageData.detectedLanguage;

    chrome.tabs.sendMessage(tabId, {
      type: "ANALYSIS_RESULT",
      analysis: analysis,
    }).catch(function () {});
  } catch (err) {
    console.error("[Spectrum] Front page analysis failed:", err);
    tabState[tabId].status = "error";
    chrome.tabs.sendMessage(tabId, { type: "ANALYSIS_ERROR", error: err.message }).catch(function () {});
  }
}

async function handleArticleAnalysis(tabId, articleData) {
  if (!tabId || !tabState[tabId]) return;
  if (tabState[tabId]) tabState[tabId].status = "analyzing";

  console.log("[Spectrum:DEBUG] handleArticleAnalysis called — isYouTube:", !!articleData.isYouTube,
    "hasTranscript:", !!articleData.transcript,
    "segCount:", articleData.transcript && articleData.transcript.segments ? articleData.transcript.segments.length : 0);

  // For YouTube: if transcript missing, recover via MAIN world script injection.
  // Service worker fetches to YouTube APIs return 403 (extension origin blocked).
  // MAIN world runs as youtube.com — both the ANDROID player API and baseUrl fetches succeed.
  if (articleData.isYouTube &&
      (!articleData.transcript || !articleData.transcript.segments || articleData.transcript.segments.length === 0)) {
    var videoId = null;
    try { videoId = new URL(articleData.url).searchParams.get("v"); } catch (e) {}

    // Forward log to content script page console (SW logs aren't visible there)
    function fwdLog(msg) {
      console.log(msg);
      if (tabId) chrome.tabs.sendMessage(tabId, { type: "SPECTRUM_LOG", msg: msg }).catch(function () {});
    }

    if (videoId) {
      fwdLog("[Spectrum] Transcript recovery: MAIN world injection for " + videoId);
      try {
        // Run everything in MAIN world (youtube.com origin) — avoids 403 from extension context
        var results = await chrome.scripting.executeScript({
          target: { tabId: tabId },
          world: "MAIN",
          func: async function (vid) {
            try {
              var log = [];
              // Step 1: ANDROID player API (from youtube.com origin — no 403)
              var resp = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  context: { client: { clientName: "ANDROID", clientVersion: "20.10.38", hl: "en" } },
                  videoId: vid,
                }),
              });
              if (!resp.ok) return { error: "player HTTP " + resp.status, log: log };
              var data = await resp.json();
              var tracks = (data.captions && data.captions.playerCaptionsTracklistRenderer &&
                data.captions.playerCaptionsTracklistRenderer.captionTracks) || [];
              log.push("ANDROID player: " + tracks.length + " tracks");
              if (tracks.length === 0) return { error: "no caption tracks", log: log };

              // Sort: prefer en, ko
              var preferred = ["en", "ko"];
              tracks.sort(function (a, b) {
                var ai = preferred.indexOf((a.languageCode || "").slice(0, 2));
                var bi = preferred.indexOf((b.languageCode || "").slice(0, 2));
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
              });

              // Step 2: Fetch transcript from ANDROID baseUrl (also from youtube.com origin)
              for (var i = 0; i < tracks.length; i++) {
                var baseUrl = tracks[i].baseUrl;
                if (!baseUrl) continue;
                var lang = (tracks[i].languageCode || "").slice(0, 2);
                var fmts = ["srv3", ""];
                for (var f = 0; f < fmts.length; f++) {
                  try {
                    var fetchUrl = baseUrl;
                    if (fmts[f]) fetchUrl += (baseUrl.indexOf("?") === -1 ? "?" : "&") + "fmt=" + fmts[f];
                    var r = await fetch(fetchUrl);
                    if (!r.ok) { log.push(lang + " fmt=" + (fmts[f] || "def") + " HTTP " + r.status); continue; }
                    var body = await r.text();
                    if (!body || body.length < 50) { log.push(lang + " fmt=" + (fmts[f] || "def") + " empty len=" + (body ? body.length : 0)); continue; }
                    log.push(lang + " fmt=" + (fmts[f] || "def") + " got " + body.length + " chars");

                    var segments = [];
                    var lines = [];

                    // srv3: <p t="ms" d="ms">text</p>
                    var pRx = /<p\s[^>]*?t="(\d+)"[^>]*?d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
                    var m;
                    while ((m = pRx.exec(body)) !== null) {
                      var t = m[3].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
                      if (t) { lines.push(t); segments.push({ start: parseInt(m[1]) / 1000, dur: parseInt(m[2]) / 1000, text: t }); }
                    }

                    // <text start="s" dur="s">text</text>
                    if (segments.length === 0) {
                      var tRx = /<text\s+start="([^"]+)"\s+dur="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g;
                      while ((m = tRx.exec(body)) !== null) {
                        var t2 = m[3].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
                        if (t2) { lines.push(t2); segments.push({ start: parseFloat(m[1]), dur: parseFloat(m[2]) || 0, text: t2 }); }
                      }
                    }

                    // json3
                    if (segments.length === 0 && body.charAt(0) === "{") {
                      try {
                        var j3 = JSON.parse(body);
                        (j3.events || []).forEach(function (ev) {
                          if (ev.segs) {
                            var st = ev.segs.map(function (s) { return s.utf8 || ""; }).join("").trim();
                            if (st && st !== "\n") { lines.push(st); segments.push({ start: (ev.tStartMs || 0) / 1000, dur: (ev.dDurationMs || 0) / 1000, text: st }); }
                          }
                        });
                      } catch (je) {}
                    }

                    log.push("Parsed " + segments.length + " segments");
                    if (segments.length > 0) {
                      var fullText = lines.join(" ").replace(/\s+/g, " ").trim();
                      if (fullText.length >= 20) {
                        return { text: fullText, segments: segments, language: lang, length: fullText.length, log: log };
                      }
                    }
                  } catch (e) { log.push(lang + " error: " + e.message); continue; }
                }
              }
              return { error: "all tracks exhausted", log: log };
            } catch (e) {
              return { error: e.message || String(e), log: [] };
            }
          },
          args: [videoId],
        });

        var transcript = results && results[0] && results[0].result;
        // Forward MAIN world logs
        if (transcript && transcript.log) {
          transcript.log.forEach(function (l) { fwdLog("[Spectrum] MW: " + l); });
        }

        if (transcript && !transcript.error && transcript.segments && transcript.segments.length > 0) {
          articleData.transcript = { text: transcript.text, segments: transcript.segments, language: transcript.language, length: transcript.length };
          if (articleData.text) {
            articleData.text += "\n\n--- TRANSCRIPT ---\n" + transcript.text.slice(0, 8000);
            articleData.wordCount = articleData.text.split(/\s+/).length;
          }
          if (!articleData.detectedLanguage) articleData.detectedLanguage = transcript.language;
          fwdLog("[Spectrum] Transcript RECOVERED: " + transcript.segments.length + " segs, " + transcript.length + " chars, lang=" + transcript.language);
        } else {
          fwdLog("[Spectrum] MAIN world recovery: " + (transcript ? transcript.error : "no result"));
        }
      } catch (err) {
        fwdLog("[Spectrum] Recovery error: " + err.message);
      }
    }

    if (!articleData.transcript || !articleData.transcript.segments || articleData.transcript.segments.length === 0) {
      fwdLog("[Spectrum] Transcript recovery FAILED");
    }
  }

  // Progressive chunked analysis for YouTube videos with transcripts > 120s
  if (articleData.isYouTube && articleData.transcript &&
      articleData.transcript.segments && articleData.transcript.segments.length > 0) {
    var segs = articleData.transcript.segments;
    var lastSeg = segs[segs.length - 1];
    var totalDuration = lastSeg.start + (lastSeg.dur || 0);
    console.log("[Spectrum:DEBUG] Chunk mode check — duration:", totalDuration, "s, segments:", segs.length);
    if (totalDuration > 120) {
      // Hand off to content script's ChunkScheduler
      var ytChannel = getYouTubeNewsChannel({
        youtubeChannelId: articleData.youtubeChannelId || "",
        youtubeChannelName: articleData.author || "",
      });
      chrome.tabs.sendMessage(tabId, {
        type: "START_CHUNK_SCHEDULER",
        articleData: articleData,
        sourceLean: ytChannel ? ytChannel.lean : "",
        sourceName: ytChannel ? ytChannel.name : (articleData.author || ""),
      }).catch(function (e) { console.warn("[Spectrum:DEBUG] START_CHUNK_SCHEDULER send failed:", e.message); });
      if (tabState[tabId]) tabState[tabId].status = "analyzing_chunks";
      setBadge(tabId, "\u25B6", "#8B5CF6");
      console.log("[Spectrum:DEBUG] >>> CHUNK MODE ACTIVATED — sent START_CHUNK_SCHEDULER");
      return;
    } else {
      console.log("[Spectrum:DEBUG] Duration too short for chunks:", totalDuration, "s — using monolithic");
    }
  } else if (articleData.isYouTube) {
    console.log("[Spectrum:DEBUG] Chunk mode SKIPPED — transcript still missing after recovery");
  }

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

    // Attach credibility score if available
    var _credDomain = (articleData.domain || "").replace(/^www\./, "");
    var _credData = (typeof getCredibilityScore === "function") ? getCredibilityScore(_credDomain) : null;

    // Attach state media affiliation if available (Upgrade #9)
    var _stateMediaData = (typeof getStateMediaInfo === "function") ? getStateMediaInfo(_credDomain) : null;

    var analyzeParams = {
      articleText: articleData.text,
      articleUrl: articleData.url,
      articleTitle: articleData.title,
      sourceDomain: articleData.domain,
      images: articleData.images || [],
      imageDataUrls: articleData.imageDataUrls || [],
      author: articleData.author || null,
      isYouTube: articleData.isYouTube || false,
      transcript: articleData.transcript || null,
      detectedLanguage: articleData.detectedLanguage || null,
      credibilityScore: _credData ? _credData.score : null,
      credibilityFactors: _credData || null,
      stateAffiliation: _stateMediaData || null,
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

    // Check for article changes vs stored snapshot (Upgrade #8)
    var _articleChanges = null;
    try {
      _articleChanges = await checkAndUpdateSnapshot(articleData, analysis);
    } catch (snapErr) {
      console.warn("[Spectrum] Snapshot check failed:", snapErr.message);
    }
    if (_articleChanges) {
      analysis._articleChanges = _articleChanges;
    }

    // Attach credibility data to analysis so content script can display it
    if (_credData) {
      analysis._credibilityScore = _credData.score;
      analysis._credibilityFactors = _credData;
    }

    // Attach state media affiliation data (Upgrade #9)
    if (_stateMediaData) {
      analysis._stateAffiliation = _stateMediaData;
    }

    // Attach sentiment deviation from outlet baseline
    var _sentScore = analysis.sentimentAnalysis ? analysis.sentimentAnalysis.overallScore : (typeof analysis.sentimentScore === "number" ? analysis.sentimentScore : null);
    if (_sentScore !== null && typeof getSentimentDeviation === "function") {
      var _sentDev = getSentimentDeviation(_credDomain, _sentScore);
      if (_sentDev) {
        analysis._sentimentDeviation = _sentDev;
      }
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

async function handleVideoChunkAnalysis(tabId, data) {
  var allowed = await canMakeChunkCall();
  if (!allowed) {
    throw new Error("Chunk rate limit reached");
  }
  var installId = await getInstallId();
  var response = await fetch(API_BASE + "/analyzeArticle", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Spectrum-Install-Id": installId },
    body: JSON.stringify({
      mode: "video-chunk",
      chunkSegments: data.chunkSegments,
      videoTitle: data.videoTitle,
      sourceName: data.sourceName,
      sourceLean: data.sourceLean,
      priorContext: data.priorContext || null,
      priorOverlap: data.priorOverlap || null,
      chunkIndex: data.chunkIndex,
      totalChunks: data.totalChunks,
      detectedLanguage: data.detectedLanguage || null,
    }),
  });
  var json = await response.json();
  if (!response.ok) {
    throw new Error("video-chunk failed (" + response.status + "): " + (json.error || "Unknown"));
  }
  return json;
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
  // Generate unique install ID for rate limiting
  chrome.storage.local.get("spectrumInstallId", function (result) {
    if (!result.spectrumInstallId) {
      var id = crypto.randomUUID();
      chrome.storage.local.set({ spectrumInstallId: id });
      console.log("[Spectrum] Generated install ID:", id);
    }
  });
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
