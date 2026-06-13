$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Billed -- Backend Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need 3 values from Supabase and 2 from Stripe." -ForegroundColor Yellow
Write-Host ""

# Open Supabase
Write-Host "--- Step 1: Supabase ---" -ForegroundColor Cyan
Write-Host "Opening Supabase dashboard in your browser..."
Start-Process "https://supabase.com/dashboard"
Write-Host ""
Write-Host "In Supabase: Create a project, wait for it to start,"
Write-Host "then go to Settings > API and copy the 3 values below."
Write-Host ""

$supabaseUrl        = Read-Host "Supabase Project URL (https://xxx.supabase.co)"
$supabaseAnonKey    = Read-Host "Supabase anon public key"
$supabaseServiceKey = Read-Host "Supabase service_role secret key"

# Open Stripe
Write-Host ""
Write-Host "--- Step 2: Stripe ---" -ForegroundColor Cyan
Write-Host "Opening Stripe API keys page..."
Start-Process "https://dashboard.stripe.com/apikeys"
Write-Host ""
Write-Host "Copy your Publishable key and Secret key."
Write-Host "Use test keys for now."
Write-Host ""

$stripePublishable = Read-Host "Stripe publishable key"
$stripeSecret      = Read-Host "Stripe secret key"

# Create Stripe products via API
Write-Host ""
Write-Host "Creating Stripe products..." -ForegroundColor Cyan

$headers = @{ Authorization = "Bearer $stripeSecret" }

try {
    $proProduct = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" `
        -Method Post -Headers $headers `
        -Body "name=Billed+Pro&description=Unlimited+invoices+and+clients"
    $proPrice = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
        -Method Post -Headers $headers `
        -Body "unit_amount=900&currency=usd&recurring[interval]=month&product=$($proProduct.id)"
    $stripeProPriceId = $proPrice.id
    Write-Host "  Pro plan: $stripeProPriceId" -ForegroundColor Green
} catch {
    Write-Host "  Could not auto-create Pro plan: $_" -ForegroundColor Yellow
    $stripeProPriceId = Read-Host "Enter Pro price ID manually (price_xxx)"
}

try {
    $bizProduct = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products" `
        -Method Post -Headers $headers `
        -Body "name=Billed+Business&description=Everything+in+Pro+plus+expense+tracking+and+tax+reports"
    $bizPrice = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
        -Method Post -Headers $headers `
        -Body "unit_amount=1900&currency=usd&recurring[interval]=month&product=$($bizProduct.id)"
    $stripeBusinessPriceId = $bizPrice.id
    Write-Host "  Business plan: $stripeBusinessPriceId" -ForegroundColor Green
} catch {
    Write-Host "  Could not auto-create Business plan: $_" -ForegroundColor Yellow
    $stripeBusinessPriceId = Read-Host "Enter Business price ID manually (price_xxx)"
}

# Create Stripe webhook
try {
    $webhook = Invoke-RestMethod -Uri "https://api.stripe.com/v1/webhook_endpoints" `
        -Method Post -Headers $headers `
        -Body "url=https://swiftbill.dev/api/stripe/webhook&enabled_events[]=checkout.session.completed&enabled_events[]=customer.subscription.deleted"
    $stripeWebhookSecret = $webhook.secret
    Write-Host "  Webhook: created" -ForegroundColor Green
} catch {
    Write-Host "  Could not auto-create webhook: $_" -ForegroundColor Yellow
    Write-Host "  Go to https://dashboard.stripe.com/webhooks and add:"
    Write-Host "    URL: https://swiftbill.dev/api/stripe/webhook"
    Write-Host "    Events: checkout.session.completed, customer.subscription.deleted"
    $stripeWebhookSecret = Read-Host "Enter webhook signing secret (whsec_xxx)"
}

# Write .env.local
Write-Host ""
Write-Host "Writing .env.local..." -ForegroundColor Cyan
$env_content = "NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl`nNEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey`nSUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKey`nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishable`nSTRIPE_SECRET_KEY=$stripeSecret`nSTRIPE_WEBHOOK_SECRET=$stripeWebhookSecret`nSTRIPE_PRO_PRICE_ID=$stripeProPriceId`nSTRIPE_BUSINESS_PRICE_ID=$stripeBusinessPriceId`nNEXT_PUBLIC_APP_URL=https://swiftbill.dev"
[System.IO.File]::WriteAllText((Join-Path (Get-Location) ".env.local"), $env_content, [System.Text.Encoding]::UTF8)
Write-Host "  .env.local written" -ForegroundColor Green

# Set Vercel env vars
Write-Host ""
Write-Host "Setting Vercel environment variables..." -ForegroundColor Cyan

$vars = @{
    "NEXT_PUBLIC_SUPABASE_URL"           = $supabaseUrl
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"      = $supabaseAnonKey
    "SUPABASE_SERVICE_ROLE_KEY"          = $supabaseServiceKey
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = $stripePublishable
    "STRIPE_SECRET_KEY"                  = $stripeSecret
    "STRIPE_WEBHOOK_SECRET"              = $stripeWebhookSecret
    "STRIPE_PRO_PRICE_ID"                = $stripeProPriceId
    "STRIPE_BUSINESS_PRICE_ID"           = $stripeBusinessPriceId
    "NEXT_PUBLIC_APP_URL"                = "https://swiftbill.dev"
}

foreach ($key in $vars.Keys) {
    $val = $vars[$key]
    if ($val) {
        $val | vercel env add $key production --force 2>&1 | Out-Null
        Write-Host "  $key" -ForegroundColor Green
    }
}

# Redeploy
Write-Host ""
Write-Host "Deploying to production..." -ForegroundColor Cyan
vercel --prod --yes 2>&1 | Select-String "(Ready|Error|Deployed)"

# Open Supabase SQL editor
$projectRef = $supabaseUrl -replace "https://", "" -replace ".supabase.co", ""
Write-Host ""
Write-Host "--- Step 3: Database schema ---" -ForegroundColor Cyan
Write-Host "Opening Supabase SQL editor..."
Start-Process "https://supabase.com/dashboard/project/$projectRef/sql/new"
Write-Host ""
Write-Host "Copy and paste the contents of lib\supabase\schema.sql into the editor and click Run." -ForegroundColor Yellow
Start-Process "notepad.exe" -ArgumentList "lib\supabase\schema.sql"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Done!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Live at: https://swiftbill.dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Last step: run the schema.sql in the Supabase SQL editor (just opened)." -ForegroundColor Yellow
Write-Host ""
