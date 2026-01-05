import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('id,title,description,time_limit_seconds,is_published,created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
    return NextResponse.json({ quizzes: quizzes || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only admins may create quizzes
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, title, description, time_limit_seconds, is_published } = body
    if (!id || !title) return NextResponse.json({ error: 'Missing id or title' }, { status: 400 })

    const { data, error } = await supabase
      .from('quizzes')
      .insert([{ id, title, description, time_limit_seconds: time_limit_seconds || 0, is_published: !!is_published, created_by: user.id }])
      .select()

    if (error) return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
    return NextResponse.json({ success: true, quiz: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
