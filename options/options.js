// Spectrum — Options page script

// Source list for the transparency section (duplicated from domain-lists.js since
// options page can't import ES modules from background scripts)
const SOURCE_DATA = {
  farLeft: ["Jacobin", "The Intercept", "Democracy Now!", "Current Affairs", "Truthout", "Common Dreams", "The Real News", "In These Times"],
  left: ["MSNBC", "HuffPost", "Vox", "The Guardian", "Slate", "Mother Jones", "The Nation", "Salon", "The Daily Beast", "The New Republic"],
  centerLeft: ["New York Times", "Washington Post", "CNN", "NPR", "PBS", "BBC", "The Atlantic", "Politico", "NBC News", "CBS News", "ABC News", "TIME", "Axios"],
  center: ["Reuters", "Associated Press", "The Hill", "USA Today", "Bloomberg", "C-SPAN", "Al Jazeera", "Newsweek", "MarketWatch"],
  centerRight: ["Wall Street Journal", "The Economist", "Forbes", "National Review", "RealClearPolitics", "Reason", "Washington Free Beacon", "The American Spectator"],
  right: ["Fox News", "New York Post", "Washington Times", "The Federalist", "Daily Wire", "Daily Caller", "Townhall", "The Blaze"],
  farRight: ["Breitbart", "The Epoch Times", "OANN", "Newsmax", "The Gateway Pundit", "Zero Hedge", "InfoWars"],
};

document.addEventListener("DOMContentLoaded", async () => {
  const settings = await SpectrumStorage.getSettings();

  // ---- Sensitivity cards ----
  const cards = document.querySelectorAll(".sensitivity-card");
  cards.forEach((card) => {
    const value = card.dataset.value;
    if (value === settings.sensitivity) {
      card.classList.add("selected");
      card.querySelector("input").checked = true;
    } else {
      card.classList.remove("selected");
    }

    card.addEventListener("click", async () => {
      cards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      card.querySelector("input").checked = true;
      await SpectrumStorage.saveSetting("sensitivity", value);
      chrome.runtime.sendMessage({ type: "SETTINGS_CHANGED", settings: { sensitivity: value } }).catch(() => {});
    });
  });

  // ---- Site management ----
  function setupSiteList(listId, inputId, btnId, settingKey, initialSites) {
    const list = document.getElementById(listId);
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    let sites = [...initialSites];

    function render() {
      list.innerHTML = sites
        .map(
          (site, i) => `
        <li class="site-tag">
          ${site}
          <span class="site-tag-remove" data-index="${i}">&times;</span>
        </li>
      `
        )
        .join("");

      list.querySelectorAll(".site-tag-remove").forEach((el) => {
        el.addEventListener("click", async () => {
          sites.splice(parseInt(el.dataset.index), 1);
          await SpectrumStorage.saveSetting(settingKey, sites);
          render();
        });
      });
    }

    btn.addEventListener("click", async () => {
      const val = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
      if (val && !sites.includes(val)) {
        sites.push(val);
        await SpectrumStorage.saveSetting(settingKey, sites);
        input.value = "";
        render();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btn.click();
    });

    render();
  }

  setupSiteList("include-list", "include-input", "include-add", "includedSites", settings.includedSites);
  setupSiteList("exclude-list", "exclude-input", "exclude-add", "excludedSites", settings.excludedSites);

  // ---- Position toggle ----
  const posButtons = document.querySelectorAll(".pos-btn");
  posButtons.forEach((btn) => {
    if (btn.dataset.value === settings.dashboardPosition) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }

    btn.addEventListener("click", async () => {
      posButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      await SpectrumStorage.saveSetting("dashboardPosition", btn.dataset.value);
      chrome.runtime.sendMessage({
        type: "SETTINGS_CHANGED",
        settings: { dashboardPosition: btn.dataset.value },
      }).catch(() => {});
    });
  });

  // ---- Transparency slider ----
  const transpSlider = document.getElementById("transparency-slider");
  const transpValue = document.getElementById("transparency-value");
  transpSlider.value = Math.round(settings.dashboardTransparency * 100);
  transpValue.textContent = `${transpSlider.value}%`;

  transpSlider.addEventListener("input", () => {
    transpValue.textContent = `${transpSlider.value}%`;
  });

  transpSlider.addEventListener("change", async () => {
    const val = parseInt(transpSlider.value) / 100;
    await SpectrumStorage.saveSetting("dashboardTransparency", val);
    chrome.runtime.sendMessage({
      type: "SETTINGS_CHANGED",
      settings: { dashboardTransparency: val },
    }).catch(() => {});
  });

  // ---- Width slider ----
  const widthSlider = document.getElementById("width-slider");
  const widthValue = document.getElementById("width-value");
  widthSlider.value = settings.dashboardWidth;
  widthValue.textContent = `${settings.dashboardWidth}px`;

  widthSlider.addEventListener("input", () => {
    widthValue.textContent = `${widthSlider.value}px`;
  });

  widthSlider.addEventListener("change", async () => {
    const val = parseInt(widthSlider.value);
    await SpectrumStorage.saveSetting("dashboardWidth", val);
    chrome.runtime.sendMessage({
      type: "SETTINGS_CHANGED",
      settings: { dashboardWidth: val },
    }).catch(() => {});
  });

  // ---- Source transparency list ----
  const sourceListEl = document.getElementById("source-list");
  const leanOrder = ["farLeft", "left", "centerLeft", "center", "centerRight", "right", "farRight"];

  sourceListEl.innerHTML = leanOrder
    .map((lean) => {
      const sources = SOURCE_DATA[lean] || [];
      const label = SPECTRUM.LEAN_LABELS[lean];
      const color = SPECTRUM.LEAN_COLORS[lean];
      return `
      <div class="source-category">
        <div class="source-category-header">
          <span class="source-lean-dot" style="background: ${color}"></span>
          <span class="source-category-name">${label}</span>
          <span class="source-category-count">${sources.length} sources</span>
        </div>
        <div class="source-category-items">
          ${sources.map((s) => `<span class="source-item">${s}</span>`).join("")}
        </div>
      </div>
    `;
    })
    .join("");
});
