"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PlayCircle, History, Clock, Trophy, AlertCircle } from "lucide-react"

interface Quiz {
  id: string
  title: string
  description: string
  time_limit_seconds: number
  questions_count?: number
}

interface QuizAttempt {
  id: string
  quiz_id: string
  score: number
  total_points: number
  started_at: string
  finished_at: string
  quizzes: {
    title: string
  }
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch available quizzes
        const { data: quizzesData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })

        if (quizzesData) {
          setQuizzes(quizzesData)
        }

        // Fetch user attempts
        const { data: attemptsData } = await supabase
          .from("quiz_attempts")
          .select(`
            id,
            quiz_id,
            score,
            total_points,
            started_at,
            finished_at,
            quizzes (
              title
            )
          `)
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })

        if (attemptsData) {
          // @ts-ignore
          setAttempts(attemptsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScorePercentage = (score: number, total: number) => {
    if (total === 0) return 0
    return Math.round((score / total) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground mt-2">
            Test your knowledge and earn points for the leaderboard.
          </p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'available' 
                ? 'bg-white dark:bg-slate-950 shadow-sm text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Available Quizzes
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history' 
                ? 'bg-white dark:bg-slate-950 shadow-sm text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My History
          </button>
        </div>
      </div>

      {activeTab === 'available' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No quizzes available</h3>
              <p className="text-muted-foreground">Check back later for new quizzes.</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {quiz.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quiz.time_limit_seconds > 0 ? formatTime(quiz.time_limit_seconds) : "No limit"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      Points available
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => router.push(`/dashboard/quizzes/${quiz.id}`)}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Quiz
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
              <History className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No attempts yet</h3>
              <p className="text-muted-foreground">Take a quiz to see your results here.</p>
            </div>
          ) : (
            attempts.map((attempt) => {
              const percentage = getScorePercentage(attempt.score, attempt.total_points)
              const isPassed = percentage >= 60 // Assuming 60% passing score
              
              return (
                <Card key={attempt.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{attempt.quizzes?.title || "Unknown Quiz"}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(attempt.started_at).toLocaleDateString()} at {new Date(attempt.started_at).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex-1 md:w-48 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Score</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                        
                        <Badge variant={isPassed ? "default" : "destructive"} className="h-8 px-3">
                          {isPassed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
