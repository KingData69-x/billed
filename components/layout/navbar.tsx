"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Users, Settings, LogOut, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
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

  return (
    <aside className="w-60 flex flex-col h-full fixed left-0 top-0 z-10" style={{ background: "#09090f", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group w-fit">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-orange-500 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Billed</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 pt-4">
        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
              )}
              style={active ? { background: "rgba(255,255,255,0.07)" } : {}}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-400 rounded-full" />
              )}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0",
                active ? "bg-orange-500/20" : "bg-white/[0.04] group-hover:bg-white/[0.07]"
              )}>
                <Icon className={cn("w-3.5 h-3.5", active ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              </div>
              <span className="flex-1">{label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-orange-400/70 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-tight">{userName || "User"}</p>
            <p className="text-[11px] text-zinc-500 truncate leading-tight">{userEmail ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-all w-full"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
