import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-bold text-white">Swiftbill</span>
      </Link>
      {children}
    </div>
  );
}
