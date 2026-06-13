"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Download, Save, AlertTriangle } from "lucide-react";
import type { InvoiceItem, Client, Profile } from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/utils";

interface InvoiceFormProps {
  profile: Profile | null;
  clients: Client[];
  monthlyCount: number;
}

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

export function InvoiceForm({ profile, clients, monthlyCount }: InvoiceFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Invoice fields
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

  function loadClient(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setClientEmail(client.email ?? "");
      setClientAddress(client.address ?? "");
    }
  }

  async function handleSave(status: "draft" | "sent" = "draft") {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("invoice_count").eq("id", user.id).single();
    const invoiceNumber = `INV-${String((profile?.invoice_count ?? 0) + 1).padStart(4, "0")}`;

    const { data, error } = await supabase.from("invoices").insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      status,
      issue_date: issueDate,
      due_date: dueDate,
      items,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      notes,
      client_name: clientName,
      client_email: clientEmail || null,
      client_address: clientAddress || null,
    }).select().single();

    if (!error && data) {
      await supabase.from("profiles").update({ invoice_count: (profile?.invoice_count ?? 0) + 1 }).eq("id", user.id);
      router.push(`/invoices/${data.id}`);
    }
    setSaving(false);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const { generateInvoicePDF } = await import("@/lib/pdf");
      const fakeProfile = profile ?? { id: "", email: "", full_name: "Your Business", business_name: null, business_email: null, business_phone: null, business_address: null, plan: "free" as const, stripe_customer_id: null, invoice_count: 0, payment_bank_name: null, payment_bank_account: null, payment_bank_routing: null, payment_paypal: null, payment_venmo: null, payment_cashapp: null, payment_other: null, referral_code: null, referred_by: null, created_at: "" };
      const fakeInvoice = {
        id: "preview", user_id: "", client_id: null,
        invoice_number: "INV-PREVIEW",
        status: "draft" as const,
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
      a.download = "invoice-preview.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  const plan = profile?.plan ?? "free";
  const limit = PLAN_LIMITS[plan].invoices;
  const isUnlimited = limit === Infinity;
  const remaining = isUnlimited ? Infinity : limit - monthlyCount;
  const atLimit = !isUnlimited && remaining <= 0;
  const nearLimit = !isUnlimited && remaining <= 1 && remaining > 0;

  return (
    <div className="space-y-4">
      {/* Invoice counter */}
      {!isUnlimited && (
        <div className={cn(
          "flex items-center justify-between rounded-xl px-4 py-3 text-sm border",
          atLimit
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : nearLimit
            ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
            : "bg-white/[0.03] border-white/5 text-zinc-400"
        )}>
          <div className="flex items-center gap-2">
            {(atLimit || nearLimit) && <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>
              {atLimit
                ? "You've used all 5 free invoices this month."
                : `${monthlyCount} of ${limit} free invoices used this month`}
            </span>
          </div>
          {atLimit ? (
            <a href="/settings#billing" className="font-semibold text-orange-400 hover:text-orange-300 whitespace-nowrap ml-4">Upgrade →</a>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full", i < monthlyCount ? "bg-orange-400" : "bg-white/10")} />
              ))}
            </div>
          )}
        </div>
      )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Client */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Bill To</h2>
          {clients.length > 0 && (
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">Load from saved client</label>
              <select
                onChange={(e) => loadClient(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">— Select client —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <Input label="Client name *" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Smith" required />
          <Input label="Client email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="john@example.com" type="email" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Address</label>
            <textarea
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="123 Main St&#10;New York, NY 10001"
              rows={2}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Issue date" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Line Items</h2>
            <button onClick={() => setItems((p) => [...p, defaultItem()])} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add item
            </button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 uppercase tracking-wide px-1">
              <span className="col-span-5">Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-center">Rate</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                <input
                  className="col-span-5 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Service description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                />
                <input
                  className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                  type="number" min="0" step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                />
                <input
                  className="col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={item.rate || ""}
                  onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                />
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <span className="text-sm text-white">{formatCurrency(item.amount)}</span>
                  {items.length > 1 && (
                    <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 justify-end">
              <label className="text-sm text-zinc-400">Tax %</label>
              <input
                type="number" min="0" max="100" step="0.1"
                value={taxRate || ""}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <label className="text-sm font-semibold text-white uppercase tracking-wide block mb-3">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, thank you note, bank details..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Right: Summary */}
      <div className="space-y-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 sticky top-8">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">Summary</h2>
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
            <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
              <span className="text-white">Total</span>
              <span className="text-orange-400">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <Button onClick={() => handleSave("draft")} loading={saving} variant="secondary" className="w-full" size="md">
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button onClick={() => handleSave("sent")} loading={saving} className="w-full" size="md">
              Save & Mark Sent
            </Button>
            <Button onClick={handleDownload} loading={downloading} variant="ghost" className="w-full" size="md">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>

          <p className="text-xs text-zinc-500 text-center mt-4">
            Saving stores your invoice. PDF can be emailed to clients.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
