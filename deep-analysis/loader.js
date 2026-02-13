(function () {
  window.DA = window.DA || {};

  var initLoading = document.getElementById("init-loading");
  var pageLayout = document.getElementById("page-layout");

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

  // ---- Deep analysis progress strip + stages ----
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

  function startInitProgress(fill, status) {
    var sIdx = 0;
    stageTimer = setInterval(function () {
      if (sIdx >= stages.length) return;
      if (fill) fill.style.width = stages[sIdx].pct + "%";
      if (status) status.textContent = stages[sIdx].text;
      sIdx++;
    }, 2500);
  }

  function stopInitProgress() {
    clearInterval(stageTimer);
  }

  DA.hideInitLoader = hideInitLoader;
  DA.showPageLayout = showPageLayout;
  DA.showBottomLoader = showBottomLoader;
  DA.hideBottomLoader = hideBottomLoader;
  DA.startProgress = startProgress;
  DA.endProgress = endProgress;
  DA.startInitProgress = startInitProgress;
  DA.stopInitProgress = stopInitProgress;
})();
