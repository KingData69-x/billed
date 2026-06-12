import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

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
