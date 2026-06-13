import Link from "next/link";
import { Zap, FileText, Download, Users, CheckCircle, ArrowRight, Star, ChevronDown } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

async function getSocialProof() {
  try {
    const admin = createAdminClient();
    const [{ count: userCount }, { count: invoiceCount }] = await Promise.all([
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("invoices").select("*", { count: "exact", head: true }),
    ]);
    return { users: userCount ?? 0, invoices: invoiceCount ?? 0 };
  } catch {
    return { users: 0, invoices: 0 };
  }
}

export default async function LandingPage() {
  const { users, invoices } = await getSocialProof();
  const showProof = users > 5 || invoices > 10;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Swiftbill",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free invoice generator for freelancers. Create professional PDF invoices in 60 seconds.",
    url: "https://billed-alpha.vercel.app",
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "128" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#08080f]">

        {/* Launch banner */}
        <div className="w-full text-center py-2.5 px-4 text-sm font-medium" style={{ background: "linear-gradient(90deg,#ea580c,#f97316,#ea580c)", backgroundSize: "200% 100%" }}>
          <span className="text-white">🔥 Launch week — Pro plan 50% off first month. Use code </span>
          <span className="font-black text-white bg-black/25 px-1.5 py-0.5 rounded text-xs tracking-widest">LAUNCH50</span>
          <span className="text-white"> at checkout.</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white">Swiftbill</span>
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

          {/* Social proof counter */}
          {showProof && (
            <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
              {invoices > 0 && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span><strong className="text-white">{invoices.toLocaleString()}</strong> invoices created</span>
                </div>
              )}
              {users > 0 && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span><strong className="text-white">{users.toLocaleString()}</strong> freelancers signed up</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-orange-500/25">
              Create your first invoice
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl text-base transition-all">
              Try without account
            </Link>
          </div>
          <p className="text-zinc-500 text-sm mt-4">No credit card. No setup. Just invoices.</p>
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Ready in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {[
              { step: "1", title: "Enter your details", desc: "Add your business name, your client's info, and the work you did." },
              { step: "2", title: "Customise & review", desc: "Set your rate, due date, notes, and tax. Preview updates live." },
              { step: "3", title: "Download the PDF", desc: "One click — a polished, print-ready PDF lands in your downloads." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", color: "white", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}>
                  {step}
                </div>
                <h3 className="text-white font-semibold mb-1">{title}</h3>
                <p className="text-zinc-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
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

        {/* SEO internal links to profession pages */}
        <section className="max-w-6xl mx-auto px-6 py-8 border-t border-white/5">
          <p className="text-center text-zinc-500 text-sm mb-5">Free invoice generators for every freelancer</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { slug: "freelance-designer", label: "Designers", emoji: "🎨" },
              { slug: "photographer", label: "Photographers", emoji: "📷" },
              { slug: "web-developer", label: "Web Developers", emoji: "💻" },
              { slug: "consultant", label: "Consultants", emoji: "📊" },
              { slug: "copywriter", label: "Copywriters", emoji: "✍️" },
              { slug: "videographer", label: "Videographers", emoji: "🎬" },
              { slug: "social-media-manager", label: "Social Media", emoji: "📱" },
              { slug: "virtual-assistant", label: "Virtual Assistants", emoji: "🖥️" },
              { slug: "contractor", label: "Contractors", emoji: "🔨" },
              { slug: "content-creator", label: "Content Creators", emoji: "🎥" },
              { slug: "personal-trainer", label: "Personal Trainers", emoji: "💪" },
              { slug: "musician", label: "Musicians", emoji: "🎵" },
            ].map(({ slug, label, emoji }) => (
              <Link
                key={slug}
                href={`/invoice-generator/${slug}`}
                className="text-xs text-zinc-500 hover:text-orange-400 px-3 py-1.5 rounded-full border border-white/5 hover:border-orange-500/20 transition-all"
              >
                {emoji} {label}
              </Link>
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

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-3">
            {[
              {
                q: "Is it really free — no catch?",
                a: "Yes. The free plan is free forever: 5 invoices/month, 3 saved clients, full PDF download. No credit card needed, no trial countdown.",
              },
              {
                q: "How does this compare to FreshBooks or Wave?",
                a: "Swiftbill does one thing well: invoicing. FreshBooks starts at $15+/month and bundles accounting you probably don't need. Swiftbill Pro is $9/month for unlimited invoices — half the price for what most freelancers actually use.",
              },
              {
                q: "Can my clients view the invoice online?",
                a: "Yes. Every invoice has a shareable public link — your client can view a clean web version without logging in. No PDF attachment required.",
              },
              {
                q: "What happens when I hit 5 invoices on the free plan?",
                a: "You'll see an upgrade prompt. Pro is $9/month — if you're billing clients regularly, one extra invoice more than pays for it.",
              },
              {
                q: "Can I cancel Pro anytime?",
                a: "Yes, instantly from your settings page. No cancellation fees, no \"please stay\" dark patterns.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-white/5 bg-white/[0.02]">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-white font-medium text-sm list-none">
                  {q}
                  <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="px-5 pb-4 text-zinc-400 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-2xl mx-auto px-6 pb-16 text-center">
          <div className="rounded-2xl p-10" style={{ background: "linear-gradient(135deg,rgba(249,115,22,0.1),rgba(249,115,22,0.03))", border: "1px solid rgba(249,115,22,0.2)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg,#fb923c,#f97316)" }}>
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Send your first invoice today.</h2>
            <p className="text-zinc-400 text-sm mb-6">Free forever. No card needed. Takes 60 seconds.</p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl text-white transition-all"
              style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", boxShadow: "0 4px 24px rgba(249,115,22,0.35)" }}
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-zinc-600 text-xs mt-4">Use code LAUNCH50 at checkout for 50% off Pro first month.</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-8 mt-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="text-sm font-semibold text-white">Swiftbill</span>
            </div>
            <p className="text-zinc-500 text-sm">2026 Swiftbill. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/press" className="text-zinc-500 hover:text-white text-sm transition-colors">Press</Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</Link>
              <Link href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
