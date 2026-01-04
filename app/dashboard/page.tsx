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
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserName(user.email?.split("@")[0] || "Student")
          
          // Get enrolled courses count
          const { data: enrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
          
          setEnrolledCoursesCount(enrollments?.length || 0)
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
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Continue your learning journey with IITM BS courses
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#3e3098]/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#3e3098]" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Enrolled Courses</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{enrolledCoursesCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#51b206]/10 rounded-lg">
              <Trophy className="w-6 h-6 text-[#51b206]" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Progress</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {enrolledCoursesCount > 0 ? '25%' : '0%'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/courses">
            <Card className="p-6 hover:shadow-lg hover:border-[#3e3098] transition-all cursor-pointer group">
              <BookOpen className="w-8 h-8 text-[#3e3098] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">My Courses</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">View and continue your enrolled courses</p>
            </Card>
          </Link>

          <Link href="/dashboard/courses">
            <Card className="p-6 hover:shadow-lg hover:border-[#51b206] transition-all cursor-pointer group">
              <Users className="w-8 h-8 text-[#51b206] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Explore Courses</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Discover new courses to enroll in</p>
            </Card>
          </Link>

          <Link href="/dashboard/profile">
            <Card className="p-6 hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer group">
              <Users className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">My Profile</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Update your profile and settings</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {enrolledCoursesCount === 0 && (
        <Card className="p-8 bg-gradient-to-br from-[#3e3098]/10 to-[#51b206]/10 border-[#3e3098]">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            🎉 Welcome to BSPrep!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Start your IITM BS journey by exploring our courses. Enroll in free qualifier courses or upgrade to foundation level courses.
          </p>
          <Link href="/dashboard/courses">
            <Button className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white">
              Browse Courses
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
