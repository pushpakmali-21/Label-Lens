"""
text_cleaner.py

Conservative text normalisation that preserves all legal tokens.
"""

import re


# Legal tokens that must never be removed or rewritten.
LEGAL_TOKENS = [
    "Provided that",
    "Provided further that",
    "Notwithstanding",
    "Subject to",
    "Explanation",
    "Exception",
    "Unless",
    "Except where",
    "Except",
    "In supersession of",
    "Amended by",
    "Substituted by",
    "Inserted by",
    "Omitted by",
]


def clean_text(text: str) -> str:
    """
    Apply conservative cleaning:
      - Normalise Windows line endings.
      - Remove excessive blank lines (>2 consecutive).
      - Remove accidental multiple spaces on a single line.
      - Do NOT touch legal tokens, parenthetical markers, or punctuation.
    """
    # Normalise line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Collapse runs of 3+ blank lines to 2 blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Collapse multiple spaces (but not newlines) on each line
    lines = []
    for line in text.split("\n"):
        line = re.sub(r"[ \t]+", " ", line)
        lines.append(line)
    text = "\n".join(lines)

    return text


def detect_headers_footers(pages: list[dict]) -> tuple[set[str], list[dict]]:
    """
    Heuristic header/footer detection.

    Strategy:
      - Extract first 3 lines and last 3 lines of each page.
      - Lines that appear on >= 40 % of pages are candidates.
      - Return a set of candidate strings and annotated pages.

    The original text is never modified. Candidates are flagged only.

    Returns:
        (candidate_set, annotated_pages)
        where annotated_pages[i]["probable_headers"] / ["probable_footers"]
        list the suspected lines.
    """
    if not pages:
        return set(), pages

    n_pages = len(pages)
    threshold = max(2, int(n_pages * 0.4))

    first_line_counts: dict[str, int] = {}
    last_line_counts: dict[str, int] = {}

    for page in pages:
        lines = [l for l in page["text"].split("\n") if l.strip()]
        for line in lines[:3]:
            stripped = line.strip()
            if stripped:
                first_line_counts[stripped] = first_line_counts.get(stripped, 0) + 1
        for line in lines[-3:]:
            stripped = line.strip()
            if stripped:
                last_line_counts[stripped] = last_line_counts.get(stripped, 0) + 1

    header_candidates = {k for k, v in first_line_counts.items() if v >= threshold}
    footer_candidates = {k for k, v in last_line_counts.items() if v >= threshold}
    all_candidates = header_candidates | footer_candidates

    annotated = []
    for page in pages:
        lines = [l for l in page["text"].split("\n") if l.strip()]
        probable_headers = [l.strip() for l in lines[:3] if l.strip() in header_candidates]
        probable_footers = [l.strip() for l in lines[-3:] if l.strip() in footer_candidates]
        annotated.append(
            {
                **page,
                "probable_headers": probable_headers,
                "probable_footers": probable_footers,
            }
        )

    return all_candidates, annotated
