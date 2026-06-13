import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if a token already exists
  const { data: existing } = await supabase
    .from("invoices")
    .select("public_token")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.public_token) {
    return NextResponse.json({ token: existing.public_token });
  }

  // Generate a new UUID token
  const token = crypto.randomUUID();
  await supabase.from("invoices").update({ public_token: token }).eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ token });
}
