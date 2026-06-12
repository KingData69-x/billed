import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json() as { plan: "pro" | "business" };
  const planConfig = PLANS[plan];
  if (!planConfig) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: profile?.stripe_customer_id || undefined,
    customer_email: !profile?.stripe_customer_id ? user.email : undefined,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { user_id: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
