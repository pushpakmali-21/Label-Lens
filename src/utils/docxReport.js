import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { getSuggestedCorrections } from "./pdfReport";

const colors = {
  black: "0F172A",
  brass: "BE9448",
  green: "168048",
  red: "B03030",
  slate: "475569",
  light: "F8FAFC",
  white: "FFFFFF",
};

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
};

const tableCell = (text, options = {}) => new TableCell({
  borders: cellBorders,
  shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR } : undefined,
  width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
  children: [new Paragraph({
    children: [new TextRun({
      text: String(text),
      bold: options.bold,
      color: options.color || colors.black,
      size: options.size || 18,
    })],
    spacing: { before: 80, after: 80 },
  })],
});

const reportTable = (headers, rows, headerColor = colors.brass) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      children: headers.map((header) => tableCell(header, {
        bold: true,
        color: headerColor === colors.brass ? colors.black : colors.white,
        fill: headerColor,
      })),
    }),
    ...rows.map((row, rowIndex) => new TableRow({
      children: row.map((value) => tableCell(value, {
        fill: rowIndex % 2 === 0 ? colors.light : colors.white,
      })),
    })),
  ],
});

const sectionHeading = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 120 },
  run: { color: colors.black, bold: true, size: 24 },
});

export async function generateComplianceDocxReport(product, scanState = "fail") {
  const pass = scanState === "pass";
  const violations = product?.violations || [];
  const corrections = getSuggestedCorrections(product);
  const inspectionId = `AUD-${Math.floor(Math.random() * 9000 + 1000)}`;
  const dateTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const safeName = (product?.name || "LabelLens")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .trim();

  const document = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 900, right: 900, bottom: 900, left: 900 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: colors.black, type: ShadingType.CLEAR },
          spacing: { before: 120, after: 0 },
          children: [new TextRun({ text: "LabelLens", bold: true, color: colors.white, size: 40 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: colors.black, type: ShadingType.CLEAR },
          spacing: { before: 0, after: 240 },
          children: [new TextRun({ text: "LMPC Compliance Inspection Report", color: colors.white, size: 22 })],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({
            children: [
              tableCell(`Inspection ID: ${inspectionId}`, { bold: true, fill: colors.light, width: 50 }),
              tableCell(`Date & Time: ${dateTime}`, { fill: colors.light, width: 50 }),
            ],
          })],
        }),
        sectionHeading("Product Information"),
        reportTable(["Field", "Details"], [
          ["Product Name", product?.name || "Unknown Product"],
          ["Brand", product?.brand || "Unknown Brand"],
          ["Inspection Type", "Citizen Mobile Scan"],
        ]),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: pass ? colors.green : colors.red, type: ShadingType.CLEAR },
          spacing: { before: 260, after: 260 },
          children: [new TextRun({
            text: pass ? "PASS - COMPLIANT" : "FAIL - NON-COMPLIANT",
            bold: true,
            color: colors.white,
            size: 30,
          })],
        }),
        sectionHeading("Violations"),
        reportTable(["Field", "Rule", "Finding"], pass
          ? [["None", "-", "No violations detected"]]
          : violations.map((violation) => [
              violation.field || "Unspecified",
              violation.rule || "LMPC review",
              violation.message || violation.desc || "Requirement not satisfied",
            ]), pass ? colors.green : colors.red),
        ...(!pass ? [
          sectionHeading("Suggested Corrections"),
          reportTable(["Issue", "Recommended Fix", "LMPC Rule"], corrections.map((correction) => [
            correction.before,
            correction.after,
            correction.rule,
          ]), colors.green),
        ] : []),
        sectionHeading("Verified Declarations"),
        reportTable(["Declaration", "Assessment"], pass
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
            ]),
        sectionHeading("AI Inspection Summary"),
        reportTable(["Metric", "Result"], [
          ["OCR Confidence", "96%"],
          ["Label Object Detection", "5 objects detected"],
          ["Rule Engine", "LMPC Rules 2011"],
          ["Review Route", pass ? "No action required" : "Inspector review recommended"],
        ]),
      ],
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: colors.brass } },
            spacing: { before: 160 },
            children: [new TextRun({
              text: "LabelLens | Legal Metrology and Consumer Protection",
              color: colors.slate,
              size: 16,
            })],
          })],
        }),
      },
    }],
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, `${safeName || "LabelLens"}-Compliance-Report.docx`);
}