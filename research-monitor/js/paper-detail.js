// Paper detail view — full paper info with relevance analysis

function renderPaperDetail(container, paperId) {
    container.innerHTML = `
        <div class="paper-detail">
            <div class="loading">
                <div class="spinner"></div>
                <div>Loading paper...</div>
            </div>
        </div>`;

    loadPaperDetail(container, paperId);
}

async function loadPaperDetail(container, paperId) {
    try {
        const paper = await ResearchAPI.getPaper(paperId);

        const sourceLabels = {
            semantic_scholar: "Semantic Scholar",
            openalex: "OpenAlex",
            arxiv: "arXiv",
        };

        container.innerHTML = `
            <div class="paper-detail">
                <a href="#/papers" class="back-link">&larr; Back to papers</a>

                <h1>${escapeHtml(paper.title)}</h1>

                <div class="meta">
                    <span>${(paper.authors || []).join(", ")}</span>
                    <span>&mdash;</span>
                    <span>${paper.publicationDate || "Unknown date"}</span>
                    <span>&mdash;</span>
                    <span>via ${sourceLabels[paper.sourceApi] || paper.sourceApi}</span>
                    ${paper.doi ? `<span>&mdash;</span><a href="https://doi.org/${paper.doi}" target="_blank" rel="noopener">DOI: ${paper.doi}</a>` : ""}
                    ${paper.url ? `<span>&mdash;</span><a href="${paper.url}" target="_blank" rel="noopener">Original</a>` : ""}
                </div>

                <!-- Badges -->
                <div style="margin-bottom:20px;display:flex;gap:8px;flex-wrap:wrap">
                    <span class="badge badge-${paper.category}">${(paper.category || "").replace(/_/g, " ")}</span>
                    <span class="badge badge-${paper.priority}">${paper.priority}</span>
                    <span class="badge" style="background:#4338ca">Score: ${paper.relevanceScore}</span>
                    ${paper.searchTopic ? `<span class="badge" style="background:#374151">Topic: ${paper.searchTopic.replace(/_/g, " ")}</span>` : ""}
                </div>

                <!-- Abstract -->
                <div class="detail-section">
                    <h3>Abstract</h3>
                    <p>${escapeHtml(paper.abstract || "No abstract available.")}</p>
                </div>

                <!-- TLDR -->
                ${paper.tldr ? `
                <div class="detail-section">
                    <h3>TL;DR</h3>
                    <p>${escapeHtml(paper.tldr)}</p>
                </div>` : ""}

                <!-- Key Findings -->
                <div class="detail-section">
                    <h3>Key Findings</h3>
                    <p>${escapeHtml(paper.keyFindings || "No analysis available.")}</p>
                </div>

                <!-- Spectrum Recommendation -->
                <div class="detail-section recommendation-box">
                    <h3>Spectrum Recommendation</h3>
                    <p>${escapeHtml(paper.spectrumRecommendation || "No recommendation available.")}</p>
                </div>
            </div>`;
    } catch (err) {
        container.innerHTML = `
            <div class="paper-detail">
                <a href="#/papers" class="back-link">&larr; Back to papers</a>
                <div class="empty-state">
                    <p>Failed to load paper: ${err.message}</p>
                </div>
            </div>`;
    }
}
