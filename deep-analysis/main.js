(function () {
  window.DA = window.DA || {};

  var API_BASE = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net";
  var initFill = document.getElementById("init-fill");
  var initStatus = document.getElementById("init-status");

  // Wire up back/close buttons via JS (no inline onclick — blocked by MV3 CSP)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".back-btn, .close-btn");
    if (btn) window.close();
  });

  function esc(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  DA.esc = esc;

  function showError(msg) {
    DA.hideInitLoader();
    DA.showPageLayout();
    var results = document.getElementById("results");
    results.innerHTML = '<div class="error-msg">' + esc(msg) +
      '<br><br><button class="back-btn close-btn" style="position:static;display:inline-flex;">Close</button></div>';
    results.classList.add("visible");
  }

  async function runDeepAnalysis(data, hasFast) {
    if (hasFast) {
      DA.startProgress();
      DA.showBottomLoader();
    } else {
      DA.startInitProgress(initFill, initStatus);
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
        DA.endProgress();
        DA.hideBottomLoader();
      } else {
        DA.stopInitProgress();
        DA.hideInitLoader();
        DA.showPageLayout();
      }

      // Re-render with deep data (replaces fast)
      DA.renderResults(data, analysis, true);
      // Citations + glossary load last, after everything else
      setTimeout(function () {
        DA.renderCitations();
        setTimeout(DA.renderGlossary, 400);
      }, 800);
    } catch (err) {
      if (hasFast) {
        DA.endProgress();
        DA.hideBottomLoader();
        // Show error inline but keep fast results
        var notice = document.createElement("div");
        notice.className = "section";
        notice.style.borderColor = "rgba(248,113,113,.2)";
        notice.innerHTML = '<div class="section-label" style="color:var(--red);">Deep Analysis Unavailable</div>' +
          '<div style="font-size:13px;color:var(--text-muted);">Showing quick analysis. Deep analysis failed: ' + esc(err.message) + '</div>';
        document.getElementById("results").appendChild(notice);
      } else {
        DA.stopInitProgress();
        showError("Analysis failed: " + err.message);
      }
    }
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
          DA.hideInitLoader();
          DA.showPageLayout();
          DA.renderResults(data, data.fastAnalysis, false);
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
})();
