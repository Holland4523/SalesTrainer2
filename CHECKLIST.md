# 🎯 Implementation Checklist

Follow this checklist to get your PestPros AI Sales Trainer live in production.

## Phase 1: Local Setup (15 minutes)

- [ ] Clone repository or create from this project
- [ ] Run `npm install` (or `./install.sh`)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Verify Node.js version (18+): `node --version`

## Phase 2: Supabase Setup (10 minutes)

- [ ] Create account at https://supabase.com
- [ ] Create new project (wait 2 minutes for setup)
- [ ] Open SQL Editor
- [ ] Copy entire schema from `docs/supabase-schema.sql`
- [ ] Paste & run in SQL editor
- [ ] Go to Project Settings → API
- [ ] Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Paste all 3 keys into `.env.local`

## Phase 3: OpenAI Setup (5 minutes)

- [ ] Go to https://platform.openai.com/api/keys
- [ ] Create new API key
- [ ] Copy key → `OPENAI_API_KEY`
- [ ] Paste into `.env.local`

## Phase 4: Local Testing (10 minutes)

- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Sign up with test email (e.g., test@example.com)
- [ ] Verify email confirmation works
- [ ] Sign in
- [ ] Navigate to Dashboard (should load)
- [ ] Try to access Practice → Should show "Upgrade Required"
- [ ] Click "View Plans"

## Phase 5: Stripe Setup (Optional - for testing) (10 minutes)

- [ ] Go to https://stripe.com/docs/stripe-js/elements/payment-element
- [ ] Create test account
- [ ] Go to Developers → API Keys
- [ ] Copy `Publishable Key` → `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- [ ] Copy `Secret Key` → `STRIPE_SECRET_KEY`
- [ ] Paste both into `.env.local`
- [ ] Don't worry about webhook yet (test mode)

## Phase 6: Test Training Flow (10 minutes)

- [ ] Go to Billing page
- [ ] Click "Choose Plan" on Starter
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Any future date, any CVC
- [ ] Complete checkout
- [ ] Go back to Practice
- [ ] Select scenario & difficulty
- [ ] Click "Start Training"
- [ ] Click "Copy Prompt"
- [ ] Click "Open Custom GPT"
- [ ] Paste prompt in GPT, have conversation
- [ ] Copy transcript back to app
- [ ] Paste transcript & click "Submit"
- [ ] See results with scores

## Phase 7: Prepare for Deployment (5 minutes)

- [ ] Create GitHub repository
- [ ] Push code: `git push origin main`
- [ ] Verify `.env.local` is in `.gitignore` ✓
- [ ] Create `.env.local` from `.env.example`
- [ ] **DO NOT COMMIT `.env.local`** ⚠️

## Phase 8: Deploy to Vercel (10 minutes)

- [ ] Go to https://vercel.com/dashboard
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Click "Import"
- [ ] Go to Settings → Environment Variables
- [ ] Add all 7 variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET` (leave blank for now)
  - [ ] `NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app`
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Click "Visit" to see live site

## Phase 9: Test Production Deployment (10 minutes)

- [ ] Open your Vercel URL
- [ ] Sign up again
- [ ] Try to access Practice
- [ ] Do complete flow (but skip Stripe payment for now)
- [ ] Verify training works end-to-end
- [ ] Test logout & login again

## Phase 10: Stripe Webhook Setup (5 minutes) - Production Only

- [ ] Go to Stripe Dashboard
- [ ] Click Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://your-vercel-url.vercel.app/api/stripe-webhook`
- [ ] Select events:
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Click "Add endpoint"
- [ ] Copy Signing secret
- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add `STRIPE_WEBHOOK_SECRET` with the signing secret
- [ ] Redeploy: Go to Deployments → Latest → ... → Redeploy

## Phase 11: Production Testing (10 minutes)

- [ ] Sign up on production site
- [ ] Go to Billing
- [ ] **Use REAL card** for production (or staging key)
  - For staging: Continue with test card `4242...`
- [ ] Complete payment
- [ ] Verify subscription activated (check Supabase)
- [ ] Go to Practice & complete a training session
- [ ] Verify session saved in Supabase
- [ ] Check leaderboard appears

## Phase 12: Security Verification (10 minutes)

- [ ] ✅ API keys NOT in code (all env vars)
- [ ] ✅ `.env.local` in `.gitignore`
- [ ] ✅ Stripe webhook signature verification enabled
- [ ] ✅ Database RLS policies applied
- [ ] ✅ HTTPS enabled (automatic on Vercel)
- [ ] ✅ Can't access other users' sessions
- [ ] ✅ Can't access API without Bearer token
- [ ] ✅ Scoring requires active subscription

## Phase 13: Monitoring Setup (10 minutes)

- [ ] Open Vercel Dashboard → Analytics
  - [ ] Monitor response times
  - [ ] Watch for errors
- [ ] Open Supabase Dashboard → Logs
  - [ ] Monitor database activity
- [ ] Open Stripe Dashboard
  - [ ] Monitor webhook logs
  - [ ] Verify transactions processed

## Phase 14: Team Onboarding (As Needed)

- [ ] Invite team members to signup
- [ ] Share leaderboard link
- [ ] Provide QUICKSTART guide to new users
- [ ] Monitor feedback

## Phase 15: Iterate & Improve (Ongoing)

- [ ] Gather user feedback
- [ ] Monitor error logs
- [ ] Optimize database queries if slow
- [ ] Add more scenarios based on feedback
- [ ] Consider team features for Team tier
- [ ] Track usage metrics

---

## 🆘 Troubleshooting Guide

### If signup doesn't work:
- [ ] Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- [ ] Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- [ ] Verify Supabase project is active
- [ ] Check browser console for errors

### If OpenAI scoring fails:
- [ ] Verify `OPENAI_API_KEY` is valid
- [ ] Check OpenAI usage at https://platform.openai.com/usage
- [ ] Ensure transcript is 100-50k characters

### If Stripe checkout broken:
- [ ] Verify `STRIPE_SECRET_KEY` is live key (not test)
- [ ] Check Stripe API Keys in dashboard
- [ ] Verify webhook secret matches

### If training session can't be saved:
- [ ] Check Supabase is accessible
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- [ ] Check Row Level Security policies
- [ ] View Supabase logs

### If webhook not firing:
- [ ] Verify webhook URL is accessible
- [ ] Check Stripe webhook logs
- [ ] Verify signing secret matches exactly
- [ ] Enable webhook retry policy

---

## ✅ Pre-Launch Checklist

Before inviting users to production:

- [ ] All 10 checklist phases complete
- [ ] Training flow tested end-to-end
- [ ] Subscription payment processed successfully
- [ ] Scores display correctly
- [ ] Leaderboard updates
- [ ] User can logout and login again
- [ ] Mobile layout responsive
- [ ] No console errors
- [ ] Supabase backups enabled
- [ ] Monitoring configured

---

## 🎯 Success Metrics

Once live, track these metrics:

- **Signups**: Track new users daily
- **Conversion Rate**: Percentage who upgrade from free
- **Session Rate**: Percentage who complete training
- **API Response Time**: Target < 5 seconds
- **Error Rate**: Target < 1%
- **Leaderboard Engagement**: Who checks rankings

---

## 📞 Need Help?

Refer to documentation:
- `QUICKSTART.md` - Getting started
- `README.md` - Full reference
- `docs/API.md` - API reference
- `docs/DEPLOYMENT.md` - Deployment help
- `docs/supabase-schema.sql` - Database schema

---

## 🚀 You're Ready!

Once you've completed all phases, your PestPros trainer is production-ready.

**Estimated Total Time**: ~2 hours

Good luck launching! 🎉
