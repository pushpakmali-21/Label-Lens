"""
app/utils/evidence_sealer.py
──────────────────────────────
Generates a cryptographic evidence seal for each scan result.

The seal binds together:
  • The content hash of the input image/QR payload
  • The scan verdict
  • The active LMPC rule-engine version
  • The GPS location and device identity of the inspector
  • The timestamp
  • A canonical JSON digest of the LMPC ``fields`` and ``violations`` output

Using ``json.dumps(obj, sort_keys=True, separators=(',', ':'))`` to serialise
the verdict output makes the hash **deterministic** and **reproducible**:
given the same inputs the same SHA-256 is always produced, so any tampering
with the stored verdict or violations is immediately detectable.
"""

from __future__ import annotations

import hashlib
import json
from typing import Optional


def _canonical_json(obj: object) -> str:
    """Return a compact, key-sorted JSON string suitable for hashing."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), default=str)


def generate_evidence_seal(
    image_hash: str,
    verdict: str,
    timestamp_iso: str,
    rule_version: str,
    fields: Optional[list[dict]] = None,
    violations: Optional[list[dict]] = None,
    gps_lat: Optional[float] = None,
    gps_lon: Optional[float] = None,
    device_id: Optional[str] = None,
) -> dict:
    """
    Generate a cryptographic seal for a scan evidence record.

    The SHA-256 hash covers (pipe-delimited):
      ``image_hash | verdict | rule_version | timestamp | gps_lat | gps_lon |
        device_id | canonical_fields | canonical_violations``

    Adding ``fields`` and ``violations`` into the hash payload ensures that the
    seal is definitively bound to the exact LMPC verdict — not just the raw
    image.  Any post-hoc mutation of the stored violations would produce a
    hash mismatch.

    Args:
        image_hash:    SHA-256 hex digest of the raw image bytes / QR payload.
        verdict:       ``"pass"``, ``"review"``, or ``"fail"``.
        timestamp_iso: UTC timestamp in ISO-8601 format.
        rule_version:  Version string from ``RULE_ENGINE_VERSION``
                       (e.g. ``"1.0.4"``).
        fields:        Ordered list of ``FieldResult`` dicts from the validator.
        violations:    List of ``ViolationResult`` dicts from the validator.
        gps_lat:       Inspector device GPS latitude (optional).
        gps_lon:       Inspector device GPS longitude (optional).
        device_id:     Inspector device identifier (optional).

    Returns:
        dict with keys: ``sha256``, ``shortHash``, ``timestamp``,
        ``rule_version``, ``sealed``.
    """
    canonical_fields = _canonical_json(fields or [])
    canonical_violations = _canonical_json(violations or [])

    raw_payload = "|".join([
        image_hash,
        verdict,
        rule_version,
        timestamp_iso,
        str(gps_lat) if gps_lat is not None else "N/A",
        str(gps_lon) if gps_lon is not None else "N/A",
        device_id or "N/A",
        canonical_fields,
        canonical_violations,
    ])

    sha256_hash = hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

    return {
        "sha256": sha256_hash,
        "shortHash": sha256_hash[:8],
        "timestamp": timestamp_iso,
        "rule_version": rule_version,
        "sealed": True,
    }
