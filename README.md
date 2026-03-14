# Sales Trainer

AI-powered sales training platform built with Next.js, Supabase, and OpenAI.

## Features

- User authentication with Supabase
- AI-generated sales scenarios
- Call transcript analysis and scoring
- Instant feedback and coaching tips

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key

### Environment Variables

The following environment variables have been configured:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Usage

1. Sign up or log in with your email
2. Click "Start Practice"
3. Select a sales scenario
4. Enter your sales call transcript
5. Get instant scoring and coaching feedback

## API Endpoints

### POST /api/score
Score a sales call transcript

**Request:**
```json
{
  "transcript": "Rep: Hello! Did I catch you at a bad time?..."
}
```

**Response:**
```json
{
  "overall_score": 75,
  "rapport": 80,
  "discovery": 70,
  "objection_handling": 75,
  "closing_strength": 70,
  "coaching_summary": "Good rapport building...",
  "improvements": ["Ask more discovery questions...", ""]
}
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API
- **Auth**: Supabase Auth

## Deployment

Deploy to Vercel by pushing to your main branch. Environment variables are already configured.

```bash
git push origin main
```

## License

MIT
