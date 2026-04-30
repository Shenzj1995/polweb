# Vercel Deployment Checklist

Use this checklist before connecting the GitHub repository to Vercel production.

## 1. Repository

- [ ] GitHub repository is up to date: `https://github.com/Shenzj1995/polweb`
- [ ] `.env.local`, `.next`, `node_modules`, `.idea`, and `*.tsbuildinfo` are ignored.
- [ ] Production branch is `main`.
- [ ] Local verification passes:
  - [ ] `npm run lint`
  - [ ] `npm run build`

## 2. Vercel Project Settings

- [ ] Import the GitHub repository into Vercel.
- [ ] Framework preset: Next.js.
- [ ] Build command: `npm run build`.
- [ ] Install command: `npm install`.
- [ ] Output directory: keep Vercel default.
- [ ] Root directory: repository root.

If Vercel warns about multiple lockfiles, keep only the project lockfile or set the project root to this repository.

## 3. Required Environment Variables

Copy values from `.env.example` into Vercel Project Settings -> Environment Variables.

### App

- [ ] `NEXT_PUBLIC_BASE_URL`
- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL`
- [ ] `CRON_SECRET`

Production example:

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="AI Studio"
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
CRON_SECRET=replace-with-a-random-long-string
```

### Supabase

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `DATABASE_URL`

After setting `DATABASE_URL`, run locally or in CI:

```bash
npx prisma db push
```

### Stripe

- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_STARTER_MONTHLY_PRICE_ID`
- [ ] `STRIPE_STARTER_ANNUAL_PRICE_ID`
- [ ] `STRIPE_PRO_MONTHLY_PRICE_ID`
- [ ] `STRIPE_PRO_ANNUAL_PRICE_ID`

Stripe webhook endpoint:

```text
https://yourdomain.com/api/webhooks/stripe
```

Events:

- [ ] `checkout.session.completed`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_failed`

### AI Providers

- [ ] `REPLICATE_API_TOKEN`
- [ ] `REPLICATE_WEBHOOK_SECRET`
- [ ] `FAL_KEY`

Webhook endpoints:

```text
https://yourdomain.com/api/webhooks/replicate
https://yourdomain.com/api/webhooks/fal
```

### Cloudflare R2

- [ ] `R2_ACCESS_KEY_ID`
- [ ] `R2_SECRET_ACCESS_KEY`
- [ ] `R2_BUCKET_NAME`
- [ ] `R2_ENDPOINT`
- [ ] `R2_PUBLIC_URL` if you use a CDN/custom domain

Keep the bucket private. The app returns signed download URLs for user assets.

## 4. Auth Redirects

### Supabase

Authentication -> URL Configuration:

- [ ] Site URL: `https://yourdomain.com`
- [ ] Redirect URL: `https://yourdomain.com/auth/callback`
- [ ] Redirect URL for local testing: `http://127.0.0.1:3000/auth/callback`
- [ ] Redirect URL for local testing: `http://localhost:3000/auth/callback`

### Google OAuth

Google Cloud Console -> OAuth Client -> Authorized redirect URIs:

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

Do not put `/auth/callback` from this app in Google Cloud. Google redirects to Supabase first, then Supabase redirects back to this app.

## 5. Cron

Vercel Cron endpoint:

```text
https://yourdomain.com/api/cron/process-generations
```

If you call it manually, include:

```text
Authorization: Bearer <CRON_SECRET>
```

## 6. Legal Pages

Make sure these are reachable before payment review and OAuth review:

- [ ] `/privacy`
- [ ] `/terms`
- [ ] `/refund`

Update the support email and company/operator details before production launch.

## 7. Smoke Test

Run this production test after deployment:

- [ ] Home page loads.
- [ ] Google login works.
- [ ] New user receives 20 credits.
- [ ] Generate request creates a task and deducts credits.
- [ ] Provider webhook updates the generation.
- [ ] R2 upload succeeds.
- [ ] Result download URL works.
- [ ] Stripe Checkout opens.
- [ ] Stripe webhook grants subscription credits once.
- [ ] Failed generation refunds credits once.
