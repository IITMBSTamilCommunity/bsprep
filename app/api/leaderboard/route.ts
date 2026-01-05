import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('user_profiles_extended')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Simple leaderboard: top users by average score across attempts
    const { data: rows, error } = await supabase.rpc('leaderboard_top_users')
    if (error) return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    return NextResponse.json({ leaderboard: rows || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
