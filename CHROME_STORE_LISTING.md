# Chrome Web Store Listing — Spectrum

## Title (max 45 chars)
Spectrum — Bias & Perspective Analyzer

## Short Description (max 132 chars)
Analyze news articles for bias, find alternative perspectives, fact-check claims, detect AI-generated text.

## Full Description

**Understand the full story behind every article.**

Spectrum analyzes news articles in real-time to reveal potential bias, alternative viewpoints, and AI-generated content. Built for readers who want clarity in an era of misinformation.

### What Spectrum Does

- **Bias Detection**: Identifies political lean, narrative framing, and underlying assumptions
- **Alternative Perspectives**: Finds credible counterarguments and opposing viewpoints on the same topic
- **Claim Verification**: Flags unverified claims and suggests fact-checking sources
- **AI Detection**: Detects GPT/AI-generated passages in news content
- **Perspective Aggregation**: Shows how different outlets cover the same story

### Why Spectrum?

News consumption is fragmented. A single article reflects one perspective, one editorial choice, one narrative. Spectrum helps you:
- Recognize bias patterns across your reading
- Discover what the other side is saying
- Fact-check claims before sharing
- Understand AI-written content

### Privacy

Spectrum processes articles locally in your browser. Analysis requests are sent to our backend for AI-powered insights, but no article content is stored or logged. Your reading history stays private.

### Permissions

- **activeTab**: Read the article you're viewing to analyze it
- **all_urls**: News appears across all websites; we need access to analyze any article
- **storage**: Remember your settings and analysis history locally
- **tabs**: Detect when you navigate to new articles

---

## Privacy Policy (required)

### Privacy Policy — Spectrum

**Effective Date:** [TODAY]

Spectrum ("we", "us", "our") respects your privacy.

#### What We Collect

When you use Spectrum to analyze an article:
- **Article content** (temporarily, for analysis only)
- **URL of the article** (to track what you've analyzed)
- **Your analysis preferences** (sensitivity, languages)

#### How We Use It

- Article content is sent to our backend (Firebase Cloud Functions) to perform AI-powered bias detection, perspective search, and claim verification.
- We do **not** store article content or your reading history on our servers.
- Analysis results are computed in real-time and discarded after serving the response.

#### What We Don't Sell

We don't sell, share, or monetize your data. Period.

#### Local Storage

Your settings, disabled websites, and sensitivity preferences are stored locally on your device using Chrome's storage API. This data never leaves your computer.

#### Third-Party Services

Spectrum uses Google Cloud (Firebase) to power AI analysis. Google's privacy policy applies to backend traffic: https://policies.google.com/privacy

#### Changes

We may update this policy. Continued use means you accept updates.

#### Contact

Questions? Email: chocowizx@gmail.com

---

## Permissions Justification

**Why activeTab, all_urls, storage, tabs, and scripting?**

Spectrum's core function is to analyze news articles wherever they appear on the web. This requires:

- **all_urls**: News articles exist across news sites, blogs, social media, aggregators, etc. We need permission to analyze any article you're reading.
- **activeTab**: We only inject our analysis sidebar when you're actively reading an article.
- **storage**: Remember your preferences (sensitivity level, disabled sites, analysis history).
- **scripting**: Inject the bias-detection UI into the page without modifying the article itself.
- **tabs**: Detect when you navigate between articles to refresh analysis.

We do not crawl the web, monitor your history, or collect data beyond what's necessary to provide bias analysis.

---

## Screenshots Needed

1. **Screenshot 1**: Article with Spectrum sidebar showing bias score, perspective finder, and claim flags
2. **Screenshot 2**: Options page showing sensitivity slider, disabled websites list, about section
3. **Screenshot 3**: Perspective results showing alternative viewpoints on a topic

