// Digest views — list and detail

function renderDigests(container) {
    container.innerHTML = `
        <h2 class="section-header">Daily Digests</h2>
        <div id="digest-list-container">
            <div class="loading">
                <div class="spinner"></div>
                <div>Loading digests...</div>
            </div>
        </div>`;

    loadDigestList();
}

async function loadDigestList() {
    const el = document.getElementById("digest-list-container");
    if (!el) return;

    try {
        const data = await ResearchAPI.getDigests();
        const digests = data.digests || [];

        if (digests.length === 0) {
            el.innerHTML = `<div class="empty-state"><p>No digests yet. The scanner runs daily at 5AM UTC.</p></div>`;
            return;
        }

        el.innerHTML = `
            <div class="digest-list">
                ${digests.map(d => `
                    <a href="#/digest/${d.date}" class="digest-row">
                        <div>
                            <span class="digest-date">${d.date}</span>
                            ${d.emailSent ? '<span style="font-size:11px;color:#10b981;margin-left:8px">Email sent</span>' : ""}
                        </div>
                        <div class="digest-meta">
                            <span>${d.totalStored || 0} papers</span>
                            <span>${d.totalPapersScanned || 0} scanned</span>
                            ${d.highPriority > 0 ? `<span style="color:#ef4444;font-weight:600">${d.highPriority} high-priority</span>` : ""}
                        </div>
                    </a>
                `).join("")}
            </div>`;
    } catch (err) {
        el.innerHTML = `<div class="empty-state"><p>Failed to load digests: ${err.message}</p></div>`;
    }
}

function renderDigestDetail(container, date) {
    container.innerHTML = `
        <div class="digest-detail">
            <div class="loading">
                <div class="spinner"></div>
                <div>Loading digest...</div>
            </div>
        </div>`;

    loadDigestDetail(container, date);
}

async function loadDigestDetail(container, date) {
    try {
        const digest = await ResearchAPI.getDigest(date);

        const categoryNames = {
            bias_detection: "Bias Detection",
            fact_checking: "Fact Checking",
            linguistic_framework: "Linguistic Framework",
            media_studies: "Media Studies",
            nlp_methods: "NLP Methods",
        };

        container.innerHTML = `
            <div class="digest-detail">
                <a href="#/digests" class="back-link" style="display:inline-flex;align-items:center;gap:6px;color:#a5b4fc;text-decoration:none;font-size:13px;margin-bottom:16px">
                    &larr; Back to digests
                </a>

                <h1>Digest: ${date}</h1>

                <!-- Stats -->
                <div class="stats-grid" style="margin-top:16px">
                    <div class="stat-card">
                        <div class="stat-value">${digest.totalPapersScanned || 0}</div>
                        <div class="stat-label">Papers Scanned</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${digest.totalStored || 0}</div>
                        <div class="stat-label">Papers Stored</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value high">${digest.highPriority || 0}</div>
                        <div class="stat-label">High Priority</div>
                    </div>
                </div>

                <!-- Category Breakdown -->
                ${digest.byCategory && Object.keys(digest.byCategory).length > 0 ? `
                <div class="category-grid" style="margin-top:16px">
                    ${Object.entries(digest.byCategory).map(([cat, count]) => `
                        <div class="category-item" data-cat="${cat}">
                            <span class="name">${categoryNames[cat] || cat.replace(/_/g, " ")}</span>
                            <span class="count">${count}</span>
                        </div>
                    `).join("")}
                </div>` : ""}

                <!-- Narrative -->
                <h2 class="section-header" style="margin-top:24px">Summary</h2>
                <div class="digest-narrative">${formatMarkdown(digest.narrative || "No narrative available.")}</div>

                <!-- Recommendations -->
                ${digest.topRecommendations && digest.topRecommendations.length > 0 ? `
                <h2 class="section-header">Top Recommendations</h2>
                <div class="card" style="margin-bottom:20px">
                    <ul class="recommendations-list">
                        ${digest.topRecommendations.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
                    </ul>
                </div>` : ""}

                <!-- Papers from this digest -->
                ${digest.paperIds && digest.paperIds.length > 0 ? `
                <h2 class="section-header">Papers Found (${digest.paperIds.length})</h2>
                <div class="digest-list">
                    ${digest.paperIds.map(id => `
                        <a href="#/paper/${id}" class="digest-row">
                            <span style="font-size:13px;color:#a5b4fc">${id}</span>
                            <span style="font-size:12px;color:#9ca3af">View details &rarr;</span>
                        </a>
                    `).join("")}
                </div>` : ""}
            </div>`;
    } catch (err) {
        container.innerHTML = `
            <div class="digest-detail">
                <a href="#/digests" class="back-link" style="display:inline-flex;align-items:center;gap:6px;color:#a5b4fc;text-decoration:none;font-size:13px;margin-bottom:16px">
                    &larr; Back to digests
                </a>
                <div class="empty-state">
                    <p>Failed to load digest: ${err.message}</p>
                </div>
            </div>`;
    }
}

function formatMarkdown(text) {
    // Very basic markdown → HTML
    return escapeHtml(text)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>");
}
