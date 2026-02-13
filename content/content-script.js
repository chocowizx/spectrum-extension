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

  function getClaimColor(claim) { return TYPE_COLOR[claim.type] || SEV_COLOR[claim.severity] || SEV_COLOR.low; }
  function getClaimBg(claim) { return TYPE_BG[claim.type] || SEV_BG[claim.severity] || SEV_BG.low; }
  function getClaimPill(claim) { return TYPE_PILL[claim.type] || SEV_PILL[claim.severity] || SEV_PILL.low; }
  function getClaimPillText(claim) { return TYPE_PILL_TEXT[claim.type] || SEV_PILL_TEXT[claim.severity] || SEV_PILL_TEXT.low; }

  var LEAN_COLORS = {
    farLeft: "#A78BFA", left: "#7CB3E0", centerLeft: "#67B8C4",
    center: "#94A3B8", centerRight: "#D4A84A", right: "#D98282", farRight: "#C06060"
  };
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

  // Evidence strength colors (Upgrade #10)
  var EVIDENCE_COLORS = { strong: "#4ADE80", moderate: "#FBBF24", weak: "#F87171" };
  var EVIDENCE_TYPE_ICONS = { supporting: "\u2713", contradicting: "\u2717", contextual: "\u2139" };

  var FONT_SERIF = '"Charter","Georgia","Cambria","Times New Roman",serif';
  var FONT_SANS  = '-apple-system,BlinkMacSystemFont,"Segoe UI","Inter","Helvetica Neue",sans-serif';
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
        removeHighlights();
        __lastAnalysis = message.analysis;
        injectInlineAnnotations(message.analysis);
        sendResponse({ ok: true });
        break;
      case "ANALYSIS_ERROR":
        showFloatingBadge("Analysis unavailable", "#94A3B8", null);
        sendResponse({ ok: true });
        break;
      case "SETTINGS_CHANGED":
        if (message.settings && message.settings.enabled === false) {
          removeHighlights();
          removeFloatingBadge();
        }
        sendResponse({ ok: true });
        break;
      default:
        sendResponse({ ok: true });
    }
  });

  // ---- News detected → extract → send ----
  var __lastArticleData = null;
  var __lastAnalysis = null;

  function handleNewsDetected(detection) {
    showFloatingBadge("Analyzing\u2026", "#B8963E", detection);

    var articleData;
    var isYouTube = window.location.hostname.indexOf("youtube.com") !== -1;
    if (isYouTube && typeof ArticleExtractor !== "undefined") {
      articleData = ArticleExtractor.extractYouTube();
    } else if (typeof ArticleExtractor !== "undefined") {
      articleData = ArticleExtractor.extract();
    } else { return; }

    if (articleData.wordCount < 50) {
      showFloatingBadge("Too short to analyze", "#94A3B8", detection);
      return;
    }
    __lastArticleData = articleData;
    chrome.runtime.sendMessage({ type: "ARTICLE_DATA", data: articleData }).catch(function () {});
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

    var countText = claims.length + " claim" + (claims.length !== 1 ? "s" : "") + " identified";
    showFloatingBadge(countText, claims.length > 0 ? "#B8963E" : "#5E8AB4", { sourceLean: { lean: lean.replace(/[- ]/g, ""), name: "" } });

    injectArticleBanner(analysis);

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
  // MARGIN SIDEBAR — concise notes beside the article
  // ============================================================
  function buildMarginSidebar(articleEl) {
    var existing = document.getElementById("spectrum-margin-sidebar");
    if (existing) existing.remove();
    if (marginNotes.length === 0) return;

    // Detect available space
    var articleRect = articleEl.getBoundingClientRect();
    var rightSpace = window.innerWidth - articleRect.right;
    var leftSpace = articleRect.left;
    var sidebarWidth = 200;
    if (Math.max(rightSpace, leftSpace) < sidebarWidth + 8) return;

    var onRight = rightSpace >= leftSpace;

    if (getComputedStyle(articleEl).position === "static") {
      articleEl.style.position = "relative";
    }

    var sidebar = document.createElement("div");
    sidebar.id = "spectrum-margin-sidebar";
    sidebar.style.cssText =
      "position:absolute;top:0;width:" + sidebarWidth + "px;" +
      (onRight ? "left:calc(100% + 6px);" : "right:calc(100% + 6px);") +
      "font-family:" + FONT_SANS + ";z-index:2147483630;pointer-events:auto;";

    // Toggle button
    var toggle = document.createElement("div");
    toggle.id = "spectrum-sidebar-toggle";
    toggle.style.cssText =
      "position:sticky;top:8px;z-index:1;display:flex;align-items:center;gap:4px;" +
      "padding:3px 8px;margin-bottom:6px;cursor:pointer;border-radius:4px;" +
      "background:" + MARGIN_BG + ";border:1px solid " + BORDER + ";" +
      "font-size:10px;color:" + TEXT_FAINT + ";user-select:none;width:fit-content;";
    toggle.innerHTML = '<span style="font-size:12px;">&#9668;</span> <span>hide notes</span>';
    var sidebarHidden = false;

    var notesWrap = document.createElement("div");
    notesWrap.id = "spectrum-sidebar-notes";

    toggle.addEventListener("click", function () {
      sidebarHidden = !sidebarHidden;
      notesWrap.style.display = sidebarHidden ? "none" : "block";
      toggle.innerHTML = sidebarHidden
        ? '<span style="font-size:12px;">&#9658;</span> <span>show notes</span>'
        : '<span style="font-size:12px;">&#9668;</span> <span>hide notes</span>';
    });

    sidebar.appendChild(toggle);
    sidebar.appendChild(notesWrap);

    marginNotes.forEach(function (note) {
      var hl = note.wrapper;
      var claim = note.claim;
      var idx = note.index;
      var color = getClaimColor(claim);

      var hlRect = hl.getBoundingClientRect();
      var artRect = articleEl.getBoundingClientRect();
      var topOffset = hlRect.top - artRect.top + articleEl.scrollTop;

      var noteEl = document.createElement("div");
      noteEl.className = "spectrum-margin-note";
      noteEl.dataset.idx = idx;
      noteEl.style.cssText =
        "position:absolute;top:" + topOffset + "px;width:100%;" +
        "padding:4px 8px;cursor:pointer;border-radius:4px;" +
        "background:" + MARGIN_BG + ";backdrop-filter:blur(8px);" +
        "border:1px solid " + BORDER + ";" +
        "box-shadow:0 1px 3px rgba(0,0,0,.03);" +
        "transition:box-shadow .15s,transform .1s;";

      // Simple: colored dot + one-line summary
      var shortText = (claim.explanation || "").split(/[.!?]\s/)[0];
      if (shortText && !shortText.match(/[.!?]$/)) shortText += ".";
      var icon = claim.type === "verified" ? "\u2713" : "\u2022";

      noteEl.innerHTML =
        '<div style="display:flex;gap:5px;align-items:baseline;">' +
          '<span style="color:' + color + ';font-size:11px;flex-shrink:0;line-height:1;">' + icon + '</span>' +
          '<span style="font-size:11px;color:' + TEXT_MUTED + ';line-height:1.35;">' + escapeHtml(shortText) + '</span>' +
        '</div>';

      noteEl.addEventListener("mouseenter", function () {
        noteEl.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)";
        noteEl.style.transform = "translateX(" + (onRight ? "-1px" : "1px") + ")";
        hl.style.background = getClaimBg(claim).replace("0.07", "0.18");
      });
      noteEl.addEventListener("mouseleave", function () {
        noteEl.style.boxShadow = "0 1px 3px rgba(0,0,0,.03)";
        noteEl.style.transform = "none";
        hl.style.background = getClaimBg(claim);
      });
      noteEl.addEventListener("click", function () {
        hl.click();
        hl.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      notesWrap.appendChild(noteEl);
    });

    articleEl.appendChild(sidebar);

    // De-overlap
    var allNotes = notesWrap.querySelectorAll(".spectrum-margin-note");
    for (var i = 1; i < allNotes.length; i++) {
      var prev = allNotes[i - 1];
      var curr = allNotes[i];
      var prevBottom = parseFloat(prev.style.top) + prev.offsetHeight + 6;
      var currTop = parseFloat(curr.style.top);
      if (currTop < prevBottom) {
        curr.style.top = prevBottom + "px";
      }
    }
  }

  // ============================================================
  // INLINE EXPANSION PANEL — credible, with cited sources
  // ============================================================
  function attachClaimInteraction(wrapper, claim, index) {
    wrapper.addEventListener("mouseenter", function () {
      wrapper.style.background = getClaimBg(claim).replace("0.07", "0.15");
    });
    wrapper.addEventListener("mouseleave", function () {
      wrapper.style.background = getClaimBg(claim);
    });

    wrapper.addEventListener("click", function (e) {
      e.stopPropagation();
      var panelId = "spectrum-panel-" + index;
      var existing = document.getElementById(panelId);

      if (existing) {
        existing.style.maxHeight = "0";
        existing.style.opacity = "0";
        existing.style.marginTop = "0";
        existing.style.marginBottom = "0";
        existing.style.paddingTop = "0";
        existing.style.paddingBottom = "0";
        setTimeout(function () { if (existing.parentNode) existing.remove(); }, 300);
        return;
      }

      document.querySelectorAll(".spectrum-inline-panel").forEach(function (p) {
        p.style.maxHeight = "0"; p.style.opacity = "0";
        setTimeout(function () { if (p.parentNode) p.remove(); }, 300);
      });

      var parentP = wrapper.closest("p") || wrapper.parentElement;
      var color = getClaimColor(claim);
      var pillBg = getClaimPill(claim);
      var pillText = getClaimPillText(claim);
      var typeLabel = (claim.type === "verified" ? "\u2713 " : "") + (claim.type || "").replace(/_/g, " ");
      var sevLabel = (claim.severity || "").charAt(0).toUpperCase() + (claim.severity || "").slice(1);

      var panel = document.createElement("div");
      panel.id = panelId;
      panel.className = "spectrum-inline-panel";
      var panelBorderStyle = (claim.type === "verified" || claim.type === "neutral") ? "dashed" : "solid";
      panel.style.cssText =
        "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_BODY + ";" +
        "padding:0 20px;border-radius:8px;margin:0;overflow:hidden;" +
        "font-family:" + FONT_SERIF + ";font-size:14px;line-height:1.65;" +
        "border:1px solid " + BORDER + ";border-left:3px " + panelBorderStyle + " " + color + ";" +
        "box-shadow:0 2px 12px rgba(0,0,0,.06);" +
        "max-height:0;opacity:0;transition:max-height .35s ease,opacity .3s ease,margin .3s ease,padding .3s ease;";

      // Build sources HTML
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
              '</span>' +
            '</div>';
        }
        sourcesHtml += '</div>';
      }

      // Build data points HTML
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

      // Build check-worthiness indicator (Upgrade #4)
      var cwHtml = "";
      if (typeof claim.checkWorthiness === "number") {
        var cwScore = claim.checkWorthiness;
        var cwColor = cwScore > 70 ? "#F87171" : cwScore > 40 ? "#FBBF24" : "#4ADE80";
        var cwLabel = cwScore > 70 ? "High priority" : cwScore > 40 ? "Worth checking" : "Low priority";
        cwHtml =
          '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;font-family:' + FONT_SANS + ';">' +
            '<span style="font-size:10px;color:' + TEXT_FAINT + ';white-space:nowrap;">Check-worthiness</span>' +
            '<div style="flex:1;height:4px;border-radius:2px;background:rgba(0,0,0,.06);max-width:100px;">' +
              '<div style="height:100%;width:' + cwScore + '%;border-radius:2px;background:' + cwColor + ';"></div>' +
            '</div>' +
            '<span style="font-size:10px;color:' + cwColor + ';font-weight:600;">' + cwScore + ' \u2014 ' + cwLabel + '</span>' +
          '</div>';
      }

      // Build information gaps HTML (Upgrade #4)
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
        // Header
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-family:' + FONT_SANS + ';">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;' +
              'font-weight:600;text-transform:uppercase;letter-spacing:.5px;' +
              'background:' + pillBg + ';color:' + pillText + ';">' + escapeHtml(typeLabel) + '</span>' +
            '<span style="font-size:11px;color:' + TEXT_FAINT + ';">' + sevLabel + ' severity</span>' +
          '</div>' +
          '<span class="spectrum-panel-close" style="cursor:pointer;color:' + TEXT_FAINT + ';font-size:16px;line-height:1;padding:2px 6px;border-radius:4px;transition:background .15s;"' +
            ' onmouseenter="this.style.background=\'rgba(0,0,0,.05)\'" onmouseleave="this.style.background=\'transparent\'">\u00D7</span>' +
        '</div>' +
        // Check-worthiness bar (Upgrade #4)
        cwHtml +
        // Explanation (serif, readable)
        '<div style="color:' + TEXT_BODY + ';margin-bottom:6px;">' + escapeHtml(claim.explanation || "") + '</div>' +
        // Sources
        sourcesHtml +
        // Data points
        dataHtml +
        // Information gaps (Upgrade #4)
        gapsHtml +
        // Alternative perspectives
        (claim.alternativePerspectives ?
          '<div style="margin-top:12px;padding:10px 12px;border-radius:6px;border-left:2px solid ' + LEAN_COLORS.center + ';background:rgba(148,163,184,0.05);">' +
            '<div style="font-family:' + FONT_SANS + ';font-size:10px;font-weight:600;text-transform:uppercase;' +
              'letter-spacing:.8px;color:' + TEXT_FAINT + ';margin-bottom:4px;">Other Perspectives</div>' +
            '<div style="font-size:13px;color:' + TEXT_MUTED + ';line-height:1.55;">' + escapeHtml(claim.alternativePerspectives) + '</div>' +
          '</div>' : '') +
        // Perspectives — auto-load on open
        '<div class="spectrum-persp-section" style="margin-top:12px;">' +
          '<div class="spectrum-persp-loading" style="display:flex;align-items:center;gap:8px;padding:10px 0;font-family:' + FONT_SANS + ';font-size:12px;color:' + TEXT_FAINT + ';">' +
            '<span class="spectrum-spinner" style="display:inline-block;width:14px;height:14px;border:2px solid ' + BORDER + ';border-top-color:' + color + ';border-radius:50%;animation:spectrum-spin .8s linear infinite;"></span>' +
            'Loading deeper analysis\u2026' +
          '</div>' +
          '<div class="spectrum-persp-body" style="display:none;margin-top:12px;"></div>' +
        '</div>' +
        // Deep Analysis button
        '<div style="margin-top:10px;padding-top:10px;border-top:1px solid ' + BORDER + ';">' +
          '<button class="spectrum-deep-btn" style="' +
            'display:flex;align-items:center;justify-content:center;gap:8px;width:100%;' +
            'background:linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08));' +
            'border:1px solid rgba(99,102,241,0.2);border-radius:8px;color:#818CF8;' +
            'padding:10px 14px;cursor:pointer;font-size:12px;font-weight:600;' +
            'font-family:' + FONT_SANS + ';letter-spacing:.3px;transition:all .2s;' +
          '" onmouseenter="this.style.background=\'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.14))\';this.style.borderColor=\'rgba(99,102,241,0.35)\'"' +
          ' onmouseleave="this.style.background=\'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))\';this.style.borderColor=\'rgba(99,102,241,0.2)\'"' +
          '><span style="font-size:14px;">\u2728</span> Full Deep Analysis</button>' +
        '</div>';

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

      // Auto-load factual context when panel opens
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

      // Deep Analysis button handler
      panel.querySelector(".spectrum-deep-btn").addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (!__lastArticleData) {
          alert("Article data not available. Please reload the page.");
          return;
        }
        // Send data to background, which opens the page
        chrome.runtime.sendMessage({
          type: "OPEN_DEEP_ANALYSIS",
          data: {
            articleText: __lastArticleData.text,
            articleUrl: __lastArticleData.url || window.location.href,
            articleTitle: __lastArticleData.title || document.title,
            sourceDomain: __lastArticleData.domain || window.location.hostname,
            images: __lastArticleData.images || [],
            fastAnalysis: __lastAnalysis || null,
          }
        }).catch(function () {});
      });
    });
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
      accurate: "Accurate", mostly_accurate: "Mostly Accurate", lacks_context: "Lacks Context",
      misleading: "Misleading", opinion: "Opinion", unverifiable: "Unverifiable"
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
    var leanLabels = { left: "Left-Leaning", center: "Centrist", right: "Right-Leaning" };
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
  // ARTICLE BANNER
  // ============================================================
  function injectArticleBanner(analysis) {
    var existing = document.getElementById("spectrum-banner");
    if (existing) existing.remove();

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

    // Intent classification (Upgrade #9)
    var intent = analysis.intentClassification || {};
    var intentType = intent.type || "";
    var intentColor = INTENT_COLORS[intentType] || TEXT_FAINT;
    var intentLabel = INTENT_LABELS[intentType] || "";
    var intentConf = intent.confidence ? Math.round(intent.confidence * 100) + "%" : "";

    // Lean score (Upgrade #1) — continuous -1.0 to +1.0
    var leanScore = typeof analysis.leanScore === "number" ? analysis.leanScore : null;

    // Polarization intensity (Upgrade #8 adjacent)
    var polarization = typeof analysis.polarizationIntensity === "number" ? analysis.polarizationIntensity : null;

    // Language detection (Upgrade #2)
    var detectedLang = analysis.detectedLanguage || "";

    var banner = document.createElement("div");
    banner.id = "spectrum-banner";
    banner.style.cssText =
      "background:" + PANEL_BG + ";backdrop-filter:blur(12px);color:" + TEXT_HEAD + ";" +
      "padding:10px 18px;font-family:" + FONT_SANS + ";" +
      "font-size:12px;border-radius:8px;margin:10px 0 14px;border:1px solid " + BORDER + ";" +
      "box-shadow:0 1px 6px rgba(0,0,0,.04);";

    // Row 1: Logo + claim counts + lean badge
    var preAnalyzedBadge = analysis._preAnalyzed
      ? '<span style="padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;letter-spacing:.5px;' +
          'background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;text-transform:uppercase;">Spectrum Analyzed</span>'
      : '';
    var row1Html =
      '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
        '<span style="font-weight:700;letter-spacing:1.5px;font-size:11px;color:' + TEXT_FAINT + ';">SPECTRUM</span>' +
        preAnalyzedBadge +
        '<span style="width:1px;height:14px;background:' + BORDER + ';"></span>' +
        (claims.length > 0 ?
          '<span style="color:' + TEXT_BODY + ';">' + claims.length + ' claim' + (claims.length !== 1 ? 's' : '') + ' identified</span>' +
          (highCount ? '<span style="padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600;background:' + SEV_PILL.high + ';color:' + SEV_PILL_TEXT.high + ';">' + highCount + ' high</span>' : '') +
          (medCount ? '<span style="padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600;background:' + SEV_PILL.medium + ';color:' + SEV_PILL_TEXT.medium + ';">' + medCount + ' med</span>' : '') +
          (lowCount ? '<span style="padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600;background:' + SEV_PILL.low + ';color:' + SEV_PILL_TEXT.low + ';">' + lowCount + ' low</span>' : '') +
          (verifiedCount ? '<span style="padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600;background:' + TYPE_PILL.verified + ';color:' + TYPE_PILL_TEXT.verified + ';">' + verifiedCount + ' verified</span>' : '') +
          (neutralCount ? '<span style="padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600;background:' + TYPE_PILL.neutral + ';color:' + TYPE_PILL_TEXT.neutral + ';">' + neutralCount + ' noted</span>' : '') :
          '<span style="color:#4ADE80;">No claims identified</span>'
        ) +
        '<span style="margin-left:auto;display:flex;align-items:center;gap:8px;">' +
          // Intent badge (Upgrade #9)
          (intentLabel ?
            '<span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;' +
              'background:' + intentColor + '15;color:' + intentColor + ';border:1px solid ' + intentColor + '30;">' +
              intentLabel + (intentConf ? ' \u00B7 ' + intentConf : '') +
            '</span>' : '') +
          // Lean badge
          '<span style="padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;' +
            'background:' + leanColor + '18;color:' + leanColor + ';border:1px solid ' + leanColor + '30;">' +
            leanLabel + (confidence ? ' \u00B7 ' + confidence : '') +
          '</span>' +
          // Language badge if non-English
          (detectedLang && detectedLang !== "en" ?
            '<span style="padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600;' +
              'background:rgba(148,163,184,0.1);color:' + TEXT_FAINT + ';border:1px solid ' + BORDER + ';" title="Detected language">' +
              escapeHtml(detectedLang.toUpperCase()) +
            '</span>' : '') +
        '</span>' +
      '</div>';

    // Row 2: Lean score bar + polarization gauge (only if data exists)
    var row2Html = "";
    if (leanScore !== null || polarization !== null) {
      row2Html = '<div style="display:flex;align-items:center;gap:16px;margin-top:8px;padding-top:8px;border-top:1px solid ' + BORDER + ';">';

      // Lean score bar (Upgrade #1) — gradient from blue (-1) through gray (0) to red (+1)
      if (leanScore !== null) {
        var barPct = ((leanScore + 1) / 2) * 100; // 0-100
        row2Html +=
          '<div style="flex:1;display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:10px;color:' + TEXT_FAINT + ';white-space:nowrap;">Article Lean</span>' +
            '<div style="flex:1;height:6px;border-radius:3px;background:linear-gradient(to right,#7CB3E0,#94A3B8,#D98282);position:relative;min-width:80px;">' +
              '<div style="position:absolute;top:-3px;left:calc(' + barPct + '% - 6px);width:12px;height:12px;' +
                'border-radius:50%;background:' + TEXT_HEAD + ';border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.2);"></div>' +
            '</div>' +
            '<span style="font-size:10px;color:' + TEXT_MUTED + ';font-weight:600;min-width:28px;text-align:right;">' +
              (leanScore > 0 ? '+' : '') + leanScore.toFixed(1) +
            '</span>' +
          '</div>';
      }

      // Polarization gauge
      if (polarization !== null) {
        var polColor = polarization > 75 ? "#F87171" : polarization > 50 ? "#FBBF24" : polarization > 20 ? "#60A5FA" : "#4ADE80";
        var polLabel = polarization > 75 ? "Extreme" : polarization > 50 ? "High" : polarization > 20 ? "Moderate" : "Low";
        row2Html +=
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:10px;color:' + TEXT_FAINT + ';white-space:nowrap;">Polarization</span>' +
            '<div style="width:60px;height:6px;border-radius:3px;background:rgba(0,0,0,.06);position:relative;">' +
              '<div style="height:100%;width:' + polarization + '%;border-radius:3px;background:' + polColor + ';"></div>' +
            '</div>' +
            '<span style="font-size:10px;color:' + polColor + ';font-weight:600;">' + polLabel + '</span>' +
          '</div>';
      }

      row2Html += '</div>';
    }

    // Row 3: Intent explanation (if persuasion or manipulation — worth highlighting)
    var row3Html = "";
    if (intent.explanation && (intentType === "persuasion" || intentType === "manipulation")) {
      row3Html =
        '<div style="margin-top:6px;padding:6px 10px;border-radius:6px;background:' + (INTENT_BG[intentType] || "transparent") + ';' +
          'border-left:2px solid ' + intentColor + ';font-size:11px;color:' + TEXT_MUTED + ';line-height:1.4;">' +
          '<strong style="color:' + intentColor + ';">Intent: </strong>' + escapeHtml(intent.explanation) +
        '</div>';
    }

    banner.innerHTML = row1Html + row2Html + row3Html;

    var articleEl = document.querySelector("article, [role='main'], main, .article-body, .story-body");
    if (articleEl) {
      articleEl.insertBefore(banner, articleEl.firstChild);
    } else {
      var h1 = document.querySelector("h1");
      if (h1 && h1.parentNode) h1.parentNode.insertBefore(banner, h1.nextSibling);
    }
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
      var banner = document.getElementById("spectrum-banner");
      if (banner && banner.parentNode === articleEl) {
        articleEl.insertBefore(container, banner.nextSibling);
      } else {
        articleEl.insertBefore(container, articleEl.firstChild);
      }
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

    // Insert after bias notes, or after banner
    var biasNotes = document.getElementById("spectrum-bias-notes");
    if (biasNotes && biasNotes.parentNode) {
      biasNotes.parentNode.insertBefore(container, biasNotes.nextSibling);
    } else if (articleEl && articleEl !== document.body) {
      var banner = document.getElementById("spectrum-banner");
      if (banner && banner.parentNode === articleEl) {
        articleEl.insertBefore(container, banner.nextSibling);
      } else {
        articleEl.insertBefore(container, articleEl.firstChild);
      }
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

    // Insert after hidden biases, bias notes, or banner
    var hiddenBiases = document.getElementById("spectrum-hidden-biases");
    var biasNotes = document.getElementById("spectrum-bias-notes");
    var insertAfter = hiddenBiases || biasNotes;
    if (insertAfter && insertAfter.parentNode) {
      insertAfter.parentNode.insertBefore(container, insertAfter.nextSibling);
    } else if (articleEl && articleEl !== document.body) {
      var banner = document.getElementById("spectrum-banner");
      if (banner && banner.parentNode === articleEl) {
        articleEl.insertBefore(container, banner.nextSibling);
      }
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
      var banner = document.getElementById("spectrum-banner");
      if (banner && banner.parentNode === articleEl) {
        articleEl.insertBefore(container, banner.nextSibling);
      }
    }
  }

  // ============================================================
  // FLOATING BADGE
  // ============================================================
  function showFloatingBadge(text, color, detection) {
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
    document.querySelectorAll(".spectrum-hl").forEach(function (el) {
      var parent = el.parentNode;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    });
    var banner = document.getElementById("spectrum-banner");
    if (banner) banner.remove();
    var biasNotes = document.getElementById("spectrum-bias-notes");
    if (biasNotes) biasNotes.remove();
    var hiddenBiases = document.getElementById("spectrum-hidden-biases");
    if (hiddenBiases) hiddenBiases.remove();
    var softBias = document.getElementById("spectrum-soft-bias");
    if (softBias) softBias.remove();
    var polarization = document.getElementById("spectrum-polarization");
    if (polarization) polarization.remove();
    document.querySelectorAll(".spectrum-inline-panel").forEach(function (p) { p.remove(); });
    var sidebar = document.getElementById("spectrum-margin-sidebar");
    if (sidebar) sidebar.remove();
    marginNotes = [];
  }

  function escapeHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
