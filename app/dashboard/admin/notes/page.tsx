"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    try {
      const res = await fetch('/api/admin/notes')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setNotes(json.notes || [])
    } catch (err: any) {
      setMessage(err.message || 'Failed to load')
    }
  }

  async function updateNote(noteId: string, status: string, isPremium = false) {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, status, is_premium: isPremium }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setMessage('Updated')
      fetchNotes()
    } catch (err: any) {
      setMessage(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin — Notes Review</h1>
        {message && <div className="p-3 bg-slate-800/30 rounded mb-4">{message}</div>}

        <div className="space-y-4">
          {notes.map((n) => (
            <div key={n.id} className="bg-white/5 p-4 rounded-lg border border-slate-200/10">
              <div className="flex justify-between items-start">
                <div style={{flex:1}}>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-slate-400">{n.description}</p>
                  <p className="text-xs text-slate-500">Uploaded: {new Date(n.created_at).toLocaleString()}</p>
                  {n.file_url && (
                    <a href={n.file_url} target="_blank" rel="noreferrer" className="text-[#51b206] text-sm">View file</a>
                  )}
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <Select onValueChange={(val) => updateNote(n.id, val)}>
                    <SelectTrigger className="w-40 h-10">
                      <SelectValue placeholder={n.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                      <SelectItem value="pending">Mark Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" onClick={() => updateNote(n.id, 'approved', !n.is_premium)}>{n.is_premium ? 'Unmark Premium' : 'Mark Premium'}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
