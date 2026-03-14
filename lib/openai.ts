import OpenAI from 'openai'

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }
  return new OpenAI({ apiKey })
}

export async function scoreTranscript(transcript: string): Promise<{
  overall_score: number
  rapport: number
  discovery: number
  objection_handling: number
  closing_strength: number
  coaching_summary: string
  improvements: string[]
}> {
  try {
    const openai = getOpenAI()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert sales coach analyzing pest control sales calls. Score the transcript on:
- Rapport (0-100): Connection, empathy, active listening
- Discovery (0-100): Understanding needs, asking good questions
- Objection Handling (0-100): Addressing concerns professionally
- Closing Strength (0-100): Clear next steps, asking for commitment
- Overall Score (0-100): Weighted average

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "overall_score": 0,
  "rapport": 0,
  "discovery": 0,
  "objection_handling": 0,
  "closing_strength": 0,
  "coaching_summary": "Brief summary",
  "improvements": ["Point 1", "Point 2"]
}`,
        },
        {
          role: 'user',
          content: `Score this sales call transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = response.choices[0].message.content || ''
    const parsed = JSON.parse(content)

    return {
      overall_score: Math.min(100, Math.max(0, parsed.overall_score || 0)),
      rapport: Math.min(100, Math.max(0, parsed.rapport || 0)),
      discovery: Math.min(100, Math.max(0, parsed.discovery || 0)),
      objection_handling: Math.min(100, Math.max(0, parsed.objection_handling || 0)),
      closing_strength: Math.min(100, Math.max(0, parsed.closing_strength || 0)),
      coaching_summary: parsed.coaching_summary || '',
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
    }
  } catch (error) {
    console.error('OpenAI scoring error:', error)
    // Return fallback scores
    return {
      overall_score: 65,
      rapport: 70,
      discovery: 60,
      objection_handling: 65,
      closing_strength: 60,
      coaching_summary: 'Unable to score. Please try again.',
      improvements: ['Ensure proper environment setup', 'Verify transcript clarity'],
    }
  }
}
