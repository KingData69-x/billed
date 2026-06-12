import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import type { Client, Profile } from "@/lib/types";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ data: clients }, { data: profile }, { count: monthlyCount }] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", user!.id).order("name"),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("invoices").select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", monthStart.toISOString()),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Invoice</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Fill in the details below to create your invoice</p>
      </div>
      <InvoiceForm
        profile={profile as Profile}
        clients={(clients ?? []) as Client[]}
        monthlyCount={monthlyCount ?? 0}
      />
    </div>
  );
}
