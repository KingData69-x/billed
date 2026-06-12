import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency, formatDate, PLAN_LIMITS } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import type { Invoice, Profile } from "@/lib/types";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ data: invoices }, { data: profile }, { count: monthlyCount }] = await Promise.all([
    supabase.from("invoices").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("plan").eq("id", user!.id).single(),
    supabase.from("invoices").select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", monthStart.toISOString()),
  ]);

  const typedInvoices = (invoices ?? []) as Invoice[];
  const plan = (profile as Pick<Profile, "plan"> | null)?.plan ?? "free";
  const limit = PLAN_LIMITS[plan].invoices;
  const isUnlimited = limit === Infinity;
  const used = monthlyCount ?? 0;
  const remaining = isUnlimited ? Infinity : limit - used;
  const atLimit = !isUnlimited && remaining <= 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-zinc-400 text-sm">{typedInvoices.length} total</p>
            {!isUnlimited && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-sm">·</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: limit as number }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < used ? "bg-orange-400" : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium ${atLimit ? "text-red-400" : remaining <= 1 ? "text-orange-400" : "text-zinc-500"}`}>
                  {atLimit ? "Limit reached" : `${remaining} of ${limit} invoices left this month`}
                </span>
              </div>
            )}
          </div>
        </div>
        {atLimit ? (
          <Link href="/settings#billing" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-orange-500/20">
            Upgrade to unlock
          </Link>
        ) : (
          <Link href="/invoices/new" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-orange-500/20">
            <Plus className="w-4 h-4" />
            New Invoice
          </Link>
        )}
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
