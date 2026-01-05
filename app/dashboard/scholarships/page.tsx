"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TopScorer {
  user_id: string
  avg_score: number
  attempts_count: number
  email: string
  full_name: string
}

export default function ScholarshipsPage() {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopScorers = async () => {
      try {
        const response = await fetch("/api/scholarships")
        if (response.ok) {
          const data = await response.json()
          setTopScorers(data.topScorers)
        }
      } catch (error) {
        console.error("Error fetching scholarships data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopScorers()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-8 w-8 text-yellow-500" />
      case 1:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 2:
        return <Award className="h-8 w-8 text-amber-600" />
      default:
        return null
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-500/50 bg-yellow-500/10"
      case 1:
        return "border-gray-400/50 bg-gray-400/10"
      case 2:
        return "border-amber-600/50 bg-amber-600/10"
      default:
        return "border-slate-200 dark:border-slate-800"
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
        <p className="text-muted-foreground mt-2">
          Top 3 scorers in the leaderboard are eligible for scholarships. Keep practicing to reach the top!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {topScorers.map((scorer, index) => (
          <Card key={scorer.user_id} className={`relative overflow-hidden border-2 ${getRankColor(index)}`}>
            <div className="absolute top-4 right-4">
              {getRankIcon(index)}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span className="text-4xl font-bold opacity-50">#{index + 1}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pt-4">
              <Avatar className="h-20 w-20 border-4 border-background mb-4">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${scorer.email}`} />
                <AvatarFallback>{scorer.full_name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg">{scorer.full_name || "Anonymous User"}</h3>
              <p className="text-sm text-muted-foreground mb-4">{scorer.email}</p>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-2">
                <div className="bg-background/50 p-2 rounded-lg">
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className="font-bold text-lg">{Number(scorer.avg_score).toFixed(1)}%</p>
                </div>
                <div className="bg-background/50 p-2 rounded-lg">
                  <p className="text-xs text-muted-foreground">Attempts</p>
                  <p className="font-bold text-lg">{scorer.attempts_count}</p>
                </div>
              </div>

              <div className="mt-6 w-full">
                <div className="bg-primary/10 text-primary py-2 px-4 rounded-full text-sm font-medium">
                  {index === 0 ? "100% Scholarship" : index === 1 ? "50% Scholarship" : "25% Scholarship"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {topScorers.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No data available yet. Start taking quizzes to appear on the leaderboard!
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scholarship Criteria</CardTitle>
          <CardDescription>How to qualify for the scholarship program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Scholarships are awarded based on the average score across all quiz attempts.</li>
            <li>You must have attempted at least 5 quizzes to be eligible.</li>
            <li>The leaderboard is updated in real-time.</li>
            <li>Scholarships are distributed at the end of each Term.</li>
            <li>Top 1 scorer gets 100% scholarship.</li>
            <li>Top 2 scorer gets 50% scholarship.</li>
            <li>Top 3 scorer gets 25% scholarship.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
