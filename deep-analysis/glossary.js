(function () {
  window.DA = window.DA || {};

  var TOOLS = [
    {
      name: "Lean Score",
      color: "#818CF8",
      what: "Scores the article\u2019s political framing on a continuous scale from \u22121.0 (far left) to +1.0 (far right). Unlike static source ratings that label an entire outlet, this evaluates the specific article you\u2019re reading. It looks at which policies are presented favorably, which sources are cited, and how the framing tilts \u2014 so a piece from a left-leaning outlet can still score centrist if the writing itself is balanced.",
      why: "Most media bias tools give you a fixed label for a source and call it a day. But outlets publish a range of articles \u2014 some straight reporting, some opinion, some advocacy. The lean score lets you see where this particular piece lands, not where the outlet lands on average. That distinction matters when you\u2019re evaluating whether the information in front of you right now is being presented fairly."
    },
    {
      name: "Spin Score",
      color: "#FB923C",
      what: "Measures emotional sensationalism independently from political direction. It picks up on exaggerated language, clickbait framing, fear and outrage tactics, and dramatic presentation that amplifies a story beyond what the facts support. A dry Reuters wire report scores near 0. A breathless \u201CBREAKING: Everything You Know Is Wrong\u201D piece scores near 100. Crucially, spin has nothing to do with left or right \u2014 a centrist article can be full of hype, and a strongly partisan one can be calm and evidence-based.",
      why: "People often conflate \u201Cbiased\u201D with \u201Cemotional,\u201D but they\u2019re separate problems. An article can be politically neutral yet wildly sensational, or it can take a clear political position while remaining measured and substantive. Separating spin from lean helps you tell the difference between an article that\u2019s trying to inform you with a perspective and one that\u2019s trying to get a reaction out of you."
    },
    {
      name: "Intent Classification",
      color: "#4ADE80",
      what: "Classifies the article into one of four categories based on structural and rhetorical patterns. Informative: presents facts without pushing a position, balanced sourcing. Advocacy: takes a clear stance but plays fair \u2014 acknowledges counterarguments, relies on evidence. Persuasion: cherry-picks facts, emphasizes what supports the narrative, downplays what doesn\u2019t. Manipulation: actively misleads through misrepresented sources, emotional exploitation, or delegitimizing opposition.",
      why: "The same topic can be covered in radically different ways depending on what the author is trying to achieve. A story about a new policy could be a straightforward explainer, a well-argued editorial, a one-sided sales pitch, or a piece designed to make you angry. Knowing which one you\u2019re reading changes how you should weigh every claim inside it. Intent doesn\u2019t tell you if the article is right or wrong \u2014 it tells you how to read it."
    },
    {
      name: "Polarization Intensity",
      color: "#FBBF24",
      what: "Detects how aggressively the article frames issues as tribal conflicts between opposing groups. It looks for us-vs-them language, sacred values rhetoric (treating compromise as betrayal), in-group/out-group identity activation, and framing that reduces complex policy to team loyalty. Low scores mean the article focuses on substance \u2014 data, tradeoffs, specifics. High scores mean it\u2019s activating group identity: \u201Cwe\u201D versus \u201Cthey,\u201D good versus evil.",
      why: "Polarized framing is one of the most effective tools for shaping opinion because it bypasses critical thinking entirely. When an article makes you feel like your identity is under attack, you stop evaluating claims and start defending your team. This score helps you notice when that\u2019s happening. A high polarization score doesn\u2019t mean the article is factually wrong \u2014 it means the article is structured to make you react emotionally rather than think carefully."
    },
    {
      name: "Perspective Diversity",
      color: "#4ADE80",
      what: "Evaluates how many genuinely distinct viewpoints are represented in the article. It identifies which stakeholders are quoted or referenced, which perspectives are absent, and whether the present viewpoints receive roughly equal treatment or if one narrative dominates. An article can quote five sources and still score low if all five agree \u2014 diversity means actual disagreement and representation, not just a long list of names.",
      why: "Balanced reporting doesn\u2019t mean giving equal time to every opinion \u2014 but it does mean acknowledging that affected parties, experts, and opposing views exist. When an article only tells one side, you\u2019re not getting the full picture even if everything stated is technically true. The missing perspectives list shows you exactly who\u2019s been left out of the conversation, so you can seek those viewpoints yourself if they matter to you."
    },
    {
      name: "Claims Analysis",
      color: "#60A5FA",
      what: "Extracts individual factual statements from the article and classifies each one. Contentious: debatable claims presented without sufficient nuance. Misleading: technically true but framed to create a false impression. Unsupported: stated as fact without evidence. Opinion as fact: value judgments dressed up as objective statements. Verified: claims that look suspicious at first glance but are actually well-supported. Neutral: key factual anchors \u2014 statistics, dates, documented events \u2014 that form the backbone of the article. Each claim is traced to real, named sources that support or contradict it.",
      why: "An article is made of dozens of individual claims, and they\u2019re not all equal. Some are rock-solid facts, some are reasonable interpretations, and some are quietly misleading. Reading an article as one undifferentiated block means the strong claims prop up the weak ones \u2014 you trust the whole thing because parts of it are true. Breaking it into individual claims lets you see exactly where the article is on solid ground and where it\u2019s stretching."
    },
    {
      name: "Check-Worthiness",
      color: "#F87171",
      what: "Assigns a 0\u2013100 score to each individual claim based on how urgently it deserves fact-checking. The score weighs three factors: Is the claim actually verifiable (not just an opinion)? Would it matter if it were wrong (high impact)? Could it cause harm if people believe it uncritically? Pure opinions and well-established facts score low. Specific, impactful claims that could go either way score high.",
      why: "You can\u2019t fact-check everything \u2014 and you shouldn\u2019t have to. Most statements in a news article are either clearly opinions, already well-documented, or too vague to verify. Check-worthiness acts as a triage system: it highlights the claims where your effort would actually make a difference, so you can focus your critical thinking where it counts instead of spreading it thin."
    },
    {
      name: "Bias Indicators",
      color: "#A78BFA",
      what: "Identifies specific language patterns that influence how you interpret information without you necessarily realizing it. Loaded language: words carrying emotional weight beyond their literal meaning (\u201Cslammed\u201D instead of \u201Ccriticized\u201D). Cherry-picking: presenting real data selectively to support a predetermined conclusion. False balance: giving fringe positions equal weight to established consensus. Appeal to emotion: substituting feelings for evidence. Framing: structuring the narrative so certain interpretations feel natural and others feel absurd.",
      why: "These patterns are the mechanics of bias \u2014 the specific techniques that turn neutral information into a persuasive narrative. Most people can spot obvious propaganda, but these subtler patterns work precisely because they don\u2019t feel manipulative. Seeing them labeled and explained teaches you to recognize them not just in this article, but in everything you read going forward. The goal isn\u2019t to make you distrust all media \u2014 it\u2019s to make the invisible machinery visible."
    },
    {
      name: "Bias Type Classification",
      color: "#FB923C",
      what: "Tags each detected bias pattern with one of four categories. Ideological: left/right partisan framing that favors one political side. Spin: sensationalism and emotional manipulation regardless of political direction. Framing: narrative structure choices that make certain interpretations feel more natural \u2014 what gets emphasized, what gets buried, how cause and effect are presented. Omission: bias through absence, where leaving something out changes the meaning of what remains.",
      why: "Saying an article \u201Cis biased\u201D is like saying a patient \u201Cis sick\u201D \u2014 it doesn\u2019t tell you what\u2019s actually going on. An article with ideological bias needs different skepticism than one with high spin. Framing bias requires you to think about what alternative structures were possible. Omission bias means looking for what\u2019s not there. Knowing the type of bias tells you what kind of critical thinking to apply, not just that you should be on guard."
    },
    {
      name: "Hidden Assumptions",
      color: "#FBBF24",
      what: "Surfaces unstated premises that the article\u2019s arguments depend on but never explicitly say. These are beliefs baked into the reasoning chain \u2014 if you accept the argument, you\u2019re implicitly accepting these assumptions too. They might be hidden causal claims (\u201CX caused Y\u201D treated as obvious), implicit value hierarchies (some outcomes presented as inherently better), or unstated beliefs about how groups or institutions behave.",
      why: "The most powerful assumptions are the ones nobody states out loud, because they never get examined. When an article argues \u201CPolicy X will hurt the economy,\u201D it\u2019s assuming a specific model of how the economy works \u2014 but it rarely says which one. When it frames a group\u2019s actions as irrational, it\u2019s assuming a standard of rationality that may not be universal. Surfacing these hidden premises lets you decide whether you actually agree with the foundations of the argument, not just its conclusions."
    },
    {
      name: "Soft Bias Detection",
      color: "#F87171",
      what: "Catches sophisticated bias that stays within the bounds of professional language but still systematically delegitimizes specific groups. Group delegitimization: framing a group\u2019s concerns as inherently unreasonable. Dehumanizing metaphors: describing people using language normally reserved for objects, animals, or natural disasters (\u201Cflood,\u201D \u201Cswarm,\u201D \u201Cinfestation\u201D). Exclusionary framing: defining \u201Cnormal\u201D in a way that makes certain groups outsiders by default. Identity fusion: collapsing an entire group into a single stereotype.",
      why: "Overt hate speech is easy to spot and broadly rejected. Soft bias is far more common and far harder to see because it uses polished, respectable language. A news article will never say \u201Cthis group is subhuman,\u201D but it might consistently use metaphors that achieve the same effect. This detection layer exists because the most damaging bias in mainstream media isn\u2019t the kind that violates content policies \u2014 it\u2019s the kind that passes right through them."
    },
    {
      name: "Omission Analysis",
      color: "#A855F7",
      what: "Evaluates what the article fails to include across three dimensions. Missing stakeholders: groups directly affected by the story who are never quoted or mentioned. Missing context: historical events, precedents, or background that would change how a reader interprets the situation. Missing counter-evidence: studies, data, or reports that contradict the article\u2019s framing. Only genuinely significant omissions are flagged \u2014 not everything an article could theoretically include.",
      why: "A completely factual article can still be deeply misleading if it leaves out the right information. Reporting that a policy \u201Creduced costs by 30%\u201D without mentioning it also cut services by 50% is technically accurate and functionally dishonest. Omission is the hardest form of bias to detect on your own because you can\u2019t notice what isn\u2019t there. This tool does that noticing for you \u2014 it tells you what to go looking for."
    },
    {
      name: "Evidence Chains",
      color: "#60A5FA",
      what: "For each major claim, maps the available evidence into a structured chain: what supports it, what contradicts it, and what provides additional context. Each piece of evidence is attributed to a specific named source (institution, study, report) and rated by strength \u2014 strong, moderate, or weak. The chain builds up to a reasoning summary that explains in plain language how the evidence adds up.",
      why: "Most fact-checking gives you a verdict: true, false, mixed. But a verdict without reasoning is just another authority asking you to trust it. Evidence chains show you the actual path from evidence to conclusion, so you can evaluate the logic yourself. If you disagree with the verdict, you can see exactly where your reasoning diverges. The goal is to make you a better evaluator of information, not to replace your judgment with an algorithm\u2019s."
    },
    {
      name: "Source Profiling",
      color: "#94A3B8",
      what: "Builds a running profile of each news source by accumulating lean scores, intent classifications, spin scores, and polarization levels across every article Spectrum analyzes from that domain. Over time, this creates a data-driven picture of how a source actually behaves \u2014 not based on a one-time editorial judgment, but on measurable patterns across dozens or hundreds of articles.",
      why: "Static source ratings (\"CNN is left,\" \"Fox is right\") are useful starting points but they\u2019re frozen in time and ignore variation. In practice, every outlet publishes a mix of straight reporting and opinion, and their framing can shift with topics, authors, and news cycles. Source profiling lets you see the real distribution \u2014 does this outlet consistently spin? Are they polarizing on some topics but not others? Do their lean scores cluster tight or spread wide? That\u2019s a fundamentally richer picture than a single label."
    },
    {
      name: "Source Deviation Detection",
      color: "#06B6D4",
      what: "Compares the current article\u2019s lean score against its source\u2019s historical average. When a publication that typically scores center-left suddenly publishes something that scores center-right, the deviation is flagged. The system tracks the magnitude of the shift and explains what\u2019s different about this particular piece compared to the outlet\u2019s baseline behavior.",
      why: "An article from a normally centrist source that suddenly shows strong partisan framing is more informative than the same framing from a source that always leans that way. Deviation detection catches these anomalies \u2014 when a source breaks from its own pattern, something unusual is happening. Maybe it\u2019s an opinion piece mixed into the news feed, maybe the topic triggered different editorial instincts, or maybe the outlet\u2019s framing is genuinely shifting. Either way, you should know."
    },
    {
      name: "Multilingual Bias Patterns",
      color: "#6366F1",
      what: "Extends bias detection beyond English to recognize language-specific manipulation patterns. For Korean media: 존댓말 (honorific) manipulation that conveys deference or dismissal through formality levels, 북한 framing patterns, 재벌 coverage bias, 보수/진보 tribal language, regional 영남/호남 coding, and references to historical events like 광주 or the 87 democratization movement that carry implicit political weight.",
      why: "Bias doesn\u2019t work the same way in every language. Korean media has unique manipulation vectors that English bias frameworks completely miss \u2014 the way honorific levels signal editorial attitude, how North Korea framing serves as a political litmus test, or how regional references activate deep tribal loyalties. If Spectrum only understood English-language bias patterns, it would be blind to how half the world\u2019s media actually operates."
    },
    {
      name: "Visual Framing Analysis",
      color: "#EC4899",
      what: "Analyzes the images accompanying an article for framing bias. It examines subject positioning (heroic low angle vs. unflattering high angle), contextual elements (protest signs selected for display, crowd size perspectives), emotional staging (subjects caught mid-expression vs. composed), and whether the visual narrative aligns with or contradicts the text. Each image is classified by framing type: sympathetic, neutral, unsympathetic, heroic, or villainizing.",
      why: "Images are the most powerful framing tool in journalism because they bypass analytical thinking entirely. A factually accurate article with a villainizing photo creates a completely different impression than the same article with a neutral one. Most media literacy focuses exclusively on text \u2014 but research consistently shows that images have a stronger effect on reader perception than words. Visual framing analysis makes this invisible layer of editorial choice visible."
    },
    {
      name: "Temporal Bias Tracking",
      color: "#8B5CF6",
      what: "Tracks how a source\u2019s coverage of specific topics shifts over time. It compares the current article\u2019s framing to the source\u2019s 7-day and 30-day averages, measures consistency (how tightly the source\u2019s scores cluster), and identifies narrative shifts \u2014 moments when coverage detectably changes direction on a topic.",
      why: "News coverage isn\u2019t static. Sources shift their framing in response to editorial pressure, audience feedback, political developments, and competitive dynamics. A source that was covering immigration neutrally three months ago might be covering it with heavy spin today. Without temporal tracking, you\u2019d never notice the shift \u2014 each article looks reasonable in isolation. This tool reveals the trajectory, so you can see whether you\u2019re reading a snapshot or a trend."
    },
    {
      name: "Author Consistency Analysis",
      color: "#14B8A6",
      what: "Builds a profile of individual journalists by tracking their lean scores, intent patterns, and spin levels across multiple articles. When you read a piece, it compares the author\u2019s current framing to their historical baseline and flags significant deviations. It distinguishes between authors who consistently write from one perspective and those whose framing varies by topic.",
      why: "Not all articles from the same outlet are created equal. A beat reporter covering their specialty tends to be more measured than an opinion writer branching into unfamiliar territory. An author who typically writes center-left but suddenly produces a center-right piece is worth noting \u2014 either the topic genuinely calls for different framing, or something else is going on. Author-level tracking gives you a layer of context that source-level analysis alone can\u2019t provide."
    },
    {
      name: "Evidence Strength Mapping",
      color: "#10B981",
      what: "Visualizes the evidence supporting and contradicting an article\u2019s key claims as a structured map. Each piece of evidence is categorized as supporting, contradicting, or contextual, rated by strength (strong, moderate, weak), and attributed to a specific named source. The map shows at a glance whether an article\u2019s claims rest on solid foundations or thin evidence.",
      why: "An article can cite ten sources and still have weak evidence if all ten are quoting the same original study. Evidence mapping shows you the actual structure underneath the citations \u2014 how many independent lines of evidence exist, whether they point in the same direction, and whether any strong contradicting evidence is being ignored. It\u2019s the difference between counting sources and evaluating them."
    },
    {
      name: "Video Transcript Analysis",
      color: "#F59E0B",
      what: "Extracts and analyzes transcripts from video news content, including YouTube news segments. It examines spoken framing patterns (how stories are introduced and concluded), speaker selection bias (whose voices are featured and whose are absent), and editing cues inferred from transcript context (abrupt topic changes, leading questions, selective clip ordering). The transcript is processed alongside the video\u2019s metadata and description.",
      why: "Video news is increasingly where people get their information, but it\u2019s been largely invisible to text-based bias analysis. A news anchor\u2019s word choices, a producer\u2019s decision about which interview clips to include, and the sequencing of segments all carry framing effects that are just as powerful as written bias \u2014 but harder to detect because video feels more \u201Creal\u201D than text. Transcript analysis brings video content into the same analytical framework as written articles."
    },
  ];

  function renderGlossary() {
    var esc = DA.esc;
    var results = document.getElementById("results");
    if (!results) return;

    var h = '<div class="glossary-section">';
    h += '<div class="glossary-header">How This Analysis Works</div>';
    h += '<div class="glossary-sub">Spectrum runs 21 distinct tools on every article. Each one measures a different dimension of how information is presented. Here\u2019s what they do, how they work, and why they matter.</div>';
    h += '<div class="glossary-grid">';

    for (var i = 0; i < TOOLS.length; i++) {
      var t = TOOLS[i];
      h += '<div class="glossary-card">' +
        '<div class="glossary-card-name">' +
          '<span class="glossary-dot" style="background:' + esc(t.color) + ';"></span>' +
          esc(t.name) +
        '</div>' +
        '<div class="glossary-card-what">' + esc(t.what) + '</div>' +
        '<div class="glossary-card-why">' + esc(t.why) + '</div>' +
      '</div>';
    }

    h += '</div>';
    h += '<div class="glossary-footer">Spectrum combines these tools to give you a multi-dimensional view of any article \u2014 because bias is never just one thing.</div>';
    h += '</div>';

    results.insertAdjacentHTML("beforeend", h);
  }

  DA.renderGlossary = renderGlossary;
})();
