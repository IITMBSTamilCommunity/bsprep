import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ensure admin
    const { data: me } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, title, description, file_path, public_url, thumbnail, is_premium, category, duration_seconds } = body
    if (!id || !title) return NextResponse.json({ error: 'Missing id or title' }, { status: 400 })

    const { data, error } = await supabase.from('videos').insert([{ id, title, description, file_path, public_url, thumbnail, is_premium: !!is_premium, category, duration_seconds, created_by: user.id }]).select()
    if (error) return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
    return NextResponse.json({ success: true, video: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
