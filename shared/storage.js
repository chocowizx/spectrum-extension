// Spectrum — chrome.storage.local wrapper

const SpectrumStorage = {
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  },

  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  },

  async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  },

  // Get all settings merged with defaults
  async getSettings() {
    const defaults = SPECTRUM.DEFAULTS;
    const stored = await this.get(Object.keys(defaults));
    return { ...defaults, ...stored };
  },

  // Save a single setting
  async saveSetting(key, value) {
    await this.set({ [key]: value });
  },

  // Cache analysis results keyed by URL
  async cacheAnalysis(url, analysis) {
    const cacheKey = `cache_${btoa(url).slice(0, 60)}`;
    await this.set({
      [cacheKey]: {
        analysis,
        timestamp: Date.now(),
        url,
      },
    });
    await this._pruneCache();
  },

  // Get cached analysis for URL (returns null if expired/missing)
  async getCachedAnalysis(url) {
    const cacheKey = `cache_${btoa(url).slice(0, 60)}`;
    const result = await this.get([cacheKey]);
    const cached = result[cacheKey];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > SPECTRUM.CACHE.ANALYSIS_TTL) {
      await this.remove([cacheKey]);
      return null;
    }
    return cached.analysis;
  },

  // Remove oldest cache entries if over limit
  async _pruneCache() {
    const all = await this.get(null);
    const cacheEntries = Object.entries(all)
      .filter(([k]) => k.startsWith("cache_"))
      .map(([k, v]) => ({ key: k, timestamp: v.timestamp || 0 }))
      .sort((a, b) => b.timestamp - a.timestamp);

    if (cacheEntries.length > SPECTRUM.CACHE.MAX_CACHED_PAGES) {
      const toRemove = cacheEntries
        .slice(SPECTRUM.CACHE.MAX_CACHED_PAGES)
        .map((e) => e.key);
      await this.remove(toRemove);
    }
  },

  // Track rate limiting
  async canMakeApiCall() {
    const result = await this.get(["apiCallLog"]);
    const log = result.apiCallLog || [];
    const now = Date.now();
    const recentCalls = log.filter(
      (t) => now - t < 60 * 60 * 1000
    );

    if (recentCalls.length >= SPECTRUM.RATE_LIMIT.MAX_PER_HOUR) {
      return false;
    }

    const lastCall = recentCalls[recentCalls.length - 1] || 0;
    if (now - lastCall < SPECTRUM.RATE_LIMIT.MIN_INTERVAL) {
      return false;
    }

    recentCalls.push(now);
    await this.set({ apiCallLog: recentCalls });
    return true;
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.SpectrumStorage = SpectrumStorage;
}
