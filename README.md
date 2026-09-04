# LabelLens — Smart Compliance Verification System for Packaged Commodities

> **Smart India Hackathon (SIH 2026) | Problem Statement ID: 26034**  
> **Ministry of Consumer Affairs, Food & Public Distribution | Department of Consumer Affairs (DoCA)**

---

## 📌 Overview

**LabelLens** is an automated compliance engineering framework and analytical engine designed to verify packaged commodities against the **Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)** and subsequent amendments (including the 2022 QR Proviso for electronics and Rule 6(10) / Rule 6(10A) e-commerce digital disclosure mandates).

---

## 🚀 Key Modules in this Prototype

1. **Rule 6 Intelligent Verification Engine**
   - **Printed Label Check**: Full on-pack declarations under Rule 6(1). Identifies low-confidence / smudged OCR values and routes to human review.
   - **QR-Assisted Electronic Product**: Differentiates mandatory on-pack declarations from offloadable fields decoded via the 2022 QR Code proviso.
   - **Marketplace / Quick-Commerce Listing**: Validates digital listing duty (Rule 6(10)) and sortable country-of-origin filter (Rule 6(10A)).

2. **Vision & Spatial Calibration Sandbox (Stage 1 & Stage 3)**
   - **YOLOv8 Spatial Layout Localization**: Bounding boxes for Principal Display Panel (PDP), MRP block, Net Quantity, and Consumer Care.
   - **Optical Fiducial Reference Calibration**: Uses an Indian 5-Rupee coin (diameter: 23.0 mm) to calibrate the pixel-to-millimeter ratio and resolve the *Millimeter Heuristic Deficit*.
   - **Rule 7 Font Slabs**: Dynamically verifies measured font print heights against statutory minimum thresholds (1.0 mm, 2.0 mm, 4.0 mm, 6.0 mm).

3. **Config-Driven LMPC Rule Engine & Prohibited Words Sandbox (Stage 4 & Stage 5)**
   - Weight slab font resolver for `SLAB_A` through `SLAB_D`.
   - NLP screening for prohibited and misleading expressions (`"gms"`, `"approximate weight"`, `"net weight when packed"`, etc.) under Rules 11 and 13.
   - Consumer care grievance redressal checklist under Rule 6(1)(f).

4. **Section 39 Statutory Show-Cause Notice Generator**
   - Instantly compiles official Department of Consumer Affairs Show-Cause Notices.
   - Embeds detected violations, legal citations (Section 36(1) / Section 39), and 15-day response directive.
   - **Cryptographic Chain-of-Custody**: Generates a tamper-proof SHA-256 evidence digest, GPS geotag, and NTP timestamp for courtroom admissibility.
   - Print-ready format with one-click export.

5. **District Compliance Heatmap & Quick-Commerce Monitor**
   - National retail audit tracking across major metropolitan districts.
   - Live automated quick-commerce scraping stream monitoring online listings.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Design Tokens**: Legal-tech palette with IBM Plex typography
- **Rule Engine**: Relational JSON configuration (`lmpc_rules_v1.json`)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/RutujaDeshmukh427/SIH.git
cd SIH

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Production Build

```bash
npm run build
```
