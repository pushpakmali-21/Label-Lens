"""
main.py

CLI entrypoint for the LMPC Legal Rule Extraction Pipeline.

Usage:
    python -m src.main input/sample.pdf
    python -m src.main input/sample.pdf --output output/
    python -m src.main input/sample.pdf --raw          # also save raw pages
    python -m src.main input/sample.pdf --doc-id LMPC_001
"""

import argparse
import hashlib
import json
import os
import sys
import traceback
from dataclasses import asdict
from pathlib import Path

from src.pdf_reader import extract_pages
from src.text_cleaner import clean_text, detect_headers_footers
from src.structure_detector import tokenise_pages
from src.rule_parser import RuleParser
from src.metadata_extractor import extract_metadata
from src.table_parser import extract_tables_from_pages
from src.validator import validate


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _doc_id_from_filename(file_name: str) -> str:
    # BUG-08 FIX: If stem exceeds 30 chars, append a 6-char MD5 suffix to
    # guarantee uniqueness. Previously bare truncation to [:20] could produce
    # identical doc IDs for two different files with long similar names.
    stem = Path(file_name).stem.upper().replace(" ", "_").replace("-", "_")
    if len(stem) > 30:
        suffix = hashlib.md5(stem.encode()).hexdigest()[:6].upper()
        stem = stem[:24] + "_" + suffix
    return stem


def _rules_to_dicts(rules) -> list[dict]:
    """Recursively convert Rule dataclass instances to plain dicts."""
    result = []
    for rule in rules:
        d = asdict(rule)
        result.append(d)
    return result


def _tables_to_dicts(tables) -> list[dict]:
    return [asdict(t) for t in tables]


def build_output(
    *,
    doc_id: str,
    file_name: str,
    page_data: dict,
    metadata: dict,
    rules: list,
    tables: list,
    validation_results: list,
    include_raw: bool,
    annotated_pages: list,
) -> dict:
    """Assemble the final JSON output dict."""
    output = {
        "document": {
            "document_id": doc_id,
            "file_name": file_name,
            "title": metadata.get("title"),
            "authority": metadata.get("authority"),
            "department": metadata.get("department"),
            "publication_date": metadata.get("publication_date"),
            "effective_date": metadata.get("effective_date"),
            "document_type": metadata.get("document_type", "unknown"),
            "version": metadata.get("version"),
            "page_count": page_data["page_count"],
            "checksum": page_data["checksum"],
        },
        "extraction": {
            "method": "ocr_required" if page_data["is_scanned"] else "pymupdf",
            "status": "needs_ocr" if page_data["is_scanned"] else "success",
            "scanned_pages": page_data["scanned_page_indices"],
        },
        "rules": _rules_to_dicts(rules),
        "tables": _tables_to_dicts(tables),
        "validation": [
            {
                "check": v.check,
                "passed": v.passed,
                "detail": v.detail,
            }
            for v in validation_results
        ],
    }

    if include_raw:
        output["raw_pages"] = [
            {"page": p["page"], "text": p["text"]}
            for p in annotated_pages
        ]

    return output


def print_report(
    file_name: str,
    page_data: dict,
    rules: list,
    tables: list,
    validation_results: list,
    output_path: str,
    warnings: list[str],
) -> None:
    """Print human-readable extraction quality report."""
    n_definitions = sum(len(r.definitions) for r in rules)
    n_tables = len(tables)
    n_scanned = len(page_data["scanned_page_indices"])
    n_warnings = len(warnings)
    passed = sum(1 for v in validation_results if v.passed)
    failed = [v for v in validation_results if not v.passed]

    sep = "─" * 50
    print(f"\n{sep}")
    print(f"Document   : {file_name}")
    print(f"Pages      : {page_data['page_count']}")
    print()

    if page_data["is_scanned"]:
        print("⚠  Extraction : OCR required — limited text extracted")
    else:
        print("✓  Extraction : Text extraction successful")

    print()
    print(f"Rules      : {len(rules)} provisions detected")
    print(f"Definitions: {n_definitions} detected")
    print(f"Tables     : {n_tables} detected")
    print(f"Scanned pgs: {n_scanned}")
    print(f"Warnings   : {n_warnings}")
    print()

    print(f"Validation : {passed}/{len(validation_results)} checks passed")
    if failed:
        for v in failed:
            print(f"  ✗ {v.check}: {v.detail}")

    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  ! {w}")

    print()
    print(f"Output     : {output_path}")
    print(sep)


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_pipeline(pdf_path: str, output_dir: str, doc_id: str, include_raw: bool) -> int:
    """
    Full extraction pipeline. Returns exit code (0 = success, 1 = failure).
    """
    pdf_path = os.path.abspath(pdf_path)
    file_name = os.path.basename(pdf_path)
    warnings: list[str] = []

    if not os.path.isfile(pdf_path):
        print(f"ERROR: File not found: {pdf_path}", file=sys.stderr)
        return 1

    if not doc_id:
        doc_id = _doc_id_from_filename(file_name)

    os.makedirs(output_dir, exist_ok=True)
    stem = Path(file_name).stem
    output_json_path = os.path.join(output_dir, f"{stem}.json")
    output_raw_path = os.path.join(output_dir, f"{stem}.raw.json")

    # ------------------------------------------------------------------
    # Step 1: PDF reading + checksum
    # ------------------------------------------------------------------
    try:
        page_data = extract_pages(pdf_path)
    except RuntimeError as exc:
        print(f"\nERROR:\n{exc}", file=sys.stderr)
        return 1

    if page_data["is_scanned"]:
        warnings.append(
            f"PDF appears scanned. Scanned pages: {page_data['scanned_page_indices']}. "
            "OCR required for full extraction."
        )

    # ------------------------------------------------------------------
    # Step 2: Text cleaning + header/footer detection
    # ------------------------------------------------------------------
    for page in page_data["pages"]:
        page["text"] = clean_text(page["text"])

    hf_candidates, annotated_pages = detect_headers_footers(page_data["pages"])
    if hf_candidates:
        warnings.append(
            f"Probable headers/footers detected on multiple pages: "
            f"{list(hf_candidates)[:5]}"
        )

    # ------------------------------------------------------------------
    # Step 3: Structure detection + rule parsing
    # ------------------------------------------------------------------
    tokens = tokenise_pages(annotated_pages)
    parser = RuleParser(doc_id=doc_id)
    rules = parser.parse(tokens)

    if not rules:
        warnings.append("No rules detected. Check document structure.")

    # Warn if many pages couldn't be parsed
    total_pages = page_data["page_count"]
    if total_pages > 0:
        pages_with_content = sum(
            1 for p in page_data["pages"] if p["char_count"] > 50
        )
        if pages_with_content / total_pages < 0.5:
            warnings.append(
                f"Only {pages_with_content}/{total_pages} pages had extractable text. "
                "Possible scanned content on remaining pages."
            )

    # ------------------------------------------------------------------
    # Step 4: Table detection
    # ------------------------------------------------------------------
    tables = extract_tables_from_pages(annotated_pages)
    manual_review_tables = [t for t in tables if t.extraction_status == "manual_review_required"]
    if manual_review_tables:
        warnings.append(
            f"{len(manual_review_tables)} table(s) flagged for manual review."
        )

    # ------------------------------------------------------------------
    # Step 5: Metadata extraction
    # ------------------------------------------------------------------
    metadata = extract_metadata(annotated_pages, file_name)

    # ------------------------------------------------------------------
    # Step 6: Build output JSON
    # ------------------------------------------------------------------
    output = build_output(
        doc_id=doc_id,
        file_name=file_name,
        page_data=page_data,
        metadata=metadata,
        rules=rules,
        tables=tables,
        validation_results=[],
        include_raw=include_raw,
        annotated_pages=annotated_pages,
    )

    # ------------------------------------------------------------------
    # Step 7: Validation
    # ------------------------------------------------------------------
    validation_results = validate(output)
    output["validation"] = [
        {"check": v.check, "passed": v.passed, "detail": v.detail}
        for v in validation_results
    ]

    # ------------------------------------------------------------------
    # Step 8: Save JSON
    # ------------------------------------------------------------------
    # If --raw flag, save raw pages to separate file and remove from main JSON
    if include_raw and "raw_pages" in output:
        raw_data = {"document_id": doc_id, "raw_pages": output.pop("raw_pages")}
        with open(output_raw_path, "w", encoding="utf-8") as f:
            json.dump(raw_data, f, ensure_ascii=False, indent=2)
        print(f"Raw pages saved to: {output_raw_path}")

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    # ------------------------------------------------------------------
    # Step 9: Print report
    # ------------------------------------------------------------------
    print_report(
        file_name=file_name,
        page_data=page_data,
        rules=rules,
        tables=tables,
        validation_results=validation_results,
        output_path=output_json_path,
        warnings=warnings,
    )

    failed_checks = [v for v in validation_results if not v.passed]
    return 1 if failed_checks else 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="LMPC Legal Rule Extraction Pipeline — extract structured JSON from legal PDFs.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m src.main input/sample.pdf
  python -m src.main input/sample.pdf --output output/
  python -m src.main input/sample.pdf --raw
  python -m src.main input/sample.pdf --doc-id LMPC_001
        """,
    )
    parser.add_argument("pdf", help="Path to input PDF file")
    parser.add_argument(
        "--output", "-o", default="output/", help="Output directory (default: output/)"
    )
    parser.add_argument(
        "--doc-id", default="", help="Override document ID (auto-generated from filename if not set)"
    )
    parser.add_argument(
        "--raw", action="store_true", help="Also save raw page text to a separate .raw.json file"
    )

    args = parser.parse_args()

    try:
        exit_code = run_pipeline(
            pdf_path=args.pdf,
            output_dir=args.output,
            doc_id=args.doc_id,
            include_raw=args.raw,
        )
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        sys.exit(1)
    except Exception:
        print("\nUNEXPECTED ERROR:", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
