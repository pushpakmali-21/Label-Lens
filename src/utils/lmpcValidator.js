import lmpcRules from "../data/lmpcRules.json";

/**
 * Resolves the mandatory minimum font height slab based on net quantity in grams or ml.
 * LMPC Rules 2011, Second Schedule
 */
export function resolveFontSlab(netQtyGramsOrMl) {
  const qty = parseFloat(netQtyGramsOrMl) || 0;
  for (const slab of lmpcRules.weight_slabs_font_mapping) {
    const min = slab.net_quantity_range.min_inclusive_g_ml ?? slab.net_quantity_range.min_exclusive_g_ml;
    const max = slab.net_quantity_range.max_inclusive_g_ml;
    const isMinOk = slab.net_quantity_range.min_inclusive_g_ml !== undefined ? qty >= min : qty > min;
    const isMaxOk = qty <= max;
    if (isMinOk && isMaxOk) {
      return slab;
    }
  }
  return lmpcRules.weight_slabs_font_mapping[lmpcRules.weight_slabs_font_mapping.length - 1];
}

/**
 * Scans a text input for prohibited expressions specified under Rule 11 & Rule 13.
 */
export function detectProhibitedExpressions(text) {
  if (!text || typeof text !== "string") return [];
  const normalized = text.toLowerCase();
  const hits = [];

  for (const item of lmpcRules.prohibited_expressions) {
    // Exact word or phrase boundary match
    const regex = new RegExp(`\\b${item.term}\\b`, "i");
    if (regex.test(normalized)) {
      hits.push({
        ...item,
        matched: item.term,
      });
    }
  }

  return hits;
}

/**
 * Validates consumer care declaration completeness.
 */
export function validateConsumerCare(details) {
  const missing = [];
  for (const field of lmpcRules.mandatory_consumer_care_fields) {
    if (!details[field.key] || details[field.key].trim().length === 0) {
      missing.push(field);
    }
  }

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
    score: Math.round(((lmpcRules.mandatory_consumer_care_fields.length - missing.length) / lmpcRules.mandatory_consumer_care_fields.length) * 100),
  };
}

/**
 * Pixel-to-mm ratio calculator using reference coin (Indian 5-Rupee coin: 23mm diameter).
 */
export function calculatePixelPerMm(coinPixelDiameter) {
  const standardDiameterMm = lmpcRules.coin_reference.diameter_mm; // 23.0 mm
  if (!coinPixelDiameter || coinPixelDiameter <= 0) return 0;
  return coinPixelDiameter / standardDiameterMm;
}

/**
 * Converts detected font height in pixels to millimeters.
 */
export function convertPxToMm(fontPx, pixelPerMm) {
  if (!pixelPerMm || pixelPerMm <= 0) return 0;
  return Number((fontPx / pixelPerMm).toFixed(2));
}
