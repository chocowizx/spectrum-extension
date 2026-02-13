(function () {
  window.DA = window.DA || {};

  function renderSidePanels(a, isDeep) {
    var esc = DA.esc;
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

  DA.renderSidePanels = renderSidePanels;
})();
