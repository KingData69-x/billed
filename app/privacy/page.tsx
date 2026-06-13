import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Swiftbill",
  description: "How Swiftbill collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: June 2026</p>

        <div className="prose prose-invert max-w-none space-y-10 text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information we collect</h2>
            <p>When you create an account, we collect your name, email address, and password. When you use Swiftbill to create invoices, we store the invoice data you enter — including client names, addresses, and invoice amounts. We do not collect payment card numbers; payments are handled by Stripe.</p>
            <p className="mt-3">We automatically collect limited technical information such as your IP address (hashed for privacy), browser type, and pages visited to improve the service and prevent abuse.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the Swiftbill service</li>
              <li>To process subscription payments via Stripe</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To improve the product through aggregated, anonymised analytics</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data storage and security</h2>
            <p>Your data is stored on Supabase (PostgreSQL), hosted on AWS infrastructure in the United States. We use row-level security to ensure you can only access your own data. All data is transmitted over HTTPS/TLS.</p>
            <p className="mt-3">Demo usage is tracked using a one-way SHA-256 hash of your IP address. The raw IP address is never stored.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Public invoice links</h2>
            <p>If you choose to generate a shareable link for an invoice, that invoice becomes accessible to anyone who has the link. We use randomly generated tokens (UUIDs) that are not guessable. You can choose not to share the link to keep invoices private.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Third-party services</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-white">Supabase</strong> — authentication and database</li>
              <li><strong className="text-white">Stripe</strong> — payment processing for Pro and Business plans</li>
              <li><strong className="text-white">Vercel</strong> — hosting and edge delivery</li>
            </ul>
            <p className="mt-3">Each of these providers has their own privacy policy and data processing terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your rights</h2>
            <p>You may request deletion of your account and all associated data at any time by emailing us. Upon verified request, we will delete your profile, invoices, and client data within 30 days. Some data may be retained for legal or fraud-prevention purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>Swiftbill uses only essential cookies required for authentication (session tokens). We do not use advertising cookies or third-party tracking pixels.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Children</h2>
            <p>Swiftbill is not directed to children under 13. We do not knowingly collect data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to this policy</h2>
            <p>We may update this policy occasionally. We will notify you of significant changes by email or by a notice in the app. Your continued use after changes take effect constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact</h2>
            <p>Questions about this policy? Reach us at <span className="text-orange-400">privacy@billed-alpha.vercel.app</span> or through the in-app settings page.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-zinc-600 text-sm">2026 Swiftbill</span>
          <div className="flex gap-6">
            <Link href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors">Terms</Link>
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
