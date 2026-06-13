import Link from "next/link";
import { Zap, Download, ArrowRight, FileText, Users, DollarSign } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press & Media | Swiftbill",
  description: "Press kit, brand assets, and company information for journalists and bloggers covering Swiftbill.",
};

export default function PressPage() {
  const stats = [
    { label: "Founded", value: "2026" },
    { label: "Pricing", value: "Free — $19/mo" },
    { label: "Platform", value: "Web (all devices)" },
    { label: "Headquarters", value: "Remote" },
  ];

  const highlights = [
    { icon: FileText, text: "Professional PDF invoices in under 60 seconds" },
    { icon: Users, text: "Built for freelancers, contractors, and small businesses" },
    { icon: DollarSign, text: "Free forever plan — no credit card required" },
    { icon: Zap, text: "No installs, no apps — works entirely in the browser" },
  ];

  return (
    <div className="min-h-screen bg-[#08080f]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-white">Swiftbill</span>
        </Link>
        <Link href="/signup" className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors">
          Get started free
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Press & Media</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Brand Kit & Press Resources</h1>
        <p className="text-zinc-400 text-lg max-w-2xl mb-16">
          Everything you need to write about Swiftbill. No need to email us first — use any of these assets freely in editorial coverage.
        </p>

        {/* About */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-white mb-4">About Swiftbill</h2>
          <div
            className="rounded-xl p-6 relative"
            style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-zinc-300 leading-relaxed text-sm">
              Swiftbill is a free, browser-based invoice generator built for the modern freelancer. It lets anyone create a professional, branded PDF invoice in under 60 seconds — no account required for a demo, no credit card required to sign up. Swiftbill handles client management, payment tracking, and PDF export all in one place, starting completely free.
            </p>
            <p className="text-zinc-300 leading-relaxed text-sm mt-3">
              The product was built to solve a real problem: most invoicing tools are either too expensive, too complicated, or require month-long trials before you can use them. Swiftbill strips everything back to what freelancers actually need.
            </p>
          </div>
        </section>

        {/* Key stats */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-white mb-4">Key Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-4 text-center"
                style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-white font-bold text-lg">{value}</p>
                <p className="text-zinc-500 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product highlights */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-white mb-4">Product Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Logo & colours */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-white mb-4">Logo & Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo preview */}
            <div
              className="rounded-xl p-8 flex items-center justify-center gap-4"
              style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}
                >
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-2xl font-bold text-white">Swiftbill</span>
              </div>
            </div>
            {/* On white */}
            <div
              className="rounded-xl p-8 flex items-center justify-center gap-4"
              style={{ background: "#fff" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)" }}
                >
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Swiftbill</span>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="mt-4 flex gap-3 flex-wrap">
            {[
              { name: "Brand Orange", hex: "#F97316", bg: "#f97316" },
              { name: "Dark Background", hex: "#08080F", bg: "#08080f" },
              { name: "Light Orange", hex: "#FB923C", bg: "#fb923c" },
              { name: "Card Background", hex: "#0B0B14", bg: "#0b0b14" },
            ].map(({ name, hex, bg }) => (
              <div key={hex} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-5 h-5 rounded-md border border-white/10" style={{ background: bg }} />
                <div>
                  <p className="text-white text-xs font-semibold">{name}</p>
                  <p className="text-zinc-500 text-xs font-mono">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Boilerplate */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-white mb-4">Approved boilerplate copy</h2>
          <div
            className="rounded-xl p-6"
            style={{ background: "#0b0b14", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Short (1 sentence)</p>
            <p className="text-zinc-300 text-sm italic mb-6">
              "Swiftbill is a free web-based invoice generator that lets freelancers create professional PDF invoices in under 60 seconds."
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Medium (2–3 sentences)</p>
            <p className="text-zinc-300 text-sm italic">
              "Swiftbill is a free invoice generator for freelancers, contractors, and small businesses. It lets anyone create a polished, branded PDF invoice in under 60 seconds — no credit card and no account required to try. Swiftbill offers a free plan with 5 invoices per month, and Pro and Business plans for users who need more."
            </p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Press contact</h2>
          <div
            className="rounded-xl p-6 flex items-center justify-between flex-wrap gap-4"
            style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.03))", border: "1px solid rgba(249,115,22,0.18)" }}
          >
            <div>
              <p className="text-white font-semibold">Media inquiries</p>
              <p className="text-zinc-400 text-sm mt-0.5">For interviews, features, and editorial questions</p>
              <p className="text-orange-400 text-sm mt-2 font-medium">press@billed-alpha.vercel.app</p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)", color: "#fb923c" }}
            >
              Try Swiftbill free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-zinc-600 text-sm">2026 Swiftbill</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</Link>
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
