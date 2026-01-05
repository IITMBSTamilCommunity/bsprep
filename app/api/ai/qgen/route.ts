import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('user_profiles_extended').select('is_premium,role').eq('id', user.id).single()
    const isPremium = !!profile?.is_premium || profile?.role === 'admin'
    if (!isPremium) return NextResponse.json({ error: 'Upgrade required for question generation' }, { status: 402 })

    const body = await request.json()
    const { text, count = 5 } = body
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })

    // Placeholder question generation — simple heuristic: create questions from sentences
    const sentences = text.split(/(?<=\.)\s+/).filter(Boolean)
    const questions = sentences.slice(0, count).map((s: string, i: number) => `Q${i + 1}: What is meant by "${s.replace(/\.$/, '')}"?`)

    return NextResponse.json({ questions })
  } catch (err) {
    console.error('QGen error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
