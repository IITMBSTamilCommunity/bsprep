import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { quizId: string } }) {
  try {
    const { quizId } = params
    const supabase = await createClient()

    const { data: quiz, error: qErr } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()
    if (qErr || !quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id,question_text,question_type,points')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true })

    // fetch choices for questions
    const questionIds = (questions || []).map((q: any) => q.id)
    let choicesMap: Record<string, any[]> = {}
    if (questionIds.length) {
      const { data: choices } = await supabase
        .from('quiz_choices')
        .select('id,question_id,content')
        .in('question_id', questionIds)

      choicesMap = (choices || []).reduce((acc: any, c: any) => {
        acc[c.question_id] = acc[c.question_id] || []
        acc[c.question_id].push({ id: c.id, content: c.content })
        return acc
      }, {})
    }

    const payload = { quiz, questions: (questions || []).map((q: any) => ({ ...q, choices: choicesMap[q.id] || [] })) }
    return NextResponse.json(payload)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { quizId: string } }) {
  // handle creating questions/choices for a quiz (admin/mentor)
  try {
    const { quizId } = params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    // expected: questions: [{ question_text, question_type, points, choices: [{content, is_correct}] }]
    const { questions } = body
    if (!questions || !Array.isArray(questions)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    // Only admins or mentors can add questions
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    const role = profile?.role || 'user'
    if (!['admin', 'mentor'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // insert questions and choices
    const inserted: any[] = []
    for (const q of questions) {
      const { data: qData, error: qErr } = await supabase.from('quiz_questions').insert([{ quiz_id: quizId, question_text: q.question_text, question_type: q.question_type || 'single', points: q.points || 1 }]).select().single()
      if (qErr) throw qErr
      if (q.choices && Array.isArray(q.choices)) {
        const choicesToInsert = q.choices.map((c: any) => ({ question_id: qData.id, content: c.content, is_correct: !!c.is_correct }))
        await supabase.from('quiz_choices').insert(choicesToInsert)
      }
      inserted.push(qData)
    }

    return NextResponse.json({ success: true, inserted })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
