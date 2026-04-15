// Spectrum — Bilingual label system (EN/KO)
// Usage: L("claimType_contentious") → "논쟁적" (if __spectrumLang === "ko")

var __spectrumLang = "en";

var SPECTRUM_LABELS = {
  // === Lean labels ===
  lean_farLeft:     { en: "Far Left",     ko: "극좌" },
  lean_left:        { en: "Left",         ko: "좌파" },
  lean_centerLeft:  { en: "Center-Left",  ko: "중도좌파" },
  lean_center:      { en: "Center",       ko: "중도" },
  lean_centerRight: { en: "Center-Right", ko: "중도우파" },
  lean_right:       { en: "Right",        ko: "우파" },
  lean_farRight:    { en: "Far Right",    ko: "극우" },

  // === Lean labels (display, with scores) ===
  lean_scaleLeft:   { en: "Left (-1.0)",   ko: "좌 (-1.0)" },
  lean_scaleCenter: { en: "Center",        ko: "중도" },
  lean_scaleRight:  { en: "Right (+1.0)",  ko: "우 (+1.0)" },

  // === Perspective lean labels ===
  perspLean_left:   { en: "Left-Leaning",  ko: "좌파 성향" },
  perspLean_center: { en: "Centrist",      ko: "중도 성향" },
  perspLean_right:  { en: "Right-Leaning", ko: "우파 성향" },

  // === Intent classification ===
  intent_informative:  { en: "Informative",  ko: "정보 전달" },
  intent_advocacy:     { en: "Advocacy",     ko: "옹호" },
  intent_persuasion:   { en: "Persuasion",   ko: "설득" },
  intent_manipulation: { en: "Manipulation", ko: "조작" },

  // === Commentary categories ===
  commentary_implication: { en: "Implication", ko: "함의" },
  commentary_scope:       { en: "Scope",       ko: "범위" },
  commentary_relevance:   { en: "Relevance",   ko: "관련성" },
  commentary_facticity:   { en: "Facticity",   ko: "사실성" },
  commentary_controversy: { en: "Controversy", ko: "논쟁" },
  commentary_bias:        { en: "Bias",        ko: "편향" },

  // === Claim types ===
  claimType_contentious:    { en: "Contentious",    ko: "논쟁적" },
  claimType_unsupported:    { en: "Unsupported",    ko: "근거 부족" },
  claimType_misleading:     { en: "Misleading",     ko: "오도적" },
  claimType_opinion_as_fact:{ en: "Opinion as fact", ko: "의견의 사실화" },
  claimType_omission:       { en: "Omission",       ko: "누락" },
  claimType_verified:       { en: "Verified",       ko: "검증됨" },
  claimType_neutral:        { en: "Neutral",        ko: "중립" },

  // === Severity ===
  severity_high:   { en: "high",   ko: "높음" },
  severity_medium: { en: "medium", ko: "중간" },
  severity_low:    { en: "low",    ko: "낮음" },

  // === Verdicts ===
  verdict_accurate:       { en: "Accurate",       ko: "정확" },
  verdict_mostly_accurate:{ en: "Mostly Accurate", ko: "대체로 정확" },
  verdict_lacks_context:  { en: "Lacks Context",  ko: "맥락 부족" },
  verdict_misleading:     { en: "Misleading",     ko: "오도적" },
  verdict_opinion:        { en: "Opinion",        ko: "의견" },
  verdict_unverifiable:   { en: "Unverifiable",   ko: "검증 불가" },

  // === Journalism quality ===
  quality_solid:        { en: "Solid Journalism",    ko: "견실한 보도" },
  quality_fair:         { en: "Generally Fair",      ko: "대체로 공정" },
  quality_mixed:        { en: "Mixed Practice",      ko: "혼합적" },
  quality_questionable: { en: "Questionable",        ko: "의문스러움" },
  quality_poor:         { en: "Poor Journalism",     ko: "부실한 보도" },

  // === Check-worthiness ===
  checkWorth_high:  { en: "High priority",  ko: "높은 우선순위" },
  checkWorth_mid:   { en: "Worth checking", ko: "확인 필요" },
  checkWorth_low:   { en: "Low priority",   ko: "낮은 우선순위" },

  // === Polarization ===
  pol_extreme:  { en: "Extreme",  ko: "극단적" },
  pol_high:     { en: "High",     ko: "높음" },
  pol_moderate: { en: "Moderate", ko: "보통" },
  pol_low:      { en: "Low",      ko: "낮음" },

  // === Spin ===
  spin_heavy:   { en: "Heavy",   ko: "과도함" },
  spin_notable: { en: "Notable", ko: "주목할만함" },
  spin_mild:    { en: "Mild",    ko: "가벼움" },
  spin_minimal: { en: "Minimal", ko: "최소" },

  // === Perspective diversity ===
  diversity_comprehensive:  { en: "Comprehensive",   ko: "포괄적" },
  diversity_moderate:       { en: "Moderate",         ko: "보통" },
  diversity_limited:        { en: "Limited",          ko: "제한적" },
  diversity_monoPerspective:{ en: "Mono-perspective", ko: "단일 관점" },

  // === Omission ===
  omission_critical: { en: "Critical", ko: "심각" },
  omission_notable:  { en: "Notable",  ko: "주목할만함" },
  omission_minor:    { en: "Minor",    ko: "경미" },
  omission_minimal:  { en: "Minimal",  ko: "최소" },

  // === Tags ===
  tag_data:        { en: "DATA",        ko: "데이터" },
  tag_gap:         { en: "GAP",         ko: "빈틈" },
  tag_bias:        { en: "BIAS",        ko: "편향" },
  tag_transcript:  { en: "TRANSCRIPT",  ko: "자막" },
  tag_stakeholder: { en: "STAKEHOLDER", ko: "이해관계자" },
  tag_context:     { en: "CONTEXT",     ko: "맥락" },
  tag_evidence:    { en: "EVIDENCE",    ko: "증거" },

  // === Section headers ===
  header_overview:         { en: "Overview",                ko: "개요" },
  header_claims:           { en: "Claims Analysis",         ko: "주장 분석" },
  header_biasIndicators:   { en: "Bias Indicators",         ko: "편향 지표" },
  header_hiddenAssumptions:{ en: "Hidden Assumptions",      ko: "숨겨진 가정" },
  header_softBias:         { en: "Soft Bias Patterns",      ko: "은밀한 편향" },
  header_omission:         { en: "Omission Analysis",       ko: "누락 분석" },
  header_imageFraming:     { en: "Image Framing Analysis",  ko: "이미지 프레이밍 분석" },
  header_videoTranscript:  { en: "Video Transcript Analysis",ko: "영상 자막 분석" },

  // === Side panel headers ===
  side_keyData:          { en: "Key Data Points",    ko: "주요 데이터" },
  side_informationGaps:  { en: "Information Gaps",   ko: "정보 공백" },
  side_biasPatterns:     { en: "Bias Patterns Found", ko: "발견된 편향 패턴" },
  side_omissionSummary:  { en: "Omission Summary",   ko: "누락 요약" },
  side_evidenceStrength: { en: "Evidence Strength",   ko: "증거 강도" },
  side_methodology:      { en: "Methodology",         ko: "분석 방법론" },
  side_sourceProfile:    { en: "Source Profile",       ko: "매체 프로필" },
  side_referencedSources:{ en: "Referenced Sources",   ko: "참고 출처" },
  side_claimsBreakdown:  { en: "Claims Breakdown",    ko: "주장 유형 분포" },
  side_perspectiveBalance:{ en: "Perspective Balance", ko: "관점 균형" },

  // === Metric labels ===
  metric_spin:               { en: "Spin",                 ko: "스핀" },
  metric_intent:             { en: "Intent",               ko: "의도" },
  metric_polarization:       { en: "Polarization",         ko: "양극화" },
  metric_perspectiveDiversity:{ en: "Perspective Diversity",ko: "관점 다양성" },
  metric_omissionScore:      { en: "Omission Score",       ko: "누락 점수" },
  metric_diversityScore:     { en: "Diversity Score",      ko: "다양성 점수" },
  metric_confidence:         { en: "Confidence",           ko: "신뢰도" },

  // === Meta labels ===
  meta_source:     { en: "Source: ",     ko: "매체: " },
  meta_lean:       { en: "Lean: ",       ko: "성향: " },
  meta_confidence: { en: "Confidence: ", ko: "신뢰도: " },
  meta_leanScore:  { en: "Lean score: ", ko: "성향 점수: " },
  meta_editorialLean: { en: "Editorial lean", ko: "편집 성향" },

  // === Badges ===
  badge_deep:        { en: "DEEP ANALYSIS",         ko: "심층 분석" },
  badge_quickDeep:   { en: "QUICK — DEEP LOADING…", ko: "빠른 분석 — 심층 로딩 중…" },
  badge_quick:       { en: "QUICK ANALYSIS",         ko: "빠른 분석" },

  // === Buttons ===
  btn_viewDetails:  { en: "▼ View Details",       ko: "▼ 상세 보기" },
  btn_deepAnalysis: { en: "✨ Deep Analysis",      ko: "✨ 심층 분석" },
  btn_fullDeep:     { en: "✨ Full Deep Analysis",  ko: "✨ 전체 심층 분석" },
  btn_close:        { en: "Close",                  ko: "닫기" },

  // === Status messages ===
  status_analyzing:     { en: "Analyzing…",              ko: "분석 중…" },
  status_liveAnalysis:  { en: "Live analysis",           ko: "실시간 분석" },
  status_unavailable:   { en: "Analysis unavailable",    ko: "분석 불가" },
  status_tooShort:      { en: "Too short to analyze",    ko: "분석하기에 너무 짧음" },
  status_frontPage:     { en: "Front page analysis",     ko: "1면 분석" },
  status_frontPageAnalyzing: { en: "Analyzing front page…", ko: "1면 분석 중…" },
  status_evaluating:    { en: "Evaluating…",             ko: "평가 중…" },
  status_deepInProgress:{ en: "Deep analysis in progress",ko: "심층 분석 진행 중" },
  status_renderingQuick:{ en: "Rendering quick analysis…",ko: "빠른 분석 렌더링 중…" },
  status_runningDeep:   { en: "Running deep analysis…",   ko: "심층 분석 실행 중…" },
  status_loadingData:   { en: "Loading article data…",    ko: "기사 데이터 로드 중…" },

  // === Tab labels ===
  tab_summary:    { en: "Summary",       ko: "요약" },
  tab_transcript: { en: "▶ Transcript",  ko: "▶ 자막" },

  // === Counter text ===
  counter_flaggedClaim:  { en: " flagged claim",  ko: "건의 주장 검토됨" },
  counter_flaggedClaims: { en: " flagged claims",  ko: "건의 주장 검토됨" },
  counter_notes:         { en: " notes",            ko: "건의 해설" },
  counter_segments:      { en: " segments",         ko: "개의 구간" },
  counter_identified:    { en: " identified",       ko: "건 확인됨" },
  counter_words:         { en: " words",            ko: "단어" },

  // === Insight/tip messages ===
  tip_scrutiny:    { en: "Several claims need scrutiny — cross-reference before sharing.",
                     ko: "여러 주장이 검증이 필요합니다 — 공유 전 교차 확인하세요." },
  tip_manipulative:{ en: "This article uses manipulative framing — read critically.",
                     ko: "이 기사는 조작적 프레이밍을 사용합니다 — 비판적으로 읽으세요." },
  tip_persuasion:  { en: "This article aims to persuade — note which evidence is omitted.",
                     ko: "이 기사는 설득을 목적으로 합니다 — 어떤 근거가 생략되었는지 주목하세요." },
  tip_reliable:    { en: "Most claims are well-sourced — a relatively reliable piece.",
                     ko: "대부분의 주장이 출처가 명확합니다 — 비교적 신뢰할 수 있는 기사입니다." },
  tip_noFlags:     { en: "No major red flags found — standard reporting.",
                     ko: "주요 문제 없음 — 일반적인 보도입니다." },

  // === Scale labels ===
  scale_poor:  { en: "Poor",  ko: "부실" },
  scale_mixed: { en: "Mixed", ko: "혼합" },
  scale_solid: { en: "Solid", ko: "견실" },

  // === Perspective pills ===
  persp_present: { en: "Present", ko: "포함됨" },
  persp_missing: { en: "Missing", ko: "누락됨" },

  // === Depth descriptions ===
  depth_deepDesc:  { en: "Full comprehensive scan complete",   ko: "전체 종합 스캔 완료" },
  depth_quickDesc: { en: "Deep analysis loading below…",       ko: "아래에서 심층 분석 로딩 중…" },

  // === Error messages ===
  error_noData: { en: "No article data received. Please try again from the article page.",
                  ko: "기사 데이터가 없습니다. 기사 페이지에서 다시 시도해주세요." },

  // === Methodology ===
  methodology_desc: {
    en: "Analysis grounded in established media studies frameworks: Herman & Chomsky's propaganda model, Entman's framing theory, and AllSides/Ad Fontes media bias classifications.",
    ko: "허만과 촘스키의 프로파간다 모델, 엔트먼의 프레이밍 이론, AllSides/Ad Fontes 미디어 편향 분류에 기반한 분석입니다."
  },
};

function spectrumLabel(key, lang) {
  var entry = SPECTRUM_LABELS[key];
  if (!entry) return key;
  var l = lang || __spectrumLang || "en";
  return entry[l] || entry.en || key;
}

// Short alias
var L = spectrumLabel;

if (typeof globalThis !== "undefined") {
  globalThis.SPECTRUM_LABELS = SPECTRUM_LABELS;
  globalThis.spectrumLabel = spectrumLabel;
  globalThis.L = L;
  globalThis.__spectrumLang = __spectrumLang;
}
