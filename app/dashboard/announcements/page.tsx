"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/announcements')
        const json = await res.json()
        setAnnouncements(json.announcements || [])
      } catch (err) {
        console.error('Failed to load announcements', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">Announcements</h1>
        {loading ? (
          <div>Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-slate-400">No announcements yet.</div>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li key={a.id} className="p-4 bg-white/5 rounded border border-slate-700">
                <div className="font-semibold text-lg mb-1">{a.title}</div>
                <div className="text-slate-300 mb-2 whitespace-pre-line">{a.body}</div>
                <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()} {a.source === 'whatsapp' && <span className="ml-2 px-2 py-0.5 bg-green-900/40 rounded text-green-300">WhatsApp</span>}</div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  )
}
