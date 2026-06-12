import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, TrendingUp, Clock, CheckCircle, DollarSign } from "lucide-react";
import type { Invoice } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: invoices }, { data: profile }] = await Promise.all([
    supabase.from("invoices").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  const typedInvoices = (invoices ?? []) as Invoice[];
  const total = typedInvoices.reduce((s, i) => s + i.total, 0);
  const paid = typedInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = typedInvoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: "Total Invoiced", value: formatCurrency(total), icon: DollarSign, color: "text-orange-400" },
    { label: "Paid", value: formatCurrency(paid), icon: CheckCircle, color: "text-emerald-400" },
    { label: "Outstanding", value: formatCurrency(outstanding), icon: Clock, color: "text-blue-400" },
    { label: "This Month", value: String(typedInvoices.length), icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-orange-500/20">
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <span className="text-xl font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Plan upgrade prompt for free users */}
      {profile?.plan === "free" && (
        <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/15 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">You&apos;re on the Free plan</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              {5 - (profile?.invoice_count ?? 0)} invoices remaining this month. Upgrade for unlimited.
            </p>
          </div>
          <Link href="/settings#billing" className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Upgrade
          </Link>
        </div>
      )}

      {/* Recent invoices */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Recent Invoices</h2>
          <Link href="/invoices" className="text-xs text-orange-400 hover:text-orange-300">View all</Link>
        </div>
        {typedInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-zinc-400 mb-4">No invoices yet</p>
            <Link href="/invoices/new" className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-zinc-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Invoice</th>
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {typedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">{inv.invoice_number}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{inv.client_name}</td>
                  <td className="px-5 py-3 text-sm text-white">{formatCurrency(inv.total)}</td>
                  <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/invoices/${inv.id}`} className="text-xs text-orange-400 hover:text-orange-300">View</Link>
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
