import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    const { data: roles, error: rolesErr } = await supabase
      .from('user_profiles_extended')
      .select('role')

    const { data: courses, error: coursesErr } = await supabase
      .from('courses')
      .select('id')

    const { data: enrollments, error: enrollErr } = await supabase
      .from('enrollments')
      .select('id')

    if (rolesErr) console.error('Admin analytics roles error:', rolesErr)
    if (coursesErr) console.error('Admin analytics courses error:', coursesErr)
    if (enrollErr) console.error('Admin analytics enrollments error:', enrollErr)

    const rolesList = roles || []
    const totalUsers = rolesList.length
    const totalStudents = rolesList.filter((r: any) => r.role === 'student').length
    const totalMentors = rolesList.filter((r: any) => r.role === 'mentor').length
    const totalAdmins = rolesList.filter((r: any) => r.role === 'admin').length

    return NextResponse.json({
      stats: {
        totalUsers,
        totalStudents,
        totalMentors,
        totalAdmins,
        totalCourses: courses?.length || 0,
        totalEnrollments: enrollments?.length || 0,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
