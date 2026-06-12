#!/usr/bin/env pwsh
# Billed Setup Script — run once to wire up all backend services
# Usage: cd billed && pwsh setup.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Billed — Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor White
Write-Host "  1. Set your env vars in Vercel" -ForegroundColor Gray
Write-Host "  2. Create Stripe products (Pro + Business)" -ForegroundColor Gray
Write-Host "  3. Print your Supabase SQL to run" -ForegroundColor Gray
Write-Host ""
Write-Host "You need 3 things from Supabase and 2 from Stripe." -ForegroundColor Yellow
Write-Host ""

# ── Open Supabase ──────────────────────────────────────────────
Write-Host "Step 1: Supabase credentials" -ForegroundColor Cyan
Write-Host "Opening Supabase dashboard..." -ForegroundColor Gray
Start-Process "https://supabase.com/dashboard"
Write-Host ""
Write-Host "In Supabase:" -ForegroundColor White
Write-Host "  a) Create a new project (free tier, pick closest region)" -ForegroundColor Gray
Write-Host "  b) Wait for it to start (~1 min)" -ForegroundColor Gray
Write-Host "  c) Go to Settings > API" -ForegroundColor Gray
Write-Host "  d) Copy: Project URL, anon key, service_role key" -ForegroundColor Gray
Write-Host ""

$supabaseUrl       = Read-Host "Paste your Supabase Project URL (https://xxx.supabase.co)"
$supabaseAnonKey   = Read-Host "Paste your Supabase anon key"
$supabaseServiceKey = Read-Host "Paste your Supabase service_role key"

# ── Open Stripe ────────────────────────────────────────────────
Write-Host ""
Write-Host "Step 2: Stripe credentials" -ForegroundColor Cyan
Write-Host "Opening Stripe dashboard..." -ForegroundColor Gray
Start-Process "https://dashboard.stripe.com/apikeys"
Write-Host ""
Write-Host "In Stripe:" -ForegroundColor White
Write-Host "  a) Copy your Publishable key (pk_live_ or pk_test_)" -ForegroundColor Gray
Write-Host "  b) Copy your Secret key (sk_live_ or sk_test_)" -ForegroundColor Gray
Write-Host "  (Use test keys for now — switch to live when ready to charge)" -ForegroundColor Gray
Write-Host ""

$stripePublishableKey = Read-Host "Paste your Stripe publishable key"
$stripeSecretKey      = Read-Host "Paste your Stripe secret key"

# ── Create Stripe products ─────────────────────────────────────
Write-Host ""
Write-Host "Creating Stripe products..." -ForegroundColor Cyan

$env:STRIPE_SECRET_KEY = $stripeSecretKey

# Pro plan
$proProductJson = npx --yes stripe products create `
  --name "Billed Pro" `
  --description "Unlimited invoices, clients, and all features" `
  --api-key $stripeSecretKey 2>&1 | Out-String
$proProduct = $proProductJson | ConvertFrom-Json -ErrorAction SilentlyContinue

if ($proProduct -and $proProduct.id) {
    $proPriceJson = npx stripe prices create `
      --unit-amount 900 `
      --currency usd `
      --recurring[interval]=month `
      --product $proProduct.id `
      --api-key $stripeSecretKey 2>&1 | Out-String
    $proPrice = $proPriceJson | ConvertFrom-Json -ErrorAction SilentlyContinue
    $stripeProPriceId = $proPrice?.id
    Write-Host "  Pro plan created: $stripeProPriceId" -ForegroundColor Green
} else {
    Write-Host "  Could not auto-create Pro plan. Enter manually:" -ForegroundColor Yellow
    $stripeProPriceId = Read-Host "Stripe Pro price ID (price_xxx)"
}

# Business plan
$bizProductJson = npx stripe products create `
  --name "Billed Business" `
  --description "Everything in Pro plus multi-business, expense tracking, and tax reports" `
  --api-key $stripeSecretKey 2>&1 | Out-String
$bizProduct = $bizProductJson | ConvertFrom-Json -ErrorAction SilentlyContinue

if ($bizProduct -and $bizProduct.id) {
    $bizPriceJson = npx stripe prices create `
      --unit-amount 1900 `
      --currency usd `
      --recurring[interval]=month `
      --product $bizProduct.id `
      --api-key $stripeSecretKey 2>&1 | Out-String
    $bizPrice = $bizPriceJson | ConvertFrom-Json -ErrorAction SilentlyContinue
    $stripeBusinessPriceId = $bizPrice?.id
    Write-Host "  Business plan created: $stripeBusinessPriceId" -ForegroundColor Green
} else {
    Write-Host "  Could not auto-create Business plan. Enter manually:" -ForegroundColor Yellow
    $stripeBusinessPriceId = Read-Host "Stripe Business price ID (price_xxx)"
}

# ── Create Stripe webhook ──────────────────────────────────────
Write-Host ""
Write-Host "Creating Stripe webhook..." -ForegroundColor Cyan
$webhookJson = npx stripe webhooks create `
  --url "https://billed-alpha.vercel.app/api/stripe/webhook" `
  --events "checkout.session.completed,customer.subscription.deleted" `
  --api-key $stripeSecretKey 2>&1 | Out-String
$webhook = $webhookJson | ConvertFrom-Json -ErrorAction SilentlyContinue
if ($webhook -and $webhook.secret) {
    $stripeWebhookSecret = $webhook.secret
    Write-Host "  Webhook created: $stripeWebhookSecret" -ForegroundColor Green
} else {
    Write-Host "  Could not auto-create webhook. Enter manually:" -ForegroundColor Yellow
    Write-Host "  Go to: https://dashboard.stripe.com/webhooks" -ForegroundColor Gray
    Write-Host "  Endpoint URL: https://billed-alpha.vercel.app/api/stripe/webhook" -ForegroundColor Gray
    Write-Host "  Events: checkout.session.completed, customer.subscription.deleted" -ForegroundColor Gray
    $stripeWebhookSecret = Read-Host "Paste webhook signing secret (whsec_xxx)"
}

# ── Update .env.local ─────────────────────────────────────────
Write-Host ""
Write-Host "Writing .env.local..." -ForegroundColor Cyan
$envContent = @"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishableKey
STRIPE_SECRET_KEY=$stripeSecretKey
STRIPE_WEBHOOK_SECRET=$stripeWebhookSecret
STRIPE_PRO_PRICE_ID=$stripeProPriceId
STRIPE_BUSINESS_PRICE_ID=$stripeBusinessPriceId

# App
NEXT_PUBLIC_APP_URL=https://billed-alpha.vercel.app
"@
Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8
Write-Host "  .env.local updated" -ForegroundColor Green

# ── Set Vercel env vars ────────────────────────────────────────
Write-Host ""
Write-Host "Setting Vercel environment variables..." -ForegroundColor Cyan

$vars = @{
    "NEXT_PUBLIC_SUPABASE_URL"          = $supabaseUrl
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"     = $supabaseAnonKey
    "SUPABASE_SERVICE_ROLE_KEY"         = $supabaseServiceKey
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = $stripePublishableKey
    "STRIPE_SECRET_KEY"                 = $stripeSecretKey
    "STRIPE_WEBHOOK_SECRET"             = $stripeWebhookSecret
    "STRIPE_PRO_PRICE_ID"               = $stripeProPriceId
    "STRIPE_BUSINESS_PRICE_ID"          = $stripeBusinessPriceId
    "NEXT_PUBLIC_APP_URL"               = "https://billed-alpha.vercel.app"
}

foreach ($key in $vars.Keys) {
    $val = $vars[$key]
    if ($val) {
        echo $val | vercel env add $key production --force 2>&1 | Out-Null
        Write-Host "  $key set" -ForegroundColor Green
    }
}

# ── Print SQL ─────────────────────────────────────────────────
Write-Host ""
Write-Host "Step 3: Run the database schema" -ForegroundColor Cyan
Write-Host "Opening Supabase SQL editor..." -ForegroundColor Gray
$projectRef = ($supabaseUrl -replace "https://", "" -replace ".supabase.co", "")
Start-Process "https://supabase.com/dashboard/project/$projectRef/sql/new"
Write-Host ""
Write-Host "  Paste and run the contents of lib/supabase/schema.sql" -ForegroundColor Yellow
Write-Host "  (Opening the file for you...)" -ForegroundColor Gray
Start-Process "notepad.exe" -ArgumentList (Resolve-Path "lib/supabase/schema.sql")

# ── Trigger redeploy ──────────────────────────────────────────
Write-Host ""
Write-Host "Deploying to production with new env vars..." -ForegroundColor Cyan
vercel --prod --yes 2>&1 | Select-String -Pattern "(Ready|Error|Building)"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is live at:" -ForegroundColor White
Write-Host "  https://billed-alpha.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Last step: Run the schema.sql in Supabase SQL editor (opened above)" -ForegroundColor Yellow
Write-Host ""
