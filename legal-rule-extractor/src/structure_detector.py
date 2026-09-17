"""
structure_detector.py

Detects the structural hierarchy present in the extracted text
and classifies line types (chapter, rule, subsection, clause, proviso, etc.).
"""

import re
from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Regex patterns for common legal document structures
# ---------------------------------------------------------------------------

PATTERNS = {
    # Chapter headings: "CHAPTER I", "CHAPTER - I", "CHAPTER 1"
    "chapter": re.compile(
        r"^\s*CHAPTER\s+[-–]?\s*([IVXLCDM]+|\d+)\b",
        re.IGNORECASE,
    ),

    # Rule headings: "Rule 1", "RULE 2.", or bare "1.  Title" (2+ spaces after dot).
    # BUG-02 FIX: The second alternative now requires 2+ spaces after the period
    # to avoid matching numbered list items like "1. package means..." in definitions.
    "rule": re.compile(
        r"^\s*(?:Rule|RULE)\s+(\d+[A-Za-z]?)\.?(?:\s|$)"
        r"|^\s*(\d+[A-Za-z]?)\.\s{2,}[A-Z]",
    ),

    # Section headings: "Section 1", "Section 2A"
    "section": re.compile(
        r"^\s*(?:Section|SECTION)\s+(\d+[A-Za-z]?)\.?(?:\s|$)",
    ),

    # Subsection: "1(1)", "6(2)", "Rule 6(1)" — parenthesised number.
    # Two capture groups: group(1) = rule number, group(2) = subsection number.
    # BUG-04 FIX: Both groups are combined in classify_line() below.
    "subsection": re.compile(
        r"^\s*(\d+[A-Za-z]?)\s*\((\d+)\)\s*[-–.]?\s*",
    ),

    # Clause: "(a)", "(b)", "(i)", "(ii)", "(iii)" at line start
    "clause": re.compile(
        r"^\s*\(([a-z]+|[ivxlcdm]+|\d+)\)\s+",
        re.IGNORECASE,
    ),

    # Sub-clause: "(i)(a)", nested patterns
    "sub_clause": re.compile(
        r"^\s*\([ivxlcdm]+\)\s*\([a-z]\)\s+",
        re.IGNORECASE,
    ),

    # Proviso / exception keywords at line or sentence start
    "proviso": re.compile(
        r"(?:^|\.\s+)(Provided\s+(?:further\s+)?that|Notwithstanding|Subject\s+to"
        r"|Unless|Except(?:\s+where)?|In\s+supersession\s+of)",
        re.IGNORECASE,
    ),

    # Explanation block
    "explanation": re.compile(
        r"^\s*Explanation\s*[-–.]?\s*",
        re.IGNORECASE,
    ),

    # Definition pattern: "means", "includes" after a quoted term
    "definition": re.compile(
        r'["\u201c\u2018]([^"\u201d\u2019]+)["\u201d\u2019]\s+(?:means|includes)\b',
        re.IGNORECASE,
    ),

    # Schedule / Appendix
    "schedule": re.compile(
        r"^\s*(?:Schedule|SCHEDULE|Appendix|APPENDIX)\s+",
        re.IGNORECASE,
    ),

    # Amendment references inside text
    "amendment_ref": re.compile(
        r"\b(?:amended|substituted|inserted|omitted)\s+by\b",
        re.IGNORECASE,
    ),

    # Table indicator: row of dashes or pipe characters
    "table_row": re.compile(
        r"(?:\|.+\|)|(?:[-=]{5,})",
    ),
}


@dataclass
class LineToken:
    """Classified line token."""

    line_number: int          # 0-based index within page text
    page: int                 # 1-based page number
    raw: str                  # original line
    line_type: str            # chapter/rule/section/subsection/clause/…
    identifier: Optional[str] = None   # extracted number/letter (or full label like "6(1)")
    text: str = ""            # cleaned text body


def classify_line(line: str, page: int, line_number: int) -> LineToken:
    """Classify a single text line into a legal structure token."""
    stripped = line.strip()

    for token_type, pattern in PATTERNS.items():
        m = pattern.search(stripped)
        if m:
            # BUG-04 FIX: For subsection, combine both capture groups into
            # the full label e.g. "6(1)" not just "6".
            if token_type == "subsection" and len(m.groups()) >= 2:
                g1 = m.group(1) or ""
                g2 = m.group(2) or ""
                identifier = f"{g1}({g2})" if g2 else g1
            else:
                identifier = next((g for g in m.groups() if g), None) if m.groups() else None

            return LineToken(
                line_number=line_number,
                page=page,
                raw=line,
                line_type=token_type,
                identifier=identifier,
                text=stripped,
            )

    return LineToken(
        line_number=line_number,
        page=page,
        raw=line,
        line_type="text",
        text=stripped,
    )


def tokenise_pages(pages: list[dict]) -> list[LineToken]:
    """
    Convert all pages into a flat list of classified LineTokens.
    Preserves page attribution for every line.
    """
    tokens: list[LineToken] = []
    for page_data in pages:
        page_num = page_data["page"]
        lines = page_data["text"].split("\n")
        for idx, line in enumerate(lines):
            if not line.strip():
                continue
            token = classify_line(line, page=page_num, line_number=idx)
            tokens.append(token)
    return tokens
