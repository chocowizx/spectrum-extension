// Spectrum Research Monitor — Feedback review
// Lists flagged analysis items from the extension for review during upgrades

// eslint-disable-next-line no-unused-vars
async function renderFeedback(container) {
    container.innerHTML = `<div class="loading"><div class="spinner"></div><div>Loading feedback...</div></div>`;

    try {
        // Feedback is stored in chrome.storage.local via the extension
        // Research Monitor reads from Firestore (synced) or directly via messaging
        // For now, we read from Firestore collection spectrumFeedback
        const snapshot = await db.collection("spectrumFeedback")
            .orderBy("timestamp", "desc")
            .limit(100)
            .get();

        const items = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

        if (items.length === 0) {
            container.innerHTML = `
                <div class="upgrades-page">
                    <div class="upgrades-header">
                        <div>
                            <h1 class="section-header" style="margin-bottom:4px">Feedback</h1>
                            <p style="color:var(--text-muted);font-size:14px">Flagged analysis items from the Spectrum extension</p>
                        </div>
                        <button class="btn btn-primary btn-sm" id="sync-feedback-btn">Sync from Extension</button>
                    </div>
                    <div class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
                        <p>No feedback yet. Use the 🚩 flag button in the Spectrum extension to flag problematic analysis results.</p>
                    </div>
                </div>`;
            bindSyncButton(container);
            return;
        }

        renderFeedbackList(container, items);
    } catch (err) {
        // Firestore collection may not exist yet — show sync option
        container.innerHTML = `
            <div class="upgrades-page">
                <div class="upgrades-header">
                    <div>
                        <h1 class="section-header" style="margin-bottom:4px">Feedback</h1>
                        <p style="color:var(--text-muted);font-size:14px">Flagged analysis items from the Spectrum extension</p>
                    </div>
                    <button class="btn btn-primary btn-sm" id="sync-feedback-btn">Sync from Extension</button>
                </div>
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
                    <p>No feedback collection found. Click "Sync from Extension" to pull feedback from the extension's local storage, or start flagging items in Spectrum.</p>
                </div>
            </div>`;
        bindSyncButton(container);
    }
}

function renderFeedbackList(container, items) {
    const categoryLabels = {
        inaccurate: "Inaccurate",
        missing_context: "Missing Context",
        wrong_severity: "Wrong Severity",
        false_positive: "False Positive",
        missed_bias: "Missed Bias",
        good_catch: "Good Catch",
        other: "Other",
    };
    const categoryColors = {
        inaccurate: "#EF4444",
        missing_context: "#F59E0B",
        wrong_severity: "#F97316",
        false_positive: "#8B5CF6",
        missed_bias: "#3B82F6",
        good_catch: "#22C55E",
        other: "#64748B",
    };

    const stats = {};
    items.forEach((item) => {
        stats[item.category] = (stats[item.category] || 0) + 1;
    });

    container.innerHTML = `
        <div class="upgrades-page">
            <div class="upgrades-header">
                <div>
                    <h1 class="section-header" style="margin-bottom:4px">Feedback</h1>
                    <p style="color:var(--text-muted);font-size:14px">${items.length} flagged items</p>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn btn-ghost btn-sm" id="sync-feedback-btn">Sync</button>
                    <button class="btn btn-ghost btn-sm" id="export-feedback-btn">Export JSON</button>
                </div>
            </div>

            <div class="upgrade-stats">
                ${Object.entries(stats).map(([cat, count]) => `
                    <div class="upgrade-stat">
                        <span class="upgrade-stat-value" style="color:${categoryColors[cat] || '#64748B'}">${count}</span>
                        <span class="upgrade-stat-label">${categoryLabels[cat] || cat}</span>
                    </div>
                `).join("")}
            </div>

            <div class="upgrades-list" id="feedback-list">
                ${items.map((item) => renderFeedbackCard(item, categoryLabels, categoryColors)).join("")}
            </div>
        </div>`;

    // Bind expand/collapse
    container.querySelectorAll(".upgrade-card-header").forEach((header) => {
        header.addEventListener("click", () => {
            header.closest(".upgrade-card").classList.toggle("expanded");
        });
    });

    // Bind delete buttons
    container.querySelectorAll(".feedback-delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!confirm("Delete this feedback?")) return;
            const id = btn.dataset.id;
            await db.collection("spectrumFeedback").doc(id).delete();
            btn.closest(".upgrade-card").remove();
        });
    });

    // Bind resolve buttons
    container.querySelectorAll(".feedback-resolve-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const resolved = btn.dataset.resolved === "true";
            await db.collection("spectrumFeedback").doc(id).update({ resolved: !resolved });
            btn.dataset.resolved = String(!resolved);
            btn.textContent = !resolved ? "✓ Resolved" : "Mark Resolved";
            btn.style.background = !resolved ? "rgba(34,197,94,0.1)" : "transparent";
            btn.style.color = !resolved ? "#22C55E" : "var(--text-muted)";
            const card = btn.closest(".upgrade-card");
            card.style.opacity = !resolved ? "0.6" : "1";
        });
    });

    bindSyncButton(container);
    bindExportButton(container, items);
}

function renderFeedbackCard(item, categoryLabels, categoryColors) {
    const catColor = categoryColors[item.category] || "#64748B";
    const catLabel = categoryLabels[item.category] || item.category;
    const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    }) : "Unknown";
    const typeIcon = item.analysisType === "frontPage" ? "📰" : item.analysisType === "video" ? "🎬" : "📄";
    const resolved = item.resolved || false;

    return `
    <div class="upgrade-card" style="border-left-color:${catColor};${resolved ? 'opacity:0.6;' : ''}">
        <div class="upgrade-card-header">
            <div class="upgrade-card-title">
                <span style="font-size:18px">${typeIcon}</span>
                <div>
                    <h3 style="font-size:14px">${escapeHtml(item.section || "General")}</h3>
                    <div class="upgrade-badges">
                        <span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:${catColor}15;color:${catColor};border:1px solid ${catColor}30">${catLabel}</span>
                        <span style="font-size:11px;color:var(--text-muted)">${escapeHtml(item.domain || "")}</span>
                        <span style="font-size:11px;color:var(--text-muted)">${date}</span>
                    </div>
                </div>
            </div>
            <svg class="upgrade-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="upgrade-card-body">
            ${item.itemText ? `
            <div style="padding:8px 10px;background:rgba(0,0,0,0.03);border-radius:6px;margin-bottom:10px;font-size:13px;color:var(--text-secondary);line-height:1.5">
                <strong style="color:var(--text-primary)">Flagged content:</strong> ${escapeHtml(item.itemText)}
            </div>` : ""}
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:10px">
                <strong style="color:var(--text-primary)">Comment:</strong> ${escapeHtml(item.comment)}
            </div>
            ${item.url ? `
            <div style="font-size:11px;margin-bottom:10px">
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" style="color:var(--accent-light);text-decoration:none">${escapeHtml(item.pageTitle || item.url)}</a>
            </div>` : ""}
            <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="feedback-resolve-btn btn btn-ghost btn-sm" data-id="${item.id}" data-resolved="${resolved}"
                    style="${resolved ? 'background:rgba(34,197,94,0.1);color:#22C55E' : ''}">
                    ${resolved ? "✓ Resolved" : "Mark Resolved"}
                </button>
                <button class="feedback-delete-btn btn btn-ghost btn-sm" data-id="${item.id}" style="color:var(--danger)">Delete</button>
            </div>
        </div>
    </div>`;
}

function bindSyncButton(container) {
    const btn = container.querySelector("#sync-feedback-btn");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Syncing...";

        try {
            // Try to get feedback from the extension's storage via background messaging
            // Since we're on the research monitor web app, we use Firestore as the sync target
            // The extension will push to Firestore when synced
            const result = await new Promise((resolve) => {
                if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
                    chrome.runtime.sendMessage({ type: "GET_FEEDBACK" }, (resp) => {
                        resolve(resp);
                    });
                } else {
                    resolve(null);
                }
            });

            if (result && result.items && result.items.length > 0) {
                // Write to Firestore
                const batch = db.batch();
                for (const item of result.items) {
                    const docRef = db.collection("spectrumFeedback").doc(item.id);
                    batch.set(docRef, item, { merge: true });
                }
                await batch.commit();
                btn.textContent = `Synced ${result.items.length} items`;
                setTimeout(() => renderFeedback(container), 1000);
            } else {
                btn.textContent = "No extension data found";
                setTimeout(() => { btn.textContent = "Sync"; btn.disabled = false; }, 2000);
            }
        } catch (err) {
            btn.textContent = "Sync failed";
            btn.disabled = false;
            console.error("Feedback sync error:", err);
        }
    });
}

function bindExportButton(container, items) {
    const btn = container.querySelector("#export-feedback-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
        const json = JSON.stringify(items, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spectrum-feedback-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}
