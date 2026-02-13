(function () {
  var API_BASE = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net";
  var initLoading = document.getElementById("init-loading");
  var initFill = document.getElementById("init-fill");
  var initStatus = document.getElementById("init-status");
  var pageLayout = document.getElementById("page-layout");

  // Wire up back/close buttons via JS (no inline onclick — blocked by MV3 CSP)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".back-btn, .close-btn");
    if (btn) window.close();
  });

  function hideInitLoader() {
    if (initLoading) {
      initLoading.style.transition = "opacity .4s";
      initLoading.style.opacity = "0";
      setTimeout(function () { initLoading.style.display = "none"; }, 400);
    }
  }

  function showPageLayout() {
    if (pageLayout) pageLayout.style.display = "";
  }

  // ---- Bottom loader remarks (rotating while deep analysis runs) ----
  var deepRemarks = [
    { main: "Diving deeper into bias patterns\u2026", sub: "Analyzing language framing, word choice, and rhetorical devices" },
    { main: "Cross-referencing against academic frameworks", sub: "Using established media bias research methodologies" },
    { main: "We analyze strictly based on academically grounded theories", sub: "Informed by Herman & Chomsky, Entman framing theory, and more" },
    { main: "Mapping hidden assumptions in the text", sub: "Identifying unstated premises the article takes for granted" },
    { main: "This takes a bit longer for good reason", sub: "Comprehensive analysis requires examining every claim against multiple lenses" },
    { main: "Evaluating source credibility and track record", sub: "Checking historical accuracy patterns for this outlet" },
    { main: "Measuring polarization intensity", sub: "Quantifying how much the language aims to divide rather than inform" },
    { main: "Detecting soft bias indicators", sub: "Looking for subtle framing, selective emphasis, and omission patterns" },
    { main: "Almost there \u2014 assembling the full picture", sub: "Combining all signals into a comprehensive, evidence-based report" },
  ];

  var bottomRemarkIdx = 0;
  var bottomRemarkTimer = null;

  function showBottomLoader() {
    var loader = document.getElementById("deep-bottom-loader");
    loader.innerHTML =
      '<div class="deep-loader-orb"><div class="deep-loader-glow"></div></div>' +
      '<div class="deep-loader-bar"><div class="deep-loader-fill" id="bottom-fill"></div></div>' +
      '<div class="deep-loader-remark" id="bottom-remark"></div>' +
      '<div class="deep-loader-sub" id="bottom-sub"></div>';
    loader.classList.add("visible");

    bottomRemarkIdx = 0;
    tickBottomRemark();
  }

  function tickBottomRemark() {
    var remarkEl = document.getElementById("bottom-remark");
    var subEl = document.getElementById("bottom-sub");
    var fillEl = document.getElementById("bottom-fill");
    if (!remarkEl) return;

    var r = deepRemarks[bottomRemarkIdx % deepRemarks.length];
    // Fade out
    remarkEl.style.opacity = "0";
    subEl.style.opacity = "0";
    setTimeout(function () {
      remarkEl.textContent = r.main;
      subEl.textContent = r.sub;
      remarkEl.style.opacity = "1";
      subEl.style.opacity = "1";
    }, 300);

    // Progress bar
    var pct = Math.min(95, ((bottomRemarkIdx + 1) / deepRemarks.length) * 90 + 5);
    if (fillEl) fillEl.style.width = pct + "%";

    bottomRemarkIdx++;
    bottomRemarkTimer = setTimeout(tickBottomRemark, 4500 + Math.random() * 2000);
  }

  function hideBottomLoader() {
    clearTimeout(bottomRemarkTimer);
    var loader = document.getElementById("deep-bottom-loader");
    var fillEl = document.getElementById("bottom-fill");
    if (fillEl) fillEl.style.width = "100%";
    setTimeout(function () {
      loader.classList.remove("visible");
    }, 600);
  }

  // ---- Load data from service worker via messaging ----
  chrome.runtime.sendMessage({ type: "GET_DEEP_DATA" }, function (result) {
    try {
      var data = result && result.data;
      if (!data || !data.articleText) {
        showError("No article data received. Please try again from the article page.");
        return;
      }

      // Phase 1: Render fast analysis immediately
      if (data.fastAnalysis) {
        initFill.style.width = "40%";
        initStatus.textContent = "Rendering quick analysis\u2026";
        setTimeout(function () {
          hideInitLoader();
          showPageLayout();
          renderResults(data, data.fastAnalysis, false);
          // Phase 2: Fire deep analysis with bottom loader
          runDeepAnalysis(data, true);
        }, 200);
      } else {
        // No fast analysis — keep loader visible, go straight to deep
        initFill.style.width = "15%";
        initStatus.textContent = "Running deep analysis\u2026";
        runDeepAnalysis(data, false);
      }
    } catch (err) {
      showError("Error: " + err.message);
    }
  });

  function showError(msg) {
    hideInitLoader();
    showPageLayout();
    var results = document.getElementById("results");
    results.innerHTML = '<div class="error-msg">' + esc(msg) +
      '<br><br><button class="back-btn close-btn" style="position:static;display:inline-flex;">Close</button></div>';
    results.classList.add("visible");
  }

  // ---- Deep analysis with progress strip + bottom loader ----
  var stages = [
    { pct: 12, text: "Sending to comprehensive analyzer" },
    { pct: 28, text: "Scanning claims & bias patterns" },
    { pct: 45, text: "Cross-referencing sources" },
    { pct: 58, text: "Classifying intent & framing" },
    { pct: 72, text: "Measuring polarization" },
    { pct: 85, text: "Uncovering hidden assumptions" },
    { pct: 94, text: "Finalizing deep analysis" },
  ];
  var stageIdx = 0, stageTimer;

  function startProgress() {
    var strip = document.getElementById("deep-strip");
    strip.style.display = "block";
    var fill = document.getElementById("progress-fill");
    var statusText = document.getElementById("deep-status-text");
    function tick() {
      if (stageIdx >= stages.length) return;
      fill.style.width = stages[stageIdx].pct + "%";
      statusText.textContent = stages[stageIdx].text;
      stageIdx++;
      stageTimer = setTimeout(tick, 2200 + Math.random() * 1800);
    }
    tick();
  }

  function endProgress() {
    clearTimeout(stageTimer);
    clearInterval(stageTimer);
    var fill = document.getElementById("progress-fill");
    if (fill) fill.style.width = "100%";
    setTimeout(function () {
      var strip = document.getElementById("deep-strip");
      if (strip) strip.style.display = "none";
    }, 800);
  }

  async function runDeepAnalysis(data, hasFast) {
    if (hasFast) {
      startProgress();
      showBottomLoader();
    } else {
      // Update init loader with progress stages
      var sIdx = 0;
      stageTimer = setInterval(function () {
        if (sIdx >= stages.length) return;
        if (initFill) initFill.style.width = stages[sIdx].pct + "%";
        if (initStatus) initStatus.textContent = stages[sIdx].text;
        sIdx++;
      }, 2500);
    }
    try {
      // 100s fetch timeout to match CF's 120s + Anthropic's 90s
      var controller = new AbortController();
      var fetchTimeout = setTimeout(function () { controller.abort(); }, 100000);

      var resp = await fetch(API_BASE + "/analyzeArticle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          articleText: data.articleText,
          articleUrl: data.articleUrl,
          articleTitle: data.articleTitle,
          sourceDomain: data.sourceDomain,
          images: data.images || [],
          mode: "deep",
        }),
      });
      clearTimeout(fetchTimeout);

      if (!resp.ok) {
        var errBody = await resp.text();
        throw new Error("API error " + resp.status + ": " + errBody.slice(0, 100));
      }
      var analysis = await resp.json();

      if (hasFast) {
        endProgress();
        hideBottomLoader();
      } else {
        clearInterval(stageTimer);
        hideInitLoader();
        showPageLayout();
      }

      // Re-render with deep data (replaces fast)
      renderResults(data, analysis, true);
      // Citations load last, after everything else
      setTimeout(renderCitations, 800);
    } catch (err) {
      if (hasFast) {
        endProgress();
        hideBottomLoader();
        // Show error inline but keep fast results
        var notice = document.createElement("div");
        notice.className = "section";
        notice.style.borderColor = "rgba(248,113,113,.2)";
        notice.innerHTML = '<div class="section-label" style="color:var(--red);">Deep Analysis Unavailable</div>' +
          '<div style="font-size:13px;color:var(--text-muted);">Showing quick analysis. Deep analysis failed: ' + esc(err.message) + '</div>';
        document.getElementById("results").appendChild(notice);
      } else {
        clearInterval(stageTimer);
        showError("Analysis failed: " + err.message);
      }
    }
  }

  // ---- RENDER ----
  function renderResults(articleData, a, isDeep) {
    var results = document.getElementById("results");
    var html = '';

    html += '<button class="back-btn"><span>\u2190</span> Close</button>';

    // Header
    var leanLabel = a.overallLean || "Unknown";
    var depthBadge = isDeep
      ? '<span class="badge" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-size:9px;letter-spacing:.5px;">DEEP ANALYSIS</span>'
      : '<span class="badge" style="background:rgba(255,255,255,.06);color:var(--text-faint);font-size:9px;letter-spacing:.5px;">QUICK \u2014 DEEP LOADING\u2026</span>';
    html +=
      '<div class="result-header">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<div class="result-title" style="margin-bottom:0;">' + esc(articleData.articleTitle || "Article Analysis") + '</div>' +
        '</div>' +
        '<div class="result-meta">' +
          depthBadge +
          '<span>Source: ' + esc(articleData.sourceDomain || "Unknown") + '</span>' +
          '<span>\u00B7</span>' +
          '<span>Lean: ' + esc(leanLabel) + '</span>' +
          (a.confidence ? '<span>\u00B7</span><span>Confidence: ' + Math.round(a.confidence * 100) + '%</span>' : '') +
        '</div>' +
      '</div>';

    // ---- OVERVIEW ----
    html += '<div class="section" id="sec-overview">';
    html += '<div class="section-label">Overview</div>';

    // Lean score bar
    if (typeof a.leanScore === "number") {
      var barPct = ((a.leanScore + 1) / 2) * 100;
      html +=
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-faint);margin-bottom:6px;">' +
            '<span>Left (-1.0)</span><span>Center</span><span>Right (+1.0)</span>' +
          '</div>' +
          '<div class="lean-bar"><div class="lean-dot" style="left:' + barPct + '%;"></div></div>' +
          '<div style="text-align:center;margin-top:8px;font-size:13px;font-weight:600;color:var(--accent);">' +
            (a.leanScore > 0 ? "+" : "") + a.leanScore.toFixed(2) +
          '</div>' +
        '</div>';
    }

    // Intent
    var intent = a.intentClassification || {};
    var intentType = intent.type || a.intentType || "";
    if (intentType) {
      var intentColors = { informative: "#4ADE80", advocacy: "#60A5FA", persuasion: "#FBBF24", manipulation: "#F87171" };
      var ic = intentColors[intentType] || "var(--text-faint)";
      html +=
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:12px;color:var(--text-faint);">Intent</span>' +
            '<span class="badge" style="background:' + ic + '18;color:' + ic + ';border:1px solid ' + ic + '30;">' +
              esc(intentType.charAt(0).toUpperCase() + intentType.slice(1)) +
              (intent.confidence ? ' \u00B7 ' + Math.round(intent.confidence * 100) + '%' : '') +
            '</span>' +
          '</div>' +
          (intent.explanation ? '<div style="font-size:13px;color:var(--text-muted);line-height:1.5;">' + esc(intent.explanation) + '</div>' : '') +
        '</div>';
    }

    // Polarization (deep only)
    if (typeof a.polarizationIntensity === "number") {
      var pol = a.polarizationIntensity;
      var polColor = pol > 75 ? "var(--red)" : pol > 50 ? "var(--yellow)" : pol > 20 ? "var(--blue)" : "var(--green)";
      var polLabel = pol > 75 ? "Extreme" : pol > 50 ? "High" : pol > 20 ? "Moderate" : "Low";
      html +=
        '<div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:12px;color:var(--text-faint);">Polarization</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + polColor + ';">' + polLabel + ' (' + pol + '/100)</span>' +
          '</div>' +
          '<div class="pol-track"><div class="pol-fill" style="width:' + pol + '%;background:' + polColor + ';"></div></div>' +
          (a.polarizationDrivers && a.polarizationDrivers.length ?
            '<div style="margin-top:8px;">' + a.polarizationDrivers.map(function (d) {
              return '<div style="font-size:12px;color:var(--text-muted);padding-left:8px;border-left:2px solid ' + polColor + ';margin-bottom:4px;">' + esc(d) + '</div>';
            }).join('') + '</div>' : '') +
        '</div>';
    }

    if (a.sourceBias) {
      html += '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-faint);line-height:1.5;">' + esc(a.sourceBias) + '</div>';
    }
    html += '</div>';

    // ---- CLAIMS ----
    var claims = a.claims || [];
    if (claims.length > 0) {
      html += '<div class="section" id="sec-claims">';
      html += '<div class="section-label">Claims Analysis (' + claims.length + ' identified)</div>';
      for (var ci = 0; ci < claims.length; ci++) {
        html += renderClaim(claims[ci]);
      }
      html += '</div>';
    }

    // ---- BIAS INDICATORS ----
    var indicators = a.biasIndicators || [];
    if (indicators.length > 0) {
      html += '<div class="section" id="sec-bias">';
      html += '<div class="section-label">Bias Indicators</div>';
      for (var bi = 0; bi < indicators.length; bi++) {
        var b = indicators[bi];
        html +=
          '<div style="margin-bottom:10px;padding:10px 14px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);">' +
            '<div style="font-weight:600;color:var(--text);margin-bottom:4px;text-transform:capitalize;font-size:13px;">' +
              esc((b.pattern || "").replace(/_/g, " ")) + '</div>' +
            (b.examples ? '<div style="font-style:italic;color:var(--text-muted);font-size:12px;font-family:var(--serif);">\u201C' +
              b.examples.map(esc).join('\u201D, \u201C') + '\u201D</div>' : '') +
            (b.explanation ? '<div style="color:var(--text-muted);font-size:12px;margin-top:4px;line-height:1.45;">' + esc(b.explanation) + '</div>' : '') +
          '</div>';
      }
      html += '</div>';
    }

    // ---- DEEP-ONLY SECTIONS ----
    if (isDeep) {
      var biases = a.unverbalizedBiases || [];
      if (biases.length > 0) {
        html += '<div class="section" id="sec-hidden">';
        html += '<div class="section-label">Hidden Assumptions</div>';
        for (var hi = 0; hi < biases.length; hi++) {
          var hb = biases[hi];
          var hbColor = hb.biasIntensity === "high" ? "var(--red)" : hb.biasIntensity === "medium" ? "var(--yellow)" : "var(--blue)";
          html +=
            '<div class="bias-card">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
                '<span class="badge" style="background:' + hbColor + '15;color:' + hbColor + ';">' + esc(hb.biasIntensity || "low") + '</span>' +
              '</div>' +
              '<div class="assumption">' + esc(hb.assumption || "") + '</div>' +
              (hb.reasoningLocation ? '<div class="location">\u201C' + esc(hb.reasoningLocation) + '\u201D</div>' : '') +
            '</div>';
        }
        html += '</div>';
      }

      var soft = a.softBiasIndicators || [];
      if (soft.length > 0) {
        html += '<div class="section" id="sec-soft">';
        html += '<div class="section-label">Soft Bias Patterns</div>';
        for (var sbi = 0; sbi < soft.length; sbi++) {
          var sb = soft[sbi];
          html +=
            '<div class="bias-card">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
                '<span class="badge" style="background:var(--red)15;color:var(--red);">' + esc((sb.pattern || "").replace(/_/g, " ")) + '</span>' +
                (sb.target ? '<span style="font-size:12px;color:var(--text-muted);">Target: ' + esc(sb.target) + '</span>' : '') +
              '</div>' +
              (sb.examples ? '<div style="font-style:italic;color:var(--text-muted);font-size:12px;font-family:var(--serif);margin-bottom:4px;">\u201C' +
                sb.examples.map(esc).join('\u201D, \u201C') + '\u201D</div>' : '') +
              (sb.explanation ? '<div style="font-size:12px;color:var(--text-muted);line-height:1.45;">' + esc(sb.explanation) + '</div>' : '') +
            '</div>';
        }
        html += '</div>';
      }
    }

    results.innerHTML = html;
    results.classList.add("visible");

    // ---- Populate side panels ----
    renderSidePanels(a, isDeep);
  }

  // ---- SIDE PANELS: Sources & Evidence ----
  function renderSidePanels(a, isDeep) {
    var leftPanel = document.getElementById("side-left");
    var rightPanel = document.getElementById("side-right");

    // LEFT PANEL: Evidence & Data Points
    var leftHtml = '';

    // Collect all data points from claims
    var allDataPoints = [];
    var allGaps = [];
    var claims = a.claims || [];
    for (var i = 0; i < claims.length; i++) {
      var c = claims[i];
      if (c.dataPoints) {
        for (var d = 0; d < c.dataPoints.length; d++) {
          allDataPoints.push({ text: c.dataPoints[d], claim: (c.sentence || "").slice(0, 50) });
        }
      }
      if (c.informationGaps) {
        for (var g = 0; g < c.informationGaps.length; g++) {
          allGaps.push(c.informationGaps[g]);
        }
      }
    }

    if (allDataPoints.length > 0) {
      leftHtml += '<div class="side-card">';
      leftHtml += '<div class="side-card-label">Key Data Points</div>';
      for (var dp = 0; dp < allDataPoints.length; dp++) {
        leftHtml += '<div class="side-source">' +
          '<span class="side-evidence-tag" style="background:rgba(96,165,250,.1);color:#60A5FA;">DATA</span>' +
          esc(allDataPoints[dp].text) + '</div>';
      }
      leftHtml += '</div>';
    }

    if (allGaps.length > 0) {
      leftHtml += '<div class="side-card">';
      leftHtml += '<div class="side-card-label">Information Gaps</div>';
      for (var gp = 0; gp < allGaps.length; gp++) {
        leftHtml += '<div class="side-source">' +
          '<span class="side-evidence-tag" style="background:rgba(251,191,36,.1);color:#FBBF24;">GAP</span>' +
          esc(allGaps[gp]) + '</div>';
      }
      leftHtml += '</div>';
    }

    // Bias indicators summary for left panel
    var indicators = a.biasIndicators || [];
    if (indicators.length > 0) {
      leftHtml += '<div class="side-card">';
      leftHtml += '<div class="side-card-label">Bias Patterns Found</div>';
      for (var bp = 0; bp < indicators.length; bp++) {
        var pat = indicators[bp];
        leftHtml += '<div class="side-source">' +
          '<span class="side-evidence-tag" style="background:rgba(248,113,113,.1);color:#F87171;">BIAS</span>' +
          '<strong>' + esc((pat.pattern || "").replace(/_/g, " ")) + '</strong>' +
          '</div>';
      }
      leftHtml += '</div>';
    }

    // Methodology card
    leftHtml += '<div class="side-card" style="border-color:rgba(129,140,248,.15);">';
    leftHtml += '<div class="side-card-label">Methodology</div>';
    leftHtml += '<div style="font-size:11px;color:var(--text-faint);line-height:1.6;">' +
      'Analysis grounded in established media studies frameworks: ' +
      'Herman & Chomsky\u2019s propaganda model, ' +
      'Entman\u2019s framing theory, ' +
      'and AllSides/Ad Fontes media bias classifications.' +
      '</div>';
    leftHtml += '</div>';

    leftPanel.innerHTML = leftHtml;

    // RIGHT PANEL: Sources & Credibility
    var rightHtml = '';

    // Source credibility card
    rightHtml += '<div class="side-card">';
    rightHtml += '<div class="side-card-label">Source Profile</div>';
    rightHtml += '<div class="side-source"><strong>' + esc(a.sourceBias ? a.sourceBias.split(" is ")[0] || "Source" : "Source") + '</strong></div>';
    if (a.overallLean) {
      var leanColors = { "left": "#7CB3E0", "center-left": "#93B5D0", "center": "#94A3B8", "center-right": "#C4918F", "right": "#D98282" };
      var lc = leanColors[a.overallLean.toLowerCase()] || "var(--text-faint)";
      rightHtml += '<div class="side-source">' +
        '<span class="side-evidence-tag" style="background:' + lc + '18;color:' + lc + ';">' + esc(a.overallLean) + '</span>' +
        'Editorial lean</div>';
    }
    if (typeof a.leanScore === "number") {
      rightHtml += '<div class="side-source">Lean score: <strong>' + (a.leanScore > 0 ? "+" : "") + a.leanScore.toFixed(2) + '</strong></div>';
    }
    if (typeof a.confidence === "number") {
      rightHtml += '<div class="side-source">Confidence: <strong>' + Math.round(a.confidence * 100) + '%</strong></div>';
    }
    rightHtml += '</div>';

    // Claim sources (deep mode)
    var claimSources = [];
    for (var cs = 0; cs < claims.length; cs++) {
      var src = claims[cs].sources || [];
      for (var s = 0; s < src.length; s++) {
        var already = false;
        for (var e = 0; e < claimSources.length; e++) {
          if (claimSources[e].name === src[s].name) { already = true; break; }
        }
        if (!already) claimSources.push(src[s]);
      }
    }

    if (claimSources.length > 0) {
      rightHtml += '<div class="side-card">';
      rightHtml += '<div class="side-card-label">Referenced Sources</div>';
      for (var rs = 0; rs < claimSources.length; rs++) {
        rightHtml += '<div class="side-source">' +
          '<strong>' + esc(claimSources[rs].name) + '</strong>' +
          (claimSources[rs].detail ? '<br><span style="font-size:11px;">' + esc(claimSources[rs].detail) + '</span>' : '') +
          '</div>';
      }
      rightHtml += '</div>';
    }

    // Claims breakdown summary
    var typeCount = {};
    for (var tc = 0; tc < claims.length; tc++) {
      var t = claims[tc].type || "unknown";
      typeCount[t] = (typeCount[t] || 0) + 1;
    }
    var typeKeys = Object.keys(typeCount);
    if (typeKeys.length > 0) {
      rightHtml += '<div class="side-card">';
      rightHtml += '<div class="side-card-label">Claims Breakdown</div>';
      var typeColorMap = { verified: "#4ADE80", neutral: "#94A3B8", contentious: "#FBBF24", misleading: "#F87171", unsupported: "#F87171", opinion_as_fact: "#FBBF24", omission: "#60A5FA" };
      for (var tk = 0; tk < typeKeys.length; tk++) {
        var key = typeKeys[tk];
        var clr = typeColorMap[key] || "var(--text-faint)";
        rightHtml += '<div class="side-source" style="display:flex;justify-content:space-between;align-items:center;">' +
          '<span>' +
            '<span class="side-evidence-tag" style="background:' + clr + '18;color:' + clr + ';">' +
              esc(key.replace(/_/g, " ")) + '</span>' +
          '</span>' +
          '<strong style="color:' + clr + ';">' + typeCount[key] + '</strong>' +
          '</div>';
      }
      rightHtml += '</div>';
    }

    // Analysis depth badge
    rightHtml += '<div class="side-card" style="text-align:center;border-color:rgba(129,140,248,.15);">';
    if (isDeep) {
      rightHtml += '<span class="badge" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-size:10px;letter-spacing:.5px;padding:5px 14px;">DEEP ANALYSIS</span>';
      rightHtml += '<div style="font-size:10px;color:var(--text-faint);margin-top:8px;">Full comprehensive scan complete</div>';
    } else {
      rightHtml += '<span class="badge" style="background:rgba(255,255,255,.06);color:var(--text-faint);font-size:10px;">QUICK ANALYSIS</span>';
      rightHtml += '<div style="font-size:10px;color:var(--text-faint);margin-top:8px;">Deep analysis loading below\u2026</div>';
    }
    rightHtml += '</div>';

    rightPanel.innerHTML = rightHtml;
  }

  // ---- Claim card renderer ----
  function renderClaim(c) {
    var typeColors = { verified: "var(--green)", neutral: "var(--text-faint)", contentious: "var(--yellow)", misleading: "var(--red)", unsupported: "var(--red)", opinion_as_fact: "var(--yellow)", omission: "var(--blue)" };
    var tc = typeColors[c.type] || "var(--text-faint)";
    var cardClass = c.type === "verified" ? "verified" : c.type === "neutral" ? "neutral" : (c.severity || "low");
    var typeLabel = (c.type === "verified" ? "\u2713 " : "") + (c.type || "").replace(/_/g, " ");

    var h = '<div class="claim-card ' + cardClass + '">';
    h += '<div class="claim-sentence">\u201C' + esc(c.sentence || "") + '\u201D</div>';

    h += '<div class="claim-meta" style="margin-bottom:8px;">';
    h += '<span class="badge" style="background:' + tc + '15;color:' + tc + ';">' + esc(typeLabel) + '</span>';
    h += '<span class="badge" style="background:rgba(255,255,255,.04);color:var(--text-faint);">' + esc((c.severity || "").charAt(0).toUpperCase() + (c.severity || "").slice(1)) + '</span>';
    if (typeof c.checkWorthiness === "number") {
      var cwc = c.checkWorthiness > 70 ? "var(--red)" : c.checkWorthiness > 40 ? "var(--yellow)" : "var(--green)";
      h += '<span style="font-size:11px;color:' + cwc + ';margin-left:auto;">Check-worthiness: ' + c.checkWorthiness + '</span>';
    }
    h += '</div>';

    h += '<div class="claim-explanation">' + esc(c.explanation || "") + '</div>';

    // Sources (deep only)
    var sources = c.sources || [];
    if (sources.length) {
      h += '<div style="margin-bottom:8px;">';
      for (var si = 0; si < sources.length; si++) {
        h += '<div class="source-item"><span style="color:' + tc + ';">\u25AA</span><strong>' + esc(sources[si].name || "") + '</strong>' +
          (sources[si].detail ? '<span> \u2014 ' + esc(sources[si].detail) + '</span>' : '') + '</div>';
      }
      h += '</div>';
    }

    // Data points (deep only)
    var dp = c.dataPoints || [];
    if (dp.length) {
      h += '<div style="margin-bottom:8px;">';
      for (var di = 0; di < dp.length; di++) h += '<span class="data-chip">' + esc(dp[di]) + '</span>';
      h += '</div>';
    }

    // Information gaps (deep only)
    var gaps = c.informationGaps || [];
    for (var gi = 0; gi < gaps.length; gi++) h += '<div class="gap-item">\u26A0 ' + esc(gaps[gi]) + '</div>';

    // Alt perspectives (deep only)
    if (c.alternativePerspectives) {
      h += '<div style="margin-top:8px;padding:8px 12px;border-radius:6px;border-left:2px solid var(--text-faint);background:rgba(255,255,255,.02);font-size:12px;color:var(--text-muted);line-height:1.5;">' +
        '<strong style="color:var(--text-faint);font-size:10px;text-transform:uppercase;letter-spacing:.5px;">Other Perspectives: </strong>' +
        esc(c.alternativePerspectives) + '</div>';
    }

    h += '</div>';
    return h;
  }

  // ---- RESEARCH FOUNDATIONS (loads last, after deep analysis) ----
  var RESEARCH_CITATIONS = [
    { feature: "Intent Classification", papers: [
      { authors: "Da San Martino et al.", year: 2019, title: "Fine-Grained Analysis of Propaganda in News Articles", venue: "EMNLP" },
      { authors: "Jowett & O\u2019Donnell", year: 2018, title: "Propaganda & Persuasion", venue: "7th ed., SAGE" },
    ]},
    { feature: "Lean Scoring", papers: [
      { authors: "Budak, Goel & Rao", year: 2016, title: "Fair and Balanced? Quantifying Media Bias through Crowdsourced Content Analysis", venue: "Public Opinion Quarterly" },
      { authors: "Baly et al.", year: 2018, title: "Predicting Factuality of Reporting and Bias of News Media Sources", venue: "EMNLP" },
    ]},
    { feature: "Polarization Analysis", papers: [
      { authors: "Prior", year: 2013, title: "Media and Political Polarization", venue: "Annual Review of Political Science" },
      { authors: "Iyengar & Hahn", year: 2009, title: "Red Media, Blue Media: Evidence of Ideological Selectivity in Media Use", venue: "Journal of Communication" },
    ]},
    { feature: "Check-Worthiness", papers: [
      { authors: "Hassan et al.", year: 2017, title: "ClaimBuster: The First-ever End-to-end Fact-checking System", venue: "VLDB" },
      { authors: "Atanasova et al.", year: 2019, title: "Automatic Fact-Checking Using Context and Discourse Information", venue: "ACL" },
    ]},
    { feature: "Information Gaps", papers: [
      { authors: "Entman", year: 1993, title: "Framing: Toward Clarification of a Fractured Paradigm", venue: "Journal of Communication" },
      { authors: "McCombs & Shaw", year: 1972, title: "The Agenda-Setting Function of Mass Media", venue: "Public Opinion Quarterly" },
    ]},
    { feature: "Evidence Chains", papers: [
      { authors: "Thorne et al.", year: 2018, title: "FEVER: a Large-scale Dataset for Fact Extraction and VERification", venue: "NAACL" },
      { authors: "Vlachos & Riedel", year: 2014, title: "Fact Checking: Task Formulation, Dataset Construction and Evaluation", venue: "ACL Workshop" },
    ]},
    { feature: "Soft Bias Detection", papers: [
      { authors: "Recasens, Danescu-Niculescu-Mizil & Jurafsky", year: 2013, title: "Linguistic Models for Analyzing and Detecting Biased Language", venue: "ACL" },
      { authors: "Hube & Fetahu", year: 2018, title: "Detecting Biased Statements in Wikipedia", venue: "WWW" },
    ]},
    { feature: "Unverbalized Biases", papers: [
      { authors: "van Dijk", year: 1993, title: "Principles of Critical Discourse Analysis", venue: "Discourse & Society" },
      { authors: "Fairclough", year: 1995, title: "Critical Discourse Analysis: The Critical Study of Language", venue: "Longman" },
    ]},
    { feature: "Image Context Analysis", papers: [
      { authors: "Peng", year: 2018, title: "Same Headlines, Different Perspectives: A Visual Framing Study", venue: "International Journal of Communication" },
      { authors: "Powell et al.", year: 2015, title: "Framing Analysis of Media Coverage of Natural Disasters", venue: "Environmental Communication" },
    ]},
    { feature: "Source Profiling", papers: [
      { authors: "Herman & Chomsky", year: 1988, title: "Manufacturing Consent: The Political Economy of the Mass Media", venue: "Pantheon" },
      { authors: "Baly et al.", year: 2020, title: "We Can Detect Your Bias: Predicting the Political Ideology of News Articles", venue: "EMNLP" },
    ]},
  ];

  function renderCitations() {
    var results = document.getElementById("results");
    if (!results) return;

    var h = '<div class="citations-section">';
    h += '<div class="citations-header">Research Foundations</div>';
    h += '<div class="citations-sub">Academic papers underpinning Spectrum\u2019s 10 analysis features \u2014 20 foundational works in media studies, computational journalism, and critical discourse analysis.</div>';

    for (var i = 0; i < RESEARCH_CITATIONS.length; i++) {
      var group = RESEARCH_CITATIONS[i];
      h += '<div class="citation-group">';
      h += '<div class="citation-feature"><span class="cit-num">' + (i + 1) + '</span>' + esc(group.feature) + '</div>';
      for (var p = 0; p < group.papers.length; p++) {
        var paper = group.papers[p];
        h += '<div class="citation-paper">' +
          esc(paper.authors) + ' (' + paper.year + '). \u201C' + esc(paper.title) + '.\u201D <span class="venue">' + esc(paper.venue) + '.</span>' +
          '</div>';
      }
      h += '</div>';
    }

    h += '<div class="citations-footer">' +
      '<span>Explore more at</span>' +
      '<a href="https://spectrum-research.web.app" target="_blank" rel="noopener">spectrum-research.web.app \u2192</a>' +
      '</div>';
    h += '</div>';

    results.insertAdjacentHTML("beforeend", h);
  }

  function esc(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
