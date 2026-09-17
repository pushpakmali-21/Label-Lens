"""
pdf_reader.py

Handles PDF opening, page-level text extraction, scanned-PDF detection,
and SHA-256 checksum generation.
"""

import hashlib
import fitz  # PyMuPDF


# BUG-09 FIX: Raised from 50 to 100 chars.
# 50 was too aggressive — chapter headings and TOC pages were falsely flagged.
# A page is only considered scanned when it has < 100 chars AND contains images.
SCANNED_CHARS_THRESHOLD = 100


def calculate_checksum(pdf_path: str) -> str:
    """Return SHA-256 hex digest of the PDF file."""
    sha256 = hashlib.sha256()
    with open(pdf_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def extract_pages(pdf_path: str) -> dict:
    """
    Open a PDF and return structured page data.

    Returns:
        {
            "page_count": int,
            "checksum": str,
            "is_scanned": bool,
            "scanned_page_indices": [int, ...],   # 1-based
            "pages": [
                {
                    "page": int,           # 1-based
                    "text": str,           # raw extracted text
                    "char_count": int,
                    "has_images": bool,    # true when page contains raster images
                }
            ],
        }
    """
    try:
        doc = fitz.open(pdf_path)
    except Exception as exc:
        raise RuntimeError(f"Cannot open PDF '{pdf_path}': {exc}") from exc

    checksum = calculate_checksum(pdf_path)
    pages = []
    scanned_pages = []

    try:
        for page_num, page in enumerate(doc, start=1):
            text = page.get_text("text")
            char_count = len(text.strip())

            # BUG-09 FIX: Use image presence as corroborating signal.
            # A page with few chars AND images is almost certainly scanned.
            # A page with few chars but NO images is just a short/blank page.
            has_images = len(page.get_images()) > 0
            is_page_scanned = char_count < SCANNED_CHARS_THRESHOLD and has_images

            if is_page_scanned:
                scanned_pages.append(page_num)

            pages.append(
                {
                    "page": page_num,
                    "text": text,
                    "char_count": char_count,
                    "has_images": has_images,
                }
            )
    finally:
        # BUG-10 FIX: Always close the fitz document to release the file handle.
        # Without this, processing 88 PDFs sequentially leaks file descriptors.
        doc.close()

    page_count = len(pages)
    total_chars = sum(p["char_count"] for p in pages)
    avg_chars = total_chars / page_count if page_count else 0
    # Document is scanned only if the majority of content pages are scanned
    is_scanned = len(scanned_pages) > max(1, page_count * 0.4)

    return {
        "page_count": page_count,
        "checksum": checksum,
        "is_scanned": is_scanned,
        "scanned_page_indices": scanned_pages,
        "pages": pages,
    }
