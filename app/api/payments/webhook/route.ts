import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const rawBody = await request.text()

    // If Razorpay secret is configured and signature header present, verify signature
    const razorSecret = process.env.RAZORPAY_KEY_SECRET
    const signature = request.headers.get('x-razorpay-signature')

    if (razorSecret && signature) {
      const expected = crypto.createHmac('sha256', razorSecret).update(rawBody).digest('hex')
      if (expected !== signature) {
        console.error('Invalid Razorpay signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }

      const payload = JSON.parse(rawBody)
      const event = (payload.event || '').toLowerCase()
      if (event === 'payment.captured' || event === 'payment.authorized') {
        const payment = payload.payload?.payment?.entity || {}
        const notes = payment.notes || {}
        const userId = notes.user_id
        if (userId) {
          await supabase.from('user_profiles_extended').update({ is_premium: true, updated_at: new Date().toISOString() }).eq('id', userId)
        }
      }

      return NextResponse.json({ success: true })
    }

    // Fallback: handle demo or simple JSON payloads
    try {
      const json = JSON.parse(rawBody)
      const provider_order_id = json.provider_order_id || json.order?.id
      const status = json.status || json.order?.status || 'completed'
      const provider = json.provider || 'demo'

      if (!provider_order_id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 })

      // Map provider_order_id back to payments row. Our demo provider_order_id is 'demo_<id>'
      let paymentId: any = provider_order_id
      if (typeof provider_order_id === 'string' && provider_order_id.startsWith('demo_')) {
        paymentId = provider_order_id.replace('demo_', '')
      }

      const { data: payment } = await supabase.from('payments').select('*').eq('id', paymentId).single()
      if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

      // Update payment status
      await supabase.from('payments').update({ status, provider, updated_at: new Date().toISOString() }).eq('id', paymentId)

      if (status === 'completed' && payment.user_id) {
        // Grant premium to user
        await supabase.from('user_profiles_extended').upsert({ id: payment.user_id, is_premium: true, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      }

      return NextResponse.json({ success: true })
    } catch (err) {
      console.error('Webhook parse error:', err)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
  } catch (err) {
    console.error('Payment webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
