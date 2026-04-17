import { scoreTranscript } from '@/lib/openai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 })
    }

    const result = await scoreTranscript(transcript)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Scoring error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to score transcript' },
      { status: 500 }
    )
  }
}
