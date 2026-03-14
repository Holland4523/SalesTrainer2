import { NextRequest, NextResponse } from 'next/server'
import { scoreTranscript } from '@/lib/openai'
import { checkEntitlement, getSubscriptionTier } from '@/lib/entitlements'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    // Get user from session
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: user, error: authError } = await supabaseServer.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check entitlement
    const canScore = await checkEntitlement(user.id, 'score')
    if (!canScore) {
      return NextResponse.json(
        { error: 'Subscription required. Please upgrade.' },
        { status: 403 }
      )
    }

    const { transcript } = await req.json()

    if (!transcript || typeof transcript !== 'string' || transcript.length < 100) {
      return NextResponse.json(
        { error: 'Transcript must be at least 100 characters' },
        { status: 400 }
      )
    }

    if (transcript.length > 50000) {
      return NextResponse.json(
        { error: 'Transcript too long (max 50,000 characters)' },
        { status: 400 }
      )
    }

    // Score the transcript
    const score = await scoreTranscript(transcript)

    // Save session to database
    const { data: session, error: insertError } = await supabaseServer
      .from('sessions')
      .insert({
        user_id: user.id,
        transcript,
        overall_score: score.overall_score,
        rapport: score.rapport,
        discovery: score.discovery,
        objection_handling: score.objection_handling,
        closing_strength: score.closing_strength,
        coaching_summary: score.coaching_summary,
        improvements: score.improvements,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Session insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
    }

    return NextResponse.json({
      sessionId: session.id,
      ...score,
    })
  } catch (error) {
    console.error('Score API error:', error)
    return NextResponse.json({ error: 'Failed to score transcript' }, { status: 500 })
  }
}
