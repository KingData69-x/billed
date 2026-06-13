import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { ShareButton } from "./share-button";
import { ArrowLeft } from "lucide-react";
import type { Invoice, Profile } from "@/lib/types";

export default async function InvoicePage(props: PageProps<"/invoices/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: invoice }, { data: profile }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).eq("user_id", user!.id).single(),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  if (!invoice) notFound();

  const inv = invoice as Invoice;
  const prof = profile as Profile;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/invoices" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{inv.invoice_number}</h1>
            <StatusBadge status={inv.status} />
          </div>
          <p className="text-zinc-400 text-sm mt-0.5">Created {formatDate(inv.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton invoiceId={inv.id} existingToken={inv.public_token ?? null} />
          <InvoiceActions invoice={inv} profile={prof} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* From / To */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">From</p>
              <p className="text-white font-semibold">{prof.business_name || prof.full_name || "Your Business"}</p>
              {prof.business_email && <p className="text-zinc-400 text-sm">{prof.business_email}</p>}
              {prof.business_phone && <p className="text-zinc-400 text-sm">{prof.business_phone}</p>}
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Bill To</p>
              <p className="text-white font-semibold">{inv.client_name}</p>
              {inv.client_email && <p className="text-zinc-400 text-sm">{inv.client_email}</p>}
              {inv.client_address && <p className="text-zinc-400 text-sm whitespace-pre-line">{inv.client_address}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/5">
                <tr className="text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Description</th>
                  <th className="text-center px-4 py-3 font-medium">Qty</th>
                  <th className="text-right px-4 py-3 font-medium">Rate</th>
                  <th className="text-right px-5 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {inv.items.map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm text-white">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400 text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-5 py-3 text-sm text-white font-medium text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inv.notes && (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-zinc-300 text-sm whitespace-pre-line">{inv.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Issue Date", value: formatDate(inv.issue_date) },
                { label: "Due Date", value: formatDate(inv.due_date) },
                { label: "Currency", value: inv.currency },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-zinc-400">{label}</dt>
                  <dd className="text-white font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Totals</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-400">Subtotal</dt>
                <dd className="text-white">{formatCurrency(inv.subtotal)}</dd>
              </div>
              {inv.tax_rate > 0 && (
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Tax ({inv.tax_rate}%)</dt>
                  <dd className="text-white">{formatCurrency(inv.tax_amount)}</dd>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
                <dt className="text-white">Total</dt>
                <dd className="text-orange-400">{formatCurrency(inv.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
