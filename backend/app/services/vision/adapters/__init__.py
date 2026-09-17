"""
app/services/vision/adapters/__init__.py
─────────────────────────────────────────
Optional ML adapter package.

All adapters in this package guard their heavy dependencies inside
``__init__`` or the first method call — importing this package (or any
adapter module) never fails due to a missing ML library.

Available adapters
──────────────────
yolo.py   — YOLOv8Detector  (requires: ultralytics)
paddle.py — PaddleOCREngine (requires: paddleocr, paddlepaddle)

Usage
─────
    from app.services.vision.adapters.yolo import YOLOv8Detector
    from app.services.vision.adapters.paddle import PaddleOCREngine
    from app.services.vision.pipeline import VisionPipeline

    pipeline = VisionPipeline(
        detector=YOLOv8Detector("weights/label_lens_v1.pt"),
        ocr_engine=PaddleOCREngine(lang="en"),
    )

Both classes satisfy the ``VisionDetector`` / ``OCREngine`` protocols
structurally — no inheritance from those protocols is needed.
"""
