import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import type { Client, Profile } from "@/lib/types";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: clients }, { data: profile }] = await Promise.all([
    supabase.from("clients").select("*").eq("user_id", user!.id).order("name"),
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Invoice</h1>
        <p className="text-zinc-400 text-sm mt-0.5">Fill in the details below to create your invoice</p>
      </div>
      <InvoiceForm profile={profile as Profile} clients={(clients ?? []) as Client[]} />
    </div>
  );
}
