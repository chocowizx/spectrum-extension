// Spectrum — State-affiliated media database (Upgrade #9 — State Media Detection)
// independenceScore: 0-100 (0 = pure state mouthpiece, 100 = fully independent)
// type: "state_owned" | "state_funded" | "state_affiliated" | "public_broadcaster"

const STATE_MEDIA_DB = {
  // Russia
  "rt.com":            { state: "Russia",  type: "state_funded",      fundingSource: "Russian government",         independenceScore: 8  },
  "sputniknews.com":   { state: "Russia",  type: "state_owned",       fundingSource: "Rossiya Segodnya",           independenceScore: 5  },
  "tass.com":          { state: "Russia",  type: "state_owned",       fundingSource: "Russian government",         independenceScore: 5  },
  "ria.ru":            { state: "Russia",  type: "state_owned",       fundingSource: "Rossiya Segodnya",           independenceScore: 5  },

  // China
  "cgtn.com":          { state: "China",   type: "state_owned",       fundingSource: "China Central Television",   independenceScore: 5  },
  "xinhuanet.com":     { state: "China",   type: "state_owned",       fundingSource: "State Council of China",     independenceScore: 5  },
  "globaltimes.cn":    { state: "China",   type: "state_affiliated",  fundingSource: "People's Daily",             independenceScore: 8  },
  "chinadaily.com.cn": { state: "China",   type: "state_owned",       fundingSource: "Propaganda Dept. of CPC",   independenceScore: 8  },
  "people.com.cn":     { state: "China",   type: "state_owned",       fundingSource: "People's Daily Group",       independenceScore: 5  },

  // Iran
  "presstv.ir":        { state: "Iran",    type: "state_owned",       fundingSource: "IRIB (Islamic Republic)",    independenceScore: 5  },
  "irna.ir":           { state: "Iran",    type: "state_owned",       fundingSource: "Iranian government",         independenceScore: 8  },

  // Turkey
  "trtworld.com":      { state: "Turkey",  type: "state_owned",       fundingSource: "TRT (Turkish Radio-TV)",     independenceScore: 15 },
  "anadoluajansi.com": { state: "Turkey",  type: "state_owned",       fundingSource: "Turkish government",         independenceScore: 18 },
  "aa.com.tr":         { state: "Turkey",  type: "state_owned",       fundingSource: "Turkish government",         independenceScore: 18 },

  // Qatar
  "aljazeera.com":     { state: "Qatar",   type: "state_funded",      fundingSource: "Qatari government (Al Jazeera Media Network)", independenceScore: 38 },
  "aljazeera.net":     { state: "Qatar",   type: "state_funded",      fundingSource: "Qatari government",          independenceScore: 38 },

  // Saudi Arabia
  "arabnews.com":      { state: "Saudi Arabia", type: "state_affiliated", fundingSource: "Saudi Research & Media Group", independenceScore: 20 },
  "saudigazette.com.sa": { state: "Saudi Arabia", type: "state_affiliated", fundingSource: "Saudi government",       independenceScore: 18 },

  // UAE
  "thenationalnews.com": { state: "UAE",   type: "state_affiliated",  fundingSource: "Abu Dhabi Media",            independenceScore: 28 },

  // North Korea
  "kcna.kp":           { state: "North Korea", type: "state_owned",   fundingSource: "Korean Central News Agency", independenceScore: 0  },

  // France
  "france24.com":      { state: "France",  type: "state_owned",       fundingSource: "France Médias Monde",        independenceScore: 62 },
  "rfi.fr":            { state: "France",  type: "state_owned",       fundingSource: "France Médias Monde",        independenceScore: 60 },

  // Germany
  "dw.com":            { state: "Germany", type: "public_broadcaster", fundingSource: "Federal + state taxes",      independenceScore: 74 },

  // UK
  "bbc.com":           { state: "UK",      type: "public_broadcaster", fundingSource: "TV licence fee",             independenceScore: 76 },
  "bbc.co.uk":         { state: "UK",      type: "public_broadcaster", fundingSource: "TV licence fee",             independenceScore: 76 },

  // Japan
  "nhk.or.jp":         { state: "Japan",   type: "public_broadcaster", fundingSource: "NHK receiving fees",         independenceScore: 70 },

  // South Korea
  "kbs.co.kr":         { state: "South Korea", type: "public_broadcaster", fundingSource: "TV licence + gov subsidy", independenceScore: 62 },
  "news.kbs.co.kr":    { state: "South Korea", type: "public_broadcaster", fundingSource: "TV licence + gov subsidy", independenceScore: 62 },
  "arirang.com":       { state: "South Korea", type: "state_owned",    fundingSource: "Korean government (KBS)",    independenceScore: 55 },
  "yna.co.kr":         { state: "South Korea", type: "state_affiliated", fundingSource: "Yonhap News Agency (gov-funded)", independenceScore: 58 },

  // Venezuela
  "telesurtv.net":     { state: "Venezuela", type: "state_owned",     fundingSource: "Venezuelan + allied govts",  independenceScore: 10 },

  // Cuba
  "granma.cu":         { state: "Cuba",    type: "state_owned",       fundingSource: "Cuban Communist Party",      independenceScore: 2  },

  // Belarus
  "belta.by":          { state: "Belarus", type: "state_owned",       fundingSource: "Belarusian government",      independenceScore: 5  },

  // Singapore
  "channelnewsasia.com": { state: "Singapore", type: "state_affiliated", fundingSource: "Mediacorp (govt-linked)", independenceScore: 52 },

  // Australia
  "abc.net.au":        { state: "Australia", type: "public_broadcaster", fundingSource: "Federal government grant", independenceScore: 78 },

  // Canada
  "cbc.ca":            { state: "Canada",  type: "public_broadcaster", fundingSource: "Parliamentary appropriation", independenceScore: 76 },
};

/**
 * Soft power framing patterns detected by Claude
 * These are the pattern keys Claude will use in stateMediaAnalysis.softPowerPatterns
 */
const SOFT_POWER_PATTERNS = {
  cooperation_framing:      "Cooperation Framing",
  modernization_narrative:  "Modernization Narrative",
  peaceful_development:     "Peaceful Development",
  whataboutism:             "Whataboutism",
  deflection:               "Deflection",
  cultural_superiority:     "Cultural Superiority",
  victim_narrative:         "Victim Narrative",
  multilateralism_appeal:   "Multilateralism Appeal",
};

/**
 * Get state media data for a domain.
 * @param {string} domain - cleaned domain (no www.)
 * @returns {object|null}
 */
function getStateMediaInfo(domain) {
  return STATE_MEDIA_DB[domain] || null;
}

/**
 * Get independence tier label from score.
 * @param {number} score - 0-100
 * @returns {"state_controlled"|"low"|"partial"|"independent"}
 */
function getIndependenceTier(score) {
  if (score < 20)  return "state_controlled";
  if (score < 40)  return "low";
  if (score < 65)  return "partial";
  return "independent";
}

// Make available for service worker (importScripts) and content scripts (plain script tag)
if (typeof globalThis !== "undefined") {
  globalThis.STATE_MEDIA_DB = STATE_MEDIA_DB;
  globalThis.SOFT_POWER_PATTERNS = SOFT_POWER_PATTERNS;
  globalThis.getStateMediaInfo = getStateMediaInfo;
  globalThis.getIndependenceTier = getIndependenceTier;
}
