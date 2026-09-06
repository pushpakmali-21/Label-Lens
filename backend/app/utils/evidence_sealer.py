import hashlib
from datetime import datetime

def generate_evidence_seal(image_hash: str, verdict: str, timestamp_iso: str, gps_lat: float = None, gps_lon: float = None) -> dict:
    """
    Generates a cryptographic seal for the scan evidence.
    Mirrors the JavaScript evidenceSealer.js logic.
    """
    raw_payload = f"{image_hash}|{verdict}|{timestamp_iso}|{gps_lat or 'N/A'}|{gps_lon or 'N/A'}"
    
    sha256_hash = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()
    
    return {
        "sha256": sha256_hash,
        "shortHash": sha256_hash[:8],
        "timestamp": timestamp_iso,
        "sealed": True
    }
