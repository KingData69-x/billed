import { createAdminClient } from "@/lib/supabase/admin";
import {
  Users, FileText, DollarSign, TrendingUp, Activity,
  Crown, Zap, Star, UserCheck, MousePointer, Clock,
} from "lucide-react";

const PRO_PRICE = 9;
const BUSINESS_PRICE = 19;

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function KpiCard({
  label, value, sub, icon: Icon, color, glow,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; glow: string;
}) {
  return (
    <div
      className="p-px rounded-2xl"
      style={{ background: `linear-gradient(135deg, ${color}55 0%, rgba(255,255,255,0.04) 60%, transparent 100%)` }}
    >
      <div className="rounded-2xl p-5 h-full" style={{ background: "#0b0b14" }}>
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${glow}20` }}
          >
            <Icon style={{ width: 18, height: 18, color: glow }} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white tabular-nums tracking-tight leading-none">{value}</p>
        <p className="text-xs font-medium mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
        {sub && (
          <p className="text-[10px] mt-1.5 font-medium" style={{ color: glow + "cc" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

function PlanBar({
  plan, count, total, revenue, color, glow,
}: {
  plan: string; count: number; total: number; revenue: number; color: string; glow: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: glow }} />
          <span className="text-sm font-medium text-white capitalize">{plan}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: glow + "22", color: glow }}
          >
            {count}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-white">{pct}%</span>
          {revenue > 0 && (
            <span className="text-[10px] ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              {fmt$(revenue)}/mo
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: glow }}
        />
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const admin = createAdminClient();

  const [
    { data: profiles },
    { data: invoices },
    { count: demoCount },
  ] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, plan, created_at"),
    admin.from("invoices").select("id, total, status, user_id, created_at"),
    admin.from("demo_usage").select("*", { count: "exact", head: true }),
  ]);

  // Plan breakdown
  const planCounts = { free: 0, pro: 0, business: 0 };
  (profiles ?? []).forEach((p) => {
    const plan = (p.plan ?? "free") as keyof typeof planCounts;
    if (plan in planCounts) planCounts[plan]++;
  });
  const totalUsers = (profiles ?? []).length;

  // Revenue
  const mrr = planCounts.pro * PRO_PRICE + planCounts.business * BUSINESS_PRICE;
  const arr = mrr * 12;

  // Invoice stats
  const totalInvoices = (invoices ?? []).length;
  const paidInvoices = (invoices ?? []).filter((i) => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s, i) => s + (i.total ?? 0), 0);
  const pendingInvoices = (invoices ?? []).filter((i) => i.status === "pending").length;
  const overdueInvoices = (invoices ?? []).filter((i) => i.status === "overdue").length;

  // Monthly (current calendar month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newUsersThisMonth = (profiles ?? []).filter((p) => p.created_at >= monthStart).length;
  const newInvoicesThisMonth = (invoices ?? []).filter((i) => i.created_at >= monthStart).length;

  // Recent 10 users
  const recent = [...(profiles ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((p) => ({
      ...p,
      invoiceCount: (invoices ?? []).filter((i) => i.user_id === p.id).length,
    }));

  // Per-user invoice stats map for top earners
  const userRevenue: Record<string, number> = {};
  paidInvoices.forEach((i) => {
    userRevenue[i.user_id] = (userRevenue[i.user_id] ?? 0) + (i.total ?? 0);
  });

  const planColors = {
    free: { color: "rgba(148,163,184,0.5)", glow: "#94a3b8" },
    pro: { color: "rgba(249,115,22,0.5)", glow: "#fb923c" },
    business: { color: "rgba(168,85,247,0.5)", glow: "#a855f7" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Business Overview</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
          Real-time metrics for Swiftbill — updated on every page load
        </p>
      </div>

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Monthly Recurring Revenue"
          value={fmt$(mrr)}
          sub={mrr === 0 ? "No paid users yet" : `${planCounts.pro + planCounts.business} paid subscribers`}
          icon={DollarSign}
          color="rgba(16,185,129,0.5)"
          glow="#10b981"
        />
        <KpiCard
          label="Annual Recurring Revenue"
          value={fmt$(arr)}
          sub="MRR × 12"
          icon={TrendingUp}
          color="rgba(249,115,22,0.5)"
          glow="#fb923c"
        />
        <KpiCard
          label="Total Users"
          value={totalUsers.toLocaleString()}
          sub={`${newUsersThisMonth} new this month`}
          icon={Users}
          color="rgba(59,130,246,0.5)"
          glow="#3b82f6"
        />
        <KpiCard
          label="Total Invoices"
          value={totalInvoices.toLocaleString()}
          sub={`${newInvoicesThisMonth} created this month`}
          icon={FileText}
          color="rgba(168,85,247,0.5)"
          glow="#a855f7"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Invoice Revenue (paid)"
          value={fmt$(totalRevenue)}
          sub={`${paidInvoices.length} paid invoices`}
          icon={Crown}
          color="rgba(234,179,8,0.5)"
          glow="#eab308"
        />
        <KpiCard
          label="Pending Invoices"
          value={pendingInvoices.toLocaleString()}
          sub="Awaiting payment"
          icon={Clock}
          color="rgba(59,130,246,0.5)"
          glow="#60a5fa"
        />
        <KpiCard
          label="Overdue Invoices"
          value={overdueInvoices.toLocaleString()}
          sub="Past due date"
          icon={Activity}
          color="rgba(239,68,68,0.5)"
          glow="#ef4444"
        />
        <KpiCard
          label="Demo Uses"
          value={(demoCount ?? 0).toLocaleString()}
          sub="Unique IPs tried demo"
          icon={MousePointer}
          color="rgba(20,184,166,0.5)"
          glow="#14b8a6"
        />
      </div>

      {/* Plan breakdown + Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Plan breakdown */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Star style={{ width: 15, height: 15 }} className="text-orange-400" />
            <h2 className="text-sm font-bold text-white">Plan Distribution</h2>
          </div>
          <div className="space-y-4">
            {(["free", "pro", "business"] as const).map((plan) => (
              <PlanBar
                key={plan}
                plan={plan}
                count={planCounts[plan]}
                total={totalUsers}
                revenue={
                  plan === "pro"
                    ? planCounts.pro * PRO_PRICE
                    : plan === "business"
                    ? planCounts.business * BUSINESS_PRICE
                    : 0
                }
                color={planColors[plan].color}
                glow={planColors[plan].glow}
              />
            ))}
          </div>

          <div
            className="mt-6 pt-4 grid grid-cols-3 gap-3 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            {(["free", "pro", "business"] as const).map((plan) => (
              <div key={plan}>
                <p className="text-lg font-bold text-white tabular-nums">{planCounts[plan]}</p>
                <p className="text-[10px] capitalize" style={{ color: planColors[plan].glow }}>{plan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth this month */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap style={{ width: 15, height: 15 }} className="text-orange-400" />
            <h2 className="text-sm font-bold text-white">This Month</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "New sign-ups", value: newUsersThisMonth, glow: "#3b82f6", icon: UserCheck },
              { label: "New invoices", value: newInvoicesThisMonth, glow: "#10b981", icon: FileText },
              { label: "Demo uses (all-time)", value: demoCount ?? 0, glow: "#14b8a6", icon: MousePointer },
              {
                label: "Est. conversion",
                value: (demoCount ?? 0) > 0
                  ? `${Math.round((planCounts.pro + planCounts.business) / (demoCount ?? 1) * 100)}%`
                  : "—",
                glow: "#fb923c",
                icon: TrendingUp,
                isString: true,
              },
            ].map(({ label, value, glow, icon: Icon, isString }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: glow + "22" }}
                >
                  <Icon style={{ width: 14, height: 14, color: glow }} />
                </div>
                <p
                  className="text-xl font-bold text-white tabular-nums leading-none"
                >
                  {isString ? value : (value as number).toLocaleString()}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ background: "#0b0b14", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Users style={{ width: 15, height: 15 }} className="text-orange-400" />
          <h2 className="text-sm font-bold text-white">Recent Accounts</h2>
          <span
            className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c" }}
          >
            Last 10
          </span>
        </div>

        <div style={{ background: "#09091200" }}>
          {/* Header row */}
          <div
            className="grid px-6 py-2 text-[10px] font-bold uppercase tracking-widest"
            style={{
              gridTemplateColumns: "1fr 1fr 80px 60px 110px",
              color: "rgba(255,255,255,0.25)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: "#0b0b14",
            }}
          >
            <span>User</span>
            <span>Email</span>
            <span>Plan</span>
            <span className="text-right">Invoices</span>
            <span className="text-right">Joined</span>
          </div>

          {recent.map((user, i) => {
            const plan = (user.plan ?? "free") as keyof typeof planColors;
            const glow = planColors[plan]?.glow ?? "#94a3b8";
            const initials = user.full_name
              ? user.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
              : (user.email?.[0] ?? "?").toUpperCase();
            const date = new Date(user.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            });

            return (
              <div
                key={user.id}
                className="grid px-6 py-3 dashboard-table-row transition-colors"
                style={{
                  gridTemplateColumns: "1fr 1fr 80px 60px 110px",
                  borderBottom: i < recent.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: "#0b0b14",
                }}
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${glow}99, ${glow}44)` }}
                  >
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-white truncate">
                    {user.full_name || "—"}
                  </span>
                </div>

                {/* Email */}
                <span className="text-xs truncate self-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {user.email ?? "—"}
                </span>

                {/* Plan badge */}
                <div className="flex items-center">
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                    style={{ background: glow + "22", color: glow, border: `1px solid ${glow}44` }}
                  >
                    {plan}
                  </span>
                </div>

                {/* Invoice count */}
                <span className="text-xs font-semibold text-white text-right self-center tabular-nums">
                  {user.invoiceCount}
                </span>

                {/* Date */}
                <span className="text-[10px] text-right self-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {date}
                </span>
              </div>
            );
          })}

          {recent.length === 0 && (
            <div className="px-6 py-10 text-center" style={{ background: "#0b0b14" }}>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>No users yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
