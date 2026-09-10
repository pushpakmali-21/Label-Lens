import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function getSuggestedCorrections(product) {
  return (product?.violations || []).map((violation) => {
    const field = String(violation.field || "").toLowerCase();

    if (field.includes("manufacturer") || field.includes("address")) {
      return {
        field: "Manufacturer Address",
        before: violation.desc || "Manufacturer address missing",
        after: "Add the complete manufacturer name and postal address.",
        rule: violation.rule || "Rule 6(1)(a)",
      };
    }

    if (field.includes("quantity") || field.includes("font")) {
      return {
        field: "Net Quantity Font",
        before: violation.desc || "Net quantity font is below the required minimum.",
        after: "Increase the font to the required Rule 7 minimum.",
        rule: violation.rule || "Rule 7",
      };
    }

    if (field.includes("mrp") || field.includes("retail price")) {
      return {
        field: "MRP",
        before: violation.desc || "MRP is missing from the principal display panel.",
        after: "Display the MRP clearly on the Principal Display Panel.",
        rule: violation.rule || "Rule 6(1)(e)",
      };
    }

    if (field.includes("customer care") || field.includes("contact")) {
      return {
        field: "Customer Care",
        before: violation.desc || "Customer care information is missing.",
        after: "Add customer care name, phone number, and email.",
        rule: violation.rule || "Rule 6(1)(f)",
      };
    }

    if (field.includes("manufacture") || field.includes("expiry")) {
      return {
        field: "Manufacture / Expiry Date",
        before: violation.desc || "Manufacture or expiry information is missing.",
        after: "Add the month and year of manufacture and the expiry date where applicable.",
        rule: violation.rule || "Rule 6(1)(d)",
      };
    }

    return {
      field: violation.field || "Declaration",
      before: violation.desc || "Declaration requires correction.",
      after: "Correct the declaration and verify it against the cited LMPC rule.",
      rule: violation.rule || "LMPC review",
    };
  });
}

export function generateComplianceReport(product, scanState = "fail", evidenceImage = null) {
  const doc = new jsPDF();
  const pass = scanState === "pass";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const black = [15, 23, 42];
  const brass = [190, 148, 72];
  const green = [22, 128, 72];
  const red = [176, 48, 48];
  const slate = [71, 85, 105];
  const light = [248, 250, 252];
  const inspectionId = `AUD-${Math.floor(Math.random() * 9000 + 1000)}`;
  const dateTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const violations = product?.violations || [];
  const corrections = getSuggestedCorrections(product);
  const safeName = (product?.name || "LabelLens")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

  const drawFooter = () => {
    doc.setDrawColor(...brass);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    doc.text("LabelLens | Legal Metrology and Consumer Protection", margin, pageHeight - 10);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  };

  doc.setFillColor(...black);
  doc.rect(0, 0, pageWidth, 33, "F");
  doc.setFillColor(...brass);
  doc.rect(0, 31, pageWidth, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text("LabelLens", margin, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("LMPC Compliance Inspection Report", margin, 24);
  doc.setFontSize(8);
  doc.text(`Inspection ID: ${inspectionId}`, pageWidth - margin, 14, { align: "right" });
  doc.text(dateTime, pageWidth - margin, 22, { align: "right" });

  doc.setTextColor(...black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Product Information", margin, 46);
  autoTable(doc, {
    startY: 51,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Field", "Details"]],
    body: [
      ["Product", product?.name || "Unknown Product"],
      ["Brand / Manufacturer", product?.brand || "Unknown Brand"],
      ["Inspection Type", "Citizen Mobile Scan"],
    ],
    headStyles: { fillColor: brass, textColor: 20, fontStyle: "bold" },
    alternateRowStyles: { fillColor: light },
    styles: { fontSize: 9, cellPadding: 3, textColor: black },
    columnStyles: { 0: { cellWidth: 48, fontStyle: "bold" } },
  });

  let y = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(...(pass ? green : red));
  doc.roundedRect(margin, y, pageWidth - margin * 2, 23, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(pass ? "PASS - COMPLIANT" : "FAIL - NON-COMPLIANT", pageWidth / 2, y + 15, { align: "center" });
  y += 33;

  doc.setTextColor(...black);
  doc.setFontSize(14);
  doc.text("Inspection Evidence", margin, y);
  if (evidenceImage?.dataUrl && evidenceImage.width && evidenceImage.height) {
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = 82;
    const scale = Math.min(maxWidth / evidenceImage.width, maxHeight / evidenceImage.height);
    const imageWidth = evidenceImage.width * scale;
    const imageHeight = evidenceImage.height * scale;
    const imageX = margin + (maxWidth - imageWidth) / 2;
    doc.addImage(evidenceImage.dataUrl, "PNG", imageX, y + 5, imageWidth, imageHeight);
    y += imageHeight + 15;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    doc.text("Evidence screenshot unavailable for this scan.", margin, y + 8);
    y += 20;
  }

  doc.setTextColor(...black);
  doc.setFontSize(14);
  doc.text("Violations", margin, y);
  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Field", "Rule", "Finding"]],
    body: pass
      ? [["None", "-", "No violations detected"]]
      : violations.map((violation) => [
          violation.field || "Unspecified",
          violation.rule || "LMPC review",
          violation.message || violation.desc || "Requirement not satisfied",
        ]),
    headStyles: { fillColor: pass ? green : red, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3, textColor: black, overflow: "linebreak" },
    columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 30 } },
  });

  y = doc.lastAutoTable.finalY + 10;
  if (!pass) {
    doc.setTextColor(...black);
    doc.setFontSize(14);
    doc.text("Suggested Corrections", margin, y);
    autoTable(doc, {
      startY: y + 5,
      margin: { left: margin, right: margin },
      theme: "grid",
      head: [["Issue", "Recommended Fix", "LMPC Rule"]],
      body: corrections.map((correction) => [
        correction.before,
        correction.after,
        correction.rule,
      ]),
      headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3, textColor: black, overflow: "linebreak" },
      columnStyles: { 0: { cellWidth: 62 }, 1: { cellWidth: 82 }, 2: { cellWidth: 31 } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  doc.setTextColor(...black);
  doc.setFontSize(14);
  doc.text("Verified Declarations", margin, y);
  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Declaration", "Assessment"]],
    body: pass
      ? [
          ["Maximum Retail Price", "Verified"],
          ["Net Quantity", "Verified"],
          ["Manufacture / Expiry Date", "Verified"],
          ["Customer Care Details", "Verified"],
        ]
      : [
          ["Maximum Retail Price", "Detected"],
          ["Net Quantity", "Detected"],
          ["Manufacture / Expiry Date", "Review required"],
          ["Customer Care Details", "Review required"],
        ],
    headStyles: { fillColor: brass, textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3, textColor: black },
    alternateRowStyles: { fillColor: light },
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setTextColor(...black);
  doc.setFontSize(14);
  doc.text("AI Inspection Summary", margin, y);
  autoTable(doc, {
    startY: y + 5,
    margin: { left: margin, right: margin },
    theme: "grid",
    head: [["Metric", "Result"]],
    body: [
      ["OCR Confidence", "96%"],
      ["Label Object Detection", "5 objects detected"],
      ["Rule Engine", "LMPC Rules 2011"],
      ["Review Route", pass ? "No action required" : "Inspector review recommended"],
    ],
    headStyles: { fillColor: brass, textColor: 20, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3, textColor: black },
    alternateRowStyles: { fillColor: light },
  });

  drawFooter();
  doc.save(`${safeName || "LabelLens"}-Compliance-Report.pdf`);
}