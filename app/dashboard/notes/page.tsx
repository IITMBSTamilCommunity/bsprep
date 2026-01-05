"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function NotesDashboard() {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    try {
      const res = await fetch('/api/notes')
      const json = await res.json()
      setNotes(json.notes || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setIsLoading(true)
    try {
      let fileUrl: string | null = null
      if (file) {
        const { data, error: uploadError } = await supabase.storage
          .from('notes')
          .upload(`notes/${Date.now()}_${file.name}`, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const publicUrl = supabase.storage.from('notes').getPublicUrl(data.path)
        fileUrl = publicUrl.data.publicUrl
      }

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, file_url: fileUrl }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setTitle('')
      setDescription('')
      setFile(null)
      setMessage('Uploaded — pending admin review')
      fetchNotes()
    } catch (err: any) {
      setMessage(err.message || 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Your Notes</h1>

        <form onSubmit={handleUpload} className="space-y-4 mb-8 bg-white/5 p-6 rounded-lg border border-slate-200/20">
          <div>
            <label className="text-sm">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">File (PDF/MD)</label>
            <Input type="file" onChange={(e: any) => setFile(e.target.files?.[0] || null)} />
          </div>

          {message && <div className="p-3 bg-slate-800/30 rounded">{message}</div>}

          <Button type="submit" disabled={isLoading}>{isLoading ? 'Uploading...' : 'Upload Note'}</Button>
        </form>

        <div className="space-y-4">
          {notes.map((n) => (
            <div key={n.id} className="bg-white/5 p-4 rounded-lg border border-slate-200/10">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{n.title}</h3>
                  <p className="text-sm text-slate-400">{n.description}</p>
                </div>
                <div className="text-sm">
                  <span className="mr-4">{new Date(n.created_at).toLocaleString()}</span>
                  <span className="px-3 py-1 rounded-full bg-yellow-600 text-white text-xs">{n.status}</span>
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
