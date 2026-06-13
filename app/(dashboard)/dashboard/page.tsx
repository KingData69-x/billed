import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Plus, ArrowUpRight, FileText, Users, ChevronRight, Receipt, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import type { Invoice, Profile } from "@/lib/types";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatGreetingDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function ClientAvatar({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const palettes = [
    ["rgba(16,185,129,0.18)", "#34d399"],
    ["rgba(59,130,246,0.18)", "#60a5fa"],
    ["rgba(168,85,247,0.18)", "#c084fc"],
    ["rgba(249,115,22,0.18)", "#fb923c"],
    ["rgba(236,72,153,0.18)", "#f472b6"],
  ];
  const [bg, color] = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ background: bg, color }}
    >
      {initials}
    </div>
  );
}

const STATUS_CFG = {
  draft:   { icon: FileText,     color: "#71717a", bg: "rgba(113,113,122,0.12)", border: "rgba(113,113,122,0.2)",  label: "Draft" },
  sent:    { icon: Clock,        color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.2)",   label: "Sent" },
  paid:    { icon: CheckCircle2, color: "#34d399", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.2)",   label: "Paid" },
  overdue: { icon: AlertCircle,  color: "#f87171", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.2)",    label: "Overdue" },
} as const;

function StatusPill({ status }: { status: keyof typeof STATUS_CFG }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <Icon style={{ width: 10, height: 10 }} />
      {cfg.label}
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { data: allRaw },
    { data: profile },
    { data: recentRaw },
    { count: clientCount },
  ] = await Promise.all([
    supabase.from("invoices").select("status, total, created_at").eq("user_id", user!.id),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("invoices").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(6),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  const all     = (allRaw ?? []) as Pick<Invoice, "status" | "total" | "created_at">[];
  const recent  = (recentRaw ?? []) as Invoice[];
  const prof    = profile as Profile | null;

  const totalEarned     = all.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding     = all.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const monthlyInvoices = all.filter(i => new Date(i.created_at) >= monthStart);
  const monthlyRevenue  = monthlyInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);

  const byStatus = {
    draft:   all.filter(i => i.status === "draft"),
    sent:    all.filter(i => i.status === "sent"),
    paid:    all.filter(i => i.status === "paid"),
    overdue: all.filter(i => i.status === "overdue"),
  };

  const firstName = prof?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-0 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>
            {formatGreetingDate()}
          </p>
          <h1 className="text-[30px] font-bold leading-tight text-white">
            {getGreeting()},{" "}
            <span style={{ background: "linear-gradient(90deg,#fb923c,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {firstName}
            </span>
          </h1>
        </div>
        <Link
          href="/invoices/new"
          className="dashboard-cta-btn animate-fade-in delay-150 inline-flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm text-white"
        >
          <Plus style={{ width: 16, height: 16 }} />
          New Invoice
        </Link>
      </div>

      {/* ── Free plan banner ────────────────────────────── */}
      {prof?.plan === "free" && (
        <div
          className="animate-fade-in-up delay-100 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{
            background: "linear-gradient(90deg,rgba(249,115,22,0.08),rgba(249,115,22,0.02))",
            border: "1px solid rgba(249,115,22,0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
              <Receipt style={{ width: 15, height: 15, color: "#fb923c" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Free Plan</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {Math.max(0, 5 - monthlyInvoices.length)} of 5 invoices remaining this month
              </p>
            </div>
          </div>
          <Link
            href="/settings#billing"
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", boxShadow: "0 2px 12px rgba(249,115,22,0.3)" }}
          >
            Upgrade <ArrowUpRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
      )}

      {/* ── Stat cards (client component — animated counters) ─ */}
      <div className="animate-fade-in-up delay-150">
        <StatsGrid
          totalEarned={totalEarned}
          outstanding={outstanding}
          monthlyRevenue={monthlyRevenue}
          clientCount={clientCount ?? 0}
          monthlyInvoiceCount={monthlyInvoices.length}
          totalInvoiceCount={all.length}
        />
      </div>

      {/* ── Middle row: Quick Actions + Invoice Breakdown ── */}
      <div className="animate-fade-in-up delay-300 grid grid-cols-3 gap-5">

        {/* Quick Actions */}
        <div className="col-span-2 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/invoices/new"
              className="dashboard-action-primary group col-span-2 flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(249,115,22,0.22)", boxShadow: "0 0 16px rgba(249,115,22,0.2)" }}>
                <Plus style={{ width: 18, height: 18, color: "#fb923c" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Create Invoice</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Build, customize, and send a PDF</p>
              </div>
              <ChevronRight style={{ width: 14, height: 14, color: "rgba(249,115,22,0.5)" }} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link href="/invoices" className="dashboard-action-secondary group flex items-center gap-3 p-4 rounded-2xl transition-all duration-200">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.12)" }}>
                <FileText style={{ width: 15, height: 15, color: "#60a5fa" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">All Invoices</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{all.length} total</p>
              </div>
              <ChevronRight style={{ width: 13, height: 13 }} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link href="/clients" className="dashboard-action-secondary group flex items-center gap-3 p-4 rounded-2xl transition-all duration-200">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.12)" }}>
                <Users style={{ width: 15, height: 15, color: "#c084fc" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Clients</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{clientCount ?? 0} saved</p>
              </div>
              <ChevronRight style={{ width: 13, height: 13 }} className="text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Invoice Status breakdown */}
        <div className="flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: "rgba(255,255,255,0.22)" }}>
            Invoice Status
          </p>
          <div
            className="flex-1 rounded-2xl p-4 space-y-4"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {(["paid", "sent", "draft", "overdue"] as const).map((s) => {
              const cfg = STATUS_CFG[s];
              const items = byStatus[s];
              const total = items.reduce((sum, i) => sum + i.total, 0);
              const pct = all.length > 0 ? (items.length / all.length) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>{cfg.label}</span>
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>({items.length})</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: cfg.color }}>
                      {items.length > 0 ? formatCurrency(total) : "—"}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color, opacity: 0.65 }} />
                  </div>
                </div>
              );
            })}
            {all.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.2)" }}>No invoices yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Invoices ──────────────────────────────── */}
      <div className="animate-fade-in-up delay-400">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Recent Invoices
          </p>
          <Link href="/invoices" className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            View all <ArrowUpRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <FileText style={{ width: 20, height: 20, color: "rgba(255,255,255,0.2)" }} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">No invoices yet</p>
              <p className="text-xs mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>Create your first invoice to get started</p>
              <Link href="/invoices/new" className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}>
                Create Invoice
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {["Invoice", "Client", "Amount", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] ${i === 4 ? "text-right" : "text-left"}`}
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className="group dashboard-table-row transition-colors"
                    style={i < recent.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.03)" } : {}}
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-white">{inv.invoice_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <ClientAvatar name={inv.client_name} />
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{inv.client_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold tabular-nums text-white">{formatCurrency(inv.total)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={inv.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/invoices/${inv.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 opacity-0 group-hover:opacity-100 transition-all">
                        View <ArrowUpRight style={{ width: 11, height: 11 }} />
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
