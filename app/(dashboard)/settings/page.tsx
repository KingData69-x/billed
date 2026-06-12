"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Zap } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      setProfile(data as Profile);
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      full_name: profile.full_name,
      business_name: profile.business_name,
      business_email: profile.business_email,
      business_phone: profile.business_phone,
      business_address: profile.business_address,
    }).eq("id", profile.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpgrade(plan: "pro" | "business") {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  if (!profile) return <div className="text-zinc-400 py-16 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Manage your business details and billing</p>
      </div>

      {/* Business info */}
      <section className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">Business Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Your name" value={profile.full_name ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, full_name: e.target.value } : p)} placeholder="Alex Johnson" />
            <Input label="Business name" value={profile.business_name ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, business_name: e.target.value } : p)} placeholder="My Agency LLC" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Business email" type="email" value={profile.business_email ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, business_email: e.target.value } : p)} placeholder="hello@mybiz.com" />
            <Input label="Business phone" value={profile.business_phone ?? ""} onChange={(e) => setProfile((p) => p ? { ...p, business_phone: e.target.value } : p)} placeholder="+1 234 567 8900" />
          </div>
          <Button type="submit" loading={saving} size="sm">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : "Save Changes"}
          </Button>
        </form>
      </section>

      {/* Billing / Plan */}
      <section className="bg-white/[0.03] border border-white/5 rounded-xl p-5" id="billing">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">Plan & Billing</h2>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-white font-semibold capitalize">{profile.plan} Plan</p>
            <p className="text-zinc-400 text-xs">
              {profile.plan === "free" ? `${5 - profile.invoice_count} invoices remaining this month` : "Unlimited invoices"}
            </p>
          </div>
        </div>

        {profile.plan === "free" && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { plan: "pro" as const, price: "$9/mo", features: ["Unlimited invoices", "All templates", "Recurring invoices", "Custom branding"] },
              { plan: "business" as const, price: "$19/mo", features: ["Everything in Pro", "Client portal", "Expense tracking", "Tax reports"] },
            ].map(({ plan, price, features }) => (
              <div key={plan} className="border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold capitalize">{plan}</p>
                  <span className="text-orange-400 font-bold text-sm">{price}</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-400">
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => handleUpgrade(plan)} size="sm" className="w-full">
                  Upgrade to {plan}
                </Button>
              </div>
            ))}
          </div>
        )}

        {profile.plan !== "free" && (
          <p className="text-zinc-400 text-sm">
            You&apos;re on the <strong className="text-white capitalize">{profile.plan}</strong> plan. Manage your subscription via the Stripe portal.
          </p>
        )}
      </section>
    </div>
  );
}
