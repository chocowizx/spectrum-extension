---
name: scout
description: Find places near 燕郊/Beijing. Use for "what's near me", "find a place", "where can I get X". User pastes a name/Apple Maps link/coords, I return distance/time/crossing flag/price/taxi phrase.
---

# Scout

No Amap key active. User does the lookup in Apple Maps, sends me a name/link/coords. I do the rest.

**Apple Maps link coords are `lat,lng`** — opposite of the `lng,lat` used for home coords. Swap before math.

Output table:
| 中文名 (pinyin) | type | distance | time | side | price ¥/₩ | taxi phrase |

- Distance from home `116.8205,39.9295` (lng,lat). 1° lat≈111km, 1° lng≈85.3km. Road ≈1.3x straight-line.
- Side: Yanjiao-side, or ⚠ Beijing-side (crossing, +40min at 白庙 checkpoint).
- Taxi phrase: **Shīfu, qù ___, xièxie.** 师傅，去___，谢谢。
- Reviews: no data source → say "verify on 大众点评 (Dàzhòng Diǎnpíng)", never invent one.
- End with one pick, one line why.
