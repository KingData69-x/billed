"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Users, Settings, LogOut, Zap, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices",  label: "Invoices",  icon: FileText },
  { href: "/clients",   label: "Clients",   icon: Users },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
  userPlan?: "free" | "pro" | "business";
}

export function Sidebar({ userName, userEmail, userPlan = "free" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (userEmail?.[0] ?? "?").toUpperCase();

  const isPaid = userPlan !== "free";

  return (
    <aside
      className="w-60 flex flex-col h-full fixed left-0 top-0 z-20 animate-slide-in-left delay-0"
      style={{ background: "#08080f", borderRight: "1px solid rgba(255,255,255,0.045)" }}
    >
      {/* ── Logo ─────────────────────────────────── */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Link href="/dashboard" className="flex items-center gap-3 group w-fit">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl animate-glow-breathe"
              style={{ background: "rgba(249,115,22,0.55)", filter: "blur(10px)", transform: "scale(1.2)" }}
            />
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #fb923c, #f97316)",
                boxShadow: "0 4px 20px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <Zap style={{ width: 17, height: 17 }} className="text-white fill-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white tracking-tight leading-none">Billed</span>
            {isPaid && (
              <span
                className="text-[9px] font-bold uppercase tracking-widest leading-tight"
                style={{ color: "#fb923c" }}
              >
                {userPlan}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* ── Nav ──────────────────────────────────── */}
      <nav className="flex-1 p-3 pt-5 space-y-0.5">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.14em] px-3 mb-3"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Menu
        </p>

        {navItems.map(({ href, label, icon: Icon }, idx) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "animate-fade-in relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group",
                active
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-200"
              )}
              style={{
                animationDelay: `${idx * 60 + 80}ms`,
                ...(active
                  ? {
                      background: "linear-gradient(90deg, rgba(249,115,22,0.13) 0%, rgba(249,115,22,0.04) 100%)",
                      border: "1px solid rgba(249,115,22,0.14)",
                    }
                  : {
                      border: "1px solid transparent",
                    }),
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Active left accent bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
                  style={{ background: "linear-gradient(180deg, #fb923c, #ea580c)" }}
                />
              )}

              {/* Icon container */}
              <div
                className="w-[26px] h-[26px] rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  background: active
                    ? "rgba(249,115,22,0.22)"
                    : "rgba(255,255,255,0.05)",
                }}
              >
                <Icon
                  className={active ? "text-orange-400" : "text-zinc-600 group-hover:text-zinc-400"}
                  style={{ width: 13, height: 13, transition: "color 0.15s" }}
                />
              </div>

              <span className="flex-1">{label}</span>

              {/* Active dot */}
              {active && (
                <span
                  className="w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ background: "#fb923c", boxShadow: "0 0 6px rgba(249,115,22,0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Upgrade CTA (free only) ───────────────── */}
      {!isPaid && (
        <div className="px-3 pb-3 animate-fade-in delay-400">
          <Link
            href="/settings#billing"
            className="flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all duration-200 group"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.04))",
              border: "1px solid rgba(249,115,22,0.15)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,0.15)";
            }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "rgba(249,115,22,0.2)" }}
            >
              <Sparkles style={{ width: 11, height: 11 }} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-orange-300 leading-none">Upgrade to Pro</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Unlimited invoices</p>
            </div>
          </Link>
        </div>
      )}

      {/* ── User ─────────────────────────────────── */}
      <div
        className="p-3 space-y-1 animate-fade-in delay-500"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
              boxShadow: "0 0 10px rgba(249,115,22,0.3)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-tight">{userName || "User"}</p>
            <p className="text-[10px] truncate leading-tight" style={{ color: "rgba(255,255,255,0.3)" }}>
              {userEmail ?? ""}
            </p>
          </div>
          {isPaid && <Sparkles style={{ width: 11, height: 11 }} className="text-orange-400 shrink-0" />}
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150 w-full"
          style={{ color: "rgba(255,255,255,0.25)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.25)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <LogOut style={{ width: 13, height: 13, flexShrink: 0 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
