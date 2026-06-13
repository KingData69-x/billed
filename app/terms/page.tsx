import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Swiftbill",
  description: "Terms and conditions for using the Swiftbill invoice generator.",
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: June 2026</p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of terms</h2>
            <p>By accessing or using Swiftbill ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of service</h2>
            <p>Swiftbill is a web-based invoice generator that allows freelancers and businesses to create, manage, and download professional invoices as PDFs. The Service is provided as-is, with a free tier and paid subscription options.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account registration</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your password and for all activity that occurs under your account. Notify us immediately of any unauthorised access.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Acceptable use</h2>
            <p>You agree not to use Swiftbill to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Create fraudulent or deceptive invoices</li>
              <li>Violate any applicable law or regulation</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the Service</li>
              <li>Use the Service to send spam or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Free and paid plans</h2>
            <p>The free plan includes up to 5 invoices per month and 3 saved clients. Paid plans (Pro at $9/month, Business at $19/month) are billed monthly via Stripe. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your content</h2>
            <p>You retain all rights to the invoice data you create. By using the Service, you grant us a limited licence to store and process your data solely for the purpose of providing the Service. We will not use your invoice content for any other purpose.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Public invoice links</h2>
            <p>When you generate a public share link for an invoice, you acknowledge that anyone with the link can view that invoice. You are solely responsible for deciding which invoices to share publicly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Disclaimer of warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or secure. Invoice calculations are provided for convenience; you are responsible for verifying accuracy before sending to clients.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Swiftbill shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to lost revenue or data loss.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms at our sole discretion. You may delete your account at any time from the Settings page.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to terms</h2>
            <p>We may update these Terms at any time. We will notify you of material changes via email. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact</h2>
            <p>Questions about these Terms? Email <span className="text-orange-400">legal@swiftbill.dev</span></p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-zinc-600 text-sm">2026 Swiftbill</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors">Privacy</Link>
            <Link href="/" className="text-zinc-500 hover:text-white text-sm transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
