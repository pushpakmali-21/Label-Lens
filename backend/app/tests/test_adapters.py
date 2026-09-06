"""
app/tests/test_adapters.py
───────────────────────────
Tests for optional adapter import guards and the dual-path preprocessing module.

All tests are offline-safe:
  - No YOLOv8, no PaddleOCR, no OpenCV required.
  - Tests verify that importing adapter modules never crashes.
  - Tests verify that constructing adapters without the deps raises
    a clear ImportError (not AttributeError or ModuleNotFoundError from
    inside the library).
  - Tests verify preprocessing falls back cleanly without cv2.

These tests use ``unittest.mock.patch`` to simulate missing dependencies
so they pass in any environment regardless of what is installed.
"""

from __future__ import annotations

import base64
import sys
import types
from unittest.mock import MagicMock, patch

import pytest


# ── Adapter module import guards ──────────────────────────────────────────────

def test_yolo_module_imports_without_ultralytics():
    """
    Importing adapters.yolo must never raise ImportError even when
    'ultralytics' is not installed.
    """
    # Remove ultralytics from sys.modules to simulate absence
    with patch.dict(sys.modules, {"ultralytics": None}):
        # Should not raise at import time
        from app.services.vision.adapters import yolo  # noqa: F401  # reimport is fine


def test_paddle_module_imports_without_paddleocr():
    """
    Importing adapters.paddle must never raise ImportError even when
    'paddleocr' is not installed.
    """
    with patch.dict(sys.modules, {"paddleocr": None}):
        from app.services.vision.adapters import paddle  # noqa: F401


def test_yolo_constructor_raises_clear_error_when_ultralytics_absent():
    """
    YOLOv8Detector.__init__ must raise ImportError with an actionable
    message when 'ultralytics' is missing — not a cryptic AttributeError.
    """
    # Temporarily make the import inside __init__ fail
    original = sys.modules.get("ultralytics")
    sys.modules["ultralytics"] = None  # type: ignore[assignment]
    try:
        from app.services.vision.adapters.yolo import YOLOv8Detector
        with pytest.raises(ImportError) as exc_info:
            YOLOv8Detector("weights/fake.pt")
        assert "ultralytics" in str(exc_info.value).lower()
        assert "pip install" in str(exc_info.value)
    finally:
        if original is None:
            sys.modules.pop("ultralytics", None)
        else:
            sys.modules["ultralytics"] = original


def test_paddle_constructor_raises_clear_error_when_paddleocr_absent():
    """
    PaddleOCREngine.__init__ must raise ImportError with an actionable
    message when 'paddleocr' is missing.
    """
    original = sys.modules.get("paddleocr")
    sys.modules["paddleocr"] = None  # type: ignore[assignment]
    try:
        from app.services.vision.adapters.paddle import PaddleOCREngine
        with pytest.raises(ImportError) as exc_info:
            PaddleOCREngine()
        assert "paddleocr" in str(exc_info.value).lower()
        assert "pip install" in str(exc_info.value)
    finally:
        if original is None:
            sys.modules.pop("paddleocr", None)
        else:
            sys.modules["paddleocr"] = original


# ── Preprocessing fallback ────────────────────────────────────────────────────

def test_preprocessing_falls_back_without_cv2():
    """
    preprocess_image() must return a valid PreprocessingResult even when
    cv2 is absent — using the passthrough stub path.
    """
    original = sys.modules.get("cv2")
    sys.modules["cv2"] = None  # type: ignore[assignment]
    try:
        # Force reimport so the guarded try/except is exercised
        import importlib
        import app.services.vision.preprocessing as pp_mod
        importlib.reload(pp_mod)

        image_bytes = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        )
        result = pp_mod.preprocess_image(image_bytes)

        assert result is not None
        assert "passthrough_stub" in result.steps_applied
        assert result.processed_image_b64 is not None
        assert len(result.processed_image_b64) > 0
    finally:
        if original is None:
            sys.modules.pop("cv2", None)
        else:
            sys.modules["cv2"] = original
        # Reload back to normal state
        import importlib
        import app.services.vision.preprocessing as pp_mod
        importlib.reload(pp_mod)


def test_preprocessing_result_has_expected_fields():
    """
    PreprocessingResult from the stub path must have all required fields.
    """
    from app.services.vision.preprocessing import _preprocess_stub

    result = _preprocess_stub(b"fake image bytes")

    assert result.original_width == 0   # sentinel for no-cv2 case
    assert result.original_height == 0
    assert result.deskew_angle_deg == 0.0
    assert result.denoise_applied is False
    assert result.contrast_normalised is False
    assert "passthrough_stub" in result.steps_applied
    assert result.processed_image_b64 is not None


# ── Adapter protocol compliance ────────────────────────────────────────────────

def test_stub_detector_satisfies_protocol():
    """StubDetector must be recognised as a VisionDetector by isinstance."""
    from app.services.vision.detector import StubDetector, VisionDetector
    stub = StubDetector()
    assert isinstance(stub, VisionDetector)


def test_stub_ocr_satisfies_protocol():
    """StubOCREngine must be recognised as an OCREngine by isinstance."""
    from app.services.vision.ocr import OCREngine, StubOCREngine
    stub = StubOCREngine()
    assert isinstance(stub, OCREngine)
