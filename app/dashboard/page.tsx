"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { BookOpen, MessageCircle, Award, Calendar, TrendingUp, Zap, Flame } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"

interface Course {
  id: string
  title: string
  description: string
  level: string
  progress: number
  status: string
}

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Course[]>([])
  const [stats, setStats] = useState({ totalCourses: 0, inProgress: 0, completed: 0, hoursLearned: 42 })
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("Student")
  const supabase = createClient()

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        setUserName(user.email?.split("@")[0] || "Student")

        const { data } = await supabase
          .from("enrollments")
          .select(`
            id,
            progress,
            status,
            courses (
              id,
              title,
              description,
              level
            )
          `)
          .eq("student_id", user.id)

        if (data && data.length > 0) {
          const formattedData = data.map((enrollment) => ({
            id: enrollment.courses.id,
            title: enrollment.courses.title,
            description: enrollment.courses.description,
            level: enrollment.courses.level,
            progress: enrollment.progress,
            status: enrollment.status,
          }))
          setEnrollments(formattedData)

          const completed = formattedData.filter((c) => c.progress === 100).length
          const inProgress = formattedData.filter((c) => c.progress > 0 && c.progress < 100).length

          setStats({
            totalCourses: formattedData.length,
            completed,
            inProgress,
            hoursLearned: 42 + completed * 10,
          })
        } else {
          const sampleData: Course[] = [
            {
              id: "1",
              title: "Linear Algebra Fundamentals",
              description: "Master matrix operations and eigenvalues",
              level: "Intermediate",
              progress: 65,
              status: "in_progress",
            },
            {
              id: "2",
              title: "Data Structures & Algorithms",
              description: "Learn DSA with practical Python examples",
              level: "Advanced",
              progress: 40,
              status: "in_progress",
            },
            {
              id: "3",
              title: "Web Development Bootcamp",
              description: "Full-stack development with Next.js",
              level: "Intermediate",
              progress: 100,
              status: "completed",
            },
          ]
          setEnrollments(sampleData)
          setStats({ totalCourses: 3, inProgress: 2, completed: 1, hoursLearned: 52 })
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollments()
  }, [])

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackground />
      <div className="relative z-10 space-y-8">
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden card-3d">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">7-day Learning Streak! 🔥</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                {userName}
              </span>
              !
            </h1>
            <p className="text-slate-300 text-lg">You're crushing your learning goals. Keep the momentum going!</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, color: "from-purple-600 to-blue-600" },
            { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "from-yellow-600 to-orange-600" },
            { label: "Completed", value: stats.completed, icon: Award, color: "from-green-600 to-emerald-600" },
            { label: "Hours Learned", value: stats.hoursLearned, icon: Zap, color: "from-pink-600 to-rose-600" },
          ].map((stat, i) => (
            <Card
              key={i}
              className="glass border-white/10 hover:border-white/30 card-3d overflow-hidden group transition-all duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />
              <CardHeader className="pb-3 relative">
                <CardTitle className="text-sm font-medium text-slate-400">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-end justify-between">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <stat.icon
                    className={`w-6 h-6 text-slate-500 group-hover:scale-110 transition-transform group-hover:text-slate-300`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass border-white/10 overflow-hidden group hover:border-yellow-500/30 transition-all duration-300 card-3d">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 to-orange-600/0 group-hover:from-yellow-600/10 group-hover:to-orange-600/10 transition-all" />
          <CardContent className="pt-6 relative">
            <div className="flex gap-4">
              <Calendar className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="font-semibold text-white mb-1">Mentor Office Hours</h3>
                <p className="text-sm text-slate-400">
                  🎥 Live doubt-solving sessions every Saturday at 5 PM IST with senior mentors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">My Courses</h2>
            <Button className="glass border-white/20 text-white hover:border-purple-500/50 hover:bg-purple-600/10 transition-all duration-300">
              Browse More
            </Button>
          </div>

          {isLoading ? (
            <Card className="glass border-white/10">
              <CardContent className="pt-8 text-center text-slate-400">Loading your courses...</CardContent>
            </Card>
          ) : enrollments.length === 0 ? (
            <Card className="glass border-white/10">
              <CardContent className="pt-8 text-center">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-4 font-medium">No courses yet. Start learning!</p>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">Explore Courses</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {enrollments.map((course) => (
                <Card
                  key={course.id}
                  className="glass border-white/10 hover:border-purple-500/50 card-3d overflow-hidden group transition-all duration-300"
                >
                  <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 group-hover:shadow-lg group-hover:shadow-purple-500/50" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/10 transition-all" />
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-yellow-400 group-hover:bg-clip-text transition-all">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1 group-hover:text-slate-300">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-purple-600/20 text-purple-300 border-purple-500/30 group-hover:bg-purple-600/40 group-hover:border-purple-400/50 transition-all whitespace-nowrap"
                      >
                        {course.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 relative">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-300">Progress</span>
                        <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                          {course.progress}%
                        </span>
                      </div>
                      <Progress
                        value={course.progress}
                        className="h-2 bg-white/10 group-hover:bg-white/20 transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all">
                        Continue
                      </Button>
                      <Button
                        variant="outline"
                        className="glass border-white/20 hover:border-white/40 hover:bg-white/10 transition-all bg-transparent"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="glass border-white/10 card-3d overflow-hidden group hover:border-white/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/10 transition-all" />
          <CardHeader className="relative border-b border-white/10">
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">Your learning milestones</CardDescription>
          </CardHeader>
          <CardContent className="relative pt-6">
            <div className="space-y-4">
              {[
                { icon: "✓", title: "Completed Quiz: Linear Algebra #5", time: "2 hours ago" },
                { icon: "📝", title: "Started: Data Structures Module 3", time: "1 day ago" },
                { icon: "🔥", title: "Achieved: 7-day learning streak", time: "2 days ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center pb-4 last:pb-0 group/activity hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm group-hover/activity:text-transparent group-hover/activity:bg-gradient-to-r group-hover/activity:from-purple-400 group-hover/activity:to-yellow-400 group-hover/activity:bg-clip-text transition-all">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
