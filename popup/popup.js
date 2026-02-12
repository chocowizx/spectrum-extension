// Spectrum — Popup script

document.addEventListener("DOMContentLoaded", async () => {
  const enabledToggle = document.getElementById("enabled-toggle");
  const sensitivitySelect = document.getElementById("sensitivity-select");
  const statusIcon = document.getElementById("status-icon");
  const statusText = document.getElementById("status-text");
  const analysisSection = document.getElementById("analysis-section");
  const analysisSummary = document.getElementById("analysis-summary");
  const openOptions = document.getElementById("open-options");

  // Load settings
  const settings = await SpectrumStorage.getSettings();
  enabledToggle.checked = settings.enabled;
  sensitivitySelect.value = settings.sensitivity;

  // Toggle enabled
  enabledToggle.addEventListener("change", async () => {
    const enabled = enabledToggle.checked;
    await SpectrumStorage.saveSetting("enabled", enabled);
    chrome.runtime.sendMessage({ type: "TOGGLE_ENABLED", enabled }).catch(() => {});
    updateStatus();
  });

  // Sensitivity change
  sensitivitySelect.addEventListener("change", async () => {
    const sensitivity = sensitivitySelect.value;
    await SpectrumStorage.saveSetting("sensitivity", sensitivity);
    chrome.runtime.sendMessage({
      type: "SETTINGS_CHANGED",
      settings: { sensitivity },
    }).catch(() => {});
  });

  // Open options
  openOptions.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  let recheckAttempted = false;
  let pollTimer = null;

  // Get current tab status
  async function updateStatus() {
    const settings = await SpectrumStorage.getSettings();

    if (!settings.enabled) {
      statusIcon.textContent = "\u25CB";
      statusIcon.className = "status-icon inactive";
      statusText.textContent = "Spectrum is disabled";
      analysisSection.style.display = "none";
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    // Skip non-http pages
    if (!tab.url || !tab.url.startsWith("http")) {
      statusIcon.textContent = "\u25CB";
      statusIcon.className = "status-icon inactive";
      statusText.textContent = "Not available on this page";
      return;
    }

    chrome.runtime.sendMessage({ type: "GET_STATUS", tabId: tab.id }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statusIcon.textContent = "\u25CB";
        statusIcon.className = "status-icon inactive";
        statusText.textContent = "Not available on this page";
        return;
      }

      switch (response.status) {
        case "checking":
          statusIcon.textContent = "\u25CE";
          statusIcon.className = "status-icon";
          statusText.textContent = "Checking page...";
          // Poll until detection finishes
          schedulePoll(tab.id);
          break;

        case "detected":
          statusIcon.textContent = "\u25C9";
          statusIcon.className = "status-icon news";
          statusText.textContent = `News detected (${response.detection?.method || "unknown"})`;
          break;

        case "analyzing":
          statusIcon.textContent = "\u25CE";
          statusIcon.className = "status-icon analyzing";
          statusText.textContent = "Analyzing article...";
          schedulePoll(tab.id);
          break;

        case "complete":
          statusIcon.textContent = "\u25C9";
          statusIcon.className = "status-icon news";
          const analysis = response.analysis;
          const count = analysis?.claims?.length || 0;
          statusText.textContent = `${count} claim${count !== 1 ? "s" : ""} flagged`;

          if (analysis) {
            analysisSection.style.display = "block";
            const lean = analysis.overallLean || "unknown";
            analysisSummary.innerHTML = `
              <span class="analysis-count">${count} claims</span>
              <span>detected</span>
              <span class="analysis-lean" style="background: rgba(124,58,237,0.2); color: #A78BFA;">
                ${lean.replace(/_/g, "-")}
              </span>
            `;
          }
          break;

        case "not_news":
          statusIcon.textContent = "\u25CB";
          statusIcon.className = "status-icon inactive";
          statusText.textContent = "No news content detected";
          break;

        case "error":
          statusIcon.textContent = "\u25CF";
          statusIcon.className = "status-icon error";
          statusText.textContent = "Analysis error";
          break;

        case "rate_limited":
          statusIcon.textContent = "\u25CF";
          statusIcon.className = "status-icon error";
          statusText.textContent = "Rate limit — try again shortly";
          break;

        case "no_content_script":
          statusIcon.textContent = "\u25CB";
          statusIcon.className = "status-icon inactive";
          statusText.textContent = "Refresh page to activate";
          break;

        default:
          // "unknown" — tab has no state in service worker
          // Trigger a re-check if we haven't already
          if (!recheckAttempted) {
            recheckAttempted = true;
            statusIcon.textContent = "\u25CE";
            statusIcon.className = "status-icon";
            statusText.textContent = "Checking page...";
            chrome.runtime.sendMessage({ type: "RECHECK_TAB", tabId: tab.id }).catch(() => {});
            schedulePoll(tab.id);
          } else {
            statusIcon.textContent = "\u25CB";
            statusIcon.className = "status-icon inactive";
            statusText.textContent = "Refresh page to activate";
          }
      }
    });
  }

  function schedulePoll(tabId) {
    if (pollTimer) return;
    let polls = 0;
    pollTimer = setInterval(() => {
      polls++;
      if (polls > 10) {
        clearInterval(pollTimer);
        pollTimer = null;
        return;
      }
      chrome.runtime.sendMessage({ type: "GET_STATUS", tabId }, (resp) => {
        if (chrome.runtime.lastError || !resp) return;
        // If status has progressed past checking/analyzing, update the UI and stop polling
        if (resp.status !== "checking" && resp.status !== "analyzing" && resp.status !== "unknown") {
          clearInterval(pollTimer);
          pollTimer = null;
          recheckAttempted = true; // prevent re-triggering
          updateStatus();
        }
      });
    }, 1500);
  }

  updateStatus();
});
