"use server";
import { headers } from "next/headers";
import { createAnonClient } from "@/lib/supabase/anon";

async function hashIP(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function claimDemoUsage(): Promise<{ ok: boolean }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "::1";
  const ipHash = await hashIP(ip);

  const supabase = createAnonClient();
  const { error } = await supabase.from("demo_usage").insert({ ip_hash: ipHash });

  // Unique constraint violation = already used
  return { ok: !error };
}
