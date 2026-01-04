'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  title: string
  description: string
  level: string
  type: string
  weeks: number
  price: number
  thumbnail: string
  instructor: string
  students_count: number
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'my-courses' | 'explore'>('my-courses')
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('level', { ascending: true })

      if (coursesError) throw coursesError

      // Fetch user's enrollments
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)

        if (!enrollError && enrollments) {
          setEnrolledCourseIds(enrollments.map(e => e.course_id))
        }
      }

      setAllCourses(courses || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const myCourses = allCourses.filter(course => enrolledCourseIds.includes(course.id))
  const exploreCourses = allCourses.filter(course => !enrolledCourseIds.includes(course.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Courses</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Access your enrolled courses and explore new learning opportunities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'my-courses'
                ? 'text-[#3e3098] border-b-2 border-[#3e3098]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Courses ({myCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'explore'
                ? 'text-[#3e3098] border-b-2 border-[#3e3098]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explore Courses ({exploreCourses.length})
          </button>
        </div>

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098] mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400 mt-4">Loading courses...</p>
              </div>
            ) : myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all group">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#3e3098] to-purple-600">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge className="bg-[#51b206] text-white border-none">Enrolled</Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="capitalize">
                          {course.level}
                        </Badge>
                        <Badge variant={course.type === 'free' ? 'default' : 'secondary'} className="capitalize">
                          {course.type}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.weeks} weeks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students_count.toLocaleString()}</span>
                        </div>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full bg-[#3e3098] hover:bg-[#3e3098]/90 text-white">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mb-4 text-slate-400">
                  <PlayCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No enrolled courses yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start your learning journey by exploring our courses
                </p>
                <Button
                  onClick={() => setActiveTab('explore')}
                  className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white"
                >
                  Explore Courses
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Explore Courses Tab */}
        {activeTab === 'explore' && (
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098] mx-auto"></div>
                <p className="text-slate-600 dark:text-slate-400 mt-4">Loading courses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exploreCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all group">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#3e3098] to-purple-600">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.type === 'paid' && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-yellow-500 text-slate-900 border-none">Premium</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="capitalize">
                          {course.level}
                        </Badge>
                        <Badge variant={course.type === 'free' ? 'default' : 'secondary'} className="capitalize">
                          {course.type}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.weeks} weeks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students_count.toLocaleString()}</span>
                        </div>
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full bg-[#51b206] hover:bg-[#51b206]/90 text-white">
                          View Course Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
