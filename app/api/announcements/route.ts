import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: list all active announcements (public)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
    return NextResponse.json({ announcements: announcements || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: create announcement (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await request.json()
    const { title, body: text } = body
    if (!title || !text) return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    const { data, error } = await supabase.from('announcements').insert([{ title, body: text, created_by: user.id, source: 'admin' }]).select()
    if (error) return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    return NextResponse.json({ success: true, announcement: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
