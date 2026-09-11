---
name: scout
description: Find places near 燕郊 (Yānjiāo) / northern China using the Amap MCP server. Use when the user asks what's near them, asks you to find or recommend a place (restaurant, pharmacy, gift shop, cafe, hospital, shop, station), asks "where can I get X", asks what's around a coordinate or landmark, or asks to compare options by distance or travel time. Runs Amap around-search, pulls POI detail, web-checks each shortlisted name, and returns a distance/time/taxi-phrase table.
---

# Scout

Find places. Amap first, always. Output is a table, not prose.

## Preconditions — check before anything else

1. **The `amap` MCP server must be connected.** If it is not, stop and tell the user to run:
   ```
   claude mcp add --transport http amap "https://mcp.amap.com/mcp?key=KEY"
   ```
   **Do not fall back to Google, OpenStreetMap, or recall.** Non-Amap POI data
   for China is wrong here — verified 8 km off. A wrong answer is worse than no
   answer. Stop means stop.

2. **Coordinates: GCJ-02, `lng,lat` order.** Not WGS-84, not `lat,lng`. Getting
   this wrong returns a plausible-looking wrong place with no error.

3. **Origin** = the user's home coords `116.8205,39.9295` unless they name a
   different start point. If they give a landmark instead of coords, geocode it
   through Amap first — don't guess.

## Workflow

### Step 1 — Amap around-search
Search from the origin. Start with a radius appropriate to the category:

| Category | Start radius | Note |
|---|---|---|
| Pharmacy, convenience, ATM | 1–2 km | Should be walkable. If nothing inside 2 km, say so before widening. |
| Restaurant, cafe, groceries | 3 km | |
| Gift shop, mall, specialty retail | 5 km | |
| Hosting-elders restaurant, hospital, station | 10 km, then cross-river | Widen deliberately — crossing changes the answer. |

Widen only if the first pass is thin, and **say that you widened it**. Prefer
a good close option over a marginally better far one, and say why.

### Step 2 — POI detail on the top candidates
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
