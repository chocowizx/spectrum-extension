---
name: scout
description: Find places near 燕郊 (Yānjiāo) / northern China using the Amap MCP server. Use when the user asks what's near them, asks you to find or recommend a place (restaurant, pharmacy, gift shop, cafe, hospital, shop, station), asks "where can I get X", asks what's around a coordinate or landmark, or asks to compare options by distance or travel time. Runs Amap around-search, pulls POI detail, web-checks each shortlisted name, and returns a distance/time/taxi-phrase table. Also handles the case where Amap is unavailable by taking place names, pasted Apple Maps links, or coordinates from the user and doing everything else.
---

# Scout

Find places. Amap first, always. Output is a table, not prose.

## Two modes — pick one, say which you're using

### Mode A — `amap` MCP connected
Full pipeline, Steps 1–6 below. Use whenever the server is available.

### Mode B — manual input (no key needed)
**Use this when `amap` is not connected.** Do NOT stop and do NOT fall back to
Google, OpenStreetMap, or recall — non-Amap POI data for China is wrong here,
verified 8 km off. Instead, have the user do the *search* step on their phone
and do everything else yourself.

Ask for this, once, in one line:

> Look it up in **Apple Maps** (Amap data, English interface, works in CN with
> no account) or 高德地图 (Gāodé Dìtú). Tap the place → Share → copy the link,
> or long-press to drop a pin and copy the coordinates. Paste me the name and
> the link/coords — 2–5 candidates if you want a comparison.

Then run **Steps 3–6 unchanged**. Everything that makes this skill useful —
distance, travel time, the crossing flag, the taxi phrase, pricing, the
review-coverage caveat — works fine on user-supplied coordinates. The only
thing the key buys is doing Step 1 for them.

**Parsing an Apple Maps share link:**
- Format: `https://maps.apple.com/?ll=39.9295,116.8205&q=Name`
- ⚠️ **`ll` is `lat,lng` — the OPPOSITE of Amap's `lng,lat`.** Swap it before
  doing any distance math or the answer is silently wrong.
- Apple Maps renders GCJ-02 in mainland China, so a copied pin *should* already
  be GCJ-02 and directly comparable to the home coords. **This is unverified** —
  the first time, sanity-check one known landmark and say you're doing so. If a
  distance comes out absurd, datum mismatch is the first suspect.

Say at the top of the output which mode produced it.

## Other preconditions

1. **Coordinates: GCJ-02, `lng,lat` order** for anything Amap touches. Not
   WGS-84, not `lat,lng`. Getting this wrong returns a plausible-looking wrong
   place with no error.
2. **Origin** = the user's home coords `116.8205,39.9295` unless they name a
   different start point. In Mode A, geocode a named landmark through Amap —
   don't guess. In Mode B, ask them to drop a pin on it.

## Workflow

### Step 1 — Amap around-search *(Mode A only)*
Search from the origin. Start with a radius appropriate to the category:

| Category | Start radius | Note |
|---|---|---|
| Pharmacy, convenience, ATM | 1–2 km | Should be walkable. If nothing inside 2 km, say so before widening. |
| Restaurant, cafe, groceries | 3 km | |
| Gift shop, mall, specialty retail | 5 km | |
| Hosting-elders restaurant, hospital, station | 10 km, then cross-river | Widen deliberately — crossing changes the answer. |

Widen only if the first pass is thin, and **say that you widened it**. Prefer
a good close option over a marginally better far one, and say why.

### Step 2 — POI detail on the top candidates *(Mode A only)*
Take the top ~5 and pull Amap POI detail: exact address, category, hours,
phone, coordinates. Drop anything that is permanently closed, is a duplicate
listing, or is obviously the wrong category. Shortlist to 3–5.

### Step 3 — Web check each shortlisted name
Search each name (in characters, plus the district) for reviews or recent
reports.

**Coverage here is thin and you must say so.** 大众点评 (Dàzhòng Diǎnpíng)
has no public API and blocks scraping. Yanjiao is a secondary city with
sparse English-language coverage. Rules:
- Found something real → cite what it says and where it came from.
- Found nothing → write **"no coverage found — verify on 大众点评"**.
- **Never** invent a rating, a crowd level, a "locals recommend", or a vibe.
  An empty notes cell is a correct answer.

### Step 4 — Compute distance, time, and side
For each shortlisted POI:
- **Distance** from origin. At 39.93°N: 1° lat ≈ 111.0 km, 1° lng ≈ 85.3 km.
  Straight-line is a floor; road distance in Yanjiao runs ~1.25–1.4×. State
  which you're quoting.
- **Travel time**, realistic — not best-case. Account for time of day if the
  user gave one.
- **Mode.** Default assumption is the girlfriend's family driving; 滴滴 (Dīdī)
  is the fallback. Never suggest self-drive — no Chinese license.
- **Side.** Yanjiao-side, or Beijing-side requiring a crossing. If it crosses:
  flag the 白庙检查站 (Báimiào Jiǎncházhàn) checkpoint (**+40 min or more**)
  and the Hebei-plate 进京证 (jìnjīngzhèng) issue. This flag goes in the table,
  not in a footnote.

### Step 5 — Output

| 中文名 (pīnyīn) | Type | Distance | Time | Side | Notes | Taxi phrase |
|---|---|---|---|---|---|---|

- **中文名 (pīnyīn)** — characters, pinyin with tone marks, English gloss. Never omit pinyin.
- **Side** — `Yanjiao-side` or `⚠ Beijing-side (+checkpoint)`.
- **Notes** — hours, price band in ¥ (≈₩ at ¥1≈₩195), Alipay caveats, private-room 包间 (bāojiān) availability if hosting elders, and the review-coverage statement from Step 3.
- **Taxi phrase** — ready to read aloud, pinyin first:
  > **Shīfu, qù ___, xièxie.** / 师傅，去___，谢谢。

  Use the name a local driver actually recognizes — often a landmark or
  intersection, not the registered POI name. Put characters underneath for
  screen-showing. If the destination is obscure, give the nearest well-known
  landmark instead and say so.

### Step 6 — One-line recommendation
End with exactly one pick and why, in one line. Weigh: not crossing the river
beats marginal quality; and if it's for hosting elders, respectable and quiet
beats trendy.

## Style
Concise. Tables over prose. No preamble. Don't restate the request.
Don't explain the workflow — run it.
