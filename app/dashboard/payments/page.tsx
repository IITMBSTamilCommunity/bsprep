"use client"

import React, { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function startPayment() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/payments/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 49900 }) })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      // For Razorpay / Stripe, frontend should use returned order info to open checkout.
      // Here we just redirect to a placeholder success page or instruct user to integrate with provider SDK.
      alert('Order created (placeholder). Integrate frontend SDK for checkout.')
    } catch (err: any) {
      alert(err.message || 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={true} />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Payments & Premium</h1>
        <div className="p-6 bg-white/5 rounded mb-4">
          <p>Unlock premium content, AI tutor, and other benefits.</p>
          <div className="mt-4">
            <Button onClick={startPayment} disabled={isLoading}>{isLoading ? 'Processing...' : 'Pay ₹499 (one-time)'}</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
