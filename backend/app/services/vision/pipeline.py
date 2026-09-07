"""
app/services/vision/pipeline.py
─────────────────────────────────
Sprint 2 vision pipeline orchestrator.

``VisionPipeline`` wires together all vision sub-stages:

  1. Base64 decode  — validate and decode the incoming image string
  2. Preprocess     — stub (Sprint 1) or real OpenCV (Sprint 2+)
  3. Detect         — ``VisionDetector`` (stub or real YOLO)
  4. OCR            — ``OCREngine`` per detected region (stub or real PaddleOCR)
  5. Calibrate      — coin-based px→mm ratio
  6. Extract        — ``map_ocr_to_fields`` → ``ExtractedPackageFields``
  7. Validate       — ``validate_package_data`` → (fields, violations, verdict)
  8. Confidence     — downgrade verdict when field confidence is low

No ML dependencies are imported here.  The pipeline accepts any object that
satisfies the ``VisionDetector`` / ``OCREngine`` protocols.

Public API
──────────
PipelineResult      — dataclass carrying all outputs
VisionPipeline      — orchestrator class
"""

from __future__ import annotations

import base64
import binascii
from dataclasses import dataclass, field
from typing import Optional

from app.services.vision.calibration import CalibrationResult, compute_calibration
from app.services.vision.detector import StubDetector, VisionDetector
from app.services.vision.extractor import ExtractionResult, map_ocr_to_fields
from app.services.vision.ocr import OCREngine, StubOCREngine
from app.services.vision.preprocessing import preprocess_image
from app.services.vision.types import (
    ConfidenceScore,
    DetectedRegion,
    ExtractedPackageFields,
    OCRTextBlock,
    PreprocessingResult,
)
from app.utils.lmpc_validator import validate_package_data

# Confidence threshold below which a "pass" is downgraded to "review"
_REVIEW_THRESHOLD: float = 75.0


# ── Result type ────────────────────────────────────────────────────────────────

@dataclass
class PipelineResult:
    """
    Comprehensive output of a single ``VisionPipeline.run()`` call.

    Attributes:
        extracted_fields:   Typed package field container.
        field_confidences:  Per-field confidence scores (0–100).
        regions:            Raw detector output.
        ocr_blocks:         All OCR text blocks, keyed by region label.
        preprocessing_meta: Metadata about the preprocessing step.
        calibration:        Calibration result from coin detection.
        fields:             Validated ``FieldResult`` dicts (validator output).
        violations:         ``ViolationResult`` dicts (validator output).
        verdict:            One of ``"pass"``, ``"review"``, ``"fail"``.
        verdict_note:       Human-readable explanation of the verdict.
        image_decode_ok:    False when the input base64 string was invalid.
    """
    extracted_fields: ExtractedPackageFields
    field_confidences: list[ConfidenceScore] = field(default_factory=list)
    regions: list[DetectedRegion] = field(default_factory=list)
    ocr_blocks: dict[str, list[OCRTextBlock]] = field(default_factory=dict)
    preprocessing_meta: Optional[PreprocessingResult] = None
    calibration: Optional[CalibrationResult] = None
    fields: list[dict] = field(default_factory=list)
    violations: list[dict] = field(default_factory=list)
    verdict: str = "fail"
    verdict_note: str = ""
    image_decode_ok: bool = True


# ── Pipeline ───────────────────────────────────────────────────────────────────

class VisionPipeline:
    """
    Full vision compliance-scan pipeline.

    Accepts any ``VisionDetector`` and ``OCREngine`` implementation, making it
    straightforward to swap stubs for real ML backends without changing callers.

    Example — offline stub::

        pipeline = VisionPipeline()
        result = pipeline.run(image_b64)

    Example — future real backend::

        from app.services.vision.adapters.yolo import YOLOv8Detector
        from app.services.vision.adapters.paddle import PaddleOCREngine
        pipeline = VisionPipeline(
            detector=YOLOv8Detector("weights/label_lens_v1.pt"),
            ocr_engine=PaddleOCREngine(lang="en"),
        )
        result = pipeline.run(image_b64)
    """

    def __init__(
        self,
        detector: Optional[VisionDetector] = None,
        ocr_engine: Optional[OCREngine] = None,
    ) -> None:
        """
        Args:
            detector:   Object satisfying ``VisionDetector``.  Defaults to
                        ``StubDetector`` when ``None``.
            ocr_engine: Object satisfying ``OCREngine``.  Defaults to
                        ``StubOCREngine`` when ``None``.
        """
        self._detector: VisionDetector = detector or StubDetector()
        self._ocr: OCREngine = ocr_engine or StubOCREngine()

    # ── Public API ─────────────────────────────────────────────────────────────

    def run(self, image_b64: str) -> PipelineResult:
        """
        Execute the full pipeline for a single image.

        Gracefully handles invalid or empty base64 input: the image decode
        step sets ``image_decode_ok=False`` and the result carries a
        ``fail`` verdict rather than raising an exception.

        Args:
            image_b64: Base64-encoded image string (JPEG or PNG).

        Returns:
            ``PipelineResult`` with all stage outputs and the final verdict.
        """
        # ── Stage 1: Base64 decode ────────────────────────────────────────────
        image_bytes, decode_ok = self._decode_image(image_b64)
        if not decode_ok:
            return self._decode_failure_result(image_b64)

        # ── Stage 2: Preprocess ───────────────────────────────────────────────
        preprocess_meta = preprocess_image(image_bytes)
        # Sprint 2: real pipeline uses preprocess_meta.processed_image_b64
        # as the source for detection; stub passes original b64 unchanged.
        source_b64 = preprocess_meta.processed_image_b64 or image_b64

        # ── Stage 3: Detect ───────────────────────────────────────────────────
        regions = self._detector.detect(source_b64)

        # ── Stage 4: OCR per region ───────────────────────────────────────────
        ocr_blocks: dict[str, list[OCRTextBlock]] = {}
        for region in regions:
            ocr_blocks[region.label] = self._ocr.run(region)

        # ── Stage 5: Calibrate ────────────────────────────────────────────────
        coin_region = next((r for r in regions if r.label == "coin"), None)
        calibration = compute_calibration(coin_region)

        # ── Stage 6: Extract ──────────────────────────────────────────────────
        extraction: ExtractionResult = map_ocr_to_fields(
            regions, ocr_blocks, calibration
        )

        # ── Stage 7: Validate ─────────────────────────────────────────────────
        extracted_dict = extraction.package_fields.to_dict()
        ocr_full_text = extraction.package_fields.ocr_full_text
        val_fields, val_violations, verdict, verdict_note = validate_package_data(
            extracted_dict, ocr_full_text
        )

        # ── Stage 8: Confidence-based verdict downgrade ───────────────────────
        verdict, verdict_note = self._apply_confidence_routing(
            verdict, verdict_note, extraction.field_confidences
        )

        return PipelineResult(
            extracted_fields=extraction.package_fields,
            field_confidences=extraction.field_confidences,
            regions=regions,
            ocr_blocks=ocr_blocks,
            preprocessing_meta=preprocess_meta,
            calibration=calibration,
            fields=val_fields,
            violations=val_violations,
            verdict=verdict,
            verdict_note=verdict_note,
            image_decode_ok=True,
        )

    # ── Helpers ────────────────────────────────────────────────────────────────

    @staticmethod
    def _decode_image(image_b64: str) -> tuple[bytes, bool]:
        """
        Attempt to base64-decode the image string.

        Returns:
            ``(bytes, True)`` on success.
            ``(b"", False)`` when the string is empty, whitespace-only, or
            not valid base64.
        """
        stripped = (image_b64 or "").strip()
        if not stripped:
            return b"", False
        try:
            # Pad if needed
            padding = 4 - len(stripped) % 4
            if padding != 4:
                stripped += "=" * padding
            decoded = base64.b64decode(stripped, validate=True)
            return decoded, True
        except (binascii.Error, ValueError):
            return b"", False

    @staticmethod
    def _decode_failure_result(image_b64: str) -> PipelineResult:
        """
        Build a clean fail result when image decoding fails.

        Returns a ``PipelineResult`` with a single critical violation
        (``invalid_image``) rather than raising, so the endpoint can
        return a well-formed ``ScanResponse``.
        """
        empty_fields = ExtractedPackageFields()
        violation = {
            "field": "image_base64",
            "plain": "Image could not be decoded — invalid or empty base64 string.",
            "rule": "Rule 6(1)",
            "severity": "critical",
        }
        return PipelineResult(
            extracted_fields=empty_fields,
            fields=[],
            violations=[violation],
            verdict="fail",
            verdict_note="Image input is invalid. Please provide a valid base64-encoded image.",
            image_decode_ok=False,
        )

    @staticmethod
    def _apply_confidence_routing(
        verdict: str,
        verdict_note: str,
        field_confidences: list[ConfidenceScore],
    ) -> tuple[str, str]:
        """
        Downgrade a ``"pass"`` verdict to ``"review"`` when any field
        confidence falls below the ``_REVIEW_THRESHOLD``.

        A ``"fail"`` verdict is never upgraded; a ``"review"`` verdict is
        not double-downgraded.

        Args:
            verdict:           Current verdict from the validator.
            verdict_note:      Current note from the validator.
            field_confidences: Per-field confidence scores (0–100 scale).

        Returns:
            Updated ``(verdict, verdict_note)`` tuple.
        """
        if verdict != "pass" or not field_confidences:
            return verdict, verdict_note

        min_conf = min(fc.confidence for fc in field_confidences)
        if min_conf < _REVIEW_THRESHOLD:
            return (
                "review",
                (
                    f"Low extraction confidence ({min_conf:.1f}%) on one or more "
                    "fields — manual review recommended before issuing a citation."
                ),
            )
        return verdict, verdict_note
