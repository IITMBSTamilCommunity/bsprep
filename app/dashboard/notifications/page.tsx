"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function NotificationsPage() {
  const [notes, setNotes] = useState<any[]>([])

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    const res = await fetch('/api/notifications')
    const json = await res.json()
    setNotes(json.notifications || [])
  }

  async function markRead(id: string) {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchNotes()
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n.id} className={`p-4 rounded ${n.read ? 'bg-white/5' : 'bg-slate-800/30'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-slate-400">{n.body}</div>
                  {n.link && <a href={n.link} className="text-sm text-[#51b206]">Open</a>}
                </div>
                {!n.read && <Button variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
