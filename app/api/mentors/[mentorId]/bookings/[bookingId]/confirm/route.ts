import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: { mentorId: string; bookingId: string } }) {
  try {
    const { mentorId, bookingId } = params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only the mentor (mentor.user_id) or admin can confirm
    const { data: mentor } = await supabase.from('mentors').select('id,user_id,display_name').eq('id', mentorId).single()
    if (!mentor) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })

    // Check permission
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    if (!isAdmin && String(mentor.user_id) !== String(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update booking status to confirmed
    const { data: booking, error } = await supabase.from('mentor_bookings').update({ status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', bookingId).select().single()
    if (error) return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })

    // Notify student via notifications table
    if (booking?.student_id) {
      await supabase.from('notifications').insert([{ user_id: booking.student_id, title: 'Mentor booking confirmed', body: `Your booking with ${mentor.display_name || 'mentor'} on ${new Date(booking.scheduled_at).toLocaleString()} is confirmed.`, link: `/dashboard/mentor/bookings/${booking.id}` }])
    }

    return NextResponse.json({ success: true, booking })
  } catch (err) {
    console.error('Confirm booking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
