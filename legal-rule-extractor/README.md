# LMPC Legal Rule Extractor

Python pipeline that extracts structured legal provisions from government PDFs and outputs traceable JSON.

## What it does

```
PDF → validate → extract pages → clean text → detect structure → parse rules/subsections/clauses → detect tables → extract metadata → validate → JSON
```

## What it does NOT do

- No LLM. No summarisation. No paraphrasing.
- No PostgreSQL/MongoDB. No embeddings.
- Original legal wording is preserved verbatim.

---

## Setup

```bash
cd legal-rule-extractor
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Usage

```bash
# Basic
python -m src.main input/sample.pdf

# Custom output directory
python -m src.main input/sample.pdf --output output/

# Also save raw page text (useful for debugging)
python -m src.main input/sample.pdf --raw

# Override document ID
python -m src.main input/sample.pdf --doc-id LMPC_001
```

Output:
```
output/
├── sample.json          # structured extraction
└── sample.raw.json      # (if --raw) page-level raw text
```

---

## Output JSON Structure

```json
{
  "document": {
    "document_id": "LMPC_001",
    "file_name": "LMPC_Rules_2011.pdf",
    "title": "...",
    "authority": "...",
    "publication_date": "...",
    "document_type": "rules",
    "page_count": 120,
    "checksum": "sha256..."
  },
  "extraction": {
    "method": "pymupdf",
    "status": "success",
    "scanned_pages": []
  },
  "rules": [
    {
      "rule_id": "LMPC_001_RULE_001",
      "rule_number": "1",
      "title": "Short title and commencement",
      "page_start": 1,
      "page_end": 1,
      "text": "...",
      "subsections": [
        {
          "subsection_id": "LMPC_001_RULE_001_SUB_001",
          "subsection_label": "1(1)",
          "text": "...",
          "clauses": [
            {
              "clause_id": "LMPC_001_RULE_001_SUB_001_CLAUSE_001",
              "clause_label": "(a)",
              "text": "...",
              "provisos": []
            }
          ],
          "provisos": []
        }
      ],
      "provisos": [],
      "definitions": [],
      "amendment_refs": []
    }
  ],
  "tables": [],
  "validation": []
}
```

---

## Scanned PDFs

If a PDF has no extractable text:

```json
{
  "extraction": {
    "method": "ocr_required",
    "status": "needs_ocr"
  }
}
```

OCR support can be added later as a separate module.

---

## Running Tests

```bash
python -m pytest tests/ -v
```

---

## Project Structure

```
legal-rule-extractor/
├── input/                    # Place PDFs here
├── output/                   # Extracted JSON written here
├── src/
│   ├── __init__.py
│   ├── main.py               # CLI entrypoint
│   ├── pdf_reader.py         # PyMuPDF extraction + checksum + scanned detection
│   ├── text_cleaner.py       # Conservative normalisation + header/footer detection
│   ├── structure_detector.py # Regex-based legal line classification
│   ├── rule_parser.py        # Hierarchical Rule/Subsection/Clause builder
│   ├── metadata_extractor.py # Document-level metadata (no hallucination)
│   ├── table_parser.py       # Pipe and aligned table extraction
│   └── validator.py          # 12-point validation checklist
├── tests/
│   ├── __init__.py
│   ├── test_pdf_reader.py
│   ├── test_parser.py
│   └── test_validator.py
├── requirements.txt
└── README.md
```

---

## Development Strategy

Test on **5–10 representative PDFs first**. Choose PDFs with:

1. Normal rules
2. Nested clauses
3. Exceptions / provisos
4. Definitions
5. Tables
6. Amendments
7. Multi-page rules
8. Scanned pages

Only after schema and parser are reliable, process all 88 PDFs.
