import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: mentors, error } = await supabase
      .from('mentors')
      .select('id,display_name,bio,hourly_rate,subjects,created_at,user_id')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 })
    return NextResponse.json({ mentors: mentors || [] })
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

    // Only admin can create mentor entries
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { display_name, bio, hourly_rate, subjects } = body

    const { data, error } = await supabase
      .from('mentors')
      .insert([{ user_id: user.id, display_name, bio, hourly_rate: hourly_rate || 0, subjects }])
      .select()

    if (error) return NextResponse.json({ error: 'Failed to create mentor' }, { status: 500 })
    return NextResponse.json({ success: true, mentor: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
