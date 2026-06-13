"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Zap, CreditCard, Building2, Wallet, Users, Copy, Check } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savedPayment, setSavedPayment] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      setProfile(data as Profile);
      if (data?.referral_code) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("referred_by", data.referral_code);
        setReferralCount(count ?? 0);
      }
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

  async function handleSavePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSavingPayment(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      payment_bank_name: profile.payment_bank_name,
      payment_bank_account: profile.payment_bank_account,
      payment_bank_routing: profile.payment_bank_routing,
      payment_paypal: profile.payment_paypal,
      payment_venmo: profile.payment_venmo,
      payment_cashapp: profile.payment_cashapp,
      payment_other: profile.payment_other,
    }).eq("id", profile.id);
    setSavingPayment(false);
    setSavedPayment(true);
    setTimeout(() => setSavedPayment(false), 2000);
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

      {/* Payment Methods — Pro/Business only */}
      {profile.plan !== "free" && (
        <section className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <CreditCard className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Payment Methods</h2>
          </div>
          <p className="text-zinc-500 text-xs mb-5 ml-7">These details appear at the bottom of every invoice PDF so clients know how to pay you.</p>

          <form onSubmit={handleSavePayment} className="space-y-5">
            {/* Bank Transfer */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Bank Transfer</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Bank name"
                  value={profile.payment_bank_name ?? ""}
                  onChange={(e) => setProfile((p) => p ? { ...p, payment_bank_name: e.target.value } : p)}
                  placeholder="Chase, Wells Fargo..."
                />
                <Input
                  label="Account number"
                  value={profile.payment_bank_account ?? ""}
                  onChange={(e) => setProfile((p) => p ? { ...p, payment_bank_account: e.target.value } : p)}
                  placeholder="000123456789"
                />
                <Input
                  label="Routing number"
                  value={profile.payment_bank_routing ?? ""}
                  onChange={(e) => setProfile((p) => p ? { ...p, payment_bank_routing: e.target.value } : p)}
                  placeholder="021000021"
                />
              </div>
            </div>

            {/* Digital wallets */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Digital Wallets</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="PayPal"
                  value={profile.payment_paypal ?? ""}
                  onChange={(e) => setProfile((p) => p ? { ...p, payment_paypal: e.target.value } : p)}
                  placeholder="paypal.me/yourname"
                />
                <Input
                  label="Venmo"
                  value={profile.payment_venmo ?? ""}
                  onChange={(e) => setProfile((p) => p ? { ...p, payment_venmo: e.target.value } : p)}
                  placeholder="@yourhandle"
                />
                <Input
                  label="Cash App"
                  value={profile.payment_cashapp ?? ""}
                  onChange={(e) => setProfile((p) => p ? { ...p, payment_cashapp: e.target.value } : p)}
                  placeholder="$yourcashtag"
                />
              </div>
            </div>

            {/* Custom instructions */}
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">Other / Custom instructions</label>
              <textarea
                value={profile.payment_other ?? ""}
                onChange={(e) => setProfile((p) => p ? { ...p, payment_other: e.target.value } : p)}
                placeholder="Zelle: your@email.com, Crypto: 0x... or any other payment details"
                rows={2}
                className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <Button type="submit" loading={savingPayment} size="sm">
              {savedPayment ? <><CheckCircle className="w-4 h-4" /> Saved!</> : "Save Payment Info"}
            </Button>
          </form>
        </section>
      )}
      {/* Referral */}
      {profile.referral_code && (
        <section
          className="rounded-xl p-5"
          style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02))", border: "1px solid rgba(249,115,22,0.15)" }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Refer a Friend</h2>
          </div>
          <p className="text-zinc-500 text-xs mb-4 ml-7">
            Share your link. Every freelancer or business you send to Swiftbill helps grow the community.
          </p>

          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex-1 px-3 py-2 rounded-lg text-sm font-mono text-zinc-300 truncate"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${profile.referral_code}` : `https://swiftbill.dev/signup?ref=${profile.referral_code}`}
            </div>
            <button
              onClick={() => {
                const url = `${window.location.origin}/signup?ref=${profile.referral_code}`;
                navigator.clipboard.writeText(url).catch(() => {});
                setCopiedRef(true);
                setTimeout(() => setCopiedRef(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all shrink-0"
              style={{
                background: copiedRef ? "rgba(16,185,129,0.15)" : "rgba(249,115,22,0.15)",
                border: copiedRef ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(249,115,22,0.25)",
                color: copiedRef ? "#10b981" : "#fb923c",
              }}
            >
              {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRef ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: referralCount > 0 ? "#fb923c" : "rgba(255,255,255,0.3)" }}
            >
              {referralCount}
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {referralCount === 1 ? "person" : "people"} signed up via your link
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
