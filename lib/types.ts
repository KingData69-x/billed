export type Plan = "free" | "pro" | "business";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  invoice_count: number;
  payment_bank_name: string | null;
  payment_bank_account: string | null;
  payment_bank_routing: string | null;
  payment_paypal: string | null;
  payment_venmo: string | null;
  payment_cashapp: string | null;
  payment_other: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  currency: string;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  public_token: string | null;
  created_at: string;
  updated_at: string;
}
