import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // fetch user role from profile to enforce RBAC
    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'user'
    // only students, mentors or admins can upload notes
    if (!['student', 'mentor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('uploader_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    return NextResponse.json({ notes })
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

    const body = await request.json()
    const { title, description, file_url, is_premium } = body

    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, description, file_url, is_premium: !!is_premium, uploader_id: user.id }])
      .select()

    if (error) return NextResponse.json({ error: 'Failed to upload note' }, { status: 500 })
    return NextResponse.json({ success: true, note: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
