import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { mentorId: string } }) {
  try {
    const { mentorId } = params
    const supabase = await createClient()

    const { data: bookings, error } = await supabase
      .from('mentor_bookings')
      .select('id,mentor_id,student_id,scheduled_at,duration_minutes,status,notes,created_at')
      .eq('mentor_id', mentorId)
      .order('scheduled_at', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    return NextResponse.json({ bookings: bookings || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { mentorId: string } }) {
  try {
    const { mentorId } = params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only students (or admins) can create bookings
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    const role = profile?.role || 'user'
    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { scheduled_at, duration_minutes, notes } = body
    if (!scheduled_at) return NextResponse.json({ error: 'Missing scheduled_at' }, { status: 400 })

    const { data, error } = await supabase
      .from('mentor_bookings')
      .insert([{ mentor_id: mentorId, student_id: user.id, scheduled_at, duration_minutes: duration_minutes || 60, notes }])
      .select()

    if (error) return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    return NextResponse.json({ success: true, booking: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
