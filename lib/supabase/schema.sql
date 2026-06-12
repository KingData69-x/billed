-- Run this in your Supabase SQL editor at https://supabase.com

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  business_name text,
  business_address text,
  business_phone text,
  business_email text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  stripe_customer_id text unique,
  invoice_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Clients table
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  address text,
  phone text,
  company text,
  created_at timestamptz not null default now()
);

-- Invoices table
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  issue_date date not null default current_date,
  due_date date not null,
  items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  currency text not null default 'USD',
  client_name text not null,
  client_email text,
  client_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can manage own clients" on public.clients for all using (auth.uid() = user_id);
create policy "Users can manage own invoices" on public.invoices for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on invoices
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_invoice_updated
  before update on public.invoices
  for each row execute procedure public.handle_updated_at();
