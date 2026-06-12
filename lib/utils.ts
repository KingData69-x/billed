import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function generateInvoiceNumber(count: number) {
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export const PLAN_LIMITS = {
  free: { invoices: 5, clients: 3 },
  pro: { invoices: Infinity, clients: Infinity },
  business: { invoices: Infinity, clients: Infinity },
};
