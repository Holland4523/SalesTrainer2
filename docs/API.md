# API Documentation

## Overview

All API routes require authentication via Bearer token (JWT from Supabase).

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Score Transcript

**POST** `/api/score`

Scores a sales call transcript using OpenAI.

#### Request

```json
{
  "transcript": "Sales conversation text here... (minimum 100 characters)"
}
```

#### Headers

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

#### Response

```json
{
  "sessionId": "uuid-of-session",
  "overall_score": 75,
  "rapport": 80,
  "discovery": 70,
  "objection_handling": 75,
  "closing_strength": 70,
  "coaching_summary": "Strong rapport building. Work on deeper discovery questions.",
  "improvements": [
    "Ask more open-ended questions",
    "Listen more before proposing solutions",
    "Clarify budget earlier"
  ]
}
```

#### Error Responses

```json
{
  "error": "Unauthorized"
}
// Status: 401 - Invalid or missing token
```

```json
{
  "error": "Subscription required. Please upgrade."
}
// Status: 403 - User doesn't have active subscription
```

```json
{
  "error": "Transcript must be at least 100 characters"
}
// Status: 400 - Invalid input
```

#### Rate Limiting

- Recommended: 1 request per 30 seconds per user
- Cost: ~$0.01 per scoring (OpenAI gpt-4o-mini)

#### Example Usage

```typescript
// React/TypeScript
const scoreTranscript = async (transcript: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch('/api/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ transcript })
  })
  
  return response.json()
}
```

---

### 2. Create Checkout Session

**POST** `/api/checkout`

Creates a Stripe checkout session for subscription.

#### Request

```json
{
  "planId": "starter",
  "email": "user@example.com"
}
```

#### planId Options

- `starter` - $29/month (5 sessions)
- `pro` - $99/month (unlimited)
- `team` - $299/month (unlimited + seats)

#### Response

```json
{
  "url": "https://checkout.stripe.com/pay/cs_live_..."
}
```

#### Error Responses

```json
{
  "error": "Invalid plan"
}
// Status: 400 - Unknown plan ID
```

#### Example Usage

```typescript
const checkout = async (planId: string, email: string) => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, email })
  })
  
  const { url } = await response.json()
  window.location.href = url // Redirect to Stripe
}
```

---

### 3. Stripe Webhook

**POST** `/api/stripe-webhook`

Receives subscription events from Stripe.

**Note**: This endpoint does NOT require Bearer authentication (uses Stripe signature instead).

#### Supported Events

- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Plan changed
- `customer.subscription.deleted` - Subscription canceled

#### Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe-webhook`
3. Select events above
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

#### What Happens

Automatically updates the `subscriptions` table in Supabase:

```sql
UPDATE subscriptions 
SET tier = 'pro', status = 'active'
WHERE stripe_customer_id = '...'
```

---

### 4. Check Entitlement

**GET** `/api/entitlement`

Check user's subscription tier and status.

#### Headers

```
Authorization: Bearer <jwt-token>
```

#### Response

```json
{
  "tier": "pro",
  "status": "active"
}
```

#### Tier Values

- `free` - No access
- `starter` - 5 sessions/month
- `pro` - Unlimited
- `team` - Unlimited + team features

#### Status Values

- `active` - Subscription is valid
- `inactive` - No active subscription
- `past_due` - Payment failed
- `canceled` - Subscription ended

#### Example Usage

```typescript
const checkSubscription = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch('/api/entitlement', {
    headers: {
      'Authorization': `Bearer ${session?.access_token}`
    }
  })
  
  const { tier } = await response.json()
  
  if (tier === 'free') {
    redirect('/billing')
  }
}
```

---

## Authentication

### How to Get JWT Token

```typescript
// Supabase automatically manages tokens
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token
```

### Token Refresh

Tokens expire after 1 hour. Supabase automatically refreshes:

```typescript
const { data, error } = await supabase.auth.refreshSession()
```

### Logout

```typescript
await supabase.auth.signOut()
// Clears session, token becomes invalid
```

---

## Rate Limiting (Recommended for Production)

Add middleware to prevent abuse:

```typescript
// middleware.ts - Example
const rateLimiter = new Map()

function checkRateLimit(userId: string) {
  const now = Date.now()
  const userLimits = rateLimiter.get(userId) || []
  const recentRequests = userLimits.filter(t => now - t < 60000)
  
  if (recentRequests.length > 10) {
    return false // Too many requests
  }
  
  recentRequests.push(now)
  rateLimiter.set(userId, recentRequests)
  return true
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common Status Codes

- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `500` - Server error

---

## Testing with cURL

### Score Endpoint

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -d '{
    "transcript": "Sales rep: Hello, I'm calling about pest control services. Homeowner: Yes, I have an ant problem..."
  }'
```

### Checkout Endpoint

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro",
    "email": "user@example.com"
  }'
```

### Entitlement Endpoint

```bash
curl http://localhost:3000/api/entitlement \
  -H "Authorization: Bearer <YOUR_JWT>"
```

---

## Webhook Testing

### Using Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe listen --forward-to localhost:3000/api/stripe-webhook

# In another terminal, trigger test event
stripe trigger customer.subscription.created
```

---

## Performance Metrics

Typical response times:

- `/api/entitlement` - **50ms** (database lookup)
- `/api/score` - **2-5s** (OpenAI API call)
- `/api/checkout` - **300ms** (Stripe API call)
- `/api/stripe-webhook` - **100ms** (database update)

---

## Cost Estimates

Per 100 users:

- **Supabase**: $0 (free tier) - $50-200/mo (pay-as-you-go)
- **OpenAI**: $0.01 per scoring × 100 users × 10 sessions = **$10/mo**
- **Stripe**: 2.9% + $0.30 per transaction
- **Vercel**: $0 (free tier) - **$20/mo** (pro)

---

## Troubleshooting

### 401 Unauthorized

```typescript
// Check token is valid
const { data: { user } } = await supabase.auth.getUser(token)
if (!user) {
  // Token expired or invalid
  await supabase.auth.refreshSession()
}
```

### 403 Subscription Required

```typescript
// User needs to upgrade
// Redirect to /billing page
window.location.href = '/billing'
```

### 500 Server Error

Check Vercel logs:
```bash
vercel logs --follow
```

### Webhook Not Firing

1. Is endpoint URL accessible?
   ```bash
   curl https://your-app.vercel.app/api/stripe-webhook
   ```

2. Is signing secret correct?
   - Copy from Stripe Dashboard again
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel

3. Enable retry
   - Stripe Dashboard → Webhooks → Endpoint → Settings → Retry Policy

---

## Security Checklist

- ✅ Always use HTTPS (Vercel enforces)
- ✅ Validate Bearer token on every request
- ✅ Check subscription server-side (not client-side)
- ✅ Verify Stripe webhook signatures
- ✅ Sanitize input (check transcript length)
- ✅ Rate limit scoring requests
- ✅ Never expose API keys to client
- ✅ Use environment variables for secrets

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { supabase } from '@/lib/supabase-client'

async function scoreTranscript(transcript: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  const { data, error } = await fetch('/api/score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({ transcript })
  }).then(r => r.json())
  
  if (error) throw new Error(error)
  return data
}
```

### Python

```python
import requests
import os

def score_transcript(transcript: str, token: str):
    url = "https://your-app.vercel.app/api/score"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {"transcript": transcript}
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()
```

---

Last updated: 2024
API Version: 1.0
