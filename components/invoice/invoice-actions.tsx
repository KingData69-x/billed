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
    } finally {
      setLoading(null);
    }
  }

  return (
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
  );
}
