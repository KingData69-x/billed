import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency, formatDate } from "./utils";
import type { Invoice, Profile } from "./types";

export async function generateInvoicePDF(invoice: Invoice, profile: Profile): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const orange   = rgb(1, 0.42, 0.1);
  const black    = rgb(0.08, 0.08, 0.1);
  const darkGray = rgb(0.3, 0.3, 0.35);
  const midGray  = rgb(0.55, 0.55, 0.6);
  const lightBg  = rgb(0.96, 0.96, 0.97);
  const white    = rgb(1, 1, 1);
  const rule     = rgb(0.88, 0.88, 0.91);

  const margin = 48;
  const contentW = width - margin * 2;

  // ── Background ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height, color: white });

  // Left accent bar
  page.drawRectangle({ x: 0, y: 0, width: 4, height, color: orange });

  // ── Header area ─────────────────────────────────────────────
  const headerH = 110;
  page.drawRectangle({ x: 0, y: height - headerH, width, height: headerH, color: black });

  // Business name
  const bizName = (profile.business_name || profile.full_name || "Your Business").toUpperCase();
  page.drawText(bizName, {
    x: margin, y: height - 52,
    size: 15, font: bold, color: white,
  });

  // Business contact under name
  let contactY = height - 68;
  const contactItems = [profile.business_email, profile.business_phone].filter(Boolean);
  contactItems.forEach(item => {
    page.drawText(item!, { x: margin, y: contactY, size: 9, font: regular, color: rgb(0.6, 0.6, 0.65) });
    contactY -= 13;
  });

  // INVOICE label (right side)
  page.drawText("INVOICE", {
    x: width - margin - 95, y: height - 48,
    size: 26, font: bold, color: orange,
  });
  page.drawText(invoice.invoice_number, {
    x: width - margin - 95, y: height - 65,
    size: 11, font: regular, color: rgb(0.65, 0.65, 0.7),
  });

  // ── Status badge ────────────────────────────────────────────
  const statusColors: Record<string, ReturnType<typeof rgb>> = {
    draft: rgb(0.5, 0.5, 0.55),
    sent:  rgb(0.22, 0.52, 0.92),
    paid:  rgb(0.1, 0.72, 0.42),
    overdue: rgb(0.92, 0.22, 0.22),
  };
  const statusColor = statusColors[invoice.status] || midGray;
  const statusLabel = invoice.status.toUpperCase();
  const statusW = statusLabel.length * 7 + 18;
  page.drawRectangle({ x: width - margin - statusW, y: height - 93, width: statusW, height: 18, color: statusColor });
  page.drawText(statusLabel, {
    x: width - margin - statusW + 9, y: height - 89,
    size: 8, font: bold, color: white,
  });

  // ── Bill To + Dates row ─────────────────────────────────────
  const infoY = height - 155;

  // Bill To
  page.drawText("BILL TO", { x: margin, y: infoY, size: 8, font: bold, color: orange });
  page.drawText(invoice.client_name, { x: margin, y: infoY - 16, size: 13, font: bold, color: black });
  let clientY = infoY - 31;
  if (invoice.client_email) {
    page.drawText(invoice.client_email, { x: margin, y: clientY, size: 9, font: regular, color: darkGray });
    clientY -= 13;
  }
  if (invoice.client_address) {
    invoice.client_address.split("\n").forEach(line => {
      page.drawText(line, { x: margin, y: clientY, size: 9, font: regular, color: darkGray });
      clientY -= 13;
    });
  }

  // Dates (right column)
  const dateColX = width - margin - 160;
  function dateRow(label: string, value: string, y: number) {
    page.drawText(label, { x: dateColX, y: y + 14, size: 8, font: bold, color: midGray });
    page.drawText(value, { x: dateColX, y, size: 10, font: regular, color: black });
  }
  dateRow("ISSUE DATE", formatDate(invoice.issue_date), infoY - 4);
  dateRow("DUE DATE",   formatDate(invoice.due_date),   infoY - 36);

  // ── Horizontal rule ─────────────────────────────────────────
  const tableTop = infoY - 85;
  page.drawLine({ start: { x: margin, y: tableTop + 24 }, end: { x: width - margin, y: tableTop + 24 }, thickness: 0.5, color: rule });

  // ── Table header ────────────────────────────────────────────
  page.drawRectangle({ x: margin, y: tableTop, width: contentW, height: 24, color: black });

  const col = { desc: margin + 10, qty: margin + contentW * 0.56, rate: margin + contentW * 0.71, amt: margin + contentW * 0.87 };
  function thText(text: string, x: number) {
    page.drawText(text, { x, y: tableTop + 8, size: 8, font: bold, color: white });
  }
  thText("DESCRIPTION", col.desc);
  thText("QTY",         col.qty);
  thText("RATE",        col.rate);
  thText("AMOUNT",      col.amt);

  // ── Table rows ───────────────────────────────────────────────
  let rowY = tableTop - 6;
  invoice.items.forEach((item, i) => {
    const rowH = 26;
    if (i % 2 === 1) {
      page.drawRectangle({ x: margin, y: rowY - rowH + 8, width: contentW, height: rowH, color: lightBg });
    }
    const desc = item.description.length > 52 ? item.description.substring(0, 49) + "..." : item.description;
    page.drawText(desc || "-",                    { x: col.desc, y: rowY, size: 10, font: regular, color: black });
    page.drawText(String(item.quantity),           { x: col.qty,  y: rowY, size: 10, font: regular, color: darkGray });
    page.drawText(formatCurrency(item.rate),       { x: col.rate, y: rowY, size: 10, font: regular, color: darkGray });
    page.drawText(formatCurrency(item.amount),     { x: col.amt,  y: rowY, size: 10, font: bold,    color: black });
    rowY -= rowH;
  });

  // ── Totals ──────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y: rowY + 12 }, end: { x: width - margin, y: rowY + 12 }, thickness: 0.5, color: rule });

  const totX = width - margin - 190;
  const totValX = width - margin - 5;
  let totY = rowY - 4;

  function totalRow(label: string, value: string, isTotal = false) {
    if (isTotal) {
      page.drawRectangle({ x: totX - 10, y: totY - 6, width: 195, height: 28, color: orange });
      page.drawText(label, { x: totX, y: totY + 5, size: 11, font: bold, color: white });
      // Right-align value
      const vw = bold.widthOfTextAtSize(value, 13);
      page.drawText(value, { x: totValX - vw, y: totY + 4, size: 13, font: bold, color: white });
    } else {
      page.drawText(label, { x: totX, y: totY, size: 10, font: regular, color: midGray });
      const vw = regular.widthOfTextAtSize(value, 10);
      page.drawText(value, { x: totValX - vw, y: totY, size: 10, font: regular, color: black });
    }
    totY -= isTotal ? 36 : 20;
  }

  totalRow("Subtotal", formatCurrency(invoice.subtotal));
  if (invoice.tax_rate > 0) {
    totalRow(`Tax (${invoice.tax_rate}%)`, formatCurrency(invoice.tax_amount));
  }
  totalRow("TOTAL", formatCurrency(invoice.total), true);

  // ── Notes ────────────────────────────────────────────────────
  if (invoice.notes) {
    const notesY = Math.min(totY - 20, rowY - 20);
    page.drawText("NOTES", { x: margin, y: notesY, size: 8, font: bold, color: orange });
    // Wrap notes text manually
    const words = invoice.notes.split(" ");
    let line = "";
    let lineY = notesY - 14;
    const maxW = contentW * 0.55;
    words.forEach(word => {
      const test = line ? line + " " + word : word;
      if (regular.widthOfTextAtSize(test, 9) > maxW) {
        page.drawText(line, { x: margin, y: lineY, size: 9, font: regular, color: darkGray });
        line = word;
        lineY -= 13;
      } else {
        line = test;
      }
    });
    if (line) page.drawText(line, { x: margin, y: lineY, size: 9, font: regular, color: darkGray });
  }

  // ── Payment Methods ──────────────────────────────────────────
  const payLines: string[] = [];
  if (profile.payment_bank_name && profile.payment_bank_account) {
    payLines.push(`Bank: ${profile.payment_bank_name}  ·  Acct: ${profile.payment_bank_account}${profile.payment_bank_routing ? `  ·  Routing: ${profile.payment_bank_routing}` : ""}`);
  }
  const wallets: string[] = [];
  if (profile.payment_paypal) wallets.push(`PayPal: ${profile.payment_paypal}`);
  if (profile.payment_venmo)  wallets.push(`Venmo: ${profile.payment_venmo}`);
  if (profile.payment_cashapp) wallets.push(`Cash App: ${profile.payment_cashapp}`);
  if (wallets.length) payLines.push(wallets.join("   ·   "));
  if (profile.payment_other) payLines.push(profile.payment_other);

  if (payLines.length > 0) {
    const payStartY = 52 + payLines.length * 14;
    page.drawRectangle({ x: 0, y: 40, width, height: payStartY, color: rgb(0.06, 0.06, 0.09) });
    page.drawText("PAYMENT DETAILS", { x: margin, y: 40 + payLines.length * 14 + 4, size: 7, font: bold, color: orange });
    payLines.forEach((line, i) => {
      page.drawText(line, { x: margin, y: 40 + (payLines.length - 1 - i) * 14, size: 8, font: regular, color: rgb(0.65, 0.65, 0.7) });
    });
  }

  // ── Footer ──────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y: 36 }, end: { x: width - margin, y: 36 }, thickness: 0.5, color: rule });
  page.drawText("Generated with Billed  ·  billed-alpha.vercel.app", {
    x: margin, y: 20, size: 8, font: regular, color: rgb(0.7, 0.7, 0.75),
  });
  // Right-align page number
  const pgText = "Page 1 of 1";
  const pgW = regular.widthOfTextAtSize(pgText, 8);
  page.drawText(pgText, { x: width - margin - pgW, y: 20, size: 8, font: regular, color: rgb(0.7, 0.7, 0.75) });

  return pdfDoc.save();
}
