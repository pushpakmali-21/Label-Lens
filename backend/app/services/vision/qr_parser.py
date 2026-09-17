"""
app/services/vision/qr_parser.py
─────────────────────────────────
Deterministic, offline QR payload parser.

Three-tier fallback strategy:
  1. JSON object   — {"manufacturer": "...", "net_weight_str": "500g", ...}
  2. KEY:VALUE     — line-delimited "Manufacturer: Foo\nMRP: 50\nNet: 500g"
  3. Heuristic     — free-text token scan using simple type heuristics

The function ``parse_qr_payload`` returns a dict of extracted fields
suitable for passing to ``lmpc_validator.validate_package_data``.

If none of the tiers can extract any useful fields, ``ValueError`` is raised
so the caller can return a clean ``fail`` verdict with an explicit violation
instead of silently producing a wrong-field mock result.

No ML or heavy dependencies required.
"""

from __future__ import annotations

import json
import re
from typing import Optional

# Key aliases (case-insensitive) for KEY:VALUE parser
_KV_ALIASES: dict[str, list[str]] = {
    "manufacturer": ["manufacturer", "mfg", "made by", "brand", "company"],
    "name":         ["name", "product name", "product"],
    "address":      ["address", "addr", "location"],
    "net_weight_str": ["net", "net weight", "net qty", "net quantity", "weight", "quantity"],
    "mrp":          ["mrp", "price", "max retail price", "rs", "inr"],
    "consumer_care_telephone": ["helpline", "toll free", "phone", "tel", "contact"],
    "consumer_care_email":     ["email", "e-mail", "mail"],
}

# SI unit suffixes that signal a net-quantity token
_WEIGHT_SUFFIXES = re.compile(r"^(\d+(?:\.\d+)?)\s*(g|ml|kg|l|litre|liter|gram|grams)$", re.I)

# Digits-only or price-like value (50, 49.99, Rs50)
_PRICE_RE = re.compile(r"^[Rs\u20b9]?(\d+(?:\.\d+)?)$", re.I)


def _parse_json(text: str) -> Optional[dict]:
    """Attempt to parse text as a JSON object."""
    try:
        obj = json.loads(text)
        if isinstance(obj, dict):
            return obj
    except (json.JSONDecodeError, ValueError):
        pass
    return None


def _normalise_key(raw: str) -> Optional[str]:
    """Map a raw key string to a canonical field name, or None if unrecognised."""
    lower = raw.strip().lower()
    for canonical, aliases in _KV_ALIASES.items():
        if lower in aliases:
            return canonical
    return None


def _parse_kv(text: str) -> dict:
    """
    Parse KEY: VALUE line-delimited format.
    Returns whatever fields were successfully matched — may be empty.
    """
    result: dict = {}
    for line in text.splitlines():
        if ":" not in line:
            continue
        key_part, _, val_part = line.partition(":")
        canonical = _normalise_key(key_part)
        if canonical and val_part.strip():
            result[canonical] = val_part.strip()
    return result


def _heuristic(text: str) -> dict:
    """
    Last-resort free-text token scan.

    Heuristics applied (in order):
    - Token matching weight suffix -> net_weight_str (first match wins)
    - Numeric-only token in plausible MRP range (1-10000) -> mrp candidate
    - Longest remaining token (>= 5 chars, not a number) -> manufacturer candidate
    """
    result: dict = {}
    tokens = re.split(r"[\s,;|/]+", text.strip())

    leftover_tokens: list[str] = []

    for token in tokens:
        if not token:
            continue

        # Weight/quantity match
        if "net_weight_str" not in result:
            m = _WEIGHT_SUFFIXES.match(token)
            if m:
                result["net_weight_str"] = token
                value = float(m.group(1))
                unit = m.group(2).lower()
                if unit in ("kg",):
                    result["net_weight_g"] = value * 1000
                elif unit in ("l", "litre", "liter"):
                    result["net_weight_g"] = value * 1000
                else:
                    result["net_weight_g"] = value
                continue

        # MRP / price match
        if "mrp" not in result:
            m = _PRICE_RE.match(token.replace("Rs", "").replace("\u20b9", ""))
            if m:
                val = float(m.group(1))
                if 1.0 <= val <= 100_000:
                    result["mrp"] = val
                    continue

        leftover_tokens.append(token)

    # Manufacturer: longest leftover word-like token
    if "manufacturer" not in result:
        word_tokens = [t for t in leftover_tokens if re.match(r"[A-Za-z]", t) and len(t) >= 5]
        if word_tokens:
            result["manufacturer"] = max(word_tokens, key=len)

    return result


def _merge_net_weight(fields: dict) -> dict:
    """
    Ensure net_weight_g is a float whenever net_weight_str is present
    but net_weight_g is missing (common in JSON / KV payloads).
    """
    if "net_weight_str" in fields and "net_weight_g" not in fields:
        m = _WEIGHT_SUFFIXES.match(str(fields["net_weight_str"]).strip())
        if m:
            value = float(m.group(1))
            unit = m.group(2).lower()
            if unit == "kg":
                value *= 1000
            elif unit in ("l", "litre", "liter"):
                value *= 1000
            fields["net_weight_g"] = value
    return fields


def _coerce_mrp(fields: dict) -> dict:
    """Ensure mrp is stored as float when present."""
    if "mrp" in fields:
        try:
            fields["mrp"] = float(str(fields["mrp"]).replace("Rs", "").replace("\u20b9", "").strip())
        except (ValueError, TypeError):
            del fields["mrp"]
    return fields


def parse_qr_payload(qr_content: str) -> dict:
    """
    Parse QR content and return extracted package fields.

    Fields returned (subset, all optional):
        - manufacturer      (str)
        - name              (str)
        - address           (str)
        - net_weight_str    (str, e.g. "500g")
        - net_weight_g      (float, normalised grams/ml)
        - mrp               (float)
        - consumer_care_telephone (str)
        - consumer_care_email     (str)

    Raises:
        ValueError: if no useful fields can be extracted.
    """
    if not qr_content or not qr_content.strip():
        raise ValueError("QR content is empty — cannot extract package fields.")

    text = qr_content.strip()
    fields: dict = {}

    # Tier 1 — JSON
    json_result = _parse_json(text)
    if json_result:
        for canonical, aliases in _KV_ALIASES.items():
            for alias in aliases:
                if alias in json_result:
                    fields[canonical] = json_result[alias]
                    break
            if canonical not in fields and canonical in json_result:
                fields[canonical] = json_result[canonical]
        # Passthrough well-known direct keys
        for passthrough in ("net_weight_g", "net_weight_str", "mrp", "manufacturer",
                            "name", "address", "consumer_care_telephone", "consumer_care_email"):
            if passthrough in json_result and passthrough not in fields:
                fields[passthrough] = json_result[passthrough]

    # Tier 2 — KEY:VALUE lines
    if not fields:
        kv = _parse_kv(text)
        fields.update(kv)

    # Tier 3 — Heuristic token scan
    if not fields:
        fields.update(_heuristic(text))

    # Post-processing
    fields = _merge_net_weight(fields)
    fields = _coerce_mrp(fields)

    # Check we have at least one useful field
    useful_keys = {"manufacturer", "name", "net_weight_str", "net_weight_g", "mrp"}
    if not any(k in fields for k in useful_keys):
        raise ValueError(
            f"Could not extract any package fields from QR content: {text[:80]!r}"
        )

    return fields
