// Papers view — searchable/filterable paper list with pagination

let currentFilters = { q: "", category: "", priority: "", page: 1 };

function renderPapers(container) {
    container.innerHTML = `
        <!-- Filters -->
        <div class="filters-bar">
            <input type="text" class="filter-input" id="filter-q" placeholder="Search papers..." value="${currentFilters.q}">
            <select class="filter-select" id="filter-category">
                <option value="">All Categories</option>
                <option value="bias_detection" ${currentFilters.category === "bias_detection" ? "selected" : ""}>Bias Detection</option>
                <option value="fact_checking" ${currentFilters.category === "fact_checking" ? "selected" : ""}>Fact Checking</option>
                <option value="linguistic_framework" ${currentFilters.category === "linguistic_framework" ? "selected" : ""}>Linguistic Framework</option>
                <option value="media_studies" ${currentFilters.category === "media_studies" ? "selected" : ""}>Media Studies</option>
                <option value="nlp_methods" ${currentFilters.category === "nlp_methods" ? "selected" : ""}>NLP Methods</option>
            </select>
            <select class="filter-select" id="filter-priority">
                <option value="">All Priorities</option>
                <option value="high" ${currentFilters.priority === "high" ? "selected" : ""}>High</option>
                <option value="medium" ${currentFilters.priority === "medium" ? "selected" : ""}>Medium</option>
                <option value="low" ${currentFilters.priority === "low" ? "selected" : ""}>Low</option>
            </select>
        </div>

        <!-- Results -->
        <div id="papers-results">
            <div class="loading">
                <div class="spinner"></div>
                <div>Loading papers...</div>
            </div>
        </div>`;

    // Bind filter events
    const qInput = document.getElementById("filter-q");
    const catSelect = document.getElementById("filter-category");
    const priSelect = document.getElementById("filter-priority");

    let debounceTimer;
    qInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentFilters.q = qInput.value;
            currentFilters.page = 1;
            loadPapers();
        }, 300);
    });

    catSelect.addEventListener("change", () => {
        currentFilters.category = catSelect.value;
        currentFilters.page = 1;
        loadPapers();
    });

    priSelect.addEventListener("change", () => {
        currentFilters.priority = priSelect.value;
        currentFilters.page = 1;
        loadPapers();
    });

    loadPapers();
}

async function loadPapers() {
    const resultsEl = document.getElementById("papers-results");
    if (!resultsEl) return;

    resultsEl.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <div>Searching...</div>
        </div>`;

    try {
        const data = await ResearchAPI.searchPapers({
            q: currentFilters.q || undefined,
            category: currentFilters.category || undefined,
            priority: currentFilters.priority || undefined,
            page: currentFilters.page,
            limit: 20,
        });

        const { papers, pagination } = data;

        if (papers.length === 0) {
            resultsEl.innerHTML = `
                <div class="empty-state">
                    <p>No papers found matching your filters.</p>
                </div>`;
            return;
        }

        resultsEl.innerHTML = `
            <div class="paper-list">
                ${papers.map(p => `
                    <div class="paper-row" onclick="window.location.hash='#/paper/${p.id}'">
                        <div>
                            <div class="paper-title">${escapeHtml(p.title)}</div>
                            <div class="paper-authors">${(p.authors || []).slice(0, 3).join(", ")}${(p.authors || []).length > 3 ? " et al." : ""}</div>
                        </div>
                        <div>
                            <span class="badge badge-${p.category}">${(p.category || "").replace(/_/g, " ")}</span>
                            <span class="badge badge-${p.priority}" style="margin-left:4px">${p.priority}</span>
                        </div>
                        <div class="paper-score">${p.relevanceScore}</div>
                        <div class="paper-date">${p.publicationDate || ""}</div>
                    </div>
                `).join("")}
            </div>

            ${pagination.totalPages > 1 ? `
            <div class="pagination">
                <button ${pagination.page <= 1 ? "disabled" : ""} onclick="changePage(${pagination.page - 1})">Prev</button>
                <span class="page-info">Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} papers)</span>
                <button ${pagination.page >= pagination.totalPages ? "disabled" : ""} onclick="changePage(${pagination.page + 1})">Next</button>
            </div>
            ` : `<div style="text-align:center;margin-top:12px;font-size:13px;color:#9ca3af">${pagination.total} papers found</div>`}
        `;
    } catch (err) {
        resultsEl.innerHTML = `
            <div class="empty-state">
                <p>Failed to load papers: ${err.message}</p>
                <button class="btn btn-primary" onclick="loadPapers()" style="margin-top:12px">Retry</button>
            </div>`;
    }
}

function changePage(page) {
    currentFilters.page = page;
    loadPapers();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
