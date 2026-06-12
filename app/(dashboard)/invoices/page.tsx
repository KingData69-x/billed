import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import type { Invoice } from "@/lib/types";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const typedInvoices = (invoices ?? []) as Invoice[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-zinc-400 text-sm mt-0.5">{typedInvoices.length} total</p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-orange-500/20">
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        {typedInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-10 h-10 text-zinc-600 mb-4" />
            <p className="text-white font-medium mb-1">No invoices yet</p>
            <p className="text-zinc-400 text-sm mb-6">Create your first invoice to get started</p>
            <Link href="/invoices/new" className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Create Invoice
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr className="text-xs text-zinc-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Invoice #</th>
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-left px-5 py-3 font-medium">Issued</th>
                <th className="text-left px-5 py-3 font-medium">Due</th>
                <th className="text-right px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {typedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5 text-sm text-white font-medium">{inv.invoice_number}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-300">{inv.client_name}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-400">{formatDate(inv.issue_date)}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-400">{formatDate(inv.due_date)}</td>
                  <td className="px-5 py-3.5 text-sm text-white font-medium text-right">{formatCurrency(inv.total)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/invoices/${inv.id}`} className="text-xs text-orange-400 hover:text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
