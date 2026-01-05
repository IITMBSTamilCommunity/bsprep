import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: videos, error } = await supabase
      .from('videos')
      .select('id,title,description,thumbnail,is_premium,category,duration_seconds,public_url,created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    return NextResponse.json({ videos: videos || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
