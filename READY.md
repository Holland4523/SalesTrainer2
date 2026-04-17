# Sales Trainer - v0 Project Ready

Your standard v0 Next.js project is complete and ready to use!

## What's Been Built

A full-stack sales training app with:

- **Authentication**: Supabase email/password signup and login
- **Practice Sessions**: Select from 3 AI scenarios and paste transcripts
- **AI Scoring**: OpenAI evaluates calls on 5 dimensions (rapport, discovery, objection handling, closing, resilience)
- **Instant Feedback**: Coaching summary and improvement tips after each session
- **Dashboard**: View session history and stats

## Project Structure

```
app/
├── page.tsx                  # Login/Signup
├── layout.tsx               # Root layout
└── api/
    └── score/route.ts       # Transcript scoring API

components/
├── AuthForm.tsx             # Login/signup form
├── Dashboard.tsx            # Main dashboard
└── PracticeSession.tsx      # Training interface

lib/
├── supabase.ts              # Supabase client
└── openai.ts                # OpenAI scoring
```

## Environment Variables (Already Set)

These are configured in your Vercel/v0 project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## How to Run

1. **Locally:**
   ```bash
   npm install
   npm run dev
   ```
   Then visit http://localhost:3000

2. **On Vercel:**
   Just push to your main branch - it auto-deploys!

## How It Works

1. User signs up/logs in
2. Selects a training scenario (roaches, termites, mosquitoes)
3. Pastes a sales call transcript
4. OpenAI scores it on 5 key skills
5. App displays coaching feedback

## Scores Explained

- **Overall**: Weighted average (0-100)
- **Rapport**: Connection and empathy
- **Discovery**: Understanding customer needs
- **Objection Handling**: Addressing concerns
- **Closing**: Clear next steps and commitment

## Next Steps

- Sign up at http://localhost:3000
- Try a practice session
- Paste a sample sales call transcript
- Get your score and coaching tips

That's it! You have a working AI-powered sales trainer. 🚀
