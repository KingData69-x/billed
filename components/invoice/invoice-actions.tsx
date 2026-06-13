"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Send, Trash2 } from "lucide-react";
import type { Invoice, Profile, InvoiceStatus } from "@/lib/types";

interface InvoiceActionsProps {
  invoice: Invoice;
  profile: Profile;
}

export function InvoiceActions({ invoice, profile }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  async function updateStatus(status: InvoiceStatus) {
    setLoading(status);
    const supabase = createClient();
    await supabase.from("invoices").update({ status }).eq("id", invoice.id);
    router.refresh();
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setLoading("delete");
    const supabase = createClient();
    await supabase.from("invoices").delete().eq("id", invoice.id);
    router.push("/invoices");
  }

  async function handleDownload() {
    setLoading("pdf");
    try {
      const { generateInvoicePDF } = await import("@/lib/pdf");
      const pdfBytes = await generateInvoicePDF(invoice, profile);
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setShowSharePrompt(true);
      setTimeout(() => setShowSharePrompt(false), 10000);
    } finally {
      setLoading(null);
    }
  }

  function handleTweet() {
    const text = encodeURIComponent("Just created a professional invoice in under 60 seconds with @swiftbill — it's completely free 🔥");
    const url = encodeURIComponent("https://swiftbill.dev");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    setShowSharePrompt(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {showSharePrompt && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm animate-fade-in"
          style={{ background: "rgba(29,161,242,0.12)", border: "1px solid rgba(29,161,242,0.25)" }}
        >
          <span className="text-zinc-300">Invoice downloaded! Share Swiftbill?</span>
          <button
            onClick={handleTweet}
            className="flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg text-xs transition-all"
            style={{ background: "rgba(29,161,242,0.2)", color: "#1da1f2", border: "1px solid rgba(29,161,242,0.3)" }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 12, height: 12 }} fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Tweet
          </button>
          <button onClick={() => setShowSharePrompt(false)} className="text-zinc-600 hover:text-zinc-400 text-xs">✕</button>
        </div>
      )}
      <div className="flex items-center gap-2">
      <Button onClick={handleDownload} loading={loading === "pdf"} variant="secondary" size="sm">
        <Download className="w-3.5 h-3.5" /> PDF
      </Button>
      {invoice.status === "draft" && (
        <Button onClick={() => updateStatus("sent")} loading={loading === "sent"} variant="secondary" size="sm">
          <Send className="w-3.5 h-3.5" /> Mark Sent
        </Button>
      )}
      {invoice.status !== "paid" && (
        <Button onClick={() => updateStatus("paid")} loading={loading === "paid"} size="sm">
          <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
        </Button>
      )}
      <Button onClick={handleDelete} loading={loading === "delete"} variant="danger" size="sm">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  </div>
  );
}
