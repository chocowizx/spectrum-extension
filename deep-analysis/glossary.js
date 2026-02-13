(function () {
  window.DA = window.DA || {};

  var TOOLS = [
    {
      name: "Lean Score",
      color: "#818CF8",
      what: "Shows where the article sits on the political spectrum, from left to right.",
      why: "An article from a left-leaning outlet can still have centrist framing \u2014 this scores the article, not the source."
    },
    {
      name: "Spin Score",
      color: "#FB923C",
      what: "Measures hype and drama \u2014 exaggeration, clickbait, emotional manipulation.",
      why: "Spin is independent of politics. A centrist article can be highly sensational, and a partisan one can be calm and factual."
    },
    {
      name: "Intent Classification",
      color: "#4ADE80",
      what: "Identifies what the author is trying to do: inform, advocate, persuade, or manipulate.",
      why: "Knowing the goal behind an article helps you decide how much to trust it. Informing and manipulating look very different under the hood."
    },
    {
      name: "Polarization",
      color: "#FBBF24",
      what: "Detects \u201Cus vs. them\u201D framing that tries to divide people into opposing camps.",
      why: "High polarization doesn\u2019t mean the article is wrong \u2014 it means it\u2019s framing issues as tribal battles rather than policy discussions."
    },
    {
      name: "Perspective Diversity",
      color: "#4ADE80",
      what: "Counts how many distinct viewpoints the article represents.",
      why: "An article quoting three people who all agree isn\u2019t balanced. This shows which voices are present and which are missing."
    },
    {
      name: "Claims Analysis",
      color: "#60A5FA",
      what: "Pulls out individual statements and classifies them as contentious, misleading, verified, or neutral.",
      why: "Not every sentence deserves the same scrutiny. This separates solid facts from shaky claims so you know where to look closer."
    },
    {
      name: "Check-Worthiness",
      color: "#F87171",
      what: "Scores how much a specific claim deserves fact-checking.",
      why: "High scores mean the claim is verifiable, high-impact, and could cause real harm if wrong. Low scores mean it\u2019s opinion or already well-established."
    },
    {
      name: "Bias Indicators",
      color: "#A78BFA",
      what: "Spots language patterns that subtly push you toward a conclusion \u2014 loaded words, cherry-picked data, emotional appeals.",
      why: "Bias isn\u2019t always obvious. These patterns work on you even when you\u2019re not aware of them."
    },
    {
      name: "Bias Type",
      color: "#FB923C",
      what: "Tags each bias pattern as ideological, spin, framing, or omission.",
      why: "Not all bias works the same way. Knowing the type helps you understand how the article is trying to influence you."
    },
    {
      name: "Hidden Assumptions",
      color: "#FBBF24",
      what: "Finds beliefs the article treats as obviously true \u2014 but aren\u2019t.",
      why: "These are the invisible foundations of an argument. If the hidden assumption is wrong, the whole argument falls apart."
    },
    {
      name: "Soft Bias",
      color: "#F87171",
      what: "Catches sophisticated bias that sounds neutral but systematically frames certain groups negatively.",
      why: "This is the hardest bias to spot because it follows all the rules of polite language while still doing damage."
    },
    {
      name: "Omission Analysis",
      color: "#A855F7",
      what: "Identifies what the article doesn\u2019t say \u2014 missing stakeholders, context, and counter-evidence.",
      why: "Sometimes the biggest bias is in what\u2019s left out. A factually accurate article can still mislead by ignoring key information."
    },
    {
      name: "Evidence Chains",
      color: "#60A5FA",
      what: "Maps out what evidence supports or contradicts each claim, and how strong that evidence is.",
      why: "Instead of just saying \u201Ctrue\u201D or \u201Cfalse,\u201D this shows you the receipts so you can judge for yourself."
    },
    {
      name: "Source Profiling",
      color: "#94A3B8",
      what: "Tracks how this source has scored across multiple articles over time.",
      why: "One article can be an outlier. Patterns across many articles reveal whether a source consistently leans, spins, or omits."
    },
  ];

  function renderGlossary() {
    var esc = DA.esc;
    var results = document.getElementById("results");
    if (!results) return;

    var h = '<div class="glossary-section">';
    h += '<div class="glossary-header">How This Analysis Works</div>';
    h += '<div class="glossary-sub">Every section above uses a specific tool. Here\u2019s what each one does and why it matters.</div>';
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
