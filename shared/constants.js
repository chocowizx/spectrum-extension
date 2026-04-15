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

  // State media types (Upgrade #9 — State Media Detection)
  STATE_MEDIA_TYPE: {
    STATE_OWNED: "state_owned",
    STATE_FUNDED: "state_funded",
    STATE_AFFILIATED: "state_affiliated",
    PUBLIC_BROADCASTER: "public_broadcaster",
  },

  // State media type display labels
  STATE_MEDIA_TYPE_LABELS: {
    state_owned: "State-Owned",
    state_funded: "State-Funded",
    state_affiliated: "State-Affiliated",
    public_broadcaster: "Public Broadcaster",
  },

  // Independence tier colors (based on independenceScore 0-100)
  STATE_MEDIA_COLORS: {
    state_controlled: "#EF4444",  // score < 20  — red
    low: "#F59E0B",               // score 20-39 — amber
    partial: "#60A5FA",           // score 40-64 — blue
    independent: "#22C55E",       // score 65+   — green
  },

  // Soft bias patterns (Upgrade #6)
  SOFT_BIAS_PATTERN: {
    GROUP_DELEGITIMIZATION: "group_delegitimization",
    DEHUMANIZING_METAPHOR: "dehumanizing_metaphor",
    EXCLUSIONARY_FRAMING: "exclusionary_framing",
    IDENTITY_FUSION: "identity_fusion",
  },

  // Bias type classification
  BIAS_TYPE: {
    IDEOLOGICAL: "ideological",
    SPIN: "spin",
    FRAMING: "framing",
    OMISSION: "omission",
  },

  // Sentiment score labels (VADER-style, Upgrade #3)
  SENTIMENT_LABELS: {
    strong_positive: "Strongly Positive",
    mild_positive: "Mildly Positive",
    neutral: "Neutral",
    mild_negative: "Mildly Negative",
    strong_negative: "Strongly Negative",
  },

  // Sentiment baseline deviation labels (VADER calibration)
  SENTIMENT_DEVIATION: {
    EXTREME: "extreme",    // > 2x volatility
    NOTABLE: "notable",    // > 1x volatility
    MILD: "mild",          // > 0.5x volatility
    TYPICAL: "typical",    // within normal range
  },

  SENTIMENT_DEVIATION_COLORS: {
    extreme: "#EF4444",
    notable: "#F59E0B",
    mild: "#60A5FA",
    typical: "#22C55E",
  },

  // Evidence types for explainable verification (Upgrade #10)
  EVIDENCE_TYPE: {
    SUPPORTING: "supporting",
    CONTRADICTING: "contradicting",
    CONTEXTUAL: "contextual",
  },

  // Check priority levels for claim check-worthiness (Upgrade #5)
  CHECK_PRIORITY: {
    URGENT: "urgent",
    RECOMMENDED: "recommended",
    OPTIONAL: "optional",
  },

  // Check priority score thresholds
  CHECK_PRIORITY_THRESHOLD: {
    URGENT: 80,
    RECOMMENDED: 50,
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

  // Fact-check verdict display config (Upgrade #10 — Fact-Check API)
  FACTCHECK_VERDICTS: {
    true: { label: "True", color: "#4ADE80", bg: "rgba(74,222,128,0.08)" },
    mostly_true: { label: "Mostly True", color: "#86EFAC", bg: "rgba(134,239,172,0.08)" },
    half_true: { label: "Half True", color: "#FBBF24", bg: "rgba(251,191,36,0.08)" },
    mostly_false: { label: "Mostly False", color: "#F87171", bg: "rgba(248,113,113,0.08)" },
    false: { label: "False", color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
    pants_on_fire: { label: "Pants on Fire", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
    misleading: { label: "Misleading", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
    unverified: { label: "Unverified", color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
  },

  // Fact-check source trust levels (Upgrade #10 — Fact-Check API)
  FACTCHECK_SOURCES: {
    "PolitiFact":             { trust: "high",   color: "#4ADE80" },
    "Snopes":                 { trust: "high",   color: "#4ADE80" },
    "FactCheck.org":          { trust: "high",   color: "#4ADE80" },
    "Full Fact":              { trust: "high",   color: "#4ADE80" },
    "The Washington Post":    { trust: "high",   color: "#4ADE80" },
    "AP Fact Check":          { trust: "high",   color: "#4ADE80" },
    "Reuters Fact Check":     { trust: "high",   color: "#4ADE80" },
    "AFP Fact Check":         { trust: "high",   color: "#4ADE80" },
    "USA Today":              { trust: "medium", color: "#FBBF24" },
    "Lead Stories":           { trust: "medium", color: "#FBBF24" },
    "Check Your Fact":        { trust: "medium", color: "#FBBF24" },
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
    FACTCHECK_CLAIM: "FACTCHECK_CLAIM",
    ARTICLE_CHANGES: "ARTICLE_CHANGES",
  },

  // Article snapshot / narrative tracking (Upgrade #8)
  SNAPSHOT: {
    STORAGE_KEY: "articleSnapshots",
    MAX_SNAPSHOTS: 500,
    // Minimum body-hash change needed to flag as "content updated"
    BODY_CHANGE_THRESHOLD: true, // any hash diff counts
  },

  // Change type labels for the article-changed banner (Upgrade #8)
  CHANGE_TYPE: {
    HEADLINE: "headline",
    CONTENT: "content",
    LEAN: "lean",
  },

  // Cloud Function URLs (Firebase project: ad-infinitum-2eac8, us-central1)
  API: {
    BASE: "https://us-central1-ad-infinitum-2eac8.cloudfunctions.net",
    ANALYZE: "analyzeArticle",
    PERSPECTIVES: "searchPerspectives",
    INSTALL_ID_KEY: "spectrumInstallId",
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
    DAILY_FAST: 10,
    DAILY_DEEP: 3,
    DAILY_PERSPECTIVES: 20,
  },

  // Credibility levels (Upgrade #2 — CRED-1)
  CREDIBILITY: {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
    UNKNOWN: "unknown",
  },

  // Credibility colors
  CREDIBILITY_COLORS: {
    high: "#22C55E",
    medium: "#F59E0B",
    low: "#EF4444",
    unknown: "#94A3B8",
  },

  // Credibility labels
  CREDIBILITY_LABELS: {
    high: "High Credibility",
    medium: "Medium Credibility",
    low: "Low Credibility",
    unknown: "Unknown Credibility",
  },

  // Ideology cue dimension labels (Upgrade #1 — multi-cue-ideology)
  IDEOLOGY_CUE_LABELS: {
    framingLanguage: "Framing Language",
    citationBias: "Citation Bias",
    emotionalAppeals: "Emotional Appeals",
    topicSelection: "Topic Selection",
    omissionPatterns: "Omission Patterns",
    sourceBalance: "Source Balance",
    narrativeFraming: "Narrative Framing",
  },

  // Spectacle pattern types (spectacle-detection upgrade)
  SPECTACLE_PATTERNS: {
    OUTRAGE_BAIT: "outrage_bait",
    FEAR_MONGERING: "fear_mongering",
    FALSE_URGENCY: "false_urgency",
    EMOTIONAL_MANIPULATION: "emotional_manipulation",
    CLICKBAIT_FRAMING: "clickbait_framing",
    TRIBALISM_TRIGGER: "tribalism_trigger",
    SYNTHETIC_CONTROVERSY: "synthetic_controversy",
  },

  // Spectacle pattern display labels
  SPECTACLE_PATTERN_LABELS: {
    outrage_bait: "Outrage Bait",
    fear_mongering: "Fear Mongering",
    false_urgency: "False Urgency",
    emotional_manipulation: "Emotional Manipulation",
    clickbait_framing: "Clickbait Framing",
    tribalism_trigger: "Tribalism Trigger",
    synthetic_controversy: "Synthetic Controversy",
  },

  // Spectacle UI colors (purple/magenta — distinct from blue-red political lean)
  SPECTACLE_COLORS: {
    primary: "#A855F7",
    secondary: "#D946EF",
    low: "#C084FC",
    medium: "#A855F7",
    high: "#9333EA",
    background: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
    gradient: "linear-gradient(135deg,#A855F7,#D946EF)",
  },

  // Outlet profile consistency score thresholds (Upgrade #11)
  OUTLET_PROFILE: {
    CONSISTENT_THRESHOLD: 75,   // score >= 75 → consistent with outlet baseline
    ANOMALY_THRESHOLD: 40,      // score < 40  → significant deviation from baseline
  },

  // Outlet profile consistency score colors
  OUTLET_PROFILE_COLORS: {
    consistent: "#4ADE80",   // score >= 75 — green
    moderate: "#FBBF24",     // score 40-74 — amber
    anomaly: "#F87171",      // score < 40  — red
  },

  // Persuasion technique types (Upgrade #12)
  PERSUASION_TECHNIQUES: {
    APPEAL_TO_EMOTION: "appeal_to_emotion",
    APPEAL_TO_FEAR: "appeal_to_fear",
    BANDWAGON: "bandwagon",
    FALSE_DILEMMA: "false_dilemma",
    AD_HOMINEM: "ad_hominem",
    STRAW_MAN: "straw_man",
    APPEAL_TO_AUTHORITY: "appeal_to_authority",
    RED_HERRING: "red_herring",
    LOADED_LANGUAGE: "loaded_language",
    WHATABOUTISM: "whataboutism",
    SLIPPERY_SLOPE: "slippery_slope",
    FALSE_EQUIVALENCE: "false_equivalence",
  },

  // Persuasion technique display labels
  PERSUASION_LABELS: {
    appeal_to_emotion: "Appeal to Emotion",
    appeal_to_fear: "Appeal to Fear",
    bandwagon: "Bandwagon",
    false_dilemma: "False Dilemma",
    ad_hominem: "Ad Hominem",
    straw_man: "Straw Man",
    appeal_to_authority: "Appeal to Authority",
    red_herring: "Red Herring",
    loaded_language: "Loaded Language",
    whataboutism: "Whataboutism",
    slippery_slope: "Slippery Slope",
    false_equivalence: "False Equivalence",
  },

  // Persuasion UI colors (orange scheme — distinct from purple spectacle, blue-red lean)
  PERSUASION_COLORS: {
    primary: "#F97316",
    secondary: "#FB923C",
    low: "#FED7AA",
    medium: "#F97316",
    high: "#EA580C",
    background: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
    gradient: "linear-gradient(135deg,#F97316,#EA580C)",
  },

  // Visual framing types (Upgrade #13 — Multimodal Framing Detection)
  VISUAL_FRAMING_TYPE: {
    SYMPATHETIC: "sympathetic",
    NEUTRAL: "neutral",
    UNSYMPATHETIC: "unsympathetic",
    HEROIC: "heroic",
    VILLAINIZING: "villainizing",
  },

  // Visual framing type display labels
  VISUAL_FRAMING_LABELS: {
    sympathetic: "Sympathetic",
    neutral: "Neutral",
    unsympathetic: "Unsympathetic",
    heroic: "Heroic",
    villainizing: "Villainizing",
  },

  // Visual framing type colors
  VISUAL_FRAMING_COLORS: {
    sympathetic: "#4ADE80",
    neutral: "#94A3B8",
    unsympathetic: "#FBBF24",
    heroic: "#60A5FA",
    villainizing: "#F87171",
  },

  // Visual-text consistency score thresholds (Upgrade #13)
  VISUAL_CONSISTENCY: {
    HIGH_THRESHOLD: 70,   // score >= 70 — consistent
    LOW_THRESHOLD: 40,    // score < 40  — contradicting
  },

  // Synthetic media detection types (synthetic-media-detection upgrade)
  SYNTHETIC_INDICATOR: {
    UNIFORMITY: "uniformity",
    HEDGING: "hedging",
    GENERIC_PHRASING: "generic_phrasing",
    MISSING_SPECIFICITY: "missing_specificity",
    ATTRIBUTION_ANOMALY: "attribution_anomaly",
    STRUCTURAL_TELL: "structural_tell",
    STOCK_PHOTO: "stock_photo",
    AI_GENERATED: "ai_generated",
    METADATA_GAP: "metadata_gap",
    CONTENT_SPINNING: "content_spinning",
  },

  // Synthetic media indicator labels
  SYNTHETIC_INDICATOR_LABELS: {
    uniformity: "Style Uniformity",
    hedging: "Excessive Hedging",
    generic_phrasing: "Generic Phrasing",
    missing_specificity: "Missing Specificity",
    attribution_anomaly: "Attribution Anomaly",
    structural_tell: "Structural Tell",
    stock_photo: "Stock Photo",
    ai_generated: "AI-Generated Media",
    metadata_gap: "Metadata Gap",
    content_spinning: "Content Spinning",
  },

  // Synthetic media UI colors (cyan scheme — distinct from other upgrades)
  SYNTHETIC_COLORS: {
    primary: "#06B6D4",
    secondary: "#22D3EE",
    low: "#67E8F9",
    medium: "#06B6D4",
    high: "#0891B2",
    background: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
    gradient: "linear-gradient(135deg,#06B6D4,#0891B2)",
  },

  // Synthetic probability thresholds
  SYNTHETIC_THRESHOLDS: {
    HIGH: 70,      // >= 70: likely synthetic
    MEDIUM: 40,    // >= 40: possibly synthetic
    LOW: 15,       // >= 15: minor concerns
  },

  // Multilingual supported languages (Upgrade #7)
  MULTILINGUAL_LANGUAGES: {
    ko: "Korean",
    es: "Spanish",
    fr: "French",
    de: "German",
    ar: "Arabic",
    ja: "Japanese",
  },

  // Translation bias risk colors (Upgrade #7)
  TRANSLATION_BIAS_COLORS: {
    none: "#22C55E",
    low: "#60A5FA",
    medium: "#F59E0B",
    high: "#EF4444",
  },

  // Multilingual bias UI colors (teal scheme — distinct from other upgrades)
  MULTILINGUAL_COLORS: {
    primary: "#14B8A6",
    secondary: "#2DD4BF",
    background: "rgba(20,184,166,0.08)",
    border: "rgba(20,184,166,0.2)",
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
