import Link from "next/link";
import { Zap, ArrowRight, FileText, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="w-14 h-14 bg-orange-500/15 rounded-2xl flex items-center justify-center mb-8 border border-orange-500/20">
        <Zap className="w-7 h-7 text-orange-400" />
      </div>

      {/* 404 */}
      <p className="text-8xl font-black text-white/5 leading-none select-none mb-0">404</p>
      <h1 className="text-2xl font-bold text-white mt-2 mb-3">Page not found</h1>
      <p className="text-zinc-400 text-sm max-w-sm mb-10">
        This page doesn&apos;t exist or was moved. Head back home or create your first invoice — it&apos;s free.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,#fb923c,#f97316)", color: "white", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}
        >
          <FileText className="w-4 h-4" />
          Create a free invoice
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
