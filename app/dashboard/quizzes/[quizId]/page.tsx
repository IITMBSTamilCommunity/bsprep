"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useProctoring } from '@/hooks/use-proctoring'

export default function QuizTake({ params }: { params: { quizId: string } }) {
  const { quizId } = params
  const [quiz, setQuiz] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => { fetchQuiz() }, [])

  const [consent, setConsent] = useState(false)

  const startQuiz = async () => {
    if (!consent) {
      alert('Please consent to proctoring before starting the quiz.')
      return
    }
    try {
      const res = await fetch('/api/proctor/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: quizId }),
      })
      const json = await res.json()
      if (json.session?.id) setSessionId(json.session.id)
    } catch (err) {
      console.error('Failed to create proctor session', err)
      alert('Unable to start proctoring session. Please try again.')
    }
  }

  useProctoring(sessionId)

  async function fetchQuiz() {
    const res = await fetch(`/api/quizzes/${quizId}`)
    const json = await res.json()
    setQuiz({ ...json.quiz, questions: json.questions })
    const questions = json.questions || []
    // initialize answers
    const initial: Record<string, any> = {}
    questions.forEach((q: any) => { initial[q.id] = { selected_choice_ids: [] } })
    setAnswers(initial)
    if (json.quiz.time_limit_seconds && json.quiz.time_limit_seconds > 0) setTimeLeft(json.quiz.time_limit_seconds)
  }

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    timerRef.current = window.setTimeout(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [timeLeft])

  function toggleChoice(questionId: string, choiceId: string) {
    setAnswers((a) => {
      const cur = a[questionId] || { selected_choice_ids: [] }
      const selected = new Set((cur.selected_choice_ids || []).map(String))
      if (selected.has(choiceId)) selected.delete(choiceId)
      else selected.add(choiceId)
      return { ...a, [questionId]: { selected_choice_ids: Array.from(selected) } }
    })
  }

  async function handleSubmit() {
    try {
      const payload = { answers: Object.entries(answers).map(([question_id, ans]) => ({ question_id, selected_choice_ids: ans.selected_choice_ids })) }
      const res = await fetch(`/api/quizzes/${quizId}/attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      // navigate to results or refresh
      router.push('/dashboard/quizzes')
    } catch (err) {
      console.error(err)
      alert('Submission failed')
    }
  }


  if (!quiz) return <div className="min-h-screen"><Navbar isAuthenticated={true} /><div className="p-6">Loading...</div><Footer/></div>

  if (!sessionId) {
    return (
      <div className="min-h-screen">
        <Navbar isAuthenticated={true} />
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="mt-6 p-4 border rounded">
            <h2 className="font-semibold">Proctoring Consent</h2>
            <p className="text-sm text-muted-foreground mt-2">This quiz will monitor tab visibility and browser focus to ensure test integrity.</p>
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I consent to proctoring for this quiz.</span>
            </label>
            <div className="mt-4">
              <Button onClick={startQuiz}>Start Quiz</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          {timeLeft !== null && <div className="text-sm">Time left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
        </div>

        {(quiz.questions || []).map((q: any, idx: number) => (
          <div key={q.id} className="p-4 bg-white/5 rounded-lg">
            <div className="font-semibold">{idx+1}. {q.question_text}</div>
            <div className="mt-2 space-y-2">
              {(q.choices || []).map((c: any) => (
                <label key={c.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={(answers[q.id]?.selected_choice_ids || []).includes(c.id)} onChange={() => toggleChoice(q.id, c.id)} />
                  <span>{c.content}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSubmit}>Submit Quiz</Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
