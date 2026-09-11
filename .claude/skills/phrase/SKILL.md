---
name: phrase
description: Build a speakable Mandarin phrasebook for a specific social situation in northern China. Use when the user describes a social scenario and wants to know what to say — meeting the girlfriend's parents, arriving at someone's home, being served food, baijiu toasting, a taxi ride, a pharmacy counter, a shop, declining or accepting politely, or "what do I say when…". Outputs a likely-expressions / response / meaning table with register warnings.
---

# Phrase

The user describes a social situation. You return what the other person will
likely say, and what he says back.

He is beginner–intermediate Mandarin, **reads pinyin far faster than
characters**, and needs to **say these out loud** to drivers, shop staff, and
his girlfriend's family. Optimize for speakability, not elegance.

## Output format — this exact table, every time

| Likely expressions | Your response | What it means / does |
|---|---|---|

**Column 1 — Likely expressions.** 2–4 things the other person is likely to
say, grouped by intent. Pinyin with tone marks leads, English in brackets,
characters after.
> `duō chī diǎn` [eat more] 多吃点

**Column 2 — Your response.** One catch-all that works for the whole group.
Pinyin first, characters under. Short enough to actually say under pressure.
Prefer a phrase he can deploy without parsing which of the four he heard.

**Column 3 — What it means / does.** Two distinct things, both required:
- **Literally:** the word-for-word meaning.
- **Socially:** what it *accomplishes* — what it signals, what it prevents,
  why it's the right move. This is the column that earns its keep.

Group into as many rows as the situation has beats. Then:

## Register warnings — separate block, always

Flag anything that could misfire upward at an elder. He will default to casual
forms learned from his girlfriend and misfire them at her parents.

Check every response for:
- **你 vs 您** — always 您 (nín) to her parents. No exceptions.
- **Downward-only phrases.** Canonical: **辛苦了 (xīnkǔ le)** is said
  *downward* — boss to employee. Even 您辛苦了 (nín xīnkǔ le) can read as
  condescending from a young man to his girlfriend's father. Upward
  alternatives: 谢谢您 (xièxie nín), 您太客气了 (nín tài kèqi le),
  您受累了 (nín shòulèi le).
- **Curtness.** Bare 不要 (bú yào) or 不用 (bú yòng) reads as rejection.
  Always pair a decline with praise or thanks.
- **Tone errors that change meaning** or produce something embarrassing.
- **Physical register**, where it matters more than the words — two hands for
  giving and receiving, glass rim below the elder's when clinking.

If nothing in the situation has a register risk, say "no register risk here"
rather than padding.

## Standing facts for this user

- Address terms: **叔叔 (shūshu)** = girlfriend's father, **阿姨 (āyí)** = her mother.
- Shushu **makes noodles** 面条 (miàntiáo). Compliments about noodles should be
  *specific* — 筋道 (jīndao) [springy, with good chew] is the correct technical
  word for noodle texture and lands far harder than generic 好吃 (hǎochī).
  Then hand him the floor: asking how he makes them is the strongest move
  available.
- **He drinks baijiu 白酒 (báijiǔ)** and will participate in toasting. Include
  toasting lines, seniority order, and **pacing/slowdown lines** — participating
  is not keeping up. The self-deprecating frame is the correct register for
  slowing down: 我酒量不行 (wǒ jiǔliàng bù xíng) [my capacity isn't good].
- Assume the elders speak **Mandarin only** — no English, no Korean.
- Meeting the family for the **first time**. Weight toward not losing face over
  sounding impressive.

## Worked example — "I'm arriving at her parents' place for dinner"

| Likely expressions | Your response | What it means / does |
|---|---|---|
| `kuài jìnlai` [come in, quick] 快进来 · `lùshang lèi bu lèi?` [tired from the trip?] 路上累不累？· `chī le ma?` [have you eaten?] 吃了吗？ | **Shūshu, āyí, nín hǎo. Xièxie nín.**<br>叔叔，阿姨，您好。谢谢您。 | **Literally:** "Uncle, auntie, hello. Thank you (polite)." **Socially:** correct address terms + 您 in the first five seconds is the single highest-value thing he can do. Note 吃了吗 is a greeting, not a real question — don't answer it with logistics. |
| `duō chī diǎn` [eat more] 多吃点 · `zài lái yì wǎn` [another bowl] 再来一碗 · `bié kèqi` [don't stand on ceremony] 别客气 | **Tài hǎochī le, wǒ chī de hěn bǎo.**<br>太好吃了，我吃得很饱。 | **Literally:** "So delicious, I'm very full." **Socially:** praise *before* declining. Declining without praise reads as rejecting the food, not the quantity. Expect to be offered again anyway — that's the script, not a failure. |
| `zhè shì wǒ zìjǐ gǎn de miàn` [I hand-rolled these noodles] 这是我自己擀的面 · `chángchang` [give it a taste] 尝尝 | **Shūshu, zhè miàntiáo zhēn jīndao! Nín shì zěnme zuò de?**<br>叔叔，这面条真筋道！您是怎么做的？ | **Literally:** "Uncle, these noodles are really springy! How do you make them?" **Socially:** 筋道 is the craftsman's word, not the guest's word — it proves he actually noticed. The question then hands shushu the floor on his own subject, which is the best possible outcome of the evening. |
| `lái, zǒu yí ge` [come on, let's have one] 来，走一个 · `gānbēi` [bottoms up] 干杯 · `wǒ jìng nǐ` [I toast you] 我敬你 | **Wǒ jìng nín yì bēi, zhù nín shēntǐ jiànkāng.**<br>我敬您一杯，祝您身体健康。 | **Literally:** "I toast you a cup, wishing you good health." **Socially:** toasting *up* to the elder first, unprompted, is the move. 身体健康 is the standard, safe elder wish — no cleverness required or wanted. |

**Register warnings for this situation**
- 我敬**你** → must be 我敬**您** to shushu. The whole point of the toast is deference; 你 undoes it.
- Don't say 辛苦了 to 阿姨 for cooking, even with 您. Use 您太客气了 (nín tài kèqi le) [you're too kind] or 谢谢您 (xièxie nín).
- Physical: two hands on the glass, and clink with **your rim below his**. This is read more closely than the words.
- Pacing: **Wǒ jiǔliàng bù xíng, wǒ mànmàn hē.** 我酒量不行，我慢慢喝。 [My capacity isn't good, I'll drink slowly.] Self-deprecation is the correct register for slowing down — 我随意 (wǒ suíyì) alone is slightly presumptuous from the junior seat.

## Style
Concise. Table first. No preamble. If a phrase is above his level to actually
pronounce, pick a simpler one and say you did.
