// Spectrum Research Monitor — Upgrades view
// Compiles research papers into actionable plugin upgrade proposals

// eslint-disable-next-line no-unused-vars
async function renderUpgrades(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div><div>Loading upgrades...</div></div>`;

    try {
        const data = await ResearchAPI.getLatestUpgrades();

        if (!data.compilation) {
            container.innerHTML = `
                <div class="upgrades-page">
                    <div class="upgrades-header">
                        <div>
                            <h1 class="section-header" style="margin-bottom:4px">Plugin Upgrades</h1>
                            <p style="color:var(--text-muted);font-size:14px">Research-backed upgrade proposals for Spectrum</p>
                        </div>
                        <button class="btn btn-primary" id="compile-btn">Compile Upgrades</button>
                    </div>
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        <p>No compilations yet. Click "Compile Upgrades" to analyze your research papers and generate actionable upgrade proposals.</p>
                    </div>
                </div>`;
            bindCompileButton(container);
            return;
        }

        renderCompilation(container, data.compilation);
    } catch (err) {
        container.innerHTML = `<div class="empty-state"><p>Error loading upgrades: ${escapeHtml(err.message)}</p></div>`;
    }
}

function renderCompilation(container, compilation) {
    const upgrades = compilation.upgrades || [];
    const impactOrder = { high: 0, medium: 1, low: 2 };
    upgrades.sort((a, b) => (impactOrder[a.impact] || 2) - (impactOrder[b.impact] || 2));

    const compiledDate = compilation.compiledAt
        ? new Date(compilation.compiledAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : "Unknown";

    container.innerHTML = `
        <div class="upgrades-page">
            <div class="upgrades-header">
                <div>
                    <h1 class="section-header" style="margin-bottom:4px">Plugin Upgrades</h1>
                    <p style="color:var(--text-muted);font-size:14px">
                        Compiled ${compiledDate} from ${compilation.totalPapersAnalyzed} papers
                    </p>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-ghost btn-sm" id="history-btn">History</button>
                    <button class="btn btn-primary" id="compile-btn">Recompile</button>
                </div>
            </div>

            ${compilation.summary ? `
            <div class="upgrade-summary card">
                <h3 style="font-size:14px;font-weight:600;color:var(--accent-light);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Executive Summary</h3>
                <p style="font-size:14px;color:var(--text-secondary);line-height:1.8">${escapeHtml(compilation.summary)}</p>
            </div>` : ""}

            <div class="upgrade-stats">
                <div class="upgrade-stat">
                    <span class="upgrade-stat-value">${upgrades.length}</span>
                    <span class="upgrade-stat-label">Upgrades</span>
                </div>
                <div class="upgrade-stat">
                    <span class="upgrade-stat-value high">${upgrades.filter((u) => u.impact === "high").length}</span>
                    <span class="upgrade-stat-label">High Impact</span>
                </div>
                <div class="upgrade-stat">
                    <span class="upgrade-stat-value" style="color:var(--success)">${upgrades.filter((u) => u.effort === "small").length}</span>
                    <span class="upgrade-stat-label">Quick Wins</span>
                </div>
                <div class="upgrade-stat">
                    <span class="upgrade-stat-value" style="color:var(--text-muted)">${compilation.totalPapersAnalyzed}</span>
                    <span class="upgrade-stat-label">Papers Analyzed</span>
                </div>
            </div>

            <div class="upgrades-list">
                ${upgrades.map((u, idx) => renderUpgradeCard(u, idx)).join("")}
            </div>
        </div>`;

    // Bind expand/collapse
    container.querySelectorAll(".upgrade-card-header").forEach((header) => {
        header.addEventListener("click", () => {
            const card = header.closest(".upgrade-card");
            card.classList.toggle("expanded");
        });
    });

    bindCompileButton(container);
    bindHistoryButton(container);
}

function renderUpgradeCard(upgrade, idx) {
    const impactColors = { high: "var(--danger)", medium: "var(--warning)", low: "var(--text-muted)" };
    const effortLabels = { small: "Quick Win", medium: "Moderate", large: "Major Effort" };
    const effortColors = { small: "var(--success)", medium: "var(--warning)", large: "var(--danger)" };
    const categoryColors = {
        bias_detection: "#6366f1", fact_checking: "#10b981",
        linguistic_framework: "#f59e0b", media_studies: "#ec4899", nlp_methods: "#8b5cf6",
    };

    const borderColor = categoryColors[upgrade.category] || "var(--accent)";
    const steps = upgrade.implementation?.steps || [];
    const files = upgrade.implementation?.files || [];
    const newCaps = upgrade.implementation?.newCapabilities || [];
    const refs = upgrade.researchBasis || [];

    return `
    <div class="upgrade-card" style="border-left-color:${borderColor}">
        <div class="upgrade-card-header">
            <div class="upgrade-card-title">
                <span class="upgrade-number">${idx + 1}</span>
                <div>
                    <h3>${escapeHtml(upgrade.title)}</h3>
                    <div class="upgrade-badges">
                        <span class="badge badge-${upgrade.category}">${(upgrade.category || "").replace(/_/g, " ")}</span>
                        <span class="upgrade-impact" style="color:${impactColors[upgrade.impact] || "inherit"}">
                            ${(upgrade.impact || "").toUpperCase()} IMPACT
                        </span>
                        <span class="upgrade-effort" style="color:${effortColors[upgrade.effort] || "inherit"}">
                            ${effortLabels[upgrade.effort] || upgrade.effort}
                        </span>
                    </div>
                </div>
            </div>
            <svg class="upgrade-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <div class="upgrade-card-body">
            <p class="upgrade-summary-text">${escapeHtml(upgrade.summary || "")}</p>

            ${upgrade.implementation?.overview ? `
            <div class="upgrade-section">
                <h4>Technical Approach</h4>
                <p>${escapeHtml(upgrade.implementation.overview)}</p>
            </div>` : ""}

            ${files.length > 0 ? `
            <div class="upgrade-section">
                <h4>Files to Modify</h4>
                <div class="upgrade-files">
                    ${files.map((f) => `<code class="file-tag">${escapeHtml(f)}</code>`).join("")}
                </div>
            </div>` : ""}

            ${steps.length > 0 ? `
            <div class="upgrade-section">
                <h4>Implementation Steps</h4>
                <ol class="upgrade-steps">
                    ${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
                </ol>
            </div>` : ""}

            ${newCaps.length > 0 ? `
            <div class="upgrade-section">
                <h4>New Capabilities</h4>
                <ul class="upgrade-capabilities">
                    ${newCaps.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}
                </ul>
            </div>` : ""}

            ${refs.length > 0 ? `
            <div class="upgrade-section">
                <h4>Research Basis</h4>
                <div class="upgrade-refs">
                    ${refs.map((r) => `
                    <div class="ref-item">
                        <a href="${r.paperUrl ? escapeHtml(r.paperUrl) : `#/paper/${r.paperId}`}"
                           class="ref-title" ${r.paperUrl ? 'target="_blank" rel="noopener"' : ""}>
                            ${escapeHtml(r.paperTitle || r.paperId)}
                        </a>
                        <span class="ref-insight">${escapeHtml(r.insight || "")}</span>
                    </div>`).join("")}
                </div>
            </div>` : ""}
        </div>
    </div>`;
}

function bindCompileButton(container) {
    const btn = container.querySelector("#compile-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Compiling...";

        // Show progress in the content area
        const list = container.querySelector(".upgrades-list, .empty-state");
        if (list) {
            list.innerHTML = `<div class="loading"><div class="spinner"></div><div>Analyzing papers with Claude Sonnet... this may take a minute.</div></div>`;
        }

        try {
            const data = await ResearchAPI.compileUpgrades();
            if (data.compilation) {
                renderCompilation(container, data.compilation);
            } else {
                btn.textContent = "Compile Upgrades";
                btn.disabled = false;
                if (list) list.innerHTML = `<div class="empty-state"><p>${data.message || "No papers available."}</p></div>`;
            }
        } catch (err) {
            btn.textContent = "Retry";
            btn.disabled = false;
            if (list) list.innerHTML = `<div class="empty-state"><p>Compilation failed: ${escapeHtml(err.message)}</p></div>`;
        }
    });
}

function bindHistoryButton(container) {
    const btn = container.querySelector("#history-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
            const data = await ResearchAPI.getUpgradesList();
            const comps = data.compilations || [];
            if (comps.length === 0) {
                alert("No past compilations found.");
                btn.disabled = false;
                return;
            }

            // Show a simple dropdown/modal with history
            let existing = container.querySelector(".history-dropdown");
            if (existing) { existing.remove(); btn.disabled = false; return; }

            const dropdown = document.createElement("div");
            dropdown.className = "history-dropdown";
            dropdown.innerHTML = `
                <div class="history-list">
                    ${comps.map((c) => `
                    <div class="history-item" data-id="${c.id}">
                        <span class="history-date">${c.compiledAt ? new Date(c.compiledAt).toLocaleDateString() : "Unknown"}</span>
                        <span class="history-meta">${c.upgradeCount} upgrades from ${c.totalPapers} papers</span>
                    </div>`).join("")}
                </div>`;

            btn.parentElement.appendChild(dropdown);
            btn.disabled = false;

            dropdown.querySelectorAll(".history-item").forEach((item) => {
                item.addEventListener("click", async () => {
                    dropdown.remove();
                    container.querySelector(".upgrades-list").innerHTML = `<div class="loading"><div class="spinner"></div><div>Loading...</div></div>`;
                    const resp = await fetch(`${UPGRADES_API}?id=${item.dataset.id}`);
                    const comp = await resp.json();
                    renderCompilation(container, { id: item.dataset.id, ...comp });
                });
            });

            // Close on outside click
            setTimeout(() => {
                document.addEventListener("click", function close(e) {
                    if (!dropdown.contains(e.target) && e.target !== btn) {
                        dropdown.remove();
                        document.removeEventListener("click", close);
                    }
                });
            }, 10);
        } catch (err) {
            btn.disabled = false;
            alert("Failed to load history: " + err.message);
        }
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}
