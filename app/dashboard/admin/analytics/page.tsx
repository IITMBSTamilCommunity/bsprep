"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  })
  const [roleData, setRoleData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch user statistics
      const { data: profiles } = await supabase.from("profiles").select("role")
      const { data: courses } = await supabase.from("courses").select("id")
      const { data: enrollments } = await supabase.from("enrollments").select("id")

      if (profiles) {
        const students = profiles.filter((p) => p.role === "student").length
        const mentors = profiles.filter((p) => p.role === "mentor").length

        setStats({
          totalUsers: profiles.length,
          totalStudents: students,
          totalMentors: mentors,
          totalCourses: courses?.length || 0,
          totalEnrollments: enrollments?.length || 0,
        })

        setRoleData([
          { name: "Students", value: students },
          { name: "Mentors", value: mentors },
          { name: "Admins", value: profiles.filter((p) => p.role === "admin").length },
        ])
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ["#3e30d9", "#51b206", "#f1f3f7"]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mentors</p>
                <p className="text-2xl font-bold text-secondary">{stats.totalMentors}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Student-Mentor Ratio</span>
            <span className="font-semibold">
              {stats.totalMentors > 0 ? (stats.totalStudents / stats.totalMentors).toFixed(1) : 0}:1
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Avg Students per Course</span>
            <span className="font-semibold">
              {stats.totalCourses > 0 ? (stats.totalEnrollments / stats.totalCourses).toFixed(1) : 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
