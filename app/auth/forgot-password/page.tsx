"use client"

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`
    })
    if (error) setMessage(error.message)
    else setMessage('If an account exists, a password reset email has been sent.')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white/5 backdrop-blur-sm border-slate-200/20 shadow-2xl rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Reset your password</h2>
            <p className="text-sm text-slate-400 mb-6">Enter your email to receive a password reset link.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {message && <div className="p-3 bg-slate-800/30 rounded">{message}</div>}
              <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Sending...' : 'Send reset link'}</Button>
              <div className="text-center text-sm text-slate-400">
                <Link href="/auth/login" className="text-[#51b206]">Back to login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
