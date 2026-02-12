// Spectrum — shared constants
// Used by both content scripts and background service worker

const SPECTRUM = {
  // Sensitivity levels
  SENSITIVITY: {
    STRICT: "strict",
    STANDARD: "standard",
    AGGRESSIVE: "aggressive",
  },

  // Dashboard positions
  POSITION: {
    RIGHT: "right",
    BOTTOM: "bottom",
  },

  // Claim severity levels
  SEVERITY: {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  },

  // Claim types
  CLAIM_TYPE: {
    CONTENTIOUS: "contentious",
    UNSUPPORTED: "unsupported",
    MISLEADING: "misleading",
    OPINION_AS_FACT: "opinion_as_fact",
    OMISSION: "omission",
    VERIFIED: "verified",
    NEUTRAL: "neutral",
  },

  // Bias indicator patterns
  BIAS_PATTERN: {
    LOADED_LANGUAGE: "loaded_language",
    FALSE_BALANCE: "false_balance",
    CHERRY_PICKING: "cherry_picking",
    APPEAL_TO_EMOTION: "appeal_to_emotion",
    FRAMING: "framing",
  },

  // Intent classification types (Upgrade #9)
  INTENT_TYPE: {
    INFORMATIVE: "informative",
    ADVOCACY: "advocacy",
    PERSUASION: "persuasion",
    MANIPULATION: "manipulation",
  },

  // Soft bias patterns (Upgrade #6)
  SOFT_BIAS_PATTERN: {
    GROUP_DELEGITIMIZATION: "group_delegitimization",
    DEHUMANIZING_METAPHOR: "dehumanizing_metaphor",
    EXCLUSIONARY_FRAMING: "exclusionary_framing",
    IDENTITY_FUSION: "identity_fusion",
  },

  // Evidence types for explainable verification (Upgrade #10)
  EVIDENCE_TYPE: {
    SUPPORTING: "supporting",
    CONTRADICTING: "contradicting",
    CONTEXTUAL: "contextual",
  },

  // Political lean categories
  LEAN: {
    FAR_LEFT: "farLeft",
    LEFT: "left",
    CENTER_LEFT: "centerLeft",
    CENTER: "center",
    CENTER_RIGHT: "centerRight",
    RIGHT: "right",
    FAR_RIGHT: "farRight",
  },

  // Lean display labels
  LEAN_LABELS: {
    farLeft: "Far Left",
    left: "Left",
    centerLeft: "Center-Left",
    center: "Center",
    centerRight: "Center-Right",
    right: "Right",
    farRight: "Far Right",
  },

  // Lean colors
  LEAN_COLORS: {
    farLeft: "#6B21A8",
    left: "#2563EB",
    centerLeft: "#0891B2",
    center: "#6B7280",
    centerRight: "#D97706",
    right: "#DC2626",
    farRight: "#991B1B",
  },

  // Severity colors
  SEVERITY_COLORS: {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#3B82F6",
  },

  // Fact check verdicts
  VERDICT: {
    MOSTLY_TRUE: "mostly_true",
    MIXED: "mixed",
    MISLEADING: "misleading",
    UNVERIFIED: "unverified",
  },

  // Message types for chrome.runtime messaging
  MSG: {
    CHECK_PAGE: "CHECK_PAGE",
    PAGE_SIGNALS: "PAGE_SIGNALS",
    NEWS_DETECTED: "NEWS_DETECTED",
    EXTRACT_ARTICLE: "EXTRACT_ARTICLE",
    ARTICLE_DATA: "ARTICLE_DATA",
    ANALYZE_REQUEST: "ANALYZE_REQUEST",
    ANALYSIS_RESULT: "ANALYSIS_RESULT",
    ANALYSIS_ERROR: "ANALYSIS_ERROR",
    GET_PERSPECTIVES: "GET_PERSPECTIVES",
    PERSPECTIVES_RESULT: "PERSPECTIVES_RESULT",
    GET_STATUS: "GET_STATUS",
    STATUS_RESPONSE: "STATUS_RESPONSE",
    TOGGLE_ENABLED: "TOGGLE_ENABLED",
    SETTINGS_CHANGED: "SETTINGS_CHANGED",
  },

  // Cloud Function URLs (Firebase project: ad-infinitum-2eac8, us-central1)
  API: {
    BASE: "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net",
    ANALYZE: "analyzeArticle",
    PERSPECTIVES: "searchPerspectives",
  },

  // Cache settings
  CACHE: {
    ANALYSIS_TTL: 24 * 60 * 60 * 1000, // 24 hours in ms
    MAX_CACHED_PAGES: 100,
  },

  // Rate limiting
  RATE_LIMIT: {
    MIN_INTERVAL: 2000, // min ms between API calls
    MAX_PER_HOUR: 30,
  },

  // Default settings
  DEFAULTS: {
    sensitivity: "standard",
    dashboardPosition: "right",
    dashboardTransparency: 0.92,
    dashboardWidth: 380,
    includedSites: [],
    excludedSites: [],
    enabled: true,
    lastAggregation: null,
  },
};

// Make available for ES module imports (background) and plain scripts (content)
if (typeof globalThis !== "undefined") {
  globalThis.SPECTRUM = SPECTRUM;
}
