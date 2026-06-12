import Link from "next/link";
import { Zap, FileText, Download, Users, TrendingUp, CheckCircle, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08080f]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-white">Billed</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-400 mb-8">
          <Star className="w-3.5 h-3.5 fill-orange-400" />
          Free forever — no credit card needed
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          Invoice clients like a{" "}
          <span className="text-orange-500">pro.</span>
          <br />Get paid faster.
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          Create beautiful, professional invoices in under 60 seconds. Download as PDF, track payments, and manage clients — all free.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-orange-500/25">
            Create your first invoice
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/invoices/new" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl text-base transition-all">
            Try without account
          </Link>
        </div>
        <p className="text-zinc-500 text-sm mt-4">No credit card. No setup. Just invoices.</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FileText, title: "Professional Invoices", desc: "Beautiful templates that make you look legit. Clients pay faster when invoices look professional." },
            { icon: Download, title: "Instant PDF Export", desc: "Download print-ready PDFs instantly. Works in your browser — no apps, no installs." },
            { icon: Users, title: "Client Management", desc: "Save client details. Never re-type an address. Send the same client 10 invoices in seconds." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all">
              <div className="w-10 h-10 bg-orange-500/15 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16" id="pricing">
        <h2 className="text-3xl font-bold text-center text-white mb-3">Simple, honest pricing</h2>
        <p className="text-center text-zinc-400 mb-12">Start free. Upgrade when you need more.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Free", price: "$0", period: "forever",
              features: ["5 invoices/month", "3 clients", "PDF download", "1 template"],
              cta: "Start for free", href: "/signup", highlighted: false,
            },
            {
              name: "Pro", price: "$9", period: "/month",
              features: ["Unlimited invoices", "Unlimited clients", "All templates", "Recurring invoices", "Payment tracking", "Custom branding"],
              cta: "Get Pro", href: "/signup?plan=pro", highlighted: true,
            },
            {
              name: "Business", price: "$19", period: "/month",
              features: ["Everything in Pro", "Multiple businesses", "Client portal", "Expense tracking", "Tax reports", "Priority support"],
              cta: "Get Business", href: "/signup?plan=business", highlighted: false,
            },
          ].map((plan) => (
            <div key={plan.name} className={"rounded-2xl p-6 border " + (plan.highlighted ? "bg-orange-500/10 border-orange-500/40 relative" : "bg-white/[0.03] border-white/5")}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={"block text-center font-semibold py-2.5 rounded-lg text-sm transition-all " + (plan.highlighted ? "bg-orange-500 hover:bg-orange-400 text-white" : "bg-white/10 hover:bg-white/15 text-white")}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-sm font-semibold text-white">Billed</span>
          </div>
          <p className="text-zinc-500 text-sm">2026 Billed. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
