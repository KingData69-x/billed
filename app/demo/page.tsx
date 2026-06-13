import { headers } from "next/headers";
import { createAnonClient } from "@/lib/supabase/anon";
import { DemoForm } from "./demo-form";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";

async function hashIP(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default async function DemoPage() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "::1";
  const ipHash = await hashIP(ip);

  const supabase = createAnonClient();
  const { data } = await supabase.from("demo_usage").select("ip_hash").eq("ip_hash", ipHash).maybeSingle();
  const alreadyUsed = !!data;

  if (alreadyUsed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-7 h-7 text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;ve used your free demo</h1>
        <p className="text-zinc-400 max-w-sm mb-8">
          Your free invoice has already been generated. Create a free account to get 5 invoices per month — no credit card needed.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <Link
            href="/signup"
            className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25"
          >
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/signup?plan=pro"
            className="w-full inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all border border-white/10"
          >
            Get Pro — $9/mo
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg text-left">
          {["5 free invoices/month", "PDF download & export", "Client management"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Banner */}
      <div className="flex items-center justify-between bg-white/[0.025] border border-white/[0.06] rounded-2xl px-5 py-3.5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
          <p className="text-sm text-zinc-300">
            <span className="text-white font-semibold">1 free demo invoice.</span>
            {" "}Fill it out and download your PDF — no account needed.
          </p>
        </div>
        <Link href="/signup" className="text-xs font-semibold text-orange-400 hover:text-orange-300 whitespace-nowrap ml-4 transition-colors">
          Sign up for more →
        </Link>
      </div>

      <DemoForm />
    </div>
  );
}
