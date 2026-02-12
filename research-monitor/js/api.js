// API client for Spectrum Research Monitor
// Calls the searchResearch Cloud Function

const API_BASE = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net/searchResearch";
const UPGRADES_API = "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net/compileUpgrades";

const ResearchAPI = {
    async _fetch(params) {
        const qs = new URLSearchParams(params).toString();
        const url = `${API_BASE}?${qs}`;
        const response = await fetch(url);
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "API request failed");
        }
        return response.json();
    },

    async getStats() {
        return this._fetch({ action: "stats" });
    },

    async getDigests() {
        return this._fetch({ action: "digest" });
    },

    async getDigest(date) {
        return this._fetch({ action: "digest", date });
    },

    async searchPapers({ q, category, priority, from, to, page, limit } = {}) {
        const params = { action: "search" };
        if (q) params.q = q;
        if (category) params.category = category;
        if (priority) params.priority = priority;
        if (from) params.from = from;
        if (to) params.to = to;
        if (page) params.page = page;
        if (limit) params.limit = limit;
        return this._fetch(params);
    },

    async getPaper(id) {
        // Fetch from Firestore client-side for single paper detail
        // (the search endpoint strips abstracts for performance)
        const db = firebase.firestore();
        const doc = await db.collection("researchPapers").doc(id).get();
        if (!doc.exists) throw new Error("Paper not found");
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            scannedAt: data.scannedAt?.toDate?.()?.toISOString() || null,
        };
    },

    async getNotification() {
        return this._fetch({ action: "notification" });
    },

    async markNotificationSeen() {
        return this._fetch({ action: "markSeen" });
    },

    async getLatestUpgrades() {
        const response = await fetch(UPGRADES_API);
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Failed to fetch upgrades");
        }
        return response.json();
    },

    async getUpgradesList() {
        const response = await fetch(`${UPGRADES_API}?action=list`);
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Failed to fetch upgrades list");
        }
        return response.json();
    },

    async compileUpgrades() {
        const response = await fetch(UPGRADES_API, { method: "POST" });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Compilation failed");
        }
        return response.json();
    },
};
