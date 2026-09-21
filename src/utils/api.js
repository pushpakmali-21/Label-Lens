/**
 * src/utils/api.js
 * ─────────────────
 * Centralised API client for the LabelLens FastAPI backend.
 *
 * All components import from here so the base URL is defined once.
 * Vite dev server proxies /api → http://localhost:8000 are not used;
 * we call the backend directly for simplicity.
 */

const BASE_URL = "http://localhost:8000/api/v1";

/**
 * Convert a File or Blob to a raw base64 string (no data-URI prefix).
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:image/jpeg;base64,XXXX…" — strip the prefix
      const dataUrl = reader.result;
      const b64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * POST a base64 image to the backend scan endpoint.
 *
 * @param {string} imageBase64  Raw base64 string OR full data-URI.
 * @param {object} [opts]
 * @param {number} [opts.gpsLat]
 * @param {number} [opts.gpsLon]
 * @param {string} [opts.deviceId]
 * @returns {Promise<ScanResponse>}
 *
 * @typedef {object} ScanResponse
 * @property {string}          audit_id
 * @property {"pass"|"review"|"fail"} verdict
 * @property {string}          verdictNote
 * @property {FieldResult[]}   fields
 * @property {ViolationResult[]} violations
 * @property {EvidenceSeal}    evidence_seal
 * @property {string}          rule_version
 */
export async function scanImage(imageBase64, opts = {}) {
  const body = {
    image_base64: imageBase64,
    ...(opts.gpsLat !== undefined && { gps_lat: opts.gpsLat }),
    ...(opts.gpsLon !== undefined && { gps_lon: opts.gpsLon }),
    ...(opts.deviceId && { device_id: opts.deviceId }),
  };

  const res = await fetch(`${BASE_URL}/scan/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Backend error ${res.status}: ${detail}`);
  }

  return res.json();
}

/**
 * POST QR code content to the backend.
 *
 * @param {string} qrContent
 * @returns {Promise<ScanResponse>}
 */
export async function scanQR(qrContent) {
  const res = await fetch(`${BASE_URL}/scan/qr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qr_content: qrContent }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Backend error ${res.status}: ${detail}`);
  }

  return res.json();
}
