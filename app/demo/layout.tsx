import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08080f]">
      <header className="border-b border-white/[0.05] sticky top-0 z-20 bg-[#08080f]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-white">Billed</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-orange-400">Demo Mode</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded-lg transition-colors">
              Sign up free
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
