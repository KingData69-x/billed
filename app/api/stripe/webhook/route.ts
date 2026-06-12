import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient as createServerClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;
    if (userId && plan) {
      await supabase.from("profiles").update({
        plan,
        stripe_customer_id: session.customer as string,
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", sub.customer as string)
      .single();
    if (profile) {
      await supabase.from("profiles").update({ plan: "free" }).eq("id", profile.id);
    }
  }

  return NextResponse.json({ received: true });
}
