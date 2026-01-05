import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles_extended')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: profile || {} })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photo_url, banner_url, github, linkedin, portfolio, about, education, location, username, full_name, email, projects, experiences, educations } = body

    // Upsert profile
    // Validate uploaded image URLs belong to the authenticated user (simple check).
    // Expected public URL format: <SUPABASE_URL>/storage/v1/object/public/profiles/<key>
    const invalidUpload = (url?: string) => {
      if (!url) return false
      try {
        const parsed = new URL(url)
        const base = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        if (!parsed.href.startsWith((base || '').replace(/\/$/, '') + '/storage/v1/object/public/profiles/')) return true
        // ensure filename contains user id to reduce spoofing (we use <kind>/<userId>-timestamp.ext)
        const key = parsed.pathname.split('/storage/v1/object/public/profiles/')[1] || ''
        if (!key.includes(user.id)) return true
        return false
      } catch {
        return true
      }
    }

    if (invalidUpload(photo_url) || invalidUpload(banner_url)) {
      return NextResponse.json({ error: 'Invalid uploaded image URL' }, { status: 400 })
    }

    const { data: profile, error: upsertError } = await supabase
      .from('user_profiles_extended')
      .upsert({
        id: user.id,
        photo_url,
        banner_url,
        github,
        linkedin,
        portfolio,
        about,
        education,
        location,
        username,
        full_name,
        email,
        projects,
        experiences,
        educations,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Profile upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  // PUT and POST do the same thing (upsert)
  return POST(request)
}