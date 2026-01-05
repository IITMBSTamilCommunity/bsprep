import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { courseId } = await request.json()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only students (or admins) can enroll
    const { data: profile } = await supabase.from('user_profiles_extended').select('role').eq('id', user.id).single()
    const role = profile?.role || 'user'
    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // For paid courses, check payment status (in real app, verify payment here)
    const paymentStatus = course.type === 'paid' ? 'pending' : 'completed'

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        payment_status: paymentStatus
      })
      .select()
      .single()

    if (enrollError) {
      return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
    }

    return NextResponse.json({ success: true, enrollment })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: deleteError } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', user.id)
      .eq('course_id', courseId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unenrollment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
