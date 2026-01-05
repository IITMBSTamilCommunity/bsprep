"use client"

import { useEffect, useRef } from 'react'

export function useProctoring(sessionId: string | null) {
  const lastVisibility = useRef(document.visibilityState)

  useEffect(() => {
    if (!sessionId) return

    const send = async (eventType: string, data: any = {}) => {
      try {
        await fetch('/api/proctor/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, event_type: eventType, event_data: data }),
        })
      } catch (err) {
        // ignore
      }
    }

    const handleVisibility = () => {
      const state = document.visibilityState
      if (state !== lastVisibility.current) {
        send('visibility_change', { from: lastVisibility.current, to: state, timestamp: Date.now() })
        lastVisibility.current = state
      }
    }

    const handleBlur = () => send('blur', { timestamp: Date.now() })
    const handleFocus = () => send('focus', { timestamp: Date.now() })
    const handleBeforeUnload = () => send('page_unload', { timestamp: Date.now() })

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Periodic heartbeat
    const heartbeat = setInterval(() => send('heartbeat', { timestamp: Date.now() }), 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      clearInterval(heartbeat)
    }
  }, [sessionId])
}
