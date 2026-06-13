"use client";
import { useState } from "react";
import { Link2, Check, Loader2 } from "lucide-react";

interface ShareButtonProps {
  invoiceId: string;
  existingToken: string | null;
}

export function ShareButton({ invoiceId, existingToken }: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "copied">("idle");

  async function handleShare() {
    setState("loading");
    let token = existingToken;

    if (!token) {
      const res = await fetch(`/api/invoices/${invoiceId}/share`, { method: "POST" });
      const json = await res.json();
      token = json.token;
    }

    const url = `${window.location.origin}/view/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      prompt("Copy this link:", url);
    }
    setState("copied");
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === "loading"}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
      style={{
        background: state === "copied" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
        border: state === "copied" ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.1)",
        color: state === "copied" ? "#10b981" : "rgba(255,255,255,0.7)",
      }}
    >
      {state === "loading" && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
      {state === "copied" && <Check style={{ width: 14, height: 14 }} />}
      {state === "idle" && <Link2 style={{ width: 14, height: 14 }} />}
      {state === "copied" ? "Link copied!" : state === "loading" ? "Generating…" : "Share link"}
    </button>
  );
}
