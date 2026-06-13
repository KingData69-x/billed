import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatCurrency, formatDate } from "./utils";
import type { Invoice, Profile } from "./types";

export async function generateInvoicePDF(invoice: Invoice, profile: Profile): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ── Palette ────────────────────────────────────────────────
  const orange  = rgb(1, 0.42, 0.1);
  const ink     = rgb(0.1,  0.1,  0.12);
  const dark    = rgb(0.18, 0.18, 0.22);
  const muted   = rgb(0.45, 0.45, 0.45);
  const faint   = rgb(0.9,  0.9,  0.92);
  const stripe  = rgb(0.96, 0.96, 0.97);
  const white   = rgb(1,    1,    1);

  const L = 48;          // left margin
  const R = width - 48;  // right margin
  const W = R - L;       // content width

  // ── Page background ────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height, color: white });

  // Orange left bar
  page.drawRectangle({ x: 0, y: 0, width: 5, height, color: orange });

  // ── Header ─────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 108, width, height: 108, color: ink });

  const biz = (profile.business_name || profile.full_name || "Your Business").toUpperCase();
  page.drawText(biz, { x: L, y: height - 46, size: 16, font: bold, color: white });

  let bizY = height - 64;
  for (const line of [profile.business_email, profile.business_phone].filter(Boolean)) {
    page.drawText(line!, { x: L, y: bizY, size: 8.5, font: regular, color: rgb(0.58, 0.58, 0.65) });
    bizY -= 13;
  }

  // "INVOICE" on right
  page.drawText("INVOICE", { x: R - 95, y: height - 46, size: 26, font: bold, color: orange });
  page.drawText(invoice.invoice_number, { x: R - 95, y: height - 63, size: 10.5, font: regular, color: rgb(0.6, 0.6, 0.65) });

  // Status pill
  const statusBg: Record<string, ReturnType<typeof rgb>> = {
    draft: rgb(0.45, 0.45, 0.5),
    sent:  rgb(0.2,  0.5,  0.9),
    paid:  rgb(0.1,  0.68, 0.38),
    overdue: rgb(0.88, 0.2, 0.2),
  };
  const sc = statusBg[invoice.status] ?? muted;
  const sl = invoice.status.toUpperCase();
  const sw = sl.length * 6.5 + 18;
  page.drawRectangle({ x: R - sw, y: height - 91, width: sw, height: 17, color: sc });
  page.drawText(sl, { x: R - sw + 9, y: height - 87.5, size: 7.5, font: bold, color: white });

  // ── Bill-To + Dates ────────────────────────────────────────
  let y = height - 148;

  page.drawText("BILL TO", { x: L, y, size: 7.5, font: bold, color: orange });
  y -= 15;
  page.drawText(invoice.client_name, { x: L, y, size: 13, font: bold, color: ink });
  y -= 14;
  if (invoice.client_email) {
    page.drawText(invoice.client_email, { x: L, y, size: 9, font: regular, color: muted });
    y -= 13;
  }
  if (invoice.client_address) {
    for (const line of invoice.client_address.split("\n")) {
      page.drawText(line, { x: L, y, size: 9, font: regular, color: muted });
      y -= 13;
    }
  }

  // Dates (right column — anchored to fixed positions)
  const dx = R - 155;
  page.drawText("ISSUE DATE",              { x: dx, y: height - 148, size: 7.5, font: bold, color: muted });
  page.drawText(formatDate(invoice.issue_date), { x: dx, y: height - 162, size: 10,  font: regular, color: ink });
  page.drawText("DUE DATE",               { x: dx, y: height - 182, size: 7.5, font: bold, color: muted });
  page.drawText(formatDate(invoice.due_date),   { x: dx, y: height - 196, size: 10,  font: regular, color: ink });

  // ── Divider before table ────────────────────────────────────
  const divY = Math.min(y - 16, height - 225);
  page.drawLine({ start: { x: L, y: divY }, end: { x: R, y: divY }, thickness: 0.5, color: faint });

  // ── Table ──────────────────────────────────────────────────
  const tY = divY - 8;  // top of table header

  // Column x positions
  const cx = {
    desc:   L + 8,
    qty:    L + W * 0.57,
    rate:   L + W * 0.71,
    amt:    L + W * 0.86,
  };

  // Header bar
  page.drawRectangle({ x: L, y: tY - 22, width: W, height: 22, color: ink });
  page.drawText("DESCRIPTION", { x: cx.desc, y: tY - 15, size: 8, font: bold, color: white });
  page.drawText("QTY",         { x: cx.qty,  y: tY - 15, size: 8, font: bold, color: white });
  page.drawText("RATE",        { x: cx.rate, y: tY - 15, size: 8, font: bold, color: white });
  page.drawText("AMOUNT",      { x: cx.amt,  y: tY - 15, size: 8, font: bold, color: white });

  // Rows
  const rowH = 25;
  let rTop = tY - 22; // bottom of header = top of first row

  invoice.items.forEach((item, i) => {
    const rowBottom = rTop - rowH;
    if (i % 2 === 1) {
      page.drawRectangle({ x: L, y: rowBottom, width: W, height: rowH, color: stripe });
    }
    const textY = rowBottom + 8;
    const desc = item.description.length > 55 ? item.description.substring(0, 52) + "..." : item.description;
    page.drawText(desc || "—",               { x: cx.desc, y: textY, size: 9.5, font: regular, color: ink });
    page.drawText(String(item.quantity),      { x: cx.qty,  y: textY, size: 9.5, font: regular, color: muted });
    page.drawText(formatCurrency(item.rate),  { x: cx.rate, y: textY, size: 9.5, font: regular, color: muted });
    const aw = bold.widthOfTextAtSize(formatCurrency(item.amount), 9.5);
    page.drawText(formatCurrency(item.amount), { x: R - 8 - aw, y: textY, size: 9.5, font: bold, color: ink });
    rTop = rowBottom;
  });

  const afterRows = rTop; // y at bottom of last row

  // ── Totals ─────────────────────────────────────────────────
  page.drawLine({ start: { x: L, y: afterRows - 2 }, end: { x: R, y: afterRows - 2 }, thickness: 0.5, color: faint });

  const tCol  = R - 192;
  let totCursor = afterRows - 30;

  function drawTotRow(label: string, val: string, isTotal = false) {
    if (isTotal) {
      page.drawRectangle({ x: tCol - 8, y: totCursor - 8, width: R - tCol + 8, height: 26, color: orange });
      page.drawText(label, { x: tCol, y: totCursor + 5, size: 11, font: bold, color: white });
      const vw = bold.widthOfTextAtSize(val, 13);
      page.drawText(val, { x: R - 8 - vw, y: totCursor + 4, size: 13, font: bold, color: white });
      totCursor -= 38;
    } else {
      page.drawText(label, { x: tCol, y: totCursor, size: 9.5, font: regular, color: muted });
      const vw = regular.widthOfTextAtSize(val, 9.5);
      page.drawText(val, { x: R - 8 - vw, y: totCursor, size: 9.5, font: regular, color: ink });
      totCursor -= 18;
    }
  }

  drawTotRow("Subtotal", formatCurrency(invoice.subtotal));
  if (invoice.tax_rate > 0) drawTotRow(`Tax (${invoice.tax_rate}%)`, formatCurrency(invoice.tax_amount));
  totCursor -= 4;
  drawTotRow("TOTAL", formatCurrency(invoice.total), true);

  // ── Notes ──────────────────────────────────────────────────
  const notesStartY = Math.min(totCursor - 24, afterRows - 24);
  if (invoice.notes && notesStartY > 80) {
    let ny = notesStartY;
    page.drawText("NOTES", { x: L, y: ny, size: 7.5, font: bold, color: orange });
    ny -= 14;
    const words = invoice.notes.split(" ");
    let line = "";
    const maxW = W * 0.55;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (regular.widthOfTextAtSize(test, 9) > maxW) {
        page.drawText(line, { x: L, y: ny, size: 9, font: regular, color: muted });
        line = word;
        ny -= 13;
      } else {
        line = test;
      }
    }
    if (line) page.drawText(line, { x: L, y: ny, size: 9, font: regular, color: muted });
  }

  // ── Payment details ────────────────────────────────────────
  const payLines: string[] = [];
  if (profile.payment_bank_name && profile.payment_bank_account) {
    payLines.push(`Bank: ${profile.payment_bank_name}  ·  Account: ${profile.payment_bank_account}${profile.payment_bank_routing ? `  ·  Routing: ${profile.payment_bank_routing}` : ""}`);
  }
  const wallets: string[] = [];
  if (profile.payment_paypal)  wallets.push(`PayPal: ${profile.payment_paypal}`);
  if (profile.payment_venmo)   wallets.push(`Venmo: ${profile.payment_venmo}`);
  if (profile.payment_cashapp) wallets.push(`Cash App: ${profile.payment_cashapp}`);
  if (wallets.length) payLines.push(wallets.join("   ·   "));
  if (profile.payment_other)   payLines.push(profile.payment_other);

  if (payLines.length > 0) {
    const blockH = payLines.length * 13 + 24;
    const blockY = 46;
    page.drawRectangle({ x: 0, y: blockY, width, height: blockH, color: rgb(0.07, 0.07, 0.1) });
    page.drawText("PAYMENT DETAILS", { x: L, y: blockY + blockH - 14, size: 7.5, font: bold, color: orange });
    payLines.forEach((line, i) => {
      page.drawText(line, { x: L, y: blockY + blockH - 27 - i * 13, size: 8, font: regular, color: rgb(0.62, 0.62, 0.68) });
    });
  }

  // ── Footer ─────────────────────────────────────────────────
  page.drawLine({ start: { x: L, y: 38 }, end: { x: R, y: 38 }, thickness: 0.4, color: faint });
  page.drawText("Create free invoices at  swiftbill.dev", {
    x: L, y: 24, size: 8, font: bold, color: orange,
  });
  const pg = "Page 1 of 1";
  const pgW = regular.widthOfTextAtSize(pg, 7.5);
  page.drawText(pg, { x: R - pgW, y: 24, size: 7.5, font: regular, color: rgb(0.68, 0.68, 0.72) });

  return pdfDoc.save();
}
