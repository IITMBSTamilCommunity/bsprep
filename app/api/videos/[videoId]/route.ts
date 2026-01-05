import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params
    const supabase = await createClient()

    const { data: video, error } = await supabase.from('videos').select('*').eq('id', videoId).single()
    if (error || !video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    // attach uploader profile
    let uploaderProfile = null
    if (video.created_by) {
      const { data: profile } = await supabase.from('user_profiles_extended').select('id,full_name,photo_url,role,is_premium,email').eq('id', video.created_by).single()
      uploaderProfile = profile || null
    }

    return NextResponse.json({ video: { ...video, uploader_profile: uploaderProfile } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
