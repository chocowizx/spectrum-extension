(function () {
  window.DA = window.DA || {};

  function renderClaim(c) {
    var esc = DA.esc;
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

  function renderResults(articleData, a, isDeep) {
    var esc = DA.esc;
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
    DA.renderSidePanels(a, isDeep);
  }

  DA.renderResults = renderResults;
})();
