"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Download, CheckCircle, ArrowRight, X } from "lucide-react";
import type { InvoiceItem } from "@/lib/types";
import { claimDemoUsage } from "./actions";

const defaultItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  rate: 0,
  amount: 0,
});

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}
function getDueDateStr(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

type State = "idle" | "working" | "done" | "blocked";

export function DemoForm() {
  const [state, setState] = useState<State>("idle");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(getTodayStr());
  const [dueDate, setDueDate] = useState(getDueDateStr(30));
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([defaultItem()]);

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      })
    );
  }, []);

  async function handleDownload() {
    if (state !== "idle") return;
    setState("working");

    const result = await claimDemoUsage();

    if (!result.ok) {
      setState("blocked");
      return;
    }

    try {
      const { generateInvoicePDF } = await import("@/lib/pdf");
      const fakeProfile = {
        id: "", email: "", full_name: "Demo User", business_name: null,
        business_email: null, business_phone: null, business_address: null,
        plan: "free" as const, stripe_customer_id: null, invoice_count: 0,
        payment_bank_name: null, payment_bank_account: null, payment_bank_routing: null,
        payment_paypal: null, payment_venmo: null, payment_cashapp: null,
        payment_other: null, referral_code: null, referred_by: null, created_at: "",
      };
      const fakeInvoice = {
        id: "demo", user_id: "", client_id: null,
        invoice_number: "INV-DEMO",
        status: "sent" as const,
        issue_date: issueDate,
        due_date: dueDate,
        items, subtotal, tax_rate: taxRate, tax_amount: taxAmount, total, notes,
        client_name: clientName || "Client Name",
        client_email: clientEmail || null,
        client_address: clientAddress || null,
        currency: "USD",
        public_token: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const pdfBytes = await generateInvoicePDF(fakeInvoice, fakeProfile);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "billed-demo-invoice.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setState("done");
    } catch {
      setState("idle");
    }
  }

  if (state === "blocked") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
          <X className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Demo already used</h2>
        <p className="text-zinc-400 text-sm mb-6 max-w-xs">
          Your free demo has already been claimed. Sign up for a free account to create more invoices.
        </p>
        <Link href="/signup" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
          Create free account <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Success modal */}
      {state === "done" && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="rounded-2xl p-8 max-w-md w-full text-center"
            style={{ background: "#0e0e16", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Invoice downloaded!</h2>
            <p className="text-zinc-400 text-sm mb-7 leading-relaxed">
              That&apos;s your 1 free demo. Create a free account to save invoices, track payments, manage clients, and get 5 invoices per month.
            </p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20"
              >
                Create free account
                <span className="text-orange-200 font-normal text-xs">5 invoices/month</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup?plan=pro"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all border border-white/10 hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                Upgrade to Pro — $9/month
                <span className="text-zinc-400 font-normal text-xs">unlimited invoices</span>
              </Link>
              <p className="text-zinc-600 text-xs pt-1">No credit card required for free plan</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Bill To</h2>
            <Input label="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Smith" />
            <Input label="Client email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="john@example.com" type="email" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder={"123 Main St\nNew York, NY 10001"}
                rows={2}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Dates</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Issue date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Line Items</h2>
              <button
                onClick={() => setItems((p) => [...p, defaultItem()])}
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-zinc-600 uppercase tracking-widest px-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-center">Rate</span>
                <span className="col-span-2 text-right">Amount</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                  <input
                    className="col-span-5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Service description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  />
                  <input
                    className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                    type="number" min="0" step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  />
                  <input
                    className="col-span-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={item.rate || ""}
                    onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                  />
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <span className="text-sm text-white tabular-nums">{formatCurrency(item.amount)}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <div className="flex items-center gap-3 justify-end">
                <label className="text-sm text-zinc-400">Tax %</label>
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={taxRate || ""}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest block mb-3">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, thank you note..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 sticky top-24">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5">Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>Tax ({taxRate}%)</span>
                  <span className="text-white">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2.5 border-t border-white/[0.06]">
                <span className="text-white">Total</span>
                <span className="text-orange-400">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleDownload}
                loading={state === "working"}
                className="w-full"
                size="md"
              >
                <Download className="w-4 h-4" />
                {state === "working" ? "Generating..." : "Download PDF"}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <p className="text-[11px] text-zinc-600 text-center leading-relaxed">
                This is your 1 free demo invoice.{" "}
                <Link href="/signup" className="text-orange-400 hover:text-orange-300 transition-colors">
                  Sign up free
                </Link>
                {" "}to save invoices & create more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
