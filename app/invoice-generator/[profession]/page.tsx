import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PROFESSIONS } from "@/lib/professions";
import {
  Zap, FileText, Download, Users, CheckCircle, ArrowRight, Star, Clock, Shield,
} from "lucide-react";

export async function generateStaticParams() {
  return PROFESSIONS.map((p) => ({ profession: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/invoice-generator/[profession]">
): Promise<Metadata> {
  const { profession } = await props.params;
  const p = PROFESSIONS.find((x) => x.slug === profession);
  if (!p) return { title: "Free Invoice Generator | Swiftbill" };

  const title = `Free Invoice Generator for ${p.label} | Swiftbill`;
  const description = `Create professional invoices for ${p.verb} in under 60 seconds. Free PDF download, no signup required. The #1 free invoicing tool for ${p.singular}s.`;

  return {
    title,
    description,
    keywords: `invoice generator for ${p.singular}s, free ${p.singular} invoice, ${p.singular} invoice template, how to invoice as a ${p.singular}`,
    openGraph: { title, description, type: "website", url: `https://swiftbill.dev/invoice-generator/${profession}` },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `https://swiftbill.dev/invoice-generator/${profession}` },
  };
}

export default async function ProfessionPage(props: PageProps<"/invoice-generator/[profession]">) {
  const { profession } = await props.params;
  const p = PROFESSIONS.find((x) => x.slug === profession);
  if (!p) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Swiftbill",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: `Free invoice generator for ${p.label.toLowerCase()}. Create professional invoices in seconds.`,
    url: `https://swiftbill.dev/invoice-generator/${profession}`,
  };

  const features = [
    { icon: FileText, title: `Professional ${p.singular} invoices`, desc: `Beautifully designed invoice templates built for ${p.label.toLowerCase()}. Impress your clients and get paid faster.` },
    { icon: Download, title: "Instant PDF download", desc: `Download a print-ready PDF the moment you're done. Email it directly to your client or print it out.` },
    { icon: Users, title: "Client management", desc: `Save client details once and pre-fill future invoices in seconds. Perfect for repeat ${p.singular} clients.` },
    { icon: Clock, title: "Payment tracking", desc: `Mark invoices as sent, paid, or overdue. Always know which ${p.verb} you've been paid for.` },
    { icon: Shield, title: "Secure & private", desc: "Your invoice data is encrypted and only accessible to you. No one else can see your client information." },
  ];

  const faqs = [
    {
      q: `How do I create an invoice as a ${p.singular}?`,
      a: `With Swiftbill, creating a ${p.singular} invoice takes under 60 seconds. Sign up free, enter your business details and your client's info, add your ${p.verb}, and download the PDF. No invoice experience needed.`,
    },
    {
      q: `Is Swiftbill really free for ${p.label.toLowerCase()}?`,
      a: `Yes. The free plan gives you 5 invoices per month, which is enough for most ${p.label.toLowerCase()} starting out. If you need unlimited invoices, the Pro plan is $9/month.`,
    },
    {
      q: `What should a ${p.singular} put on an invoice?`,
      a: `A professional ${p.singular} invoice should include your business name and contact info, the client's name and address, a unique invoice number, the date and due date, an itemised list of ${p.verb} with rates, and the total amount due.`,
    },
    {
      q: `Can I invoice clients without creating an account?`,
      a: `Yes — try the demo to generate a sample invoice PDF instantly without signing up. Create an account for free to save invoices, track payments, and manage multiple clients.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#08080f]">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white">Swiftbill</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">Sign in</Link>
            <Link href="/signup" className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors">
              Get started free
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-400 mb-8">
            <span>{p.emoji}</span>
            Built for {p.label}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Free invoice generator<br />
            for <span className="text-orange-500">{p.label.toLowerCase()}</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Create professional invoices for {p.verb} in under 60 seconds.
            Download as PDF, track payments, and get paid faster — completely free.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-orange-500/25"
            >
              Create your first invoice free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl text-base transition-all"
            >
              Try demo first
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {["Free forever", "No credit card", "PDF in 60 seconds", "No design skills needed"].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-sm text-zinc-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            Everything a {p.singular} needs to invoice clients
          </h2>
          <p className="text-center text-zinc-400 mb-12">
            Stop using spreadsheets or Word docs. Swiftbill makes invoicing effortless.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.slice(0, 3).map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition-all">
                <div className="w-10 h-10 bg-orange-500/15 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 max-w-3xl mx-auto">
            {features.slice(3).map(({ icon: Icon, title, desc }) => (
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

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {p.label} invoicing — frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{q}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other professions — internal linking */}
        <section className="max-w-6xl mx-auto px-6 py-12 border-t border-white/5">
          <p className="text-center text-zinc-500 text-sm mb-6">Free invoice generators for other freelancers</p>
          <div className="flex flex-wrap justify-center gap-2">
            {PROFESSIONS.filter((x) => x.slug !== p.slug).slice(0, 18).map((x) => (
              <Link
                key={x.slug}
                href={`/invoice-generator/${x.slug}`}
                className="text-xs text-zinc-500 hover:text-orange-400 px-3 py-1.5 rounded-full border border-white/5 hover:border-orange-500/20 transition-all"
              >
                {x.emoji} {x.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />)}
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Start invoicing clients today — it&apos;s free
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of {p.label.toLowerCase()} who use Swiftbill to look professional and get paid on time.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-10 py-4 rounded-xl text-base transition-all shadow-lg shadow-orange-500/25"
          >
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-zinc-600 text-sm mt-4">No credit card. No setup. Just invoices.</p>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white fill-white" />
              </div>
              <span className="text-sm font-semibold text-white">Swiftbill</span>
            </div>
            <p className="text-zinc-500 text-sm">2026 Swiftbill. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">Home</Link>
              <Link href="/signup" className="text-zinc-500 hover:text-white text-sm transition-colors">Sign up free</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
