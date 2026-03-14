# PestPros Trainer - Quick Start Guide

## 5-Minute Setup

### Step 1: Clone the Repository
```bash
git clone <your-github-url>
cd pestpros-sales-trainer
npm install
```

### Step 2: Create Supabase Project
1. Go to https://supabase.com and create a free account
2. Create a new project (takes ~2 minutes)
3. Go to SQL Editor and run the schema from `docs/supabase-schema.sql`

### Step 3: Get Your Supabase Keys
- Project Settings → API
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Set Up OpenAI
1. Go to https://platform.openai.com/api/keys
2. Create a new API key
3. Copy it → `OPENAI_API_KEY`

### Step 5: Create .env.local
```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### Step 6: Run Locally
```bash
npm run dev
```
Open http://localhost:3000

## Deploying to Vercel

### Option A: Via GitHub (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/import
3. Select your GitHub repo
4. Add environment variables from `.env.local`
5. Click Deploy

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel deploy
```

## Setting Up Stripe (Optional for Testing)

### Development Mode
1. Go to https://stripe.com/docs/stripe-js/elements/payment-element
2. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
3. Get test keys from Dashboard → Developers → API Keys

### Production Mode
1. Create live Stripe account
2. Go to Settings → API Keys
3. Copy live secret and public keys
4. Set up webhook at Settings → Webhooks
   - Endpoint URL: `https://your-vercel-app.vercel.app/api/stripe-webhook`
   - Events: `customer.subscription.created`, `.updated`, `.deleted`
5. Copy webhook signing secret

## File Structure Overview

```
📦 PestPros Trainer
├── 📁 app/               → All pages & API routes
│   ├── page.tsx          → Login/signup
│   ├── dashboard/        → Main dashboard
│   ├── practice/         → Training sessions
│   ├── leaderboard/      → Team rankings
│   ├── billing/          → Subscription plans
│   └── api/              → Backend endpoints
├── 📁 components/        → Reusable React components
├── 📁 lib/               → Helper functions & integrations
├── package.json          → Dependencies
├── tailwind.config.ts    → Tailwind styling
└── README.md             → Full documentation
```

## First Session Walkthrough

1. **Sign Up** at http://localhost:3000 with any email
2. **Choose Plan** → Starter ($29/mo) for testing
3. **Go to Practice** → Select a scenario
4. **Copy Prompt** → Paste into Custom GPT
5. **Have Conversation** in the GPT window
6. **Paste Transcript** back into the app
7. **Submit for Scoring** → Get instant AI feedback

## Debugging Tips

**"NEXT_PUBLIC_SUPABASE_URL not found"**
- Make sure `.env.local` file exists
- Restart dev server: `Ctrl+C` then `npm run dev`

**Login not working**
- Check Supabase project is created and active
- Verify ANON_KEY in `.env.local`
- Check browser console for errors

**Can't start training**
- Verify subscription tier is set
- Check `/api/entitlement` response in Network tab
- Try signing out and back in

**Stripe checkout not working**
- Use test card `4242 4242 4242 4242`
- Check STRIPE_SECRET_KEY is set
- Webhook logs show in Stripe Dashboard

## Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build locally
npm run lint             # Check for errors
npx supabase start       # Start local Supabase (if using CLI)
```

## Next Steps

1. ✅ Get the app running locally
2. ✅ Test one complete training session
3. ✅ Deploy to Vercel
4. ✅ Configure Stripe webhooks for production
5. ✅ Invite team members to test
6. ✅ Monitor performance and refine scenarios

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Guide**: https://nextjs.org/docs

Good luck! 🚀
