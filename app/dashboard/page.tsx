"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Trophy, Users, TrendingUp } from "lucide-react"

export default function StudentDashboard() {
  const [userName, setUserName] = useState("")
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0)
  const [profile, setProfile] = useState<any>(null)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserName(user.email?.split("@")[0] || "Student")

          // load profile via server API (includes photo_url, is_premium etc)
          try {
            const p = await (await fetch('/api/profile')).json()
            if (p.profile) setProfile(p.profile)
          } catch (err) {
            console.error('Failed to load profile', err)
          }

          // Get enrolled courses and preview
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id,course_id,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          setEnrolledCoursesCount(enrollments?.length || 0)

          // Fetch course details for up to 3 recent enrollments
          if (enrollments && enrollments.length > 0) {
            const courseIds = enrollments.slice(0, 3).map((e: any) => e.course_id)
            if (courseIds.length) {
              const { data: courses } = await supabase
                .from('courses')
                .select('id,title')
                .in('id', courseIds)
              setRecentCourses((courses || []).map((c: any) => ({ id: c.id, title: c.title })))
            }
          }

          // notifications count
          try {
            const n = await (await fetch('/api/notifications')).json()
            setNotificationsCount((n.notifications || []).filter((x: any) => !x.read).length)
          } catch (err) {
            console.error('Failed to load notifications', err)
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
              Welcome back, {profile?.full_name || userName}!
            </h1>
            <p className="text-slate-400 text-lg">Continue your learning journey with IITM BS courses</p>
          </div>
          <div className="flex items-center gap-4">
            {profile?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo_url} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-slate-400">U</div>
            )}
            <div className="text-right">
              <div className="text-sm text-slate-400">{profile?.username || userName}</div>
              <div className="text-xs text-slate-300">{profile?.is_premium ? 'Premium' : 'Free'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-800/30 rounded-lg hover:border-purple-700/50 transition-all backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Enrolled Courses</p>
              <p className="text-3xl font-bold text-white">{enrolledCoursesCount}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-800/30 rounded-lg hover:border-green-700/50 transition-all backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-600 to-green-700 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="text-3xl font-bold text-white">0</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/30 rounded-lg hover:border-blue-700/50 transition-all backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Progress</p>
              <p className="text-3xl font-bold text-white">
                {enrolledCoursesCount > 0 ? '25%' : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/courses">
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-800/40 rounded-lg hover:border-purple-600 hover:shadow-lg hover:shadow-purple-900/30 transition-all cursor-pointer group">
              <BookOpen className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white text-lg mb-2">My Courses</h3>
              <p className="text-sm text-slate-400">View and continue your enrolled courses</p>
            </div>
          </Link>

          <Link href="/dashboard/courses">
            <div className="p-6 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-800/40 rounded-lg hover:border-green-600 hover:shadow-lg hover:shadow-green-900/30 transition-all cursor-pointer group">
              <Users className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white text-lg mb-2">Explore Courses</h3>
              <p className="text-sm text-slate-400">Discover new courses to enroll in</p>
            </div>
          </Link>

          <Link href="/dashboard/profile">
            <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-800/40 rounded-lg hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/30 transition-all cursor-pointer group">
              <Users className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white text-lg mb-2">My Profile</h3>
              <p className="text-sm text-slate-400">Update your profile and settings</p>
            </div>
          </Link>
        </div>

        {/* Recent Courses Preview */}
        {recentCourses.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-2">My Recent Courses</h3>
            <ul className="space-y-2">
              {recentCourses.map((c) => (
                <li key={c.id}>
                  <Link href={`/dashboard/courses/${c.id}`} className="text-purple-400 hover:underline">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Welcome Message for New Users */}
      {enrolledCoursesCount === 0 && (
        <div className="p-8 bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-green-900/40 border border-purple-700/50 rounded-lg backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-3">
            🎉 Welcome to BSPrep!
          </h2>
          <p className="text-slate-300 mb-6 text-lg">
            Start your IITM BS journey by exploring our courses. Enroll in free qualifier courses or upgrade to foundation level courses.
          </p>
          <Link href="/dashboard/courses">
            <Button className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500 text-white px-6 py-3 text-base shadow-lg shadow-purple-900/50">
              Browse Courses
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
