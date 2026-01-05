import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { session_id, event_type, event_data = {} } = body
    if (!session_id || !event_type) return NextResponse.json({ error: 'Missing session_id or event_type' }, { status: 400 })

    // Verify session belongs to user or requester is admin
    const { data: session } = await supabase.from('proctor_sessions').select('id,user_id').eq('id', session_id).single()
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    const role = profile?.role || 'user'
    if (String(session.user_id) !== String(user.id) && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase.from('proctor_logs').insert([{ session_id, event_type, event_data }]).select()
    if (error) return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Proctor log error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
