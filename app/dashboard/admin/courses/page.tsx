"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Course {
  id: string
  title: string
  instructor_name: string
  level: string
  student_count: number
  created_at: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          level,
          created_at,
          instructor_id,
          enrollments (
            id
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false })

      if (data) {
        const formattedCourses = data.map((course) => ({
          id: course.id,
          title: course.title,
          instructor_name: `${course.profiles?.first_name} ${course.profiles?.last_name}`.trim() || "Unknown",
          level: course.level,
          student_count: course.enrollments?.length || 0,
          created_at: course.created_at,
        }))
        setCourses(formattedCourses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground">Manage all platform courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Courses: {courses.length}</CardTitle>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center text-muted-foreground">No courses available</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">Instructor: {course.instructor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(course.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{course.student_count}</div>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
