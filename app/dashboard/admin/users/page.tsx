"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setUsers(json.users || [])
    } catch (err: any) {
      setMessage(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function updateRole(id: string, role: string) {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setMessage('Role updated')
      fetchUsers()
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
        <h1 className="text-2xl font-bold mb-4">Admin — Manage Users</h1>
        {message && <div className="p-3 bg-slate-800/30 rounded mb-4">{message}</div>}

        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white/5 p-4 rounded-lg border border-slate-200/10 flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.full_name || u.username || u.email}</div>
                <div className="text-sm text-slate-400">{u.email}</div>
              </div>
              <div className="flex items-center gap-4">
                <Select onValueChange={(val) => updateRole(u.id, val)} value={u.role || 'user'}>
                  <SelectTrigger className="w-36 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => updateRole(u.id, 'admin')}>Make Admin</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
