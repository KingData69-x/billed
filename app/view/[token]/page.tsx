import { createAnonClient } from "@/lib/supabase/anon";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Zap, ArrowRight, CheckCircle } from "lucide-react";
import type { Invoice, Profile } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata(props: PageProps<"/view/[token]">): Promise<Metadata> {
  const { token } = await props.params;
  const supabase = createAnonClient();
  const { data } = await supabase.from("invoices").select("invoice_number, client_name, total, currency").eq("public_token", token).single();
  if (!data) return { title: "Invoice | Swiftbill" };
  return {
    title: `Invoice ${data.invoice_number} | Swiftbill`,
    description: `Invoice for ${data.client_name} — ${data.currency} ${data.total}`,
  };
}

export default async function PublicInvoicePage(props: PageProps<"/view/[token]">) {
  const { token } = await props.params;

  const supabase = createAnonClient();
  const { data: invoiceRow } = await supabase
    .from("invoices")
    .select("*")
    .eq("public_token", token)
    .single();

  if (!invoiceRow) notFound();
  const inv = invoiceRow as Invoice;

  // Fetch the sender's public business info
  const admin = createAdminClient();
  const { data: profileRow } = await admin
    .from("profiles")
    .select("full_name, business_name, business_email, business_phone, business_address")
    .eq("id", inv.user_id)
    .single();

  const prof = profileRow as Pick<Profile, "full_name" | "business_name" | "business_email" | "business_phone" | "business_address"> | null;
  const senderName = prof?.business_name || prof?.full_name || "Business";

  const statusColor: Record<string, string> = {
    draft:   "rgba(148,163,184,0.15)",
    sent:    "rgba(59,130,246,0.15)",
    paid:    "rgba(16,185,129,0.15)",
    overdue: "rgba(239,68,68,0.15)",
  };
  const statusText: Record<string, string> = {
    draft:   "#94a3b8",
    sent:    "#60a5fa",
    paid:    "#10b981",
    overdue: "#ef4444",
  };

  return (
    <div className="min-h-screen" style={{ background: "#07070d" }}>
      {/* Top banner */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(7,7,13,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
            <Zap style={{ width: 12, height: 12 }} className="text-white fill-white" />
          </div>
          <span className="text-sm font-bold text-white">Swiftbill</span>
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "rgba(249,115,22,0.2)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" }}
        >
          Create your own invoice free
          <ArrowRight style={{ width: 11, height: 11 }} />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Invoice card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#0b0b14" }}
        >
          {/* Header */}
          <div
            className="px-8 py-7 flex items-start justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0e0e18" }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Invoice from</p>
              <p className="text-xl font-bold text-white">{senderName}</p>
              {prof?.business_email && <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{prof.business_email}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Invoice</p>
              <p className="text-xl font-bold text-white">{inv.invoice_number}</p>
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-1"
                style={{ background: statusColor[inv.status] ?? statusColor.draft, color: statusText[inv.status] ?? statusText.draft }}
              >
                {inv.status}
              </span>
            </div>
          </div>

          {/* Bill to + dates */}
          <div className="px-8 py-5 grid grid-cols-2 gap-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Bill To</p>
              <p className="text-sm font-semibold text-white">{inv.client_name}</p>
              {inv.client_email && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{inv.client_email}</p>}
              {inv.client_address && <p className="text-xs mt-0.5 whitespace-pre-line" style={{ color: "rgba(255,255,255,0.35)" }}>{inv.client_address}</p>}
            </div>
            <div className="space-y-3">
              {[
                { label: "Issue Date", val: formatDate(inv.issue_date) },
                { label: "Due Date",   val: formatDate(inv.due_date) },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{label}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 py-5">
            <div
              className="grid text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ gridTemplateColumns: "1fr 60px 80px 80px", color: "rgba(255,255,255,0.25)" }}
            >
              <span>Description</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="space-y-2">
              {inv.items.map((item, i) => (
                <div
                  key={i}
                  className="grid py-2.5 px-3 rounded-lg"
                  style={{
                    gridTemplateColumns: "1fr 60px 80px 80px",
                    background: i % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent",
                  }}
                >
                  <span className="text-sm text-white">{item.description}</span>
                  <span className="text-sm text-right" style={{ color: "rgba(255,255,255,0.45)" }}>{item.quantity}</span>
                  <span className="text-sm text-right" style={{ color: "rgba(255,255,255,0.45)" }}>{formatCurrency(item.rate)}</span>
                  <span className="text-sm font-semibold text-white text-right">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div
            className="px-8 py-5 space-y-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {[
              { label: "Subtotal", val: formatCurrency(inv.subtotal), bold: false },
              ...(inv.tax_rate > 0 ? [{ label: `Tax (${inv.tax_rate}%)`, val: formatCurrency(inv.tax_amount), bold: false }] : []),
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                <span className="text-white">{val}</span>
              </div>
            ))}
            <div
              className="flex justify-between items-center pt-3 mt-1"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-base font-bold text-white">Total</span>
              <span className="text-xl font-bold" style={{ color: "#fb923c" }}>{formatCurrency(inv.total)}</span>
            </div>
          </div>

          {inv.notes && (
            <div className="px-8 pb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>Notes</p>
              <p className="text-sm whitespace-pre-line" style={{ color: "rgba(255,255,255,0.5)" }}>{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Viral CTA */}
        <div
          className="mt-8 rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.03))",
            border: "1px solid rgba(249,115,22,0.2)",
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
            <Zap style={{ width: 18, height: 18 }} className="text-white fill-white" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Create professional invoices like this one</p>
          <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Swiftbill is free forever — no credit card needed. Get paid faster with beautiful invoices.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm transition-all"
              style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", color: "white", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}
            >
              Start free — no card needed
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 font-medium px-6 py-3 rounded-xl text-sm transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
            >
              Try demo first
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            {["Free forever", "PDF download", "No signup required for demo"].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                <CheckCircle style={{ width: 11, height: 11 }} className="text-emerald-500" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
