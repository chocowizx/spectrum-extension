(function () {
  "use strict";
  if (window.__spectrumLoaded) {
    try {
      chrome.runtime.sendMessage({ type: "CONTENT_READY", signals: window.__spectrumGatherSignals ? window.__spectrumGatherSignals() : {} }).catch(function () {});
    } catch (e) {}
    return;
  }
  window.__spectrumLoaded = true;

  // Inject keyframes for spinner
  (function () {
    var s = document.createElement("style");
    s.textContent = "@keyframes spectrum-spin{to{transform:rotate(360deg)}}";
    document.head.appendChild(s);
  })();

  // ============================================================
  // DESIGN TOKENS — pastel palette, credible typography
  // ============================================================
  var SEV_COLOR = { high: "#C2716E", medium: "#B8963E", low: "#5E8AB4" };
  var SEV_BG    = { high: "rgba(194,113,110,0.07)", medium: "rgba(184,150,62,0.07)", low: "rgba(94,138,180,0.07)" };
  var SEV_PILL  = { high: "#FECACA", medium: "#FDE68A", low: "#BFDBFE" };
  var SEV_PILL_TEXT = { high: "#991B1B", medium: "#78350F", low: "#1E3A5F" };

  // Type-based colors for verified and neutral claims
  var TYPE_COLOR = { verified: "#4ADE80", neutral: "#94A3B8" };
  var TYPE_BG    = { verified: "rgba(74,222,128,0.07)", neutral: "rgba(148,163,184,0.07)" };
  var TYPE_PILL  = { verified: "#BBF7D0", neutral: "#E2E8F0" };
  var TYPE_PILL_TEXT = { verified: "#166534", neutral: "#475569" };

  function getClaimTypeLabel(claim) {
    var key = "claimType_" + (claim.type || "neutral");
    var label = (typeof L === "function") ? L(key) : (claim.type || "").replace(/_/g, " ");
    return (claim.type === "verified" ? "\u2713 " : "") + label;
  }
  function getClaimColor(claim) { return TYPE_COLOR[claim.type] || SEV_COLOR[claim.severity] || SEV_COLOR.low; }
  function getClaimBg(claim) { return TYPE_BG[claim.type] || SEV_BG[claim.severity] || SEV_BG.low; }
  function getClaimPill(claim) { return TYPE_PILL[claim.type] || SEV_PILL[claim.severity] || SEV_PILL.low; }
  function getClaimPillText(claim) { return TYPE_PILL_TEXT[claim.type] || SEV_PILL_TEXT[claim.severity] || SEV_PILL_TEXT.low; }

  var LEAN_COLORS = {
    farLeft: "#A78BFA", left: "#7CB3E0", centerLeft: "#67B8C4",
    center: "#94A3B8", centerRight: "#D4A84A", right: "#D98282", farRight: "#C06060"
  };
  function getLeanLabel(key) {
    return L("lean_" + key) || key;
  }
  var LEAN_LABELS = {
    farLeft: "Far Left", left: "Left", centerLeft: "Center-Left",
    center: "Center", centerRight: "Center-Right", right: "Right", farRight: "Far Right"
  };

  // Intent classification design tokens (Upgrade #9)
  var INTENT_COLORS = {
    informative: "#4ADE80", advocacy: "#60A5FA", persuasion: "#FBBF24", manipulation: "#F87171"
  };
  var INTENT_BG = {
    informative: "rgba(74,222,128,0.08)", advocacy: "rgba(96,165,250,0.08)",
    persuasion: "rgba(251,191,36,0.08)", manipulation: "rgba(248,113,113,0.08)"
  };
  var INTENT_LABELS = {
    informative: "Informative", advocacy: "Advocacy", persuasion: "Persuasion", manipulation: "Manipulation"
  };

  // Update label objects when language is set (called on ANALYSIS_RESULT / START_CHUNK_SCHEDULER)
  function _updateLabelObjects() {
    if (typeof L !== "function") return;
    LEAN_LABELS.farLeft = L("lean_farLeft"); LEAN_LABELS.left = L("lean_left");
    LEAN_LABELS.centerLeft = L("lean_centerLeft"); LEAN_LABELS.center = L("lean_center");
    LEAN_LABELS.centerRight = L("lean_centerRight"); LEAN_LABELS.right = L("lean_right");
    LEAN_LABELS.farRight = L("lean_farRight");
    INTENT_LABELS.informative = L("intent_informative"); INTENT_LABELS.advocacy = L("intent_advocacy");
    INTENT_LABELS.persuasion = L("intent_persuasion"); INTENT_LABELS.manipulation = L("intent_manipulation");
    COMMENTARY_LABELS.implication = L("commentary_implication"); COMMENTARY_LABELS.scope = L("commentary_scope");
    COMMENTARY_LABELS.relevance = L("commentary_relevance"); COMMENTARY_LABELS.facticity = L("commentary_facticity");
    COMMENTARY_LABELS.controversy = L("commentary_controversy"); COMMENTARY_LABELS.bias = L("commentary_bias");
  }

  // Evidence strength colors (Upgrade #10)
  var EVIDENCE_COLORS = { strong: "#4ADE80", moderate: "#FBBF24", weak: "#F87171" };
  var EVIDENCE_TYPE_ICONS = { supporting: "\u2713", contradicting: "\u2717", contextual: "\u2139" };

  // Video commentary design tokens
  var COMMENTARY_COLORS = {
    implication: "#8B5CF6", scope: "#F59E0B", relevance: "#3B82F6",
    facticity: "#10B981", controversy: "#EF4444", bias: "#EC4899"
  };
  var COMMENTARY_ICONS = {
    implication: "\u2192", scope: "\u2195", relevance: "\u2605",
    facticity: "\u2713", controversy: "\u26A0", bias: "\u25C6"
  };
  var COMMENTARY_LABELS = {
    implication: "Implication", scope: "Scope", relevance: "Relevance",
    facticity: "Facticity", controversy: "Controversy", bias: "Bias"
  };

  var FONT_SERIF = '"Charter","Georgia","Cambria","Times New Roman",serif';
  var FONT_SANS  = '-apple-system,BlinkMacSystemFont,"Segoe UI","Inter","Noto Sans KR","Malgun Gothic","Helvetica Neue",sans-serif';
  var PANEL_BG   = "rgba(255,255,255,0.93)";
  var MARGIN_BG  = "rgba(248,250,252,0.90)";
  var TEXT_HEAD   = "#1E293B";
  var TEXT_BODY   = "#334155";
  var TEXT_MUTED  = "#64748B";
  var TEXT_FAINT  = "#94A3B8";
  var BORDER      = "rgba(0,0,0,0.06)";

  // ============================================================
  // PAGE SIGNAL GATHERING
  // ============================================================
  function gatherPageSignals() {
    var signals = {};
    var ogType = document.querySelector('meta[property="og:type"]');
    signals.ogType = ogType ? ogType.content : null;

    var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < ldScripts.length; i++) {
      try {
        var data = JSON.parse(ldScripts[i].textContent);
        var items = Array.isArray(data) ? data : [data];
        for (var j = 0; j < items.length; j++) {
          if (items[j]["@type"]) {
            var types = Array.isArray(items[j]["@type"]) ? items[j]["@type"] : [items[j]["@type"]];
            for (var k = 0; k < types.length; k++) {
              if (types[k].indexOf("NewsArticle") !== -1) { signals.schemaType = "NewsArticle"; break; }
              if (types[k] === "Article") { signals.schemaType = signals.schemaType || "Article"; }
            }
          }
        }
      } catch (e) {}
    }

    var schemaItem = document.querySelector('[itemtype*="schema.org/NewsArticle"], [itemtype*="schema.org/Article"]');
    if (schemaItem) {
      signals.schemaType = schemaItem.getAttribute("itemtype").indexOf("NewsArticle") !== -1 ? "NewsArticle" : (signals.schemaType || "Article");
    }

    signals.hasArticleTag = !!document.querySelector("article");
    signals.hasByline = !!document.querySelector(".byline, .author, [class*='byline'], [class*='author'], [rel='author']");
    signals.hasDateline = !!document.querySelector("time[datetime], .dateline, [class*='date'], meta[property='article:published_time']");
    signals.hasHeadline = !!document.querySelector("article h1, [role='main'] h1, .headline, .article-title");

    var articleEl = document.querySelector("article, [role='main'], main");
    signals.paragraphCount = articleEl ? articleEl.querySelectorAll("p").length : document.querySelectorAll("p").length;

    var titleText = document.title.toLowerCase();
    var kw = ["breaking","exclusive","report","investigation","opinion","editorial","analysis","politics","election","congress","president","controversy","scandal","protest","crisis","war","economy","immigration","climate","ruling"];
    signals.titleKeywordHits = kw.filter(function (w) { return titleText.indexOf(w) !== -1; }).length;

    if (typeof YouTubeDetector !== "undefined") {
      var yt = YouTubeDetector.getSignals();
      if (yt) Object.assign(signals, yt);
    }
    return signals;
  }
  window.__spectrumGatherSignals = gatherPageSignals;

  // ---- Self-announce ----
  chrome.runtime.sendMessage({ type: "CONTENT_READY", signals: gatherPageSignals() }).catch(function () {});

  // YouTube SPA loads channel metadata late — re-announce after hydration
  if (window.location.hostname.indexOf("youtube.com") !== -1) {
    var __ytRetries = [1500, 3000, 5000];
    __ytRetries.forEach(function (delay) {
      setTimeout(function () {
        var signals = gatherPageSignals();
        if (signals.youtubeChannelId || signals.youtubeChannelName) {
          chrome.runtime.sendMessage({ type: "CONTENT_READY", signals: signals }).catch(function () {});
        }
      }, delay);
    });
  }

  // ---- Message listener ----
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.type) {
      case "CHECK_PAGE":
        sendResponse({ signals: gatherPageSignals() });
        break;
      case "NEWS_DETECTED":
        handleNewsDetected(message.detection);
        sendResponse({ ok: true });
        break;
      case "ANALYSIS_RESULT":
        console.log("[Spectrum:DEBUG] >>> ANALYSIS_RESULT received", message.analysis?.isFrontPage ? "(FRONT PAGE)" : "(article)");
        removeHighlights();
        __lastAnalysis = message.analysis;
        if (message.analysis && message.analysis.detectedLanguage) {
          __spectrumLang = message.analysis.detectedLanguage;
          _updateLabelObjects();
        }
        if (message.analysis && message.analysis.isFrontPage) {
          injectFrontPagePanel(message.analysis);
        } else {
          injectInlineAnnotations(message.analysis);
        }
        sendResponse({ ok: true });
        break;
      case "ANALYSIS_ERROR":
        if (message.error && message.error.startsWith("RATE_LIMIT:")) {
          var parts = message.error.split(":");
          var rateLimitMsg = parts[1] || "Daily analysis limit reached";
          showFloatingBadge(rateLimitMsg, "#F59E0B", null);
        } else {
          showFloatingBadge(L("status_unavailable"), "#94A3B8", null);
        }
        sendResponse({ ok: true });
        break;
      case "SETTINGS_CHANGED":
        if (message.settings && message.settings.enabled === false) {
          removeHighlights();
          removeFloatingBadge();
        }
        sendResponse({ ok: true });
        break;
      case "START_CHUNK_SCHEDULER":
        console.log("[Spectrum:DEBUG] >>> START_CHUNK_SCHEDULER received!");
        removeHighlights();
        __lastArticleData = message.articleData;
        if (message.articleData && message.articleData.detectedLanguage) {
          __spectrumLang = message.articleData.detectedLanguage;
          _updateLabelObjects();
        }
        __videoSegments = (message.articleData.transcript && message.articleData.transcript.segments) ? message.articleData.transcript.segments : null;
        if (__videoSegments && __videoSegments.length > 0) {
          showFloatingBadge(L("status_liveAnalysis"), "#8B5CF6", null);
          injectVideoOverlayInstant(message.articleData, message.sourceLean, message.sourceName);
          VideoPlaybackTracker.init(__videoSegments);
          ChunkScheduler.init(message.articleData, message.sourceLean || "", message.sourceName || "");
        }
        sendResponse({ ok: true });
        break;
      case "VIDEO_CHUNK_RESULT":
        ChunkScheduler.handleChunkResult(message.chunkIndex, message.analysis);
        sendResponse({ ok: true });
        break;
      case "VIDEO_CHUNK_ERROR":
        ChunkScheduler.handleChunkError(message.chunkIndex, message.error);
        sendResponse({ ok: true });
        break;
      case "SPECTRUM_LOG":
        console.log(message.msg);
        sendResponse({ ok: true });
        break;
      default:
        sendResponse({ ok: true });
    }
  });

  // ---- News detected → extract → send ----
  var __lastArticleData = null;
  var __lastAnalysis = null;
  var __videoSegments = null;
  var __videoEvents = [];

  async function handleNewsDetected(detection) {
    showFloatingBadge(L("status_analyzing"), "#B8963E", detection);

    var isYouTube = window.location.hostname.indexOf("youtube.com") !== -1;

    // === Front page detection ===
    if (!isYouTube && typeof ArticleExtractor !== "undefined" && ArticleExtractor.isFrontPage()) {
      var frontPageData = ArticleExtractor.extractFrontPage();
      if (frontPageData.headlineCount >= 3) {
        showFloatingBadge(L("status_frontPageAnalyzing"), "#8B5CF6", detection);
        console.log("[Spectrum:DEBUG] Sending FRONT_PAGE_DATA —", frontPageData.headlineCount, "headlines from", frontPageData.domain);
        chrome.runtime.sendMessage({ type: "FRONT_PAGE_DATA", data: frontPageData }).catch(function () {});
        return;
      }
    }

    // === Article extraction ===
    var articleData;
    if (isYouTube && typeof ArticleExtractor !== "undefined") {
      articleData = await ArticleExtractor.extractYouTube();
      // YouTube SPA: description may not be ready — retry for content only (not transcript)
      // Transcript is recovered by service worker via MAIN world fetch (has YouTube cookies)
      var _ytRetries = 0;
      while (articleData.wordCount < 50 && _ytRetries < 3) {
        _ytRetries++;
        await new Promise(function (r) { setTimeout(r, 2000 * _ytRetries); });
        articleData = await ArticleExtractor.extractYouTube();
      }
    } else if (typeof ArticleExtractor !== "undefined") {
      articleData = await ArticleExtractor.extract();
    } else { return; }

    // YouTube: lower threshold since transcript (the main content) is recovered by service worker
    var minWords = isYouTube ? 10 : 50;
    if (articleData.wordCount < minWords) {
      showFloatingBadge(L("status_tooShort"), "#94A3B8", detection);
      return;
    }
    __lastArticleData = articleData;
    __videoSegments = (isYouTube && articleData.transcript && articleData.transcript.segments) ? articleData.transcript.segments : null;
    console.log("[Spectrum:DEBUG] Sending ARTICLE_DATA — isYouTube:", !!articleData.isYouTube,
      "hasTranscript:", !!articleData.transcript,
      "segCount:", __videoSegments ? __videoSegments.length : 0,
      "wordCount:", articleData.wordCount);
    chrome.runtime.sendMessage({ type: "ARTICLE_DATA", data: articleData }).catch(function () {});
  }

  // ============================================================
  // FRONT PAGE PANEL
  // ============================================================
  function injectFrontPagePanel(analysis) {
    var isKo = __spectrumLang === "ko";
    var lean = analysis.overallLean || "unknown";
    var leanColor = LEAN_COLORS[lean] || "#64748B";
    var selectionScore = analysis.selectionBiasScore || 0;
    var demoScore = analysis.democraticHealthScore || 0;

    // Score color
    var selColor = selectionScore > 60 ? "#EF4444" : selectionScore > 30 ? "#F59E0B" : "#22C55E";
    var demoColor = demoScore >= 70 ? "#22C55E" : demoScore >= 40 ? "#F59E0B" : "#EF4444";

    // Build headline analysis rows
    var headlineRows = (analysis.headlineAnalysis || []).map(function(h) {
      var fColor = h.framingType === "neutral" ? "#22C55E" : h.framingType === "loaded" || h.framingType === "sensational" ? "#EF4444" : h.framingType === "hostile" ? "#DC2626" : h.framingType === "sympathetic" ? "#3B82F6" : "#64748B";
      return '<div style="padding:8px 0;border-bottom:1px solid ' + BORDER + '">' +
        '<div style="display:flex;gap:8px;align-items:baseline">' +
          '<span style="color:' + TEXT_MUTED + ';font-size:11px;min-width:20px">#' + h.position + '</span>' +
          '<span style="font-size:13px;color:' + TEXT_BODY + '">' + escapeHtml(h.headline) + '</span>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:4px;margin-left:28px">' +
          '<span style="font-size:11px;padding:1px 6px;border-radius:3px;background:' + fColor + '20;color:' + fColor + '">' + h.framingType + '</span>' +
          '<span style="font-size:11px;color:' + TEXT_MUTED + '">' + escapeHtml(h.explanation || "") + '</span>' +
        '</div>' +
      '</div>';
    }).join("");

    // Omissions
    var omissionRows = (analysis.omissions || []).map(function(o) {
      return '<div style="padding:6px 0;border-bottom:1px solid ' + BORDER + '">' +
        '<div style="font-size:13px;color:' + TEXT_BODY + ';font-weight:500">' + escapeHtml(o.topic) + '</div>' +
        '<div style="font-size:11px;color:' + TEXT_MUTED + ';margin-top:2px">' + escapeHtml(o.significance || "") + '</div>' +
      '</div>';
    }).join("") || '<div style="font-size:12px;color:' + TEXT_MUTED + '">(' + (isKo ? "특이한 누락 없음" : "No notable omissions") + ')</div>';

    // Editorial patterns
    var patternRows = (analysis.editorialPatterns || []).map(function(p) {
      var sevColor = p.severity === "high" ? "#EF4444" : p.severity === "medium" ? "#F59E0B" : "#22C55E";
      return '<div style="padding:6px 0;border-bottom:1px solid ' + BORDER + '">' +
        '<div style="display:flex;gap:6px;align-items:center">' +
          '<span style="font-size:11px;padding:1px 6px;border-radius:3px;background:' + sevColor + '20;color:' + sevColor + '">' + p.severity + '</span>' +
          '<span style="font-size:13px;color:' + TEXT_BODY + ';font-weight:500">' + escapeHtml(p.pattern) + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:' + TEXT_MUTED + ';margin-top:2px">' + escapeHtml(p.evidence || "") + '</div>' +
      '</div>';
    }).join("");

    // Prominence bias
    var promBias = analysis.prominenceBias || {};

    // Party balance
    var partyBal = analysis.partyBalance || {};

    var panel = document.createElement("div");
    panel.id = "spectrum-frontpage-panel";
    panel.style.cssText = "position:fixed;top:72px;right:16px;width:380px;max-height:calc(100vh - 100px);" +
      "overflow-y:auto;background:" + PANEL_BG + ";border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);" +
      "z-index:2147483640;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:0;border:1px solid " + BORDER + ";";

    panel.innerHTML =
      // Header
      '<div style="padding:16px 20px;border-bottom:1px solid ' + BORDER + ';display:flex;justify-content:space-between;align-items:center">' +
        '<div>' +
          '<div style="font-size:15px;font-weight:600;color:' + TEXT_HEAD + '">' +
            '<span style="margin-right:6px">📰</span>' + (isKo ? "1면 편집 분석" : "Front Page Analysis") +
          '</div>' +
          '<div style="font-size:12px;color:' + TEXT_MUTED + ';margin-top:2px">' + escapeHtml(analysis.source || "") + '</div>' +
        '</div>' +
        '<div style="cursor:pointer;font-size:18px;color:' + TEXT_MUTED + '" id="spectrum-fp-close">✕</div>' +
      '</div>' +

      // Score cards
      '<div style="padding:12px 20px;display:flex;gap:10px">' +
        '<div style="flex:1;background:' + leanColor + '10;border:1px solid ' + leanColor + '30;border-radius:8px;padding:10px;text-align:center">' +
          '<div style="font-size:11px;color:' + TEXT_MUTED + '">' + (isKo ? "편향" : "Lean") + '</div>' +
          '<div style="font-size:14px;font-weight:600;color:' + leanColor + '">' + lean + '</div>' +
        '</div>' +
        '<div style="flex:1;background:' + selColor + '10;border:1px solid ' + selColor + '30;border-radius:8px;padding:10px;text-align:center">' +
          '<div style="font-size:11px;color:' + TEXT_MUTED + '">' + (isKo ? "선택 편향" : "Selection Bias") + '</div>' +
          '<div style="font-size:18px;font-weight:700;color:' + selColor + '">' + selectionScore + '</div>' +
        '</div>' +
        '<div style="flex:1;background:' + demoColor + '10;border:1px solid ' + demoColor + '30;border-radius:8px;padding:10px;text-align:center">' +
          '<div style="font-size:11px;color:' + TEXT_MUTED + '">' + (isKo ? "민주 건강" : "Civic Health") + '</div>' +
          '<div style="font-size:18px;font-weight:700;color:' + demoColor + '">' + demoScore + '</div>' +
        '</div>' +
      '</div>' +

      // Summary
      '<div style="padding:8px 20px 12px">' +
        '<div style="font-size:13px;color:' + TEXT_BODY + ';line-height:1.5">' + escapeHtml(analysis.summary || "") + '</div>' +
      '</div>' +

      // Prominence Bias
      (promBias.explanation ? '<div style="padding:8px 20px 12px;border-top:1px solid ' + BORDER + '">' +
        '<div style="font-size:12px;font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:6px">' + (isKo ? "⬆ 강조/⬇ 축소된 주제" : "⬆ Elevated / ⬇ Buried") + '</div>' +
        (promBias.elevatedTopics && promBias.elevatedTopics.length ? '<div style="font-size:12px;color:#EF4444;margin-bottom:4px">⬆ ' + promBias.elevatedTopics.map(escapeHtml).join(", ") + '</div>' : "") +
        (promBias.buriedTopics && promBias.buriedTopics.length ? '<div style="font-size:12px;color:#64748B;margin-bottom:4px">⬇ ' + promBias.buriedTopics.map(escapeHtml).join(", ") + '</div>' : "") +
        '<div style="font-size:11px;color:' + TEXT_MUTED + '">' + escapeHtml(promBias.explanation) + '</div>' +
      '</div>' : "") +

      // Party Balance
      (partyBal.assessment ? '<div style="padding:8px 20px 12px;border-top:1px solid ' + BORDER + '">' +
        '<div style="font-size:12px;font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:6px">' + (isKo ? "정당 균형" : "Party Balance") + '</div>' +
        '<div style="font-size:11px;color:' + TEXT_MUTED + '">' + escapeHtml(partyBal.assessment) + '</div>' +
      '</div>' : "") +

      // Headline Analysis
      (headlineRows ? '<div style="padding:8px 20px 12px;border-top:1px solid ' + BORDER + '">' +
        '<div style="font-size:12px;font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:6px">' + (isKo ? "헤드라인 프레이밍" : "Headline Framing") + '</div>' +
        headlineRows +
      '</div>' : "") +

      // Omissions
      '<div style="padding:8px 20px 12px;border-top:1px solid ' + BORDER + '">' +
        '<div style="font-size:12px;font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:6px">' + (isKo ? "🔍 누락된 주제" : "🔍 Notable Omissions") + '</div>' +
        omissionRows +
      '</div>' +

      // Cross-Outlet Missing Stories
      (analysis.crossOutletMissing && analysis.crossOutletMissing.length ?
        '<div style="padding:8px 20px 12px;border-top:1px solid ' + BORDER + '">' +
          '<div style="font-size:12px;font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:6px">' + (isKo ? "🌐 타 매체 보도 중인 누락 기사" : "🌐 Stories Other Outlets Are Covering") + '</div>' +
          analysis.crossOutletMissing.map(function(s) {
            var catColor = s.category === "politics" ? "#3B82F6" : s.category === "economy" ? "#F59E0B" : s.category === "international" ? "#8B5CF6" : s.category === "science" ? "#22C55E" : "#64748B";
            return '<div style="padding:6px 0;border-bottom:1px solid ' + BORDER + '">' +
              '<div style="display:flex;gap:6px;align-items:center;margin-bottom:2px">' +
                '<span style="font-size:11px;padding:1px 6px;border-radius:3px;background:' + catColor + '20;color:' + catColor + '">' + escapeHtml(s.category || "other") + '</span>' +
                '<span style="font-size:13px;color:' + TEXT_BODY + ';font-weight:500">' + escapeHtml(s.topic) + '</span>' +
              '</div>' +
              '<div style="font-size:11px;color:' + TEXT_MUTED + ';margin-top:2px">' +
                (isKo ? s.coveredCount + "개 매체 보도 중" : "Covered by " + s.coveredCount + " outlets") +
                (s.coveredBy && s.coveredBy.length ? " — " + s.coveredBy.slice(0, 3).map(function(c) { return escapeHtml(c.source || c); }).join(", ") : "") +
              '</div>' +
            '</div>';
          }).join("") +
        '</div>'
      : "") +

      // Editorial Patterns
      (patternRows ? '<div style="padding:8px 20px 12px;border-top:1px solid ' + BORDER + '">' +
        '<div style="font-size:12px;font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:6px">' + (isKo ? "편집 패턴" : "Editorial Patterns") + '</div>' +
        patternRows +
      '</div>' : "") +

      // Democratic health explanation
      (analysis.democraticHealthExplanation ? '<div style="padding:12px 20px;border-top:1px solid ' + BORDER + ';background:rgba(0,0,0,0.02)">' +
        '<div style="font-size:11px;color:' + TEXT_MUTED + ';line-height:1.5">' + escapeHtml(analysis.democraticHealthExplanation) + '</div>' +
      '</div>' : "");

    // Remove any existing panel
    var existing = document.getElementById("spectrum-frontpage-panel");
    if (existing) existing.remove();

    document.body.appendChild(panel);

    // Update badge
    showFloatingBadge(L("status_frontPage"), leanColor, null);

    // Close button
    document.getElementById("spectrum-fp-close").addEventListener("click", function() {
      panel.remove();
    });

    // Add feedback flag buttons
    addFlagButtonsToFrontPage(panel);
  }

  // ============================================================
  // ARTICLE CHANGE BANNER (Upgrade #8 — Narrative Tracking)
  // ============================================================

  function formatChangeDate(ts) {
    if (!ts) return "unknown date";
    try {
      return new Date(ts).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch (e) { return "unknown date"; }
  }

  var LEAN_LABELS_SHORT = {
    farLeft: "Far Left", left: "Left", centerLeft: "Center-Left",
    center: "Center", centerRight: "Center-Right", right: "Right", farRight: "Far Right"
  };

  function renderArticleChangeBanner(changes) {
    var existing = document.getElementById("spectrum-change-banner");
    if (existing) existing.remove();
    if (!changes || !changes.detected || !changes.detected.length) return;

    var lines = [];
    for (var i = 0; i < changes.detected.length; i++) {
      var c = changes.detected[i];
      if (c.type === "headline") {
        lines.push("\u2022 Headline changed: \u201C" + c.old + "\u201D \u2192 \u201C" + c.current + "\u201D");
      } else if (c.type === "content") {
        lines.push("\u2022 Content updated since " + formatChangeDate(c.since));
      } else if (c.type === "lean") {
        var oldLabel = LEAN_LABELS_SHORT[c.old] || c.old;
        var newLabel = LEAN_LABELS_SHORT[c.current] || c.current;
        lines.push("\u2022 Bias shift detected: " + oldLabel + " \u2192 " + newLabel);
      }
    }

    var banner = document.createElement("div");
    banner.id = "spectrum-change-banner";
    banner.style.cssText = [
      "position:fixed",
      "top:12px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:2147483646",
      "background:#1C1A10",
      "border:1px solid #D4A84A",
      "border-radius:8px",
      "padding:10px 16px",
      "max-width:520px",
      "width:calc(100% - 48px)",
      "box-shadow:0 4px 20px rgba(0,0,0,0.45)",
      "font-family:" + FONT_SANS,
      "font-size:12px",
      "color:#F5DFA0",
      "line-height:1.6",
      "cursor:default",
    ].join(";");

    var header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;";
    var title = document.createElement("span");
    title.style.cssText = "font-weight:700;font-size:13px;color:#F5DFA0;display:flex;align-items:center;gap:6px;";
    title.innerHTML = "\u26A0\uFE0F Article Changed";
    var close = document.createElement("button");
    close.style.cssText = "background:none;border:none;color:#D4A84A;cursor:pointer;font-size:16px;padding:0;line-height:1;";
    close.textContent = "\u00D7";
    close.addEventListener("click", function () { banner.remove(); });
    header.appendChild(title);
    header.appendChild(close);
    banner.appendChild(header);

    if (changes.originalTimestamp) {
      var sub = document.createElement("div");
      sub.style.cssText = "font-size:11px;color:#9A8B5A;margin-bottom:6px;";
      sub.textContent = "First seen: " + formatChangeDate(changes.originalTimestamp);
      banner.appendChild(sub);
    }

    var body = document.createElement("div");
    body.style.cssText = "color:#D4C98A;";
    body.textContent = lines.join("\n");
    banner.appendChild(body);

    document.body.appendChild(banner);

    // Auto-dismiss after 12 seconds
    setTimeout(function () { if (banner.parentNode) banner.remove(); }, 12000);
  }

  // ============================================================
  // INLINE ANNOTATIONS
  // ============================================================
  var marginNotes = []; // track for sidebar

  function injectInlineAnnotations(analysis) {
    var claims = analysis.claims || [];
    var biasIndicators = analysis.biasIndicators || [];
    var lean = analysis.overallLean || "unknown";
    marginNotes = [];

    var countText = claims.length + (__spectrumLang === "ko" ? L("counter_flaggedClaims") : (" claim" + (claims.length !== 1 ? "s" : "") + " identified"));
    showFloatingBadge(countText, claims.length > 0 ? "#B8963E" : "#5E8AB4", { sourceLean: { lean: lean.replace(/[- ]/g, ""), name: "" } });

    // YouTube with timestamps → video sidebar with live tracking
    if (__lastArticleData && __lastArticleData.isYouTube && __videoSegments && __videoSegments.length > 0) {
      injectVideoOverlay(analysis, __videoSegments);
      VideoPlaybackTracker.init(__videoSegments);

      // Still inject bias/hidden bias below video description if present
      var ytDescEl = document.querySelector("#description, ytd-text-inline-expander, #content.ytd-expander");
      if (ytDescEl) {
        if (biasIndicators.length > 0) injectBiasNotes(biasIndicators, ytDescEl);
        var unverbalizedBiases = analysis.unverbalizedBiases || [];
        if (unverbalizedBiases.length > 0) injectUnverbalizedBiases(unverbalizedBiases, ytDescEl);
        var softBiasIndicators = analysis.softBiasIndicators || [];
        if (softBiasIndicators.length > 0) injectSoftBiasIndicators(softBiasIndicators, ytDescEl);
      }
      return;
    }

    injectAnalysisSidebar(analysis);

    // Show change alert banner if article has been modified since last visit (Upgrade #8)
    if (analysis._articleChanges) {
      renderArticleChangeBanner(analysis._articleChanges);
    }

    var articleEl = document.querySelector("article, [role='main'], main, .article-body, .story-body, .post-content");
    if (!articleEl) articleEl = document.body;
    var paragraphs = articleEl.querySelectorAll("p");

    claims.forEach(function (claim, index) {
      if (!claim.sentence) return;
      var searchText = claim.sentence.length > 80 ? claim.sentence.slice(0, 80) : claim.sentence;

      for (var i = 0; i < paragraphs.length; i++) {
        var p = paragraphs[i];
        if (p.textContent.indexOf(searchText) === -1) continue;

        var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
        var accumulated = "";
        var node;
        while ((node = walker.nextNode())) {
          var prevLen = accumulated.length;
          accumulated += node.textContent;
          if (accumulated.indexOf(searchText) >= prevLen) {
            try {
              var wrapper = document.createElement("span");
              wrapper.className = "spectrum-hl";
              wrapper.dataset.idx = index;
              var hlBorderStyle = (claim.type === "verified" || claim.type === "neutral") ? "dashed" : "solid";
              wrapper.style.cssText =
                "background:" + getClaimBg(claim) + ";" +
                "border-bottom:2px " + hlBorderStyle + " " + getClaimColor(claim) + ";" +
                "cursor:pointer;border-radius:2px;padding:1px 0;" +
                "transition:background .2s ease;";
              var range = document.createRange();
              range.selectNodeContents(node);
              range.surroundContents(wrapper);
              attachClaimInteraction(wrapper, claim, index);
              marginNotes.push({ wrapper: wrapper, claim: claim, index: index });
            } catch (e) {
              node.parentElement.style.borderBottom = "2px solid " + getClaimColor(claim);
            }
            break;
          }
        }
        break;
      }
    });

    if (biasIndicators.length > 0) {
      injectBiasNotes(biasIndicators, articleEl);
    }

    // Unverbalized biases section (Upgrade #8)
    var unverbalizedBiases = analysis.unverbalizedBiases || [];
    if (unverbalizedBiases.length > 0) {
      injectUnverbalizedBiases(unverbalizedBiases, articleEl);
    }

    // Soft bias indicators section (Upgrade #6)
    var softBiasIndicators = analysis.softBiasIndicators || [];
    if (softBiasIndicators.length > 0) {
      injectSoftBiasIndicators(softBiasIndicators, articleEl);
    }

    // Polarization drivers (if present)
    var polDrivers = analysis.polarizationDrivers || [];
    if (polDrivers.length > 0 && (analysis.polarizationIntensity || 0) > 40) {
      injectPolarizationDrivers(polDrivers, analysis.polarizationIntensity, articleEl);
    }

    // Build sidebar margin notes
    buildMarginSidebar(articleEl);
  }

  // ============================================================
  // INLINE NOTE CARDS — compact cards after each highlighted paragraph
  // ============================================================
  function buildMarginSidebar(articleEl) {
    // Remove any previous inline notes
    document.querySelectorAll(".spectrum-inline-note").forEach(function (n) { n.remove(); });
    if (marginNotes.length === 0) return;

    // Track which paragraphs already have notes to avoid duplicates
    var seenParagraphs = new Map();

    marginNotes.forEach(function (note) {
      var hl = note.wrapper;
      var claim = note.claim;
      var color = getClaimColor(claim);
      var pillBg = getClaimPill(claim);
      var pillText = getClaimPillText(claim);
      var typeLabel = getClaimTypeLabel(claim);
      var sevLabel = (claim.severity || "").charAt(0).toUpperCase() + (claim.severity || "").slice(1);
      var panelBorderStyle = (claim.type === "verified" || claim.type === "neutral") ? "dashed" : "solid";
      var explainText = (claim.explanation || "");

      // Find the parent paragraph
      var parentP = hl.closest("p");
      if (!parentP) return;

      // Create inline note card
      var card = document.createElement("div");
      card.className = "spectrum-inline-note";
      card.style.cssText =
        "margin:4px 0 10px;padding:7px 12px;border-radius:6px;" +
        "background:" + PANEL_BG + ";backdrop-filter:blur(8px);" +
        "border:1px solid " + BORDER + ";border-left:3px " + panelBorderStyle + " " + color + ";" +
        "box-shadow:0 1px 4px rgba(0,0,0,.04);" +
        "font-family:" + FONT_SANS + ";cursor:pointer;" +
        "transition:box-shadow .15s;";

      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">' +
          '<span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;' +
            'font-weight:600;text-transform:uppercase;letter-spacing:.4px;' +
            'background:' + pillBg + ';color:' + pillText + ';">' + escapeHtml(typeLabel) + '</span>' +
          (sevLabel ? '<span style="font-size:9px;color:' + TEXT_FAINT + ';">' + sevLabel + '</span>' : '') +
        '</div>' +
        '<div style="font-size:12px;color:' + TEXT_MUTED + ';line-height:1.45;font-family:' + FONT_SERIF + ';">' +
          escapeHtml(explainText) +
        '</div>';

      card.addEventListener("mouseenter", function () {
        card.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)";
        hl.style.background = getClaimBg(claim).replace("0.07", "0.18");
      });
      card.addEventListener("mouseleave", function () {
        card.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)";
        hl.style.background = getClaimBg(claim);
      });
      card.addEventListener("click", function () {
        hl.click();
      });

      // Insert after the paragraph (or after the last note for this paragraph)
      if (seenParagraphs.has(parentP)) {
        var lastNote = seenParagraphs.get(parentP);
        lastNote.insertAdjacentElement("afterend", card);
      } else if (parentP.nextSibling) {
        parentP.parentNode.insertBefore(card, parentP.nextSibling);
      } else {
        parentP.parentNode.appendChild(card);
      }
      seenParagraphs.set(parentP, card);
    });
  }

  // ============================================================
  // FLOATING CLAIM BUBBLE — concise, positioned next to highlight
  // ============================================================
  var _bubbleScrollHandler = null;
  var _bubbleClickOutHandler = null;

  function dismissBubble() {
    var b = document.getElementById("spectrum-claim-bubble");
    if (b) {
      b.style.opacity = "0";
      b.style.transform = "scale(.96)";
      setTimeout(function () { if (b.parentNode) b.remove(); }, 180);
    }
    if (_bubbleScrollHandler) {
      window.removeEventListener("scroll", _bubbleScrollHandler, true);
      _bubbleScrollHandler = null;
    }
    if (_bubbleClickOutHandler) {
      document.removeEventListener("mousedown", _bubbleClickOutHandler, true);
      _bubbleClickOutHandler = null;
    }
  }

  function positionBubble(bubble, wrapper) {
    var rect = wrapper.getBoundingClientRect();
    var bw = 330; // bubble width
    var gap = 10;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var left, top, arrowSide;

    // Try right of highlight
    if (rect.right + gap + bw + 12 < vw) {
      left = rect.right + gap;
      top = rect.top + rect.height / 2 - 40;
      arrowSide = "left";
    // Try left of highlight
    } else if (rect.left - gap - bw - 12 > 0) {
      left = rect.left - gap - bw;
      top = rect.top + rect.height / 2 - 40;
      arrowSide = "right";
    // Fall back to below
    } else {
      left = Math.max(12, Math.min(rect.left, vw - bw - 12));
      top = rect.bottom + gap;
      arrowSide = "top";
    }

    // Clamp vertical
    if (top < 12) top = 12;
    var bh = bubble.offsetHeight || 200;
    if (top + bh > vh - 12) top = vh - bh - 12;

    bubble.style.left = left + "px";
    bubble.style.top = top + "px";

    // Position arrow
    var arrow = bubble.querySelector(".spectrum-bubble-arrow");
    if (!arrow) return;

    // Reset
    arrow.style.cssText = "position:absolute;width:0;height:0;";
    if (arrowSide === "left") {
      var arrowTop = Math.max(12, Math.min(rect.top + rect.height / 2 - top - 6, bh - 18));
      arrow.style.left = "-6px";
      arrow.style.top = arrowTop + "px";
      arrow.style.borderTop = "6px solid transparent";
      arrow.style.borderBottom = "6px solid transparent";
      arrow.style.borderRight = "6px solid rgba(255,255,255,0.95)";
    } else if (arrowSide === "right") {
      var arrowTop2 = Math.max(12, Math.min(rect.top + rect.height / 2 - top - 6, bh - 18));
      arrow.style.right = "-6px";
      arrow.style.top = arrowTop2 + "px";
      arrow.style.borderTop = "6px solid transparent";
      arrow.style.borderBottom = "6px solid transparent";
      arrow.style.borderLeft = "6px solid rgba(255,255,255,0.95)";
    } else {
      arrow.style.top = "-6px";
      var arrowLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - left - 6, bw - 24));
      arrow.style.left = arrowLeft + "px";
      arrow.style.borderLeft = "6px solid transparent";
      arrow.style.borderRight = "6px solid transparent";
      arrow.style.borderBottom = "6px solid rgba(255,255,255,0.95)";
    }
  }

  function showClaimBubble(wrapper, claim, index) {
    var color = getClaimColor(claim);
    var pillBg = getClaimPill(claim);
    var pillText = getClaimPillText(claim);
    var typeLabel = getClaimTypeLabel(claim);
    var sevLabel = (claim.severity || "").charAt(0).toUpperCase() + (claim.severity || "").slice(1);
    var panelBorderStyle = (claim.type === "verified" || claim.type === "neutral") ? "dashed" : "solid";

    var bubble = document.createElement("div");
    bubble.id = "spectrum-claim-bubble";
    bubble.dataset.idx = String(index);
    bubble.style.cssText =
      "position:fixed;z-index:2147483645;width:330px;" +
      "background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);color:" + TEXT_BODY + ";" +
      "padding:14px 16px;border-radius:10px;font-family:" + FONT_SANS + ";" +
      "border:1px solid " + BORDER + ";border-left:3px " + panelBorderStyle + " " + color + ";" +
      "box-shadow:0 8px 32px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.06);" +
      "opacity:0;transform:scale(.96);transition:opacity .18s ease,transform .18s ease;";

    // Arrow
    var arrow = document.createElement("div");
    arrow.className = "spectrum-bubble-arrow";
    bubble.appendChild(arrow);

    // Header: type + severity + close
    var headerHtml =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;' +
            'font-weight:600;text-transform:uppercase;letter-spacing:.5px;' +
            'background:' + pillBg + ';color:' + pillText + ';">' + escapeHtml(typeLabel) + '</span>' +
          '<span style="font-size:10px;color:' + TEXT_FAINT + ';">' + sevLabel + '</span>' +
        '</div>' +
        '<span class="spectrum-bubble-x" style="cursor:pointer;color:' + TEXT_FAINT + ';font-size:14px;' +
          'line-height:1;padding:2px 6px;border-radius:3px;transition:background .15s;">\u00D7</span>' +
      '</div>';

    // Check-worthiness bar (Upgrade #5)
    var cwHtml = "";
    if (typeof claim.checkWorthiness === "number") {
      var cwScore = claim.checkWorthiness;
      var cwColor = cwScore >= 80 ? "#F87171" : cwScore >= 50 ? "#FBBF24" : "#4ADE80";
      var cwLabel = cwScore >= 80 ? L("checkWorth_high") : cwScore >= 50 ? L("checkWorth_mid") : L("checkWorth_low");
      var cwPriority = claim.checkPriority || (cwScore >= 80 ? "urgent" : cwScore >= 50 ? "recommended" : "optional");
      var cwPriorityColor = { urgent: "#F87171", recommended: "#FBBF24", optional: "#94A3B8" }[cwPriority] || "#94A3B8";
      var cwPriorityBg = { urgent: "rgba(248,113,113,0.12)", recommended: "rgba(251,191,36,0.12)", optional: "rgba(148,163,184,0.1)" }[cwPriority] || "rgba(148,163,184,0.1)";
      // Build sub-score tooltip title
      var cwTooltipParts = [];
      if (typeof claim.verifiability === "number") cwTooltipParts.push("Verifiability: " + claim.verifiability);
      if (typeof claim.publicImpact === "number") cwTooltipParts.push("Public impact: " + claim.publicImpact);
      if (typeof claim.potentialHarm === "number") cwTooltipParts.push("Potential harm: " + claim.potentialHarm);
      var cwTooltip = cwTooltipParts.length ? cwTooltipParts.join(" \u00B7 ") : "";
      cwHtml =
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"' + (cwTooltip ? ' title="' + escapeHtml(cwTooltip) + '"' : '') + '>' +
          '<span style="font-size:9px;color:' + TEXT_FAINT + ';white-space:nowrap;">Check-worthy</span>' +
          '<div style="flex:1;height:3px;border-radius:2px;background:rgba(0,0,0,.06);max-width:80px;">' +
            '<div style="height:100%;width:' + cwScore + '%;border-radius:2px;background:' + cwColor + ';"></div>' +
          '</div>' +
          '<span style="font-size:9px;color:' + cwColor + ';font-weight:600;">' + cwScore + '</span>' +
          '<span style="padding:1px 5px;border-radius:3px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;' +
            'background:' + cwPriorityBg + ';color:' + cwPriorityColor + ';">' + cwPriority + '</span>' +
        '</div>';
    }

    // Explanation
    var explanationHtml = '<div style="font-size:13px;color:' + TEXT_BODY + ';line-height:1.55;' +
      'font-family:' + FONT_SERIF + ';">' + escapeHtml(claim.explanation || "") + '</div>';

    // Compact summary: source count, data points, gaps
    var srcCount = (claim.sources || []).length;
    var dpCount = (claim.dataPoints || []).length;
    var gapCount = (claim.informationGaps || []).length;
    var statsHtml = "";
    if (srcCount || dpCount || gapCount) {
      var parts = [];
      if (srcCount) parts.push(srcCount + " source" + (srcCount > 1 ? "s" : ""));
      if (dpCount) parts.push(dpCount + " data point" + (dpCount > 1 ? "s" : ""));
      if (gapCount) parts.push(gapCount + " gap" + (gapCount > 1 ? "s" : ""));
      statsHtml = '<div style="margin-top:8px;font-size:10px;color:' + TEXT_FAINT + ';">' +
        parts.join(" \u00B7 ") + '</div>';
    }

    // Action buttons
    var btnRowHtml =
      '<div style="margin-top:10px;padding-top:8px;border-top:1px solid ' + BORDER + ';display:flex;gap:6px;">' +
        '<button class="spectrum-bubble-expand" style="' +
          'flex:1;display:flex;align-items:center;justify-content:center;gap:5px;' +
          'background:rgba(0,0,0,.03);border:1px solid ' + BORDER + ';border-radius:6px;' +
          'color:' + TEXT_BODY + ';padding:7px 10px;cursor:pointer;font-size:11px;font-weight:600;' +
          'font-family:' + FONT_SANS + ';transition:all .15s;' +
        '">' + L("btn_viewDetails") + '</button>' +
        '<button class="spectrum-bubble-deep" style="' +
          'flex:1;display:flex;align-items:center;justify-content:center;gap:5px;' +
          'background:linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06));' +
          'border:1px solid rgba(99,102,241,0.15);border-radius:6px;color:#818CF8;' +
          'padding:7px 10px;cursor:pointer;font-size:11px;font-weight:600;' +
          'font-family:' + FONT_SANS + ';letter-spacing:.3px;transition:all .15s;' +
        '">' + L("btn_deepAnalysis") + '</button>' +
      '</div>';

    // Assemble content (insert before arrow)
    var content = document.createElement("div");
    content.innerHTML = headerHtml + cwHtml + explanationHtml + statsHtml + btnRowHtml;
    bubble.insertBefore(content, arrow);

    document.body.appendChild(bubble);

    // Position then fade in
    positionBubble(bubble, wrapper);
    requestAnimationFrame(function () {
      bubble.style.opacity = "1";
      bubble.style.transform = "scale(1)";
    });

    // Close button
    bubble.querySelector(".spectrum-bubble-x").addEventListener("click", function (ev) {
      ev.stopPropagation();
      dismissBubble();
    });

    // Deep Analysis button
    bubble.querySelector(".spectrum-bubble-deep").addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (!__lastArticleData) return;
      chrome.runtime.sendMessage({
        type: "OPEN_DEEP_ANALYSIS",
        data: {
          articleText: __lastArticleData.text,
          articleUrl: __lastArticleData.url || window.location.href,
          articleTitle: __lastArticleData.title || document.title,
          sourceDomain: __lastArticleData.domain || window.location.hostname,
          images: __lastArticleData.images || [],
          imageDataUrls: __lastArticleData.imageDataUrls || [],
          author: __lastArticleData.author || null,
          isYouTube: __lastArticleData.isYouTube || false,
          transcript: __lastArticleData.transcript || null,
          detectedLanguage: (__lastAnalysis && __lastAnalysis.detectedLanguage) || __lastArticleData.detectedLanguage || null,
          fastAnalysis: __lastAnalysis || null,
        }
      }).catch(function () {});
    });
    bubble.querySelector(".spectrum-bubble-deep").addEventListener("mouseenter", function () {
      this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.12))";
      this.style.borderColor = "rgba(99,102,241,0.3)";
    });
    bubble.querySelector(".spectrum-bubble-deep").addEventListener("mouseleave", function () {
      this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06))";
      this.style.borderColor = "rgba(99,102,241,0.15)";
    });

    // View Details — expand inline panel below paragraph
    bubble.querySelector(".spectrum-bubble-expand").addEventListener("click", function (ev) {
      ev.stopPropagation();
      dismissBubble();
      expandInlinePanel(wrapper, claim, index);
    });
    bubble.querySelector(".spectrum-bubble-expand").addEventListener("mouseenter", function () {
      this.style.background = "rgba(0,0,0,.06)";
    });
    bubble.querySelector(".spectrum-bubble-expand").addEventListener("mouseleave", function () {
      this.style.background = "rgba(0,0,0,.03)";
    });

    // Reposition on scroll — dismiss if highlight off-screen
    _bubbleScrollHandler = function () {
      var r = wrapper.getBoundingClientRect();
      if (r.bottom < -50 || r.top > window.innerHeight + 50) {
        dismissBubble();
      } else {
        positionBubble(bubble, wrapper);
      }
    };
    window.addEventListener("scroll", _bubbleScrollHandler, true);

    // Click outside to dismiss
    _bubbleClickOutHandler = function (ev) {
      if (!bubble.contains(ev.target) && !wrapper.contains(ev.target)) {
        dismissBubble();
      }
    };
    setTimeout(function () {
      document.addEventListener("mousedown", _bubbleClickOutHandler, true);
    }, 50);
  }

  // ============================================================
  // INLINE EXPANSION PANEL — full details below paragraph
  // ============================================================
  function expandInlinePanel(wrapper, claim, index) {
    var panelId = "spectrum-panel-" + index;
    var existing = document.getElementById(panelId);
    if (existing) {
      existing.style.maxHeight = "0"; existing.style.opacity = "0";
      existing.style.marginTop = "0"; existing.style.marginBottom = "0";
      existing.style.paddingTop = "0"; existing.style.paddingBottom = "0";
      setTimeout(function () { if (existing.parentNode) existing.remove(); }, 300);
      return;
    }

    // Close any other open panels
    document.querySelectorAll(".spectrum-inline-panel").forEach(function (p) {
      p.style.maxHeight = "0"; p.style.opacity = "0";
      setTimeout(function () { if (p.parentNode) p.remove(); }, 300);
    });

    var parentP = wrapper.closest("p") || wrapper.parentElement;
    var color = getClaimColor(claim);
    var pillBg = getClaimPill(claim);
    var pillText = getClaimPillText(claim);
    var typeLabel = getClaimTypeLabel(claim);
    var sevLabel = (claim.severity || "").charAt(0).toUpperCase() + (claim.severity || "").slice(1);
    var panelBorderStyle = (claim.type === "verified" || claim.type === "neutral") ? "dashed" : "solid";

    var panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "spectrum-inline-panel";
    panel.style.cssText =
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:0 20px;border-radius:8px;margin:0;overflow:hidden;" +
      "font-family:" + FONT_SERIF + ";font-size:14px;line-height:1.65;" +
      "border:1px solid " + BORDER + ";border-left:3px " + panelBorderStyle + " " + color + ";" +
      "box-shadow:0 2px 12px rgba(0,0,0,.06);" +
      "max-height:0;opacity:0;transition:max-height .35s ease,opacity .3s ease,margin .3s ease,padding .3s ease;";

    // Sources
    var sourcesHtml = "";
    var sources = claim.sources || [];
    if (sources.length > 0) {
      sourcesHtml = '<div style="margin-top:12px;padding-top:10px;border-top:1px solid ' + BORDER + ';">' +
        '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
          'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:6px;">Referenced Sources</div>';
      for (var s = 0; s < sources.length; s++) {
        sourcesHtml +=
          '<div style="display:flex;gap:6px;align-items:baseline;margin-bottom:5px;font-size:13px;">' +
            '<span style="color:' + color + ';flex-shrink:0;font-size:11px;">\u25AA</span>' +
            '<span><strong style="color:' + TEXT_HEAD + ';">' + escapeHtml(sources[s].name || "") + '</strong>' +
            (sources[s].detail ? ' \u2014 <span style="color:' + TEXT_MUTED + ';">' + escapeHtml(sources[s].detail) + '</span>' : '') +
            '</span></div>';
      }
      sourcesHtml += '</div>';
    }

    // Data points
    var dataHtml = "";
    var dataPoints = claim.dataPoints || [];
    if (dataPoints.length > 0) {
      dataHtml = '<div style="margin-top:10px;padding:10px 12px;border-radius:6px;background:rgba(94,138,180,0.05);border:1px solid rgba(94,138,180,0.08);">' +
        '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
          'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:5px;">Key Data</div>';
      for (var d = 0; d < dataPoints.length; d++) {
        dataHtml += '<div style="font-size:13px;color:' + TEXT_BODY + ';margin-bottom:3px;font-family:' + FONT_SANS + ';">\u2022 ' + escapeHtml(dataPoints[d]) + '</div>';
      }
      dataHtml += '</div>';
    }

    // Check-worthiness (Upgrade #5 — with sub-scores and evidence suggestions)
    var cwHtml = "";
    if (typeof claim.checkWorthiness === "number") {
      var cwScore = claim.checkWorthiness;
      var cwColor = cwScore >= 80 ? "#F87171" : cwScore >= 50 ? "#FBBF24" : "#4ADE80";
      var cwLabel = cwScore >= 80 ? L("checkWorth_high") : cwScore >= 50 ? L("checkWorth_mid") : L("checkWorth_low");
      var cwPriority = claim.checkPriority || (cwScore >= 80 ? "urgent" : cwScore >= 50 ? "recommended" : "optional");
      var cwPriorityColor = { urgent: "#F87171", recommended: "#FBBF24", optional: "#94A3B8" }[cwPriority] || "#94A3B8";
      var cwPriorityBg = { urgent: "rgba(248,113,113,0.1)", recommended: "rgba(251,191,36,0.1)", optional: "rgba(148,163,184,0.08)" }[cwPriority] || "rgba(148,163,184,0.08)";

      // Header row: label + bar + score + priority badge
      cwHtml =
        '<div style="margin-top:10px;padding:10px 12px;border-radius:6px;background:' + cwPriorityBg + ';border:1px solid ' + cwPriorityColor + '22;">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:' + (typeof claim.verifiability === "number" || (claim.evidenceSuggestions && claim.evidenceSuggestions.length) ? "8px" : "0") + ';font-family:' + FONT_SANS + ';">' +
            '<span style="font-size:10px;color:' + TEXT_FAINT + ';white-space:nowrap;font-weight:600;text-transform:uppercase;letter-spacing:.6px;">Check-worthiness</span>' +
            '<div style="flex:1;height:4px;border-radius:2px;background:rgba(0,0,0,.06);">' +
              '<div style="height:100%;width:' + cwScore + '%;border-radius:2px;background:' + cwColor + ';"></div>' +
            '</div>' +
            '<span style="font-size:10px;color:' + cwColor + ';font-weight:700;">' + cwScore + '</span>' +
            '<span style="padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;' +
              'background:' + cwPriorityBg + ';color:' + cwPriorityColor + ';border:1px solid ' + cwPriorityColor + '44;">' + cwPriority + '</span>' +
          '</div>';

      // Sub-scores breakdown
      if (typeof claim.verifiability === "number" || typeof claim.publicImpact === "number" || typeof claim.potentialHarm === "number") {
        cwHtml += '<div style="display:flex;gap:6px;margin-bottom:' + (claim.evidenceSuggestions && claim.evidenceSuggestions.length ? "8px" : "0") + ';">';
        var subScores = [
          { label: "Verifiability", val: claim.verifiability },
          { label: "Public impact", val: claim.publicImpact },
          { label: "Potential harm", val: claim.potentialHarm }
        ];
        for (var si = 0; si < subScores.length; si++) {
          var ss = subScores[si];
          if (typeof ss.val !== "number") continue;
          var ssColor = ss.val >= 70 ? "#F87171" : ss.val >= 40 ? "#FBBF24" : "#94A3B8";
          cwHtml +=
            '<div style="flex:1;font-family:' + FONT_SANS + ';">' +
              '<div style="font-size:9px;color:' + TEXT_FAINT + ';margin-bottom:2px;">' + ss.label + '</div>' +
              '<div style="height:3px;border-radius:2px;background:rgba(0,0,0,.06);margin-bottom:2px;">' +
                '<div style="height:100%;width:' + ss.val + '%;border-radius:2px;background:' + ssColor + ';"></div>' +
              '</div>' +
              '<div style="font-size:9px;color:' + ssColor + ';font-weight:600;">' + ss.val + '</div>' +
            '</div>';
        }
        cwHtml += '</div>';
      }

      // Evidence suggestions
      var evidSugg = claim.evidenceSuggestions || [];
      if (evidSugg.length > 0) {
        cwHtml += '<div style="font-family:' + FONT_SANS + ';">' +
          '<div style="font-size:9px;color:' + TEXT_FAINT + ';font-weight:600;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">Check against</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;">';
        for (var ei = 0; ei < evidSugg.length; ei++) {
          cwHtml += '<span style="padding:2px 7px;border-radius:3px;font-size:10px;font-weight:500;' +
            'background:rgba(99,102,241,0.08);color:#818CF8;border:1px solid rgba(99,102,241,0.15);">' +
            escapeHtml(evidSugg[ei]) + '</span>';
        }
        cwHtml += '</div></div>';
      }

      cwHtml += '</div>';
    }

    // Information gaps
    var gapsHtml = "";
    var infoGaps = claim.informationGaps || [];
    if (infoGaps.length > 0) {
      gapsHtml = '<div style="margin-top:10px;padding:8px 12px;border-radius:6px;background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.1);">' +
        '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
          'letter-spacing:.8px;color:#B8963E;margin-bottom:5px;">Missing Context</div>';
      for (var g = 0; g < infoGaps.length; g++) {
        gapsHtml += '<div style="font-size:12px;color:' + TEXT_MUTED + ';margin-bottom:3px;font-family:' + FONT_SANS + ';line-height:1.4;">\u26A0 ' + escapeHtml(infoGaps[g]) + '</div>';
      }
      gapsHtml += '</div>';
    }

    panel.innerHTML =
      '<div style="display:flex;justify-content:flex-end;margin-bottom:4px;font-family:' + FONT_SANS + ';">' +
        '<span class="spectrum-panel-close" style="cursor:pointer;color:' + TEXT_FAINT + ';font-size:16px;line-height:1;padding:2px 6px;border-radius:4px;transition:background .15s;">\u00D7</span>' +
      '</div>' +
      cwHtml +
      sourcesHtml +
      dataHtml +
      gapsHtml +
      (claim.alternativePerspectives ?
        '<div style="margin-top:12px;padding:10px 12px;border-radius:6px;border-left:2px solid ' + LEAN_COLORS.center + ';background:rgba(148,163,184,0.05);">' +
          '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
            'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Other Perspectives</div>' +
          '<div style="font-size:13px;color:' + TEXT_MUTED + ';line-height:1.55;">' + escapeHtml(claim.alternativePerspectives) + '</div>' +
        '</div>' : '') +
      '<div class="spectrum-persp-section" style="margin-top:12px;">' +
        '<div class="spectrum-persp-loading" style="display:flex;align-items:center;gap:8px;padding:10px 0;font-family:' + FONT_SANS + ';font-size:12px;color:' + TEXT_FAINT + ';">' +
          '<span class="spectrum-spinner" style="display:inline-block;width:14px;height:14px;border:2px solid ' + BORDER + ';border-top-color:' + color + ';border-radius:50%;animation:spectrum-spin .8s linear infinite;"></span>' +
          'Loading deeper analysis\u2026' +
        '</div>' +
        '<div class="spectrum-persp-body" style="display:none;margin-top:12px;"></div>' +
      '</div>' +
      '<div style="margin-top:10px;padding-top:10px;border-top:1px solid ' + BORDER + ';display:flex;gap:8px;">' +
        '<button class="spectrum-factcheck-btn" style="' +
          'display:flex;align-items:center;justify-content:center;gap:6px;flex:0 0 auto;' +
          'background:rgba(251,191,36,0.08);' +
          'border:1px solid rgba(251,191,36,0.25);border-radius:8px;color:#B8963E;' +
          'padding:10px 14px;cursor:pointer;font-size:12px;font-weight:600;' +
          'font-family:' + FONT_SANS + ';letter-spacing:.3px;transition:all .2s;white-space:nowrap;' +
        '">\u2713 Fact Check</button>' +
        '<button class="spectrum-deep-btn" style="' +
          'display:flex;align-items:center;justify-content:center;gap:8px;flex:1;' +
          'background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08));' +
          'border:1px solid rgba(99,102,241,0.2);border-radius:8px;color:#818CF8;' +
          'padding:10px 14px;cursor:pointer;font-size:12px;font-weight:600;' +
          'font-family:' + FONT_SANS + ';letter-spacing:.3px;transition:all .2s;' +
        '">' + L("btn_fullDeep") + '</button>' +
      '</div>' +
      '<div class="spectrum-factcheck-results" style="display:none;margin-top:10px;"></div>';

    if (parentP.nextSibling) {
      parentP.parentNode.insertBefore(panel, parentP.nextSibling);
    } else {
      parentP.parentNode.appendChild(panel);
    }

    requestAnimationFrame(function () {
      panel.style.maxHeight = "3000px";
      panel.style.opacity = "1";
      panel.style.marginTop = "14px";
      panel.style.marginBottom = "14px";
      panel.style.paddingTop = "16px";
      panel.style.paddingBottom = "16px";
    });

    panel.querySelector(".spectrum-panel-close").addEventListener("click", function () {
      panel.style.maxHeight = "0"; panel.style.opacity = "0";
      panel.style.marginTop = "0"; panel.style.marginBottom = "0";
      panel.style.paddingTop = "0"; panel.style.paddingBottom = "0";
      setTimeout(function () { if (panel.parentNode) panel.remove(); }, 300);
    });
    panel.querySelector(".spectrum-panel-close").addEventListener("mouseenter", function () {
      this.style.background = "rgba(0,0,0,.05)";
    });
    panel.querySelector(".spectrum-panel-close").addEventListener("mouseleave", function () {
      this.style.background = "transparent";
    });

    // Auto-load factual context
    (function () {
      var loading = panel.querySelector(".spectrum-persp-loading");
      var body = panel.querySelector(".spectrum-persp-body");
      chrome.runtime.sendMessage(
        { type: "GET_PERSPECTIVES", data: { claim: claim.sentence, topicSlug: claim.relatedTopic, mode: "context" } },
        function (resp) {
          if (loading) loading.style.display = "none";
          body.style.display = "block";
          if (chrome.runtime.lastError || !resp) {
            body.innerHTML = '<div style="color:' + SEV_COLOR.high + ';font-family:' + FONT_SANS + ';font-size:12px;">Could not load context.</div>';
            return;
          }
          if (resp.error) {
            body.innerHTML = '<div style="color:' + SEV_COLOR.high + ';font-family:' + FONT_SANS + ';font-size:12px;">' + escapeHtml(resp.error) + '</div>';
            return;
          }
          if (resp.dataSource === "factual_context") {
            renderFactualContext(body, resp);
          } else {
            renderPerspectives(body, resp);
          }
          panel.style.maxHeight = "6000px";
        }
      );
    })();

    // Fact Check button
    panel.querySelector(".spectrum-factcheck-btn").addEventListener("click", function (ev) {
      ev.stopPropagation();
      var btn = this;
      var resultsDiv = panel.querySelector(".spectrum-factcheck-results");
      if (resultsDiv.style.display !== "none") {
        resultsDiv.style.display = "none";
        btn.style.background = "rgba(251,191,36,0.08)";
        btn.style.borderColor = "rgba(251,191,36,0.25)";
        return;
      }
      btn.textContent = "\u29D7 Checking\u2026";
      btn.disabled = true;
      chrome.runtime.sendMessage(
        { type: "FACTCHECK_CLAIM", data: { claim: claim.sentence } },
        function (resp) {
          btn.textContent = "\u2713 Fact Check";
          btn.disabled = false;
          if (chrome.runtime.lastError || !resp || resp.error) {
            resultsDiv.innerHTML =
              '<div style="font-size:12px;color:' + SEV_COLOR.high + ';font-family:' + FONT_SANS + ';padding:8px 0;">' +
              (resp && resp.error ? escapeHtml(resp.error) : "Could not reach fact-check database.") + '</div>';
            resultsDiv.style.display = "block";
            return;
          }
          renderFactCheckResults(resultsDiv, resp.factCheckResults || [], claim);
          resultsDiv.style.display = "block";
          btn.style.background = "rgba(251,191,36,0.14)";
          btn.style.borderColor = "rgba(251,191,36,0.45)";
          panel.style.maxHeight = "8000px";
        }
      );
    });
    panel.querySelector(".spectrum-factcheck-btn").addEventListener("mouseenter", function () {
      this.style.background = "rgba(251,191,36,0.14)";
      this.style.borderColor = "rgba(251,191,36,0.45)";
    });
    panel.querySelector(".spectrum-factcheck-btn").addEventListener("mouseleave", function () {
      if (!this.disabled) {
        this.style.background = "rgba(251,191,36,0.08)";
        this.style.borderColor = "rgba(251,191,36,0.25)";
      }
    });

    // Deep Analysis button
    panel.querySelector(".spectrum-deep-btn").addEventListener("click", function (ev) {
      ev.stopPropagation();
      if (!__lastArticleData) return;
      chrome.runtime.sendMessage({
        type: "OPEN_DEEP_ANALYSIS",
        data: {
          articleText: __lastArticleData.text,
          articleUrl: __lastArticleData.url || window.location.href,
          articleTitle: __lastArticleData.title || document.title,
          sourceDomain: __lastArticleData.domain || window.location.hostname,
          images: __lastArticleData.images || [],
          imageDataUrls: __lastArticleData.imageDataUrls || [],
          author: __lastArticleData.author || null,
          isYouTube: __lastArticleData.isYouTube || false,
          transcript: __lastArticleData.transcript || null,
          detectedLanguage: (__lastAnalysis && __lastAnalysis.detectedLanguage) || __lastArticleData.detectedLanguage || null,
          fastAnalysis: __lastAnalysis || null,
        }
      }).catch(function () {});
    });
    panel.querySelector(".spectrum-deep-btn").addEventListener("mouseenter", function () {
      this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))";
      this.style.borderColor = "rgba(99,102,241,0.35)";
    });
    panel.querySelector(".spectrum-deep-btn").addEventListener("mouseleave", function () {
      this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))";
      this.style.borderColor = "rgba(99,102,241,0.2)";
    });
  }

  function attachClaimInteraction(wrapper, claim, index) {
    wrapper.addEventListener("mouseenter", function () {
      wrapper.style.background = getClaimBg(claim).replace("0.07", "0.15");
    });
    wrapper.addEventListener("mouseleave", function () {
      wrapper.style.background = getClaimBg(claim);
    });

    wrapper.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissBubble();
      expandInlinePanel(wrapper, claim, index);
    });
  }

  // ============================================================
  // FACT CHECK API RESULTS RENDERER (Upgrade #10)
  // ============================================================
  function renderFactCheckResults(container, results, claim) {
    var html = '<div style="padding:10px 0;">' +
      '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
        'letter-spacing:.8px;color:#B8963E;margin-bottom:8px;">\u2713 Fact-Check Database Results</div>';

    if (!results || results.length === 0) {
      html += '<div style="font-size:12px;color:' + TEXT_FAINT + ';font-family:' + FONT_SANS + ';padding:6px 0;">No fact-checks found for this claim.</div>';
    } else {
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var ratingLower = (r.textualRating || "").toLowerCase().replace(/\s+/g, "_");
        // Map textual rating to color
        var ratingColor = "#94A3B8";
        var ratingBg = "rgba(148,163,184,0.08)";
        if (/true|correct|accurate/.test(ratingLower)) { ratingColor = "#4ADE80"; ratingBg = "rgba(74,222,128,0.08)"; }
        else if (/mostly.true|partially.true|half.true/.test(ratingLower)) { ratingColor = "#86EFAC"; ratingBg = "rgba(134,239,172,0.08)"; }
        else if (/mislead|distort/.test(ratingLower)) { ratingColor = "#F59E0B"; ratingBg = "rgba(245,158,11,0.08)"; }
        else if (/false|incorrect|wrong|pants/.test(ratingLower)) { ratingColor = "#F87171"; ratingBg = "rgba(248,113,113,0.08)"; }
        else if (/mostly.false|partly.false/.test(ratingLower)) { ratingColor = "#FBBF24"; ratingBg = "rgba(251,191,36,0.08)"; }

        html +=
          '<div style="padding:8px 10px;border-radius:6px;background:' + ratingBg + ';border:1px solid ' + BORDER + ';margin-bottom:6px;">' +
            '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">' +
              '<span style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;' +
                'background:' + ratingColor + '20;color:' + ratingColor + ';border:1px solid ' + ratingColor + '40;">' +
                escapeHtml(r.textualRating || "Unverified") + '</span>' +
              '<span style="font-family:' + FONT_SANS + ';font-size:11px;font-weight:600;color:' + TEXT_HEAD + ';">' +
                escapeHtml(r.publisher || "") + '</span>' +
            '</div>' +
            (r.title ? '<div style="font-size:12px;color:' + TEXT_MUTED + ';line-height:1.4;margin-bottom:4px;font-family:' + FONT_SERIF + ';">' +
              escapeHtml(r.title) + '</div>' : '') +
            (r.url ? '<a href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener noreferrer" ' +
              'style="font-size:11px;color:#60A5FA;font-family:' + FONT_SANS + ';text-decoration:none;">' +
              'View full fact-check \u2192</a>' : '') +
          '</div>';
      }
    }

    // Cross-spectrum coverage (from Claude analysis if available)
    if (claim.crossSpectrumCoverage && claim.crossSpectrumCoverage.length > 0) {
      html +=
        '<div style="margin-top:8px;padding:8px 10px;border-radius:6px;background:rgba(148,163,184,0.05);border:1px solid ' + BORDER + ';">' +
          '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
            'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:6px;">Cross-Spectrum Coverage</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:5px;">';
      for (var j = 0; j < claim.crossSpectrumCoverage.length; j++) {
        var outlet = claim.crossSpectrumCoverage[j];
        // Extract lean from "(lean)" suffix for color
        var leanMatch = outlet.match(/\(([^)]+)\)\s*$/);
        var leanKey = leanMatch ? leanMatch[1].replace(/[- ]/g, "").toLowerCase() : "center";
        var outletColor = LEAN_COLORS[leanKey] || "#94A3B8";
        html +=
          '<span style="padding:3px 8px;border-radius:4px;font-size:11px;font-family:' + FONT_SANS + ';' +
            'background:' + outletColor + '15;color:' + outletColor + ';border:1px solid ' + outletColor + '30;">' +
            escapeHtml(outlet) + '</span>';
      }
      html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  // ============================================================
  // FACTUAL CONTEXT RENDERER
  // ============================================================
  function renderFactualContext(container, data) {
    var verdictColors = {
      accurate: "#4ADE80", mostly_accurate: "#86EFAC", lacks_context: "#FBBF24",
      misleading: "#F87171", opinion: "#A78BFA", unverifiable: "#94A3B8"
    };
    var verdictLabels = {
      accurate: L("verdict_accurate"), mostly_accurate: L("verdict_mostly_accurate"), lacks_context: L("verdict_lacks_context"),
      misleading: L("verdict_misleading"), opinion: L("verdict_opinion"), unverifiable: L("verdict_unverifiable")
    };
    var verdict = data.verdict || "unverifiable";
    var vColor = verdictColors[verdict] || "#94A3B8";
    var vLabel = verdictLabels[verdict] || verdict;

    var html = '';

    // Verdict badge
    html +=
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
        '<span style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
          'letter-spacing:.8px;color:' + TEXT_FAINT + ';">Fact Check</span>' +
        '<span style="padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;' +
          'background:' + vColor + '18;color:' + vColor + ';border:1px solid ' + vColor + '30;">' +
          vLabel + '</span>' +
      '</div>';

    // Verdict explanation
    if (data.verdictExplanation) {
      html += '<div style="font-size:13px;color:' + TEXT_BODY + ';line-height:1.55;margin-bottom:10px;font-family:' + FONT_SERIF + ';">' +
        escapeHtml(data.verdictExplanation) + '</div>';
    }

    // Background
    if (data.background) {
      html +=
        '<div style="padding:10px 12px;border-radius:6px;background:rgba(94,138,180,0.04);border:1px solid ' + BORDER + ';margin-bottom:8px;">' +
          '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
            'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Background</div>' +
          '<div style="font-size:13px;color:' + TEXT_BODY + ';line-height:1.5;font-family:' + FONT_SERIF + ';">' +
            escapeHtml(data.background) + '</div>' +
        '</div>';
    }

    // Key data points
    var keyData = data.keyData || [];
    if (keyData.length > 0) {
      html += '<div style="margin-bottom:8px;">' +
        '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
          'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:5px;">Key Data</div>';
      for (var i = 0; i < keyData.length; i++) {
        html +=
          '<div style="display:flex;gap:6px;align-items:baseline;margin-bottom:4px;font-size:12px;font-family:' + FONT_SANS + ';">' +
            '<span style="color:' + vColor + ';flex-shrink:0;">\u25AA</span>' +
            '<div>' +
              '<span style="color:' + TEXT_BODY + ';">' + escapeHtml(keyData[i].fact || "") + '</span>' +
              (keyData[i].source ? ' <span style="color:' + TEXT_FAINT + ';font-size:11px;">(' + escapeHtml(keyData[i].source) + ')</span>' : '') +
            '</div>' +
          '</div>';
      }
      html += '</div>';
    }

    // Missing context
    if (data.missingContext) {
      html +=
        '<div style="padding:8px 12px;border-radius:6px;background:rgba(251,191,36,0.04);border-left:2px solid #FBBF24;margin-top:6px;">' +
          '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;color:#B8963E;margin-bottom:3px;">Missing Context</div>' +
          '<div style="font-size:12px;color:' + TEXT_MUTED + ';line-height:1.45;font-family:' + FONT_SERIF + ';">' +
            escapeHtml(data.missingContext) + '</div>' +
        '</div>';
    }

    container.innerHTML = html || '<div style="color:' + TEXT_FAINT + ';font-family:' + FONT_SANS + ';">No additional context available.</div>';
  }

  // ============================================================
  // PERSPECTIVES RENDERER
  // ============================================================
  function renderPerspectives(container, data) {
    var html = "";
    var perspectives = data.perspectives || {};
    var leans = ["left", "center", "right"];
    var leanLabels = { left: L("perspLean_left"), center: L("perspLean_center"), right: L("perspLean_right") };
    var leanColors = { left: "#7CB3E0", center: "#94A3B8", right: "#D98282" };

    for (var i = 0; i < leans.length; i++) {
      var lean = leans[i];
      var items = perspectives[lean];
      if (!items || items.length === 0) continue;

      html += '<div style="margin-bottom:10px;">';
      html += '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
        'letter-spacing:.8px;color:' + leanColors[lean] + ';margin-bottom:5px;padding-left:2px;">' + leanLabels[lean] + '</div>';

      for (var j = 0; j < items.length; j++) {
        html +=
          '<div style="padding:8px 10px;border-radius:6px;background:rgba(0,0,0,.02);margin-bottom:5px;border:1px solid ' + BORDER + ';">' +
            '<strong style="color:' + TEXT_HEAD + ';font-family:' + FONT_SANS + ';font-size:12px;">' + escapeHtml(items[j].source || "") + '</strong>' +
            '<div style="color:' + TEXT_MUTED + ';font-size:13px;line-height:1.5;margin-top:2px;font-family:' + FONT_SERIF + ';">' + escapeHtml(items[j].summary || "") + '</div>' +
          '</div>';
      }
      html += '</div>';
    }

    if (data.factCheck) {
      var fc = data.factCheck;
      var verdictColors = { mostly_true: "#4ADE80", mixed: "#FBBF24", misleading: "#F87171", unverified: "#94A3B8" };
      var verdictBg = { mostly_true: "rgba(74,222,128,.06)", mixed: "rgba(251,191,36,.06)", misleading: "rgba(248,113,113,.06)", unverified: "rgba(148,163,184,.06)" };
      html +=
        '<div style="margin-top:10px;padding:12px;border-radius:8px;background:' + (verdictBg[fc.verdict] || verdictBg.unverified) + ';border:1px solid ' + BORDER + ';">' +
          '<div style="font-family:' + FONT_SANS + ';font-weight:600;font-size:11px;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;color:' + (verdictColors[fc.verdict] || TEXT_FAINT) + ';">' +
            'Fact Check \u2014 ' + (fc.verdict || "").replace(/_/g, " ") +
          '</div>' +
          '<div style="font-size:13px;color:' + TEXT_BODY + ';line-height:1.5;font-family:' + FONT_SERIF + ';">' + escapeHtml(fc.explanation || "") + '</div>' +
          (fc.sources && fc.sources.length ?
            '<div style="font-size:11px;color:' + TEXT_FAINT + ';margin-top:6px;font-family:' + FONT_SANS + ';">Sources: ' + fc.sources.map(escapeHtml).join(", ") + '</div>' : '') +
        '</div>';

      // Evidence chain (Upgrade #10 — Explainable Verification)
      var chain = fc.evidenceChain || [];
      if (chain.length > 0) {
        html +=
          '<div style="margin-top:8px;padding:10px 12px;border-radius:6px;background:rgba(0,0,0,.02);border:1px solid ' + BORDER + ';">' +
            '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
              'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:6px;">Evidence Chain</div>';
        for (var ec = 0; ec < chain.length; ec++) {
          var ev = chain[ec];
          var evIcon = EVIDENCE_TYPE_ICONS[ev.type] || "\u2022";
          var evColor = ev.type === "supporting" ? "#4ADE80" : ev.type === "contradicting" ? "#F87171" : "#60A5FA";
          var strengthColor = EVIDENCE_COLORS[ev.strength] || TEXT_FAINT;
          html +=
            '<div style="display:flex;gap:6px;align-items:baseline;margin-bottom:5px;font-size:12px;font-family:' + FONT_SANS + ';">' +
              '<span style="color:' + evColor + ';flex-shrink:0;font-size:13px;">' + evIcon + '</span>' +
              '<div>' +
                '<strong style="color:' + TEXT_HEAD + ';">' + escapeHtml(ev.source || "") + '</strong>' +
                '<span style="margin-left:6px;font-size:10px;padding:1px 5px;border-radius:3px;' +
                  'background:' + strengthColor + '15;color:' + strengthColor + ';">' + (ev.strength || "") + '</span>' +
                '<div style="color:' + TEXT_MUTED + ';line-height:1.4;margin-top:1px;">' + escapeHtml(ev.finding || "") + '</div>' +
              '</div>' +
            '</div>';
        }
        html += '</div>';
      }

      // Reasoning summary (Upgrade #10)
      if (fc.reasoningSummary) {
        html +=
          '<div style="margin-top:6px;padding:8px 12px;border-radius:6px;border-left:2px solid ' + (verdictColors[fc.verdict] || TEXT_FAINT) + ';' +
            'background:rgba(0,0,0,.015);font-size:12px;color:' + TEXT_MUTED + ';line-height:1.45;font-family:' + FONT_SERIF + ';">' +
            '<strong style="color:' + TEXT_HEAD + ';font-family:' + FONT_SANS + ';font-size:10px;text-transform:uppercase;letter-spacing:.5px;">Reasoning: </strong>' +
            escapeHtml(fc.reasoningSummary) +
          '</div>';
      }
    }

    container.innerHTML = html || '<div style="color:' + TEXT_FAINT + ';font-family:' + FONT_SANS + ';">No perspectives available.</div>';
  }

  // ============================================================
  // VIDEO SIDEBAR + PLAYBACK TRACKER (YouTube live analysis)
  // ============================================================

  function buildSummaryHTML(analysis) {
    var claims = analysis.claims || [];
    var lean = analysis.overallLean || "";
    var leanNorm = lean.replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[leanNorm] || "#94A3B8";
    var leanLabel = LEAN_LABELS[leanNorm] || lean;
    var confidence = analysis.confidence ? Math.round(analysis.confidence * 100) + "%" : "";
    var highCount = claims.filter(function (c) { return c.severity === "high"; }).length;
    var medCount = claims.filter(function (c) { return c.severity === "medium"; }).length;
    var lowCount = claims.filter(function (c) { return c.severity === "low" && c.type !== "verified" && c.type !== "neutral"; }).length;
    var verifiedCount = claims.filter(function (c) { return c.type === "verified"; }).length;
    var neutralCount = claims.filter(function (c) { return c.type === "neutral"; }).length;
    var intent = analysis.intentClassification || {};
    var intentType = intent.type || analysis.intentType || "";
    var intentColor = INTENT_COLORS[intentType] || TEXT_FAINT;
    var intentLabel = INTENT_LABELS[intentType] || "";
    var intentConf = intent.confidence ? Math.round(intent.confidence * 100) + "%" : "";
    var leanScore = typeof analysis.leanScore === "number" ? analysis.leanScore : null;
    var polarization = typeof analysis.polarizationIntensity === "number" ? analysis.polarizationIntensity : null;
    var detectedLang = analysis.detectedLanguage || "";
    // Credibility badge (Upgrade #2 — CRED-1)
    var credScore = typeof analysis._credibilityScore === "number" ? analysis._credibilityScore : null;
    var credFactors = analysis._credibilityFactors || null;
    var credLabel = credScore !== null ? (credScore >= 80 ? "High" : credScore >= 50 ? "Med" : "Low") : null;
    var CRED_COLORS = { High: "#22C55E", Med: "#F59E0B", Low: "#EF4444" };
    var credColor = credLabel ? (CRED_COLORS[credLabel] || "#94A3B8") : "#94A3B8";
    var credTooltip = credFactors ? "Score: " + credScore + "/100 | Fact-check: " + credFactors.factCheck + " | Editorial: " + credFactors.editorial + " | Transparency: " + credFactors.transparency + " | Correction: " + credFactors.correction : (credScore !== null ? "Credibility: " + credScore + "/100" : "");

    // State media affiliation (Upgrade #9 — State Media Detection)
    var stateAff = analysis._stateAffiliation || null;
    var stateMediaAnalysis = analysis.stateMediaAnalysis || null;
    var STATE_TIER_COLORS = { state_controlled: "#EF4444", low: "#F59E0B", partial: "#60A5FA", independent: "#22C55E" };
    var STATE_TYPE_LABELS = { state_owned: "State-Owned", state_funded: "State-Funded", state_affiliated: "State-Affiliated", public_broadcaster: "Public Broadcaster" };
    var stateColor = null, stateTier = null;
    if (stateAff) {
      stateTier = stateAff.independenceScore < 20 ? "state_controlled" : stateAff.independenceScore < 40 ? "low" : stateAff.independenceScore < 65 ? "partial" : "independent";
      stateColor = STATE_TIER_COLORS[stateTier];
    }

    // Verdict scoring
    var vqScore = 100, vqHasData = false, vqFlags = [], vqStrengths = [];
    var vqSpin = typeof analysis.spinScore === "number" ? analysis.spinScore : null;
    if (vqSpin !== null) { vqHasData = true; vqScore -= vqSpin * 0.25; if (vqSpin > 60) vqFlags.push("High spin"); else if (vqSpin <= 20) vqStrengths.push("Low spin"); }
    if (intentType) { vqHasData = true; var vqIP = { informative: 0, advocacy: 5, persuasion: 20, manipulation: 35 }; vqScore -= vqIP[intentType] || 0; if (intentType === "manipulation") vqFlags.push("Manipulative"); else if (intentType === "persuasion") vqFlags.push("Persuasive"); else if (intentType === "informative") vqStrengths.push("Informative"); }
    if (polarization !== null) { vqScore -= polarization * 0.15; if (polarization > 60) vqFlags.push("Polarizing"); else if (polarization <= 20) vqStrengths.push("Non-polarizing"); }
    if (leanScore !== null) { if (Math.abs(leanScore) > 0.6) vqFlags.push("Strong lean"); else if (Math.abs(leanScore) < 0.15) vqStrengths.push("Balanced"); }
    var vqSentData = analysis.sentimentAnalysis || null;
    var vqSentScore = vqSentData ? vqSentData.overallScore : (typeof analysis.sentimentScore === "number" ? analysis.sentimentScore : null);
    if (vqSentScore !== null) { vqHasData = true; if (Math.abs(vqSentScore) > 0.5) { vqScore -= Math.round((Math.abs(vqSentScore) - 0.5) * 20); vqFlags.push(vqSentScore < 0 ? "Negative tone" : "Positive tone"); } else if (Math.abs(vqSentScore) < 0.15) { vqStrengths.push("Neutral tone"); } if (vqSentData && vqSentData.headlineBodyMismatch && vqSentData.mismatchSeverity !== "none") { vqScore -= 5; vqFlags.push("Headline mismatch"); } }
    if (claims.length > 0) {
      vqHasData = true;
      vqScore -= highCount * 5; vqScore -= medCount * 2;
      if (highCount >= 3) vqFlags.push(highCount + " high claims");
      if (verifiedCount >= 3) vqStrengths.push(verifiedCount + " verified");
      if (highCount === 0 && medCount <= 1) vqStrengths.push("Few issues");
    }
    if (leanScore === null && leanNorm) {
      var extremeLeans = { farleft: true, farright: true };
      var moderateLeans = { left: true, right: true };
      if (extremeLeans[leanNorm]) { vqFlags.push("Strong lean"); vqScore -= 10; }
      else if (moderateLeans[leanNorm]) vqScore -= 3;
      else if (leanNorm === "center") vqStrengths.push("Balanced");
    }
    vqScore = Math.max(0, Math.min(100, Math.round(vqScore)));

    var html = '';

    // Verdict
    if (vqHasData) {
      var vqLabel, vqColor;
      if (vqScore >= 80) { vqLabel = L("quality_solid"); vqColor = "#4ADE80"; }
      else if (vqScore >= 60) { vqLabel = L("quality_fair"); vqColor = "#60A5FA"; }
      else if (vqScore >= 40) { vqLabel = L("quality_mixed"); vqColor = "#FBBF24"; }
      else if (vqScore >= 20) { vqLabel = L("quality_questionable"); vqColor = "#F87171"; }
      else { vqLabel = L("quality_poor"); vqColor = "#F87171"; }

      html +=
        '<div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;">' +
            '<span style="font-size:40px;font-weight:800;color:' + vqColor + ';line-height:1;">' + vqScore + '</span>' +
            '<span style="font-size:14px;color:' + TEXT_FAINT + ';">/100</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + vqColor + ';margin-left:auto;">' + vqLabel + '</span>' +
          '</div>' +
          '<div style="position:relative;margin-bottom:6px;">' +
            '<div style="height:6px;border-radius:3px;background:linear-gradient(to right,#60A5FA,#94A3B8 50%,#F87171);"></div>' +
            '<div style="position:absolute;bottom:-3px;left:calc(' + vqScore + '% - 5px);width:10px;height:10px;border-radius:50%;background:' + vqColor + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.25);"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:' + TEXT_FAINT + ';">' +
            '<span>\uD83D\uDD35 Poor</span><span>Solid \uD83D\uDD34</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + TEXT_FAINT + ';font-style:italic;margin-top:4px;">At a glance \u2014 may change with deep analysis.</div>' +
        '</div>';
    }

    // Pills
    if (vqFlags.length > 0 || vqStrengths.length > 0) {
      html += '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">';
      for (var vfi = 0; vfi < vqFlags.length; vfi++) {
        html += '<span style="display:inline-block;margin:0 4px 5px 0;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;background:rgba(96,165,250,.12);color:#60A5FA;border:1px solid rgba(96,165,250,.2);">' + escapeHtml(vqFlags[vfi]) + '</span>';
      }
      for (var vsi = 0; vsi < vqStrengths.length; vsi++) {
        html += '<span style="display:inline-block;margin:0 4px 5px 0;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;background:rgba(248,113,113,.12);color:#F87171;border:1px solid rgba(248,113,113,.2);">' + escapeHtml(vqStrengths[vsi]) + '</span>';
      }
      html += '</div>';
    }

    // Outlet History card (fast mode — uses _outletHistory from CF)
    var outletHistory = analysis._outletHistory || null;
    if (outletHistory && outletHistory.articleCount >= 3) {
      var ohCount = outletHistory.articleCount;
      var ohAvg = outletHistory.avgLean;
      var ohRecent = outletHistory.recentAvgLean;
      var ohName = outletHistory.name || "";
      // Trend: compare recent 7-article avg to overall avg
      var ohDiff = ohRecent - ohAvg;
      var ohTrendArrow = Math.abs(ohDiff) < 0.08 ? "\u2192" : ohDiff > 0 ? "\u2191" : "\u2193";
      var ohTrendLabel = Math.abs(ohDiff) < 0.08 ? "Stable" : ohDiff > 0 ? "Shifting right" : "Shifting left";
      // Lean label for avg
      var ohAvgNorm = ohAvg < -0.6 ? "farLeft" : ohAvg < -0.25 ? "left" : ohAvg < -0.08 ? "centerLeft" : ohAvg > 0.6 ? "farRight" : ohAvg > 0.25 ? "right" : ohAvg > 0.08 ? "centerRight" : "center";
      var ohAvgLabel = LEAN_LABELS[ohAvgNorm] || ohAvgNorm;
      var ohAvgColor = LEAN_COLORS[ohAvgNorm] || TEXT_FAINT;
      // Bar: map [-1,1] to [0,100]%
      var ohBarPct = ((ohAvg + 1) / 2) * 100;
      // Deviation warning: current article vs outlet average
      var ohDeviation = leanScore !== null ? Math.abs(leanScore - ohAvg) : 0;
      var ohDeviationWarning = leanScore !== null && ohDeviation > 0.2;
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">Outlet History</div>' +
            '<span style="font-size:11px;color:' + TEXT_FAINT + ';">' + ohCount + ' article' + (ohCount !== 1 ? 's' : '') + '</span>' +
          '</div>' +
          '<div style="height:4px;border-radius:2px;background:linear-gradient(to right,#7CB3E0,#94A3B8,#D98282);position:relative;margin-bottom:6px;">' +
            '<div style="position:absolute;top:-3px;left:calc(' + ohBarPct.toFixed(1) + '% - 4px);width:8px;height:8px;border-radius:50%;background:' + ohAvgColor + ';border:1.5px solid rgba(255,255,255,0.7);box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span style="font-size:11px;color:' + TEXT_MUTED + ';">Avg: <span style="color:' + ohAvgColor + ';font-weight:600;">' + ohAvgLabel + '</span></span>' +
            '<span style="font-size:11px;color:' + TEXT_FAINT + ';" title="Recent 7-article trend vs overall">' + ohTrendArrow + ' ' + ohTrendLabel + '</span>' +
          '</div>' +
          (ohDeviationWarning ?
            '<div style="margin-top:5px;font-size:11px;color:#FBBF24;display:flex;align-items:center;gap:4px;">' +
              '<span>\u26A0</span>' +
              '<span>This article deviates from ' + (ohName ? escapeHtml(ohName) + '\'s' : 'this outlet\'s') + ' typical lean</span>' +
            '</div>' : '') +
        '</div>';
    }

    // Badges
    html +=
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">' +
        (intentLabel ?
          '<span style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;background:' + intentColor + '12;color:' + intentColor + ';border:1px solid ' + intentColor + '25;">' +
            intentLabel + (intentConf ? ' \u00B7 ' + intentConf : '') + '</span>' : '') +
        '<span style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;background:' + leanColor + '15;color:' + leanColor + ';border:1px solid ' + leanColor + '25;">' +
          leanLabel + (confidence ? ' \u00B7 ' + confidence : '') + '</span>' +
        (credLabel ?
          '<span style="padding:3px 9px;border-radius:10px;font-size:12px;font-weight:600;background:' + credColor + '15;color:' + credColor + ';border:1px solid ' + credColor + '25;cursor:default;" title="' + escapeHtml(credTooltip) + '">' +
            credLabel + ' Cred \u00B7 ' + credScore + '</span>' : '') +
        (detectedLang && detectedLang !== "en" ?
          '<span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;background:rgba(148,163,184,0.1);color:' + TEXT_FAINT + ';border:1px solid ' + BORDER + ';" title="Detected language">' +
            escapeHtml(detectedLang.toUpperCase()) + '</span>' : '') +
      '</div>';

    // State media warning banner (Upgrade #9)
    if (stateAff) {
      var stateTypeLabel = STATE_TYPE_LABELS[stateAff.type] || stateAff.type;
      var stateIndepBar = stateAff.independenceScore;
      var stateBgColor = stateColor + "14";
      var stateBorderColor = stateColor + "55";
      html +=
        '<div style="margin-bottom:10px;padding:8px 10px;border-radius:6px;background:' + stateBgColor + ';border:1px solid ' + stateBorderColor + ';border-left:3px solid ' + stateColor + ';">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">' +
            '<span style="font-size:13px;">\u26A0\uFE0F</span>' +
            '<span style="font-size:12px;font-weight:700;color:' + stateColor + ';">' +
              escapeHtml(stateTypeLabel) + ': ' + escapeHtml(stateAff.state) +
            '</span>' +
            '<span style="font-size:11px;color:' + TEXT_FAINT + ';margin-left:auto;">Independence: ' + stateAff.independenceScore + '/100</span>' +
          '</div>' +
          '<div style="height:4px;border-radius:2px;background:rgba(0,0,0,0.08);margin-bottom:4px;">' +
            '<div style="height:100%;width:' + stateIndepBar + '%;border-radius:2px;background:' + stateColor + ';"></div>' +
          '</div>' +
          '<div style="font-size:11px;color:' + TEXT_FAINT + ';">Funded by: ' + escapeHtml(stateAff.fundingSource) + '</div>' +
          // Soft power pattern pills from Claude analysis
          (stateMediaAnalysis && stateMediaAnalysis.softPowerPatterns && stateMediaAnalysis.softPowerPatterns.length > 0 ?
            '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;">' +
              stateMediaAnalysis.softPowerPatterns.map(function(p) {
                var pillColor = p.severity === "high" ? "#EF4444" : p.severity === "medium" ? "#F59E0B" : "#60A5FA";
                var pillBg = p.severity === "high" ? "rgba(239,68,68,0.10)" : p.severity === "medium" ? "rgba(245,158,11,0.10)" : "rgba(96,165,250,0.10)";
                var patternLabel = p.pattern ? p.pattern.replace(/_/g, " ") : "";
                return '<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:' + pillBg + ';color:' + pillColor + ';border:1px solid ' + pillColor + '33;" title="' + escapeHtml(p.explanation || "") + '">' + escapeHtml(patternLabel) + '</span>';
              }).join("") +
            '</div>' : "") +
          (stateMediaAnalysis && stateMediaAnalysis.overallGeopoliticalSlant ?
            '<div style="margin-top:5px;font-size:11px;color:' + TEXT_MUTED + ';font-style:italic;">' + escapeHtml(stateMediaAnalysis.overallGeopoliticalSlant) + '</div>' : "") +
        '</div>';
    }

    // Claim summary
    if (claims.length > 0) {
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:13px;color:' + TEXT_MUTED + ';margin-bottom:6px;">' + claims.length + ' claim' + (claims.length !== 1 ? 's' : '') + ' identified</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
            (highCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + SEV_PILL.high + ';color:' + SEV_PILL_TEXT.high + ';">' + highCount + ' high</span>' : '') +
            (medCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + SEV_PILL.medium + ';color:' + SEV_PILL_TEXT.medium + ';">' + medCount + ' med</span>' : '') +
            (lowCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + SEV_PILL.low + ';color:' + SEV_PILL_TEXT.low + ';">' + lowCount + ' low</span>' : '') +
            (verifiedCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + TYPE_PILL.verified + ';color:' + TYPE_PILL_TEXT.verified + ';">' + verifiedCount + ' verified</span>' : '') +
            (neutralCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + TYPE_PILL.neutral + ';color:' + TYPE_PILL_TEXT.neutral + ';">' + neutralCount + ' noted</span>' : '') +
          '</div>' +
        '</div>';
    } else {
      html += '<div style="margin-bottom:10px;font-size:13px;color:#4ADE80;">No claims identified</div>';
    }

    // Lean bar
    if (leanScore !== null) {
      var lsBarPct = ((leanScore + 1) / 2) * 100;
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Article Lean</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#7CB3E0,#94A3B8,#D98282);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + lsBarPct + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + TEXT_MUTED + ';font-weight:600;min-width:28px;text-align:right;">' +
              (leanScore > 0 ? '+' : '') + leanScore.toFixed(1) + '</span>' +
          '</div>' +
        '</div>';
    }

    // Bias Dimensions (Upgrade #1 — multi-cue-ideology)
    var cueProfile = analysis.ideologyCueProfile || null;
    if (cueProfile) {
      var CUE_LABELS = SPECTRUM.IDEOLOGY_CUE_LABELS;
      var cueKeys = Object.keys(CUE_LABELS);
      var cueBars = '';
      for (var ci = 0; ci < cueKeys.length; ci++) {
        var cueKey = cueKeys[ci];
        var cue = cueProfile[cueKey];
        if (!cue || typeof cue.score !== 'number') continue;
        var cueScore = Math.max(-1, Math.min(1, cue.score));
        var cuePct = ((cueScore + 1) / 2) * 100;
        var cueColor = cueScore < -0.15 ? '#7CB3E0' : cueScore > 0.15 ? '#D98282' : '#94A3B8';
        var cueExamples = (cue.examples && cue.examples.length > 0) ? cue.examples.join(' / ') : '';
        var cueTitle = cueExamples ? CUE_LABELS[cueKey] + ': ' + cueExamples : CUE_LABELS[cueKey];
        cueBars +=
          '<div style="margin-bottom:6px;" title="' + cueTitle.replace(/"/g, '&quot;') + '">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:2px;">' +
              '<span style="font-size:11px;color:' + TEXT_MUTED + ';">' + CUE_LABELS[cueKey] + '</span>' +
              '<span style="font-size:11px;color:' + cueColor + ';font-weight:600;">' + (cueScore > 0 ? '+' : '') + cueScore.toFixed(2) + '</span>' +
            '</div>' +
            '<div style="height:4px;border-radius:2px;background:linear-gradient(to right,#7CB3E0,#94A3B8,#D98282);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + cuePct.toFixed(1) + '% - 4px);width:8px;height:8px;border-radius:50%;background:' + cueColor + ';border:1.5px solid rgba(255,255,255,0.7);"></div>' +
            '</div>' +
          '</div>';
      }
      if (cueBars) {
        html +=
          '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:6px;">Bias Dimensions</div>' +
            cueBars +
            '<div style="font-size:10px;color:' + TEXT_FAINT + ';margin-top:4px;">Hover each bar for examples. Left = left-leaning signal, Right = right-leaning signal.</div>' +
          '</div>';
      }
    }

    // Polarization gauge
    if (polarization !== null) {
      var polColor = polarization > 75 ? "#F87171" : polarization > 50 ? "#FBBF24" : polarization > 20 ? "#60A5FA" : "#4ADE80";
      var polLabel = polarization > 75 ? L("pol_extreme") : polarization > 50 ? L("pol_high") : polarization > 20 ? L("pol_moderate") : L("pol_low");
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Polarization</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:rgba(0,0,0,.06);position:relative;">' +
              '<div style="height:100%;width:' + polarization + '%;border-radius:3px;background:' + polColor + ';"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + polColor + ';font-weight:600;">' + polLabel + '</span>' +
          '</div>' +
        '</div>';
    }

    // Sentiment gauge (VADER Upgrade #3)
    var sentData = analysis.sentimentAnalysis || null;
    var sentScore = sentData ? sentData.overallScore : (typeof analysis.sentimentScore === "number" ? analysis.sentimentScore : null);
    if (sentScore !== null) {
      var sentColor = sentScore > 0.4 ? "#4ADE80" : sentScore > 0.1 ? "#86EFAC" : sentScore > -0.1 ? "#94A3B8" : sentScore > -0.4 ? "#FCA5A5" : "#F87171";
      var sentLabel = sentScore > 0.4 ? "Strongly Positive" : sentScore > 0.1 ? "Mildly Positive" : sentScore > -0.1 ? "Neutral" : sentScore > -0.4 ? "Mildly Negative" : "Strongly Negative";
      var sentBarPct = ((sentScore + 1) / 2 * 100).toFixed(1);
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Sentiment</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#F87171,#94A3B8,#4ADE80);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + sentBarPct + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + sentColor + ';font-weight:600;min-width:36px;text-align:right;">' +
              (sentScore > 0 ? '+' : '') + sentScore.toFixed(2) +
            '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + sentColor + ';margin-top:3px;">' + sentLabel + '</div>' +
          (sentData && sentData.headlineBodyMismatch ?
            '<div style="margin-top:5px;font-size:11px;color:#FBBF24;padding:3px 6px;border-radius:4px;background:rgba(251,191,36,0.08);border-left:2px solid #FBBF24;">' +
              'Headline-body mismatch' + (sentData.mismatchSeverity && sentData.mismatchSeverity !== "none" ? ' (' + sentData.mismatchSeverity + ')' : '') +
            '</div>' : '') +
        '</div>';
    }


    // Persuasion Score gauge (Upgrade #12 — persuasion-detection)
    var persuasionData = analysis.persuasionAnalysis || null;
    if (persuasionData && typeof persuasionData.persuasionIntensity === "number") {
      var prScore = persuasionData.persuasionIntensity;
      var prColor = prScore > 70 ? "#EA580C" : prScore > 40 ? "#F97316" : "#FB923C";
      var prLabel = prScore > 70 ? "High Manipulation" : prScore > 40 ? "Moderate" : "Low";
      var prTechniques = persuasionData.persuasionTechniques || [];
      var prHighTechs = prTechniques.filter(function(t) { return t.severity === "high"; });
      var prStrategyLabels = { emotional: "Emotional", logical_fallacy: "Logical Fallacy", social_proof: "Social Proof", authority: "Authority", none: "None" };
      var prTechLabels = {
        appeal_to_emotion: "Appeal to Emotion", appeal_to_fear: "Appeal to Fear",
        bandwagon: "Bandwagon", false_dilemma: "False Dilemma", ad_hominem: "Ad Hominem",
        straw_man: "Straw Man", appeal_to_authority: "Appeal to Authority",
        red_herring: "Red Herring", loaded_language: "Loaded Language",
        whataboutism: "Whataboutism", slippery_slope: "Slippery Slope",
        false_equivalence: "False Equivalence"
      };
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">Persuasion Score</div>' +
            (prHighTechs.length > 0 ?
              '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;background:rgba(234,88,12,0.12);color:#EA580C;border:1px solid rgba(234,88,12,0.2);">' +
                prHighTechs.length + ' HIGH</span>' : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#FED7AA,#F97316,#EA580C);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + prScore + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + prColor + ';font-weight:600;min-width:36px;text-align:right;">' + prScore + '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + prColor + ';margin-top:3px;">' + prLabel +
            (persuasionData.dominantStrategy && persuasionData.dominantStrategy !== "none" ?
              ' · ' + (prStrategyLabels[persuasionData.dominantStrategy] || persuasionData.dominantStrategy) : '') +
          '</div>' +
          (prTechniques.length > 0 ?
            '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">' +
              prTechniques.slice(0, 5).map(function(t) {
                var tColor = t.severity === "high" ? "#EA580C" : t.severity === "medium" ? "#F97316" : "#FB923C";
                return '<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:8px;background:rgba(249,115,22,0.1);color:' + tColor + ';border:1px solid rgba(249,115,22,0.18);" title="' + escapeHtml(t.explanation || "") + '">' + escapeHtml(prTechLabels[t.technique] || t.technique) + '</span>';
              }).join('') +
            '</div>' : '') +
        '</div>';
    }

    // Intent callout
    if (intent.explanation && (intentType === "persuasion" || intentType === "manipulation")) {
      html +=
        '<div style="margin-bottom:10px;padding:6px 10px;border-radius:6px;background:' + (INTENT_BG[intentType] || "transparent") + ';' +
          'border-left:2px solid ' + intentColor + ';font-size:13px;color:' + TEXT_MUTED + ';line-height:1.4;">' +
          '<strong style="color:' + intentColor + ';">Intent: </strong>' + escapeHtml(intent.explanation) +
        '</div>';
    }

    // Spectacle Score gauge (spectacle-detection upgrade)
    var spectacleData = analysis.spectacleAnalysis || null;
    if (spectacleData && typeof spectacleData.spectacleScore === "number") {
      var spScore = spectacleData.spectacleScore;
      var spColor = spScore > 70 ? "#9333EA" : spScore > 40 ? "#A855F7" : "#C084FC";
      var spLabel = spScore > 70 ? "High Spectacle" : spScore > 40 ? "Moderate" : "Low";
      var spPatterns = spectacleData.patterns || [];
      var spHighPatterns = spPatterns.filter(function(p) { return p.severity === "high"; });
      var spHlScore = spectacleData.headlineManipulation && typeof spectacleData.headlineManipulation.score === "number"
        ? spectacleData.headlineManipulation.score : null;
      var spPatternLabels = { outrage_bait: "Outrage Bait", fear_mongering: "Fear Mongering", false_urgency: "False Urgency", emotional_manipulation: "Emotional Manip.", clickbait_framing: "Clickbait", tribalism_trigger: "Tribalism", synthetic_controversy: "Synth. Controversy" };
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">Spectacle Score</div>' +
            (spHighPatterns.length > 0 ?
              '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;background:rgba(147,51,234,0.12);color:#9333EA;border:1px solid rgba(147,51,234,0.2);">' +
                spHighPatterns.length + ' HIGH</span>' : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#E9D5FF,#A855F7,#6B21A8);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + spScore + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + spColor + ';font-weight:600;min-width:36px;text-align:right;">' + spScore + '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + spColor + ';margin-top:3px;">' + spLabel +
            (spHlScore !== null && spHlScore > 60 ? ' \u00B7 Headline manip. (' + spHlScore + ')' : '') +
          '</div>' +
          (spPatterns.length > 0 ?
            '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">' +
              spPatterns.slice(0, 4).map(function(p) {
                var pColor = p.severity === "high" ? "#9333EA" : p.severity === "medium" ? "#A855F7" : "#C084FC";
                return '<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:8px;background:rgba(168,85,247,0.1);color:' + pColor + ';border:1px solid rgba(168,85,247,0.18);">' + escapeHtml(spPatternLabels[p.type] || p.type) + '</span>';
              }).join('') +
            '</div>' : '') +
        '</div>';
    }

    // Multilingual Bias section (Upgrade #7 — multilingual-bias)
    var mlData = analysis.multilingualAnalysis || null;
    if (mlData && Array.isArray(mlData.detectedBiasMarkers) && mlData.detectedBiasMarkers.length > 0) {
      var mlLangLabels = { ko: "Korean", es: "Spanish", fr: "French", de: "German", ar: "Arabic", ja: "Japanese" };
      var mlLangLabel = mlLangLabels[detectedLang] || detectedLang.toUpperCase();
      var mlHigh = mlData.detectedBiasMarkers.filter(function(m) { return m.severity === "high"; }).length;
      var mlMed  = mlData.detectedBiasMarkers.filter(function(m) { return m.severity === "medium"; }).length;
      var mlTrBiasColor = { none: "#22C55E", low: "#60A5FA", medium: "#F59E0B", high: "#EF4444" };
      var mlTrColor = mlTrBiasColor[mlData.translationBiasRisk] || "#94A3B8";
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">' + mlLangLabel + ' Bias Markers</div>' +
            (mlHigh > 0 ?
              '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;background:rgba(20,184,166,0.12);color:#14B8A6;border:1px solid rgba(20,184,166,0.25);">' +
                mlHigh + ' HIGH</span>' : '') +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px;">' +
            mlData.detectedBiasMarkers.slice(0, 5).map(function(m) {
              var mColor = m.severity === "high" ? "#14B8A6" : m.severity === "medium" ? "#2DD4BF" : "#5EEAD4";
              var mBg = m.severity === "high" ? "rgba(20,184,166,0.14)" : "rgba(20,184,166,0.08)";
              return '<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:8px;background:' + mBg + ';color:' + mColor + ';border:1px solid rgba(20,184,166,0.2);cursor:default;" title="' + escapeHtml(m.example || "") + ' — ' + escapeHtml(m.explanation || "") + '">' + escapeHtml(m.marker) + '</span>';
            }).join('') +
          '</div>' +
          (mlData.culturalContextNotes ?
            '<div style="font-size:11px;color:' + TEXT_FAINT + ';line-height:1.4;margin-bottom:4px;">' + escapeHtml(mlData.culturalContextNotes) + '</div>' : '') +
          (mlData.translationBiasRisk && mlData.translationBiasRisk !== "none" ?
            '<div style="font-size:11px;color:' + mlTrColor + ';padding:3px 6px;border-radius:4px;background:rgba(20,184,166,0.06);border-left:2px solid ' + mlTrColor + ';">' +
              'Translation bias: ' + mlData.translationBiasRisk +
              (mlData.translationBiasNote ? ' \u2014 ' + escapeHtml(mlData.translationBiasNote) : '') +
            '</div>' : '') +
        '</div>';
    }

    // Claim breakdown bar
    if (claims.length > 0) {
      var total = claims.length;
      var cTypes = {};
      claims.forEach(function (c) { cTypes[c.type] = (cTypes[c.type] || 0) + 1; });
      var typeColorsMap = { contentious: "#FBBF24", unsupported: "#F87171", misleading: "#F87171", opinion_as_fact: "#FBBF24", omission: "#D4A84A", verified: "#4ADE80", neutral: "#94A3B8" };
      var typeLabelsMap = { contentious: L("claimType_contentious"), unsupported: L("claimType_unsupported"), misleading: L("claimType_misleading"), opinion_as_fact: L("claimType_opinion_as_fact"), omission: L("claimType_omission"), verified: L("claimType_verified"), neutral: L("claimType_neutral") };
      var barSegments = "";
      var legendParts = "";
      var typeOrder = ["misleading", "unsupported", "contentious", "opinion_as_fact", "omission", "neutral", "verified"];
      for (var ti = 0; ti < typeOrder.length; ti++) {
        var t = typeOrder[ti];
        if (!cTypes[t]) continue;
        var pct = (cTypes[t] / total * 100).toFixed(1);
        barSegments += '<div style="width:' + pct + '%;height:100%;background:' + (typeColorsMap[t] || "#94A3B8") + ';"></div>';
        legendParts += '<div style="display:flex;align-items:center;gap:4px;font-size:12px;color:' + TEXT_MUTED + ';">' +
          '<span style="width:6px;height:6px;border-radius:50%;background:' + (typeColorsMap[t] || "#94A3B8") + ';flex-shrink:0;"></span>' +
          '<span>' + cTypes[t] + ' ' + (typeLabelsMap[t] || t) + '</span></div>';
      }

      var tipText = "";
      if (highCount >= 3) tipText = L("tip_scrutiny");
      else if (intentType === "manipulation") tipText = L("tip_manipulative");
      else if (intentType === "persuasion") tipText = L("tip_persuasion");
      else if (verifiedCount >= total * 0.5) tipText = L("tip_reliable");
      else if (highCount === 0) tipText = L("tip_noFlags");

      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Claim Breakdown</div>' +
          '<div style="height:6px;border-radius:3px;overflow:hidden;display:flex;background:rgba(0,0,0,.04);margin-bottom:6px;">' + barSegments + '</div>' +
          '<div style="display:flex;flex-direction:column;gap:2px;margin-bottom:' + (tipText ? '6px' : '0') + ';">' + legendParts + '</div>' +
          (tipText ?
            '<div style="font-size:12px;color:' + TEXT_BODY + ';padding:5px 8px;border-radius:4px;background:rgba(0,0,0,.02);border-left:2px solid ' +
              (highCount >= 3 || intentType === "manipulation" ? "#F87171" : intentType === "persuasion" ? "#FBBF24" : "#4ADE80") + ';line-height:1.35;">\uD83D\uDCA1 ' + tipText + '</div>' : '') +
        '</div>';
    }

    // Deep Analysis link
    html +=
      '<div style="text-align:center;">' +
        '<button class="spectrum-summary-deep" style="width:100%;padding:8px 10px;border-radius:8px;cursor:pointer;' +
          'font-size:13px;font-weight:600;font-family:' + FONT_SANS + ';letter-spacing:.3px;' +
          'background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08));' +
          'border:1px solid rgba(99,102,241,0.2);color:#818CF8;transition:all .2s;">' +
          '\u2728 Full Deep Analysis</button>' +
      '</div>';

    return html;
  }

  function formatTimestamp(seconds) {
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  var __videoSidebarResizeHandler = null;
  var __videoUserScrolled = false;

  // ============================================================
  // VIDEO HUD OVERLAY — Jarvis-style transparent display
  // ============================================================

  function _injectOverlayStyles() {
    if (document.getElementById("spectrum-overlay-styles")) return;
    var s = document.createElement("style");
    s.id = "spectrum-overlay-styles";
    s.textContent =
      '#spectrum-video-hud{position:fixed;z-index:2147483640;bottom:80px;left:24px;max-width:560px;min-width:300px;' +
      'background:rgba(8,8,12,0.25);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);' +
      'border:1px solid rgba(255,255,255,0.04);border-radius:16px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:rgba(255,255,255,0.95);font-size:16px;' +
      'opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s ease;box-shadow:0 8px 32px rgba(0,0,0,0.35);}' +
      '#spectrum-video-hud.visible{opacity:1;transform:translateY(0);}' +
      '#spectrum-hud-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;gap:10px;}' +
      '.shud-left{display:flex;align-items:center;gap:9px;}' +
      '.shud-right{display:flex;align-items:center;gap:12px;}' +
      '.shud-brand{font-size:13px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,0.3);}' +
      '.shud-live{font-size:12px;font-weight:700;color:#EF4444;letter-spacing:.5px;}' +
      '.spectrum-hud-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#EF4444;animation:spectrum-hud-pulse 1.5s ease infinite;}' +
      '@keyframes spectrum-hud-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}' +
      '#spectrum-hud-lean{font-size:13px;font-weight:600;}' +
      '#spectrum-hud-count{font-size:13px;color:rgba(255,255,255,0.3);}' +
      '#spectrum-hud-full{cursor:pointer;font-size:11px;font-weight:600;letter-spacing:1px;color:rgba(129,140,248,0.5);' +
      'padding:3px 10px;border:1px solid rgba(129,140,248,0.2);border-radius:4px;transition:color .15s,border-color .15s;text-transform:uppercase;}' +
      '#spectrum-hud-full:hover{color:rgba(129,140,248,0.9);border-color:rgba(129,140,248,0.5);}' +
      '#spectrum-hud-close{cursor:pointer;font-size:20px;color:rgba(255,255,255,0.2);transition:color .15s;line-height:1;}' +
      '#spectrum-hud-close:hover{color:rgba(255,255,255,0.6);}' +
      '#spectrum-hud-feed{display:flex;flex-direction:column;gap:0;max-height:calc(100vh - 220px);overflow-y:auto;scrollbar-width:none;}' +
      '#spectrum-hud-feed::-webkit-scrollbar{display:none;}' +
      '.shud-card{padding:8px 18px 10px;border-top:1px solid rgba(255,255,255,0.04);' +
      'opacity:0;transition:opacity .5s ease;cursor:pointer;}' +
      '.shud-card.visible{opacity:1;}' +
      '.shud-card.fading{opacity:0;transition:opacity .6s ease;}' +
      '.shud-card-ts{font-family:"Courier New",monospace;font-size:11px;color:rgba(255,255,255,0.2);margin-bottom:4px;padding-top:6px;}' +
      '.shud-card-quote{font-size:13px;line-height:1.4;color:rgba(255,255,255,0.7);font-style:italic;margin-top:6px;' +
      'padding-left:8px;border-left:1px solid rgba(129,140,248,0.25);}' +
      '.shud-card-badge{display:flex;align-items:center;gap:8px;margin-bottom:4px;}' +
      '.shud-type{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}' +
      '.shud-severity{font-size:11px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.3px;}' +
      '.shud-card-explanation{font-size:16px;line-height:1.45;color:rgba(255,255,255,0.92);}' +
      '.shud-card:last-child{border-bottom:none;}' +
      '#spectrum-detail{position:fixed;z-index:2147483641;bottom:80px;right:24px;width:440px;max-height:calc(100vh - 160px);' +
      'background:rgba(8,8,12,0.25);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);' +
      'border:1px solid rgba(255,255,255,0.04);border-radius:16px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:rgba(255,255,255,0.95);font-size:16px;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.4);overflow-y:auto;' +
      'opacity:0;transform:translateX(12px);transition:opacity .3s ease,transform .3s ease;pointer-events:none;}' +
      '#spectrum-detail.open{opacity:1;transform:translateX(0);pointer-events:auto;}' +
      '#spectrum-detail-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px 10px;border-bottom:1px solid rgba(255,255,255,0.04);}' +
      '#spectrum-detail-header .shud-brand{font-size:12px;}' +
      '#spectrum-detail-close{cursor:pointer;font-size:20px;color:rgba(255,255,255,0.2);transition:color .15s;line-height:1;}' +
      '#spectrum-detail-close:hover{color:rgba(255,255,255,0.6);}' +
      '#spectrum-detail-body{padding:18px 20px;}' +
      '#spectrum-detail-badge{display:flex;align-items:center;gap:10px;margin-bottom:12px;}' +
      '#spectrum-detail-quote{font-size:22px;line-height:1.5;color:rgba(255,255,255,0.88);font-style:italic;' +
      'padding:12px 16px;margin-bottom:14px;border-left:3px solid rgba(129,140,248,0.4);background:rgba(255,255,255,0.02);border-radius:0 8px 8px 0;}' +
      '#spectrum-detail-explanation{font-size:20px;line-height:1.6;color:rgba(255,255,255,0.92);}';
    document.head.appendChild(s);
  }

  // Gather a readable phrasal quote centered on a segment index.
  // Expands outward until we reach minChars or hit a sentence boundary.
  function _gatherPhrasalQuote(segments, centerIdx, minChars) {
    if (!minChars) minChars = 140;
    var maxChars = 300;
    var lo = centerIdx;
    var hi = centerIdx;
    var text = segments[centerIdx].text;

    // Expand outward alternating left/right until enough context
    while (text.length < minChars && (lo > 0 || hi < segments.length - 1)) {
      if (lo > 0) {
        lo--;
        text = segments[lo].text + " " + text;
      }
      if (text.length >= minChars) break;
      if (hi < segments.length - 1) {
        hi++;
        text = text + " " + segments[hi].text;
      }
    }

    // Trim to max length at a word boundary
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > maxChars) {
      text = text.slice(0, maxChars);
      var lastSpace = text.lastIndexOf(" ");
      if (lastSpace > maxChars * 0.6) text = text.slice(0, lastSpace);
      text += "\u2026";
    }
    return text;
  }

  function _buildVideoEvents(claims, commentary, segments) {
    var events = [];
    var segmentClaims = _buildSegmentClaimMap(claims, segments);
    for (var segIdx in segmentClaims) {
      var idx = parseInt(segIdx);
      var seg = segments[idx];
      if (!seg) continue;
      for (var i = 0; i < segmentClaims[segIdx].length; i++) {
        var claim = segmentClaims[segIdx][i];
        // Use claim.sentence if it's long enough, otherwise gather from segments
        var quote = (claim.sentence && claim.sentence.length >= 60) ? claim.sentence : _gatherPhrasalQuote(segments, idx, 140);
        events.push({
          eventType: "claim", time: seg.start, quote: quote,
          claimType: claim.type, type: claim.type, severity: claim.severity,
          explanation: claim.explanation || "",
        });
      }
    }
    var segmentCommentary = _buildCommentaryMap(commentary, segments);
    for (var segIdx2 in segmentCommentary) {
      var idx2 = parseInt(segIdx2);
      var seg2 = segments[idx2];
      if (!seg2) continue;
      for (var j = 0; j < segmentCommentary[segIdx2].length; j++) {
        var cm = segmentCommentary[segIdx2][j];
        var cmQuote = _gatherPhrasalQuote(segments, idx2, 140);
        events.push({
          eventType: "commentary", time: cm.time || seg2.start,
          quote: cmQuote, category: cm.category,
          explanation: cm.text || "",
        });
      }
    }
    events.sort(function (a, b) { return a.time - b.time; });
    return events;
  }

  function _createHudShell(leanColor, leanLabel, countText) {
    _injectOverlayStyles();
    var hud = document.createElement("div");
    hud.id = "spectrum-video-hud";
    var header = document.createElement("div");
    header.id = "spectrum-hud-header";
    header.innerHTML =
      '<div class="shud-left">' +
        '<span class="shud-brand">SPECTRUM</span>' +
        '<span class="spectrum-hud-dot"></span>' +
        '<span class="shud-live">LIVE</span>' +
      '</div>' +
      '<div class="shud-right">' +
        '<span id="spectrum-hud-lean" style="color:' + leanColor + '">' + escapeHtml(leanLabel) + '</span>' +
        '<span id="spectrum-hud-count">' + escapeHtml(countText) + '</span>' +
        '<span id="spectrum-hud-full">Full Analysis</span>' +
        '<span id="spectrum-hud-close" title="Close">&times;</span>' +
      '</div>';
    hud.appendChild(header);
    var feed = document.createElement("div");
    feed.id = "spectrum-hud-feed";
    hud.appendChild(feed);

    // "Full Analysis" button opens detail panel for the most recent card
    header.querySelector("#spectrum-hud-full").addEventListener("click", function () {
      var dp = document.getElementById("spectrum-detail");
      if (dp) dp.classList.toggle("open");
    });

    // Detail panel (right side)
    var detail = document.getElementById("spectrum-detail");
    if (!detail) {
      detail = document.createElement("div");
      detail.id = "spectrum-detail";
      detail.innerHTML =
        '<div id="spectrum-detail-header">' +
          '<span class="shud-brand">FULL ANALYSIS</span>' +
          '<span id="spectrum-detail-close" title="Close">&times;</span>' +
        '</div>' +
        '<div id="spectrum-detail-body">' +
          '<div id="spectrum-detail-badge"></div>' +
          '<div id="spectrum-detail-quote"></div>' +
          '<div id="spectrum-detail-explanation"></div>' +
        '</div>';
      document.body.appendChild(detail);
      detail.querySelector("#spectrum-detail-close").addEventListener("click", function () {
        detail.classList.remove("open");
      });
    }

    return hud;
  }

  function injectVideoOverlay(analysis, segments) {
    __sidebarAnalysis = analysis;
    var existing = document.getElementById("spectrum-video-hud");
    if (existing) existing.remove();
    existing = document.getElementById("spectrum-sidebar");
    if (existing) existing.remove();
    existing = document.getElementById("spectrum-sidebar-pill");
    if (existing) existing.remove();
    var claims = analysis.claims || [];
    var flaggedCount = claims.filter(function (c) { return c.type !== "verified" && c.type !== "neutral"; }).length;
    var lean = (analysis.overallLean || "").replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[lean] || "#94A3B8";
    var leanLabel = LEAN_LABELS[lean] || analysis.overallLean || "";
    __videoEvents = _buildVideoEvents(claims, analysis.commentary || [], segments);
    var hud = _createHudShell(leanColor, leanLabel, flaggedCount + " flagged");
    document.body.appendChild(hud);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hud.classList.add("visible"); });
    });
    hud.querySelector("#spectrum-hud-close").addEventListener("click", function () {
      hud.classList.remove("visible");
      setTimeout(function () { if (hud.parentNode) hud.remove(); }, 400);
      VideoPlaybackTracker.destroy();
    });
    removeFloatingBadge();
  }

  function injectVideoOverlayInstant(articleData, sourceLean, sourceName) {
    var existing = document.getElementById("spectrum-video-hud");
    if (existing) existing.remove();
    existing = document.getElementById("spectrum-sidebar");
    if (existing) existing.remove();
    var lean = (sourceLean || "").replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[lean] || "#94A3B8";
    var leanLabel = lean ? (LEAN_LABELS[lean] || sourceLean) : "analyzing\u2026";
    __videoEvents = [];
    var hud = _createHudShell(leanColor, leanLabel, "analyzing\u2026");
    hud.dataset.chunkMode = "true";
    document.body.appendChild(hud);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hud.classList.add("visible"); });
    });
    hud.querySelector("#spectrum-hud-close").addEventListener("click", function () {
      hud.classList.remove("visible");
      setTimeout(function () { if (hud.parentNode) hud.remove(); }, 400);
      VideoPlaybackTracker.destroy();
      ChunkScheduler.destroy();
    });
    removeFloatingBadge();
  }

  // ============================================================
  // VIDEO SIDEBAR (legacy — replaced by HUD overlay above)
  // ============================================================
  function injectVideoSidebar(analysis, segments) {
    __sidebarAnalysis = analysis;
    var existing = document.getElementById("spectrum-sidebar");
    if (existing) existing.remove();
    var existingPill = document.getElementById("spectrum-sidebar-pill");
    if (existingPill) existingPill.remove();

    var claims = analysis.claims || [];
    var flaggedCount = claims.filter(function (c) { return c.type !== "verified" && c.type !== "neutral"; }).length;
    var lean = (analysis.overallLean || "").replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[lean] || "#94A3B8";
    var leanLabel = LEAN_LABELS[lean] || analysis.overallLean || "";
    var channelName = "";
    try { channelName = document.querySelector("#channel-name a, #owner-name a, ytd-channel-name a").textContent.trim(); } catch (e) {}

    var segmentClaims = _buildSegmentClaimMap(claims, segments);
    var segmentCommentary = _buildCommentaryMap(analysis.commentary || [], segments);
    var commentaryCount = (analysis.commentary || []).length;

    var isNarrow = window.innerWidth < 1200;

    // Inject styles
    _injectVideoStyles();

    var sidebar = document.createElement("div");
    sidebar.id = "spectrum-sidebar";
    sidebar.dataset.videoMode = "true";
    sidebar.style.cssText =
      "position:fixed;z-index:2147483640;right:20px;top:80px;width:360px;" +
      "max-height:calc(100vh - 120px);overflow:hidden;display:flex;flex-direction:column;" +
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_HEAD + ";" +
      "font-family:" + FONT_SANS + ";font-size:14px;border-radius:10px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 4px 24px rgba(0,0,0,.1),0 1px 6px rgba(0,0,0,.04);" +
      "opacity:0;transform:translateX(20px);transition:opacity .3s ease,transform .3s ease;";

    // Header with LIVE indicator
    var header = document.createElement("div");
    header.style.cssText = "padding:14px 16px 0;flex-shrink:0;";
    header.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<span style="font-weight:700;letter-spacing:1.5px;font-size:12px;color:' + TEXT_FAINT + ';">SPECTRUM</span>' +
        '<span class="spectrum-live-dot"></span>' +
        '<span style="font-size:10px;font-weight:700;color:#EF4444;letter-spacing:.5px;">LIVE</span>' +
        (channelName ? '<span style="font-size:11px;color:' + TEXT_MUTED + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px;">' + escapeHtml(channelName) + '</span>' : '') +
        '<span style="padding:1px 7px;border-radius:10px;font-size:9px;font-weight:600;background:' + leanColor + '15;color:' + leanColor + ';border:1px solid ' + leanColor + '25;">' + leanLabel + '</span>' +
        '<span id="spectrum-sidebar-min" style="margin-left:auto;cursor:pointer;font-size:18px;color:' + TEXT_FAINT + ';line-height:1;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background .15s;" title="Minimize">\u2212</span>' +
      '</div>';
    sidebar.appendChild(header);

    // Tabs: Transcript | Summary
    var tabBar = document.createElement("div");
    tabBar.style.cssText = "display:flex;gap:0;padding:0 16px;flex-shrink:0;border-bottom:1px solid " + BORDER + ";";
    var liveTabBtn = document.createElement("button");
    liveTabBtn.textContent = L("tab_transcript");
    liveTabBtn.style.cssText =
      "flex:1;padding:8px 0;border:none;background:transparent;cursor:pointer;font-family:" + FONT_SANS + ";" +
      "font-size:12px;font-weight:700;color:#6366F1;border-bottom:2px solid #6366F1;transition:all .15s;";
    var summaryTabBtn = document.createElement("button");
    summaryTabBtn.textContent = L("tab_summary");
    summaryTabBtn.style.cssText =
      "flex:1;padding:8px 0;border:none;background:transparent;cursor:pointer;font-family:" + FONT_SANS + ";" +
      "font-size:12px;font-weight:600;color:" + TEXT_FAINT + ";border-bottom:2px solid transparent;transition:all .15s;";
    tabBar.appendChild(liveTabBtn);
    tabBar.appendChild(summaryTabBtn);
    sidebar.appendChild(tabBar);

    // Live tab — transcript feed
    var liveTab = document.createElement("div");
    liveTab.id = "spectrum-live-tab";
    liveTab.style.cssText = "display:flex;flex-direction:column;flex:1;overflow:hidden;";

    // Flagged claims counter bar
    var counterBar = document.createElement("div");
    counterBar.id = "spectrum-live-counter";
    counterBar.style.cssText =
      "padding:6px 16px;flex-shrink:0;display:flex;align-items:center;gap:8px;" +
      "border-bottom:1px solid " + BORDER + ";font-size:11px;color:" + TEXT_FAINT + ";";
    counterBar.innerHTML =
      '<span>' + flaggedCount + (__spectrumLang === "ko" ? L("counter_flaggedClaims") : (" flagged claim" + (flaggedCount !== 1 ? "s" : ""))) + '</span>' +
      (commentaryCount > 0 ? '<span style="color:#8B5CF6;">\u00B7 ' + commentaryCount + L("counter_notes") + '</span>' : '') +
      '<span style="margin-left:auto;font-size:10px;color:' + TEXT_FAINT + ';">' + segments.length + L("counter_segments") + '</span>';
    liveTab.appendChild(counterBar);

    // Transcript container — pre-renders ALL segments
    var transcriptContainer = document.createElement("div");
    transcriptContainer.id = "spectrum-transcript-feed";
    transcriptContainer.style.cssText = "flex:1;overflow-y:auto;padding:4px 0;";

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var row = document.createElement("div");
      row.className = "spectrum-seg";
      row.dataset.segIdx = i;

      var ts = document.createElement("span");
      ts.className = "spectrum-seg-ts";
      ts.textContent = formatTimestamp(seg.start);

      var txt = document.createElement("span");
      txt.className = "spectrum-seg-text";
      txt.textContent = seg.text;

      row.appendChild(ts);
      row.appendChild(txt);

      // Inline claim annotations under matched segments
      if (segmentClaims[i]) {
        row.classList.add("has-claim");
        for (var ci = 0; ci < segmentClaims[i].length; ci++) {
          var claim = segmentClaims[i][ci];
          var claimColor = getClaimColor(claim);
          var pillBg = getClaimPill(claim);
          var pillText = getClaimPillText(claim);
          var typeLabel = getClaimTypeLabel(claim);

          var annotation = document.createElement("div");
          annotation.className = "spectrum-seg-claim";
          annotation.style.borderLeftColor = claimColor;
          annotation.innerHTML =
            '<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">' +
              '<span style="display:inline-block;padding:1px 5px;border-radius:3px;font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.3px;background:' + pillBg + ';color:' + pillText + ';">' + escapeHtml(typeLabel) + '</span>' +
              (claim.severity ? '<span style="font-size:8px;color:' + TEXT_FAINT + ';">' + claim.severity + '</span>' : '') +
            '</div>' +
            '<div style="font-size:11px;color:' + TEXT_BODY + ';line-height:1.35;">' + escapeHtml(claim.explanation || "") + '</div>';
          row.appendChild(annotation);
        }
      }

      // Click segment to seek video
      (function (startTime) {
        row.addEventListener("click", function () {
          var video = document.querySelector("video");
          if (video) {
            video.currentTime = startTime;
            __videoUserScrolled = false;
          }
        });
      })(seg.start);

      transcriptContainer.appendChild(row);

      // Insert commentary cards after this segment (pre-rendered, hidden)
      if (segmentCommentary[i]) {
        for (var cmi = 0; cmi < segmentCommentary[i].length; cmi++) {
          var cm = segmentCommentary[i][cmi];
          var cmColor = COMMENTARY_COLORS[cm.category] || "#8B5CF6";
          var cmIcon = COMMENTARY_ICONS[cm.category] || "\u25B8";
          var cmLabel = COMMENTARY_LABELS[cm.category] || cm.category || "Note";

          var cmCard = document.createElement("div");
          cmCard.className = "spectrum-commentary";
          cmCard.dataset.cmTime = cm.time || 0;
          cmCard.innerHTML =
            '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">' +
              '<span style="font-size:11px;color:' + cmColor + ';">' + cmIcon + '</span>' +
              '<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:' + cmColor + ';">' + escapeHtml(cmLabel) + '</span>' +
              '<span style="font-size:9px;color:' + TEXT_FAINT + ';">' + formatTimestamp(cm.time || 0) + '</span>' +
            '</div>' +
            '<div style="font-size:12px;color:' + TEXT_BODY + ';line-height:1.4;">' + escapeHtml(cm.text || "") + '</div>';

          transcriptContainer.appendChild(cmCard);
        }
      }
    }

    // Detect manual scroll → pause auto-scroll
    __videoUserScrolled = false;
    transcriptContainer.addEventListener("wheel", function () { __videoUserScrolled = true; });
    transcriptContainer.addEventListener("touchmove", function () { __videoUserScrolled = true; });

    liveTab.appendChild(transcriptContainer);
    sidebar.appendChild(liveTab);

    // Summary tab
    var summaryTab = document.createElement("div");
    summaryTab.id = "spectrum-summary-tab";
    summaryTab.style.cssText = "display:none;flex:1;overflow-y:auto;padding:14px 16px;";
    summaryTab.innerHTML = buildSummaryHTML(analysis);
    sidebar.appendChild(summaryTab);

    document.body.appendChild(sidebar);

    // Wire up Deep Analysis button in summary tab
    var summaryDeepBtn = summaryTab.querySelector(".spectrum-summary-deep");
    if (summaryDeepBtn) {
      summaryDeepBtn.addEventListener("click", function () {
        if (!__lastArticleData) return;
        chrome.runtime.sendMessage({
          type: "OPEN_DEEP_ANALYSIS",
          data: {
            articleText: __lastArticleData.text,
            articleUrl: __lastArticleData.url || window.location.href,
            articleTitle: __lastArticleData.title || document.title,
            sourceDomain: __lastArticleData.domain || window.location.hostname,
            images: __lastArticleData.images || [],
            imageDataUrls: __lastArticleData.imageDataUrls || [],
            author: __lastArticleData.author || null,
            isYouTube: __lastArticleData.isYouTube || false,
            transcript: __lastArticleData.transcript || null,
            detectedLanguage: (__lastAnalysis && __lastAnalysis.detectedLanguage) || (__lastArticleData && __lastArticleData.detectedLanguage) || null,
            fastAnalysis: __lastAnalysis || null,
          }
        }).catch(function () {});
      });
      summaryDeepBtn.addEventListener("mouseenter", function () {
        this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))";
        this.style.borderColor = "rgba(99,102,241,0.35)";
      });
      summaryDeepBtn.addEventListener("mouseleave", function () {
        this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))";
        this.style.borderColor = "rgba(99,102,241,0.2)";
      });
    }

    // Tab switching
    liveTabBtn.addEventListener("click", function () {
      liveTab.style.display = "flex";
      summaryTab.style.display = "none";
      liveTabBtn.style.color = "#6366F1";
      liveTabBtn.style.borderBottomColor = "#6366F1";
      liveTabBtn.style.fontWeight = "700";
      summaryTabBtn.style.color = TEXT_FAINT;
      summaryTabBtn.style.borderBottomColor = "transparent";
      summaryTabBtn.style.fontWeight = "600";
    });
    summaryTabBtn.addEventListener("click", function () {
      liveTab.style.display = "none";
      summaryTab.style.display = "block";
      summaryTabBtn.style.color = "#6366F1";
      summaryTabBtn.style.borderBottomColor = "#6366F1";
      summaryTabBtn.style.fontWeight = "700";
      liveTabBtn.style.color = TEXT_FAINT;
      liveTabBtn.style.borderBottomColor = "transparent";
      liveTabBtn.style.fontWeight = "600";
    });

    // Minimize
    var minBtn = sidebar.querySelector("#spectrum-sidebar-min");
    if (minBtn) {
      minBtn.addEventListener("mouseenter", function () { this.style.background = "rgba(0,0,0,.05)"; });
      minBtn.addEventListener("mouseleave", function () { this.style.background = "transparent"; });
      minBtn.addEventListener("click", function () { collapseVideoSidebar(); });
    }

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sidebar.style.opacity = "1";
        sidebar.style.transform = "translateX(0)";
      });
    });

    removeFloatingBadge();

    // Narrow viewport → collapse immediately
    if (isNarrow) {
      sidebar.style.opacity = "0";
      sidebar.style.transform = "translateX(20px)";
      setTimeout(function () { if (sidebar.parentNode) sidebar.remove(); }, 10);
      showVideoSidebarPill(analysis);
    }

    // Resize handler
    if (__videoSidebarResizeHandler) window.removeEventListener("resize", __videoSidebarResizeHandler);
    __videoSidebarResizeHandler = function () {
      var narrow = window.innerWidth < 1200;
      var sb = document.getElementById("spectrum-sidebar");
      var pill = document.getElementById("spectrum-sidebar-pill");
      if (narrow && sb) { collapseVideoSidebar(); }
      else if (!narrow && pill && !sb) { expandVideoSidebar(); }
    };
    window.addEventListener("resize", __videoSidebarResizeHandler);
  }

  function _buildSegmentClaimMap(claims, segments) {
    var map = {};
    for (var i = 0; i < claims.length; i++) {
      var claim = claims[i];
      var sentence = (claim.sentence || "").toLowerCase();
      if (!sentence) continue;

      var words = sentence.split(/\s+/).slice(0, 8);
      var bestIdx = -1;
      var bestScore = 0;

      for (var j = 0; j < segments.length; j++) {
        var segText = segments[j].text.toLowerCase();
        var score = 0;
        for (var w = 0; w < words.length; w++) {
          if (words[w].length > 2 && segText.indexOf(words[w]) !== -1) score++;
        }
        if (j + 1 < segments.length) {
          var combo = segText + " " + segments[j + 1].text.toLowerCase();
          var comboScore = 0;
          for (var w2 = 0; w2 < words.length; w2++) {
            if (words[w2].length > 2 && combo.indexOf(words[w2]) !== -1) comboScore++;
          }
          if (comboScore > score) score = comboScore;
        }
        if (score > bestScore) {
          bestScore = score;
          bestIdx = j;
        }
      }

      if (bestIdx >= 0 && bestScore >= Math.min(3, words.length)) {
        if (!map[bestIdx]) map[bestIdx] = [];
        map[bestIdx].push(claim);
      }
    }
    return map;
  }

  function _buildCommentaryMap(commentary, segments) {
    var map = {};
    if (!commentary || !segments || segments.length === 0) return map;
    for (var i = 0; i < commentary.length; i++) {
      var entry = commentary[i];
      var time = entry.time || 0;
      // Find segment whose start <= entry.time (binary-style from end)
      var bestIdx = 0;
      for (var j = segments.length - 1; j >= 0; j--) {
        if (segments[j].start <= time) { bestIdx = j; break; }
      }
      // Secondary: check nearby segments for text match
      if (entry.segment) {
        var needle = entry.segment.toLowerCase();
        var lo = Math.max(0, bestIdx - 2);
        var hi = Math.min(segments.length - 1, bestIdx + 2);
        for (var k = lo; k <= hi; k++) {
          if (segments[k].text.toLowerCase().indexOf(needle) !== -1) { bestIdx = k; break; }
        }
      }
      if (!map[bestIdx]) map[bestIdx] = [];
      map[bestIdx].push(entry);
    }
    return map;
  }

  function _injectVideoStyles() {
    if (document.getElementById("spectrum-video-styles")) return;
    var style = document.createElement("style");
    style.id = "spectrum-video-styles";
    style.textContent =
      ".spectrum-seg{display:flex;flex-wrap:wrap;gap:4px;padding:6px 16px;cursor:pointer;transition:all .2s ease;opacity:.35;border-left:3px solid transparent;}" +
      ".spectrum-seg:hover{background:rgba(99,102,241,.04);}" +
      ".spectrum-seg.past{opacity:.65;}" +
      ".spectrum-seg.active{opacity:1;background:rgba(99,102,241,.06);border-left-color:#6366F1;}" +
      ".spectrum-seg.has-claim .spectrum-seg-text{font-weight:500;}" +
      ".spectrum-seg-ts{flex-shrink:0;width:42px;font-family:'Courier New',monospace;font-size:10px;color:" + TEXT_FAINT + ";padding-top:2px;}" +
      ".spectrum-seg-text{flex:1;font-size:13px;line-height:1.45;color:" + TEXT_BODY + ";}" +
      ".spectrum-seg-claim{width:100%;margin:0 0 0 46px;padding:6px 8px;border-radius:4px;background:rgba(99,102,241,.04);" +
        "border-left:2px solid #6366F1;font-size:11px;max-height:0;overflow:hidden;opacity:0;transition:max-height .3s ease,opacity .3s ease,margin .3s ease;}" +
      ".spectrum-seg.active .spectrum-seg-claim,.spectrum-seg.past .spectrum-seg-claim{max-height:200px;opacity:1;margin:4px 0 2px 46px;}" +
      ".spectrum-live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#EF4444;animation:spectrum-live-pulse 1.5s ease infinite;}" +
      "@keyframes spectrum-live-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}" +
      "#spectrum-transcript-feed::-webkit-scrollbar{width:3px}" +
      "#spectrum-transcript-feed::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:2px}" +
      "#spectrum-transcript-feed::-webkit-scrollbar-track{background:transparent}" +
      ".spectrum-commentary{padding:0 16px 0 52px;max-height:0;overflow:hidden;opacity:0;border-left:3px solid transparent;" +
        "transition:max-height .4s ease,opacity .4s ease,padding .4s ease;}" +
      ".spectrum-commentary.revealed{max-height:150px;opacity:1;padding:6px 16px 6px 52px;" +
        "background:rgba(139,92,246,.03);border-left-color:rgba(139,92,246,.25);}";
    document.head.appendChild(style);
  }

  function collapseVideoSidebar() {
    var sidebar = document.getElementById("spectrum-sidebar");
    var isChunkMode = sidebar && sidebar.dataset.chunkMode === "true";
    if (sidebar) {
      sidebar.style.opacity = "0";
      sidebar.style.transform = "translateX(20px)";
      setTimeout(function () { if (sidebar.parentNode) sidebar.remove(); }, 300);
    }
    if (isChunkMode) {
      // Chunk mode pill
      var chunkPill = document.createElement("div");
      chunkPill.id = "spectrum-sidebar-pill";
      chunkPill.style.cssText =
        "position:fixed;z-index:2147483640;bottom:20px;right:20px;" +
        "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
        "padding:8px 16px;border-radius:24px;font-size:11px;font-weight:500;" +
        "font-family:" + FONT_SANS + ";box-shadow:0 2px 16px rgba(0,0,0,.1);" +
        "border:1px solid " + BORDER + ";display:flex;align-items:center;gap:8px;" +
        "cursor:pointer;";
      var flagged = ChunkScheduler._accumulatedClaims.filter(function (c) { return c.type !== "verified" && c.type !== "neutral"; }).length;
      chunkPill.innerHTML = '<span class="spectrum-live-dot" style="width:6px;height:6px;"></span><span>\u25B6 LIVE \u00B7 ' + flagged + ' flagged</span>';
      chunkPill.addEventListener("click", function () { expandVideoSidebar(); });
      document.body.appendChild(chunkPill);
    } else if (__sidebarAnalysis) {
      showVideoSidebarPill(__sidebarAnalysis);
    }
  }

  function expandVideoSidebar() {
    var pill = document.getElementById("spectrum-sidebar-pill");
    if (pill) pill.remove();
    // Check if we're in chunk mode
    if (ChunkScheduler._articleData && __videoSegments) {
      injectVideoSidebarInstant(ChunkScheduler._articleData, ChunkScheduler._sourceLean || "", ChunkScheduler._sourceName || "");
      VideoPlaybackTracker.reattach();
      ChunkScheduler._reinjectCompletedCards();
    } else if (__sidebarAnalysis && __videoSegments) {
      injectVideoSidebar(__sidebarAnalysis, __videoSegments);
      VideoPlaybackTracker.reattach();
    }
  }

  function showVideoSidebarPill(analysis) {
    var existing = document.getElementById("spectrum-sidebar-pill");
    if (existing) existing.remove();
    var claims = analysis.claims || [];
    var flaggedCount = claims.filter(function (c) { return c.type !== "verified" && c.type !== "neutral"; }).length;
    var lean = (analysis.overallLean || "").replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[lean] || "#94A3B8";
    var leanLabel = LEAN_LABELS[lean] || analysis.overallLean || "";

    var pill = document.createElement("div");
    pill.id = "spectrum-sidebar-pill";
    pill.style.cssText =
      "position:fixed;z-index:2147483640;bottom:20px;right:20px;" +
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:8px 16px;border-radius:24px;font-size:11px;font-weight:500;" +
      "font-family:" + FONT_SANS + ";box-shadow:0 2px 16px rgba(0,0,0,.1);" +
      "border:1px solid " + BORDER + ";display:flex;align-items:center;gap:8px;" +
      "cursor:pointer;transition:all .2s;opacity:0;transform:translateY(10px);";

    pill.innerHTML =
      '<span class="spectrum-live-dot" style="width:6px;height:6px;"></span>' +
      '<span>\u25B6 LIVE \u00B7 ' + flaggedCount + ' flagged</span>' +
      '<span style="padding:1px 7px;border-radius:10px;font-size:9px;font-weight:600;background:' + leanColor + '15;color:' + leanColor + ';border:1px solid ' + leanColor + '25;">' + leanLabel + '</span>';

    pill.addEventListener("mouseenter", function () {
      pill.style.boxShadow = "0 4px 20px rgba(0,0,0,.15)";
      pill.style.transform = "translateY(-2px)";
    });
    pill.addEventListener("mouseleave", function () {
      pill.style.boxShadow = "0 2px 16px rgba(0,0,0,.1)";
      pill.style.transform = "translateY(0)";
    });
    pill.addEventListener("click", function () { expandVideoSidebar(); });

    document.body.appendChild(pill);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pill.style.opacity = "1";
        pill.style.transform = "translateY(0)";
      });
    });
  }

  // ============================================================
  // VideoPlaybackTracker — drives HUD overlay card based on video time
  // ============================================================
  var VideoPlaybackTracker = {
    _video: null,
    _segments: null,
    _timeHandler: null,
    _activeEventIdx: -1,
    _cardVisible: false,
    _pinned: false,
    _CARD_LINGER: 60,   // seconds a card stays visible before fading
    _MAX_CARDS: 6,       // max visible cards in feed

    init: function (segments) {
      this.destroy();
      this._segments = segments;
      this._shownSet = {};   // eventIdx → true (already spawned)
      this._cardTimers = []; // { el, timer }

      this._video = document.querySelector("video");
      if (!this._video) {
        var self = this;
        setTimeout(function () {
          self._video = document.querySelector("video");
          if (self._video) {
            self._timeHandler = function () { self._onTimeUpdate(); };
            self._video.addEventListener("timeupdate", self._timeHandler);
          }
        }, 2000);
        return;
      }

      var self = this;
      this._timeHandler = function () { self._onTimeUpdate(); };
      this._video.addEventListener("timeupdate", this._timeHandler);
    },

    _onTimeUpdate: function () {
      if (!this._video || !__videoEvents || __videoEvents.length === 0) return;
      var t = this._video.currentTime;
      var self = this;

      // Check every event — spawn a card the first time its window is hit
      for (var i = 0; i < __videoEvents.length; i++) {
        if (this._shownSet[i]) continue;
        if (t >= __videoEvents[i].time && t < __videoEvents[i].time + 10) {
          this._shownSet[i] = true;
          this._spawnCard(__videoEvents[i]);
        }
      }
    },

    _buildBadgeHTML: function (ev) {
      if (ev.eventType === "claim") {
        var claimColor = getClaimColor(ev);
        var typeLabel = getClaimTypeLabel(ev);
        return '<span class="shud-type" style="background:' + claimColor + '20;color:' + claimColor + ';border:1px solid ' + claimColor + '30;">' +
          escapeHtml(typeLabel) + '</span>' +
          (ev.severity ? '<span class="shud-severity">' + ev.severity + '</span>' : '');
      }
      var cmColor = COMMENTARY_COLORS[ev.category] || "#8B5CF6";
      var cmIcon = COMMENTARY_ICONS[ev.category] || "\u25B8";
      var cmLabel = COMMENTARY_LABELS[ev.category] || ev.category || "Note";
      return '<span class="shud-type" style="background:' + cmColor + '20;color:' + cmColor + ';border:1px solid ' + cmColor + '30;">' +
        cmIcon + ' ' + escapeHtml(cmLabel) + '</span>';
    },

    _populateDetail: function (badgeHTML, quote, explanation) {
      var dp = document.getElementById("spectrum-detail");
      if (!dp) return;
      var dBadge = dp.querySelector("#spectrum-detail-badge");
      var dQuote = dp.querySelector("#spectrum-detail-quote");
      var dExpl = dp.querySelector("#spectrum-detail-explanation");
      if (dBadge) dBadge.innerHTML = badgeHTML;
      if (dQuote) dQuote.textContent = "\u201C" + quote + "\u201D";
      if (dExpl) dExpl.textContent = explanation;
    },

    _spawnCard: function (ev) {
      var feed = document.getElementById("spectrum-hud-feed");
      if (!feed) return;
      var self = this;

      var card = document.createElement("div");
      card.className = "shud-card";
      var badgeHTML = this._buildBadgeHTML(ev);
      var fullExplanation = ev.explanation || "";

      card.innerHTML =
        '<div class="shud-card-ts">' + escapeHtml(formatTimestamp(ev.time)) + '</div>' +
        '<div class="shud-card-badge">' + badgeHTML + '</div>' +
        '<div class="shud-card-explanation">' + escapeHtml(fullExplanation) + '</div>' +
        '<div class="shud-card-quote">\u201C' + escapeHtml(ev.quote) + '\u201D</div>';

      // Click card → populate detail panel and open it
      card.addEventListener("click", function () {
        self._populateDetail(badgeHTML, ev.quote, fullExplanation);
        var dp = document.getElementById("spectrum-detail");
        if (dp) dp.classList.add("open");
      });

      // Always keep detail panel content fresh with latest card
      this._populateDetail(badgeHTML, ev.quote, fullExplanation);

      feed.appendChild(card);

      // Animate in
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { card.classList.add("visible"); });
      });

      // Auto-scroll feed to bottom
      feed.scrollTop = feed.scrollHeight;

      // Schedule fade-out
      var timer = setTimeout(function () {
        card.classList.remove("visible");
        card.classList.add("fading");
        setTimeout(function () { if (card.parentNode) card.remove(); }, 900);
        // Remove from tracked timers
        self._cardTimers = self._cardTimers.filter(function (ct) { return ct.el !== card; });
      }, this._CARD_LINGER * 1000);

      this._cardTimers.push({ el: card, timer: timer });

      // Cap visible cards — fade oldest if over limit
      var visibleCards = feed.querySelectorAll(".shud-card.visible");
      if (visibleCards.length > this._MAX_CARDS) {
        var oldest = visibleCards[0];
        oldest.classList.remove("visible");
        oldest.classList.add("fading");
        setTimeout(function () { if (oldest.parentNode) oldest.remove(); }, 900);
        // Clear its timer
        for (var j = 0; j < this._cardTimers.length; j++) {
          if (this._cardTimers[j].el === oldest) {
            clearTimeout(this._cardTimers[j].timer);
            this._cardTimers.splice(j, 1);
            break;
          }
        }
      }
    },

    reattach: function () {
      if (!this._video) {
        this._video = document.querySelector("video");
        if (this._video && !this._timeHandler) {
          var self = this;
          this._timeHandler = function () { self._onTimeUpdate(); };
          this._video.addEventListener("timeupdate", self._timeHandler);
        }
      }
    },

    destroy: function () {
      if (this._video && this._timeHandler) {
        this._video.removeEventListener("timeupdate", this._timeHandler);
      }
      var dp = document.getElementById("spectrum-detail");
      if (dp && dp.parentNode) dp.remove();
      // Clear all pending timers
      if (this._cardTimers) {
        for (var i = 0; i < this._cardTimers.length; i++) {
          clearTimeout(this._cardTimers[i].timer);
        }
      }
      this._video = null;
      this._timeHandler = null;
      this._segments = null;
      this._shownSet = {};
      this._cardTimers = [];
    }
  };

  // ============================================================
  // INSTANT VIDEO SIDEBAR (no analysis yet — transcript only)
  // ============================================================
  function injectVideoSidebarInstant(articleData, sourceLean, sourceName) {
    var segments = articleData.transcript.segments;
    var existing = document.getElementById("spectrum-sidebar");
    if (existing) existing.remove();
    var existingPill = document.getElementById("spectrum-sidebar-pill");
    if (existingPill) existingPill.remove();

    var channelName = sourceName || "";
    if (!channelName) {
      try { channelName = document.querySelector("#channel-name a, #owner-name a, ytd-channel-name a").textContent.trim(); } catch (e) {}
    }
    var lean = (sourceLean || "").replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[lean] || "#94A3B8";
    var leanLabel = lean ? (LEAN_LABELS[lean] || sourceLean) : "analyzing\u2026";

    var isNarrow = window.innerWidth < 1200;
    _injectVideoStyles();

    var sidebar = document.createElement("div");
    sidebar.id = "spectrum-sidebar";
    sidebar.dataset.videoMode = "true";
    sidebar.dataset.chunkMode = "true";
    sidebar.style.cssText =
      "position:fixed;z-index:2147483640;right:20px;top:80px;width:360px;" +
      "max-height:calc(100vh - 120px);overflow:hidden;display:flex;flex-direction:column;" +
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_HEAD + ";" +
      "font-family:" + FONT_SANS + ";font-size:14px;border-radius:10px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 4px 24px rgba(0,0,0,.1),0 1px 6px rgba(0,0,0,.04);" +
      "opacity:0;transform:translateX(20px);transition:opacity .3s ease,transform .3s ease;";

    // Header
    var header = document.createElement("div");
    header.style.cssText = "padding:14px 16px 0;flex-shrink:0;";
    header.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
        '<span style="font-weight:700;letter-spacing:1.5px;font-size:12px;color:' + TEXT_FAINT + ';">SPECTRUM</span>' +
        '<span class="spectrum-live-dot"></span>' +
        '<span style="font-size:10px;font-weight:700;color:#EF4444;letter-spacing:.5px;">LIVE</span>' +
        (channelName ? '<span style="font-size:11px;color:' + TEXT_MUTED + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100px;">' + escapeHtml(channelName) + '</span>' : '') +
        '<span id="spectrum-lean-pill" style="padding:1px 7px;border-radius:10px;font-size:9px;font-weight:600;background:' + leanColor + '15;color:' + leanColor + ';border:1px solid ' + leanColor + '25;">' + leanLabel + '</span>' +
        '<span id="spectrum-sidebar-min" style="margin-left:auto;cursor:pointer;font-size:18px;color:' + TEXT_FAINT + ';line-height:1;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background .15s;" title="Minimize">\u2212</span>' +
      '</div>';
    sidebar.appendChild(header);

    // Tabs
    var tabBar = document.createElement("div");
    tabBar.style.cssText = "display:flex;gap:0;padding:0 16px;flex-shrink:0;border-bottom:1px solid " + BORDER + ";";
    var liveTabBtn = document.createElement("button");
    liveTabBtn.textContent = L("tab_transcript");
    liveTabBtn.style.cssText =
      "flex:1;padding:8px 0;border:none;background:transparent;cursor:pointer;font-family:" + FONT_SANS + ";" +
      "font-size:12px;font-weight:700;color:#6366F1;border-bottom:2px solid #6366F1;transition:all .15s;";
    var summaryTabBtn = document.createElement("button");
    summaryTabBtn.textContent = L("tab_summary");
    summaryTabBtn.style.cssText =
      "flex:1;padding:8px 0;border:none;background:transparent;cursor:pointer;font-family:" + FONT_SANS + ";" +
      "font-size:12px;font-weight:600;color:" + TEXT_FAINT + ";border-bottom:2px solid transparent;transition:all .15s;";
    tabBar.appendChild(liveTabBtn);
    tabBar.appendChild(summaryTabBtn);
    sidebar.appendChild(tabBar);

    // Live tab
    var liveTab = document.createElement("div");
    liveTab.id = "spectrum-live-tab";
    liveTab.style.cssText = "display:flex;flex-direction:column;flex:1;overflow:hidden;";

    var counterBar = document.createElement("div");
    counterBar.id = "spectrum-live-counter";
    counterBar.style.cssText =
      "padding:6px 16px;flex-shrink:0;display:flex;align-items:center;gap:8px;" +
      "border-bottom:1px solid " + BORDER + ";font-size:11px;color:" + TEXT_FAINT + ";";
    counterBar.innerHTML =
      '<span>0' + L("counter_flaggedClaims") + '</span>' +
      '<span style="margin-left:auto;font-size:10px;color:' + TEXT_FAINT + ';">' + segments.length + L("counter_segments") + '</span>';
    liveTab.appendChild(counterBar);

    // Transcript container — segments only, no claims/commentary
    var transcriptContainer = document.createElement("div");
    transcriptContainer.id = "spectrum-transcript-feed";
    transcriptContainer.style.cssText = "flex:1;overflow-y:auto;padding:4px 0;";

    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var row = document.createElement("div");
      row.className = "spectrum-seg";
      row.dataset.segIdx = i;

      var ts = document.createElement("span");
      ts.className = "spectrum-seg-ts";
      ts.textContent = formatTimestamp(seg.start);

      var txt = document.createElement("span");
      txt.className = "spectrum-seg-text";
      txt.textContent = seg.text;

      row.appendChild(ts);
      row.appendChild(txt);

      (function (startTime) {
        row.addEventListener("click", function () {
          var video = document.querySelector("video");
          if (video) {
            video.currentTime = startTime;
            __videoUserScrolled = false;
          }
        });
      })(seg.start);

      transcriptContainer.appendChild(row);
    }

    __videoUserScrolled = false;
    transcriptContainer.addEventListener("wheel", function () { __videoUserScrolled = true; });
    transcriptContainer.addEventListener("touchmove", function () { __videoUserScrolled = true; });

    liveTab.appendChild(transcriptContainer);
    sidebar.appendChild(liveTab);

    // Empty summary tab (will be populated by boot chunk)
    var summaryTab = document.createElement("div");
    summaryTab.id = "spectrum-summary-tab";
    summaryTab.style.cssText = "display:none;flex:1;overflow-y:auto;padding:14px 16px;";
    summaryTab.innerHTML = '<div style="text-align:center;color:' + TEXT_FAINT + ';padding:20px;font-size:12px;">Analysis in progress\u2026</div>';
    sidebar.appendChild(summaryTab);

    document.body.appendChild(sidebar);

    // Tab switching
    liveTabBtn.addEventListener("click", function () {
      liveTab.style.display = "flex";
      summaryTab.style.display = "none";
      liveTabBtn.style.color = "#6366F1";
      liveTabBtn.style.borderBottomColor = "#6366F1";
      liveTabBtn.style.fontWeight = "700";
      summaryTabBtn.style.color = TEXT_FAINT;
      summaryTabBtn.style.borderBottomColor = "transparent";
      summaryTabBtn.style.fontWeight = "600";
    });
    summaryTabBtn.addEventListener("click", function () {
      liveTab.style.display = "none";
      summaryTab.style.display = "block";
      summaryTabBtn.style.color = "#6366F1";
      summaryTabBtn.style.borderBottomColor = "#6366F1";
      summaryTabBtn.style.fontWeight = "700";
      liveTabBtn.style.color = TEXT_FAINT;
      liveTabBtn.style.borderBottomColor = "transparent";
      liveTabBtn.style.fontWeight = "600";
    });

    // Minimize
    var minBtn = sidebar.querySelector("#spectrum-sidebar-min");
    if (minBtn) {
      minBtn.addEventListener("mouseenter", function () { this.style.background = "rgba(0,0,0,.05)"; });
      minBtn.addEventListener("mouseleave", function () { this.style.background = "transparent"; });
      minBtn.addEventListener("click", function () { collapseVideoSidebar(); });
    }

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sidebar.style.opacity = "1";
        sidebar.style.transform = "translateX(0)";
      });
    });

    removeFloatingBadge();

    if (isNarrow) {
      sidebar.style.opacity = "0";
      sidebar.style.transform = "translateX(20px)";
      setTimeout(function () { if (sidebar.parentNode) sidebar.remove(); }, 10);
      // Show a minimal pill for narrow viewports
      var pill = document.createElement("div");
      pill.id = "spectrum-sidebar-pill";
      pill.style.cssText =
        "position:fixed;z-index:2147483640;bottom:20px;right:20px;" +
        "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
        "padding:8px 16px;border-radius:24px;font-size:11px;font-weight:500;" +
        "font-family:" + FONT_SANS + ";box-shadow:0 2px 16px rgba(0,0,0,.1);" +
        "border:1px solid " + BORDER + ";display:flex;align-items:center;gap:8px;" +
        "cursor:pointer;";
      pill.innerHTML = '<span class="spectrum-live-dot" style="width:6px;height:6px;"></span><span>\u25B6 LIVE analyzing\u2026</span>';
      pill.addEventListener("click", function () { expandVideoSidebar(); });
      document.body.appendChild(pill);
    }

    // Resize handler
    if (__videoSidebarResizeHandler) window.removeEventListener("resize", __videoSidebarResizeHandler);
    __videoSidebarResizeHandler = function () {
      var narrow = window.innerWidth < 1200;
      var sb = document.getElementById("spectrum-sidebar");
      var pillEl = document.getElementById("spectrum-sidebar-pill");
      if (narrow && sb) { collapseVideoSidebar(); }
      else if (!narrow && pillEl && !sb && __videoSegments) {
        pillEl.remove();
        injectVideoSidebarInstant(__lastArticleData, ChunkScheduler._sourceLean || "", ChunkScheduler._sourceName || "");
        VideoPlaybackTracker.reattach();
        // Re-inject already-completed chunk cards
        ChunkScheduler._reinjectCompletedCards();
      }
    };
    window.addEventListener("resize", __videoSidebarResizeHandler);
  }

  // ============================================================
  // CHUNK SCHEDULER — progressive video analysis
  // ============================================================
  var ChunkScheduler = {
    _chunks: [],
    _video: null,
    _pollInterval: null,
    _priorContext: "",
    _articleData: null,
    _sourceLean: "",
    _sourceName: "",
    _accumulatedClaims: [],
    _accumulatedCommentary: [],
    _bootAnalysis: null,
    _highestCompletedIdx: -1,
    CHUNK_DURATION: 90,
    LOOKAHEAD: 45,
    OVERLAP_SEGMENTS: 3,

    init: function (articleData, sourceLean, sourceName) {
      this.destroy();
      this._articleData = articleData;
      this._sourceLean = sourceLean;
      this._sourceName = sourceName;
      this._priorContext = "";
      this._accumulatedClaims = [];
      this._accumulatedCommentary = [];
      this._bootAnalysis = null;
      this._highestCompletedIdx = -1;

      var segments = articleData.transcript.segments;
      this._buildChunks(segments);

      this._video = document.querySelector("video");
      if (!this._video) {
        var self = this;
        var attempts = 0;
        var maxAttempts = 10;
        var observer = new MutationObserver(function () {
          self._video = document.querySelector("video");
          if (self._video) {
            observer.disconnect();
            self._startPolling();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // Fallback timeout: stop observing after 20s
        setTimeout(function () {
          observer.disconnect();
          if (!self._video) {
            self._video = document.querySelector("video");
            if (self._video) self._startPolling();
          }
        }, 20000);
      } else {
        this._startPolling();
      }

      // Fire boot chunk immediately
      if (this._chunks.length > 0) {
        this._requestChunk(0);
      }
    },

    _buildChunks: function (segments) {
      this._chunks = [];
      if (!segments || segments.length === 0) return;

      var chunkStart = 0;
      var chunkStartTime = segments[0].start;

      for (var i = 0; i < segments.length; i++) {
        var elapsed = segments[i].start - chunkStartTime;
        if (elapsed >= this.CHUNK_DURATION && i > chunkStart) {
          this._chunks.push({
            startIdx: chunkStart,
            endIdx: i - 1,
            segments: segments.slice(chunkStart, i),
            status: "pending",
            result: null,
          });
          // Overlap: start next chunk a few segments back
          var overlapStart = Math.max(chunkStart, i - this.OVERLAP_SEGMENTS);
          chunkStart = overlapStart;
          chunkStartTime = segments[chunkStart].start;
        }
      }
      // Final chunk
      if (chunkStart < segments.length) {
        this._chunks.push({
          startIdx: chunkStart,
          endIdx: segments.length - 1,
          segments: segments.slice(chunkStart),
          status: "pending",
          result: null,
        });
      }
    },

    _startPolling: function () {
      var self = this;
      this._pollInterval = setInterval(function () {
        self._poll();
      }, 1000);
    },

    _poll: function () {
      if (!this._video) return;
      var currentTime = this._video.currentTime;

      for (var i = 0; i < this._chunks.length; i++) {
        var chunk = this._chunks[i];
        if (chunk.status !== "pending") continue;
        var chunkStartTime = chunk.segments[0].start;
        if (currentTime + this.LOOKAHEAD >= chunkStartTime) {
          this._requestChunk(i);
        }
      }
    },

    _requestChunk: function (chunkIdx) {
      if (chunkIdx < 0 || chunkIdx >= this._chunks.length) return;
      var chunk = this._chunks[chunkIdx];
      if (chunk.status !== "pending") return;
      chunk.status = "requested";

      // Build overlap text from previous chunk
      var priorOverlap = "";
      if (chunkIdx > 0) {
        var prevChunk = this._chunks[chunkIdx - 1];
        var overlapSegs = prevChunk.segments.slice(-this.OVERLAP_SEGMENTS);
        priorOverlap = overlapSegs.map(function (s) { return s.text; }).join(" ");
      }

      _showChunkAnalyzingIndicator(chunk);

      chrome.runtime.sendMessage({
        type: "ANALYZE_VIDEO_CHUNK",
        data: {
          chunkSegments: chunk.segments,
          videoTitle: this._articleData.title,
          sourceName: this._sourceName,
          sourceLean: this._sourceLean,
          priorContext: this._priorContext,
          priorOverlap: priorOverlap,
          chunkIndex: chunkIdx,
          totalChunks: this._chunks.length,
          detectedLanguage: this._articleData.detectedLanguage || null,
        }
      }).catch(function () {});
    },

    handleChunkResult: function (chunkIndex, analysis) {
      if (chunkIndex < 0 || chunkIndex >= this._chunks.length) return;
      this._chunks[chunkIndex].status = "complete";
      this._chunks[chunkIndex].result = analysis;

      // Only update running context from sequentially completed chunks
      if (chunkIndex > this._highestCompletedIdx) {
        this._highestCompletedIdx = chunkIndex;
        if (analysis.contextSummary) {
          this._priorContext = analysis.contextSummary;
        }
      }

      // Accumulate
      var newClaims = analysis.claims || [];
      var newCommentary = analysis.commentary || [];
      this._accumulatedClaims = this._accumulatedClaims.concat(newClaims);
      this._accumulatedCommentary = this._accumulatedCommentary.concat(newCommentary);

      // Boot chunk: update header lean + summary tab
      if (analysis._isBoot && chunkIndex === 0) {
        this._bootAnalysis = analysis;
        _updateSidebarHeaderFromBoot(analysis);
      }

      _updateChunkCounterBar(this._accumulatedClaims, this._accumulatedCommentary);

      // Inject cards
      var allSegments = this._articleData.transcript.segments;
      _injectChunkCards(newClaims, newCommentary, allSegments);

      _hideChunkAnalyzingIndicator();
    },

    handleChunkError: function (chunkIndex, error) {
      if (chunkIndex < 0 || chunkIndex >= this._chunks.length) return;
      // Retry once by resetting to pending
      if (this._chunks[chunkIndex].status === "requested") {
        this._chunks[chunkIndex].status = "pending";
      }
      _hideChunkAnalyzingIndicator();
    },

    handleSeek: function (newTime) {
      for (var i = 0; i < this._chunks.length; i++) {
        var chunk = this._chunks[i];
        if (chunk.status !== "pending") continue;
        var chunkEnd = chunk.segments[chunk.segments.length - 1].start;
        if (chunk.segments[0].start <= newTime + this.LOOKAHEAD && chunkEnd >= newTime) {
          this._requestChunk(i);
        }
      }
    },

    _reinjectCompletedCards: function () {
      // Re-inject cards from already-completed chunks (after sidebar re-expand)
      var allSegments = this._articleData ? this._articleData.transcript.segments : [];
      for (var i = 0; i < this._chunks.length; i++) {
        if (this._chunks[i].status === "complete" && this._chunks[i].result) {
          var r = this._chunks[i].result;
          _injectChunkCards(r.claims || [], r.commentary || [], allSegments);
        }
      }
      if (this._bootAnalysis) {
        _updateSidebarHeaderFromBoot(this._bootAnalysis);
      }
      _updateChunkCounterBar(this._accumulatedClaims, this._accumulatedCommentary);
    },

    destroy: function () {
      if (this._pollInterval) {
        clearInterval(this._pollInterval);
        this._pollInterval = null;
      }
      this._chunks = [];
      this._video = null;
      this._priorContext = "";
      this._articleData = null;
      this._accumulatedClaims = [];
      this._accumulatedCommentary = [];
      this._bootAnalysis = null;
      this._highestCompletedIdx = -1;
    }
  };

  // ---- Chunk UI helpers (HUD overlay mode) ----

  function _showChunkAnalyzingIndicator() {}
  function _hideChunkAnalyzingIndicator() {}

  function _updateSidebarHeaderFromBoot(bootAnalysis) {
    var leanEl = document.getElementById("spectrum-hud-lean");
    if (leanEl) {
      var lean = (bootAnalysis.overallLean || "").replace(/[- ]/g, "").toLowerCase();
      var leanColor = LEAN_COLORS[lean] || "#94A3B8";
      var leanLabel = LEAN_LABELS[lean] || bootAnalysis.overallLean || "";
      leanEl.textContent = leanLabel;
      leanEl.style.color = leanColor;
    }
  }

  function _updateChunkCounterBar(allClaims, allCommentary) {
    var countEl = document.getElementById("spectrum-hud-count");
    if (!countEl) return;
    var flaggedCount = allClaims.filter(function (c) {
      return c.type !== "verified" && c.type !== "neutral";
    }).length;
    countEl.textContent = flaggedCount + " flagged";
  }

  function _injectChunkCards(claims, commentary, allSegments) {
    // HUD mode: add events to global array; VideoPlaybackTracker reads from it
    var newEvents = _buildVideoEvents(claims, commentary, allSegments);
    for (var i = 0; i < newEvents.length; i++) {
      var ev = newEvents[i];
      var isDuplicate = false;
      for (var j = 0; j < __videoEvents.length; j++) {
        if (Math.abs(__videoEvents[j].time - ev.time) < 1 && __videoEvents[j].quote === ev.quote) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) __videoEvents.push(ev);
    }
    __videoEvents.sort(function (a, b) { return a.time - b.time; });
  }


  // ============================================================
  // ANALYSIS SIDEBAR
  // ============================================================
  var __sidebarAnalysis = null;
  var __sidebarResizeHandler = null;

  function injectAnalysisSidebar(analysis) {
    __sidebarAnalysis = analysis;
    var existing = document.getElementById("spectrum-sidebar");
    if (existing) existing.remove();
    var existingPill = document.getElementById("spectrum-sidebar-pill");
    if (existingPill) existingPill.remove();

    var claims = analysis.claims || [];
    var lean = analysis.overallLean || "";
    var leanNorm = lean.replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[leanNorm] || "#94A3B8";
    var leanLabel = LEAN_LABELS[leanNorm] || lean;
    var confidence = analysis.confidence ? Math.round(analysis.confidence * 100) + "%" : "";

    var highCount = claims.filter(function (c) { return c.severity === "high"; }).length;
    var medCount = claims.filter(function (c) { return c.severity === "medium"; }).length;
    var lowCount = claims.filter(function (c) { return c.severity === "low" && c.type !== "verified" && c.type !== "neutral"; }).length;
    var verifiedCount = claims.filter(function (c) { return c.type === "verified"; }).length;
    var neutralCount = claims.filter(function (c) { return c.type === "neutral"; }).length;

    var intent = analysis.intentClassification || {};
    var intentType = intent.type || analysis.intentType || "";
    var intentColor = INTENT_COLORS[intentType] || TEXT_FAINT;
    var intentLabel = INTENT_LABELS[intentType] || "";
    var intentConf = intent.confidence ? Math.round(intent.confidence * 100) + "%" : "";

    var leanScore = typeof analysis.leanScore === "number" ? analysis.leanScore : null;
    var polarization = typeof analysis.polarizationIntensity === "number" ? analysis.polarizationIntensity : null;
    var detectedLang = analysis.detectedLanguage || "";

    var preAnalyzedBadge = analysis._preAnalyzed
      ? '<span style="padding:2px 6px;border-radius:8px;font-size:8px;font-weight:700;letter-spacing:.4px;' +
          'background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;text-transform:uppercase;">Pre-analyzed</span>'
      : '';

    // --- Verdict scoring ---
    var vqScore = 100, vqHasData = false, vqFlags = [], vqStrengths = [];
    var vqSpin = typeof analysis.spinScore === "number" ? analysis.spinScore : null;

    if (vqSpin !== null) { vqHasData = true; vqScore -= vqSpin * 0.25; if (vqSpin > 60) vqFlags.push("High spin"); else if (vqSpin <= 20) vqStrengths.push("Low spin"); }
    if (intentType) { vqHasData = true; var vqIP = { informative: 0, advocacy: 5, persuasion: 20, manipulation: 35 }; vqScore -= vqIP[intentType] || 0; if (intentType === "manipulation") vqFlags.push("Manipulative"); else if (intentType === "persuasion") vqFlags.push("Persuasive"); else if (intentType === "informative") vqStrengths.push("Informative"); }
    if (polarization !== null) { vqScore -= polarization * 0.15; if (polarization > 60) vqFlags.push("Polarizing"); else if (polarization <= 20) vqStrengths.push("Non-polarizing"); }
    var vqSentData = analysis.sentimentAnalysis || null;
    var vqSentScore = vqSentData ? vqSentData.overallScore : (typeof analysis.sentimentScore === "number" ? analysis.sentimentScore : null);
    if (vqSentScore !== null) { vqHasData = true; if (Math.abs(vqSentScore) > 0.5) { vqScore -= Math.round((Math.abs(vqSentScore) - 0.5) * 20); vqFlags.push(vqSentScore < 0 ? "Negative tone" : "Positive tone"); } else if (Math.abs(vqSentScore) < 0.15) { vqStrengths.push("Neutral tone"); } if (vqSentData && vqSentData.headlineBodyMismatch && vqSentData.mismatchSeverity !== "none") { vqScore -= 5; vqFlags.push("Headline mismatch"); } }
    if (leanScore !== null) { if (Math.abs(leanScore) > 0.6) vqFlags.push("Strong lean"); else if (Math.abs(leanScore) < 0.15) vqStrengths.push("Balanced"); }
    if (claims.length > 0) {
      vqHasData = true;
      vqScore -= highCount * 5; vqScore -= medCount * 2;
      if (highCount >= 3) vqFlags.push(highCount + " high claims");
      if (verifiedCount >= 3) vqStrengths.push(verifiedCount + " verified");
      if (highCount === 0 && medCount <= 1) vqStrengths.push("Few issues");
    }
    if (leanScore === null && leanNorm) {
      var extremeLeans = { farleft: true, farright: true };
      var moderateLeans = { left: true, right: true };
      if (extremeLeans[leanNorm]) { vqFlags.push("Strong lean"); vqScore -= 10; }
      else if (moderateLeans[leanNorm]) vqScore -= 3;
      else if (leanNorm === "center") vqStrengths.push("Balanced");
    }
    vqScore = Math.max(0, Math.min(100, Math.round(vqScore)));

    // --- Build sidebar HTML ---
    var html = '';

    // Header
    html +=
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
        '<span style="font-weight:700;letter-spacing:1.5px;font-size:12px;color:' + TEXT_FAINT + ';">SPECTRUM</span>' +
        preAnalyzedBadge +
        '<span id="spectrum-sidebar-min" style="margin-left:auto;cursor:pointer;font-size:18px;color:' + TEXT_FAINT + ';line-height:1;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background .15s;" title="Minimize">\u2212</span>' +
      '</div>';

    // Verdict
    if (vqHasData) {
      var vqLabel, vqColor;
      if (vqScore >= 80) { vqLabel = L("quality_solid"); vqColor = "#4ADE80"; }
      else if (vqScore >= 60) { vqLabel = L("quality_fair"); vqColor = "#60A5FA"; }
      else if (vqScore >= 40) { vqLabel = L("quality_mixed"); vqColor = "#FBBF24"; }
      else if (vqScore >= 20) { vqLabel = L("quality_questionable"); vqColor = "#F87171"; }
      else { vqLabel = L("quality_poor"); vqColor = "#F87171"; }

      html +=
        '<div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px;">' +
            '<span style="font-size:40px;font-weight:800;color:' + vqColor + ';line-height:1;">' + vqScore + '</span>' +
            '<span style="font-size:14px;color:' + TEXT_FAINT + ';">/100</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + vqColor + ';margin-left:auto;">' + vqLabel + '</span>' +
          '</div>' +
          '<div style="position:relative;margin-bottom:6px;">' +
            '<div style="height:6px;border-radius:3px;background:linear-gradient(to right,#60A5FA,#94A3B8 50%,#F87171);"></div>' +
            '<div style="position:absolute;bottom:-3px;left:calc(' + vqScore + '% - 5px);width:10px;height:10px;border-radius:50%;background:' + vqColor + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.25);"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:' + TEXT_FAINT + ';">' +
            '<span>\uD83D\uDD35 Poor</span><span>Solid \uD83D\uDD34</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + TEXT_FAINT + ';font-style:italic;margin-top:4px;">At a glance \u2014 may change with deep analysis.</div>' +
        '</div>';
    }

    // Pills (flags & strengths)
    if (vqFlags.length > 0 || vqStrengths.length > 0) {
      html += '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">';
      for (var vfi = 0; vfi < vqFlags.length; vfi++) {
        html += '<span style="display:inline-block;margin:0 4px 5px 0;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;' +
          'background:rgba(96,165,250,.12);color:#60A5FA;border:1px solid rgba(96,165,250,.2);">' + escapeHtml(vqFlags[vfi]) + '</span>';
      }
      for (var vsi = 0; vsi < vqStrengths.length; vsi++) {
        html += '<span style="display:inline-block;margin:0 4px 5px 0;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;' +
          'background:rgba(248,113,113,.12);color:#F87171;border:1px solid rgba(248,113,113,.2);">' + escapeHtml(vqStrengths[vsi]) + '</span>';
      }
      html += '</div>';
    }

    // Badges (intent + lean + language)
    html +=
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">' +
        (intentLabel ?
          '<span style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;' +
            'background:' + intentColor + '12;color:' + intentColor + ';border:1px solid ' + intentColor + '25;">' +
            intentLabel + (intentConf ? ' \u00B7 ' + intentConf : '') +
          '</span>' : '') +
        '<span style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600;' +
          'background:' + leanColor + '15;color:' + leanColor + ';border:1px solid ' + leanColor + '25;">' +
          leanLabel + (confidence ? ' \u00B7 ' + confidence : '') +
        '</span>' +
        (detectedLang && detectedLang !== "en" ?
          '<span style="padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;' +
            'background:rgba(148,163,184,0.1);color:' + TEXT_FAINT + ';border:1px solid ' + BORDER + ';" title="Detected language">' +
            escapeHtml(detectedLang.toUpperCase()) +
          '</span>' : '') +
      '</div>';

    // Claim summary (Upgrade #5: urgent count + sort-by-priority button)
    var hasCheckPriority = claims.some(function (c) { return c.checkPriority || typeof c.checkWorthiness === "number"; });
    var urgentCount = claims.filter(function (c) { return c.checkPriority === "urgent" || (typeof c.checkWorthiness === "number" && c.checkWorthiness >= 80); }).length;
    if (claims.length > 0) {
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<span style="font-size:13px;color:' + TEXT_MUTED + ';">' + claims.length + ' claim' + (claims.length !== 1 ? 's' : '') + ' identified</span>' +
            (hasCheckPriority ?
              '<button id="spectrum-sort-cw" style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;' +
                'background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);color:#818CF8;font-family:' + FONT_SANS + ';' +
                'transition:background .15s;" title="Sort inline notes by check-worthiness">\u25BC Priority</button>' : '') +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:4px;">' +
            (urgentCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:rgba(248,113,113,0.12);color:#F87171;border:1px solid rgba(248,113,113,0.2);">\u26A0 ' + urgentCount + ' urgent</span>' : '') +
            (highCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + SEV_PILL.high + ';color:' + SEV_PILL_TEXT.high + ';">' + highCount + ' high</span>' : '') +
            (medCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + SEV_PILL.medium + ';color:' + SEV_PILL_TEXT.medium + ';">' + medCount + ' med</span>' : '') +
            (lowCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + SEV_PILL.low + ';color:' + SEV_PILL_TEXT.low + ';">' + lowCount + ' low</span>' : '') +
            (verifiedCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + TYPE_PILL.verified + ';color:' + TYPE_PILL_TEXT.verified + ';">' + verifiedCount + ' verified</span>' : '') +
            (neutralCount ? '<span style="padding:2px 8px;border-radius:3px;font-size:12px;font-weight:600;background:' + TYPE_PILL.neutral + ';color:' + TYPE_PILL_TEXT.neutral + ';">' + neutralCount + ' noted</span>' : '') +
          '</div>' +
        '</div>';
    } else {
      html += '<div style="margin-bottom:10px;font-size:13px;color:#4ADE80;">No claims identified</div>';
    }

    // Lean bar
    if (leanScore !== null) {
      var lsBarPct = ((leanScore + 1) / 2) * 100;
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Article Lean</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#7CB3E0,#94A3B8,#D98282);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + lsBarPct + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + TEXT_MUTED + ';font-weight:600;min-width:28px;text-align:right;">' +
              (leanScore > 0 ? '+' : '') + leanScore.toFixed(1) +
            '</span>' +
          '</div>' +
        '</div>';
    }

    // Bias Dimensions (Upgrade #1 — multi-cue-ideology)
    var cueProfile = analysis.ideologyCueProfile || null;
    if (cueProfile) {
      var CUE_LABELS = SPECTRUM.IDEOLOGY_CUE_LABELS;
      var cueKeys = Object.keys(CUE_LABELS);
      var cueBars = '';
      for (var ci = 0; ci < cueKeys.length; ci++) {
        var cueKey = cueKeys[ci];
        var cue = cueProfile[cueKey];
        if (!cue || typeof cue.score !== 'number') continue;
        var cueScore = Math.max(-1, Math.min(1, cue.score));
        var cuePct = ((cueScore + 1) / 2) * 100;
        var cueColor = cueScore < -0.15 ? '#7CB3E0' : cueScore > 0.15 ? '#D98282' : '#94A3B8';
        var cueExamples = (cue.examples && cue.examples.length > 0) ? cue.examples.join(' / ') : '';
        var cueTitle = cueExamples ? CUE_LABELS[cueKey] + ': ' + cueExamples : CUE_LABELS[cueKey];
        cueBars +=
          '<div style="margin-bottom:6px;" title="' + cueTitle.replace(/"/g, '&quot;') + '">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:2px;">' +
              '<span style="font-size:11px;color:' + TEXT_MUTED + ';">' + CUE_LABELS[cueKey] + '</span>' +
              '<span style="font-size:11px;color:' + cueColor + ';font-weight:600;">' + (cueScore > 0 ? '+' : '') + cueScore.toFixed(2) + '</span>' +
            '</div>' +
            '<div style="height:4px;border-radius:2px;background:linear-gradient(to right,#7CB3E0,#94A3B8,#D98282);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + cuePct.toFixed(1) + '% - 4px);width:8px;height:8px;border-radius:50%;background:' + cueColor + ';border:1.5px solid rgba(255,255,255,0.7);"></div>' +
            '</div>' +
          '</div>';
      }
      if (cueBars) {
        html +=
          '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:6px;">Bias Dimensions</div>' +
            cueBars +
            '<div style="font-size:10px;color:' + TEXT_FAINT + ';margin-top:4px;">Hover each bar for examples. Left = left-leaning signal, Right = right-leaning signal.</div>' +
          '</div>';
      }
    }

    // Polarization gauge
    if (polarization !== null) {
      var polColor = polarization > 75 ? "#F87171" : polarization > 50 ? "#FBBF24" : polarization > 20 ? "#60A5FA" : "#4ADE80";
      var polLabel = polarization > 75 ? L("pol_extreme") : polarization > 50 ? L("pol_high") : polarization > 20 ? L("pol_moderate") : L("pol_low");
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Polarization</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:rgba(0,0,0,.06);position:relative;">' +
              '<div style="height:100%;width:' + polarization + '%;border-radius:3px;background:' + polColor + ';"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + polColor + ';font-weight:600;">' + polLabel + '</span>' +
          '</div>' +
        '</div>';
    }

    // Sentiment gauge (VADER Upgrade #3)
    var sentData = analysis.sentimentAnalysis || null;
    var sentScore = sentData ? sentData.overallScore : (typeof analysis.sentimentScore === "number" ? analysis.sentimentScore : null);
    if (sentScore !== null) {
      var sentColor = sentScore > 0.4 ? "#4ADE80" : sentScore > 0.1 ? "#86EFAC" : sentScore > -0.1 ? "#94A3B8" : sentScore > -0.4 ? "#FCA5A5" : "#F87171";
      var sentLabel = sentScore > 0.4 ? "Strongly Positive" : sentScore > 0.1 ? "Mildly Positive" : sentScore > -0.1 ? "Neutral" : sentScore > -0.4 ? "Mildly Negative" : "Strongly Negative";
      var sentBarPct = ((sentScore + 1) / 2 * 100).toFixed(1);
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Sentiment</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#F87171,#94A3B8,#4ADE80);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + sentBarPct + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + sentColor + ';font-weight:600;min-width:36px;text-align:right;">' +
              (sentScore > 0 ? '+' : '') + sentScore.toFixed(2) +
            '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + sentColor + ';margin-top:3px;">' + sentLabel + '</div>' +
          (sentData && sentData.headlineBodyMismatch ?
            '<div style="margin-top:5px;font-size:11px;color:#FBBF24;padding:3px 6px;border-radius:4px;background:rgba(251,191,36,0.08);border-left:2px solid #FBBF24;">' +
              'Headline-body mismatch' + (sentData.mismatchSeverity && sentData.mismatchSeverity !== "none" ? ' (' + sentData.mismatchSeverity + ')' : '') +
            '</div>' : '') +
        '</div>';
    }

    // Spectacle Score gauge (spectacle-detection upgrade)
    var spectacleData = analysis.spectacleAnalysis || null;
    if (spectacleData && typeof spectacleData.spectacleScore === "number") {
      var spScore = spectacleData.spectacleScore;
      var spColor = spScore > 70 ? "#9333EA" : spScore > 40 ? "#A855F7" : "#C084FC";
      var spLabel = spScore > 70 ? "High Spectacle" : spScore > 40 ? "Moderate" : "Low";
      var spPatterns = spectacleData.patterns || [];
      var spHighPatterns = spPatterns.filter(function(p) { return p.severity === "high"; });
      var spHlScore = spectacleData.headlineManipulation && typeof spectacleData.headlineManipulation.score === "number"
        ? spectacleData.headlineManipulation.score : null;
      var spEvRatio = typeof spectacleData.engagementVsInformation === "number" ? spectacleData.engagementVsInformation : null;
      var spPatternLabels = { outrage_bait: "Outrage Bait", fear_mongering: "Fear Mongering", false_urgency: "False Urgency", emotional_manipulation: "Emotional Manip.", clickbait_framing: "Clickbait", tribalism_trigger: "Tribalism", synthetic_controversy: "Synth. Controversy" };
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">Spectacle Score</div>' +
            (spHighPatterns.length > 0 ?
              '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;background:rgba(147,51,234,0.12);color:#9333EA;border:1px solid rgba(147,51,234,0.2);">' +
                spHighPatterns.length + ' HIGH</span>' : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#E9D5FF,#A855F7,#6B21A8);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + spScore + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + spColor + ';font-weight:600;min-width:36px;text-align:right;">' + spScore + '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + spColor + ';margin-top:3px;">' + spLabel +
            (spHlScore !== null && spHlScore > 60 ? ' \u00B7 Headline manip. (' + spHlScore + ')' : '') +
            (spEvRatio !== null ? ' \u00B7 Eng. ratio: ' + spEvRatio.toFixed(2) : '') +
          '</div>' +
          (spPatterns.length > 0 ?
            '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">' +
              spPatterns.map(function(p) {
                var pColor = p.severity === "high" ? "#9333EA" : p.severity === "medium" ? "#A855F7" : "#C084FC";
                return '<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:8px;background:rgba(168,85,247,0.1);color:' + pColor + ';border:1px solid rgba(168,85,247,0.18);" title="' + escapeHtml((p.examples || []).slice(0,1).join('')) + '">' + escapeHtml(spPatternLabels[p.type] || p.type) + '</span>';
              }).join('') +
            '</div>' : '') +
          (spPatterns.some(function(p) { return p.severity === "high" && p.explanation; }) ?
            '<div style="margin-top:6px;">' +
              spPatterns.filter(function(p) { return p.severity === "high" && p.explanation; }).slice(0, 2).map(function(p) {
                return '<div style="margin-top:4px;font-size:11px;color:' + TEXT_MUTED + ';padding:3px 6px;border-radius:4px;background:rgba(168,85,247,0.06);border-left:2px solid #A855F7;">' +
                  '<strong style="color:#A855F7;">' + escapeHtml(spPatternLabels[p.type] || p.type) + ':</strong> ' + escapeHtml(p.explanation) + '</div>';
              }).join('') +
            '</div>' : '') +
        '</div>';
    }


    // Persuasion Score gauge (Upgrade #12 — persuasion-detection)
    var persuasionData = analysis.persuasionAnalysis || null;
    if (persuasionData && typeof persuasionData.persuasionIntensity === "number") {
      var prScore = persuasionData.persuasionIntensity;
      var prColor = prScore > 70 ? "#EA580C" : prScore > 40 ? "#F97316" : "#FB923C";
      var prLabel = prScore > 70 ? "High Manipulation" : prScore > 40 ? "Moderate" : "Low";
      var prTechniques = persuasionData.persuasionTechniques || [];
      var prHighTechs = prTechniques.filter(function(t) { return t.severity === "high"; });
      var prStrategyLabels = { emotional: "Emotional", logical_fallacy: "Logical Fallacy", social_proof: "Social Proof", authority: "Authority", none: "None" };
      var prTechLabels = {
        appeal_to_emotion: "Appeal to Emotion", appeal_to_fear: "Appeal to Fear",
        bandwagon: "Bandwagon", false_dilemma: "False Dilemma", ad_hominem: "Ad Hominem",
        straw_man: "Straw Man", appeal_to_authority: "Appeal to Authority",
        red_herring: "Red Herring", loaded_language: "Loaded Language",
        whataboutism: "Whataboutism", slippery_slope: "Slippery Slope",
        false_equivalence: "False Equivalence"
      };
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">Persuasion Score</div>' +
            (prHighTechs.length > 0 ?
              '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;background:rgba(234,88,12,0.12);color:#EA580C;border:1px solid rgba(234,88,12,0.2);">' +
                prHighTechs.length + ' HIGH</span>' : '') +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;">' +
            '<div style="flex:1;height:5px;border-radius:3px;background:linear-gradient(to right,#FED7AA,#F97316,#EA580C);position:relative;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + prScore + '% - 5px);width:11px;height:11px;border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:13px;color:' + prColor + ';font-weight:600;min-width:36px;text-align:right;">' + prScore + '</span>' +
          '</div>' +
          '<div style="font-size:11px;color:' + prColor + ';margin-top:3px;">' + prLabel +
            (persuasionData.dominantStrategy && persuasionData.dominantStrategy !== "none" ?
              ' · ' + (prStrategyLabels[persuasionData.dominantStrategy] || persuasionData.dominantStrategy) : '') +
          '</div>' +
          (prTechniques.length > 0 ?
            '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">' +
              prTechniques.slice(0, 5).map(function(t) {
                var tColor = t.severity === "high" ? "#EA580C" : t.severity === "medium" ? "#F97316" : "#FB923C";
                return '<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:8px;background:rgba(249,115,22,0.1);color:' + tColor + ';border:1px solid rgba(249,115,22,0.18);" title="' + escapeHtml(t.explanation || "") + '">' + escapeHtml(prTechLabels[t.technique] || t.technique) + '</span>';
              }).join('') +
            '</div>' : '') +
        '</div>';
    }

    // Intent callout
    if (intent.explanation && (intentType === "persuasion" || intentType === "manipulation")) {
      html +=
        '<div style="margin-bottom:10px;padding:6px 10px;border-radius:6px;background:' + (INTENT_BG[intentType] || "transparent") + ';' +
          'border-left:2px solid ' + intentColor + ';font-size:13px;color:' + TEXT_MUTED + ';line-height:1.4;">' +
          '<strong style="color:' + intentColor + ';">Intent: </strong>' + escapeHtml(intent.explanation) +
        '</div>';
    }

    // Multilingual Bias section (Upgrade #7 — multilingual-bias)
    var mlData2 = analysis.multilingualAnalysis || null;
    if (mlData2 && Array.isArray(mlData2.detectedBiasMarkers) && mlData2.detectedBiasMarkers.length > 0) {
      var mlLangLabels2 = { ko: "Korean", es: "Spanish", fr: "French", de: "German", ar: "Arabic", ja: "Japanese" };
      var mlLangLabel2 = mlLangLabels2[detectedLang] || detectedLang.toUpperCase();
      var mlHigh2 = mlData2.detectedBiasMarkers.filter(function(m) { return m.severity === "high"; }).length;
      var mlTrBiasColor2 = { none: "#22C55E", low: "#60A5FA", medium: "#F59E0B", high: "#EF4444" };
      var mlTrColor2 = mlTrBiasColor2[mlData2.translationBiasRisk] || "#94A3B8";
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">' + mlLangLabel2 + ' Bias Markers</div>' +
            (mlHigh2 > 0 ?
              '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;background:rgba(20,184,166,0.12);color:#14B8A6;border:1px solid rgba(20,184,166,0.25);">' +
                mlHigh2 + ' HIGH</span>' : '') +
          '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px;">' +
            mlData2.detectedBiasMarkers.slice(0, 5).map(function(m) {
              var mColor = m.severity === "high" ? "#14B8A6" : m.severity === "medium" ? "#2DD4BF" : "#5EEAD4";
              var mBg = m.severity === "high" ? "rgba(20,184,166,0.14)" : "rgba(20,184,166,0.08)";
              return '<span style="font-size:10px;font-weight:600;padding:1px 6px;border-radius:8px;background:' + mBg + ';color:' + mColor + ';border:1px solid rgba(20,184,166,0.2);cursor:default;" title="' + escapeHtml(m.example || "") + ' — ' + escapeHtml(m.explanation || "") + '">' + escapeHtml(m.marker) + '</span>';
            }).join('') +
          '</div>' +
          (mlData2.culturalContextNotes ?
            '<div style="font-size:11px;color:' + TEXT_FAINT + ';line-height:1.4;margin-bottom:4px;">' + escapeHtml(mlData2.culturalContextNotes) + '</div>' : '') +
          (mlData2.translationBiasRisk && mlData2.translationBiasRisk !== "none" ?
            '<div style="font-size:11px;color:' + mlTrColor2 + ';padding:3px 6px;border-radius:4px;background:rgba(20,184,166,0.06);border-left:2px solid ' + mlTrColor2 + ';">' +
              'Translation bias: ' + mlData2.translationBiasRisk +
              (mlData2.translationBiasNote ? ' \u2014 ' + escapeHtml(mlData2.translationBiasNote) : '') +
            '</div>' : '') +
        '</div>';
    }

    // Claim breakdown bar
    if (claims.length > 0) {
      var total = claims.length;
      var cTypes = {};
      claims.forEach(function (c) { cTypes[c.type] = (cTypes[c.type] || 0) + 1; });
      var typeColorsMap = {
        contentious: "#FBBF24", unsupported: "#F87171", misleading: "#F87171",
        opinion_as_fact: "#FBBF24", omission: "#D4A84A",
        verified: "#4ADE80", neutral: "#94A3B8"
      };
      var typeLabelsMap = {
        contentious: L("claimType_contentious"), unsupported: L("claimType_unsupported"), misleading: L("claimType_misleading"),
        opinion_as_fact: L("claimType_opinion_as_fact"), omission: L("claimType_omission"),
        verified: L("claimType_verified"), neutral: L("claimType_neutral")
      };
      var barSegments = "";
      var legendParts = "";
      var typeOrder = ["misleading", "unsupported", "contentious", "opinion_as_fact", "omission", "neutral", "verified"];
      for (var ti = 0; ti < typeOrder.length; ti++) {
        var t = typeOrder[ti];
        if (!cTypes[t]) continue;
        var pct = (cTypes[t] / total * 100).toFixed(1);
        barSegments += '<div style="width:' + pct + '%;height:100%;background:' + (typeColorsMap[t] || "#94A3B8") + ';"></div>';
        legendParts += '<div style="display:flex;align-items:center;gap:4px;font-size:12px;color:' + TEXT_MUTED + ';">' +
          '<span style="width:6px;height:6px;border-radius:50%;background:' + (typeColorsMap[t] || "#94A3B8") + ';flex-shrink:0;"></span>' +
          '<span>' + cTypes[t] + ' ' + (typeLabelsMap[t] || t) + '</span></div>';
      }

      var tipText = "";
      if (highCount >= 3) tipText = L("tip_scrutiny");
      else if (intentType === "manipulation") tipText = L("tip_manipulative");
      else if (intentType === "persuasion") tipText = L("tip_persuasion");
      else if (verifiedCount >= total * 0.5) tipText = L("tip_reliable");
      else if (highCount === 0) tipText = L("tip_noFlags");

      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="font-size:12px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Claim Breakdown</div>' +
          '<div style="height:6px;border-radius:3px;overflow:hidden;display:flex;background:rgba(0,0,0,.04);margin-bottom:6px;">' +
            barSegments +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:2px;margin-bottom:' + (tipText ? '6px' : '0') + ';">' +
            legendParts +
          '</div>' +
          (tipText ?
            '<div style="font-size:12px;color:' + TEXT_BODY + ';padding:5px 8px;border-radius:4px;' +
              'background:rgba(0,0,0,.02);border-left:2px solid ' + (highCount >= 3 || intentType === "manipulation" ? "#F87171" : intentType === "persuasion" ? "#FBBF24" : "#4ADE80") + ';line-height:1.35;">' +
              '\uD83D\uDCA1 ' + tipText +
            '</div>' : '') +
        '</div>';
    }

    // Outlet Profile (Upgrade #11 — outlet-bias-profiles, deep mode only)
    var outletProfile = analysis.outletProfileAnalysis || null;
    if (outletProfile && typeof outletProfile.consistencyScore === "number") {
      var opScore = outletProfile.consistencyScore;
      var opColor = opScore >= 75 ? "#4ADE80" : opScore >= 40 ? "#FBBF24" : "#F87171";
      var opLabel = opScore >= 75 ? "Consistent" : opScore >= 40 ? "Moderate deviation" : "Anomaly";
      var opDeviations = outletProfile.deviations || [];
      var opPatterns = outletProfile.systematicPatterns || [];
      var opBaseline = outletProfile.comparisonToBaseline || "";
      html +=
        '<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid ' + BORDER + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
            '<div style="font-size:12px;color:' + TEXT_FAINT + ';">Outlet Profile</div>' +
            '<span style="font-size:10px;font-weight:700;padding:1px 7px;border-radius:8px;' +
              'background:' + opColor + '18;color:' + opColor + ';border:1px solid ' + opColor + '33;">' +
              opLabel + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
            '<div style="flex:1;height:4px;border-radius:2px;background:rgba(0,0,0,.06);">' +
              '<div style="height:100%;width:' + opScore + '%;border-radius:2px;background:' + opColor + ';"></div>' +
            '</div>' +
            '<span style="font-size:11px;color:' + opColor + ';font-weight:700;min-width:32px;text-align:right;">' + opScore + '/100</span>' +
          '</div>' +
          (opBaseline ?
            '<div style="font-size:11px;color:' + TEXT_MUTED + ';font-style:italic;margin-bottom:' + (opDeviations.length || opPatterns.length ? '6px' : '0') + ';line-height:1.4;">' +
              escapeHtml(opBaseline) +
            '</div>' : '') +
          (opDeviations.length > 0 ?
            '<div style="margin-bottom:' + (opPatterns.length ? '5px' : '0') + ';">' +
              '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#F87171;margin-bottom:3px;">Deviations</div>' +
              opDeviations.slice(0, 3).map(function(d) {
                return '<div style="font-size:11px;color:' + TEXT_MUTED + ';margin-bottom:2px;line-height:1.35;">' +
                  '<span style="color:#F87171;font-weight:600;">' + escapeHtml(d.dimension || "") + ':</span> ' +
                  escapeHtml(d.description || "") + '</div>';
              }).join('') +
            '</div>' : '') +
          (opPatterns.length > 0 ?
            '<div>' +
              '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:' + TEXT_FAINT + ';margin-bottom:3px;">Patterns</div>' +
              '<div style="display:flex;flex-wrap:wrap;gap:3px;">' +
                opPatterns.slice(0, 4).map(function(p) {
                  return '<span style="font-size:10px;padding:1px 7px;border-radius:8px;' +
                    'background:rgba(148,163,184,0.1);color:' + TEXT_MUTED + ';border:1px solid ' + BORDER + ';">' +
                    escapeHtml(p) + '</span>';
                }).join('') +
              '</div>' +
            '</div>' : '') +
        '</div>';
    }

    // Deep Analysis link
    html +=
      '<div style="text-align:center;">' +
        '<button id="spectrum-sidebar-deep" style="width:100%;padding:8px 10px;border-radius:8px;cursor:pointer;' +
          'font-size:13px;font-weight:600;font-family:' + FONT_SANS + ';letter-spacing:.3px;' +
          'background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08));' +
          'border:1px solid rgba(99,102,241,0.2);color:#818CF8;transition:all .2s;">' +
          L("btn_fullDeep") +
        '</button>' +
      '</div>';

    // --- Create sidebar element ---
    var isNarrow = window.innerWidth < 1200;
    var sidebar = document.createElement("div");
    sidebar.id = "spectrum-sidebar";
    sidebar.style.cssText =
      "position:fixed;z-index:2147483640;right:20px;top:80px;width:320px;" +
      "max-height:calc(100vh - 120px);overflow-y:auto;overflow-x:hidden;" +
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_HEAD + ";" +
      "padding:16px 18px;font-family:" + FONT_SANS + ";" +
      "font-size:14px;border-radius:10px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 4px 24px rgba(0,0,0,.1),0 1px 6px rgba(0,0,0,.04);" +
      "opacity:0;transform:translateX(20px);transition:opacity .3s ease,transform .3s ease;";

    var styleEl = document.createElement("style");
    styleEl.textContent =
      "#spectrum-sidebar::-webkit-scrollbar{width:3px}" +
      "#spectrum-sidebar::-webkit-scrollbar-thumb{background:rgba(0,0,0,.1);border-radius:2px}" +
      "#spectrum-sidebar::-webkit-scrollbar-track{background:transparent}";
    sidebar.appendChild(styleEl);

    var contentDiv = document.createElement("div");
    contentDiv.innerHTML = html;
    sidebar.appendChild(contentDiv);
    document.body.appendChild(sidebar);

    // Animate in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sidebar.style.opacity = "1";
        sidebar.style.transform = "translateX(0)";
      });
    });

    // Hide floating badge
    removeFloatingBadge();

    // Add feedback flag buttons
    addFlagButtonsToSidebar(sidebar);

    // Minimize button
    var minBtn = sidebar.querySelector("#spectrum-sidebar-min");
    if (minBtn) {
      minBtn.addEventListener("mouseenter", function () { this.style.background = "rgba(0,0,0,.05)"; });
      minBtn.addEventListener("mouseleave", function () { this.style.background = "transparent"; });
      minBtn.addEventListener("click", function () { collapseSidebar(); });
    }

    // Sort by check-worthiness button (Upgrade #5)
    var sortCwBtn = sidebar.querySelector("#spectrum-sort-cw");
    if (sortCwBtn) {
      sortCwBtn.addEventListener("mouseenter", function () { this.style.background = "rgba(99,102,241,0.15)"; });
      sortCwBtn.addEventListener("mouseleave", function () { this.style.background = "rgba(99,102,241,0.08)"; });
      sortCwBtn.addEventListener("click", function () {
        // Sort inline note cards by checkWorthiness descending
        var notes = document.querySelectorAll(".spectrum-inline-note");
        if (!notes.length) return;
        var noteArr = Array.prototype.slice.call(notes);
        noteArr.sort(function (a, b) {
          // Each note corresponds to a marginNote by DOM order — use data-idx on the highlight
          var aHL = a.previousElementSibling && a.previousElementSibling.querySelector ? a.previousElementSibling.querySelector(".spectrum-hl") : null;
          var bHL = b.previousElementSibling && b.previousElementSibling.querySelector ? b.previousElementSibling.querySelector(".spectrum-hl") : null;
          var aIdx = aHL ? parseInt(aHL.dataset.idx, 10) : (a._cwIdx !== undefined ? a._cwIdx : 999);
          var bIdx = bHL ? parseInt(bHL.dataset.idx, 10) : (b._cwIdx !== undefined ? b._cwIdx : 999);
          var aCw = (marginNotes[aIdx] && typeof marginNotes[aIdx].claim.checkWorthiness === "number") ? marginNotes[aIdx].claim.checkWorthiness : 0;
          var bCw = (marginNotes[bIdx] && typeof marginNotes[bIdx].claim.checkWorthiness === "number") ? marginNotes[bIdx].claim.checkWorthiness : 0;
          return bCw - aCw;
        });
        // Rebuild the inline note section by re-ordering with a priority-sorted flat list
        // Rebuild: remove all notes then re-inject in priority order using buildMarginSidebar logic
        var sortedNotes = [];
        for (var ni = 0; ni < marginNotes.length; ni++) {
          sortedNotes.push({ mn: marginNotes[ni], cw: typeof marginNotes[ni].claim.checkWorthiness === "number" ? marginNotes[ni].claim.checkWorthiness : 0 });
        }
        sortedNotes.sort(function (a, b) { return b.cw - a.cw; });
        // Re-insert all note cards in a priority-grouped block before the first article paragraph
        document.querySelectorAll(".spectrum-inline-note").forEach(function (n) { n.remove(); });
        var articleEl2 = document.querySelector("article, [role='main'], main, .article-body, .story-body, .post-content") || document.body;
        var firstP = articleEl2.querySelector("p");
        var insertTarget = firstP || articleEl2.firstChild;
        var priorityContainer = document.createElement("div");
        priorityContainer.id = "spectrum-priority-list";
        priorityContainer.style.cssText =
          "margin:12px 0 16px;padding:12px 16px;border-radius:8px;" +
          "background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.12);" +
          "font-family:" + FONT_SANS + ";";
        priorityContainer.innerHTML =
          '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#818CF8;margin-bottom:10px;">' +
          '\u25BC Claims sorted by check-worthiness' +
          '</div>';
        for (var pi = 0; pi < sortedNotes.length; pi++) {
          var mn = sortedNotes[pi].mn;
          var cl = mn.claim;
          var clColor = getClaimColor(cl);
          var clPill = getClaimPill(cl);
          var clPillText = getClaimPillText(cl);
          var clType = getClaimTypeLabel(cl);
          var cw = sortedNotes[pi].cw;
          var cwCol = cw >= 80 ? "#F87171" : cw >= 50 ? "#FBBF24" : "#94A3B8";
          var pri = cl.checkPriority || (cw >= 80 ? "urgent" : cw >= 50 ? "recommended" : "optional");
          var priCol = { urgent: "#F87171", recommended: "#FBBF24", optional: "#94A3B8" }[pri] || "#94A3B8";
          var card = document.createElement("div");
          card.className = "spectrum-inline-note";
          card.style.cssText =
            "margin:0 0 8px;padding:7px 12px;border-radius:6px;" +
            "background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);" +
            "border:1px solid rgba(0,0,0,.06);border-left:3px solid " + clColor + ";" +
            "box-shadow:0 1px 4px rgba(0,0,0,.04);cursor:pointer;transition:box-shadow .15s;";
          card.innerHTML =
            '<div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">' +
              '<span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;background:' + clPill + ';color:' + clPillText + ';">' + escapeHtml(clType) + '</span>' +
              (cw ? '<span style="font-size:9px;color:' + cwCol + ';font-weight:700;">' + cw + '</span>' +
                '<span style="font-size:8px;color:' + priCol + ';font-weight:700;text-transform:uppercase;letter-spacing:.2px;">' + pri + '</span>' : '') +
            '</div>' +
            '<div style="font-size:12px;color:rgba(30,30,30,0.7);line-height:1.45;">' + escapeHtml(cl.explanation || "") + '</div>';
          card.addEventListener("click", (function (mnRef) {
            return function () { mnRef.wrapper.click(); };
          })(mn));
          priorityContainer.appendChild(card);
        }
        if (insertTarget && insertTarget.parentNode) {
          insertTarget.parentNode.insertBefore(priorityContainer, insertTarget);
        } else {
          articleEl2.prepend(priorityContainer);
        }
        // Update button state
        sortCwBtn.textContent = "\u25B2 Restore";
        sortCwBtn.title = "Restore original order";
        sortCwBtn.style.background = "rgba(99,102,241,0.16)";
        sortCwBtn.removeEventListener("click", arguments.callee);
        sortCwBtn.addEventListener("click", function () {
          var pc = document.getElementById("spectrum-priority-list");
          if (pc) pc.remove();
          buildMarginSidebar(document.querySelector("article, [role='main'], main, .article-body, .story-body, .post-content") || document.body);
          sortCwBtn.textContent = "\u25BC Priority";
          sortCwBtn.style.background = "rgba(99,102,241,0.08)";
        });
      });
    }

    // Deep Analysis button
    var deepBtn = sidebar.querySelector("#spectrum-sidebar-deep");
    if (deepBtn) {
      deepBtn.addEventListener("click", function () {
        if (!__lastArticleData) return;
        chrome.runtime.sendMessage({
          type: "OPEN_DEEP_ANALYSIS",
          data: {
            articleText: __lastArticleData.text,
            articleUrl: __lastArticleData.url || window.location.href,
            articleTitle: __lastArticleData.title || document.title,
            sourceDomain: __lastArticleData.domain || window.location.hostname,
            images: __lastArticleData.images || [],
            imageDataUrls: __lastArticleData.imageDataUrls || [],
            author: __lastArticleData.author || null,
            isYouTube: __lastArticleData.isYouTube || false,
            transcript: __lastArticleData.transcript || null,
            detectedLanguage: (__lastAnalysis && __lastAnalysis.detectedLanguage) || (__lastArticleData && __lastArticleData.detectedLanguage) || null,
            fastAnalysis: __lastAnalysis || null,
          }
        }).catch(function () {});
      });
      deepBtn.addEventListener("mouseenter", function () {
        this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))";
        this.style.borderColor = "rgba(99,102,241,0.35)";
      });
      deepBtn.addEventListener("mouseleave", function () {
        this.style.background = "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))";
        this.style.borderColor = "rgba(99,102,241,0.2)";
      });
    }

    // Narrow viewport → collapse immediately
    if (isNarrow) {
      sidebar.style.opacity = "0";
      sidebar.style.transform = "translateX(20px)";
      setTimeout(function () { if (sidebar.parentNode) sidebar.remove(); }, 10);
      showSidebarPill();
    }

    // Resize handler
    if (__sidebarResizeHandler) window.removeEventListener("resize", __sidebarResizeHandler);
    __sidebarResizeHandler = function () {
      var narrow = window.innerWidth < 1200;
      var sb = document.getElementById("spectrum-sidebar");
      var pill = document.getElementById("spectrum-sidebar-pill");
      if (narrow && sb) { collapseSidebar(); }
      else if (!narrow && pill && !sb) { expandSidebar(); }
    };
    window.addEventListener("resize", __sidebarResizeHandler);
  }

  function collapseSidebar() {
    var sidebar = document.getElementById("spectrum-sidebar");
    if (sidebar) {
      sidebar.style.opacity = "0";
      sidebar.style.transform = "translateX(20px)";
      setTimeout(function () { if (sidebar.parentNode) sidebar.remove(); }, 300);
    }
    showSidebarPill();
  }

  function expandSidebar() {
    var pill = document.getElementById("spectrum-sidebar-pill");
    if (pill) pill.remove();
    if (__sidebarAnalysis) injectAnalysisSidebar(__sidebarAnalysis);
  }

  function showSidebarPill() {
    var existing = document.getElementById("spectrum-sidebar-pill");
    if (existing) existing.remove();
    if (!__sidebarAnalysis) return;
    var analysis = __sidebarAnalysis;
    var claims = analysis.claims || [];
    var lean = (analysis.overallLean || "").replace(/[- ]/g, "").toLowerCase();
    var leanColor = LEAN_COLORS[lean] || "#94A3B8";
    var leanLabel = LEAN_LABELS[lean] || analysis.overallLean || "";
    var badgeColor = claims.length > 0 ? "#B8963E" : "#5E8AB4";

    var pill = document.createElement("div");
    pill.id = "spectrum-sidebar-pill";
    pill.style.cssText =
      "position:fixed;z-index:2147483640;bottom:20px;right:20px;" +
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:8px 16px;border-radius:24px;font-size:11px;font-weight:500;" +
      "font-family:" + FONT_SANS + ";box-shadow:0 2px 16px rgba(0,0,0,.1);" +
      "border:1px solid " + BORDER + ";display:flex;align-items:center;gap:8px;" +
      "cursor:pointer;transition:all .2s;opacity:0;transform:translateY(10px);";

    pill.innerHTML =
      '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + badgeColor + ';"></span>' +
      '<span>SPECTRUM \u00B7 ' + claims.length + ' claim' + (claims.length !== 1 ? 's' : '') + '</span>' +
      '<span style="padding:1px 7px;border-radius:10px;font-size:9px;font-weight:600;' +
        'background:' + leanColor + '15;color:' + leanColor + ';border:1px solid ' + leanColor + '25;">' + leanLabel + '</span>';

    pill.addEventListener("mouseenter", function () {
      pill.style.boxShadow = "0 4px 20px rgba(0,0,0,.15)";
      pill.style.transform = "translateY(-2px)";
    });
    pill.addEventListener("mouseleave", function () {
      pill.style.boxShadow = "0 2px 16px rgba(0,0,0,.1)";
      pill.style.transform = "translateY(0)";
    });
    pill.addEventListener("click", function () { expandSidebar(); });

    document.body.appendChild(pill);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pill.style.opacity = "1";
        pill.style.transform = "translateY(0)";
      });
    });
  }

  // ============================================================
  // BIAS NOTES
  // ============================================================
  function injectBiasNotes(indicators, articleEl) {
    var existing = document.getElementById("spectrum-bias-notes");
    if (existing) existing.remove();

    var container = document.createElement("div");
    container.id = "spectrum-bias-notes";
    container.style.cssText =
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:14px 18px;border-radius:8px;margin:14px 0;" +
      "font-family:" + FONT_SANS + ";font-size:13px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 1px 6px rgba(0,0,0,.04);";

    var html = '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:8px;">Bias Indicators</div>';
    indicators.forEach(function (b) {
      var name = (b.pattern || "").replace(/_/g, " ");
      html +=
        '<div style="margin-bottom:8px;padding:8px 10px;border-radius:6px;background:rgba(0,0,0,.02);border:1px solid ' + BORDER + ';">' +
          '<div style="font-weight:600;color:' + TEXT_HEAD + ';margin-bottom:2px;text-transform:capitalize;font-size:12px;">' + escapeHtml(name) + '</div>' +
          (b.examples ? '<div style="font-style:italic;color:' + TEXT_MUTED + ';font-size:12px;font-family:' + FONT_SERIF + ';">\u201C' + b.examples.map(escapeHtml).join('\u201D, \u201C') + '\u201D</div>' : '') +
          (b.explanation ? '<div style="color:' + TEXT_MUTED + ';font-size:12px;margin-top:3px;">' + escapeHtml(b.explanation) + '</div>' : '') +
        '</div>';
    });
    container.innerHTML = html;

    if (articleEl && articleEl !== document.body) {
      articleEl.insertBefore(container, articleEl.firstChild);
    }
  }

  // ============================================================
  // UNVERBALIZED BIASES (Upgrade #8 — Hidden Bias Detection)
  // ============================================================
  function injectUnverbalizedBiases(biases, articleEl) {
    var existing = document.getElementById("spectrum-hidden-biases");
    if (existing) existing.remove();

    var container = document.createElement("div");
    container.id = "spectrum-hidden-biases";
    container.style.cssText =
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:14px 18px;border-radius:8px;margin:14px 0;" +
      "font-family:" + FONT_SANS + ";font-size:13px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 1px 6px rgba(0,0,0,.04);";

    var html = '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:8px;">Hidden Assumptions</div>';
    biases.forEach(function (b) {
      var intColor = b.biasIntensity === "high" ? SEV_COLOR.high : b.biasIntensity === "medium" ? SEV_COLOR.medium : SEV_COLOR.low;
      html +=
        '<div style="margin-bottom:8px;padding:8px 10px;border-radius:6px;background:rgba(0,0,0,.02);border:1px solid ' + BORDER + ';border-left:2px solid ' + intColor + ';">' +
          '<div style="font-size:12px;color:' + TEXT_HEAD + ';line-height:1.45;margin-bottom:3px;">' + escapeHtml(b.assumption || "") + '</div>' +
          (b.reasoningLocation ?
            '<div style="font-size:11px;color:' + TEXT_MUTED + ';font-style:italic;font-family:' + FONT_SERIF + ';">Re: \u201C' + escapeHtml(b.reasoningLocation) + '\u201D</div>' : '') +
        '</div>';
    });
    container.innerHTML = html;

    // Insert after bias notes, or at top
    var biasNotes = document.getElementById("spectrum-bias-notes");
    if (biasNotes && biasNotes.parentNode) {
      biasNotes.parentNode.insertBefore(container, biasNotes.nextSibling);
    } else if (articleEl && articleEl !== document.body) {
      articleEl.insertBefore(container, articleEl.firstChild);
    }
  }

  // ============================================================
  // SOFT BIAS INDICATORS (Upgrade #6 — Soft Hate Speech Detection)
  // ============================================================
  function injectSoftBiasIndicators(indicators, articleEl) {
    var existing = document.getElementById("spectrum-soft-bias");
    if (existing) existing.remove();

    var container = document.createElement("div");
    container.id = "spectrum-soft-bias";
    container.style.cssText =
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:14px 18px;border-radius:8px;margin:14px 0;" +
      "font-family:" + FONT_SANS + ";font-size:13px;border:1px solid " + BORDER + ";" +
      "border-left:3px solid #F87171;" +
      "box-shadow:0 1px 6px rgba(0,0,0,.04);";

    var patternLabels = {
      group_delegitimization: "Group Delegitimization",
      dehumanizing_metaphor: "Dehumanizing Metaphor",
      exclusionary_framing: "Exclusionary Framing",
      identity_fusion: "Identity Fusion"
    };

    var html = '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#F87171;margin-bottom:8px;">Soft Bias Detected</div>';
    indicators.forEach(function (ind) {
      var pLabel = patternLabels[ind.pattern] || (ind.pattern || "").replace(/_/g, " ");
      html +=
        '<div style="margin-bottom:8px;padding:8px 10px;border-radius:6px;background:rgba(248,113,113,0.04);border:1px solid rgba(248,113,113,0.1);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">' +
            '<span style="font-weight:600;color:' + TEXT_HEAD + ';font-size:12px;text-transform:capitalize;">' + escapeHtml(pLabel) + '</span>' +
            (ind.target ? '<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:rgba(248,113,113,0.08);color:#F87171;">Target: ' + escapeHtml(ind.target) + '</span>' : '') +
          '</div>' +
          (ind.examples ?
            '<div style="font-style:italic;color:' + TEXT_MUTED + ';font-size:12px;font-family:' + FONT_SERIF + ';margin-bottom:3px;">\u201C' +
              ind.examples.map(escapeHtml).join('\u201D, \u201C') + '\u201D</div>' : '') +
          (ind.explanation ?
            '<div style="color:' + TEXT_MUTED + ';font-size:12px;line-height:1.4;">' + escapeHtml(ind.explanation) + '</div>' : '') +
        '</div>';
    });
    container.innerHTML = html;

    // Insert after hidden biases, bias notes, or at top
    var hiddenBiases = document.getElementById("spectrum-hidden-biases");
    var biasNotes = document.getElementById("spectrum-bias-notes");
    var insertAfter = hiddenBiases || biasNotes;
    if (insertAfter && insertAfter.parentNode) {
      insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
    } else if (articleEl && articleEl !== document.body) {
      articleEl.insertBefore(container, articleEl.firstChild);
    }
  }

  // ============================================================
  // POLARIZATION DRIVERS (shown when intensity > 40)
  // ============================================================
  function injectPolarizationDrivers(drivers, intensity, articleEl) {
    var existing = document.getElementById("spectrum-polarization");
    if (existing) existing.remove();

    var polColor = intensity > 75 ? "#F87171" : intensity > 50 ? "#FBBF24" : "#60A5FA";

    var container = document.createElement("div");
    container.id = "spectrum-polarization";
    container.style.cssText =
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
      "padding:14px 18px;border-radius:8px;margin:14px 0;" +
      "font-family:" + FONT_SANS + ";font-size:13px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 1px 6px rgba(0,0,0,.04);";

    var html = '<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:' + polColor + ';margin-bottom:8px;">Polarization Drivers</div>';
    drivers.forEach(function (driver) {
      html += '<div style="font-size:12px;color:' + TEXT_MUTED + ';margin-bottom:4px;line-height:1.4;">\u2022 ' + escapeHtml(driver) + '</div>';
    });
    container.innerHTML = html;

    // Insert after soft bias or other analysis sections
    var softBias = document.getElementById("spectrum-soft-bias");
    var hiddenBiases = document.getElementById("spectrum-hidden-biases");
    var biasNotes = document.getElementById("spectrum-bias-notes");
    var insertAfter = softBias || hiddenBiases || biasNotes;
    if (insertAfter && insertAfter.parentNode) {
      insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
    } else if (articleEl && articleEl !== document.body) {
      articleEl.insertBefore(container, articleEl.firstChild);
    }
  }

  // ============================================================
  // FLOATING BADGE
  // ============================================================
  function showFloatingBadge(text, color, detection) {
    // Don't show badge if sidebar is handling it
    if (document.getElementById("spectrum-sidebar")) return;

    var badge = document.getElementById("spectrum-fbadge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "spectrum-fbadge";
      badge.style.cssText =
        "position:fixed;z-index:2147483640;bottom:20px;right:20px;" +
        "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
        "padding:7px 14px;border-radius:20px;font-size:11.5px;font-weight:500;" +
        "font-family:" + FONT_SANS + ";box-shadow:0 2px 12px rgba(0,0,0,.08);" +
        "border:1px solid " + BORDER + ";display:flex;align-items:center;gap:8px;" +
        "transition:opacity .3s;cursor:default;";
      document.body.appendChild(badge);
    }

    var leanHtml = "";
    if (detection && detection.sourceLean) {
      var sl = detection.sourceLean;
      var lc = LEAN_COLORS[sl.lean] || "#94A3B8";
      var ll = LEAN_LABELS[sl.lean] || "";
      leanHtml = '<span style="padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600;' +
        'background:' + lc + '15;color:' + lc + ';border:1px solid ' + lc + '25;">' + (sl.name ? sl.name + " \u00B7 " : "") + ll + '</span>';
      // Credibility pill (Upgrade #2 — CRED-1)
      if (typeof getCredibilityScore === "function") {
        var _fbDomain = window.location.hostname.replace(/^www\./, "");
        var _fbCred = getCredibilityScore(_fbDomain);
        if (_fbCred) {
          var _fbCredLabel = _fbCred.score >= 80 ? "High" : _fbCred.score >= 50 ? "Med" : "Low";
          var _fbCredColors = { High: "#22C55E", Med: "#F59E0B", Low: "#EF4444" };
          var _fbCredColor = _fbCredColors[_fbCredLabel] || "#94A3B8";
          leanHtml += '<span style="padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600;' +
            'background:' + _fbCredColor + '15;color:' + _fbCredColor + ';border:1px solid ' + _fbCredColor + '25;cursor:default;" ' +
            'title="Credibility: ' + _fbCred.score + '/100">' + _fbCredLabel + ' Cred</span>';
        }
      }
    }

    badge.innerHTML =
      '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + color + ';"></span>' +
      '<span>' + escapeHtml(text) + '</span>' + leanHtml;
  }

  function removeFloatingBadge() {
    var badge = document.getElementById("spectrum-fbadge");
    if (badge) badge.remove();
  }

  // ============================================================
  // CLEANUP
  // ============================================================
  function removeHighlights() {
    ChunkScheduler.destroy();
    VideoPlaybackTracker.destroy();
    document.querySelectorAll(".spectrum-hl").forEach(function (el) {
      var parent = el.parentNode;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    });
    var sidebar = document.getElementById("spectrum-sidebar");
    if (sidebar) sidebar.remove();
    var sidebarPill = document.getElementById("spectrum-sidebar-pill");
    if (sidebarPill) sidebarPill.remove();
    var biasNotes = document.getElementById("spectrum-bias-notes");
    if (biasNotes) biasNotes.remove();
    var hiddenBiases = document.getElementById("spectrum-hidden-biases");
    if (hiddenBiases) hiddenBiases.remove();
    var softBias = document.getElementById("spectrum-soft-bias");
    if (softBias) softBias.remove();
    var polarization = document.getElementById("spectrum-polarization");
    if (polarization) polarization.remove();
    document.querySelectorAll(".spectrum-inline-panel").forEach(function (p) { p.remove(); });
    dismissBubble();
    document.querySelectorAll(".spectrum-inline-note").forEach(function (n) { n.remove(); });
    marginNotes = [];
  }

  function escapeHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================================
  // FEEDBACK SYSTEM — flag & comment on analysis results
  // ============================================================
  var __feedbackFormOpen = false;

  function createFlagButton(section, itemText, analysisType) {
    var btn = document.createElement("span");
    btn.className = "spectrum-flag-btn";
    btn.textContent = "\uD83D\uDEA9";
    btn.title = "Flag this for review";
    btn.style.cssText = "cursor:pointer;font-size:12px;opacity:0.4;transition:opacity .2s;margin-left:6px;vertical-align:middle;";
    btn.addEventListener("mouseenter", function () { btn.style.opacity = "1"; });
    btn.addEventListener("mouseleave", function () { if (!__feedbackFormOpen) btn.style.opacity = "0.4"; });
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      openFeedbackForm(btn, section, itemText, analysisType);
    });
    return btn;
  }

  function openFeedbackForm(anchor, section, itemText, analysisType) {
    // Remove any existing form
    var existing = document.getElementById("spectrum-feedback-form");
    if (existing) { existing.remove(); __feedbackFormOpen = false; return; }
    __feedbackFormOpen = true;
    anchor.style.opacity = "1";

    var form = document.createElement("div");
    form.id = "spectrum-feedback-form";
    form.style.cssText = "position:fixed;z-index:2147483647;background:" + PANEL_BG + ";" +
      "border:1px solid " + BORDER + ";border-radius:10px;padding:14px 16px;width:320px;" +
      "box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:" + FONT_SANS + ";";

    // Position near the anchor
    var rect = anchor.getBoundingClientRect();
    var top = Math.min(rect.bottom + 6, window.innerHeight - 260);
    var left = Math.max(10, rect.left - 280);
    form.style.top = top + "px";
    form.style.left = left + "px";

    var isKo = __spectrumLang === "ko";
    var preview = (itemText || "").slice(0, 80);

    form.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<span style="font-size:13px;font-weight:600;color:' + TEXT_HEAD + '">' +
          (isKo ? "\uD83D\uDEA9 피드백" : "\uD83D\uDEA9 Flag Feedback") +
        '</span>' +
        '<span id="spectrum-fb-close" style="cursor:pointer;font-size:16px;color:' + TEXT_MUTED + '">✕</span>' +
      '</div>' +
      (preview ? '<div style="font-size:11px;color:' + TEXT_MUTED + ';margin-bottom:8px;padding:6px 8px;background:rgba(0,0,0,0.03);border-radius:4px;line-height:1.4;word-break:break-word">' +
        '<strong>' + escapeHtml(section) + ':</strong> ' + escapeHtml(preview) + (itemText.length > 80 ? '...' : '') +
      '</div>' : '') +
      '<div style="margin-bottom:8px">' +
        '<select id="spectrum-fb-category" style="width:100%;padding:6px 8px;border:1px solid ' + BORDER + ';border-radius:6px;font-size:12px;font-family:' + FONT_SANS + ';background:#fff;color:' + TEXT_BODY + '">' +
          '<option value="inaccurate">' + (isKo ? "부정확함" : "Inaccurate") + '</option>' +
          '<option value="missing_context">' + (isKo ? "맥락 누락" : "Missing Context") + '</option>' +
          '<option value="wrong_severity">' + (isKo ? "심각도 오류" : "Wrong Severity") + '</option>' +
          '<option value="false_positive">' + (isKo ? "오탐" : "False Positive") + '</option>' +
          '<option value="missed_bias">' + (isKo ? "편향 미감지" : "Missed Bias") + '</option>' +
          '<option value="good_catch">' + (isKo ? "좋은 지적" : "Good Catch") + '</option>' +
          '<option value="other">' + (isKo ? "기타" : "Other") + '</option>' +
        '</select>' +
      '</div>' +
      '<div style="margin-bottom:10px">' +
        '<textarea id="spectrum-fb-comment" rows="3" placeholder="' + (isKo ? "의견을 적어주세요..." : "Your comment...") + '" ' +
          'style="width:100%;padding:8px;border:1px solid ' + BORDER + ';border-radius:6px;font-size:12px;font-family:' + FONT_SANS + ';resize:vertical;color:' + TEXT_BODY + ';box-sizing:border-box"></textarea>' +
      '</div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end">' +
        '<button id="spectrum-fb-cancel" style="padding:5px 14px;border:1px solid ' + BORDER + ';border-radius:6px;font-size:12px;cursor:pointer;background:transparent;color:' + TEXT_MUTED + ';font-family:' + FONT_SANS + '">' +
          (isKo ? "취소" : "Cancel") +
        '</button>' +
        '<button id="spectrum-fb-save" style="padding:5px 14px;border:none;border-radius:6px;font-size:12px;cursor:pointer;background:#6366F1;color:#fff;font-weight:600;font-family:' + FONT_SANS + '">' +
          (isKo ? "저장" : "Save") +
        '</button>' +
      '</div>';

    document.body.appendChild(form);

    // Close handlers
    var closeForm = function () { form.remove(); __feedbackFormOpen = false; anchor.style.opacity = "0.4"; };
    document.getElementById("spectrum-fb-close").addEventListener("click", closeForm);
    document.getElementById("spectrum-fb-cancel").addEventListener("click", closeForm);

    // Save handler
    document.getElementById("spectrum-fb-save").addEventListener("click", function () {
      var comment = document.getElementById("spectrum-fb-comment").value.trim();
      var category = document.getElementById("spectrum-fb-category").value;
      if (!comment) { document.getElementById("spectrum-fb-comment").style.borderColor = "#EF4444"; return; }

      var feedbackItem = {
        url: window.location.href,
        domain: window.location.hostname.replace(/^www\./, ""),
        pageTitle: document.title,
        section: section,
        itemText: itemText.slice(0, 500),
        category: category,
        comment: comment,
        analysisType: analysisType || "article",
      };

      chrome.runtime.sendMessage({ type: "SAVE_FEEDBACK", data: feedbackItem }, function () {
        // Show saved confirmation
        form.innerHTML = '<div style="text-align:center;padding:12px;color:#4ADE80;font-size:13px;font-weight:600">' +
          (isKo ? "✓ 저장됨" : "✓ Saved") + '</div>';
        setTimeout(closeForm, 800);
      });
    });

    // Close on outside click (delayed to avoid immediate close)
    setTimeout(function () {
      document.addEventListener("click", function outsideClick(e) {
        if (!form.contains(e.target) && e.target !== anchor) {
          closeForm();
          document.removeEventListener("click", outsideClick);
        }
      });
    }, 100);

    // Focus textarea
    document.getElementById("spectrum-fb-comment").focus();
  }

  // Inject flag buttons into sidebar sections
  function addFlagButtonsToSidebar(sidebar) {
    if (!sidebar) return;
    // Add a general "Flag this analysis" button at the bottom
    var flagRow = document.createElement("div");
    flagRow.style.cssText = "margin-top:10px;padding-top:10px;border-top:1px solid " + BORDER + ";text-align:center;";
    var flagBtn = document.createElement("button");
    flagBtn.style.cssText = "padding:6px 14px;border:1px solid rgba(99,102,241,0.2);border-radius:8px;font-size:12px;" +
      "cursor:pointer;background:rgba(99,102,241,0.06);color:#818CF8;font-weight:600;font-family:" + FONT_SANS + ";transition:all .2s;";
    var isKo = __spectrumLang === "ko";
    flagBtn.textContent = isKo ? "\uD83D\uDEA9 이 분석 피드백" : "\uD83D\uDEA9 Flag this analysis";
    flagBtn.addEventListener("click", function () {
      var summary = "";
      if (__lastAnalysis) {
        summary = "Score: " + (__lastAnalysis.verdictScore || "?") +
          ", Lean: " + (__lastAnalysis.overallLean || "?") +
          ", Claims: " + ((__lastAnalysis.claims || []).length);
      }
      openFeedbackForm(flagBtn, "Overall Analysis", summary, "article");
    });
    flagBtn.addEventListener("mouseenter", function () { this.style.background = "rgba(99,102,241,0.12)"; });
    flagBtn.addEventListener("mouseleave", function () { this.style.background = "rgba(99,102,241,0.06)"; });
    flagRow.appendChild(flagBtn);
    sidebar.querySelector("div:last-child").appendChild(flagRow);
  }

  // Inject flag buttons into front page panel section headers
  function addFlagButtonsToFrontPage(panel) {
    if (!panel) return;
    var isKo = __spectrumLang === "ko";
    var analysisType = "frontPage";

    // Flag each headline row
    panel.querySelectorAll('[style*="border-bottom"]').forEach(function (row) {
      var titleEl = row.querySelector('[style*="font-size:13px"]');
      if (!titleEl) return;
      var title = titleEl.textContent.trim();
      if (title.length < 5) return;
      var flagContainer = row.querySelector('[style*="display:flex"][style*="gap:8px"]:first-child');
      if (flagContainer) {
        flagContainer.appendChild(createFlagButton("Headline", title, analysisType));
      }
    });

    // Flag the summary section
    var summaryEl = panel.querySelector('[style*="line-height:1.5"]');
    if (summaryEl) {
      summaryEl.parentNode.querySelector('[style*="font-weight:600"]');
      var summaryText = summaryEl.textContent.trim();
      if (summaryText) summaryEl.parentNode.insertBefore(createFlagButton("Summary", summaryText, analysisType), summaryEl.parentNode.firstChild.nextSibling);
    }

    // General flag button at bottom
    var generalRow = document.createElement("div");
    generalRow.style.cssText = "padding:10px 20px;text-align:center;border-top:1px solid " + BORDER;
    var generalBtn = document.createElement("button");
    generalBtn.style.cssText = "padding:6px 14px;border:1px solid rgba(99,102,241,0.2);border-radius:8px;font-size:12px;" +
      "cursor:pointer;background:rgba(99,102,241,0.06);color:#818CF8;font-weight:600;font-family:" + FONT_SANS + ";transition:all .2s;";
    generalBtn.textContent = isKo ? "\uD83D\uDEA9 이 분석 피드백" : "\uD83D\uDEA9 Flag this analysis";
    generalBtn.addEventListener("click", function () {
      openFeedbackForm(generalBtn, "Front Page Analysis", window.location.hostname, analysisType);
    });
    generalBtn.addEventListener("mouseenter", function () { this.style.background = "rgba(99,102,241,0.12)"; });
    generalBtn.addEventListener("mouseleave", function () { this.style.background = "rgba(99,102,241,0.06)"; });
    generalRow.appendChild(generalBtn);
    panel.appendChild(generalRow);
  }
})();
