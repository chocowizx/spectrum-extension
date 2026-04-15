// Spectrum — Outlet sentiment baseline data (VADER calibration)
// baseline = typical compound VADER score for this outlet (-1 to +1)
// volatility = how much their sentiment varies article-to-article (0-1)
// tilt = "positive"|"negative"|"neutral" — general emotional direction

const SENTIMENT_BASELINES = {
  // Far Left (tend negative/critical)
  "jacobin.com":        { baseline: -0.35, volatility: 0.25, tilt: "negative" },
  "theintercept.com":   { baseline: -0.30, volatility: 0.30, tilt: "negative" },
  "democracynow.org":   { baseline: -0.28, volatility: 0.20, tilt: "negative" },
  "commondreams.org":   { baseline: -0.32, volatility: 0.22, tilt: "negative" },

  // Left (mild negative)
  "msnbc.com":          { baseline: -0.18, volatility: 0.35, tilt: "negative" },
  "huffpost.com":       { baseline: -0.15, volatility: 0.40, tilt: "negative" },
  "vox.com":            { baseline: -0.08, volatility: 0.25, tilt: "neutral" },
  "theguardian.com":    { baseline: -0.12, volatility: 0.30, tilt: "negative" },
  "motherjones.com":    { baseline: -0.22, volatility: 0.28, tilt: "negative" },
  "salon.com":          { baseline: -0.25, volatility: 0.35, tilt: "negative" },
  "propublica.org":     { baseline: -0.15, volatility: 0.20, tilt: "negative" },

  // Center-Left (slight negative to neutral)
  "nytimes.com":        { baseline: -0.05, volatility: 0.25, tilt: "neutral" },
  "washingtonpost.com": { baseline: -0.08, volatility: 0.28, tilt: "neutral" },
  "cnn.com":            { baseline: -0.12, volatility: 0.40, tilt: "negative" },
  "npr.org":            { baseline:  0.02, volatility: 0.18, tilt: "neutral" },
  "pbs.org":            { baseline:  0.00, volatility: 0.15, tilt: "neutral" },
  "bbc.com":            { baseline: -0.02, volatility: 0.20, tilt: "neutral" },
  "bbc.co.uk":          { baseline: -0.02, volatility: 0.20, tilt: "neutral" },
  "theatlantic.com":    { baseline: -0.06, volatility: 0.25, tilt: "neutral" },
  "politico.com":       { baseline: -0.04, volatility: 0.22, tilt: "neutral" },
  "nbcnews.com":        { baseline: -0.08, volatility: 0.30, tilt: "neutral" },
  "cbsnews.com":        { baseline: -0.05, volatility: 0.28, tilt: "neutral" },
  "abcnews.go.com":     { baseline: -0.05, volatility: 0.28, tilt: "neutral" },
  "axios.com":          { baseline:  0.02, volatility: 0.15, tilt: "neutral" },
  "latimes.com":        { baseline: -0.06, volatility: 0.25, tilt: "neutral" },

  // Center (near zero)
  "reuters.com":        { baseline:  0.00, volatility: 0.12, tilt: "neutral" },
  "apnews.com":         { baseline:  0.00, volatility: 0.10, tilt: "neutral" },
  "thehill.com":        { baseline: -0.03, volatility: 0.25, tilt: "neutral" },
  "bloomberg.com":      { baseline:  0.02, volatility: 0.18, tilt: "neutral" },
  "c-span.org":         { baseline:  0.00, volatility: 0.05, tilt: "neutral" },
  "usatoday.com":       { baseline: -0.02, volatility: 0.22, tilt: "neutral" },
  "foreignpolicy.com":  { baseline: -0.05, volatility: 0.20, tilt: "neutral" },

  // Center-Right (slight positive/neutral)
  "wsj.com":            { baseline:  0.05, volatility: 0.22, tilt: "neutral" },
  "economist.com":      { baseline:  0.02, volatility: 0.18, tilt: "neutral" },
  "forbes.com":         { baseline:  0.08, volatility: 0.30, tilt: "neutral" },
  "nationalreview.com": { baseline: -0.15, volatility: 0.35, tilt: "negative" },
  "reason.com":         { baseline: -0.10, volatility: 0.25, tilt: "negative" },
  "telegraph.co.uk":    { baseline: -0.05, volatility: 0.25, tilt: "neutral" },

  // Right (tend negative/combative)
  "foxnews.com":        { baseline: -0.20, volatility: 0.45, tilt: "negative" },
  "nypost.com":         { baseline: -0.18, volatility: 0.42, tilt: "negative" },
  "dailywire.com":      { baseline: -0.25, volatility: 0.38, tilt: "negative" },
  "dailycaller.com":    { baseline: -0.22, volatility: 0.40, tilt: "negative" },
  "washingtontimes.com":{ baseline: -0.15, volatility: 0.32, tilt: "negative" },
  "thefederalist.com":  { baseline: -0.28, volatility: 0.35, tilt: "negative" },
  "townhall.com":       { baseline: -0.25, volatility: 0.38, tilt: "negative" },
  "theblaze.com":       { baseline: -0.30, volatility: 0.40, tilt: "negative" },
  "dailymail.co.uk":    { baseline: -0.22, volatility: 0.48, tilt: "negative" },

  // Far Right (strongly negative/alarmist)
  "breitbart.com":      { baseline: -0.40, volatility: 0.35, tilt: "negative" },
  "theepochtimes.com":  { baseline: -0.32, volatility: 0.30, tilt: "negative" },
  "oann.com":           { baseline: -0.35, volatility: 0.32, tilt: "negative" },
  "newsmax.com":        { baseline: -0.28, volatility: 0.35, tilt: "negative" },
  "infowars.com":       { baseline: -0.55, volatility: 0.30, tilt: "negative" },

  // Korean outlets
  "chosun.com":         { baseline: -0.08, volatility: 0.30, tilt: "neutral" },
  "joongang.co.kr":     { baseline: -0.06, volatility: 0.28, tilt: "neutral" },
  "donga.com":          { baseline: -0.08, volatility: 0.30, tilt: "neutral" },
  "hani.co.kr":         { baseline: -0.18, volatility: 0.25, tilt: "negative" },
  "khan.co.kr":         { baseline: -0.15, volatility: 0.25, tilt: "negative" },
  "yna.co.kr":          { baseline:  0.00, volatility: 0.12, tilt: "neutral" },
  "news.jtbc.co.kr":    { baseline: -0.05, volatility: 0.25, tilt: "neutral" },
};

/**
 * Returns the sentiment baseline for a domain, or null if not found.
 * Strips leading "www." automatically.
 * @param {string} domain
 * @returns {{ baseline: number, volatility: number, tilt: string }|null}
 */
function getSentimentBaseline(domain) {
  if (!domain) return null;
  var clean = domain.replace(/^www\./, "");
  return SENTIMENT_BASELINES[clean] || null;
}

/**
 * Calculates deviation category for an article score vs outlet baseline.
 * @param {string} domain
 * @param {number} articleScore  VADER compound score (-1 to +1)
 * @returns {{ deviation: number, category: "extreme"|"notable"|"mild"|"typical", baseline: object }|null}
 */
function getSentimentDeviation(domain, articleScore) {
  var baseline = getSentimentBaseline(domain);
  if (!baseline || typeof articleScore !== "number") return null;
  var deviation = Math.abs(articleScore - baseline.baseline);
  var category;
  if (deviation > baseline.volatility * 2) {
    category = "extreme";
  } else if (deviation > baseline.volatility) {
    category = "notable";
  } else if (deviation > baseline.volatility * 0.5) {
    category = "mild";
  } else {
    category = "typical";
  }
  return { deviation: deviation, category: category, baseline: baseline };
}

// Make available for ES module imports (background) and plain scripts (content)
if (typeof globalThis !== "undefined") {
  globalThis.SENTIMENT_BASELINES = SENTIMENT_BASELINES;
  globalThis.getSentimentBaseline = getSentimentBaseline;
  globalThis.getSentimentDeviation = getSentimentDeviation;
}
