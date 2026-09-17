"""
metadata_extractor.py

Extracts document-level metadata from extracted page text.
Does NOT hallucinate — returns null for anything not found.
"""

import re
from typing import Optional


# BUG-06 FIX: Reordered so "rules" is checked first.
# Previously "notification" at index 1 matched before "rules" at index 6 because
# amendment reference lines contain the word "notification".
DOCUMENT_TYPE_PATTERNS = [
    (re.compile(r"\bRules?\b", re.IGNORECASE), "rules"),
    (re.compile(r"\bamendment\b", re.IGNORECASE), "amendment"),
    (re.compile(r"\bnotification\b", re.IGNORECASE), "notification"),
    (re.compile(r"\border\b", re.IGNORECASE), "order"),
    (re.compile(r"\bcircular\b", re.IGNORECASE), "circular"),
    (re.compile(r"\bexemption\b", re.IGNORECASE), "exemption"),
    (re.compile(r"\bschedule\b", re.IGNORECASE), "schedule"),
]

DATE_PATTERN = re.compile(
    r"\b(\d{1,2})[thstndrd]*\s+"
    r"(January|February|March|April|May|June|July|August|September|October|November|December)"
    r"\s*,?\s*(\d{4})\b",
    re.IGNORECASE,
)

YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")

TITLE_STOP_WORDS = {
    "government", "of", "india", "ministry", "department", "gazette",
    "extraordinary", "part", "section", "no", "page",
}

# Keywords that strongly indicate a title line
TITLE_KEYWORDS = re.compile(
    r"\b(Rules?|Act|Order|Notification|Regulations?|Directions?|Guidelines?)\b",
    re.IGNORECASE,
)


def extract_metadata(pages: list[dict], file_name: str) -> dict:
    """
    Scan the first 5 pages for document-level metadata.
    Returns a dict with fields matching the JSON schema.
    """
    # Use first 5 pages for metadata search
    head_text = "\n".join(p["text"] for p in pages[:5])
    first_page_text = pages[0]["text"] if pages else ""

    title = _extract_title(first_page_text)
    authority = _extract_authority(head_text)
    publication_date = _extract_date(head_text)
    doc_type = _extract_document_type(head_text, file_name)

    return {
        "title": title,
        "authority": authority,
        "department": _extract_department(head_text),
        "publication_date": publication_date,
        "effective_date": None,   # Cannot reliably extract — leave null
        "document_type": doc_type,
        "version": None,
    }


def _extract_title(text: str) -> Optional[str]:
    """
    BUG-05 FIX: Score-based title selection.

    Previously the function returned the first line with >=3 non-stop-words,
    which meant the Ministry line (which appears before the actual title) won.

    Now all candidate lines are scored:
    - ALL-CAPS or title-case: +3
    - Contains legal keywords (Rules, Act, Order, ...): +2
    - Has >=3 meaningful words: +1

    The highest-scoring candidate is returned.
    """
    candidates = []
    for line in text.split("\n"):
        stripped = line.strip()
        if len(stripped) < 10:
            continue
        score = 0
        if stripped.isupper() or stripped.istitle():
            score += 3
        if TITLE_KEYWORDS.search(stripped):
            score += 2
        words = stripped.lower().split()
        meaningful = [w for w in words if w not in TITLE_STOP_WORDS]
        if len(meaningful) >= 3:
            score += 1
        if score > 0:
            candidates.append((score, stripped))

    if not candidates:
        return None
    # Return the line with the highest score; tie-break by earliest occurrence
    return max(candidates, key=lambda x: x[0])[1]


def _extract_authority(text: str) -> Optional[str]:
    """Look for Ministry / Department lines."""
    for line in text.split("\n"):
        stripped = line.strip()
        if re.search(r"\b(Ministry|Department|Bureau|Directorate)\b", stripped, re.IGNORECASE):
            if len(stripped) < 120:
                return stripped
    return None


def _extract_department(text: str) -> Optional[str]:
    m = re.search(r"Department\s+of\s+[A-Za-z\s]+", text, re.IGNORECASE)
    if m:
        return m.group(0).strip()
    return None


def _extract_date(text: str) -> Optional[str]:
    m = DATE_PATTERN.search(text)
    if m:
        day, month, year = m.group(1), m.group(2), m.group(3)
        return f"{day} {month} {year}"
    # Fallback: year only
    m2 = YEAR_PATTERN.search(text)
    if m2:
        return m2.group(0)
    return None


def _extract_document_type(text: str, file_name: str) -> str:
    # BUG-06 FIX: Patterns now checked in priority order (rules first).
    # Also check filename separately to give it more weight.
    combined = text + " " + file_name
    for pattern, doc_type in DOCUMENT_TYPE_PATTERNS:
        if pattern.search(combined):
            return doc_type
    return "unknown"
