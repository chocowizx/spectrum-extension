// Dashboard view — stats, category breakdown, recent digests

function renderDashboard(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <div>Loading dashboard...</div>
        </div>`;

    loadDashboardData(container);
}

async function loadDashboardData(container) {
    try {
        const [stats, digestsData] = await Promise.all([
            ResearchAPI.getStats(),
            ResearchAPI.getDigests(),
        ]);

        const digests = digestsData.digests || [];

        const categoryNames = {
            bias_detection: "Bias Detection",
            fact_checking: "Fact Checking",
            linguistic_framework: "Linguistic Framework",
            media_studies: "Media Studies",
            nlp_methods: "NLP Methods",
        };

        container.innerHTML = `
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.totalPapers}</div>
                    <div class="stat-label">Total Papers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value week">${stats.thisWeek}</div>
                    <div class="stat-label">This Week</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value high">${stats.byPriority.high || 0}</div>
                    <div class="stat-label">High Priority</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${digests.length}</div>
                    <div class="stat-label">Digests</div>
                </div>
            </div>

            <!-- Category Breakdown -->
            <h2 class="section-header">By Category</h2>
            <div class="category-grid">
                ${Object.entries(stats.byCategory || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => `
                        <div class="category-item" data-cat="${cat}">
                            <span class="name">${categoryNames[cat] || cat.replace(/_/g, " ")}</span>
                            <span class="count">${count}</span>
                        </div>
                    `).join("")}
            </div>

            <!-- Recent Activity Chart (simple bar) -->
            <h2 class="section-header">Recent Activity</h2>
            <div class="card" style="margin-bottom:24px;padding:24px">
                <div style="display:flex;align-items:flex-end;gap:8px;height:120px">
                    ${(stats.recentDigests || []).reverse().map(d => {
                        const maxH = Math.max(...(stats.recentDigests || []).map(x => x.totalStored || 1));
                        const h = Math.max(4, ((d.totalStored || 0) / maxH) * 100);
                        return `
                            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                                <div style="font-size:11px;color:#9ca3af">${d.totalStored}</div>
                                <div style="width:100%;height:${h}px;background:linear-gradient(180deg,#6366f1,#4338ca);border-radius:4px 4px 0 0;position:relative">
                                    ${d.highPriority > 0 ? `<div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:10px;color:#ef4444;font-weight:700">${d.highPriority}H</div>` : ""}
                                </div>
                                <div style="font-size:10px;color:#6b7280;white-space:nowrap">${d.date.slice(5)}</div>
                            </div>`;
                    }).join("")}
                </div>
            </div>

            <!-- Recent Digests -->
            <h2 class="section-header">Recent Digests</h2>
            <div class="digest-list">
                ${digests.length === 0
                    ? '<div class="empty-state">No digests yet. The scanner runs daily at 5AM UTC.</div>'
                    : digests.slice(0, 10).map(d => `
                        <a href="#/digest/${d.date}" class="digest-row">
                            <span class="digest-date">${d.date}</span>
                            <div class="digest-meta">
                                <span>${d.totalStored} papers</span>
                                ${d.highPriority > 0 ? `<span style="color:#ef4444;font-weight:600">${d.highPriority} high-priority</span>` : ""}
                            </div>
                        </a>
                    `).join("")}
            </div>
        `;
    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Failed to load dashboard: ${err.message}</p>
                <button class="btn btn-primary" onclick="renderDashboard(document.getElementById('content'))" style="margin-top:12px">Retry</button>
            </div>`;
    }
}
