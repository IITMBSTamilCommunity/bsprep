"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => { fetchVideos() }, [])

  async function fetchVideos() {
    const res = await fetch('/api/videos')
    const json = await res.json()
    setVideos(json.videos || [])
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Learning Videos</h1>
        <div className="grid md:grid-cols-3 gap-4">
          {videos.map((v) => (
            <div key={v.id} className="bg-white/5 p-4 rounded-lg">
              <img src={v.thumbnail || '/video-placeholder.jpg'} alt={v.title} className="w-full h-40 object-cover rounded" />
              <div className="mt-3">
                <div className="font-semibold">{v.title}</div>
                <div className="text-sm text-slate-400">{v.description}</div>
                <div className="mt-3 flex items-center justify-between">
                  <Link href={`/dashboard/videos/${v.id}`}>
                    <Button>{v.is_premium ? 'View (Premium)' : 'Play'}</Button>
                  </Link>
                  {v.is_premium && <div className="text-xs text-yellow-400">Premium</div>}
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
