"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function VideoPlayer({ params }: { params: { videoId: string } }) {
  const { videoId } = params
  const [video, setVideo] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => { fetchVideo(); fetchProfile() }, [])

  async function fetchVideo() {
    const res = await fetch(`/api/videos/${videoId}`)
    const json = await res.json()
    if (json.video) setVideo(json.video)
  }

  async function fetchProfile() {
    const res = await fetch('/api/profile')
    const json = await res.json()
    setProfile(json.profile)
  }

  if (!video) return <div className="min-h-screen"><Navbar isAuthenticated={true} /><div className="p-6">Loading...</div><Footer/></div>

  const canView = !video.is_premium || profile?.is_premium || profile?.role === 'admin'

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
        <p className="text-sm text-slate-400 mb-4">{video.description}</p>

        {canView ? (
          <div>
            {video.public_url ? (
              <video src={video.public_url} controls className="w-full h-auto rounded" />
            ) : (
              <div className="p-8 bg-slate-800 text-center">Video file not available</div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-white/5 rounded">
            <p className="mb-4">This is a premium video. Unlock premium access to view full content.</p>
            <Button onClick={() => router.push('/dashboard/payments')}>Unlock Premium</Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
