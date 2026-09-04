/**
 * Simulates a cryptographic chain-of-custody seal.
 * In production, computes true SHA-256 hash using Web Crypto API.
 */
export async function generateEvidenceSeal(payload) {
  const dataString = typeof payload === "string" ? payload : JSON.stringify(payload);
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString + Date.now().toString());

  // Web Crypto API sha-256
  let hashHex = "";
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback pseudo hash
    hashHex = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }

  return {
    sha256: hashHex,
    shortHash: hashHex.substring(0, 16) + "...",
    timestamp: new Date().toISOString(),
    formattedTime: new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Kolkata",
    }),
    gpsCoordinates: {
      latitude: "28.6139° N",
      longitude: "77.2090° E",
      altitude: "216 m",
      accuracyMeters: 2.8,
      locationName: "New Delhi, Central District",
    },
    deviceId: "DOCA-LM-INSPECTOR-TERMINAL-MH04",
    inspectorId: "INS-DL-4029 (Rajesh Sharma, Legal Metrology Officer)",
    sealed: true,
  };
}
