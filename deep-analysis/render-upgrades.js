// Spectrum — Upgrade section renderers for deep analysis page
// Each renderer maps an outputKey to an HTML rendering function

(function () {
  window.DA = window.DA || {};

  var _L = function (k) { return typeof L === "function" ? L(k) : k; };

  // Shared helpers
  function scoreBar(score, label, colorFn) {
    var color = colorFn(score);
    return '<div style="margin-bottom:14px;">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
        '<span style="font-size:12px;color:var(--text-faint);">' + label + '</span>' +
        '<span style="font-size:13px;font-weight:600;color:' + color + ';">' + score + '/100</span>' +
      '</div>' +
      '<div class="pol-track"><div class="pol-fill" style="width:' + score + '%;background:' + color + ';"></div></div>' +
    '</div>';
  }

  function defaultColor(score) {
    if (score > 70) return "var(--red)";
    if (score > 45) return "var(--yellow)";
    if (score > 20) return "var(--blue)";
    return "var(--green)";
  }

  function invertColor(score) {
    if (score >= 75) return "var(--green)";
    if (score >= 50) return "var(--blue)";
    if (score >= 25) return "var(--yellow)";
    return "var(--red)";
  }

  function badge(text, color) {
    return '<span class="badge" style="background:' + color + '15;color:' + color + ';">' + DA.esc(text) + '</span>';
  }

  function itemList(items, color) {
    if (!items || !items.length) return "";
    var h = "";
    for (var i = 0; i < items.length; i++) {
      h += '<div style="font-size:12px;color:var(--text-muted);padding-left:8px;border-left:2px solid ' + (color || "var(--accent)") + ';margin-bottom:4px;line-height:1.5;">' + DA.esc(items[i]) + '</div>';
    }
    return h;
  }

  // ============================================================
  // UPGRADE RENDERERS — one per outputKey
  // ============================================================

  var UPGRADE_RENDERERS = {
    // ---- Tier 1: Advanced Analysis ----
    anchorAuthority: function (data) {
      var h = scoreBar(data.authorityScore || 0, "Authority Score", defaultColor);
      if (data.credibilityBasis) h += '<div style="margin-bottom:8px;">' + badge(data.credibilityBasis, "var(--accent)") + '</div>';
      h += itemList(data.techniques, "var(--yellow)");
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    multimodalCoherence: function (data) {
      var h = scoreBar(data.coherenceScore || 0, "Coherence Score", invertColor);
      if (data.mismatches && data.mismatches.length) {
        for (var i = 0; i < data.mismatches.length; i++) {
          var m = data.mismatches[i];
          h += '<div style="padding:8px 12px;border-radius:6px;background:var(--surface2);margin-bottom:6px;font-size:12px;">' +
            badge(m.modalities || "", "var(--yellow)") +
            '<span style="color:var(--text-muted);margin-left:8px;">' + DA.esc(m.description || "") + '</span></div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    emotionalProsody: function (data) {
      var h = '';
      if (data.emotionalArc) h += '<div style="margin-bottom:8px;">' + badge(data.emotionalArc, "var(--accent)") + ' ' + badge(data.peakEmotion || "neutral", "var(--yellow)") + '</div>';
      if (data.emotionFactCorrelation) h += '<div style="font-size:12px;color:var(--text-faint);margin-bottom:8px;">Emotion-Fact Correlation: <strong style="color:var(--text);">' + DA.esc(data.emotionFactCorrelation) + '</strong></div>';
      h += itemList(data.manipulativePatterns, "var(--red)");
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    narrativePacing: function (data) {
      var h = '';
      if (data.pacingType) h += '<div style="margin-bottom:8px;">' + badge(data.pacingType.replace(/_/g, " "), "var(--accent)") + ' ' + badge("Density: " + (data.informationDensity || "?"), "var(--blue)") + '</div>';
      if (data.criticalEvalWindow) h += '<div style="font-size:12px;color:var(--text-faint);margin-bottom:8px;">Critical Eval Window: <strong style="color:' + (data.criticalEvalWindow === "absent" ? "var(--red)" : data.criticalEvalWindow === "compressed" ? "var(--yellow)" : "var(--green)") + ';">' + DA.esc(data.criticalEvalWindow) + '</strong></div>';
      h += itemList(data.buriedItems, "var(--yellow)");
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    visualFramingBias: function (data) {
      var h = scoreBar(data.framingScore || 0, "Visual Framing Score", defaultColor);
      if (data.visualTextAlignment) h += '<div style="margin-bottom:8px;">' + badge("Visual-Text: " + data.visualTextAlignment, data.visualTextAlignment === "contradicting" ? "var(--red)" : "var(--green)") + '</div>';
      if (data.techniques && data.techniques.length) {
        for (var i = 0; i < data.techniques.length; i++) {
          var t = data.techniques[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(t.type.replace(/_/g, " "), "var(--yellow)") +
            '<span style="color:var(--text-muted);margin-left:8px;">' + DA.esc(t.description || "") + '</span></div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    crossModalContradictions: function (data) {
      if (!Array.isArray(data) || !data.length) return '<div style="font-size:12px;color:var(--text-faint);">No cross-modal contradictions detected.</div>';
      var h = '';
      for (var i = 0; i < data.length; i++) {
        var c = data[i];
        var sevColor = c.severity === "high" ? "var(--red)" : c.severity === "medium" ? "var(--yellow)" : "var(--blue)";
        h += '<div class="bias-card">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
            badge(c.channel1 + " vs " + c.channel2, sevColor) +
            badge(c.severity || "low", sevColor) +
          '</div>' +
          '<div style="font-size:13px;color:var(--text);margin-bottom:4px;">' + DA.esc(c.contradiction || "") + '</div>' +
          (c.implication ? '<div style="font-size:12px;color:var(--text-faint);font-style:italic;">' + DA.esc(c.implication) + '</div>' : '') +
        '</div>';
      }
      return h;
    },

    sociolinguisticMarkers: function (data) {
      var h = '';
      if (data.registerLevel) h += badge(data.registerLevel, "var(--accent)") + ' ';
      if (data.jargonUsage) h += badge("Jargon: " + data.jargonUsage, data.jargonUsage === "obscuring" ? "var(--red)" : "var(--green)") + ' ';
      if (data.audienceTargeting) h += badge("Audience: " + data.audienceTargeting, "var(--blue)");
      h += '<div style="margin-top:10px;">';
      if (data.markers && data.markers.length) {
        for (var i = 0; i < data.markers.length; i++) {
          var m = data.markers[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(m.type.replace(/_/g, " "), "var(--yellow)") +
            (m.example ? '<span style="color:var(--text);font-style:italic;margin-left:8px;">&ldquo;' + DA.esc(m.example) + '&rdquo;</span>' : '') +
            (m.effect ? '<div style="color:var(--text-muted);margin-top:2px;">' + DA.esc(m.effect) + '</div>' : '') +
          '</div>';
        }
      }
      h += '</div>';
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    audienceManipulation: function (data) {
      var h = scoreBar(data.manipulationScore || 0, "Manipulation Score", defaultColor);
      if (typeof data.legitimateEmotion === "boolean") {
        h += '<div style="margin-bottom:8px;">' + badge(data.legitimateEmotion ? "Legitimate emotional content" : "Calculated manipulation", data.legitimateEmotion ? "var(--green)" : "var(--red)") + '</div>';
      }
      if (data.techniques && data.techniques.length) {
        for (var i = 0; i < data.techniques.length; i++) {
          var t = data.techniques[i];
          var tc = t.intensity === "high" ? "var(--red)" : t.intensity === "medium" ? "var(--yellow)" : "var(--blue)";
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(t.type.replace(/_/g, " "), tc) +
            (t.example ? '<span style="color:var(--text-muted);margin-left:8px;font-style:italic;">&ldquo;' + DA.esc(t.example) + '&rdquo;</span>' : '') +
          '</div>';
        }
      }
      if (data.outrageScore !== undefined) {
        h += scoreBar(data.outrageScore || 0, "Outrage Score", defaultColor);
        var subs = [
          { key: "emotionalHeat", label: "Emotional Heat" },
          { key: "moralOutrage", label: "Moral Outrage" },
          { key: "blackAndWhite", label: "Black & White" },
          { key: "fightPicking", label: "Fight-Picking" },
          { key: "usVsThem", label: "Us vs Them" },
        ];
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">';
        for (var j = 0; j < subs.length; j++) {
          var val = data[subs[j].key] || 0;
          var c = defaultColor(val);
          h += '<div style="padding:6px 8px;border-radius:6px;background:var(--surface2);font-size:11px;display:flex;justify-content:space-between;align-items:center;">';
          h += '<span style="color:var(--text-faint);">' + subs[j].label + '</span>';
          h += '<span style="font-weight:600;color:' + c + ';">' + val + '</span>';
          h += '</div>';
        }
        h += '</div>';
      }
      if (data.triggerPhrases && data.triggerPhrases.length) {
        h += '<div style="margin-top:6px;">';
        for (var k = 0; k < Math.min(data.triggerPhrases.length, 6); k++) {
          h += badge(data.triggerPhrases[k], 'var(--red)') + ' ';
        }
        h += '</div>';
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    geographicBias: function (data) {
      var h = '';
      if (data.ethnocentricPerspective) h += '<div style="margin-bottom:8px;">' + badge("Ethnocentrism: " + data.ethnocentricPerspective, data.ethnocentricPerspective === "strong" ? "var(--red)" : data.ethnocentricPerspective === "moderate" ? "var(--yellow)" : "var(--green)") + '</div>';
      if (data.patterns && data.patterns.length) {
        for (var i = 0; i < data.patterns.length; i++) {
          var p = data.patterns[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            '<strong style="color:var(--text);">' + DA.esc(p.location || "") + '</strong>' +
            badge(p.bias.replace(/_/g, " "), p.bias === "neutral" ? "var(--green)" : "var(--yellow)") +
            '<div style="color:var(--text-muted);margin-top:2px;">' + DA.esc(p.framing || "") + '</div>' +
          '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },


    expertCredibility: function (data) {
      var h = '';
      if (data.sourcingQuality) {
        var sqColor = data.sourcingQuality === "strong" ? "var(--green)" : data.sourcingQuality === "adequate" ? "var(--blue)" : data.sourcingQuality === "weak" ? "var(--yellow)" : "var(--red)";
        h += '<div style="margin-bottom:10px;">' + badge("Sourcing: " + data.sourcingQuality, sqColor) + (typeof data.expertCount === "number" ? ' <span style="font-size:12px;color:var(--text-faint);">' + data.expertCount + ' expert(s) cited</span>' : '') + '</div>';
      }
      if (data.experts && data.experts.length) {
        for (var i = 0; i < data.experts.length; i++) {
          var e = data.experts[i];
          var relColor = e.relevance === "high" ? "var(--green)" : e.relevance === "medium" ? "var(--blue)" : "var(--red)";
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            '<strong style="color:var(--text);">' + DA.esc(e.name || "Unnamed") + '</strong> ' +
            badge("Relevance: " + e.relevance, relColor) +
            (!e.disclosedAffiliation ? ' <span style="color:var(--yellow);font-size:11px;">Undisclosed affiliation</span>' : '') +
            (e.potentialConflict && e.potentialConflict !== "none" ? ' <span style="color:var(--red);font-size:11px;">Potential conflict</span>' : '') +
          '</div>';
        }
      }
      if (data.balanceAssessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.balanceAssessment) + '</div>';
      return h;
    },

    temporalFraming: function (data) {
      var h = '';
      if (data.urgencyLevel) {
        var uColor = data.urgencyLevel === "manufactured" ? "var(--red)" : data.urgencyLevel === "inflated" ? "var(--yellow)" : "var(--green)";
        h += badge("Urgency: " + data.urgencyLevel, uColor) + ' ';
      }
      if (data.historicalContext) h += badge("History: " + data.historicalContext, data.historicalContext === "missing" ? "var(--red)" : data.historicalContext === "selective" ? "var(--yellow)" : "var(--green)") + ' ';
      if (data.recencyBias) h += badge("Recency bias detected", "var(--yellow)");
      h += '<div style="margin-top:10px;">';
      if (data.patterns && data.patterns.length) {
        for (var i = 0; i < data.patterns.length; i++) {
          var p = data.patterns[i];
          h += '<div style="font-size:12px;color:var(--text-muted);padding-left:8px;border-left:2px solid var(--yellow);margin-bottom:4px;line-height:1.5;">' +
            '<strong>' + DA.esc(p.type.replace(/_/g, " ")) + ':</strong> ' + DA.esc(p.description || "") + '</div>';
        }
      }
      h += '</div>';
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    // ---- Tier 2: Video Analysis ----
    thumbnailBias: function (data) {
      var h = scoreBar(data.clickbaitScore || 0, "Clickbait Score", defaultColor);
      if (data.patterns && data.patterns.length) {
        h += '<div style="margin-bottom:8px;">';
        for (var i = 0; i < data.patterns.length; i++) {
          h += badge(data.patterns[i].replace(/_/g, " "), "var(--yellow)") + ' ';
        }
        h += '</div>';
      }
      if (data.textOverlayAccuracy) h += '<div style="margin-bottom:8px;">' + badge("Text overlay: " + data.textOverlayAccuracy, data.textOverlayAccuracy === "accurate" ? "var(--green)" : "var(--red)") + '</div>';
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    speakerSelectionBias: function (data) {
      var h = scoreBar(data.balanceScore || 0, "Speaker Balance", invertColor);
      if (data.speakers && data.speakers.length) {
        for (var i = 0; i < data.speakers.length; i++) {
          var s = data.speakers[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(s.role, "var(--accent)") +
            badge(s.prominenceLevel, s.prominenceLevel === "high" ? "var(--green)" : "var(--text-faint)") +
            '<span style="color:var(--text-muted);margin-left:8px;">' + DA.esc(s.perspective || "") + '</span>' +
          '</div>';
        }
      }
      h += itemList(data.missingVoices, "var(--red)");
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    brollInfluence: function (data) {
      var h = scoreBar(data.influenceScore || 0, "B-Roll Influence", defaultColor);
      if (data.techniques && data.techniques.length) {
        for (var i = 0; i < data.techniques.length; i++) {
          var t = data.techniques[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(t.alignment, t.alignment === "contradicting" ? "var(--red)" : t.alignment === "amplifying" ? "var(--yellow)" : "var(--green)") +
            '<div style="color:var(--text);margin-top:2px;">' + DA.esc(t.footage || "") + '</div>' +
            '<div style="color:var(--text-muted);font-style:italic;">' + DA.esc(t.narrative || "") + '</div>' +
          '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    productionBias: function (data) {
      var h = scoreBar(data.productionScore || 0, "Production Bias", defaultColor);
      if (data.elements && data.elements.length) {
        for (var i = 0; i < data.elements.length; i++) {
          var e = data.elements[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(e.type.replace(/_/g, " "), "var(--accent)") +
            '<div style="color:var(--text-muted);margin-top:2px;">' + DA.esc(e.description || "") + '</div>' +
            (e.biasDirection ? '<div style="color:var(--yellow);font-style:italic;font-size:11px;margin-top:2px;">' + DA.esc(e.biasDirection) + '</div>' : '') +
          '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    deepfakeWarning: function (data) {
      var riskColors = { none: "var(--green)", low: "var(--blue)", medium: "var(--yellow)", high: "var(--red)" };
      var rc = riskColors[data.riskLevel] || "var(--text-faint)";
      var h = '<div style="margin-bottom:10px;">' + badge("Risk: " + (data.riskLevel || "unknown"), rc) + '</div>';
      h += itemList(data.indicators, rc);
      if (data.editingConcerns && data.editingConcerns.length) {
        h += '<div style="margin-top:8px;">';
        for (var i = 0; i < data.editingConcerns.length; i++) {
          h += badge(data.editingConcerns[i].replace(/_/g, " "), "var(--yellow)") + ' ';
        }
        h += '</div>';
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    // ---- Tier 3: Prosodic Analysis ----
    vocalStress: function (data) {
      var h = '';
      if (data.overallIntensity) h += '<div style="margin-bottom:10px;">' + badge("Intensity: " + data.overallIntensity, data.overallIntensity === "extreme" ? "var(--red)" : data.overallIntensity === "intense" ? "var(--yellow)" : "var(--green)") + '</div>';
      if (data.emphasisPatterns && data.emphasisPatterns.length) {
        for (var i = 0; i < data.emphasisPatterns.length; i++) {
          var p = data.emphasisPatterns[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(p.technique.replace(/_/g, " "), "var(--accent)") +
            badge("Persuasive: " + p.persuasiveIntent, p.persuasiveIntent === "high" ? "var(--red)" : "var(--text-faint)") +
            (p.text ? '<div style="color:var(--text);font-style:italic;margin-top:4px;">&ldquo;' + DA.esc(p.text) + '&rdquo;</div>' : '') +
          '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    intonationCredibility: function (data) {
      var h = '';
      if (data.certaintyLevel) h += '<div style="margin-bottom:10px;">' + badge("Certainty: " + data.certaintyLevel, data.certaintyLevel === "definitive" || data.certaintyLevel === "confident" ? "var(--blue)" : "var(--yellow)") + '</div>';
      if (data.hedgingPatterns && data.hedgingPatterns.length) {
        h += '<div style="margin-bottom:8px;"><span style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;">Hedging:</span></div>';
        for (var i = 0; i < data.hedgingPatterns.length; i++) {
          h += '<div style="font-size:12px;color:var(--text-muted);padding-left:8px;border-left:2px solid var(--blue);margin-bottom:4px;font-style:italic;">&ldquo;' + DA.esc(data.hedgingPatterns[i]) + '&rdquo;</div>';
        }
      }
      if (data.overconfidenceFlags && data.overconfidenceFlags.length) {
        h += '<div style="margin-top:8px;margin-bottom:8px;"><span style="font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.5px;">Overconfidence:</span></div>';
        h += itemList(data.overconfidenceFlags, "var(--red)");
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    codeSwitching: function (data) {
      var h = '';
      if (data.dominantRegister) h += '<div style="margin-bottom:10px;">' + badge("Register: " + data.dominantRegister, "var(--accent)") + (typeof data.switchCount === "number" ? ' <span style="font-size:12px;color:var(--text-faint);">' + data.switchCount + ' switch(es)</span>' : '') + '</div>';
      if (data.switches && data.switches.length) {
        for (var i = 0; i < data.switches.length; i++) {
          var s = data.switches[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            '<span style="color:var(--text-faint);">' + DA.esc(s.from || "") + '</span>' +
            ' <span style="color:var(--accent);">&rarr;</span> ' +
            '<span style="color:var(--text);">' + DA.esc(s.to || "") + '</span> ' +
            badge(s.purpose.replace(/_/g, " "), "var(--yellow)") +
            (s.context ? '<div style="color:var(--text-muted);margin-top:2px;font-style:italic;">' + DA.esc(s.context) + '</div>' : '') +
          '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    paralinguisticCues: function (data) {
      var h = '';
      if (data.overallPersuasionDensity) h += '<div style="margin-bottom:10px;">' + badge("Persuasion density: " + data.overallPersuasionDensity, data.overallPersuasionDensity === "high" ? "var(--red)" : data.overallPersuasionDensity === "medium" ? "var(--yellow)" : "var(--green)") + '</div>';
      if (data.assertionMarkers && data.assertionMarkers.length) {
        for (var i = 0; i < data.assertionMarkers.length; i++) {
          var m = data.assertionMarkers[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            '<span style="color:var(--text);font-weight:600;">&ldquo;' + DA.esc(m.phrase) + '&rdquo;</span>' +
            (m.frequency ? ' <span style="color:var(--text-faint);">x' + m.frequency + '</span>' : '') +
            ' ' + badge(m.persuasiveFunction.replace(/_/g, " "), "var(--yellow)") +
          '</div>';
        }
      }
      if (data.rhetoricalDevices && data.rhetoricalDevices.length) {
        h += '<div style="margin-top:8px;">';
        for (var i = 0; i < data.rhetoricalDevices.length; i++) {
          var d = data.rhetoricalDevices[i];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">' +
            badge(d.type.replace(/_/g, " "), "var(--accent)") +
            (d.example ? '<span style="color:var(--text-muted);margin-left:8px;font-style:italic;">&ldquo;' + DA.esc(d.example) + '&rdquo;</span>' : '') +
          '</div>';
        }
        h += '</div>';
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    // ---- Tier 4: Core Analysis Enhancements ----
    sentenceBiasTagging: function (data) {
      var h = '';
      var total = data.totalSentences || 0;
      var biased = data.biasedCount || 0;
      if (total > 0) {
        var pct = Math.round((biased / total) * 100);
        h += '<div style="display:flex;gap:16px;margin-bottom:12px;">';
        h += '<div style="text-align:center;"><span style="font-size:20px;font-weight:700;color:' + defaultColor(pct) + ';">' + pct + '%</span><div style="font-size:10px;color:var(--text-faint);">biased</div></div>';
        h += '<div style="text-align:center;"><span style="font-size:20px;font-weight:700;color:var(--text);">' + total + '</span><div style="font-size:10px;color:var(--text-faint);">sentences</div></div>';
        h += '<div style="text-align:center;"><span style="font-size:20px;font-weight:700;color:var(--text);">' + biased + '</span><div style="font-size:10px;color:var(--text-faint);">flagged</div></div>';
        h += '</div>';
      }
      // Composition bar
      if (data.factPercent != null) {
        h += '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:10px;background:var(--surface2);">';
        h += '<div style="width:' + (data.factPercent || 0) + '%;background:var(--green);" title="Fact ' + (data.factPercent||0) + '%"></div>';
        h += '<div style="width:' + (data.opinionPercent || 0) + '%;background:var(--yellow);" title="Opinion ' + (data.opinionPercent||0) + '%"></div>';
        h += '</div>';
        h += '<div style="display:flex;gap:12px;font-size:10px;color:var(--text-faint);margin-bottom:10px;">';
        h += '<span>\u25CF Fact ' + (data.factPercent||0) + '%</span>';
        h += '<span style="color:var(--yellow);">\u25CF Opinion ' + (data.opinionPercent||0) + '%</span>';
        h += '</div>';
      }
      if (data.sentences && data.sentences.length) {
        for (var i = 0; i < Math.min(data.sentences.length, 15); i++) {
          var s = data.sentences[i];
          var clsColor = s.classification === "fact" ? "var(--green)" : s.classification === "quote" ? "var(--blue)" : s.classification === "opinion" ? "var(--yellow)" : "var(--accent)";
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;border-left:3px solid ' + clsColor + ';">';
          h += badge(s.classification, clsColor);
          if (s.biasStrength) h += ' ' + badge((s.biasStrength * 100).toFixed(0) + '%', defaultColor(s.biasStrength * 100));
          if (s.biasType && s.biasType !== 'none') h += ' ' + badge(s.biasType.replace(/_/g, ' '), 'var(--red)');
          h += '<div style="color:var(--text-muted);margin-top:4px;font-style:italic;line-height:1.4;">&ldquo;' + DA.esc(s.text.substring(0, 200)) + '&rdquo;</div>';
          h += '</div>';
        }
        if (data.sentences.length > 15) {
          h += '<div style="font-size:11px;color:var(--text-faint);text-align:center;margin-top:4px;">+ ' + (data.sentences.length - 15) + ' more sentences</div>';
        }
      }
      return h;
    },

    biasTaxonomy38: function (data) {
      var h = '';
      if (data.dominantFamily) {
        h += '<div style="margin-bottom:10px;">' + badge('Dominant: ' + data.dominantFamily.replace(/_/g, ' '), 'var(--accent)');
        if (data.totalTypes) h += ' <span style="font-size:11px;color:var(--text-faint);">' + data.totalTypes + ' types detected</span>';
        h += '</div>';
      }
      if (data.matches && data.matches.length) {
        var families = {};
        for (var i = 0; i < data.matches.length; i++) {
          var m = data.matches[i];
          if (!families[m.family]) families[m.family] = [];
          families[m.family].push(m);
        }
        for (var fam in families) {
          var famColor = fam === 'framing' ? 'var(--red)' : fam === 'dividing' ? '#F59E0B' : fam === 'personalizing' ? '#EC4899' : fam === 'misreasoning' ? '#F97316' : 'var(--accent)';
          h += '<div style="margin-bottom:10px;">';
          h += '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:' + famColor + ';margin-bottom:6px;">' + DA.esc(fam) + '</div>';
          for (var j = 0; j < families[fam].length; j++) {
            var item = families[fam][j];
            var sevColor = item.severity === 'high' ? 'var(--red)' : item.severity === 'medium' ? 'var(--yellow)' : 'var(--blue)';
            h += '<div style="padding:4px 10px;border-radius:6px;background:var(--surface2);margin-bottom:3px;font-size:12px;">';
            h += badge(item.type.replace(/_/g, ' '), famColor) + ' ' + badge(item.severity, sevColor);
            if (item.examples && item.examples.length) {
              h += '<div style="color:var(--text-muted);margin-top:3px;font-style:italic;">&ldquo;' + DA.esc(item.examples[0].substring(0, 150)) + '&rdquo;</div>';
            }
            h += '</div>';
          }
          h += '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    articleTypeClassification: function (data) {
      var h = '';
      var typeColors = { report: 'var(--green)', analysis: 'var(--blue)', opinion: 'var(--yellow)', editorial: '#F59E0B', satire: 'var(--accent)' };
      var color = typeColors[data.type] || 'var(--text)';
      h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">';
      h += '<span style="font-size:22px;font-weight:700;text-transform:uppercase;color:' + color + ';">' + DA.esc(data.type || '?') + '</span>';
      if (data.confidence) h += '<span style="font-size:13px;color:var(--text-faint);">' + Math.round(data.confidence * 100) + '% confidence</span>';
      h += '</div>';
      if (data.markers && data.markers.length) {
        h += itemList(data.markers, color);
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    headlineBodyConcordance: function (data) {
      var h = scoreBar(data.score || 0, "Concordance", invertColor);
      if (typeof data.dissonanceScore === "number") {
        h += scoreBar(data.dissonanceScore, "Dissonance Score", defaultColor);
      }
      if (data.isClickbait) {
        h += '<div style="padding:6px 10px;border-radius:6px;background:var(--red)15;color:var(--red);font-size:12px;font-weight:600;margin-bottom:10px;">\u26A0 Clickbait Detected</div>';
      }
      if (data.headlineTone || data.bodyTone) {
        h += '<div style="display:flex;gap:10px;margin-bottom:10px;">';
        h += '<div style="flex:1;padding:8px;border-radius:6px;background:var(--surface2);font-size:11px;"><span style="color:var(--text-faint);">Headline:</span> <span style="color:var(--text);">' + DA.esc(data.headlineTone || '—') + '</span></div>';
        h += '<div style="flex:1;padding:8px;border-radius:6px;background:var(--surface2);font-size:11px;"><span style="color:var(--text-faint);">Body:</span> <span style="color:var(--text);">' + DA.esc(data.bodyTone || '—') + '</span></div>';
        h += '</div>';
      }
      if (data.headlineImplication) {
        h += '<div style="padding:8px 12px;border-radius:6px;border-left:2px solid var(--yellow);background:rgba(255,255,255,.02);margin-bottom:8px;font-size:12px;">' +
          '<div style="font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Headline implies</div>' +
          '<div style="color:var(--text);">' + DA.esc(data.headlineImplication) + '</div>' +
        '</div>';
      }
      if (data.bodyReality) {
        h += '<div style="padding:8px 12px;border-radius:6px;border-left:2px solid var(--green);background:rgba(255,255,255,.02);margin-bottom:8px;font-size:12px;">' +
          '<div style="font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Content actually says</div>' +
          '<div style="color:var(--text);">' + DA.esc(data.bodyReality) + '</div>' +
        '</div>';
      }
      if (data.mismatchAreas && data.mismatchAreas.length) {
        h += itemList(data.mismatchAreas, 'var(--yellow)');
      }
      if (data.clickbaitPatterns && data.clickbaitPatterns.length) {
        h += itemList(data.clickbaitPatterns, "var(--red)");
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    opinionDensityMeter: function (data) {
      var h = '';
      // Stacked bar
      h += '<div style="display:flex;height:24px;border-radius:6px;overflow:hidden;margin-bottom:10px;">';
      h += '<div style="width:' + (data.factPercent || 0) + '%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600;">' + (data.factPercent > 8 ? data.factPercent + '%' : '') + '</div>';
      h += '<div style="width:' + (data.opinionPercent || 0) + '%;background:var(--yellow);display:flex;align-items:center;justify-content:center;font-size:10px;color:#000;font-weight:600;">' + (data.opinionPercent > 8 ? data.opinionPercent + '%' : '') + '</div>';
      h += '<div style="width:' + (data.quotePercent || 0) + '%;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600;">' + (data.quotePercent > 8 ? data.quotePercent + '%' : '') + '</div>';
      h += '<div style="width:' + (data.mixedPercent || 0) + '%;background:var(--text-faint);display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600;">' + (data.mixedPercent > 8 ? data.mixedPercent + '%' : '') + '</div>';
      h += '</div>';
      // Legend
      h += '<div style="display:flex;gap:12px;font-size:10px;margin-bottom:10px;">';
      h += '<span style="color:var(--green);">\u25CF Fact ' + (data.factPercent||0) + '%</span>';
      h += '<span style="color:var(--yellow);">\u25CF Opinion ' + (data.opinionPercent||0) + '%</span>';
      h += '<span style="color:var(--blue);">\u25CF Quote ' + (data.quotePercent||0) + '%</span>';
      h += '<span style="color:var(--text-faint);">\u25CF Mixed ' + (data.mixedPercent||0) + '%</span>';
      h += '</div>';
      if (data.matchesExpected === false) {
        h += '<div style="padding:6px 10px;border-radius:6px;background:var(--yellow)15;color:var(--yellow);font-size:12px;margin-bottom:8px;">\u26A0 Content type mismatch: appears to be ' + DA.esc(data.expectedType || '?') + ' but density suggests otherwise</div>';
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },


    omissionSubTyping: function (data) {
      var h = '';
      if (data.totalOmissions != null) {
        h += '<div style="margin-bottom:10px;">';
        h += '<span style="font-size:18px;font-weight:700;color:' + defaultColor(data.totalOmissions * 15) + ';">' + data.totalOmissions + '</span>';
        h += '<span style="font-size:12px;color:var(--text-faint);margin-left:6px;">omissions detected</span>';
        if (data.mostSignificant) h += ' ' + badge(data.mostSignificant.replace(/_/g, ' '), 'var(--red)');
        h += '</div>';
      }
      var catColors = { contextual: '#818CF8', complexity: '#A78BFA', comparative: '#F59E0B', impact: '#EF4444', accountability: '#EC4899', severity: '#F97316', stakeholder: '#06B6D4', political_context: '#8B5CF6' };
      if (data.omissions && data.omissions.length) {
        for (var i = 0; i < data.omissions.length; i++) {
          var o = data.omissions[i];
          var cc = catColors[o.category] || 'var(--accent)';
          var sevColor = o.significance === 'high' ? 'var(--red)' : o.significance === 'medium' ? 'var(--yellow)' : 'var(--blue)';
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;border-left:3px solid ' + cc + ';">';
          h += badge(o.category.replace(/_/g, ' '), cc) + ' ' + badge(o.significance, sevColor);
          h += '<div style="color:var(--text-muted);margin-top:3px;line-height:1.4;">' + DA.esc(o.description) + '</div>';
          h += '</div>';
        }
      }
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    multimodalFraming: function (data) {
      var h = '';
      // Overall consistency score
      var consScore = typeof data.visualTextConsistency === 'number' ? data.visualTextConsistency : -1;
      if (consScore >= 0) {
        var consColor = consScore >= 70 ? 'var(--green)' : consScore >= 40 ? 'var(--yellow)' : 'var(--red)';
        h += '<div style="margin-bottom:14px;">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
            '<span style="font-size:12px;color:var(--text-faint);">Visual-Text Consistency</span>' +
            '<span style="font-size:13px;font-weight:600;color:' + consColor + ';">' + consScore + '/100</span>' +
          '</div>' +
          '<div class="pol-track"><div class="pol-fill" style="width:' + consScore + '%;background:' + consColor + ';"></div></div>' +
        '</div>';
      }
      if (data.consistencyAssessment) {
        h += '<div style="font-size:12px;color:var(--text-muted);line-height:1.5;margin-bottom:12px;">' + DA.esc(data.consistencyAssessment) + '</div>';
      }
      // Per-image cards
      var images = data.images || [];
      var framingColors = { sympathetic: '#4ADE80', neutral: '#94A3B8', unsympathetic: '#FBBF24', heroic: '#60A5FA', villainizing: '#F87171' };
      for (var i = 0; i < images.length; i++) {
        var img = images[i];
        var ftColor = framingColors[img.framingType] || 'var(--text-faint)';
        h += '<div style="margin-bottom:10px;padding:10px 14px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);">';
        // Header row
        h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
          '<span style="font-size:11px;color:var(--text-faint);">Image ' + ((img.imageIndex != null ? img.imageIndex : i) + 1) + '</span>' +
          badge(img.framingType || 'unknown', ftColor) +
          (img.emotionalTone ? badge(img.emotionalTone, 'rgba(255,255,255,.08)') : '') +
        '</div>';
        // Warning flags
        if (img.delegitimizationFrame && img.delegitimizationFrame.detected) {
          h += '<div style="padding:5px 10px;border-radius:5px;background:rgba(239,68,68,.08);border-left:2px solid var(--red);margin-bottom:5px;font-size:12px;">' +
            '<span style="color:var(--red);font-weight:600;">Delegitimization</span>' +
            (img.delegitimizationFrame.explanation ? ' <span style="color:var(--text-muted);">' + DA.esc(img.delegitimizationFrame.explanation) + '</span>' : '') +
          '</div>';
        }
        if (img.emotionalManipulation && img.emotionalManipulation.detected) {
          h += '<div style="padding:5px 10px;border-radius:5px;background:rgba(245,158,11,.08);border-left:2px solid var(--yellow);margin-bottom:5px;font-size:12px;">' +
            '<span style="color:var(--yellow);font-weight:600;">Emotional Manipulation</span>' +
            (img.emotionalManipulation.explanation ? ' <span style="color:var(--text-muted);">' + DA.esc(img.emotionalManipulation.explanation) + '</span>' : '') +
          '</div>';
        }
        if (img.cropBias && img.cropBias.detected) {
          h += '<div style="padding:5px 10px;border-radius:5px;background:rgba(96,165,250,.08);border-left:2px solid var(--blue);margin-bottom:5px;font-size:12px;">' +
            '<span style="color:var(--blue);font-weight:600;">Crop Bias</span>' +
            (img.cropBias.explanation ? ' <span style="color:var(--text-muted);">' + DA.esc(img.cropBias.explanation) + '</span>' : '') +
          '</div>';
        }
        if (img.captionBias && img.captionBias.detected) {
          h += '<div style="padding:5px 10px;border-radius:5px;background:rgba(168,85,247,.08);border-left:2px solid var(--accent);margin-bottom:5px;font-size:12px;">' +
            '<span style="color:var(--accent);font-weight:600;">Caption Bias</span>' +
            (img.captionBias.explanation ? ' <span style="color:var(--text-muted);">' + DA.esc(img.captionBias.explanation) + '</span>' : '') +
          '</div>';
        }
        // Hero/villain framing
        var hv = img.heroVillainFraming;
        if (hv && (hv.hero !== 'none' || hv.villain !== 'none')) {
          h += '<div style="display:flex;gap:8px;margin-top:4px;">';
          if (hv.hero && hv.hero !== 'none') h += '<div style="flex:1;padding:4px 8px;border-radius:4px;background:rgba(74,222,128,.08);font-size:11px;"><span style="color:#4ADE80;font-weight:600;">Hero </span>' + DA.esc(hv.hero) + '</div>';
          if (hv.villain && hv.villain !== 'none') h += '<div style="flex:1;padding:4px 8px;border-radius:4px;background:rgba(248,113,113,.08);font-size:11px;"><span style="color:#F87171;font-weight:600;">Villain </span>' + DA.esc(hv.villain) + '</div>';
          h += '</div>';
        }
        h += '</div>';
      }
      return h || '<div style="font-size:12px;color:var(--text-faint);">No image analysis available.</div>';
    },

    persuasionAnalysis: function (data) {
      var h = '';
      // Intensity score bar
      if (typeof data.persuasionIntensity === 'number') {
        var pct = Math.round(data.persuasionIntensity);
        var intColor = pct >= 70 ? 'var(--red)' : pct >= 40 ? 'var(--yellow)' : 'var(--blue)';
        h += '<div style="margin-bottom:10px;">';
        h += '<div style="font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Persuasion Intensity</div>';
        h += '<div style="background:var(--surface2);border-radius:4px;height:6px;width:100%;margin-bottom:6px;">';
        h += '<div style="background:' + intColor + ';border-radius:4px;height:6px;width:' + Math.min(pct, 100) + '%;"></div></div>';
        h += '</div>';
      }
      // Propaganda density badge + technique count
      if (data.propagandaDensity) {
        var densColor = data.propagandaDensity === 'high' ? 'var(--red)' : data.propagandaDensity === 'medium' ? 'var(--yellow)' : data.propagandaDensity === 'low' ? 'var(--blue)' : 'var(--green)';
        h += '<div style="margin-bottom:10px;">' + badge('Density: ' + data.propagandaDensity, densColor);
        if (data.totalTechniques) h += ' <span style="font-size:11px;color:var(--text-faint);">' + data.totalTechniques + ' techniques found</span>';
        h += '</div>';
      }
      // Dominant strategy
      if (data.dominantStrategy && data.dominantStrategy !== 'none') {
        h += '<div style="margin-bottom:10px;">' + badge('Strategy: ' + data.dominantStrategy.replace(/_/g, ' '), 'var(--accent)') + '</div>';
      }
      // Technique cards
      if (data.persuasionTechniques && data.persuasionTechniques.length) {
        for (var i = 0; i < data.persuasionTechniques.length; i++) {
          var t = data.persuasionTechniques[i];
          var sevColor = t.severity === 'high' ? 'var(--red)' : t.severity === 'medium' ? 'var(--yellow)' : 'var(--blue)';
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;border-left:3px solid ' + sevColor + ';">';
          h += badge(t.technique.replace(/_/g, ' '), sevColor) + ' ' + badge(t.severity, sevColor);
          if (t.location) {
            h += '<div style="color:var(--text-muted);margin-top:3px;font-style:italic;">&ldquo;' + DA.esc(t.location.substring(0, 200)) + '&rdquo;</div>';
          }
          if (t.explanation) {
            h += '<div style="color:var(--text-faint);margin-top:2px;font-size:11px;line-height:1.4;">' + DA.esc(t.explanation) + '</div>';
          }
          if (t.targetAudience) {
            h += '<div style="color:var(--text-faint);margin-top:2px;font-size:11px;">Target: ' + DA.esc(t.targetAudience) + '</div>';
          }
          h += '</div>';
        }
      }
      return h;
    },

    // ---- Upgrade #8: Narrative Evolution (from article change context) ----
    narrativeEvolution: function (data) {
      var h = '';
      if (data.significanceOfChanges) {
        var sigColor = data.significanceOfChanges === 'high' ? 'var(--red)' :
                       data.significanceOfChanges === 'medium' ? 'var(--yellow)' : 'var(--blue)';
        h += '<div style="margin-bottom:10px;">' + badge('Change significance: ' + data.significanceOfChanges, sigColor) + '</div>';
      }
      if (data.possibleMotivation) {
        h += '<div style="padding:8px 12px;border-radius:6px;border-left:2px solid var(--yellow);background:rgba(255,255,255,.02);margin-bottom:8px;font-size:12px;">' +
          '<div style="font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Possible motivation</div>' +
          '<div style="color:var(--text);line-height:1.5;">' + DA.esc(data.possibleMotivation) + '</div>' +
        '</div>';
      }
      if (data.biasImplication) {
        var biasDir = data.biasImplication === 'increased' ? 'var(--red)' :
                      data.biasImplication === 'decreased' ? 'var(--green)' : 'var(--text-faint)';
        h += '<div style="margin-bottom:8px;">' + badge('Bias impact: ' + data.biasImplication, biasDir) + '</div>';
      }
      if (data.assessment) {
        h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      }
      return h;
    },

    sentimentAnalysis: function (data) {
      var deviationColors = {
        extreme: "#EF4444",
        notable: "#F59E0B",
        mild: "#60A5FA",
        typical: "#22C55E",
      };
      var h = '';

      // Score row: overall / headline / body
      h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px;">';
      var scores = [
        { label: "Overall", val: data.overallScore },
        { label: "Headline", val: data.headlineScore },
        { label: "Body", val: data.bodyScore },
      ];
      for (var si = 0; si < scores.length; si++) {
        var s = scores[si];
        var v = typeof s.val === "number" ? s.val : 0;
        var sc = v <= -0.6 ? "#EF4444" : v <= -0.2 ? "#F59E0B" : v >= 0.6 ? "#22C55E" : v >= 0.2 ? "#60A5FA" : "var(--text-faint)";
        h += '<div style="padding:6px 8px;border-radius:6px;background:var(--surface2);font-size:11px;text-align:center;">';
        h += '<div style="color:var(--text-faint);margin-bottom:2px;">' + DA.esc(s.label) + '</div>';
        h += '<div style="font-weight:700;font-size:13px;color:' + sc + ';">' + (v >= 0 ? "+" : "") + v.toFixed(2) + '</div>';
        h += '</div>';
      }
      h += '</div>';

      // Headline-body mismatch
      if (data.headlineBodyMismatch) {
        var msevColor = data.mismatchSeverity === "high" ? "#EF4444" : data.mismatchSeverity === "medium" ? "#F59E0B" : "#60A5FA";
        h += '<div style="margin-bottom:8px;">' + badge("Headline-Body Mismatch: " + (data.mismatchSeverity || "low"), msevColor) + '</div>';
      }

      // Outlet baseline deviation
      if (data.outletBaselineDeviation && data.outletBaselineDeviation !== "none") {
        var devColor = deviationColors[data.outletBaselineDeviation] || "var(--text-faint)";
        h += '<div style="margin-bottom:8px;">' + badge("Baseline Deviation: " + data.outletBaselineDeviation, devColor) + '</div>';
        if (data.outletBaselineNote) {
          h += '<div style="font-size:12px;color:var(--text-faint);margin-bottom:8px;padding-left:4px;">' + DA.esc(data.outletBaselineNote) + '</div>';
        }
      }

      // Emotional bias patterns
      if (data.emotionalBiasPatterns && data.emotionalBiasPatterns.length) {
        for (var ei = 0; ei < data.emotionalBiasPatterns.length; ei++) {
          var ep = data.emotionalBiasPatterns[ei];
          var epColor = ep.direction === "negative" ? "var(--red)" : ep.direction === "positive" ? "var(--green)" : "var(--yellow)";
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">';
          h += badge(ep.direction || "mixed", epColor);
          if (ep.target) h += ' <span style="color:var(--text-muted);">' + DA.esc(ep.target) + '</span>';
          if (ep.pattern) h += '<div style="color:var(--text-faint);margin-top:2px;">' + DA.esc(ep.pattern) + '</div>';
          h += '</div>';
        }
      }

      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';
      return h;
    },

    // ---- Upgrade #10: Fact-Check API Integration ----
    factCheckIntegration: function (data) {
      var VERDICTS = (typeof SPECTRUM !== "undefined" && SPECTRUM.FACTCHECK_VERDICTS) || {};
      var SOURCES = (typeof SPECTRUM !== "undefined" && SPECTRUM.FACTCHECK_SOURCES) || {};
      var h = '';

      // Summary header: claims checked + source list
      var summary = data.factCheckSummary;
      if (summary && summary.claimsChecked > 0) {
        h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">';
        h += badge(summary.claimsChecked + ' claim' + (summary.claimsChecked === 1 ? '' : 's') + ' checked', '#60A5FA');
        if (summary.totalFactChecks > 0) {
          h += badge(summary.totalFactChecks + ' result' + (summary.totalFactChecks === 1 ? '' : 's'), '#94A3B8');
        }
        h += '</div>';
        if (summary.sources && summary.sources.length > 0) {
          h += '<div style="margin-bottom:12px;font-size:11px;color:var(--text-faint);">Sources: ';
          for (var si = 0; si < summary.sources.length; si++) {
            var src = summary.sources[si];
            var srcInfo = SOURCES[src] || null;
            var srcColor = srcInfo ? srcInfo.color : '#94A3B8';
            if (si > 0) h += '<span style="margin:0 4px;opacity:.4;">·</span>';
            h += '<span style="color:' + srcColor + ';">' + DA.esc(src) + '</span>';
          }
          h += '</div>';
        }
      } else {
        h += '<div style="font-size:12px;color:var(--text-faint);margin-bottom:10px;">No claims met the threshold for external fact-checking.</div>';
      }

      // Per-claim fact-check results
      var claims = data.claims || [];
      var anyChecked = false;
      for (var ci = 0; ci < claims.length; ci++) {
        var claim = claims[ci];
        if (!claim.factChecks || claim.factChecks.length === 0) continue;
        anyChecked = true;

        // Claim sentence
        h += '<div style="margin-bottom:12px;padding:10px 12px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);">';
        h += '<div style="font-size:12px;color:var(--text);line-height:1.5;margin-bottom:8px;">' + DA.esc(claim.sentence || '') + '</div>';

        // Fact-check result rows
        for (var fi = 0; fi < claim.factChecks.length; fi++) {
          var fc = claim.factChecks[fi];
          var vkey = fc.rating || 'unverified';
          var vinfo = VERDICTS[vkey] || { label: fc.textualRating || 'Unverified', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' };
          var pubInfo = SOURCES[fc.publisher] || null;
          var pubColor = pubInfo ? pubInfo.color : '#94A3B8';

          h += '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;padding:6px 8px;border-radius:6px;background:' + vinfo.bg + ';">';

          // Verdict badge
          h += '<span style="flex-shrink:0;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:' + vinfo.color + '20;color:' + vinfo.color + ';">' + DA.esc(vinfo.label) + '</span>';

          // Publisher + link
          h += '<div style="flex:1;min-width:0;">';
          h += '<span style="font-size:11px;font-weight:600;color:' + pubColor + ';">' + DA.esc(fc.publisher) + '</span>';
          if (pubInfo && pubInfo.trust === 'high') {
            h += ' <span style="font-size:9px;color:#4ADE80;opacity:.7;">&#x2713; verified source</span>';
          }
          if (fc.title) {
            h += '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + DA.esc(fc.title) + '</div>';
          }
          if (fc.textualRating && fc.textualRating !== vinfo.label) {
            h += '<div style="font-size:10px;color:var(--text-faint);margin-top:1px;">Rating: \u201C' + DA.esc(fc.textualRating) + '\u201D</div>';
          }
          h += '</div>';

          // External link
          if (fc.url) {
            h += '<a href="' + DA.esc(fc.url) + '" target="_blank" rel="noopener" style="flex-shrink:0;font-size:10px;color:var(--accent);text-decoration:none;opacity:.8;" title="View full fact-check">&#x2197;</a>';
          }

          h += '</div>';
        }

        h += '</div>';
      }

      if (!anyChecked && !(summary && summary.claimsChecked > 0)) {
        h += '<div style="font-size:12px;color:var(--text-faint);">Enable the fact-check-integration upgrade and re-analyze to see real fact-check verdicts.</div>';
      }

      return h;
    },

    syntheticMediaAnalysis: function (data) {
      var prob = typeof data.syntheticProbability === 'number' ? data.syntheticProbability : 0;
      var probColor = prob >= 70 ? 'var(--red)' : prob >= 40 ? 'var(--yellow)' : prob >= 15 ? 'var(--blue)' : 'var(--green)';

      var h = '';

      // Probability score bar
      h += '<div style="margin-bottom:14px;">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
          '<span style="font-size:12px;color:var(--text-faint);">Synthetic Probability</span>' +
          '<span style="font-size:13px;font-weight:600;color:' + probColor + ';">' + prob + '/100</span>' +
        '</div>' +
        '<div class="pol-track"><div class="pol-fill" style="width:' + prob + '%;background:' + probColor + ';"></div></div>' +
      '</div>';

      // Confidence + disclosure badges
      if (data.confidenceLevel) {
        var confColor = data.confidenceLevel === 'high' ? 'var(--red)' : data.confidenceLevel === 'medium' ? 'var(--yellow)' : 'var(--blue)';
        h += '<div style="margin-bottom:10px;">' + badge('Confidence: ' + data.confidenceLevel, confColor);
        if (data.disclosureStatus && data.disclosureStatus !== 'not_applicable') {
          var discColor = data.disclosureStatus === 'disclosed' ? 'var(--green)' : data.disclosureStatus === 'partial' ? 'var(--yellow)' : 'var(--red)';
          h += ' ' + badge('Disclosure: ' + data.disclosureStatus, discColor);
        }
        h += '</div>';
      }

      // Text authenticity
      var ta = data.textAuthenticity;
      if (ta) {
        h += '<div style="margin-bottom:12px;">';
        h += '<div style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Text Authenticity</div>';
        if (typeof ta.score === 'number') {
          var taColor = ta.score >= 70 ? 'var(--red)' : ta.score >= 40 ? 'var(--yellow)' : ta.score >= 15 ? 'var(--blue)' : 'var(--green)';
          h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
          h += '<div style="flex:1;background:var(--surface2);border-radius:4px;height:5px;">';
          h += '<div style="background:' + taColor + ';border-radius:4px;height:5px;width:' + Math.min(ta.score, 100) + '%;"></div></div>';
          h += '<span style="font-size:11px;font-weight:600;color:' + taColor + ';">' + ta.score + '</span>';
          h += '</div>';
        }
        if (ta.indicators && ta.indicators.length) {
          for (var i = 0; i < ta.indicators.length; i++) {
            var ind = ta.indicators[i];
            var sevColor = ind.severity === 'high' ? 'var(--red)' : ind.severity === 'medium' ? 'var(--yellow)' : 'var(--blue)';
            h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;border-left:3px solid ' + sevColor + ';">';
            h += badge((ind.type || '').replace(/_/g, ' '), sevColor);
            if (ind.evidence) h += '<div style="color:var(--text-muted);margin-top:3px;font-style:italic;line-height:1.4;">&ldquo;' + DA.esc(ind.evidence.substring(0, 200)) + '&rdquo;</div>';
            h += '</div>';
          }
        }
        if (ta.humanIndicators && ta.humanIndicators.length) {
          h += '<div style="margin-top:6px;"><span style="font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:.4px;">Human Indicators:</span></div>';
          for (var j = 0; j < ta.humanIndicators.length; j++) {
            h += '<div style="font-size:12px;color:var(--text-muted);padding-left:8px;border-left:2px solid var(--green);margin-top:4px;line-height:1.5;">' + DA.esc(ta.humanIndicators[j]) + '</div>';
          }
        }
        h += '</div>';
      }

      // Media authenticity concerns
      var ma = data.mediaAuthenticity;
      if (ma && ma.concerns && ma.concerns.length) {
        h += '<div style="margin-bottom:12px;">';
        h += '<div style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Media Authenticity</div>';
        for (var k = 0; k < ma.concerns.length; k++) {
          var c = ma.concerns[k];
          h += '<div style="padding:6px 10px;border-radius:6px;background:var(--surface2);margin-bottom:4px;font-size:12px;">';
          h += badge((c.type || '').replace(/_/g, ' '), '#06B6D4');
          if (c.description) h += '<div style="color:var(--text-muted);margin-top:3px;line-height:1.4;">' + DA.esc(c.description) + '</div>';
          h += '</div>';
        }
        h += '</div>';
      }

      // Narrative authenticity flags
      var na = data.narrativeAuthenticity;
      if (na) {
        var flags = [];
        if (na.coordinatedInauthenticity) flags.push('Coordinated Inauthenticity');
        if (na.translationArtifacts) flags.push('Translation Artifacts');
        if (na.contentSpinning) flags.push('Content Spinning');
        if (flags.length) {
          h += '<div style="margin-bottom:10px;">';
          h += '<div style="font-size:11px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">Narrative Flags</div>';
          for (var f = 0; f < flags.length; f++) {
            h += badge(flags[f], 'var(--red)') + ' ';
          }
          if (na.details) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;line-height:1.5;">' + DA.esc(na.details) + '</div>';
          h += '</div>';
        }
      }

      // Assessment
      if (data.assessment) h += '<div style="font-size:12px;color:var(--text-muted);margin-top:8px;line-height:1.5;">' + DA.esc(data.assessment) + '</div>';

      return h;
    },
  };

  // ============================================================
  // Section grouping and labels
  // ============================================================

  var SECTION_GROUPS = [
    {
      label: "ADVANCED ANALYSIS",
      icon: "\u2726",
      keys: ["anchorAuthority", "multimodalCoherence", "emotionalProsody", "narrativePacing",
             "visualFramingBias", "crossModalContradictions", "sociolinguisticMarkers",
             "audienceManipulation", "geographicBias",
             "expertCredibility", "temporalFraming", "multimodalFraming", "persuasionAnalysis",
             "factCheckIntegration", "syntheticMediaAnalysis"],
    },
    {
      label: "VIDEO ANALYSIS",
      icon: "\u25B6",
      keys: ["thumbnailBias", "speakerSelectionBias", "brollInfluence", "productionBias", "deepfakeWarning"],
    },
    {
      label: "PROSODIC ANALYSIS",
      icon: "\u266A",
      keys: ["vocalStress", "intonationCredibility", "codeSwitching", "paralinguisticCues"],
    },
    {
      label: "CORE ANALYSIS",
      icon: "\u2B22",
      keys: ["sentenceBiasTagging", "biasTaxonomy38", "articleTypeClassification", "headlineBodyConcordance",
             "opinionDensityMeter", "omissionSubTyping", "sentimentAnalysis"],
    },
    {
      label: "NARRATIVE TRACKING",
      icon: "\u{1F4F0}",
      keys: ["narrativeEvolution"],
    },
  ];

  var SECTION_LABELS = {
    anchorAuthority: "Anchor Authority",
    multimodalCoherence: "Multimodal Coherence",
    emotionalProsody: "Emotional Prosody",
    narrativePacing: "Narrative Pacing",
    visualFramingBias: "Visual Framing Bias",
    crossModalContradictions: "Cross-modal Contradictions",
    sociolinguisticMarkers: "Sociolinguistic Markers",
    audienceManipulation: "Manipulation & Outrage",
    geographicBias: "Geographic Bias",
    expertCredibility: "Expert Credibility",
    temporalFraming: "Temporal Framing",
    thumbnailBias: "Thumbnail Bias",
    speakerSelectionBias: "Speaker Selection Bias",
    brollInfluence: "B-Roll Influence",
    productionBias: "Production Bias",
    deepfakeWarning: "Deepfake Warning",
    vocalStress: "Vocal Stress Patterns",
    intonationCredibility: "Intonation Credibility",
    codeSwitching: "Code-Switching",
    paralinguisticCues: "Paralinguistic Cues",
    multimodalFraming: "Multimodal Framing Detection",
    // Tier 4: Core Analysis Enhancements
    sentenceBiasTagging: "Sentence-Level Bias",
    biasTaxonomy38: "38-Type Bias Taxonomy",
    articleTypeClassification: "Article Type",
    headlineBodyConcordance: "Headline Integrity",
    opinionDensityMeter: "Opinion Density",
    omissionSubTyping: "Omission Types",
    sentimentAnalysis: "Sentiment Bias (VADER)",
    persuasionAnalysis: "Persuasion & Propaganda",
    // Upgrade #8
    narrativeEvolution: "Narrative Evolution",
    // Upgrade #10
    factCheckIntegration: "Real Fact-Checks",
    // Synthetic media detection
    syntheticMediaAnalysis: "Synthetic Media Detection",
  };

  /**
   * Render all upgrade sections present in the analysis response.
   * Returns HTML string to be appended to the center column.
   */
  DA.renderUpgradeSections = function (analysis, isDeep) {
    if (!isDeep) return "";

    var html = "";
    var anyRendered = false;

    for (var gi = 0; gi < SECTION_GROUPS.length; gi++) {
      var group = SECTION_GROUPS[gi];
      var groupHtml = "";
      var groupHasContent = false;

      for (var ki = 0; ki < group.keys.length; ki++) {
        var key = group.keys[ki];
        var data = analysis[key];
        if (!data) continue;
        if (!UPGRADE_RENDERERS[key]) continue;

        groupHasContent = true;
        groupHtml += '<div class="section" id="sec-' + key + '">';
        groupHtml += '<div class="section-label">' + DA.esc(SECTION_LABELS[key] || key) + '</div>';
        try {
          groupHtml += UPGRADE_RENDERERS[key](data);
        } catch (e) {
          groupHtml += '<div style="font-size:12px;color:var(--text-faint);">Render error: ' + DA.esc(e.message) + '</div>';
        }
        groupHtml += '</div>';
      }

      if (groupHasContent) {
        if (!anyRendered) {
          html += '<div style="margin-top:24px;margin-bottom:12px;padding:10px 0;border-top:1px solid var(--border);">' +
            '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent);display:flex;align-items:center;gap:6px;">' +
            '<span style="background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">&#x2726;</span>' +
            'Research-Backed Upgrades</div></div>';
          anyRendered = true;
        }

        // Group header
        html += '<div style="margin-top:16px;margin-bottom:8px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:var(--text-faint);display:flex;align-items:center;gap:6px;">' +
          '<span>' + group.icon + '</span> ' + group.label + '</div>';
        html += groupHtml;
      }
    }

    return html;
  };
})();
