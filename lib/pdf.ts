import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency, formatDate } from "./utils";
import type { Invoice, Profile } from "./types";

export async function generateInvoicePDF(invoice: Invoice, profile: Profile): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const orange = rgb(1, 0.42, 0.1); // #FF6B1A
  const dark = rgb(0.07, 0.07, 0.1);
  const gray = rgb(0.45, 0.45, 0.5);
  const lightGray = rgb(0.94, 0.94, 0.96);
  const white = rgb(1, 1, 1);

  // Header background
  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: dark });

  // Company name
  const bizName = profile.business_name || profile.full_name || "Your Business";
  page.drawText(bizName, { x: 40, y: height - 55, size: 22, font: fontBold, color: white });

  // INVOICE label
  page.drawText("INVOICE", { x: width - 160, y: height - 45, size: 28, font: fontBold, color: orange });
  page.drawText(invoice.invoice_number, { x: width - 160, y: height - 68, size: 13, font, color: white });

  // Business details
  let bizY = height - 85;
  if (profile.business_email) {
    page.drawText(profile.business_email, { x: 40, y: bizY, size: 10, font, color: rgb(0.7, 0.7, 0.75) });
    bizY -= 14;
  }
  if (profile.business_phone) {
    page.drawText(profile.business_phone, { x: 40, y: bizY, size: 10, font, color: rgb(0.7, 0.7, 0.75) });
    bizY -= 14;
  }

  // Bill To section
  page.drawText("BILL TO", { x: 40, y: height - 155, size: 9, font: fontBold, color: orange });
  page.drawText(invoice.client_name, { x: 40, y: height - 172, size: 13, font: fontBold, color: dark });
  let clientY = height - 189;
  if (invoice.client_email) {
    page.drawText(invoice.client_email, { x: 40, y: clientY, size: 10, font, color: gray });
    clientY -= 14;
  }
  if (invoice.client_address) {
    const lines = invoice.client_address.split("\n");
    lines.forEach(line => {
      page.drawText(line, { x: 40, y: clientY, size: 10, font, color: gray });
      clientY -= 14;
    });
  }

  // Dates
  const dateX = width - 200;
  page.drawText("ISSUE DATE", { x: dateX, y: height - 155, size: 9, font: fontBold, color: gray });
  page.drawText(formatDate(invoice.issue_date), { x: dateX, y: height - 170, size: 10, font, color: dark });
  page.drawText("DUE DATE", { x: dateX, y: height - 195, size: 9, font: fontBold, color: gray });
  page.drawText(formatDate(invoice.due_date), { x: dateX, y: height - 210, size: 10, font, color: dark });

  // Status badge
  const statusColors: Record<string, ReturnType<typeof rgb>> = {
    draft: rgb(0.6, 0.6, 0.6),
    sent: rgb(0.2, 0.5, 0.9),
    paid: rgb(0.1, 0.7, 0.4),
    overdue: rgb(0.9, 0.2, 0.2),
  };
  const statusColor = statusColors[invoice.status] || gray;
  page.drawRectangle({ x: dateX, y: height - 235, width: 70, height: 20, color: statusColor });
  page.drawText(invoice.status.toUpperCase(), { x: dateX + 8, y: height - 228, size: 9, font: fontBold, color: white });

  // Items table header
  const tableTop = height - 275;
  page.drawRectangle({ x: 30, y: tableTop - 4, width: width - 60, height: 24, color: dark });
  page.drawText("DESCRIPTION", { x: 40, y: tableTop + 5, size: 9, font: fontBold, color: white });
  page.drawText("QTY", { x: 350, y: tableTop + 5, size: 9, font: fontBold, color: white });
  page.drawText("RATE", { x: 410, y: tableTop + 5, size: 9, font: fontBold, color: white });
  page.drawText("AMOUNT", { x: 490, y: tableTop + 5, size: 9, font: fontBold, color: white });

  // Items rows
  let rowY = tableTop - 24;
  invoice.items.forEach((item, i) => {
    if (i % 2 === 1) {
      page.drawRectangle({ x: 30, y: rowY - 6, width: width - 60, height: 24, color: lightGray });
    }
    const desc = item.description.length > 55 ? item.description.substring(0, 52) + "..." : item.description;
    page.drawText(desc, { x: 40, y: rowY + 4, size: 10, font, color: dark });
    page.drawText(String(item.quantity), { x: 355, y: rowY + 4, size: 10, font, color: dark });
    page.drawText(formatCurrency(item.rate), { x: 405, y: rowY + 4, size: 10, font, color: dark });
    page.drawText(formatCurrency(item.amount), { x: 485, y: rowY + 4, size: 10, font, color: dark });
    rowY -= 28;
  });

  // Totals section
  const totalsY = rowY - 20;
  page.drawLine({ start: { x: 350, y: totalsY + 20 }, end: { x: width - 30, y: totalsY + 20 }, thickness: 1, color: lightGray });

  page.drawText("Subtotal", { x: 370, y: totalsY, size: 10, font, color: gray });
  page.drawText(formatCurrency(invoice.subtotal), { x: 485, y: totalsY, size: 10, font, color: dark });

  if (invoice.tax_rate > 0) {
    page.drawText(`Tax (${invoice.tax_rate}%)`, { x: 370, y: totalsY - 18, size: 10, font, color: gray });
    page.drawText(formatCurrency(invoice.tax_amount), { x: 485, y: totalsY - 18, size: 10, font, color: dark });
  }

  // Total box
  const totalBoxY = invoice.tax_rate > 0 ? totalsY - 50 : totalsY - 32;
  page.drawRectangle({ x: 350, y: totalBoxY, width: width - 380, height: 32, color: orange });
  page.drawText("TOTAL", { x: 370, y: totalBoxY + 10, size: 11, font: fontBold, color: white });
  page.drawText(formatCurrency(invoice.total), { x: 478, y: totalBoxY + 10, size: 13, font: fontBold, color: white });

  // Notes
  if (invoice.notes) {
    page.drawText("NOTES", { x: 40, y: totalBoxY - 10, size: 9, font: fontBold, color: orange });
    page.drawText(invoice.notes, { x: 40, y: totalBoxY - 26, size: 10, font, color: gray, maxWidth: 280 });
  }

  // Footer
  page.drawRectangle({ x: 0, y: 0, width, height: 40, color: dark });
  page.drawText("Created with Billed · getbilled.app", {
    x: width / 2 - 90, y: 14, size: 9, font, color: rgb(0.5, 0.5, 0.55)
  });

  return pdfDoc.save();
}
