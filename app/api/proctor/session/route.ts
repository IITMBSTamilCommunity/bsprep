import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ensure only students (or admins) can start proctor sessions
    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'
    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { quiz_id, metadata = {} } = body

    const { data, error } = await supabase.from('proctor_sessions').insert([{ user_id: user.id, quiz_id, metadata }]).select().single()
    if (error) return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })

    return NextResponse.json({ session: data })
  } catch (err) {
    console.error('Proctor session error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
