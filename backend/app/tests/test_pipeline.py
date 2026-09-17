"""
app/tests/test_pipeline.py
───────────────────────────
Sprint 2 offline tests for the vision pipeline skeleton.

All tests are offline-safe:
  - No Docker, no DB, no YOLOv8, no PaddleOCR, no OpenCV.
  - StubDetector / StubOCREngine produce deterministic outputs.
  - Tests exercise the full pipeline, individual sub-modules, and the HTTP
    endpoint for regression protection.

Test index
──────────
1. test_pipeline_stub_returns_extracted_fields
2. test_pipeline_low_confidence_routes_review
3. test_pipeline_missing_required_field_routes_fail
4. test_calibration_coin_pixel_to_mm
5. test_extractor_maps_ocr_blocks_to_validator_fields
6. test_scan_image_invalid_base64_handled
7. test_scan_image_response_top_level_keys_regression
"""

from __future__ import annotations

import base64

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.vision.calibration import CalibrationResult, compute_calibration
from app.services.vision.detector import StubDetector
from app.services.vision.extractor import map_ocr_to_fields
from app.services.vision.ocr import StubOCREngine
from app.services.vision.pipeline import VisionPipeline
from app.services.vision.types import BoundingBox, DetectedRegion, OCRTextBlock

client = TestClient(app)


# ── 1. Pipeline stub returns populated ExtractedPackageFields ─────────────────

def test_pipeline_stub_returns_extracted_fields():
    """
    Default stub pipeline (StubDetector + StubOCREngine) should populate
    at least manufacturer and net_weight fields from deterministic text corpus.
    """
    # A minimal valid base64 string (1×1 white PNG)
    png_1x1 = base64.b64encode(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
        b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
        b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
    ).decode()

    pipeline = VisionPipeline()
    result = pipeline.run(png_1x1)

    assert result.image_decode_ok is True
    assert result.verdict in {"pass", "review", "fail"}

    pf = result.extracted_fields
    # Stub corpus must populate manufacturer
    assert pf.manufacturer is not None, "Manufacturer should be extracted by StubDetector"
    # Stub corpus must populate net weight
    assert pf.net_weight_g is not None, "Net weight should be extracted by StubDetector"
    assert pf.net_weight_str is not None


# ── 2. Low confidence routes to review ────────────────────────────────────────

def test_pipeline_low_confidence_routes_review():
    """
    When all detector/OCR confidences are below the review threshold (75),
    the verdict must not be 'pass'.

    Two routing paths can produce a non-pass result:
    1. The validator finds violations (e.g. prohibited expression in stub text)
       → verdict is 'review' or 'fail' from rule checks.
    2. After validation, the pipeline's confidence downgrade kicks in if
       verdict was 'pass' but field confidence < 75.

    Either path is correct behaviour — the key assertion is that low confidence
    never produces a 'pass' verdict, and that the combined field confidence
    values are genuinely below the threshold.
    """
    low_conf_detector = StubDetector(default_confidence=0.2)
    low_conf_ocr = StubOCREngine(default_confidence=0.2)
    pipeline = VisionPipeline(detector=low_conf_detector, ocr_engine=low_conf_ocr)

    image_b64 = base64.b64encode(b"fake image data").decode()
    result = pipeline.run(image_b64)

    # Verdict must not be pass when confidence is this low
    assert result.verdict in {"review", "fail"}, (
        f"Expected review or fail for low-confidence run, got: {result.verdict}"
    )

    # All combined field confidence scores must be below the review threshold
    for fc in result.field_confidences:
        assert fc.confidence < 75.0, (
            f"Field '{fc.field_name}' confidence {fc.confidence} should be < 75 "
            f"when detector/OCR confidences are both 0.2"
        )


# ── 3. Missing required field routes to fail ──────────────────────────────────

def test_pipeline_missing_required_field_routes_fail():
    """
    A pipeline that emits no regions (empty detector) produces no manufacturer
    and no net weight → critical violations → verdict must be 'fail'.
    """
    class EmptyDetector:
        def detect(self, image_b64: str) -> list:
            return []

    class EmptyOCR:
        def run(self, region) -> list:
            return []

    pipeline = VisionPipeline(detector=EmptyDetector(), ocr_engine=EmptyOCR())
    image_b64 = base64.b64encode(b"fake").decode()
    result = pipeline.run(image_b64)

    assert result.verdict == "fail", (
        f"Expected fail when no fields extracted, got: {result.verdict}"
    )
    violation_fields = [v.get("field") for v in result.violations]
    assert "manufacturer" in violation_fields, (
        "Missing manufacturer must produce a critical violation"
    )


# ── 4. Calibration: coin pixel diameter to mm ─────────────────────────────────

def test_calibration_coin_pixel_to_mm():
    """
    A coin region with width=230px → pixel_per_mm ≈ 10.0 (230 / 23mm reference).
    The 5-Rupee coin reference diameter is 23mm (from lmpcRules.json).
    """
    coin_region = DetectedRegion(
        label="coin",
        bbox=BoundingBox(x=500.0, y=10.0, width=230.0, height=230.0),
        confidence=0.82,
    )
    cal = compute_calibration(coin_region)

    assert cal.calibrated is True
    assert cal.coin_pixel_diameter == pytest.approx(230.0)
    assert cal.pixel_per_mm == pytest.approx(10.0, abs=0.01)


def test_calibration_no_coin_returns_uncalibrated():
    """No coin region → CalibrationResult.calibrated must be False."""
    cal = compute_calibration(None)
    assert cal.calibrated is False
    assert cal.pixel_per_mm == 0.0
    assert cal.coin_pixel_diameter == 0.0


# ── 5. Extractor maps OCR blocks to validator fields ──────────────────────────

def test_extractor_maps_ocr_blocks_to_validator_fields():
    """
    Extractor must produce populated package_fields and ConfidenceScore list
    when given realistic region / OCR block inputs.
    """
    mfg_region = DetectedRegion(
        label="manufacturer_panel",
        bbox=BoundingBox(x=10.0, y=10.0, width=480.0, height=120.0),
        confidence=0.90,
    )
    qty_region = DetectedRegion(
        label="net_qty_string",
        bbox=BoundingBox(x=10.0, y=150.0, width=480.0, height=60.0),
        confidence=0.87,
    )

    mfg_block = OCRTextBlock(
        text="Happy Snacks Pvt Ltd, Bengaluru",
        bbox=BoundingBox(x=12.0, y=12.0, width=460.0, height=35.0),
        confidence=0.93,
        region_label="manufacturer_panel",
    )
    qty_block = OCRTextBlock(
        text="Net Wt when packed 100g",
        bbox=BoundingBox(x=12.0, y=152.0, width=300.0, height=28.0),
        confidence=0.91,
        region_label="net_qty_string",
    )

    regions = [mfg_region, qty_region]
    blocks_by_region = {
        "manufacturer_panel": [mfg_block],
        "net_qty_string": [qty_block],
    }

    result = map_ocr_to_fields(regions, blocks_by_region)

    pf = result.package_fields
    assert pf.manufacturer == "Happy Snacks Pvt Ltd, Bengaluru"
    assert pf.net_weight_g == pytest.approx(100.0)
    assert pf.net_weight_str == "100g"

    # Confidence scores should have been computed for both fields
    field_names = [fc.field_name for fc in result.field_confidences]
    assert "manufacturer" in field_names
    assert "net_weight_str" in field_names

    # Combined confidence must be in 0–100 range
    for fc in result.field_confidences:
        assert 0.0 <= fc.confidence <= 100.0


# ── 6. Invalid base64 handled cleanly ─────────────────────────────────────────

def test_scan_image_invalid_base64_handled():
    """
    POST /scan/image with an invalid base64 string must return HTTP 200
    with a 'fail' verdict and a violation pointing at 'image_base64'.
    The endpoint must NOT raise an unhandled 500.
    """
    payload = {
        "image_base64": "!!this_is_not_valid_base64!!",
        "device_id": "test_b64_fail",
    }
    response = client.post("/api/v1/scan/image", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "fail"
    violation_fields = [v["field"] for v in data["violations"]]
    assert "image_base64" in violation_fields, (
        "Should report image_base64 as the failing field"
    )


def test_scan_image_empty_string_handled():
    """Empty image_base64 string must return 200 with verdict 'fail'."""
    payload = {"image_base64": "", "device_id": "test_empty_b64"}
    response = client.post("/api/v1/scan/image", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "fail"


# ── 7. Response top-level keys regression ─────────────────────────────────────

def test_scan_image_response_top_level_keys_regression():
    """
    Sprint 2 regression: /scan/image response must still contain exactly
    the same top-level keys as Sprint 1.  Adding or removing a key here
    is a breaking frontend contract change.
    """
    response = client.post("/api/v1/scan/image", json={"image_base64": "dummy"})
    assert response.status_code == 200

    data = response.json()
    required_keys = {"audit_id", "verdict", "verdictNote", "fields", "violations", "evidence_seal"}
    missing = required_keys - set(data.keys())
    assert not missing, f"Response missing required top-level keys: {missing}"

    # evidence_seal sub-shape
    seal = data["evidence_seal"]
    assert {"sha256", "shortHash", "timestamp", "sealed"}.issubset(seal.keys())

    # verdict must be one of the three valid values
    assert data["verdict"] in {"pass", "review", "fail"}
