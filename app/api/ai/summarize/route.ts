import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { text, max_sentences = 3 } = body
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

    // Placeholder summarization — replace with real AI integration (OpenAI / other)
    const sentences = text.split(/(?<=\.)\s+/).filter(Boolean)
    const summary = sentences.slice(0, max_sentences).join(' ')

    return NextResponse.json({ summary })
  } catch (err) {
    console.error('Summarize error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
