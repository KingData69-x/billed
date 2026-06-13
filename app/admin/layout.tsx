import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield, LayoutDashboard, ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen" style={{ background: "#07070d" }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
        style={{
          background: "rgba(7,7,13,0.9)",
          borderBottom: "1px solid rgba(249,115,22,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}
          >
            <Shield style={{ width: 14, height: 14 }} className="text-orange-400" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Owner Panel</span>
          <span
            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.25)" }}
          >
            Admin
          </span>
        </div>

        <div className="flex-1" />

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to App
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <LayoutDashboard style={{ width: 12, height: 12 }} />
          Dashboard
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
