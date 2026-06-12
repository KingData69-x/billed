import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
    });
  }
  return _stripe;
}

export const PLANS = {
  pro: {
    name: "Pro",
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "Unlimited invoices",
      "Unlimited clients",
      "All templates",
      "Recurring invoices",
      "Payment tracking",
      "Custom branding",
    ],
  },
  business: {
    name: "Business",
    price: 19,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    features: [
      "Everything in Pro",
      "Multiple businesses",
      "Client portal",
      "Expense tracking",
      "Tax reports",
      "Priority support",
    ],
  },
};
