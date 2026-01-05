import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify requester is admin
    const { data: me } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Fetch all user profiles (admin RLS policies should allow this)
    const { data: profiles, error } = await supabase
      .from('user_profiles_extended')
      .select('id, full_name, username, email, role, photo_url, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    return NextResponse.json({ users: profiles || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    if (me?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, role } = body
    if (!id || !role) return NextResponse.json({ error: 'Missing id or role' }, { status: 400 })

    const { data, error } = await supabase
      .from('user_profiles_extended')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    return NextResponse.json({ success: true, user: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
