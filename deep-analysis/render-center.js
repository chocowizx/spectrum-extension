(function () {
  window.DA = window.DA || {};

  function renderClaim(c) {
    var esc = DA.esc;
    var typeColors = { verified: "var(--green)", neutral: "var(--text-faint)", contentious: "var(--yellow)", misleading: "var(--red)", unsupported: "var(--red)", opinion_as_fact: "var(--yellow)", omission: "var(--blue)" };
    var tc = typeColors[c.type] || "var(--text-faint)";
    var cardClass = c.type === "verified" ? "verified" : c.type === "neutral" ? "neutral" : (c.severity || "low");
    var typeLabel = (c.type === "verified" ? "\u2713 " : "") + (typeof L === "function" ? L("claimType_" + (c.type || "neutral")) : (c.type || "").replace(/_/g, " "));

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

    html += '<button class="back-btn"><span>\u2190</span> ' + (typeof L === "function" ? L("btn_close") : "Close") + '</button>';

    // Header
    var leanLabel = a.overallLean || "Unknown";
    var _L = typeof L === "function" ? L : function (k) { return k; };
    var depthBadge = isDeep
      ? '<span class="badge" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;font-size:9px;letter-spacing:.5px;">' + _L("badge_deep") + '</span>'
      : '<span class="badge" style="background:rgba(255,255,255,.06);color:var(--text-faint);font-size:9px;letter-spacing:.5px;">' + _L("badge_quickDeep") + '</span>';
    html +=
      '<div class="result-header">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
          '<div class="result-title" style="margin-bottom:0;">' + esc(articleData.articleTitle || "Article Analysis") + '</div>' +
        '</div>' +
        '<div class="result-meta">' +
          depthBadge +
          '<span>' + _L("meta_source") + esc(articleData.sourceDomain || "Unknown") + '</span>' +
          '<span>\u00B7</span>' +
          '<span>' + _L("meta_lean") + esc(leanLabel) + '</span>' +
          (a.confidence ? '<span>\u00B7</span><span>' + _L("meta_confidence") + Math.round(a.confidence * 100) + '%</span>' : '') +
          // Language indicator
          (a.detectedLanguage && a.detectedLanguage !== "en" ? (function () {
            var langFlags = { ko: "\uD83C\uDDF0\uD83C\uDDF7 Korean", es: "\uD83C\uDDEA\uD83C\uDDF8 Spanish", fr: "\uD83C\uDDEB\uD83C\uDDF7 French", de: "\uD83C\uDDE9\uD83C\uDDEA German", zh: "\uD83C\uDDE8\uD83C\uDDF3 Chinese", ja: "\uD83C\uDDEF\uD83C\uDDF5 Japanese", ar: "\uD83C\uDDF8\uD83C\uDDE6 Arabic" };
            var langLabel = langFlags[a.detectedLanguage] || a.detectedLanguage.toUpperCase();
            return '<span>\u00B7</span><span class="badge" style="background:rgba(99,102,241,.12);color:#818CF8;font-size:10px;">' + esc(langLabel) + '</span>';
          })() : '') +
        '</div>' +
      '</div>';

    // ---- VERDICT ----
    var vIntent = (a.intentClassification || {}).type || a.intentType || "";
    var vQuality = 100;
    var vHasData = false;
    var vFlags = [];
    var vStrengths = [];

    if (typeof a.spinScore === "number") {
      vHasData = true;
      vQuality -= a.spinScore * 0.25;
      if (a.spinScore > 60) vFlags.push("High spin");
      else if (a.spinScore <= 20) vStrengths.push("Low spin");
    }

    if (vIntent) {
      vHasData = true;
      var vIntentPen = { informative: 0, advocacy: 5, persuasion: 20, manipulation: 35 };
      vQuality -= vIntentPen[vIntent] || 0;
      if (vIntent === "manipulation") vFlags.push("Manipulative");
      else if (vIntent === "persuasion") vFlags.push("Persuasive framing");
      else if (vIntent === "informative") vStrengths.push("Informative");
    }

    if (typeof a.polarizationIntensity === "number") {
      vQuality -= a.polarizationIntensity * 0.15;
      if (a.polarizationIntensity > 60) vFlags.push("Polarizing");
      else if (a.polarizationIntensity <= 20) vStrengths.push("Non-polarizing");
    }

    var vPd = a.perspectiveDiversity;
    if (vPd && typeof vPd.score === "number") {
      vQuality -= (100 - vPd.score) * 0.1;
      if (vPd.score < 30) vFlags.push("Narrow perspective");
      else if (vPd.score >= 70) vStrengths.push("Diverse sources");
    }

    var vOm = a.omissionAnalysis;
    if (vOm && typeof vOm.score === "number") {
      vQuality -= vOm.score * 0.1;
      if (vOm.score > 60) vFlags.push("Notable omissions");
    }

    // Lean pills (context only, not scored — lean isn't inherently bad journalism)
    if (typeof a.leanScore === "number") {
      if (Math.abs(a.leanScore) > 0.6) vFlags.push("Strong lean");
      else if (Math.abs(a.leanScore) < 0.15) vStrengths.push("Balanced framing");
    }

    vQuality = Math.max(0, Math.min(100, Math.round(vQuality)));

    if (!isDeep) {
      // Loading state: scanning animation while deep analysis runs
      html +=
        '<style>' +
          '@keyframes spectrum-scan{0%{left:0%}50%{left:calc(100% - 18px)}100%{left:0%}}' +
          '@keyframes spectrum-pulse{0%,100%{opacity:.4}50%{opacity:1}}' +
        '</style>' +
        '<div style="margin-bottom:20px;padding:20px 24px;border-radius:10px;background:var(--surface2);border-top:3px solid var(--text-faint);">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
            '<div style="font-size:20px;font-weight:700;color:var(--text-faint);animation:spectrum-pulse 2s ease infinite;">' + _L("status_evaluating") + '</div>' +
            '<div style="font-size:11px;color:var(--text-faint);">' + _L("status_deepInProgress") + '</div>' +
          '</div>' +
          '<div style="position:relative;height:10px;border-radius:5px;margin-bottom:10px;' +
            'background:linear-gradient(to right,#60A5FA,#94A3B8 50%,#F87171);">' +
            '<div style="position:absolute;bottom:-4px;left:0;width:18px;height:18px;' +
              'border-radius:50%;background:white;border:2.5px solid var(--text-faint);' +
              'box-shadow:0 1px 6px rgba(0,0,0,.3);animation:spectrum-scan 3s ease-in-out infinite;"></div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-faint);">' +
            '<span>\uD83D\uDD35 ' + _L("scale_poor") + '</span><span>' + _L("scale_mixed") + '</span><span>' + _L("scale_solid") + ' \uD83D\uDD34</span>' +
          '</div>' +
        '</div>';
    } else if (vHasData) {
      var vLabel, vColor;
      if (vQuality >= 80) { vLabel = _L("quality_solid"); vColor = "#4ADE80"; }
      else if (vQuality >= 60) { vLabel = _L("quality_fair"); vColor = "#60A5FA"; }
      else if (vQuality >= 40) { vLabel = _L("quality_mixed"); vColor = "#FBBF24"; }
      else if (vQuality >= 20) { vLabel = _L("quality_questionable"); vColor = "#F87171"; }
      else { vLabel = _L("quality_poor"); vColor = "#F87171"; }

      // Blue pills (flags/ignorance) on the left, Red pills (strengths/truth) on the right
      var vBlueOnBar = '';
      for (var vj = 0; vj < vFlags.length; vj++) {
        var bp = 5 + (vj * 30 / Math.max(vFlags.length, 1));
        vBlueOnBar += '<span style="position:absolute;bottom:calc(100% + 5px);left:' + bp + '%;transform:translateX(-50%);' +
          'padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap;' +
          'background:rgba(96,165,250,.15);color:#60A5FA;border:1px solid rgba(96,165,250,.2);">' +
          esc(vFlags[vj]) + '</span>';
      }
      var vRedOnBar = '';
      for (var vi = 0; vi < vStrengths.length; vi++) {
        var rp = 100 - 5 - (vi * 30 / Math.max(vStrengths.length, 1));
        vRedOnBar += '<span style="position:absolute;bottom:calc(100% + 5px);left:' + rp + '%;transform:translateX(-50%);' +
          'padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;white-space:nowrap;' +
          'background:rgba(248,113,113,.15);color:#F87171;border:1px solid rgba(248,113,113,.2);">' +
          esc(vStrengths[vi]) + '</span>';
      }

      var vPillTopPad = Math.max(vFlags.length, vStrengths.length) > 0 ? 30 : 0;

      html +=
        '<div style="margin-bottom:20px;padding:20px 24px;border-radius:10px;background:var(--surface2);border-top:3px solid ' + vColor + ';">' +
          // Label + score
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
            '<div style="font-size:20px;font-weight:700;color:' + vColor + ';">' + vLabel + '</div>' +
            '<div style="font-size:28px;font-weight:800;color:' + vColor + ';opacity:.6;">' + vQuality + '</div>' +
          '</div>' +
          // Spectrum bar with pills above: blue (bad) → red (good)
          '<div style="position:relative;margin-top:' + vPillTopPad + 'px;margin-bottom:10px;">' +
            vBlueOnBar + vRedOnBar +
            '<div style="height:10px;border-radius:5px;' +
              'background:linear-gradient(to right,#60A5FA,#94A3B8 50%,#F87171);">' +
            '</div>' +
            '<div style="position:absolute;bottom:-4px;left:calc(' + vQuality + '% - 9px);width:18px;height:18px;' +
              'border-radius:50%;background:' + vColor + ';border:2.5px solid white;' +
              'box-shadow:0 1px 4px rgba(0,0,0,.25);"></div>' +
          '</div>' +
          // Scale labels
          '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-faint);">' +
            '<span>\uD83D\uDD35 ' + _L("scale_poor") + '</span><span>' + _L("scale_mixed") + '</span><span>' + _L("scale_solid") + ' \uD83D\uDD34</span>' +
          '</div>' +
        '</div>';
    }

    // ---- OVERVIEW ----
    html += '<div class="section" id="sec-overview">';
    html += '<div class="section-label">' + _L("header_overview") + '</div>';

    // Lean score bar
    if (typeof a.leanScore === "number") {
      var barPct = ((a.leanScore + 1) / 2) * 100;
      html +=
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-faint);margin-bottom:6px;">' +
            '<span>' + _L("lean_scaleLeft") + '</span><span>' + _L("lean_scaleCenter") + '</span><span>' + _L("lean_scaleRight") + '</span>' +
          '</div>' +
          '<div class="lean-bar"><div class="lean-dot" style="left:' + barPct + '%;"></div></div>' +
          '<div style="text-align:center;margin-top:8px;font-size:13px;font-weight:600;color:var(--accent);">' +
            (a.leanScore > 0 ? "+" : "") + a.leanScore.toFixed(2) +
          '</div>' +
        '</div>';
    }

    // Spin score gauge (after lean bar)
    if (typeof a.spinScore === "number") {
      var spin = a.spinScore;
      var spinColor = spin > 70 ? "var(--red)" : spin > 45 ? "var(--yellow)" : spin > 20 ? "var(--blue)" : "var(--green)";
      var spinLabel = spin > 70 ? _L("spin_heavy") : spin > 45 ? _L("spin_notable") : spin > 20 ? _L("spin_mild") : _L("spin_minimal");
      html +=
        '<div style="margin-bottom:16px;">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:12px;color:var(--text-faint);">' + _L("metric_spin") + '</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + spinColor + ';">' + spinLabel + ' (' + spin + '/100)</span>' +
          '</div>' +
          '<div class="pol-track"><div class="pol-fill" style="width:' + spin + '%;background:' + spinColor + ';"></div></div>' +
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
            '<span style="font-size:12px;color:var(--text-faint);">' + _L("metric_intent") + '</span>' +
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
      var polLabel = pol > 75 ? _L("pol_extreme") : pol > 50 ? _L("pol_high") : pol > 20 ? _L("pol_moderate") : _L("pol_low");
      html +=
        '<div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:12px;color:var(--text-faint);">' + _L("metric_polarization") + '</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + polColor + ';">' + polLabel + ' (' + pol + '/100)</span>' +
          '</div>' +
          '<div class="pol-track"><div class="pol-fill" style="width:' + pol + '%;background:' + polColor + ';"></div></div>' +
          (a.polarizationDrivers && a.polarizationDrivers.length ?
            '<div style="margin-top:8px;">' + a.polarizationDrivers.map(function (d) {
              return '<div style="font-size:12px;color:var(--text-muted);padding-left:8px;border-left:2px solid ' + polColor + ';margin-bottom:4px;">' + esc(d) + '</div>';
            }).join('') + '</div>' : '') +
        '</div>';
    }

    // Perspective diversity meter (after polarization)
    var pd = a.perspectiveDiversity;
    if (pd && typeof pd.score === "number") {
      var pdScore = pd.score;
      var pdColor = pdScore >= 75 ? "var(--green)" : pdScore >= 50 ? "var(--blue)" : pdScore >= 25 ? "var(--yellow)" : "var(--red)";
      var pdLabel = pdScore >= 75 ? _L("diversity_comprehensive") : pdScore >= 50 ? _L("diversity_moderate") : pdScore >= 25 ? _L("diversity_limited") : _L("diversity_monoPerspective");
      html +=
        '<div style="margin-top:16px;">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:12px;color:var(--text-faint);">' + _L("metric_perspectiveDiversity") + '</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + pdColor + ';">' + pdLabel + ' (' + pdScore + '/100)</span>' +
          '</div>' +
          '<div class="pol-track"><div class="pol-fill" style="width:' + pdScore + '%;background:' + pdColor + ';"></div></div>';

      // Present perspectives pills
      var present = pd.presentPerspectives || [];
      var missing = pd.missingPerspectives || [];
      if (present.length || missing.length) {
        html += '<div style="margin-top:10px;">';
        for (var pi = 0; pi < present.length; pi++) {
          html += '<span class="perspective-pill present">' + esc(present[pi]) + '</span>';
        }
        for (var mi = 0; mi < missing.length; mi++) {
          html += '<span class="perspective-pill missing">' + esc(missing[mi]) + '</span>';
        }
        html += '</div>';
      }

      if (pd.dominantNarrative) {
        html += '<div style="margin-top:8px;font-size:12px;color:var(--text-faint);line-height:1.5;font-style:italic;">' + esc(pd.dominantNarrative) + '</div>';
      }

      html += '</div>';
    }

    if (a.sourceBias) {
      html += '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-faint);line-height:1.5;">' + esc(a.sourceBias) + '</div>';
    }
    html += '</div>';

    // ---- CLAIMS ----
    var claims = a.claims || [];
    if (claims.length > 0) {
      html += '<div class="section" id="sec-claims">';
      html += '<div class="section-label">' + _L("header_claims") + ' (' + claims.length + _L("counter_identified") + ')</div>';
      for (var ci = 0; ci < claims.length; ci++) {
        html += renderClaim(claims[ci]);
      }
      html += '</div>';
    }

    // ---- BIAS INDICATORS ----
    var indicators = a.biasIndicators || [];
    if (indicators.length > 0) {
      html += '<div class="section" id="sec-bias">';
      html += '<div class="section-label">' + _L("header_biasIndicators") + '</div>';
      for (var bi = 0; bi < indicators.length; bi++) {
        var b = indicators[bi];
        var btColors = { ideological: "rgba(168,85,247,", spin: "rgba(251,146,60,", framing: "rgba(96,165,250,", omission: "rgba(251,191,36," };
        var btColor = btColors[b.biasType] || "rgba(148,163,184,";
        var btBadge = b.biasType ? '<span class="bias-type-badge" style="background:' + btColor + '.12);color:' + btColor + '1);">' + esc(b.biasType) + '</span>' : '';
        html +=
          '<div style="margin-bottom:10px;padding:10px 14px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);">' +
            '<div style="font-weight:600;color:var(--text);margin-bottom:4px;text-transform:capitalize;font-size:13px;">' +
              btBadge + esc((b.pattern || "").replace(/_/g, " ")) + '</div>' +
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
        html += '<div class="section-label">' + _L("header_hiddenAssumptions") + '</div>';
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
        html += '<div class="section-label">' + _L("header_softBias") + '</div>';
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

      // Omission analysis section (deep only)
      var om = a.omissionAnalysis;
      if (om && typeof om.score === "number") {
        html += '<div class="section" id="sec-omission">';
        html += '<div class="section-label">' + _L("header_omission") + '</div>';

        var omScore = om.score;
        var omColor = omScore > 70 ? "var(--red)" : omScore > 45 ? "var(--yellow)" : omScore > 20 ? "var(--blue)" : "var(--green)";
        var omLabel = omScore > 70 ? _L("omission_critical") : omScore > 45 ? _L("omission_notable") : omScore > 20 ? _L("omission_minor") : _L("omission_minimal");
        html +=
          '<div style="margin-bottom:14px;">' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
              '<span style="font-size:12px;color:var(--text-faint);">' + _L("metric_omissionScore") + '</span>' +
              '<span style="font-size:13px;font-weight:600;color:' + omColor + ';">' + omLabel + ' (' + omScore + '/100)</span>' +
            '</div>' +
            '<div class="pol-track"><div class="pol-fill" style="width:' + omScore + '%;background:' + omColor + ';"></div></div>' +
          '</div>';

        var stakeholders = om.missingStakeholders || [];
        var context = om.missingContext || [];
        var counter = om.missingCounterEvidence || [];

        if (stakeholders.length || context.length || counter.length) {
          for (var sti = 0; sti < stakeholders.length; sti++) {
            html += '<div class="omission-item"><span class="omission-tag" style="background:rgba(168,85,247,.12);color:#A855F7;">' + _L("tag_stakeholder") + '</span>' + esc(stakeholders[sti]) + '</div>';
          }
          for (var cti = 0; cti < context.length; cti++) {
            html += '<div class="omission-item"><span class="omission-tag" style="background:rgba(96,165,250,.12);color:#60A5FA;">' + _L("tag_context") + '</span>' + esc(context[cti]) + '</div>';
          }
          for (var evi = 0; evi < counter.length; evi++) {
            html += '<div class="omission-item"><span class="omission-tag" style="background:rgba(251,191,36,.12);color:#FBBF24;">' + _L("tag_evidence") + '</span>' + esc(counter[evi]) + '</div>';
          }
        }

        html += '</div>';
      }

      // Image framing analysis (deep only)
      var imgFraming = a.imageFramingAnalysis || [];
      if (imgFraming.length > 0) {
        html += '<div class="section" id="sec-images">';
        html += '<div class="section-label">' + _L("header_imageFraming") + '</div>';
        var framingColors = { sympathetic: "#4ADE80", neutral: "#94A3B8", unsympathetic: "#FBBF24", heroic: "#60A5FA", villainizing: "#F87171" };
        for (var ifi = 0; ifi < imgFraming.length; ifi++) {
          var imgF = imgFraming[ifi];
          var ftColor = framingColors[imgF.framingType] || "var(--text-faint)";
          html +=
            '<div style="margin-bottom:10px;padding:10px 14px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);">' +
              '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
                '<span style="font-size:11px;color:var(--text-faint);">Image ' + (imgF.imageIndex + 1) + '</span>' +
                '<span class="badge" style="background:' + ftColor + '15;color:' + ftColor + ';">' + esc(imgF.framingType || "") + '</span>' +
                (imgF.emotionalTone ? '<span class="badge" style="background:rgba(255,255,255,.04);color:var(--text-faint);">' + esc(imgF.emotionalTone) + '</span>' : '') +
              '</div>' +
              (imgF.description ? '<div style="font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:4px;">' + esc(imgF.description) + '</div>' : '') +
              (imgF.biasIndicator ? '<div style="font-size:12px;color:var(--text-faint);padding-left:10px;border-left:2px solid ' + ftColor + ';font-style:italic;">' + esc(imgF.biasIndicator) + '</div>' : '') +
            '</div>';
        }
        html += '</div>';
      }

      // Video transcript analysis (deep only)
      var vta = a.videoTranscriptAnalysis;
      if (vta && vta.hasTranscript) {
        html += '<div class="section" id="sec-video">';
        html += '<div class="section-label">' + _L("header_videoTranscript") + '</div>';
        html +=
          '<div style="padding:10px 14px;border-radius:8px;border-left:3px solid #F59E0B;background:var(--surface2);">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
              '<span class="badge" style="background:rgba(245,158,11,.12);color:#F59E0B;">' + _L("tag_transcript") + '</span>' +
              (vta.transcriptLength ? '<span style="font-size:11px;color:var(--text-faint);">' + vta.transcriptLength + _L("counter_words") + '</span>' : '') +
            '</div>' +
            (vta.speakerBias ? '<div style="font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:6px;">' + esc(vta.speakerBias) + '</div>' : '') +
            (vta.editingCues ? '<div style="font-size:12px;color:var(--text-faint);line-height:1.5;font-style:italic;">' + esc(vta.editingCues) + '</div>' : '') +
          '</div>';
        html += '</div>';
      }
    }

    // ---- UPGRADE SECTIONS (research-backed modules) ----
    if (isDeep && DA.renderUpgradeSections) {
      html += DA.renderUpgradeSections(a, isDeep);
    }

    results.innerHTML = html;
    results.classList.add("visible");

    // ---- Populate side panels ----
    DA.renderSidePanels(a, isDeep);
  }

  DA.renderResults = renderResults;
})();
