import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, TrendingUp, Clock, DollarSign, FileText, Users, ChevronRight } from "lucide-react";
import type { Invoice, Profile } from "@/lib/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatGreetingDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { data: allInvoicesRaw },
    { data: profile },
    { data: recentInvoicesRaw },
    { count: clientCount },
  ] = await Promise.all([
    supabase.from("invoices").select("status, total, created_at").eq("user_id", user!.id),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("invoices").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  const allInvoices = (allInvoicesRaw ?? []) as Pick<Invoice, "status" | "total" | "created_at">[];
  const recent = (recentInvoicesRaw ?? []) as Invoice[];
  const typedProfile = profile as Profile | null;

  const totalEarned = allInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = allInvoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const monthlyInvoices = allInvoices.filter(i => new Date(i.created_at) >= monthStart);
  const monthlyRevenue = monthlyInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);

  const firstName = typedProfile?.full_name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Total Earned",
      value: formatCurrency(totalEarned),
      sub: "Paid invoices",
      icon: DollarSign,
      iconClass: "text-emerald-400",
      iconBgClass: "bg-emerald-500/10",
      glowClass: "from-emerald-500/[0.07]",
    },
    {
      label: "Outstanding",
      value: formatCurrency(outstanding),
      sub: "Awaiting payment",
      icon: Clock,
      iconClass: "text-blue-400",
      iconBgClass: "bg-blue-500/10",
      glowClass: "from-blue-500/[0.07]",
    },
    {
      label: "This Month",
      value: formatCurrency(monthlyRevenue),
      sub: `${monthlyInvoices.length} invoices`,
      icon: TrendingUp,
      iconClass: "text-orange-400",
      iconBgClass: "bg-orange-500/10",
      glowClass: "from-orange-500/[0.07]",
    },
    {
      label: "Clients",
      value: String(clientCount ?? 0),
      sub: "Total saved",
      icon: Users,
      iconClass: "text-purple-400",
      iconBgClass: "bg-purple-500/10",
      glowClass: "from-purple-500/[0.07]",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{formatGreetingDate()}</p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Free plan banner */}
      {typedProfile?.plan === "free" && (
        <div className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between bg-orange-500/[0.06] border border-orange-500/[0.14]">
          <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-orange-500/[0.04] to-transparent" />
          <div>
            <p className="text-white font-semibold text-sm">Free Plan</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              {Math.max(0, 5 - monthlyInvoices.length)} of 5 invoices remaining this month · Upgrade for unlimited
            </p>
          </div>
          <Link
            href="/settings#billing"
            className="relative flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Upgrade <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, iconClass, iconBgClass, glowClass }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-2xl p-5 bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${glowClass} to-transparent`} />
            <div className="relative">
              <div className={`w-9 h-9 ${iconBgClass} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={iconClass} style={{ width: 17, height: 17 }} />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums leading-none">{value}</p>
              <p className="text-zinc-400 text-xs mt-1.5 font-medium">{label}</p>
              <p className="text-zinc-600 text-[11px] mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/invoices/new", label: "New Invoice", desc: "Create & send", icon: Plus, accent: true },
            { href: "/invoices", label: "All Invoices", desc: `${allInvoices.length} total`, icon: FileText, accent: false },
            { href: "/clients", label: "Clients", desc: `${clientCount ?? 0} saved`, icon: Users, accent: false },
          ].map(({ href, label, desc, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${
                accent
                  ? "bg-orange-500/[0.07] border border-orange-500/[0.18] hover:bg-orange-500/[0.11] hover:border-orange-500/30"
                  : "bg-white/[0.025] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-orange-500/20" : "bg-white/[0.05] group-hover:bg-white/[0.08]"}`}>
                <Icon className={`w-4 h-4 ${accent ? "text-orange-400" : "text-zinc-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${accent ? "text-orange-300" : "text-zinc-200"}`}>{label}</p>
                <p className="text-[11px] text-zinc-500 truncate">{desc}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Recent Invoices</p>
          <Link href="/invoices" className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05]">
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/[0.03]">
                <FileText className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-zinc-300 font-medium mb-1">No invoices yet</p>
              <p className="text-zinc-500 text-sm mb-5">Create your first invoice to get started</p>
              <Link href="/invoices/new" className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Create Invoice
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Invoice</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Client</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Amount</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Status</th>
                  <th className="text-right px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={`group hover:bg-white/[0.02] transition-colors ${i < recent.length - 1 ? "border-b border-white/[0.03]" : ""}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-white font-semibold">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400">{inv.client_name}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white tabular-nums">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        View <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
