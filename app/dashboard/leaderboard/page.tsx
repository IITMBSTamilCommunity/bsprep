"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function LeaderboardPage() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => { fetchBoard() }, [])

  async function fetchBoard() {
    const res = await fetch('/api/leaderboard')
    const json = await res.json()
    setRows(json.leaderboard || [])
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.user_id} className="p-4 bg-white/5 rounded-lg flex justify-between">
              <div>
                <div className="font-semibold">#{i+1} — {r.full_name || r.email}</div>
                <div className="text-sm text-slate-400">Attempts: {r.attempts_count}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">{Math.round(r.avg_score)}</div>
                <div className="text-sm text-slate-400">Avg Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
