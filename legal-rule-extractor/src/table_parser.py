"""
table_parser.py

Detects and extracts tables from page text.

Strategy:
  1. Detect pipe-delimited tables.
  2. Detect column-aligned whitespace tables.
  3. If reliable extraction fails, flag the page for manual review.
"""

import re
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TableResult:
    page: int
    extraction_status: str          # "extracted" | "manual_review_required"
    headers: list[str] = field(default_factory=list)
    rows: list[list[str]] = field(default_factory=list)
    raw_text: str = ""


def extract_tables_from_pages(pages: list[dict]) -> list[TableResult]:
    """Scan every page and extract tables found."""
    results = []
    for page_data in pages:
        tables = _find_tables_in_page(page_data["page"], page_data["text"])
        results.extend(tables)
    return results


def _find_tables_in_page(page_num: int, text: str) -> list[TableResult]:
    tables = []
    lines = text.split("\n")

    i = 0
    while i < len(lines):
        # Check for pipe-delimited table
        if "|" in lines[i]:
            block, end_i = _collect_pipe_block(lines, i)
            result = _parse_pipe_table(page_num, block)
            tables.append(result)
            i = end_i
            continue

        # Check for dash-separator hinting at a table
        if re.match(r"^[\s\-=|]{5,}$", lines[i]):
            block, end_i = _collect_aligned_block(lines, i)
            if len(block) >= 2:
                result = _parse_aligned_table(page_num, block)
                tables.append(result)
                i = end_i
                continue

        i += 1

    return tables


def _collect_pipe_block(lines: list[str], start: int) -> tuple[list[str], int]:
    block = []
    i = start
    while i < len(lines) and ("|" in lines[i] or re.match(r"^[\s\-=|]+$", lines[i])):
        block.append(lines[i])
        i += 1
    return block, i


def _collect_aligned_block(lines: list[str], start: int) -> tuple[list[str], int]:
    block = []
    i = start
    # Collect until we hit a blank line or non-tabular line
    while i < len(lines) and lines[i].strip():
        block.append(lines[i])
        i += 1
    return block, i


def _parse_pipe_table(page_num: int, block: list[str]) -> TableResult:
    """Parse a pipe-delimited table block."""
    try:
        data_lines = [l for l in block if "|" in l and not re.match(r"^[\s\-|]+$", l)]
        if not data_lines:
            return _manual_review(page_num, "\n".join(block))

        rows = []
        for line in data_lines:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            rows.append(cells)

        if not rows:
            return _manual_review(page_num, "\n".join(block))

        headers = rows[0]
        data_rows = rows[1:] if len(rows) > 1 else []

        return TableResult(
            page=page_num,
            extraction_status="extracted",
            headers=headers,
            rows=data_rows,
            raw_text="\n".join(block),
        )
    except Exception:
        return _manual_review(page_num, "\n".join(block))


def _parse_aligned_table(page_num: int, block: list[str]) -> TableResult:
    """
    Attempt to parse a whitespace-aligned table.
    If column detection is ambiguous, flag for manual review.
    """
    try:
        # Find column positions from the separator line
        sep_line = next((l for l in block if re.match(r"^[\s\-=]+$", l)), None)
        if sep_line is None:
            return _manual_review(page_num, "\n".join(block))

        # Detect column boundaries from positions of separator segments
        col_bounds = []
        in_segment = False
        start_pos = 0
        for idx, ch in enumerate(sep_line):
            if ch in "-=" and not in_segment:
                start_pos = idx
                in_segment = True
            elif ch not in "-=" and in_segment:
                col_bounds.append((start_pos, idx))
                in_segment = False
        if in_segment:
            col_bounds.append((start_pos, len(sep_line)))

        if len(col_bounds) < 2:
            return _manual_review(page_num, "\n".join(block))

        def split_line(line: str) -> list[str]:
            cells = []
            for start, end in col_bounds:
                cells.append(line[start:end].strip() if end <= len(line) else "")
            return cells

        data_lines = [l for l in block if not re.match(r"^[\s\-=]+$", l)]
        rows = [split_line(l) for l in data_lines]

        headers = rows[0] if rows else []
        data_rows = rows[1:] if len(rows) > 1 else []

        return TableResult(
            page=page_num,
            extraction_status="extracted",
            headers=headers,
            rows=data_rows,
            raw_text="\n".join(block),
        )
    except Exception:
        return _manual_review(page_num, "\n".join(block))


def _manual_review(page_num: int, raw: str) -> TableResult:
    return TableResult(
        page=page_num,
        extraction_status="manual_review_required",
        raw_text=raw,
    )
