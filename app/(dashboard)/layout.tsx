import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07070d" }}>
      {/* Radial glow orbs — purely decorative */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-100px", right: "-100px",
          width: "700px", height: "600px",
          background: "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 68%)",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: "-150px", left: "220px",
          width: "600px", height: "500px",
          background: "radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 68%)",
        }}
      />

      <Sidebar
        userName={profile?.full_name}
        userEmail={user.email}
        userPlan={(profile?.plan as "free" | "pro" | "business") ?? "free"}
        isAdmin={user.email === process.env.ADMIN_EMAIL}
      />

      <main className="flex-1 ml-60 overflow-y-auto relative z-10 dashboard-grid">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
