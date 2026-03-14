# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account with your code pushed
- Supabase project created and schema applied
- OpenAI API key
- Stripe account (optional for testing)

### Step 1: Connect Repository

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your GitHub repository
4. Click "Import"

### Step 2: Configure Environment Variables

In the "Environment Variables" section, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 3: Deploy

Click "Deploy" and Vercel will:
1. Build the Next.js app
2. Run `npm run build`
3. Deploy to Vercel's edge network
4. Provide you with a live URL

### Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-app.vercel.app/api/stripe-webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Vercel

## Local Development Setup

### Prerequisites
```bash
# Install Node.js 18+
# Install npm or pnpm

# Clone repository
git clone <your-github-url>
cd pestpros-sales-trainer
npm install
```

### Environment Setup
```bash
# Copy example env
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

### Start Dev Server
```bash
npm run dev
# Open http://localhost:3000
```

## Production Checklist

- [ ] Database schema created in Supabase
- [ ] All environment variables set in Vercel
- [ ] Stripe webhook configured and tested
- [ ] Custom GPT URL accessible
- [ ] Login/signup flows tested
- [ ] Scoring API tested with sample transcript
- [ ] Subscription checkout tested (use test card)
- [ ] Stripe webhook firing correctly
- [ ] Database backups configured
- [ ] Monitoring & error logging set up
- [ ] Rate limiting configured (recommended)

## Monitoring & Maintenance

### Error Tracking
```bash
# Optional: Add Sentry for error tracking
npm install @sentry/nextjs
```

Then create `sentry.server.config.ts` and `sentry.client.config.ts`.

### Database Backups
Supabase automatically creates daily backups. Enable:
1. Database → Backups → Enable PITR (Point-in-Time Recovery)

### Performance Monitoring
Vercel provides built-in analytics:
- Go to Vercel Dashboard → Analytics
- Monitor response times, throughput, etc.

### Logs
```bash
# View Vercel logs
vercel logs --follow

# Or in Vercel Dashboard → Deployments → Logs
```

## Scaling Considerations

### Database
- Supabase auto-scales PostgreSQL
- For high volume, consider:
  - Connection pooling
  - Read replicas
  - Vector extensions for semantic search

### API Routes
- Vercel serverless functions auto-scale
- Each request is isolated (no long-running processes)
- Use cron jobs for background tasks

### Storage
- Store large files in Supabase Storage
- Implement CDN caching for static assets

## Testing Before Production

### Manual Testing Checklist
1. Sign up with new email
2. Complete payment flow (use test card)
3. Start a practice session
4. Submit transcript for scoring
5. Verify session appears in leaderboard
6. Check user profile
7. Sign out and sign back in

### Load Testing (Optional)
```bash
npm install -g autocannon

# Test API endpoint
autocannon https://your-app.vercel.app/api/score
```

## Troubleshooting Deployment

### Build Failures
```bash
# Check build locally
npm run build

# Look for TypeScript errors
npm run lint
```

### Environment Variable Issues
- Verify all keys are added in Vercel Settings → Environment Variables
- Restart deployment after adding new variables
- Check that variable names match exactly

### Database Connection Issues
```bash
# Test Supabase connection
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
  "https://your-project.supabase.co/rest/v1/profiles?select=*"
```

### Stripe Webhook Not Firing
1. Check endpoint URL is accessible: `curl https://your-app.vercel.app/api/stripe-webhook`
2. Verify signing secret matches
3. Check webhook logs in Stripe Dashboard
4. Enable retry in Stripe Dashboard

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys monthly** - Set calendar reminder
3. **Enable 2FA on all accounts** - Supabase, Stripe, Vercel
4. **Use environment variables** - Never hardcode secrets
5. **Enable CORS properly** - Only allow your domain
6. **Validate all inputs** - Check transcript length, format
7. **Rate limit APIs** - Use middleware library
8. **Monitor logs** - Watch for suspicious activity

## Custom Domain Setup

### In Vercel
1. Go to Project Settings → Domains
2. Add custom domain
3. Follow DNS instructions
4. SSL certificate auto-generated

### Update Environment Variable
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Performance Optimization

### Code Splitting
- Next.js auto-splits by route
- Use dynamic imports for heavy components

### Image Optimization
- Use Next.js Image component
- Vercel CDN auto-optimizes

### Database Queries
- Add indexes to frequently queried columns
- Use connection pooling for Neon/PlanetScale

## Rollback Plan

If deployment breaks:

1. **Via Vercel Dashboard**
   - Deployments → Select previous working version
   - Click the ... menu → Promote to Production

2. **Via CLI**
   ```bash
   vercel deployments ls
   vercel promote <deployment-url>
   ```

## Support & Resources

- **Vercel Status**: https://vercel.statuspage.io
- **Supabase Status**: https://status.supabase.com
- **Stripe Status**: https://status.stripe.com
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

**Deployment Time**: ~15 minutes
**Cost**: $0-50/month (Supabase + Vercel free tiers available)
