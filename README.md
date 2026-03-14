# PestPros AI Sales Trainer - Next.js Edition

A production-ready SaaS application for sales training with AI-powered transcript scoring, Supabase authentication, and Stripe billing.

## Features

- **AI-Powered Scoring**: Uses OpenAI to score sales call transcripts across 5 dimensions
- **Custom GPT Integration**: Launch Custom GPT in a popup, paste transcripts back for scoring
- **Supabase Auth**: Email/password authentication with session persistence
- **Stripe Billing**: Subscription tiers (Starter, Pro, Team) with checkout integration
- **Scenario-Based Training**: 4 customizable homeowner personas with difficulty levels
- **Leaderboard**: Track top performers and team rankings
- **Secure API Routes**: All sensitive operations run server-side with token validation

## Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Auth page
├── api/
│   ├── score/route.ts      # Transcript scoring endpoint
│   ├── checkout/route.ts   # Stripe checkout session creation
│   ├── stripe-webhook/route.ts  # Webhook for subscription events
│   └── entitlement/route.ts     # Check user subscription tier
├── dashboard/page.tsx      # Main dashboard
├── practice/page.tsx       # Training session setup & execution
├── leaderboard/page.tsx    # Team rankings
└── billing/page.tsx        # Subscription plans

components/
├── Sidebar.tsx             # Navigation sidebar
├── ScenarioSelector.tsx    # Scenario & difficulty picker
├── TrainerConsole.tsx      # Main training interface
├── SubscriptionGate.tsx    # Upgrade prompt for free users
└── StatCard.tsx            # Reusable stat display

lib/
├── supabase-client.ts      # Client-side Supabase
├── supabase-server.ts      # Server-side Supabase
├── stripe.ts               # Stripe configuration
├── openai.ts               # OpenAI scoring logic
└── entitlements.ts         # Subscription checks
```

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd pestpros-sales-trainer
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run these SQL commands in the Supabase SQL editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'rep',
  company_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  transcript TEXT NOT NULL,
  overall_score INT,
  rapport INT,
  discovery INT,
  objection_handling INT,
  closing_strength INT,
  coaching_summary TEXT,
  improvements TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  user_email TEXT UNIQUE,
  tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'inactive',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  session_id UUID NOT NULL REFERENCES sessions,
  score INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Get your credentials:
   - Go to Project Settings → API
   - Copy `Project URL` and `anon public key`

### 3. Set Up Stripe

1. Create a Stripe account at https://stripe.com
2. Go to Settings → API Keys
3. Copy your Publishable Key and Secret Key
4. Set up a webhook at Settings → Webhooks → Add endpoint
5. Point to: `https://your-app.vercel.app/api/stripe-webhook`
6. Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Set Up OpenAI

1. Create an OpenAI account at https://platform.openai.com
2. Go to API keys and create a new secret key

### 5. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 7. Deploy to Vercel

```bash
npm run build
npm run start
```

Or use the Vercel CLI:

```bash
vercel deploy
```

Add all environment variables in Vercel Settings → Environment Variables.

## Scoring API

The `/api/score` endpoint expects:

```json
{
  "transcript": "Your sales call transcript..."
}
```

Returns:

```json
{
  "sessionId": "uuid",
  "overall_score": 75,
  "rapport": 80,
  "discovery": 70,
  "objection_handling": 75,
  "closing_strength": 70,
  "coaching_summary": "Good rapport building but need to strengthen discovery questions.",
  "improvements": ["Ask more discovery questions", "Clarify needs better", ...]
}
```

## Custom GPT Integration

The Custom GPT is located at: https://chatgpt.com/g/g-67be87f079888191bfa2e2dcd1e66771-sales-trainer

Flow:
1. User selects scenario & difficulty
2. System generates personalized prompt
3. "Copy Prompt" button copies to clipboard
4. "Open Custom GPT" opens the GPT in a popup
5. User pastes prompt into GPT and conducts the roleplay
6. User copies transcript back into the app
7. App submits transcript to OpenAI for scoring

## Entitlements

- **Free**: No access to training
- **Starter ($29/mo)**: 5 sessions/month
- **Pro ($99/mo)**: Unlimited sessions
- **Team ($299/mo)**: Unlimited + 5 team seats

Subscription status is verified server-side on every scoring request.

## Security Notes

- OpenAI and Stripe keys are never exposed to the browser
- All API routes validate JWT tokens
- Stripe webhooks verify signatures
- Input validation on transcript length (100-50,000 chars)
- Rate limiting recommended for production

## Troubleshooting

**"Supabase not configured"**
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

**"Unauthorized" on scoring**
- Verify user session is valid
- Check Bearer token format

**Stripe webhook not firing**
- Ensure webhook URL is accessible
- Check signature verification in logs
- Verify events are enabled in Stripe dashboard

## Support

For issues, check the logs in your deployment platform (Vercel) or contact support@example.com
