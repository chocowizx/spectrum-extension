(function () {
  window.DA = window.DA || {};

  var RESEARCH_CITATIONS = [
    { feature: "Intent Classification", papers: [
      { authors: "Da San Martino et al.", year: 2019, title: "Fine-Grained Analysis of Propaganda in News Articles", venue: "EMNLP" },
      { authors: "Jowett & O\u2019Donnell", year: 2018, title: "Propaganda & Persuasion", venue: "7th ed., SAGE" },
    ]},
    { feature: "Lean Scoring", papers: [
      { authors: "Budak, Goel & Rao", year: 2016, title: "Fair and Balanced? Quantifying Media Bias through Crowdsourced Content Analysis", venue: "Public Opinion Quarterly" },
      { authors: "Baly et al.", year: 2018, title: "Predicting Factuality of Reporting and Bias of News Media Sources", venue: "EMNLP" },
    ]},
    { feature: "Polarization Analysis", papers: [
      { authors: "Prior", year: 2013, title: "Media and Political Polarization", venue: "Annual Review of Political Science" },
      { authors: "Iyengar & Hahn", year: 2009, title: "Red Media, Blue Media: Evidence of Ideological Selectivity in Media Use", venue: "Journal of Communication" },
    ]},
    { feature: "Check-Worthiness", papers: [
      { authors: "Hassan et al.", year: 2017, title: "ClaimBuster: The First-ever End-to-end Fact-checking System", venue: "VLDB" },
      { authors: "Atanasova et al.", year: 2019, title: "Automatic Fact-Checking Using Context and Discourse Information", venue: "ACL" },
    ]},
    { feature: "Information Gaps", papers: [
      { authors: "Entman", year: 1993, title: "Framing: Toward Clarification of a Fractured Paradigm", venue: "Journal of Communication" },
      { authors: "McCombs & Shaw", year: 1972, title: "The Agenda-Setting Function of Mass Media", venue: "Public Opinion Quarterly" },
    ]},
    { feature: "Evidence Chains", papers: [
      { authors: "Thorne et al.", year: 2018, title: "FEVER: a Large-scale Dataset for Fact Extraction and VERification", venue: "NAACL" },
      { authors: "Vlachos & Riedel", year: 2014, title: "Fact Checking: Task Formulation, Dataset Construction and Evaluation", venue: "ACL Workshop" },
    ]},
    { feature: "Soft Bias Detection", papers: [
      { authors: "Recasens, Danescu-Niculescu-Mizil & Jurafsky", year: 2013, title: "Linguistic Models for Analyzing and Detecting Biased Language", venue: "ACL" },
      { authors: "Hube & Fetahu", year: 2018, title: "Detecting Biased Statements in Wikipedia", venue: "WWW" },
    ]},
    { feature: "Unverbalized Biases", papers: [
      { authors: "van Dijk", year: 1993, title: "Principles of Critical Discourse Analysis", venue: "Discourse & Society" },
      { authors: "Fairclough", year: 1995, title: "Critical Discourse Analysis: The Critical Study of Language", venue: "Longman" },
    ]},
    { feature: "Image Context Analysis", papers: [
      { authors: "Peng", year: 2018, title: "Same Headlines, Different Perspectives: A Visual Framing Study", venue: "International Journal of Communication" },
      { authors: "Powell et al.", year: 2015, title: "Framing Analysis of Media Coverage of Natural Disasters", venue: "Environmental Communication" },
    ]},
    { feature: "Source Profiling", papers: [
      { authors: "Herman & Chomsky", year: 1988, title: "Manufacturing Consent: The Political Economy of the Mass Media", venue: "Pantheon" },
      { authors: "Baly et al.", year: 2020, title: "We Can Detect Your Bias: Predicting the Political Ideology of News Articles", venue: "EMNLP" },
    ]},
  ];

  function renderCitations() {
    var esc = DA.esc;
    var results = document.getElementById("results");
    if (!results) return;

    var h = '<div class="citations-section">';
    h += '<div class="citations-header">Research Foundations</div>';
    h += '<div class="citations-sub">Academic papers underpinning Spectrum\u2019s 10 analysis features \u2014 20 foundational works in media studies, computational journalism, and critical discourse analysis.</div>';

    for (var i = 0; i < RESEARCH_CITATIONS.length; i++) {
      var group = RESEARCH_CITATIONS[i];
      h += '<div class="citation-group">';
      h += '<div class="citation-feature"><span class="cit-num">' + (i + 1) + '</span>' + esc(group.feature) + '</div>';
      for (var p = 0; p < group.papers.length; p++) {
        var paper = group.papers[p];
        h += '<div class="citation-paper">' +
          esc(paper.authors) + ' (' + paper.year + '). \u201C' + esc(paper.title) + '.\u201D <span class="venue">' + esc(paper.venue) + '.</span>' +
          '</div>';
      }
      h += '</div>';
    }

    h += '<div class="citations-footer">' +
      '<span>Explore more at</span>' +
      '<a href="https://spectrum-research.web.app" target="_blank" rel="noopener">spectrum-research.web.app \u2192</a>' +
      '</div>';
    h += '</div>';

    results.insertAdjacentHTML("beforeend", h);
  }

  DA.renderCitations = renderCitations;
})();
