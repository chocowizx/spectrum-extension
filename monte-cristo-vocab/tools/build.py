#!/usr/bin/env python3
"""
Validate the curated vocabulary data and render it.

    python3 tools/build.py            # validate + write out/
    python3 tools/build.py --check    # validate only

Outputs:
    out/monte-cristo-vocab.md   full study guide, one section per chapter
    out/bundle.json             single merged blob (used by the web companion)
"""
import argparse, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAGS = {
    "naut": "nautical", "fr": "French", "it": "Italian", "law": "law/courts",
    "hist": "history", "money": "money/finance", "med": "medicine/poison",
    "lit": "literary/allusion", "arch": "archaic", "gen": "general",
}
N_CHAPTERS = 117


def load():
    core = json.loads((ROOT / "data/core-glossary.json").read_text())
    chapters = {}
    for f in sorted((ROOT / "data/vocab").glob("*.json")):
        part = json.loads(f.read_text())
        for k, v in part.items():
            if k in chapters:
                raise SystemExit(f"duplicate chapter {k} in {f.name}")
            chapters[int(k)] = v
    return core, chapters


def validate(core, chapters):
    errs = []
    missing = [n for n in range(1, N_CHAPTERS + 1) if n not in chapters]
    if missing:
        errs.append(f"missing chapters: {missing}")
    extra = [n for n in chapters if not 1 <= n <= N_CHAPTERS]
    if extra:
        errs.append(f"chapter numbers out of range: {extra}")
    for n, ch in sorted(chapters.items()):
        for field in ("title", "scene", "words"):
            if not ch.get(field):
                errs.append(f"ch {n}: empty {field}")
        seen = set()
        for e in ch.get("words", []):
            if not e.get("w") or not e.get("d"):
                errs.append(f"ch {n}: entry missing w/d: {e}")
            if e.get("t") not in TAGS:
                errs.append(f"ch {n}: unknown tag {e.get('t')!r} on {e.get('w')!r}")
            key = e.get("w", "").lower()
            if key in seen:
                errs.append(f"ch {n}: duplicate word {key!r}")
            seen.add(key)
    for section, entries in core.items():
        for e in entries:
            if e.get("t") not in TAGS:
                errs.append(f"core/{section}: unknown tag {e.get('t')!r} on {e.get('w')!r}")
    return errs


def render_markdown(core, chapters):
    L = ["# The Count of Monte Cristo - vocabulary by chapter", "",
         "A reading companion for the Robin Buss translation (Penguin Classics),",
         "whose 117 chapters follow the French original's numbering.", "",
         "> These lists are curated from the novel, not extracted from Buss's text",
         "> (see README.md, 'How this was built'). Expect the sense to match and the",
         "> exact wording to vary.", "",
         "## Core glossary", "",
         "Terms that recur throughout the book. Learn these once and the whole novel",
         "gets easier.", ""]
    for section, entries in core.items():
        L.append(f"### {section.replace('_', ' ').title()}")
        L.append("")
        for e in entries:
            L.append(f"- **{e['w']}** - {e['d']}")
        L.append("")
    L += ["---", "", "## By chapter", ""]
    for n in range(1, N_CHAPTERS + 1):
        ch = chapters[n]
        L.append(f"### {n}. {ch['title']}")
        L.append("")
        L.append(f"*{ch['scene']}*")
        L.append("")
        for e in ch["words"]:
            L.append(f"- **{e['w']}** ({TAGS[e['t']]}) - {e['d']}")
        L.append("")
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    core, chapters = load()
    errs = validate(core, chapters)
    if errs:
        print("VALIDATION FAILED", file=sys.stderr)
        for e in errs:
            print("  " + e, file=sys.stderr)
        sys.exit(1)

    n_core = sum(len(v) for v in core.values())
    n_ch = sum(len(c["words"]) for c in chapters.values())
    print(f"ok: {len(chapters)} chapters, {n_ch} chapter entries, {n_core} core terms "
          f"({n_ch + n_core} total)")
    if args.check:
        return

    out = ROOT / "out"
    out.mkdir(exist_ok=True)
    (out / "monte-cristo-vocab.md").write_text(render_markdown(core, chapters))
    (out / "bundle.json").write_text(json.dumps(
        {"core": core, "chapters": {str(k): v for k, v in sorted(chapters.items())},
         "tags": TAGS}, ensure_ascii=False, separators=(",", ":")))
    print(f"wrote {out/'monte-cristo-vocab.md'}")
    print(f"wrote {out/'bundle.json'}")


if __name__ == "__main__":
    main()
