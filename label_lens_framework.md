# LABEL-LENS: Comprehensive Compliance Engineering Framework
## Smart Compliance Verification System for Packaged Commodities
**Project Context:** Smart India Hackathon (SIH) 2026 | Problem Statement ID: 26034
**Target Ministry:** Ministry of Consumer Affairs, Food & Public Distribution | Department of Consumer Affairs (DoCA)

---

## 1. Executive Problem Definition & Domain Context

### The Manual Inspection Bottleneck
Physical auditing of packaged goods for adherence to the **Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)** is slow, highly resource-heavy, and covers less than 1% of the rapidly growing Indian retail market. Human inspectors are limited by manual measurement tools, subjective readings, and massive physical backlogs.

### Spatial and Semantic Loopholes
Deceptive packaging practices frequently exploit structural gaps:
* **The Spatial Placement Violation:** Mandatory items (e.g., Net Quantity or Maximum Retail Price) hidden away from the consumer's primary line of sight on secondary or bottom faces of packaging.
* **The Millimeter Heuristic Deficit:** Standard legal guidelines specify minimum font height bands (e.g., 1mm, 2mm, 4mm, 6mm) scaling dynamically against total package dimensions. Manual measurement via physical rulers is inconsistent and error-prone.
* **Semantic Ambiguity:** Misleading asterisk claims, hidden footnotes (e.g., writing `*Local delivery taxes extra` under an `MRP inclusive of all taxes` banner), or non-permissible symbols (e.g., using `gms` or `kilos` instead of legally mandated symbols like `g` or `kg`).

### The E-Commerce Explosion
Modern quick-commerce platforms (e.g., Blinkit, Zepto, Instamart) and traditional e-commerce giants publish millions of live product listings daily. These platforms distribute packaging data across dynamic HTML trees, dropdown menus, and promotional carousels. No production-grade automated check tool currently monitors these live listings for digital packaging compliance at scale.

---

## 2. Core System Architecture & Pipeline

### Stage 1: Spatial Layout Localization (YOLOv8)
Rather than passing an entire package photo into flat character-recognition software, Label-Lens utilizes a decoupled **Two-Stage Detection Flow**:
1. **Regional Framing:** A fine-tuned **YOLOv8 Object Detection Model** analyzes the image to isolate key spatial blocks.
2. **Target Bounding Boxes:** The model separates the image into high-resolution crops of the *Principal Display Panel (PDP)*, *MRP Block*, *Net Quantity Area*, *Consumer Care Details*, and *Manufacturing Metadata*.
3. **Placement Validation:** Instantly executes structural placement checks (e.g., enforcing **Rule 8**, which mandates that Net Quantity and MRP must reside within the consumer's primary display view).

### Stage 2: 3D-to-2D Label Flattening
To solve the rounded/multi-surface package issue where text wraps around a container (cylinders, cans, bottles, or highly reflective pouches), the app implements an **OpenCV spatial transformer network**. The pipeline takes multi-angle panning streams or sequential overlapping photographs and flattens them into a unified 2D canvas layout prior to parsing.

### Stage 3: Bilingual Extraction & Geometry (PaddleOCR)
1. **Bilingual Text Processing:** The system uses **PaddleOCR** instead of legacy engines like Tesseract. PaddleOCR handles heavily skewed text layout angles, low-lighting noise, and complex multi-script Indian packaging text (English, Hindi, and regional Indic scripts).
2. **Pixel-to-Millimeter Ratio Calibration:** The system scans the package alongside a standard reference object (such as an Indian 5-Rupee coin) or requests a single physical dimension at scan-time. Computer vision algorithms calculate the precise pixel-to-millimeter ratio, confirming that font print heights meet specific legal size thresholds.

### Stage 4: Relational Config-Driven Rule Engine
The compliance validation process is strictly **Relational and Config-Driven**:
1. **Dynamic Rule Resolution:** The engine reads the extracted numerical *Net Quantity* value first. It uses this weight or volume slab to dynamically load the exact mandatory legal font criteria required for that specific product category.
2. **Decoupled Regulatory Rules:** LMPC Rules 2011 clauses are completely abstracted into versioned, modular **JSON/YAML data configurations** rather than nested code scripts.
3. **Zero-Code Updates:** When amendments alter a font slab rule or regulatory requirement, administrators modify the config file via an enterprise portal, executing system-wide compliance adjustments without requiring code redeployments.

### Stage 5: Semantic NLP Analysis Layer
The raw string output from the vision pipeline is piped into a fine-tuned, localized Natural Language Processing (NLP) / Large Language Model (LLM) classification pass to analyze **semantic meaning**:
* Screen for explicit blacklisted or prohibited phrasing under **Rule 11** (e.g., flagging terms like `Net Weight when packed` or `Approximate mass`).
* Detect logical contradictions between large-print headlines and tiny footnote blocks.
* Flag absent or incomplete fields within the consumer care block (e.g., verifying that phone, email, and a designated officer name are all present).

---

## 3. Implementation Blueprint & File Schemas

### Technical Stack Blueprint
* **Frontend Mobile Application:** Developed with **React Native / Flutter** for cross-platform efficiency. Includes a local offline caching layer using **SQLite** to log and batch scans in remote warehouses or low-connectivity basements.
* **Central Analytics Portal:** Built using **Next.js** for data visualization, heatmap generation, and compliance workflow tracking.
* **Core API Middleware:** Implemented using **FastAPI** to handle high-throughput concurrent processing requests.
* **Storage Systems:** **PostgreSQL** handles structured data tracking, user roles, and compliance logs. Immutable binary images and cropped patch evidence are stored securely on AWS S3 or MinIO.
* **Report Compiling Engine:** Powered by **WeasyPrint** to render precise HTML-to-PDF legal formatting.

### Rule Engine Schema Configuration File (`lmpc_rules_v1.json`)
```json
{
  "rule_engine_version": "1.0.4",
  "last_updated": "2026-09-04",
  "applicable_legislation": "Legal Metrology (Packaged Commodities) Rules, 2011",
  "weight_slabs_font_mapping": [
    {
      "slab_id": "SLAB_A",
      "net_quantity_range": { "min_inclusive_g_ml": 0, "max_inclusive_g_ml": 50 },
      "mandatory_min_font_height_mm": 1.0
    },
    {
      "slab_id": "SLAB_B",
      "net_quantity_range": { "min_exclusive_g_ml": 50, "max_inclusive_g_ml": 200 },
      "mandatory_min_font_height_mm": 2.0
    },
    {
      "slab_id": "SLAB_C",
      "net_quantity_range": { "min_exclusive_g_ml": 200, "max_inclusive_g_ml": 1000 },
      "mandatory_min_font_height_mm": 4.0
    }
  ],
  "prohibited_expressions": [
    "net weight when packed",
    "approximate weight",
    "approx",
    "gms",
    "kilos"
  ],
  "mandatory_consumer_care_fields": [
    "telephone",
    "email",
    "address",
    "name"
  ]
}
```

---

## 4. Operational Feasibility, Risk, and Mitigation Strategy

### Feasibility Pillars
1. **Technical Feasibility:** Leveraging production-tested frameworks (YOLOv8 for detection, PaddleOCR for Indian script support) ensures consistent performance across diverse packaging styles.
2. **Economical Feasibility:** Reduces the cost of enforcement. The system utilizes centralized cloud infrastructure to replace expensive, slow, and resource-heavy manual field tracking drives.
3. **Legal & Structural Viability:** Designed natively around the LMPC Rules framework, shifting it from a generic imaging utility into an official legal enforcement mechanism.

### Critical Challenges & Core Mitigations
* **Challenge: Highly Reflective or Damaged Labels:** Scratched bar codes, torn sticker components, or strong glare reduce reading accuracy.
  * *Mitigation:* The system enforces a **Confidence-Scored Review Loop**. When structural read confidence falls below 75%, the app flags the item for manual inspector verification, feeding the corrected output back into the training pipeline.
* **Challenge: Legal Integrity in Judicial Proceedings:** Defense teams challenging automated notices on the grounds of potential data tampering or image modification.
  * *Mitigation:* Implement a secure **Chain-of-Custody Framework**. The exact millisecond an image is captured, the device seals the file with unmodifiable metadata (GPS coordinates, network timestamps, hardware IDs) and logs a secure **SHA-256 cryptographic hash** to an unalterable database log.

---

## 5. System Impact & Strategic Value

### Honeycomb Network Layout Metrics

```
        [ Exponential Audit Coverage ]       [ E-Commerce Vigilance ]
                      \                           //
  [ Operational Field Velocity ] ── [ CORE ENGINE ] ── [ Ironclad Evidence ]
                      //                           \
        [ Automated Legal Workflows ]        [ Crowdsourced Network ]
```

* **Exponential Audit Coverage (Impact):** Expands regulatory oversight from limited physical sampling to scalable, continuous market scanning across physical and digital retail channels.
* **E-Commerce Vigilance (Impact):** Eliminates unmonitored digital packaging listings by deploying background web scrapers to cross-verify online product data against registered legal parameters.
* **Ironclad Courtroom Evidence (Impact):** Strengthens legal enforcement channels by securing evidence trails with tamper-proof cryptographic metadata hashes.
* **Operational Field Velocity (Benefit):** Accelerates field inspection cycles, cutting down product cross-referencing and font analysis times from minutes to seconds.
* **Automated Legal Workflows (Benefit):** Automates administrative reporting by instantly generating print-ready, legally cited Show-Cause Notice PDFs complete with embedded image proof.
* **Crowdsourced Public Network (Benefit):** Extends market vigilance by offering a citizen-reporting mode that populates real-time geographical violation heatmaps for enforcement staff.
