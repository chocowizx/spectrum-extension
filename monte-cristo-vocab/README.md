# The Count of Monte Cristo — vocabulary by chapter

A per-chapter vocabulary companion for Dumas's novel, built for a second reading
of the **Robin Buss** translation (Penguin Classics, 1996), whose 117 chapters
follow the French original's numbering.

- **Web companion:** https://claude.ai/code/artifact/f67eece3-1a7e-4bc6-9793-aad64a3e7cf0
- **Printable/greppable:** `out/monte-cristo-vocab.md`
- **1,355 entries:** 168 recurring core terms + 1,187 chapter-specific ones

## How this was built — and what that means for accuracy

Read this part before trusting a list.

The Buss translation is in copyright, and no lawful machine-readable copy exists
to mine. The usual fallback — frequency-analysing the public-domain 1846 Chapman
& Hall translation as a proxy — was also unavailable here: `gutenberg.org` is
blocked by this environment's egress policy.

So these lists are **curated from the novel, not extracted from Buss's text.**
Words were chosen because they belong to a chapter's world — its setting,
institutions, objects, money, law, seamanship and medicine — and are the kind of
word that stops a reader. Concretely:

- **Reliable:** the sense of each definition; the core glossary; proper nouns,
  institutions, coins, ranks, ships and places, which are fixed by the plot and
  survive any translation.
- **Approximate:** the exact wording. Buss is more modern and less archaic than
  the Victorian translations, so where a list says `hostelry` he may well write
  `inn`. Treat an entry as "the idea you will meet here", not "the string on the page".
- **Weakest:** fine chapter-boundary alignment in the Paris chapters (roughly
  60–90), where several short chapters cover one continuous social sequence. A
  term may sit a chapter either side of where it's listed. Chapter titles are
  included to help you locate the right one; Buss's exact wording may differ.

Nothing here was copied from any edition — the definitions are written fresh.

## Getting verified lists

`tools/extract.py` does the frequency analysis the above describes, and is ready
for any plain-text edition you can supply — a Gutenberg download from an
unblocked machine, for instance:

```bash
python3 tools/extract.py --text mc.txt --out out/extracted.json
```

It splits on chapter headings (Arabic or Roman), scores each word per chapter by
a tf-idf variant, drops anything common across the book or present in the
stoplist, and reports proper nouns separately. Tunable with `--per-chapter`,
`--max-total`, `--min-len` and `--stoplist`.

The result is *verified* vocabulary for that edition, which you can read beside
the curated lists here. It was tested against a synthetic 117-chapter text
(chapter splitting, scoring and proper-noun detection all confirmed); it has not
been run against a real edition, because none was reachable.

## Layout

```
data/core-glossary.json    168 recurring terms, grouped by domain
data/vocab/ch*.json        per-chapter entries: {w: word, d: definition, t: tag}
tools/build.py             validates the data, renders out/
tools/extract.py           frequency extraction from a real text
web/index.html             the published companion (data inlined)
out/                       generated — markdown study guide + bundle.json
```

Tags: `naut` `fr` `it` `law` `hist` `money` `med` `lit` `arch` `gen`.

## Working on it

```bash
python3 tools/build.py --check   # validate only
python3 tools/build.py           # validate + regenerate out/
```

`--check` enforces that all 117 chapters are present, that every entry has a word,
a definition and a known tag, and that no chapter repeats a word. After editing
the data, rebuild and republish `web/index.html` to the artifact URL above.

## A note on spoilers

The definitions are written for a re-reader and give away plot freely ("the purse
Morrel once used to save Dantès' father — returned"). The web companion has a
**spoiler guard**: set the chapter you've reached and everything past it stays
closed. The markdown file has no such guard.
