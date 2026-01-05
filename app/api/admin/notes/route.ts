import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // check role from profile
    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch notes and include uploader profile info by joining via RPC (or separate query)
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })

    // For any uploader ids, fetch profile details and attach
    const uploaderIds = Array.from(new Set((notes || []).map((n: any) => n.uploader_id).filter(Boolean)))
    let profilesMap: Record<string, any> = {}
    if (uploaderIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles_extended')
        .select('id, full_name, username, photo_url, role, email')
        .in('id', uploaderIds)

      profilesMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p
        return acc
      }, {})
    }

    const enriched = (notes || []).map((n: any) => ({ ...n, uploader_profile: profilesMap[n.uploader_id] || null }))

    return NextResponse.json({ notes: enriched })
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

    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, review_feedback, is_premium } = body

    const { data, error } = await supabase
      .from('notes')
      .update({ status, review_feedback, is_premium: !!is_premium, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
    return NextResponse.json({ success: true, note: data?.[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
