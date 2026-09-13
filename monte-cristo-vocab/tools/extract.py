#!/usr/bin/env python3
"""
Extract per-chapter rare-word candidates from a plain-text edition of
The Count of Monte Cristo.

The curated lists in data/vocab/ are written from knowledge of the novel,
because no machine-readable copy of the Robin Buss translation exists that
we may lawfully mine. This script produces the *verified* complement: give
it any plain-text edition (e.g. the public-domain 1846 Chapman & Hall
translation) and it reports, per chapter, the words that are rare relative
to the rest of the book and to a stoplist of ordinary English.

    python3 tools/extract.py --text mc.txt --out out/extracted.json

Method
------
Rarity score per (chapter, word):
    tf-idf-ish = (count in chapter) * log(117 / chapters containing word)
filtered by:
    - not in the common-word stoplist
    - total corpus count <= --max-total   (rare across the whole novel)
    - length >= --min-len
Proper nouns are reported separately: they are usually places, titles and
institutions, which are exactly what a reader wants glossed.
"""
import argparse, json, math, re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

CHAPTER_RE = re.compile(
    r"^\s*(?:chapter\s+)?(\d{1,3}|[IVXLC]+)\s*[.—:-]?\s*(.*)$",
    re.IGNORECASE)
WORD_RE = re.compile(r"[A-Za-z][A-Za-z'’-]+")

ROMAN = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}


def roman_to_int(s):
    total, prev = 0, 0
    for ch in reversed(s.upper()):
        v = ROMAN.get(ch)
        if v is None:
            return None
        total = total - v if v < prev else total + v
        prev = max(prev, v)
    return total


def load_stoplist(path):
    if path and Path(path).exists():
        return {w.strip().lower() for w in Path(path).read_text().split() if w.strip()}
    # Fallback: the ~320 commonest English words. Anything beyond this is
    # better filtered by the --max-total corpus-frequency cutoff.
    return set("""the be to of and a in that have i it for not on with he as you do at this
but his by from they we say her she or an will my one all would there their what so up out
if about who get which go me when make can like time no just him know take people into year
your good some could them see other than then now look only come its over think also back
after use two how our work first well way even new want because any these give day most us
is was are were been has had did does said says went gone came coming being am shall should
must might may shall very much more many such own same too own here where why while before
during against between under above through each few both own those that's don't didn't
i'm it's he's she's we're they're isn't wasn't aren't weren't can't won't couldn't
wouldn't shouldn't upon thus therefore however whom whose himself herself myself themselves
yourself itself ourselves yourselves let made make made great little old young long again
never ever always sometimes often seem seemed seems part place thing things man woman men
women child children day days night nights word words hand hands eye eyes head heart life
death house room door window street hour moment year years name sir madame monsieur mon
oh ah yes no well indeed nothing something anything everything nobody somebody everybody
anybody one's replied answered asked cried continued added returned resumed observed
exclaimed murmured repeated rejoined""".split())


def split_chapters(text):
    """Return [(number, title, body)] using blank-line-delimited heading lines."""
    lines = text.splitlines()
    marks = []
    for i, line in enumerate(lines):
        s = line.strip()
        if not s or len(s) > 90:
            continue
        # A heading sits alone: blank line above it.
        if i and lines[i - 1].strip():
            continue
        m = CHAPTER_RE.match(s)
        if not m:
            continue
        num = m.group(1)
        n = int(num) if num.isdigit() else roman_to_int(num)
        if n is None or not (1 <= n <= 130):
            continue
        title = m.group(2).strip(" .—-")
        # Chapter numbers must advance; guards against page numbers.
        if marks and n <= marks[-1][1]:
            continue
        marks.append((i, n, title))
    out = []
    for idx, (i, n, title) in enumerate(marks):
        end = marks[idx + 1][0] if idx + 1 < len(marks) else len(lines)
        body = "\n".join(lines[i + 1:end])
        if not title:
            # Title may be on the following non-blank line.
            for cand in lines[i + 1:i + 4]:
                if cand.strip():
                    title = cand.strip()
                    break
        out.append((n, title, body))
    return out


def normalise(w):
    w = unicodedata.normalize("NFKD", w)
    return "".join(c for c in w if not unicodedata.combining(c)).lower().strip("'’-")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--text", required=True, help="plain-text edition of the novel")
    ap.add_argument("--out", default="out/extracted.json")
    ap.add_argument("--stoplist", help="file of common words, one per line")
    ap.add_argument("--per-chapter", type=int, default=15)
    ap.add_argument("--max-total", type=int, default=12,
                    help="drop words occurring more than this often in the whole book")
    ap.add_argument("--min-len", type=int, default=5)
    args = ap.parse_args()

    raw = Path(args.text).read_text(encoding="utf-8", errors="replace")
    chapters = split_chapters(raw)
    if len(chapters) < 50:
        sys.exit(f"only found {len(chapters)} chapters - check the edition's heading format")

    stop = load_stoplist(args.stoplist)
    tokens, propers = {}, {}
    for n, title, body in chapters:
        toks, props = [], []
        for m in WORD_RE.finditer(body):
            w = m.group(0)
            base = normalise(w)
            if len(base) < args.min_len or base in stop:
                continue
            # Capitalised mid-sentence => probably a proper noun.
            start = m.start()
            prev = body[max(0, start - 2):start]
            if w[0].isupper() and prev.strip() not in ("", ".", "!", "?", '"'):
                props.append(w)
            else:
                toks.append(base)
        tokens[n] = Counter(toks)
        propers[n] = Counter(props)

    doc_freq = Counter()
    total = Counter()
    for n, c in tokens.items():
        doc_freq.update(c.keys())
        total.update(c)

    N = len(chapters)
    result = {}
    for n, title, _ in chapters:
        scored = []
        for w, c in tokens[n].items():
            if total[w] > args.max_total:
                continue
            scored.append((c * math.log(N / doc_freq[w]) if doc_freq[w] else 0.0, w, c, total[w]))
        scored.sort(reverse=True)
        result[str(n)] = {
            "title": title,
            "candidates": [
                {"w": w, "in_chapter": c, "in_book": t, "score": round(s, 3)}
                for s, w, c, t in scored[:args.per_chapter]
            ],
            "proper_nouns": [w for w, _ in propers[n].most_common(12)],
        }

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"{len(chapters)} chapters -> {args.out}")
    print(f"vocabulary: {len(total)} distinct filtered words, {sum(total.values())} tokens")


if __name__ == "__main__":
    main()
