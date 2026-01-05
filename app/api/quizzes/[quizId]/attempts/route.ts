import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { quizId: string } }) {
  try {
    const { quizId } = params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { answers } = body // [{ question_id, selected_choice_ids, answer_text }]

    // enforce only students (or admins) can submit quiz attempts
    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'
    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create attempt
    const { data: attempt } = await supabase.from('quiz_attempts').insert([{ quiz_id: quizId, user_id: user.id, started_at: new Date().toISOString() }]).select().single()

    // Save answers
    for (const a of answers || []) {
      await supabase.from('quiz_attempt_answers').insert([{ attempt_id: attempt.id, question_id: a.question_id, answer_text: a.answer_text || null, selected_choice_ids: a.selected_choice_ids || null }])
    }

    // Grade: compute score by matching correct choices
    // Fetch question points
    const { data: questions } = await supabase.from('quiz_questions').select('id,points').eq('quiz_id', quizId)
    const qPointsMap = (questions || []).reduce((acc: any, q: any) => { acc[q.id] = q.points; return acc }, {})

    // Fetch correct choices
    const { data: correctChoices } = await supabase.from('quiz_choices').select('id,question_id').eq('is_correct', true)
    const correctMap: Record<string, string[]> = {}
    (correctChoices || []).forEach((c: any) => { correctMap[c.question_id] = correctMap[c.question_id] || []; correctMap[c.question_id].push(c.id) })

    // Calculate total points from ALL questions
    let total = (questions || []).reduce((sum: number, q: any) => sum + (q.points || 1), 0)
    let score = 0

    for (const a of answers || []) {
      const qPoints = qPointsMap[a.question_id] || 1
      const correct = correctMap[a.question_id] || []
      const selected = (a.selected_choice_ids || []).map((id: any) => String(id))
      const correctIds = (correct || []).map((id: any) => String(id))
      // simple grading: for single correct - full points if selection equals correct set
      const isCorrect = selected.length === correctIds.length && selected.every((s: string) => correctIds.includes(s))
      if (isCorrect) score += qPoints
    }

    // Update attempt with final score
    await supabase.from('quiz_attempts').update({ finished_at: new Date().toISOString(), score, total_points: total }).eq('id', attempt.id)

    return NextResponse.json({ success: true, attempt_id: attempt.id, score, total })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
